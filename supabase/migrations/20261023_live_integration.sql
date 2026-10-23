-- Apply in the Supabase SQL Editor after supabase/schema.sql.
-- Keeps public availability accurate and runs multi-table workflows in one transaction.

ALTER TABLE public.chit_groups
  ADD COLUMN IF NOT EXISTS current_member_count integer NOT NULL DEFAULT 0;

UPDATE public.chit_groups g
SET current_member_count = (SELECT count(*) FROM public.chit_subscribers s WHERE s.group_id = g.id);

CREATE OR REPLACE FUNCTION private.sync_group_member_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.chit_groups SET current_member_count = (
      SELECT count(*) FROM public.chit_subscribers WHERE group_id = OLD.group_id
    ) WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  UPDATE public.chit_groups SET current_member_count = (
    SELECT count(*) FROM public.chit_subscribers WHERE group_id = NEW.group_id
  ) WHERE id = NEW.group_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_group_member_count ON public.chit_subscribers;
CREATE TRIGGER sync_group_member_count
AFTER INSERT OR DELETE ON public.chit_subscribers
FOR EACH ROW EXECUTE FUNCTION private.sync_group_member_count();

CREATE OR REPLACE FUNCTION private.create_first_installment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE grp public.chit_groups%ROWTYPE;
BEGIN
  SELECT * INTO grp FROM public.chit_groups WHERE id = NEW.group_id;
  INSERT INTO public.installments
    (group_id, subscriber_id, month_number, due_date, gross_amount, status)
  VALUES
    (NEW.group_id, NEW.id, 1, GREATEST(COALESCE(grp.start_date, CURRENT_DATE), CURRENT_DATE + 7),
     grp.monthly_contribution, 'DUE');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS create_first_installment ON public.chit_subscribers;
CREATE TRIGGER create_first_installment
AFTER INSERT ON public.chit_subscribers
FOR EACH ROW EXECUTE FUNCTION private.create_first_installment();

CREATE OR REPLACE FUNCTION public.staff_join_chit_group(p_group_id uuid, p_user_id uuid)
RETURNS public.chit_subscribers LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE grp public.chit_groups%ROWTYPE;
DECLARE free_seat integer;
DECLARE new_sub public.chit_subscribers%ROWTYPE;
BEGIN
  IF NOT private.has_role('SUPER_ADMIN') THEN
    RAISE EXCEPTION 'Staff enrollment requires super admin access' USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id AND role = 'CUSTOMER' AND is_active) THEN
    RAISE EXCEPTION 'Select an active registered customer';
  END IF;
  SELECT * INTO grp FROM public.chit_groups WHERE id = p_group_id FOR UPDATE;
  IF NOT FOUND OR grp.status <> 'RECRUITING' THEN RAISE EXCEPTION 'Group is not recruiting'; END IF;
  SELECT seat INTO free_seat FROM generate_series(1, grp.total_members) seat
    WHERE NOT EXISTS (SELECT 1 FROM public.chit_subscribers WHERE group_id = p_group_id AND seat_number = seat)
    ORDER BY seat LIMIT 1;
  IF free_seat IS NULL THEN RAISE EXCEPTION 'Group is full'; END IF;
  INSERT INTO public.chit_subscribers (group_id, user_id, seat_number)
  VALUES (p_group_id, p_user_id, free_seat) RETURNING * INTO new_sub;
  RETURN new_sub;
