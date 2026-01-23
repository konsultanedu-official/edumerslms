-- =====================================================
-- EDUMERS LMS - Phase 1.3 Refactor
-- Focus: RDN Service Separation
-- =====================================================

-- 1. Add 'rdn' to service_type enum
ALTER TYPE service_type ADD VALUE IF NOT EXISTS 'rdn';

-- 2. Create RDN Projects Table
-- RDN is "Layanan Data Sekunder", structure differs from Private Class
CREATE TABLE rdn_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES tutor_profiles(id) ON DELETE SET NULL,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    
    -- Project Details
    title TEXT NOT NULL,
    variable_count INTEGER DEFAULT 0,
    company_count INTEGER DEFAULT 0,
    period_years INTEGER DEFAULT 0,
    software_used VARCHAR(100), -- e.g. SPSS, Eviews, Stata
    
    -- Status & Dates
    status private_class_status DEFAULT 'pending_payment', -- Reusing generic status enum or create new if needed
    start_date DATE,
    end_date DATE,
    
    -- Financials (Fixed price based on complexity, not time)
    price DECIMAL(12,2) DEFAULT 0,
    tutor_fee DECIMAL(12,2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rdn_student ON rdn_projects(student_id);
CREATE INDEX idx_rdn_tutor ON rdn_projects(tutor_id);
CREATE INDEX idx_rdn_status ON rdn_projects(status);

-- 3. RLS for RDN Projects
ALTER TABLE rdn_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage rdn" ON rdn_projects
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Student view own rdn" ON rdn_projects
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Tutor view assigned rdn" ON rdn_projects
    FOR SELECT USING (tutor_id = auth.uid());
