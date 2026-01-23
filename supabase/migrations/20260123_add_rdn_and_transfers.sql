-- =====================================================
-- EDUMERS LMS - Phase 1.2 Refactor
-- Focus: RDN Service Details & Tutor Transfer History
-- =====================================================

-- 1. Add service_details to private_classes
-- This will store dynamic data like {"variable_count": 5, "company_count": 10, "year_period": 3} for RDN
ALTER TABLE private_classes
ADD COLUMN service_details JSONB DEFAULT '{}'::jsonb;

-- 2. Create Tutor Transitions Table (Data Peralihan)
CREATE TABLE tutor_transitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    private_class_id UUID REFERENCES private_classes(id) ON DELETE CASCADE,
    previous_tutor_id UUID REFERENCES tutor_profiles(id) ON DELETE SET NULL,
    new_tutor_id UUID REFERENCES tutor_profiles(id) ON DELETE SET NULL,
    transition_date TIMESTAMPTZ DEFAULT NOW(),
    reason TEXT,
    transfer_fee DECIMAL(12,2) DEFAULT 0, -- Fee Peralihan (deducted or added depending on logic)
    processed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transitions_class ON tutor_transitions(private_class_id);
CREATE INDEX idx_transitions_prev_tutor ON tutor_transitions(previous_tutor_id);
CREATE INDEX idx_transitions_new_tutor ON tutor_transitions(new_tutor_id);

-- 3. RLS for Transitions
ALTER TABLE tutor_transitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage transitions" ON tutor_transitions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Tutors view own transitions" ON tutor_transitions
    FOR SELECT USING (
        previous_tutor_id = auth.uid() OR new_tutor_id = auth.uid()
    );
