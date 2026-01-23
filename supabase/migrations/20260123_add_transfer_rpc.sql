-- Add migration to create process_tutor_transfer function

CREATE OR REPLACE FUNCTION process_tutor_transfer(
  p_class_id UUID,
  p_new_tutor_id UUID,
  p_reason TEXT,
  p_transfer_fee DECIMAL DEFAULT 0,
  p_created_by UUID DEFAULT auth.uid()
) RETURNS VOID AS $$
DECLARE
  v_old_tutor_id UUID;
  v_student_id UUID;
BEGIN
  -- 1. Get current info
  SELECT tutor_id, student_id INTO v_old_tutor_id, v_student_id
  FROM private_classes
  WHERE id = p_class_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Class not found';
  END IF;

  -- 2. Insert into transitions history
  INSERT INTO tutor_transitions (
    student_id,
    previous_tutor_id,
    new_tutor_id,
    reason,
    transfer_fee,
    created_by
  ) VALUES (
    v_student_id,
    v_old_tutor_id,
    p_new_tutor_id,
    p_reason,
    p_transfer_fee,
    p_created_by
  );

  -- 3. Update the class
  UPDATE private_classes
  SET tutor_id = p_new_tutor_id,
      updated_at = NOW()
  WHERE id = p_class_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
