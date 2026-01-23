-- =====================================================
-- EDUMERS LMS - Phase 2.1 Pricing Logic
-- Focus: Dynamic Price Calculation
-- =====================================================

-- Function to get price based on Student Degree
CREATE OR REPLACE FUNCTION get_package_price(
    p_package_id UUID,
    p_student_id UUID
) RETURNS DECIMAL(12,2) AS $$
DECLARE
    v_degree degree_level;
    v_price DECIMAL(12,2);
BEGIN
    -- 1. Get Student Degree
    SELECT degree_level INTO v_degree
    FROM student_profiles
    WHERE id = p_student_id;
    
    -- If no student found or no degree, default to S1 (or handle error)
    IF v_degree IS NULL THEN
        v_degree := 's1';
    END IF;

    -- 2. Get Price based on degree
    SELECT 
        CASE 
            WHEN v_degree = 's1' THEN price_s1
            WHEN v_degree = 's2' THEN price_s2
            WHEN v_degree = 's3' THEN price_s3
            ELSE price_s1 -- Fallback
        END INTO v_price
    FROM private_class_packages
    WHERE id = p_package_id;

    RETURN v_price;
END;
$$ LANGUAGE plpgsql;
