-- =====================================================
-- EDUMERS LMS - Phase 1 Refactor
-- Focus: Dynamic Fee Splitting, Tiered Pricing, Admin Roles
-- =====================================================

-- 1. ENUMS Refinement
-- Enhance user roles (granular admin roles will be handled via a separate table or column, but expanding enum is good practice if supported)
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
-- Note: Other admin roles (finance, hr, etc.) will be handled as logical roles, not Postgres ENUMs, to allow multi-role flexibility.

-- 2. TIERED PRICING (Refactor private_class_packages)
-- Remove single price, add tiered prices
ALTER TABLE private_class_packages
DROP COLUMN price,
DROP COLUMN tutor_fee_permanent,
DROP COLUMN tutor_fee_intern,
ADD COLUMN price_s1 DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN price_s2 DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN price_s3 DECIMAL(12,2) NOT NULL DEFAULT 0;

-- 3. FEE CONFIGURATIONS (Global Rules)
CREATE TABLE fee_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_type VARCHAR(50) NOT NULL, -- 'tutor_permanent', 'tutor_intern'
    percentage_split DECIMAL(5,2) NOT NULL CHECK (percentage_split >= 0 AND percentage_split <= 100), -- e.g., 50.00, 40.00
    description TEXT,
    updated_by UUID REFERENCES profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Fee Configs
INSERT INTO fee_configurations (role_type, percentage_split, description) VALUES
('tutor_permanent', 50.00, 'Tutor Tetap Split (50%)'),
('tutor_intern', 40.00, 'Tutor Magang Split (40%)');

-- 4. ADMIN BONUS RULES
CREATE TABLE admin_bonus_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    min_daily_revenue DECIMAL(12,2) NOT NULL,
    max_daily_revenue DECIMAL(12,2), -- NULL means infinity
    bonus_amount DECIMAL(12,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Bonus Rules (Example from Brief)
INSERT INTO admin_bonus_rules (min_daily_revenue, max_daily_revenue, bonus_amount) VALUES
(500000, 600000, 20000);

-- 5. ADMIN ROLES (Granular Access)
-- Create a separate table to handle multiple roles per admin
CREATE TABLE admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role_name VARCHAR(50) NOT NULL CHECK (role_name IN ('super_admin', 'hr', 'finance', 'closing', 'data')),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(admin_id, role_name)
);

-- 6. LEDGER SYSTEM (Money Tracking)
CREATE TYPE ledger_type AS ENUM ('income_platform', 'income_tutor', 'payout_tutor', 'bonus_admin', 'refund');

CREATE TABLE ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL, -- Link to source transaction
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Owner of the money (Tutor ID, Admin ID, or NULL for Platform)
    type ledger_type NOT NULL,
    amount DECIMAL(12,2) NOT NULL, -- Positive = Credit, Negative = Debit
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ledger_user ON ledger_entries(user_id);
CREATE INDEX idx_ledger_type ON ledger_entries(type);

-- 7. SECURITY (RLS Updates)
ALTER TABLE fee_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_bonus_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;

-- Fee Configs: Only Super Admin can edit
CREATE POLICY "Super Admin manage fees" ON fee_configurations
    FOR ALL USING (
        EXISTS (SELECT 1 FROM admin_roles WHERE admin_id = auth.uid() AND role_name = 'super_admin')
    );

-- Ledger: Users view their own entries, Finance Admin views all
CREATE POLICY "View own ledger" ON ledger_entries
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Finance Admin view all ledger" ON ledger_entries
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM admin_roles WHERE admin_id = auth.uid() AND role_name IN ('super_admin', 'finance'))
    );
