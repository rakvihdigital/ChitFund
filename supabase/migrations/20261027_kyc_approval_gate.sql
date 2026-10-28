-- Apply in the Supabase SQL Editor after the earlier migrations. Safe to run more than once.
-- Customers register with their KYC and can only use the portal once a KYC officer approves it.
-- On top of the app's checks, the database enforces:
--   * KYC is approved only with PAN, Aadhaar (front and back), a photograph and a cancelled cheque on file
--   * joining a group needs approved KYC, a nominee and a signed chit agreement
--   * a bank account is verified only with a proof document (payouts already need a verified account)

-- ---------- KYC approval needs every required document ----------
CREATE OR REPLACE FUNCTION private.require_kyc_documents()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE missing text;
BEGIN
    IF NEW.status = 'VERIFIED' AND OLD.status IS DISTINCT FROM 'VERIFIED' THEN
        SELECT string_agg(required::text, ', ') INTO missing
        FROM unnest(ARRAY['PAN_CARD', 'AADHAAR_FRONT', 'AADHAAR_BACK', 'PHOTOGRAPH', 'BANK_PROOF']::public.kyc_document_type[]) AS required
        WHERE NOT EXISTS (
            SELECT 1 FROM public.kyc_documents d WHERE d.kyc_id = NEW.id AND d.document_type = required
        );
        IF missing IS NOT NULL THEN
            RAISE EXCEPTION 'KYC cannot be approved without: %', missing;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS require_kyc_documents ON public.customer_kyc;
CREATE TRIGGER require_kyc_documents
    BEFORE UPDATE OF status ON public.customer_kyc
    FOR EACH ROW EXECUTE FUNCTION private.require_kyc_documents();

-- ---------- Bank account proof (cancelled cheque or passbook page) ----------
-- The file lives in the private 'kyc-documents' bucket under the customer's folder
ALTER TABLE public.customer_bank_accounts
    ADD COLUMN IF NOT EXISTS proof_path TEXT,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- NOT VALID keeps accounts verified before this migration; new verifications need a proof
ALTER TABLE public.customer_bank_accounts DROP CONSTRAINT IF EXISTS customer_bank_accounts_verified_needs_proof;
ALTER TABLE public.customer_bank_accounts
    ADD CONSTRAINT customer_bank_accounts_verified_needs_proof
    CHECK (NOT is_verified OR proof_path IS NOT NULL) NOT VALID;

-- ---------- Signed chit agreements (one per ticket, append-only) ----------
CREATE TABLE IF NOT EXISTS public.chit_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscriber_id UUID NOT NULL UNIQUE REFERENCES public.chit_subscribers(id) ON DELETE RESTRICT,
    group_id UUID NOT NULL REFERENCES public.chit_groups(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    agreement_version TEXT NOT NULL,
    terms JSONB NOT NULL, -- snapshot of the group terms the member agreed to
    signed_name TEXT NOT NULL,
    signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS chit_agreements_user_id_idx ON public.chit_agreements (user_id);

ALTER TABLE public.chit_agreements ENABLE ROW LEVEL SECURITY;

-- Agreements are only created by join_chit_group, so there is no insert policy
DROP POLICY IF EXISTS "Customers view own agreements, staff view all" ON public.chit_agreements;
CREATE POLICY "Customers view own agreements, staff view all" ON public.chit_agreements
    FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid()) OR (SELECT private.is_staff()));

DROP TRIGGER IF EXISTS prevent_modification ON public.chit_agreements;
CREATE TRIGGER prevent_modification BEFORE UPDATE OR DELETE ON public.chit_agreements
    FOR EACH ROW EXECUTE FUNCTION private.prevent_modification();

DROP TRIGGER IF EXISTS write_audit_log ON public.chit_agreements;
CREATE TRIGGER write_audit_log AFTER INSERT OR UPDATE OR DELETE ON public.chit_agreements
    FOR EACH ROW EXECUTE FUNCTION private.write_audit_log('CHIT_AGREEMENT');

