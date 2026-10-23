-- ==============================================================================
-- Migration: Create dedicated public.admin_users table & Auto-confirm users
-- Purpose:
--   1. Separate staff/admin accounts from customer profiles.
--   2. Admins do NOT require a phone number (login is email & password).
--   3. Auto-confirm users upon signup (no email confirmation needed).
--   4. Fix NULL token fields to prevent GoTrue "Database error querying schema".
--   5. Keep phone as NULL to prevent users_phone_key duplicate key constraint.
--   6. Prevent on_auth_user_created trigger from adding admins into profiles.
-- Admin Account: chitfundadmin@gmail.com / Admincf@2026!
-- ==============================================================================

-- 1. Create separate admin_users table (phone_number is completely optional / NULL)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_number VARCHAR(15),
    role user_role_type NOT NULL DEFAULT 'SUPER_ADMIN',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Trigger for updated_at on admin_users
DROP TRIGGER IF EXISTS set_admin_updated_at ON public.admin_users;
CREATE TRIGGER set_admin_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

-- 3. Row Level Security on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users view admin users" ON public.admin_users;
CREATE POLICY "Authenticated users view admin users"
    ON public.admin_users FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins manage own admin user record" ON public.admin_users;
CREATE POLICY "Admins manage own admin user record"
    ON public.admin_users FOR ALL
    TO authenticated
    USING (id = (SELECT auth.uid()));

-- 4. Update helper functions so admin_users are recognized everywhere
CREATE OR REPLACE FUNCTION private.has_role(VARIADIC roles public.user_role_type[])
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = (SELECT auth.uid()) AND is_active AND role = ANY (roles)
    ) OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (SELECT auth.uid()) AND is_active AND role = ANY (roles)
    );
$$;

CREATE OR REPLACE FUNCTION private.is_staff()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = (SELECT auth.uid()) AND is_active
    ) OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (SELECT auth.uid()) AND is_active AND role <> 'CUSTOMER'
    );
$$;

-- 5. Foreign keys update so admin actions don't conflict with customer profiles
ALTER TABLE public.customer_kyc
    DROP CONSTRAINT IF EXISTS customer_kyc_verified_by_fkey,
    ADD CONSTRAINT customer_kyc_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.customer_bank_accounts
    DROP CONSTRAINT IF EXISTS customer_bank_accounts_verified_by_fkey,
    ADD CONSTRAINT customer_bank_accounts_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.chit_groups
    DROP CONSTRAINT IF EXISTS chit_groups_created_by_fkey,
    ADD CONSTRAINT chit_groups_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.payments
    DROP CONSTRAINT IF EXISTS payments_recorded_by_fkey,
    ADD CONSTRAINT payments_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.payment_reconciliations
    DROP CONSTRAINT IF EXISTS payment_reconciliations_matched_by_fkey,
    ADD CONSTRAINT payment_reconciliations_matched_by_fkey FOREIGN KEY (matched_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.auctions
    DROP CONSTRAINT IF EXISTS auctions_conducted_by_fkey,
    ADD CONSTRAINT auctions_conducted_by_fkey FOREIGN KEY (conducted_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.payout_approvals
    DROP CONSTRAINT IF EXISTS payout_approvals_maker_user_id_fkey,
    ADD CONSTRAINT payout_approvals_maker_user_id_fkey FOREIGN KEY (maker_user_id) REFERENCES auth.users(id) ON DELETE RESTRICT;

ALTER TABLE public.payout_approvals
    DROP CONSTRAINT IF EXISTS payout_approvals_checker_user_id_fkey,
    ADD CONSTRAINT payout_approvals_checker_user_id_fkey FOREIGN KEY (checker_user_id) REFERENCES auth.users(id) ON DELETE RESTRICT;

ALTER TABLE public.support_tickets
    DROP CONSTRAINT IF EXISTS support_tickets_assigned_to_fkey,
    ADD CONSTRAINT support_tickets_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.support_ticket_messages
    DROP CONSTRAINT IF EXISTS support_ticket_messages_sender_id_fkey,
    ADD CONSTRAINT support_ticket_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.audit_logs
    DROP CONSTRAINT IF EXISTS audit_logs_actor_id_fkey,
    ADD CONSTRAINT audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 6. Auto-confirm all new user signups immediately (No email confirmation needed)
CREATE OR REPLACE FUNCTION private.auto_confirm_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, NOW());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_auto_confirm
    BEFORE INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION private.auto_confirm_new_user();

-- 7. Update handle_new_user so it NEVER inserts admins into public.profiles
CREATE OR REPLACE FUNCTION private.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.admin_users WHERE id = NEW.id OR email = NEW.email)
       OR (NEW.raw_app_meta_data ->> 'role') = 'SUPER_ADMIN'
       OR (NEW.raw_user_meta_data ->> 'is_admin')::boolean = true THEN
        RETURN NEW;
    END IF;

    INSERT INTO public.profiles (id, full_name, email, phone_number)
    VALUES (
        NEW.id,
        COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data ->> 'full_name'), ''), SPLIT_PART(NEW.email, '@', 1), 'Customer'),
        NEW.email,
        NULLIF(REGEXP_REPLACE(COALESCE(NEW.raw_user_meta_data ->> 'phone_number', NEW.phone, ''), '[^0-9+]', '', 'g'), '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- 8. Clean up: remove admin from profiles table
DELETE FROM public.profiles WHERE email = 'chitfundadmin@gmail.com';

-- 9. Reset any empty string phone back to NULL (unique constraint prevents multiple '')
UPDATE auth.users
SET phone = NULL
WHERE phone = '';

-- 10. Fix NULL token columns on auth.users that crash GoTrue parser
UPDATE auth.users
SET 
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  email_confirmed_at = COALESCE(email_confirmed_at, NOW());

-- 11. Ensure chitfundadmin@gmail.com is in admin_users with SUPER_ADMIN
INSERT INTO public.admin_users (id, email, full_name, role, is_active)
SELECT id, email, 'Chit Fund Admin', 'SUPER_ADMIN', true
FROM auth.users
WHERE email = 'chitfundadmin@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'SUPER_ADMIN',
  is_active = true,
  full_name = 'Chit Fund Admin';
