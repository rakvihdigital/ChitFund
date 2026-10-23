-- ==============================================================================
-- RAKVIH DIGITAL CHIT FUND MANAGEMENT PLATFORM
-- SUPABASE POSTGRESQL DATABASE SCHEMA
-- ==============================================================================
-- Run once on a fresh project (SQL Editor or `supabase db push`).
--
-- Security model
--   * Every table has Row Level Security enabled. The anon key can only read
--     chit_groups; everything else requires a signed-in user.
--   * profiles.role is the single source of truth for permissions.
--   * Money tables (subscribers, installments, payments, prizes, payouts,
--     ledger) use ON DELETE RESTRICT. Records are retained, never deleted.
--   * ledger_entries and audit_logs are append-only (enforced by triggers).
--   * Customers can never mark a payment as successful. Payment confirmation
--     must happen server-side (gateway webhook using the service role key).
--
-- After running, promote your first admin from the SQL Editor:
--   UPDATE public.profiles SET role = 'SUPER_ADMIN' WHERE email = 'you@example.com';
-- ==============================================================================

-- Private schema for helper functions (not exposed through the Data API)
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated;

-- ==============================================================================
-- ENUM TYPES
-- ==============================================================================
CREATE TYPE kyc_status_type AS ENUM ('NOT_SUBMITTED', 'PENDING_APPROVAL', 'VERIFIED', 'REJECTED');
CREATE TYPE kyc_document_type AS ENUM ('PAN_CARD', 'AADHAAR_FRONT', 'AADHAAR_BACK', 'PHOTOGRAPH', 'SIGNATURE', 'BANK_PROOF');
CREATE TYPE group_status_type AS ENUM ('RECRUITING', 'ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE subscriber_status_type AS ENUM ('ACTIVE', 'DEFAULTED', 'PAID_OUT', 'WITHDRAWN');
CREATE TYPE installment_status_type AS ENUM ('UPCOMING', 'DUE', 'PAID', 'OVERDUE', 'PARTIAL');
CREATE TYPE payment_mode_type AS ENUM ('UPI', 'NET_BANKING', 'DEBIT_CARD', 'CREDIT_CARD', 'BANK_TRANSFER', 'CHEQUE', 'CASH');
CREATE TYPE payment_status_type AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'RECONCILED', 'REFUNDED');
CREATE TYPE auction_status_type AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE payout_status_type AS ENUM ('REQUESTED', 'GUARANTOR_PENDING', 'MAKER_APPROVED', 'CHECKER_RELEASED', 'REJECTED');
CREATE TYPE approval_status_type AS ENUM ('MAKER_PASSED', 'CHECKER_PASSED', 'REJECTED');
CREATE TYPE guarantor_document_type AS ENUM ('PROPERTY_DEED', 'SALARY_SLIP', 'PROMISSORY_NOTE', 'CHEQUE');
CREATE TYPE document_type AS ENUM ('RECEIPT', 'CHIT_AGREEMENT', 'STATEMENT', 'COMPLETION_CERTIFICATE');
CREATE TYPE notification_channel_type AS ENUM ('IN_APP', 'SMS', 'EMAIL', 'PUSH');
CREATE TYPE ledger_account_type AS ENUM ('COLLECTION', 'PRIZE_DISBURSEMENT', 'FOREMAN_COMMISSION', 'DIVIDEND_CREDIT', 'PENALTY');
CREATE TYPE ticket_category_type AS ENUM ('PAYMENT', 'AUCTION', 'KYC', 'PAYOUT', 'OTHER');
CREATE TYPE ticket_priority_type AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE ticket_status_type AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE ticket_sender_type AS ENUM ('CUSTOMER', 'SUPPORT');
CREATE TYPE user_role_type AS ENUM ('CUSTOMER', 'SUPER_ADMIN', 'FINANCE_MANAGER', 'KYC_OFFICER', 'SUPPORT_AGENT');

-- ==============================================================================
-- TABLES
-- ==============================================================================

-- 1. Profiles (one row per auth user, created automatically on signup)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone_number VARCHAR(15) UNIQUE,
    role user_role_type NOT NULL DEFAULT 'CUSTOMER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE, -- deactivate instead of deleting
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Customer KYC (one record per customer; resubmission updates the same row)
CREATE TABLE public.customer_kyc (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    pan_number VARCHAR(10) UNIQUE CHECK (pan_number ~ '^[A-Z]{5}[0-9]{4}[A-Z]$'),
    -- Never store the full Aadhaar number. Keep the last 4 digits for display and
    -- the reference token returned by your Aadhaar verification provider.
    aadhaar_last4 CHAR(4) CHECK (aadhaar_last4 ~ '^[0-9]{4}$'),
    aadhaar_reference TEXT,
    status kyc_status_type NOT NULL DEFAULT 'NOT_SUBMITTED',
    rejection_reason TEXT,
    submitted_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.profiles(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (status <> 'VERIFIED' OR (verified_by IS NOT NULL AND verified_at IS NOT NULL)),
    CHECK (status <> 'REJECTED' OR rejection_reason IS NOT NULL)
);

-- 3. KYC Documents (file_path points into the private 'kyc-documents' storage bucket)
CREATE TABLE public.kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kyc_id UUID NOT NULL REFERENCES public.customer_kyc(id) ON DELETE CASCADE,
    document_type kyc_document_type NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    mime_type TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Customer Bank Accounts
CREATE TABLE public.customer_bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    account_holder_name TEXT NOT NULL,
    account_number TEXT NOT NULL CHECK (account_number ~ '^[0-9]{9,18}$'),
    ifsc_code VARCHAR(11) NOT NULL CHECK (ifsc_code ~ '^[A-Z]{4}0[A-Z0-9]{6}$'),
    bank_name TEXT NOT NULL,
    branch_name TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by UUID REFERENCES public.profiles(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, account_number, ifsc_code)
);
-- At most one primary account per customer
CREATE UNIQUE INDEX customer_bank_accounts_one_primary
    ON public.customer_bank_accounts (user_id) WHERE is_primary;