END;
$$;
REVOKE ALL ON FUNCTION public.staff_join_chit_group(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.staff_join_chit_group(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.finalize_chit_auction(p_auction_id uuid)
RETURNS public.prizes LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE auc public.auctions%ROWTYPE;
DECLARE grp public.chit_groups%ROWTYPE;
DECLARE result public.prizes%ROWTYPE;
DECLARE fee numeric;
DECLARE pool numeric;
BEGIN
  IF NOT private.has_role('SUPER_ADMIN') THEN
    RAISE EXCEPTION 'Only a super admin can finalize an auction' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO auc FROM public.auctions WHERE id = p_auction_id FOR UPDATE;
  IF NOT FOUND OR auc.status NOT IN ('IN_PROGRESS', 'SCHEDULED') THEN
    RAISE EXCEPTION 'Auction is not open';
  END IF;
  IF auc.winning_subscriber_id IS NULL OR auc.winning_bid_discount <= 0 THEN
    RAISE EXCEPTION 'Auction needs a valid winning bid';
  END IF;
  SELECT * INTO grp FROM public.chit_groups WHERE id = auc.group_id;
  fee := round(grp.total_value * grp.foreman_commission_percent / 100, 2);
  pool := greatest(0, auc.winning_bid_discount - fee);
  INSERT INTO public.prizes
    (auction_id, group_id, winner_subscriber_id, total_chit_value, bid_discount, foreman_commission, net_payout_amount)
  VALUES
    (auc.id, auc.group_id, auc.winning_subscriber_id, grp.total_value, auc.winning_bid_discount,
     fee, grp.total_value - auc.winning_bid_discount)
  RETURNING * INTO result;
  UPDATE public.auctions SET status = 'COMPLETED', foreman_fee = fee,
    total_dividend_pool = pool, dividend_per_member = floor(pool / grp.total_members),
    net_prize_amount = result.net_payout_amount, completed_at = now()
    WHERE id = auc.id;
  UPDATE public.chit_subscribers SET has_won_auction = true, won_auction_month = auc.month_number
    WHERE id = auc.winning_subscriber_id;
  INSERT INTO public.payouts (prize_id, status) VALUES (result.id, 'REQUESTED');
  RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.finalize_chit_auction(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.finalize_chit_auction(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.maker_approve_payout(p_payout_id uuid, p_notes text)
RETURNS public.payout_approvals LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE payout public.payouts%ROWTYPE;
DECLARE approval public.payout_approvals%ROWTYPE;
BEGIN
  IF NOT private.has_role('SUPER_ADMIN', 'FINANCE_MANAGER') THEN
    RAISE EXCEPTION 'Finance access required' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO payout FROM public.payouts WHERE id = p_payout_id FOR UPDATE;
  IF NOT FOUND OR payout.status NOT IN ('REQUESTED', 'GUARANTOR_PENDING') THEN
    RAISE EXCEPTION 'Payout is not awaiting maker approval';
  END IF;
  IF payout.bank_account_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.customer_bank_accounts WHERE id = payout.bank_account_id AND is_verified
  ) THEN RAISE EXCEPTION 'A verified bank account is required'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.guarantors WHERE payout_id = p_payout_id AND verified) THEN
    RAISE EXCEPTION 'A verified guarantor is required';
  END IF;
  INSERT INTO public.payout_approvals (payout_id, maker_user_id, maker_notes)
    VALUES (p_payout_id, auth.uid(), p_notes) RETURNING * INTO approval;
  UPDATE public.payouts SET status = 'MAKER_APPROVED' WHERE id = p_payout_id;
  RETURN approval;
END;
$$;
REVOKE ALL ON FUNCTION public.maker_approve_payout(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.maker_approve_payout(uuid, text) TO authenticated;

-- Official schemes previously shown only from hard-coded browser data.
INSERT INTO public.chit_groups
  (group_code, group_name, total_value, duration_months, monthly_contribution,
   total_members, max_tickets_per_person, start_date, status)
VALUES
  ('RAK-100K-01', 'RAKVIH Emerald Chit Scheme', 100000, 20, 5000, 20, 3, '2026-11-01', 'RECRUITING'),
  ('RAK-500K-01', 'RAKVIH Royal Chit Scheme', 500000, 25, 20000, 25, 3, '2026-12-01', 'RECRUITING')
ON CONFLICT (group_code) DO NOTHING;
