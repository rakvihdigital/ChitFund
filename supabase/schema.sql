-- ==============================================================================
-- RAKVIH DIGITAL CHIT FUND MANAGEMENT PLATFORM
-- SUPABASE POSTGRESQL DATABASE SCHEMA
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Types
CREATE TYPE kyc_status_type AS ENUM ('NOT_SUBMITTED', 'PENDING_APPROVAL', 'VERIFIED', 'REJECTED');
CREATE TYPE group_status_type AS ENUM ('RECRUITING', 'ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE subscriber_status_type AS ENUM ('ACTIVE', 'DEFAULTED', 'PAID_OUT', 'WITHDRAWN');
CREATE TYPE installment_status_type AS ENUM ('UPCOMING', 'DUE', 'PAID', 'OVERDUE', 'PARTIAL');
CREATE TYPE payment_mode_type AS ENUM ('UPI', 'NET_BANKING', 'DEBIT_CARD', 'CREDIT_CARD', 'BANK_TRANSFER', 'CHEQUE', 'CASH');
CREATE TYPE payment_status_type AS ENUM ('SUCCESS', 'PENDING', 'FAILED', 'RECONCILED');
CREATE TYPE auction_status_type AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE payout_status_type AS ENUM ('REQUESTED', 'GUARANTOR_PENDING', 'MAKER_APPROVED', 'CHECKER_RELEASED', 'REJECTED');
CREATE TYPE user_role_type AS ENUM ('CUSTOMER', 'SUPER_ADMIN', 'FINANCE_MANAGER', 'KYC_OFFICER', 'SUPPORT_AGENT');

-- 1. Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    role user_role_type DEFAULT 'CUSTOMER',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Customer KYC Table
CREATE TABLE public.customer_kyc (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    pan_number VARCHAR(10) UNIQUE,
    aadhaar_number VARCHAR(12) UNIQUE,
    status kyc_status_type DEFAULT 'NOT_SUBMITTED',
    rejection_reason TEXT,
    verified_by UUID REFERENCES public.profiles(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. KYC Documents Table
CREATE TABLE public.kyc_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kyc_id UUID REFERENCES public.customer_kyc(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL, -- 'PAN_CARD', 'AADHAAR_FRONT', 'AADHAAR_BACK', 'PHOTOGRAPH', 'SIGNATURE', 'BANK_PROOF'
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    mime_type TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Customer Bank Accounts Table
CREATE TABLE public.customer_bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    account_holder_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    ifsc_code VARCHAR(11) NOT NULL,
    bank_name TEXT NOT NULL,
    branch_name TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Nominees Table
CREATE TABLE public.nominees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    nominee_name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    phone_number VARCHAR(15),
    id_proof_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Chit Groups Table
CREATE TABLE public.chit_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_code VARCHAR(20) UNIQUE NOT NULL, -- e.g., RAK-CHIT-100K-01
    group_name TEXT NOT NULL,
    total_value NUMERIC(12, 2) NOT NULL, -- Total Chit Value e.g. 100000
    duration_months INT NOT NULL, -- e.g. 20
    monthly_contribution NUMERIC(12, 2) NOT NULL, -- e.g. 5000
    total_members INT NOT NULL, -- e.g. 20
    max_tickets_per_person INT DEFAULT 3, -- Max tickets a single subscriber can hold in this scheme
    foreman_commission_percent NUMERIC(5, 2) DEFAULT 5.00, -- 5% per regulations
    min_bid_discount_percent NUMERIC(5, 2) DEFAULT 5.00,
    max_bid_discount_percent NUMERIC(5, 2) DEFAULT 30.00,
    start_date DATE,
    status group_status_type DEFAULT 'RECRUITING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Chit Subscribers Table
CREATE TABLE public.chit_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES public.chit_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    seat_number INT NOT NULL, -- 1 to total_members
    status subscriber_status_type DEFAULT 'ACTIVE',
    has_won_auction BOOLEAN DEFAULT FALSE,
    won_auction_month INT,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, seat_number)
    -- Note: Single user can hold up to max_tickets_per_person seats in this group
);

-- 8. Installments Schedule Table
CREATE TABLE public.installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES public.chit_groups(id) ON DELETE CASCADE,
    subscriber_id UUID REFERENCES public.chit_subscribers(id) ON DELETE CASCADE,
    month_number INT NOT NULL,
    due_date DATE NOT NULL,
    gross_amount NUMERIC(12, 2) NOT NULL, -- ₹5,000
    dividend_discount NUMERIC(12, 2) DEFAULT 0.00, -- Calculated from previous auction
    net_payable NUMERIC(12, 2) NOT NULL, -- gross_amount - dividend_discount
    penalty_amount NUMERIC(12, 2) DEFAULT 0.00,
    paid_amount NUMERIC(12, 2) DEFAULT 0.00,
    status installment_status_type DEFAULT 'UPCOMING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Payments Table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_ref VARCHAR(50) UNIQUE NOT NULL,
    installment_id UUID REFERENCES public.installments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id),
    amount_paid NUMERIC(12, 2) NOT NULL,
    payment_mode payment_mode_type NOT NULL,
    payment_gateway TEXT DEFAULT 'RAZORPAY', -- or 'CASHFREE', 'BANK'
    gateway_payment_id TEXT,
    gateway_order_id TEXT,
    receipt_number VARCHAR(30) UNIQUE NOT NULL,
    status payment_status_type DEFAULT 'SUCCESS',
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Payment Reconciliations Table
CREATE TABLE public.payment_reconciliations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES public.payments(id),
    bank_settlement_id TEXT,
    settlement_date DATE,
    settled_amount NUMERIC(12, 2),
    gateway_fee NUMERIC(12, 2),
    matched_by UUID REFERENCES public.profiles(id),
    matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Auctions Table
CREATE TABLE public.auctions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES public.chit_groups(id) ON DELETE CASCADE,
    month_number INT NOT NULL,
    auction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status auction_status_type DEFAULT 'SCHEDULED',
    winning_bid_discount NUMERIC(12, 2) DEFAULT 0.00,
    winning_subscriber_id UUID REFERENCES public.chit_subscribers(id),
    foreman_fee NUMERIC(12, 2) DEFAULT 0.00,
    total_dividend_pool NUMERIC(12, 2) DEFAULT 0.00,
    dividend_per_member NUMERIC(12, 2) DEFAULT 0.00,
    net_prize_amount NUMERIC(12, 2) DEFAULT 0.00,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(group_id, month_number)
);