-- 5. Nominees
CREATE TABLE public.nominees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    nominee_name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    phone_number VARCHAR(15),
    id_proof_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Chit Groups
CREATE TABLE public.chit_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_code VARCHAR(20) UNIQUE NOT NULL, -- e.g., RAK-CHIT-100K-01
    group_name TEXT NOT NULL,
    total_value NUMERIC(12, 2) NOT NULL CHECK (total_value > 0), -- e.g. 100000
    duration_months INT NOT NULL CHECK (duration_months > 0), -- e.g. 20
    monthly_contribution NUMERIC(12, 2) NOT NULL CHECK (monthly_contribution > 0), -- e.g. 5000
    total_members INT NOT NULL CHECK (total_members > 0), -- e.g. 20
    max_tickets_per_person INT NOT NULL DEFAULT 3 CHECK (max_tickets_per_person >= 1),
    -- Chit Funds Act, 1982: foreman commission max 5%, bid discount max 40%
    foreman_commission_percent NUMERIC(5, 2) NOT NULL DEFAULT 5.00 CHECK (foreman_commission_percent BETWEEN 0 AND 5),
    min_bid_discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 5.00 CHECK (min_bid_discount_percent >= 0),
    max_bid_discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 30.00 CHECK (max_bid_discount_percent <= 40),
    start_date DATE,
    status group_status_type NOT NULL DEFAULT 'RECRUITING',
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (min_bid_discount_percent <= max_bid_discount_percent),
    -- Standard chit structure: one installment per member, value = contribution x members.
    -- Remove these two checks if you ever run non-standard schemes.
    CHECK (duration_months = total_members),
    CHECK (monthly_contribution * total_members = total_value)
);

-- 7. Chit Subscribers (one row per ticket/seat; a user may hold up to
--    max_tickets_per_person seats in a group, enforced by trigger)
CREATE TABLE public.chit_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.chit_groups(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    seat_number INT NOT NULL CHECK (seat_number > 0), -- 1 to total_members
    status subscriber_status_type NOT NULL DEFAULT 'ACTIVE',
    has_won_auction BOOLEAN NOT NULL DEFAULT FALSE,
    won_auction_month INT,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (group_id, seat_number),
    UNIQUE (id, group_id), -- lets child tables prove the subscriber is in the same group
    CHECK (has_won_auction = (won_auction_month IS NOT NULL))
);

-- 8. Installments Schedule
CREATE TABLE public.installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL,
    subscriber_id UUID NOT NULL,
    month_number INT NOT NULL CHECK (month_number > 0),
    due_date DATE NOT NULL,
    gross_amount NUMERIC(12, 2) NOT NULL CHECK (gross_amount > 0), -- ₹5,000
    dividend_discount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (dividend_discount >= 0), -- from previous auction
    net_payable NUMERIC(12, 2) GENERATED ALWAYS AS (gross_amount - dividend_discount) STORED,
    penalty_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (penalty_amount >= 0),
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (paid_amount >= 0),
    status installment_status_type NOT NULL DEFAULT 'UPCOMING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (subscriber_id, month_number),
    CHECK (dividend_discount <= gross_amount),
    FOREIGN KEY (subscriber_id, group_id) REFERENCES public.chit_subscribers(id, group_id) ON DELETE RESTRICT
);

-- 9. Payments
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_ref VARCHAR(50) UNIQUE NOT NULL,
    installment_id UUID NOT NULL REFERENCES public.installments(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    amount_paid NUMERIC(12, 2) NOT NULL CHECK (amount_paid > 0),
    payment_mode payment_mode_type NOT NULL,
    payment_gateway TEXT DEFAULT 'RAZORPAY', -- or 'CASHFREE', 'BANK', NULL for cash
    gateway_payment_id TEXT UNIQUE, -- unique so a repeated webhook can't record a payment twice
    gateway_order_id TEXT,
    receipt_number VARCHAR(30) UNIQUE, -- issued once the payment succeeds
    status payment_status_type NOT NULL DEFAULT 'PENDING',
    recorded_by UUID REFERENCES public.profiles(id), -- staff member, for cash/cheque
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    CHECK (status NOT IN ('SUCCESS', 'RECONCILED') OR (receipt_number IS NOT NULL AND paid_at IS NOT NULL))
);

-- 10. Payment Reconciliations
CREATE TABLE public.payment_reconciliations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL UNIQUE REFERENCES public.payments(id) ON DELETE RESTRICT,
    bank_settlement_id TEXT,
    settlement_date DATE,
    settled_amount NUMERIC(12, 2) CHECK (settled_amount >= 0),
    gateway_fee NUMERIC(12, 2) CHECK (gateway_fee >= 0),
    matched_by UUID REFERENCES public.profiles(id),
    matched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Auctions
CREATE TABLE public.auctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.chit_groups(id) ON DELETE RESTRICT,
    month_number INT NOT NULL CHECK (month_number > 0),
    auction_date TIMESTAMPTZ NOT NULL,
    status auction_status_type NOT NULL DEFAULT 'SCHEDULED',
    winning_bid_discount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (winning_bid_discount >= 0),
    winning_subscriber_id UUID,
    foreman_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (foreman_fee >= 0),
    total_dividend_pool NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_dividend_pool >= 0),
    dividend_per_member NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (dividend_per_member >= 0),
    net_prize_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (net_prize_amount >= 0),
    conducted_by UUID REFERENCES public.profiles(id),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (group_id, month_number),
    UNIQUE (id, group_id),
    CHECK (status <> 'COMPLETED' OR (winning_subscriber_id IS NOT NULL AND completed_at IS NOT NULL)),
    FOREIGN KEY (winning_subscriber_id, group_id) REFERENCES public.chit_subscribers(id, group_id)
);