-- ---------- Customer joins a group: supabase.rpc('join_chit_group', { p_group_id, p_signed_name }) ----------
-- The member signs by typing their full name as registered. Picks the lowest free seat;
-- limits are enforced by enforce_subscriber_limits.
DROP FUNCTION IF EXISTS public.join_chit_group(UUID);
CREATE OR REPLACE FUNCTION public.join_chit_group(p_group_id UUID, p_signed_name TEXT)
RETURNS public.chit_subscribers
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    uid UUID := (SELECT auth.uid());
    member public.profiles%ROWTYPE;
    grp public.chit_groups%ROWTYPE;
    free_seat INT;
    new_sub public.chit_subscribers%ROWTYPE;
BEGIN
    IF uid IS NULL THEN
        RAISE EXCEPTION 'You must be signed in to join a chit group' USING ERRCODE = '42501';
    END IF;
    SELECT * INTO member FROM public.profiles WHERE id = uid AND role = 'CUSTOMER' AND is_active;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Only active customers can join a chit group' USING ERRCODE = '42501';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.customer_kyc WHERE user_id = uid AND status = 'VERIFIED') THEN
        RAISE EXCEPTION 'Your KYC must be approved before you can join a chit group' USING ERRCODE = '42501';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.nominees WHERE user_id = uid) THEN
        RAISE EXCEPTION 'Add a nominee before joining a chit group';
    END IF;
    IF lower(regexp_replace(btrim(COALESCE(p_signed_name, '')), '\s+', ' ', 'g'))
       <> lower(regexp_replace(btrim(member.full_name), '\s+', ' ', 'g')) THEN
        RAISE EXCEPTION 'Sign the agreement by typing your full name exactly as registered: %', member.full_name;
    END IF;

    SELECT * INTO grp FROM public.chit_groups WHERE id = p_group_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Chit group not found';
    END IF;
    IF grp.status <> 'RECRUITING' THEN
        RAISE EXCEPTION 'This chit group is not accepting new members';
    END IF;

    SELECT seat INTO free_seat
    FROM generate_series(1, grp.total_members) AS seat
    WHERE NOT EXISTS (
        SELECT 1 FROM public.chit_subscribers c
        WHERE c.group_id = grp.id AND c.seat_number = seat
    )
    ORDER BY seat
    LIMIT 1;

    IF free_seat IS NULL THEN
        RAISE EXCEPTION 'This chit group is already full';
    END IF;

    INSERT INTO public.chit_subscribers (group_id, user_id, seat_number)
    VALUES (grp.id, uid, free_seat)
    RETURNING * INTO new_sub;

    INSERT INTO public.chit_agreements (subscriber_id, group_id, user_id, agreement_version, terms, signed_name)
    VALUES (new_sub.id, grp.id, uid, 'v1', jsonb_build_object(
        'group_code', grp.group_code,
        'group_name', grp.group_name,
        'total_value', grp.total_value,
        'duration_months', grp.duration_months,
        'monthly_contribution', grp.monthly_contribution,
        'total_members', grp.total_members,
        'foreman_commission_percent', grp.foreman_commission_percent,
        'min_bid_discount_percent', grp.min_bid_discount_percent,
        'max_bid_discount_percent', grp.max_bid_discount_percent,
        'start_date', grp.start_date,
        'seat_number', free_seat
    ), btrim(p_signed_name));

    RETURN new_sub;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.join_chit_group(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_chit_group(UUID, TEXT) TO authenticated;

-- ---------- Staff enrollment (agreement signed offline) still needs approved KYC ----------
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
  IF NOT EXISTS (SELECT 1 FROM public.customer_kyc WHERE user_id = p_user_id AND status = 'VERIFIED') THEN
    RAISE EXCEPTION 'This customer''s KYC must be approved before enrollment';
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