-- 12. Auction Bids Table
CREATE TABLE public.auction_bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE,
    subscriber_id UUID REFERENCES public.chit_subscribers(id),
    bid_discount_amount NUMERIC(12, 2) NOT NULL, -- e.g. member offers ₹20,000 discount
    bid_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Prizes Table
CREATE TABLE public.prizes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id UUID UNIQUE REFERENCES public.auctions(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.chit_groups(id),
    winner_subscriber_id UUID REFERENCES public.chit_subscribers(id),
    total_chit_value NUMERIC(12, 2) NOT NULL,
    bid_discount NUMERIC(12, 2) NOT NULL,
    foreman_commission NUMERIC(12, 2) NOT NULL,
    net_payout_amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Payouts Table
CREATE TABLE public.payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prize_id UUID REFERENCES public.prizes(id) ON DELETE CASCADE,
    winner_subscriber_id UUID REFERENCES public.chit_subscribers(id),
    bank_account_id UUID REFERENCES public.customer_bank_accounts(id),
    status payout_status_type DEFAULT 'REQUESTED',
    payout_ref VARCHAR(40),
    disbursed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Payout Approvals (Maker-Checker Workflow)
CREATE TABLE public.payout_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payout_id UUID REFERENCES public.payouts(id) ON DELETE CASCADE,
    maker_user_id UUID REFERENCES public.profiles(id), -- Finance maker
    maker_notes TEXT,
    maker_approved_at TIMESTAMP WITH TIME ZONE,
    checker_user_id UUID REFERENCES public.profiles(id), -- Finance checker / Super Admin
    checker_notes TEXT,
    checker_approved_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL -- 'MAKER_PASSED', 'CHECKER_PASSED', 'REJECTED'
);

-- 16. Guarantors & Security Table
CREATE TABLE public.guarantors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payout_id UUID REFERENCES public.payouts(id) ON DELETE CASCADE,
    guarantor_name TEXT NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    relationship TEXT NOT NULL,
    occupation TEXT,
    monthly_income NUMERIC(12, 2),
    document_type TEXT NOT NULL, -- 'PROPERTY_DEED', 'SALARY_SLIP', 'PROMISSORY_NOTE', 'CHEQUE'
    document_ref TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. Digital Documents Table
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    group_id UUID REFERENCES public.chit_groups(id),
    document_type TEXT NOT NULL, -- 'RECEIPT', 'CHIT_AGREEMENT', 'STATEMENT', 'COMPLETION_CERTIFICATE'
    title TEXT NOT NULL,
    file_path TEXT,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. Notifications Table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    channel TEXT DEFAULT 'IN_APP', -- 'IN_APP', 'SMS', 'EMAIL', 'PUSH'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. Ledger Entries Table (Accounting)
CREATE TABLE public.ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_number VARCHAR(30) UNIQUE NOT NULL,
    group_id UUID REFERENCES public.chit_groups(id),
    user_id UUID REFERENCES public.profiles(id),
    account_type TEXT NOT NULL, -- 'COLLECTION', 'PRIZE_DISBURSEMENT', 'FOREMAN_COMMISSION', 'DIVIDEND_CREDIT', 'PENALTY'
    debit_amount NUMERIC(12, 2) DEFAULT 0.00,
    credit_amount NUMERIC(12, 2) DEFAULT 0.00,
    narration TEXT NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 20. Support Tickets Table
CREATE TABLE public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_code VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    category TEXT NOT NULL, -- 'PAYMENT', 'AUCTION', 'KYC', 'PAYOUT', 'OTHER'
    priority TEXT DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
    status TEXT DEFAULT 'OPEN', -- 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'
    assigned_to UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 21. Admin Roles & Permissions Table
CREATE TABLE public.admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_name user_role_type NOT NULL,
    can_approve_kyc BOOLEAN DEFAULT FALSE,
    can_conduct_auction BOOLEAN DEFAULT FALSE,
    can_approve_payout_maker BOOLEAN DEFAULT FALSE,
    can_approve_payout_checker BOOLEAN DEFAULT FALSE,
    can_access_accounting BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 22. Audit Logs Table (Immutable Log)
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL, -- e.g., 'KYC_APPROVED', 'AUCTION_WINNER_DECLARED', 'PAYOUT_CHECKER_RELEASED'
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    ip_address VARCHAR(45),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies Setup
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_kyc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Base Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Customers can view own KYC" ON public.customer_kyc FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Customers can view own installments" ON public.installments FOR SELECT USING (
    subscriber_id IN (SELECT id FROM public.chit_subscribers WHERE user_id = auth.uid())
);

CREATE POLICY "Customers can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