-- 12. Auction Bids (validated by trigger: range, auction open, bidder eligible)
CREATE TABLE public.auction_bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID NOT NULL,
    group_id UUID NOT NULL, -- filled in by the trigger from the auction
    subscriber_id UUID NOT NULL,
    bid_discount_amount NUMERIC(12, 2) NOT NULL CHECK (bid_discount_amount > 0), -- e.g. member offers ₹20,000 discount
    bid_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (auction_id, group_id) REFERENCES public.auctions(id, group_id) ON DELETE RESTRICT,
    FOREIGN KEY (subscriber_id, group_id) REFERENCES public.chit_subscribers(id, group_id) ON DELETE RESTRICT
);

-- 13. Prizes
CREATE TABLE public.prizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID NOT NULL UNIQUE,
    group_id UUID NOT NULL,
    winner_subscriber_id UUID NOT NULL,
    total_chit_value NUMERIC(12, 2) NOT NULL CHECK (total_chit_value > 0),
    bid_discount NUMERIC(12, 2) NOT NULL CHECK (bid_discount >= 0),
    foreman_commission NUMERIC(12, 2) NOT NULL CHECK (foreman_commission >= 0),
    net_payout_amount NUMERIC(12, 2) NOT NULL CHECK (net_payout_amount > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (auction_id, group_id) REFERENCES public.auctions(id, group_id) ON DELETE RESTRICT,
    FOREIGN KEY (winner_subscriber_id, group_id) REFERENCES public.chit_subscribers(id, group_id) ON DELETE RESTRICT
);

-- 14. Payouts (the winner comes from the prize; bank account must be the winner's)
CREATE TABLE public.payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prize_id UUID NOT NULL UNIQUE REFERENCES public.prizes(id) ON DELETE RESTRICT,
    bank_account_id UUID REFERENCES public.customer_bank_accounts(id) ON DELETE RESTRICT,
    status payout_status_type NOT NULL DEFAULT 'REQUESTED',
    payout_ref VARCHAR(40) UNIQUE,
    disbursed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (status <> 'CHECKER_RELEASED' OR (payout_ref IS NOT NULL AND disbursed_at IS NOT NULL))
);

-- 15. Payout Approvals (Maker-Checker Workflow)
CREATE TABLE public.payout_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payout_id UUID NOT NULL REFERENCES public.payouts(id) ON DELETE RESTRICT,
    maker_user_id UUID NOT NULL REFERENCES public.profiles(id), -- Finance maker
    maker_notes TEXT,
    maker_approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    checker_user_id UUID REFERENCES public.profiles(id), -- Finance checker / Super Admin
    checker_notes TEXT,
    checker_approved_at TIMESTAMPTZ,
    status approval_status_type NOT NULL DEFAULT 'MAKER_PASSED',
    -- The checker must be a different person from the maker
    CHECK (checker_user_id IS NULL OR checker_user_id <> maker_user_id),
    CHECK (status <> 'CHECKER_PASSED' OR (checker_user_id IS NOT NULL AND checker_approved_at IS NOT NULL))
);

-- 16. Guarantors & Security
CREATE TABLE public.guarantors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payout_id UUID NOT NULL REFERENCES public.payouts(id) ON DELETE RESTRICT,
    guarantor_name TEXT NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    relationship TEXT NOT NULL,
    occupation TEXT,
    monthly_income NUMERIC(12, 2) CHECK (monthly_income >= 0),
    document_type guarantor_document_type NOT NULL,
    document_ref TEXT,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Digital Documents
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
    group_id UUID REFERENCES public.chit_groups(id) ON DELETE RESTRICT,
    document_type document_type NOT NULL,
    title TEXT NOT NULL,
    file_path TEXT,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. Notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    channel notification_channel_type NOT NULL DEFAULT 'IN_APP',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. Ledger Entries (Accounting, append-only)
CREATE TABLE public.ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_number VARCHAR(30) UNIQUE NOT NULL,
    group_id UUID REFERENCES public.chit_groups(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
    payment_id UUID REFERENCES public.payments(id) ON DELETE RESTRICT,
    prize_id UUID REFERENCES public.prizes(id) ON DELETE RESTRICT,
    account_type ledger_account_type NOT NULL,
    debit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (debit_amount >= 0),
    credit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (credit_amount >= 0),
    narration TEXT NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Each entry is either a debit or a credit, never both or neither
    CHECK ((debit_amount > 0) <> (credit_amount > 0))
);

-- 20. Support Tickets
CREATE TABLE public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_code VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    category ticket_category_type NOT NULL,
    priority ticket_priority_type NOT NULL DEFAULT 'MEDIUM',
    status ticket_status_type NOT NULL DEFAULT 'OPEN',
    assigned_to UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. Support Ticket Messages (conversation thread for each ticket)
CREATE TABLE public.support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id),
    sender_type ticket_sender_type NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 22. Audit Logs (append-only)
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id),
    actor_role user_role_type,
    action TEXT NOT NULL, -- e.g., 'KYC_APPROVED', 'AUCTION_WINNER_DECLARED', 'PAYOUT_CHECKER_RELEASED'
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    ip_address INET,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES (Postgres does not index foreign keys automatically)
-- ==============================================================================
CREATE INDEX ON public.customer_kyc (status);
CREATE INDEX ON public.kyc_documents (kyc_id);
CREATE INDEX ON public.customer_bank_accounts (user_id);
CREATE INDEX ON public.nominees (user_id);
CREATE INDEX ON public.chit_groups (status);
CREATE INDEX ON public.chit_subscribers (user_id);
CREATE INDEX ON public.chit_subscribers (group_id, user_id);
CREATE INDEX ON public.installments (group_id, month_number);
CREATE INDEX ON public.installments (status, due_date);
CREATE INDEX ON public.payments (installment_id);
CREATE INDEX ON public.payments (user_id, created_at DESC);
CREATE INDEX ON public.payments (gateway_order_id);
CREATE INDEX ON public.payments (status);
CREATE INDEX ON public.auctions (status, auction_date);
CREATE INDEX ON public.auction_bids (auction_id, bid_discount_amount DESC);
CREATE INDEX ON public.auction_bids (subscriber_id);
CREATE INDEX ON public.prizes (winner_subscriber_id);
CREATE INDEX ON public.prizes (group_id);
CREATE INDEX ON public.payouts (status);
CREATE INDEX ON public.payouts (bank_account_id);
CREATE INDEX ON public.payout_approvals (payout_id);
CREATE INDEX ON public.guarantors (payout_id);
CREATE INDEX ON public.documents (user_id);
CREATE INDEX ON public.documents (group_id);
CREATE INDEX ON public.notifications (user_id, is_read, created_at DESC);
CREATE INDEX ON public.ledger_entries (group_id, transaction_date);
CREATE INDEX ON public.ledger_entries (user_id);
CREATE INDEX ON public.ledger_entries (payment_id);
CREATE INDEX ON public.ledger_entries (prize_id);
CREATE INDEX ON public.support_tickets (user_id);
CREATE INDEX ON public.support_tickets (status, assigned_to);
CREATE INDEX ON public.support_ticket_messages (ticket_id, created_at);
CREATE INDEX ON public.audit_logs (actor_id, created_at DESC);
CREATE INDEX ON public.audit_logs (resource_type, resource_id);
CREATE INDEX ON public.audit_logs (created_at DESC);

