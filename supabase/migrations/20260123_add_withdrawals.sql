-- =====================================================
-- EDUMERS LMS - Phase 4.2: Withdrawal System
-- =====================================================

-- 1. Withdrawal Status Enum
DO $$ BEGIN
    CREATE TYPE withdrawal_status AS ENUM ('pending', 'approved', 'rejected', 'paid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Withdrawal Requests Table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    bank_details JSONB, -- Stores bank name, account number, holder name at time of request
    status withdrawal_status DEFAULT 'pending',
    proof_url TEXT, -- URL to transfer receipt image
    payment_date TIMESTAMPTZ,
    admin_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_withdrawals_tutor ON withdrawal_requests(tutor_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawal_requests(status);

-- 4. RLS Policies
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Admin Policy
CREATE POLICY "Admins can manage all withdrawals" ON withdrawal_requests
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Tutor Policy (View Own)
CREATE POLICY "Tutors can view own withdrawals" ON withdrawal_requests
    FOR SELECT USING (tutor_id = auth.uid());

-- Tutor Policy (Create Own)
CREATE POLICY "Tutors can create withdrawals" ON withdrawal_requests
    FOR INSERT WITH CHECK (tutor_id = auth.uid());
