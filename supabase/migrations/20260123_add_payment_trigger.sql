-- =====================================================
-- EDUMERS LMS - Phase 4: Finance & Commission Engine
-- =====================================================

-- 1. Trigger Function: Process Payment Confirmation
-- This function runs when a transaction is marked as 'paid'.
-- It updates the service status and records ledger entries.

CREATE OR REPLACE FUNCTION process_payment_confirmation()
RETURNS TRIGGER AS $$
DECLARE
    v_class_id UUID;
    v_student_id UUID;
    v_tutor_id UUID;
    v_package_id UUID;
    v_package_price DECIMAL(12,2);
    v_tutor_status tutor_status;
    v_split_percentage DECIMAL(5,2);
    v_tutor_share DECIMAL(12,2) := 0;
    v_platform_share DECIMAL(12,2) := 0;
BEGIN
    -- Only handle 'private_class' for now (expand for courses later)
    IF NEW.service_type = 'private_class' THEN
        
        -- Get Class Details
        SELECT id, student_id, tutor_id, package_id 
        INTO v_class_id, v_student_id, v_tutor_id, v_package_id
        FROM private_classes
        WHERE id = NEW.service_id;

        IF NOT FOUND THEN
            -- Service removed? Just return.
            RETURN NEW;
        END IF;

        -- Update Class Status (if it was pending payment)
        UPDATE private_classes
        SET status = 'pending_match', 
            updated_at = NOW()
        WHERE id = v_class_id AND status = 'pending_payment';

        -- LEDGER LOGIC
        -- 1. If Tutor IS assigned (Rare for initial package purchase, but possible), calculate split immediately
        -- 2. If Tutor IS NOT assigned, credit full amount to Platform (Pending allocation handled later or treated as gross revenue)
        
        IF v_tutor_id IS NOT NULL THEN
            -- Fetch Tutor Status for Split Rate
            SELECT status INTO v_tutor_status FROM tutor_profiles WHERE id = v_tutor_id;
            
            -- Get Split Percentage based on active/intern
            -- Default to 50% if not found, or handle error. 
            -- Mapping: 'active' -> 'tutor_permanent', 'intern' -> 'tutor_intern'
            SELECT percentage_split INTO v_split_percentage
            FROM fee_configurations
            WHERE role_type = CASE 
                WHEN v_tutor_status = 'active' THEN 'tutor_permanent'
                WHEN v_tutor_status = 'intern' THEN 'tutor_intern'
                ELSE 'tutor_permanent' -- Fallback
            END;

            IF v_split_percentage IS NULL THEN
                v_split_percentage := 50.00; -- Safety fallback
            END IF;

            v_tutor_share := NEW.amount * (v_split_percentage / 100);
            v_platform_share := NEW.amount - v_tutor_share;

            -- Credit Tutor
            INSERT INTO ledger_entries (transaction_id, user_id, type, amount, description)
            VALUES (NEW.id, v_tutor_id, 'income_tutor', v_tutor_share, 'Fee Share for Transaction ' || NEW.invoice_number);

            -- Credit Platform
            INSERT INTO ledger_entries (transaction_id, user_id, type, amount, description)
            VALUES (NEW.id, NULL, 'income_platform', v_platform_share, 'Platform Share (Split) - ' || NEW.invoice_number);

        ELSE
            -- No Tutor yet (Standard Flow) -> All to Platform for now
            INSERT INTO ledger_entries (transaction_id, user_id, type, amount, description)
            VALUES (NEW.id, NULL, 'income_platform', NEW.amount, 'Full Payment Received (Pending Allocation) - ' || NEW.invoice_number);
        END IF;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create Trigger
DROP TRIGGER IF EXISTS on_transaction_paid ON transactions;

CREATE TRIGGER on_transaction_paid
AFTER UPDATE OF status ON transactions
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'paid')
EXECUTE FUNCTION process_payment_confirmation();