-- ==============================================================================
-- HELPER FUNCTIONS (used by RLS policies)
-- SECURITY DEFINER so they can read profiles without recursing into its RLS.
-- ==============================================================================

-- True when the signed-in user is active and has one of the given roles
CREATE FUNCTION private.has_role(VARIADIC roles public.user_role_type[])
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (SELECT auth.uid()) AND is_active AND role = ANY (roles)
    );
$$;

-- True for any active staff member (every role except CUSTOMER)
CREATE FUNCTION private.is_staff()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (SELECT auth.uid()) AND is_active AND role <> 'CUSTOMER'
    );
$$;

-- Subscriber (ticket) ids that belong to the signed-in user
CREATE FUNCTION private.my_subscriber_ids()
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
    SELECT id FROM public.chit_subscribers WHERE user_id = (SELECT auth.uid());
$$;

-- Groups the signed-in user holds at least one seat in
CREATE FUNCTION private.my_group_ids()
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
    SELECT DISTINCT group_id FROM public.chit_subscribers WHERE user_id = (SELECT auth.uid());
$$;

-- Payouts won by the signed-in user
CREATE FUNCTION private.my_payout_ids()
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
    SELECT po.id
    FROM public.payouts po
    JOIN public.prizes pr ON pr.id = po.prize_id
    JOIN public.chit_subscribers s ON s.id = pr.winner_subscriber_id
    WHERE s.user_id = (SELECT auth.uid());
$$;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA private TO authenticated;

-- ==============================================================================
-- TRIGGERS
-- ==============================================================================

-- Keep updated_at current
CREATE FUNCTION private.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = ''
AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.customer_kyc FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.customer_bank_accounts FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.chit_groups FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.installments FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.auctions FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.payouts FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

-- Create a profile for every new auth user.
-- The role is always CUSTOMER: never read it from user metadata, which the user controls.
-- Pass full_name and phone_number in options.data when calling supabase.auth.signUp().
CREATE FUNCTION private.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, phone_number)
    VALUES (
        NEW.id,
        COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data ->> 'full_name'), ''), SPLIT_PART(NEW.email, '@', 1), 'Customer'),
        NEW.email,
        NULLIF(REGEXP_REPLACE(COALESCE(NEW.raw_user_meta_data ->> 'phone_number', NEW.phone, ''), '[^0-9+]', '', 'g'), '')
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION private.handle_new_user();

-- Keep profiles.email in sync when a user changes their email in Supabase Auth
CREATE FUNCTION private.handle_user_email_change()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    UPDATE public.profiles SET email = NEW.email WHERE id = NEW.id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_email_changed
    AFTER UPDATE OF email ON auth.users
    FOR EACH ROW WHEN (OLD.email IS DISTINCT FROM NEW.email)
    EXECUTE FUNCTION private.handle_user_email_change();

-- Stop signed-in users from changing their own role, active flag or email.
-- Only a SUPER_ADMIN (or the service role / SQL Editor, which have no auth.uid()) can.
CREATE FUNCTION private.guard_profile_columns()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    IF (SELECT auth.uid()) IS NOT NULL AND NOT private.has_role('SUPER_ADMIN') THEN
        IF NEW.id IS DISTINCT FROM OLD.id
           OR NEW.role IS DISTINCT FROM OLD.role
           OR NEW.is_active IS DISTINCT FROM OLD.is_active
           OR NEW.email IS DISTINCT FROM OLD.email THEN
            RAISE EXCEPTION 'Only a super admin can change role, status or email'
                USING ERRCODE = '42501';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER guard_profile_columns
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION private.guard_profile_columns();

-- Enforce seat range and max_tickets_per_person. Locks the group row so two
-- people joining at the same moment can't exceed the limits.
CREATE FUNCTION private.enforce_subscriber_limits()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    grp public.chit_groups%ROWTYPE;
    held INT;
BEGIN
    SELECT * INTO grp FROM public.chit_groups WHERE id = NEW.group_id FOR UPDATE;

    IF NEW.seat_number > grp.total_members THEN
        RAISE EXCEPTION 'Seat % is out of range: this group has % seats', NEW.seat_number, grp.total_members;
    END IF;

    SELECT COUNT(*) INTO held
    FROM public.chit_subscribers
    WHERE group_id = NEW.group_id AND user_id = NEW.user_id AND id <> NEW.id;

    IF held >= grp.max_tickets_per_person THEN
        RAISE EXCEPTION 'A single subscriber can hold at most % tickets in this chit group', grp.max_tickets_per_person;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_subscriber_limits
    BEFORE INSERT OR UPDATE OF group_id, user_id, seat_number ON public.chit_subscribers
    FOR EACH ROW EXECUTE FUNCTION private.enforce_subscriber_limits();

-- Validate every bid and keep the auction's leading bid up to date (open auction:
-- each new bid must beat the current highest; earliest bidder wins ties).
CREATE FUNCTION private.validate_auction_bid()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    auc public.auctions%ROWTYPE;
    grp public.chit_groups%ROWTYPE;
    sub public.chit_subscribers%ROWTYPE;
    min_bid NUMERIC;
    max_bid NUMERIC;
