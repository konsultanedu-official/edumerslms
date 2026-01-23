-- =====================================================
-- EDUMERS LMS - Phase 1.1 Refactor
-- Focus: Schedule Types (Weekday, Weekend, Everyday) & Duration Logic
-- =====================================================

-- 1. Create Schedule Type Enum
CREATE TYPE private_class_schedule_type AS ENUM ('weekday', 'weekend', 'everyday');

-- 2. Add schedule_type to packages
ALTER TABLE private_class_packages
ADD COLUMN schedule_type private_class_schedule_type NOT NULL DEFAULT 'weekday';

-- 3. Update calculate_end_date function to handle schedule types
CREATE OR REPLACE FUNCTION calculate_end_date(
    p_start_date DATE,
    p_working_days INTEGER,
    p_schedule_type private_class_schedule_type
) RETURNS DATE AS $$
DECLARE
    v_current_date DATE := p_start_date;
    v_days_counted INTEGER := 0;
    v_dow INTEGER; -- Day of week (0=Sunday, 6=Saturday)
BEGIN
    -- Loop untill we have counted enough "working" days
    WHILE v_days_counted < p_working_days LOOP
        v_current_date := v_current_date + 1; -- Move to next day
        v_dow := EXTRACT(DOW FROM v_current_date);
        
        -- Check Logic based on Schedule Type
        IF p_schedule_type = 'weekday' THEN
            -- Weekday: Skip Sat (6) and Sun (0)
            IF v_dow NOT IN (0, 6) THEN
                -- Check Holidays
                IF NOT EXISTS (SELECT 1 FROM holidays WHERE date = v_current_date) THEN
                    v_days_counted := v_days_counted + 1;
                END IF;
            END IF;
            
        ELSIF p_schedule_type = 'weekend' THEN
            -- Weekend: Only count Sat (6) and Sun (0)
            IF v_dow IN (0, 6) THEN
                -- Check Holidays
                IF NOT EXISTS (SELECT 1 FROM holidays WHERE date = v_current_date) THEN
                    v_days_counted := v_days_counted + 1;
                END IF;
            END IF;
            
        ELSIF p_schedule_type = 'everyday' THEN
            -- Everyday: Count all days except Holidays
            IF NOT EXISTS (SELECT 1 FROM holidays WHERE date = v_current_date) THEN
                v_days_counted := v_days_counted + 1;
            END IF;
        END IF;
        
    END LOOP;
    
    RETURN v_current_date;
END;
$$ LANGUAGE plpgsql;
