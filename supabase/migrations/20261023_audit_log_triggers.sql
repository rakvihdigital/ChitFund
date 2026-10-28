-- Apply in the Supabase SQL Editor after the other 20261023 migrations.
-- Records every change to the business tables in public.audit_logs from the database itself,
-- so entries can't be skipped or forged by the browser.

-- The log must outlive the people in it. With a foreign key, deleting a user who appears in the log
-- tries to null out actor_id, which the append-only trigger blocks, so the user could never be deleted.
ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_actor_id_fkey;

CREATE OR REPLACE FUNCTION private.write_audit_log()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE label text := TG_ARGV[0];
DECLARE old_row jsonb;
DECLARE new_row jsonb;
DECLARE changes jsonb;
DECLARE act text;
DECLARE actor uuid := auth.uid();
DECLARE actor_role public.user_role_type;
DECLARE ip inet;
DECLARE k text;
BEGIN
  IF TG_OP <> 'INSERT' THEN old_row := to_jsonb(OLD); END IF;
  IF TG_OP <> 'DELETE' THEN new_row := to_jsonb(NEW); END IF;

  -- Mask identity and account numbers; super admins can read the log, but it shouldn't be a second copy of them
  FOREACH k IN ARRAY ARRAY['pan_number', 'aadhaar_reference', 'account_number', 'id_proof_number'] LOOP
    IF old_row ->> k IS NOT NULL THEN old_row := old_row || jsonb_build_object(k, '****' || right(old_row ->> k, 4)); END IF;
    IF new_row ->> k IS NOT NULL THEN new_row := new_row || jsonb_build_object(k, '****' || right(new_row ->> k, 4)); END IF;
  END LOOP;

  IF TG_OP = 'UPDATE' THEN
    -- Only the fields that changed; bookkeeping columns alone don't make an event
    SELECT jsonb_object_agg(n.key, jsonb_build_object('from', o.value, 'to', n.value)) INTO changes
    FROM jsonb_each(new_row) n JOIN jsonb_each(old_row) o ON o.key = n.key
    WHERE n.value IS DISTINCT FROM o.value AND n.key NOT IN ('updated_at', 'current_member_count');
    IF changes IS NULL THEN RETURN NULL; END IF;

    IF changes ? 'status' THEN act := label || '_' || (new_row ->> 'status');
    ELSIF changes ? 'is_verified' AND (new_row ->> 'is_verified')::boolean THEN act := label || '_VERIFIED';
    ELSE act := label || '_UPDATED';
    END IF;
  ELSIF TG_OP = 'INSERT' THEN
    act := label || '_CREATED';
    changes := new_row;
  ELSE
    act := label || '_DELETED';
    changes := old_row;
  END IF;

  IF actor IS NOT NULL THEN
    SELECT role INTO actor_role FROM public.admin_users WHERE id = actor;
    IF actor_role IS NULL THEN SELECT role INTO actor_role FROM public.profiles WHERE id = actor; END IF;
  END IF;

  -- Client IP as forwarded by the Supabase API gateway; absent when run from the SQL Editor
  BEGIN
    ip := trim(split_part(COALESCE(
      current_setting('request.headers', true)::json ->> 'cf-connecting-ip',
      current_setting('request.headers', true)::json ->> 'x-forwarded-for'
    ), ',', 1))::inet;
  EXCEPTION WHEN others THEN ip := NULL;
  END;

  INSERT INTO public.audit_logs (actor_id, actor_role, action, resource_type, resource_id, ip_address, details)
  VALUES (actor, actor_role, act, TG_TABLE_NAME, COALESCE(new_row, old_row) ->> 'id', ip, changes);
  RETURN NULL;
END;
$$;

DO $$
DECLARE t record;
BEGIN
  FOR t IN SELECT * FROM (VALUES
    ('profiles', 'PROFILE'),
    ('admin_users', 'ADMIN_USER'),
    ('customer_kyc', 'KYC'),
    ('kyc_documents', 'KYC_DOCUMENT'),
    ('customer_bank_accounts', 'BANK_ACCOUNT'),
    ('nominees', 'NOMINEE'),
    ('chit_groups', 'CHIT_GROUP'),
    ('chit_subscribers', 'SUBSCRIBER'),
    ('payments', 'PAYMENT'),
    ('payment_reconciliations', 'PAYMENT_RECONCILIATION'),
    ('auctions', 'AUCTION'),
    ('auction_bids', 'AUCTION_BID'),
    ('prizes', 'PRIZE'),
    ('payouts', 'PAYOUT'),
    ('payout_approvals', 'PAYOUT_APPROVAL'),
    ('guarantors', 'GUARANTOR')
  ) AS v(tbl, label) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS write_audit_log ON public.%I', t.tbl);
    EXECUTE format(
      'CREATE TRIGGER write_audit_log AFTER INSERT OR UPDATE OR DELETE ON public.%I
       FOR EACH ROW EXECUTE FUNCTION private.write_audit_log(%L)', t.tbl, t.label);
  END LOOP;
END;
$$;