BEGIN
    SELECT * INTO auc FROM public.auctions WHERE id = NEW.auction_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Auction not found';
    END IF;
    IF auc.status NOT IN ('SCHEDULED', 'IN_PROGRESS') THEN
        RAISE EXCEPTION 'This auction is not open for bidding';
    END IF;
    IF NOW() < auc.auction_date THEN
        RAISE EXCEPTION 'Bidding opens at %', auc.auction_date;
    END IF;

    SELECT * INTO sub FROM public.chit_subscribers WHERE id = NEW.subscriber_id;
    IF NOT FOUND OR sub.group_id <> auc.group_id THEN
        RAISE EXCEPTION 'This ticket is not part of the auction''s chit group';
    END IF;
    IF sub.status <> 'ACTIVE' OR sub.has_won_auction THEN
        RAISE EXCEPTION 'Only active members who have not already won can bid';
    END IF;

    SELECT * INTO grp FROM public.chit_groups WHERE id = auc.group_id;
    min_bid := ROUND(grp.total_value * grp.min_bid_discount_percent / 100, 2);
    max_bid := ROUND(grp.total_value * grp.max_bid_discount_percent / 100, 2);
    IF NEW.bid_discount_amount < min_bid OR NEW.bid_discount_amount > max_bid THEN
        RAISE EXCEPTION 'Bid must be between ₹% and ₹%', min_bid, max_bid;
    END IF;
    IF NEW.bid_discount_amount <= auc.winning_bid_discount THEN
        RAISE EXCEPTION 'Bid must be higher than the current highest bid of ₹%', auc.winning_bid_discount;
    END IF;

    NEW.group_id := auc.group_id;
    NEW.bid_timestamp := NOW();

    UPDATE public.auctions
    SET status = 'IN_PROGRESS',
        winning_bid_discount = NEW.bid_discount_amount,
        winning_subscriber_id = NEW.subscriber_id
    WHERE id = auc.id;

    RETURN NEW;
END;
$$;

CREATE TRIGGER validate_auction_bid
    BEFORE INSERT ON public.auction_bids
    FOR EACH ROW EXECUTE FUNCTION private.validate_auction_bid();

-- Payout safety: the bank account must belong to the winner and be verified
-- before approval, and funds can only be released after a checker has signed off.
CREATE FUNCTION private.validate_payout()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    winner_user UUID;
    acct public.customer_bank_accounts%ROWTYPE;
BEGIN
    SELECT s.user_id INTO winner_user
    FROM public.prizes pr
    JOIN public.chit_subscribers s ON s.id = pr.winner_subscriber_id
    WHERE pr.id = NEW.prize_id;

    IF NEW.bank_account_id IS NOT NULL THEN
        SELECT * INTO acct FROM public.customer_bank_accounts WHERE id = NEW.bank_account_id;
        IF acct.user_id IS DISTINCT FROM winner_user THEN
            RAISE EXCEPTION 'Payout bank account must belong to the auction winner';
        END IF;
    END IF;

    IF NEW.status IN ('MAKER_APPROVED', 'CHECKER_RELEASED')
       AND (NEW.bank_account_id IS NULL OR NOT acct.is_verified) THEN
        RAISE EXCEPTION 'A verified bank account is required before approving a payout';
    END IF;

    IF NEW.status = 'CHECKER_RELEASED' AND NOT EXISTS (
        SELECT 1 FROM public.payout_approvals
        WHERE payout_id = NEW.id AND status = 'CHECKER_PASSED'
    ) THEN
        RAISE EXCEPTION 'Funds can only be released after maker and checker approval';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER validate_payout
    BEFORE INSERT OR UPDATE ON public.payouts
    FOR EACH ROW EXECUTE FUNCTION private.validate_payout();

-- Maker-checker: once a maker has approved, only the checker fields can change,
-- and only once. Stops a checker re-pointing someone else's approval at another payout.
CREATE FUNCTION private.guard_payout_approval()
RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = ''
AS $$
BEGIN
    IF OLD.status <> 'MAKER_PASSED' THEN
        RAISE EXCEPTION 'This approval has already been signed off';
    END IF;
    IF NEW.payout_id IS DISTINCT FROM OLD.payout_id
       OR NEW.maker_user_id IS DISTINCT FROM OLD.maker_user_id
       OR NEW.maker_notes IS DISTINCT FROM OLD.maker_notes
       OR NEW.maker_approved_at IS DISTINCT FROM OLD.maker_approved_at THEN
        RAISE EXCEPTION 'Maker details cannot be changed after approval';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER guard_payout_approval
    BEFORE UPDATE ON public.payout_approvals
    FOR EACH ROW EXECUTE FUNCTION private.guard_payout_approval();

-- Append-only tables: block UPDATE, DELETE and TRUNCATE for everyone
CREATE FUNCTION private.prevent_modification()
RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = ''
AS $$
BEGIN
    RAISE EXCEPTION '% is append-only: records cannot be changed or deleted', TG_TABLE_NAME
        USING ERRCODE = '42501';
END;
$$;

CREATE TRIGGER prevent_modification BEFORE UPDATE OR DELETE ON public.ledger_entries
    FOR EACH ROW EXECUTE FUNCTION private.prevent_modification();
CREATE TRIGGER prevent_truncate BEFORE TRUNCATE ON public.ledger_entries
    FOR EACH STATEMENT EXECUTE FUNCTION private.prevent_modification();
CREATE TRIGGER prevent_modification BEFORE UPDATE OR DELETE ON public.audit_logs
    FOR EACH ROW EXECUTE FUNCTION private.prevent_modification();
CREATE TRIGGER prevent_truncate BEFORE TRUNCATE ON public.audit_logs
    FOR EACH STATEMENT EXECUTE FUNCTION private.prevent_modification();

-- ==============================================================================
-- RPC: customer joins a chit group (supabase.rpc('join_chit_group', { p_group_id }))
-- Picks the lowest free seat. Limits are enforced by enforce_subscriber_limits.
-- ==============================================================================
CREATE FUNCTION public.join_chit_group(p_group_id UUID)
RETURNS public.chit_subscribers
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    grp public.chit_groups%ROWTYPE;
    free_seat INT;
    new_sub public.chit_subscribers%ROWTYPE;
BEGIN
    IF (SELECT auth.uid()) IS NULL THEN
        RAISE EXCEPTION 'You must be signed in to join a chit group' USING ERRCODE = '42501';
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
    VALUES (grp.id, (SELECT auth.uid()), free_seat)
    RETURNING * INTO new_sub;

    RETURN new_sub;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.join_chit_group(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_chit_group(UUID) TO authenticated;

-- ==============================================================================
-- ROW LEVEL SECURITY
-- Role summary
--   SUPER_ADMIN      everything
--   FINANCE_MANAGER  installments, payments, reconciliation, prizes, payouts, ledger
--   KYC_OFFICER      KYC, KYC documents, bank account verification, nominees
--   SUPPORT_AGENT    support tickets
--   all staff        read access to profiles, groups, subscribers, schedules, payments
-- Writes not covered by a policy go through the service role (server only).
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_kyc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nominees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chit_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chit_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guarantors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS does not apply to TRUNCATE, so remove it from the API roles
REVOKE TRUNCATE ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

-- Financial records are never deleted through the API, whatever the role.
-- (Cancel or reverse them instead. The service role can still delete if ever required.)
REVOKE DELETE ON
    public.chit_subscribers, public.installments, public.payments, public.payment_reconciliations,
    public.auctions, public.auction_bids, public.prizes, public.payouts, public.payout_approvals,
    public.guarantors, public.documents, public.ledger_entries, public.audit_logs
FROM anon, authenticated;

-- ---------- profiles ----------
CREATE POLICY "Users view own profile, staff view all" ON public.profiles
    FOR SELECT TO authenticated
    USING (id = (SELECT auth.uid()) OR (SELECT private.is_staff()));

-- Role/status/email changes are blocked by the guard_profile_columns trigger
CREATE POLICY "Users update own profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING (id = (SELECT auth.uid()))
    WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Super admins update any profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING ((SELECT private.has_role('SUPER_ADMIN')))
    WITH CHECK ((SELECT private.has_role('SUPER_ADMIN')));

-- ---------- customer_kyc ----------
CREATE POLICY "Customers view own KYC" ON public.customer_kyc
    FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Customers submit own KYC" ON public.customer_kyc
    FOR INSERT TO authenticated
    WITH CHECK (
        user_id = (SELECT auth.uid())
        AND status IN ('NOT_SUBMITTED', 'PENDING_APPROVAL')
        AND verified_by IS NULL AND verified_at IS NULL
    );

-- Customers can edit and resubmit until the KYC is verified, but can't verify themselves
CREATE POLICY "Customers update own unverified KYC" ON public.customer_kyc
    FOR UPDATE TO authenticated
    USING (user_id = (SELECT auth.uid()) AND status <> 'VERIFIED')
    WITH CHECK (
        user_id = (SELECT auth.uid())
        AND status IN ('NOT_SUBMITTED', 'PENDING_APPROVAL')
        AND verified_by IS NULL AND verified_at IS NULL
    );

CREATE POLICY "KYC staff manage KYC" ON public.customer_kyc
    FOR ALL TO authenticated
    USING ((SELECT private.has_role('SUPER_ADMIN', 'KYC_OFFICER')))
    WITH CHECK ((SELECT private.has_role('SUPER_ADMIN', 'KYC_OFFICER')));

-- ---------- kyc_documents ----------
CREATE POLICY "Customers view own KYC documents" ON public.kyc_documents
    FOR SELECT TO authenticated
    USING (kyc_id IN (SELECT id FROM public.customer_kyc WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Customers upload documents to own unverified KYC" ON public.kyc_documents
    FOR INSERT TO authenticated
    WITH CHECK (kyc_id IN (
        SELECT id FROM public.customer_kyc
        WHERE user_id = (SELECT auth.uid()) AND status <> 'VERIFIED'
    ));

CREATE POLICY "Customers remove documents from own unverified KYC" ON public.kyc_documents
    FOR DELETE TO authenticated
    USING (kyc_id IN (
        SELECT id FROM public.customer_kyc
        WHERE user_id = (SELECT auth.uid()) AND status <> 'VERIFIED'
    ));

CREATE POLICY "KYC staff manage KYC documents" ON public.kyc_documents
    FOR ALL TO authenticated
    USING ((SELECT private.has_role('SUPER_ADMIN', 'KYC_OFFICER')))
    WITH CHECK ((SELECT private.has_role('SUPER_ADMIN', 'KYC_OFFICER')));

-- ---------- customer_bank_accounts ----------
CREATE POLICY "Customers view own bank accounts" ON public.customer_bank_accounts
    FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Customers add own unverified bank accounts" ON public.customer_bank_accounts
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()) AND NOT is_verified AND verified_by IS NULL);

-- Once verified, an account is locked so a payout can't be redirected
CREATE POLICY "Customers edit own unverified bank accounts" ON public.customer_bank_accounts
    FOR UPDATE TO authenticated
    USING (user_id = (SELECT auth.uid()) AND NOT is_verified)
    WITH CHECK (user_id = (SELECT auth.uid()) AND NOT is_verified AND verified_by IS NULL);

CREATE POLICY "Customers delete own unverified bank accounts" ON public.customer_bank_accounts
    FOR DELETE TO authenticated
    USING (user_id = (SELECT auth.uid()) AND NOT is_verified);

CREATE POLICY "Finance and KYC staff view bank accounts" ON public.customer_bank_accounts
    FOR SELECT TO authenticated
    USING ((SELECT private.has_role('SUPER_ADMIN', 'KYC_OFFICER', 'FINANCE_MANAGER')));

CREATE POLICY "KYC staff verify bank accounts" ON public.customer_bank_accounts
    FOR UPDATE TO authenticated
    USING ((SELECT private.has_role('SUPER_ADMIN', 'KYC_OFFICER')))
    WITH CHECK ((SELECT private.has_role('SUPER_ADMIN', 'KYC_OFFICER')));

-- ---------- nominees ----------
CREATE POLICY "Customers manage own nominees" ON public.nominees
    FOR ALL TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Staff view nominees" ON public.nominees
    FOR SELECT TO authenticated
    USING ((SELECT private.is_staff()));

CREATE POLICY "KYC staff manage nominees" ON public.nominees
    FOR ALL TO authenticated
    USING ((SELECT private.has_role('SUPER_ADMIN', 'KYC_OFFICER')))
    WITH CHECK ((SELECT private.has_role('SUPER_ADMIN', 'KYC_OFFICER')));

-- ---------- chit_groups ----------
-- Schemes are public so the marketing site can list them without login
CREATE POLICY "Anyone can view chit groups" ON public.chit_groups
    FOR SELECT TO anon, authenticated
    USING (TRUE);

CREATE POLICY "Super admins manage chit groups" ON public.chit_groups
    FOR ALL TO authenticated
    USING ((SELECT private.has_role('SUPER_ADMIN')))
    WITH CHECK ((SELECT private.has_role('SUPER_ADMIN')));

-- ---------- chit_subscribers ----------
-- Customers join through the join_chit_group() RPC, not direct inserts
CREATE POLICY "Customers view own tickets, staff view all" ON public.chit_subscribers
    FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid()) OR (SELECT private.is_staff()));

CREATE POLICY "Super admins manage subscribers" ON public.chit_subscribers
    FOR ALL TO authenticated
    USING ((SELECT private.has_role('SUPER_ADMIN')))
    WITH CHECK ((SELECT private.has_role('SUPER_ADMIN')));

-- ---------- installments ----------
CREATE POLICY "Customers view own installments, staff view all" ON public.installments
    FOR SELECT TO authenticated
    USING (
        subscriber_id IN (SELECT private.my_subscriber_ids())
        OR (SELECT private.is_staff())
    );

CREATE POLICY "Finance staff manage installments" ON public.installments
    FOR ALL TO authenticated
    USING ((SELECT private.has_role('SUPER_ADMIN', 'FINANCE_MANAGER')))
    WITH CHECK ((SELECT private.has_role('SUPER_ADMIN', 'FINANCE_MANAGER')));

-- ---------- payments ----------
-- Online payments are inserted/confirmed by the server (gateway webhook, service role)
CREATE POLICY "Customers view own payments, staff view all" ON public.payments
    FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid()) OR (SELECT private.is_staff()));

CREATE POLICY "Finance staff record payments" ON public.payments
    FOR INSERT TO authenticated
    WITH CHECK (
        (SELECT private.has_role('SUPER_ADMIN', 'FINANCE_MANAGER'))
        AND recorded_by = (SELECT auth.uid())
    );

CREATE POLICY "Finance staff update payments" ON public.payments
    FOR UPDATE TO authenticated
    USING ((SELECT private.has_role('SUPER_ADMIN', 'FINANCE_MANAGER')))
    WITH CHECK ((SELECT private.has_role('SUPER_ADMIN', 'FINANCE_MANAGER')));

-- ---------- payment_reconciliations ----------
CREATE POLICY "Finance staff view reconciliations" ON public.payment_reconciliations
    FOR SELECT TO authenticated
    USING ((SELECT private.has_role('SUPER_ADMIN', 'FINANCE_MANAGER')));

CREATE POLICY "Finance staff reconcile payments" ON public.payment_reconciliations
    FOR INSERT TO authenticated
    WITH CHECK (
        (SELECT private.has_role('SUPER_ADMIN', 'FINANCE_MANAGER'))
        AND matched_by = (SELECT auth.uid())
    );

-- ---------- auctions ----------
CREATE POLICY "Group members and staff view auctions" ON public.auctions
    FOR SELECT TO authenticated
    USING (group_id IN (SELECT private.my_group_ids()) OR (SELECT private.is_staff()));

CREATE POLICY "Super admins manage auctions" ON public.auctions
    FOR ALL TO authenticated
    USING ((SELECT private.has_role('SUPER_ADMIN')))
    WITH CHECK ((SELECT private.has_role('SUPER_ADMIN')));

-- ---------- auction_bids ----------
-- Open auction: members of the group can see all bids in it. Bids can't be edited or withdrawn.
CREATE POLICY "Group members and staff view bids" ON public.auction_bids
    FOR SELECT TO authenticated
    USING (group_id IN (SELECT private.my_group_ids()) OR (SELECT private.is_staff()));

CREATE POLICY "Customers bid with own tickets" ON public.auction_bids
    FOR INSERT TO authenticated
    WITH CHECK (subscriber_id IN (SELECT private.my_subscriber_ids()));

-- ---------- prizes ----------
CREATE POLICY "Winners and staff view prizes" ON public.prizes
    FOR SELECT TO authenticated
    USING (winner_subscriber_id IN (SELECT private.my_subscriber_ids()) OR (SELECT private.is_staff()));

CREATE POLICY "Finance staff manage prizes" ON public.prizes
    FOR ALL TO authenticated
    USING ((SELECT private.has_role('SUPER_ADMIN', 'FINANCE_MANAGER')))
    WITH CHECK ((SELECT private.has_role('SUPER_ADMIN', 'FINANCE_MANAGER')));

-- ---------- payouts ----------
CREATE POLICY "Winners view own payouts" ON public.payouts
    FOR SELECT TO authenticated
    USING (id IN (SELECT private.my_payout_ids()));

CREATE POLICY "Finance staff manage payouts" ON public.payouts
    FOR ALL TO authenticated
    USING ((SELECT private.has_role('SUPER_ADMIN', 'FINANCE_MANAGER')))
    WITH CHECK ((SELECT private.has_role('SUPER_ADMIN', 'FINANCE_MANAGER')));

-- ---------- payout_approvals ----------
CREATE POLICY "Finance staff view approvals" ON public.payout_approvals
    FOR SELECT TO authenticated
    USING ((SELECT private.has_role('SUPER_ADMIN', 'FINANCE_MANAGER')));

CREATE POLICY "Finance staff create approvals as maker" ON public.payout_approvals
    FOR INSERT TO authenticated
    WITH CHECK (
        (SELECT private.has_role('SUPER_ADMIN', 'FINANCE_MANAGER'))
        AND maker_user_id = (SELECT auth.uid())
        AND checker_user_id IS NULL
    );

-- The checker signs off on someone else's approval (maker <> checker is also a CHECK constraint)
CREATE POLICY "Finance staff sign off as checker" ON public.payout_approvals
    FOR UPDATE TO authenticated
    USING (
        (SELECT private.has_role('SUPER_ADMIN', 'FINANCE_MANAGER'))
        AND maker_user_id <> (SELECT auth.uid())
    )
    WITH CHECK (
        (SELECT private.has_role('SUPER_ADMIN', 'FINANCE_MANAGER'))
        AND checker_user_id = (SELECT auth.uid())
    );

-- ---------- guarantors ----------
CREATE POLICY "Winners view own guarantors" ON public.guarantors
    FOR SELECT TO authenticated
    USING (payout_id IN (SELECT private.my_payout_ids()));

CREATE POLICY "Winners add guarantors to own payouts" ON public.guarantors
    FOR INSERT TO authenticated
    WITH CHECK (payout_id IN (SELECT private.my_payout_ids()) AND NOT verified AND verified_by IS NULL);

CREATE POLICY "Finance staff manage guarantors" ON public.guarantors
    FOR ALL TO authenticated
    USING ((SELECT private.has_role('SUPER_ADMIN', 'FINANCE_MANAGER')))
    WITH CHECK ((SELECT private.has_role('SUPER_ADMIN', 'FINANCE_MANAGER')));

-- ---------- documents ----------
CREATE POLICY "Customers view own documents, staff view all" ON public.documents
    FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid()) OR (SELECT private.is_staff()));

CREATE POLICY "Finance staff manage documents" ON public.documents
    FOR ALL TO authenticated
    USING ((SELECT private.has_role('SUPER_ADMIN', 'FINANCE_MANAGER')))
    WITH CHECK ((SELECT private.has_role('SUPER_ADMIN', 'FINANCE_MANAGER')));

-- ---------- notifications ----------
CREATE POLICY "Users view own notifications" ON public.notifications
    FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users mark own notifications read" ON public.notifications
    FOR UPDATE TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users delete own notifications" ON public.notifications
    FOR DELETE TO authenticated
    USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Staff send notifications" ON public.notifications
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT private.is_staff()));

-- ---------- ledger_entries ----------
CREATE POLICY "Finance staff view ledger" ON public.ledger_entries
    FOR SELECT TO authenticated
    USING ((SELECT private.has_role('SUPER_ADMIN', 'FINANCE_MANAGER')));

CREATE POLICY "Finance staff post ledger entries" ON public.ledger_entries
    FOR INSERT TO authenticated
    WITH CHECK (
        (SELECT private.has_role('SUPER_ADMIN', 'FINANCE_MANAGER'))
        AND created_by = (SELECT auth.uid())
    );

-- ---------- support_tickets ----------
CREATE POLICY "Customers view own tickets" ON public.support_tickets
    FOR SELECT TO authenticated
    USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Customers open tickets" ON public.support_tickets
    FOR INSERT TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()) AND status = 'OPEN' AND assigned_to IS NULL);

CREATE POLICY "Staff view tickets" ON public.support_tickets
    FOR SELECT TO authenticated
    USING ((SELECT private.is_staff()));

CREATE POLICY "Support staff manage tickets" ON public.support_tickets
    FOR UPDATE TO authenticated
    USING ((SELECT private.has_role('SUPER_ADMIN', 'SUPPORT_AGENT')))
    WITH CHECK ((SELECT private.has_role('SUPER_ADMIN', 'SUPPORT_AGENT')));

-- ---------- support_ticket_messages ----------
CREATE POLICY "Customers view messages on own tickets" ON public.support_ticket_messages
    FOR SELECT TO authenticated
    USING (ticket_id IN (SELECT id FROM public.support_tickets WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Customers reply on own tickets" ON public.support_ticket_messages
    FOR INSERT TO authenticated
    WITH CHECK (
        sender_id = (SELECT auth.uid())
        AND sender_type = 'CUSTOMER'
        AND ticket_id IN (SELECT id FROM public.support_tickets WHERE user_id = (SELECT auth.uid()))
    );

CREATE POLICY "Staff view ticket messages" ON public.support_ticket_messages
    FOR SELECT TO authenticated
    USING ((SELECT private.is_staff()));

CREATE POLICY "Support staff reply on tickets" ON public.support_ticket_messages
    FOR INSERT TO authenticated
    WITH CHECK (
        (SELECT private.has_role('SUPER_ADMIN', 'SUPPORT_AGENT'))
        AND sender_id = (SELECT auth.uid())
        AND sender_type = 'SUPPORT'
    );

-- ---------- audit_logs ----------
-- Any signed-in user can write a log entry as themselves; only super admins can read them
CREATE POLICY "Users write own audit entries" ON public.audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (actor_id = (SELECT auth.uid()));

CREATE POLICY "Super admins view audit logs" ON public.audit_logs
    FOR SELECT TO authenticated
    USING ((SELECT private.has_role('SUPER_ADMIN')));

-- ==============================================================================
-- STORAGE: private bucket for KYC files
-- Upload to the path '<user id>/<file name>', e.g. `${user.id}/pan.jpg`.
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', FALSE)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Customers upload own KYC files" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'kyc-documents'
        AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
    );

CREATE POLICY "Customers and KYC staff read KYC files" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'kyc-documents'
        AND (
            (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
            OR (SELECT private.has_role('SUPER_ADMIN', 'KYC_OFFICER'))
        )
    );

CREATE POLICY "Customers delete own KYC files" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'kyc-documents'
        AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT
    );
