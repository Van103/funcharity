
-- Function để chuyển đổi tên thành username format
CREATE OR REPLACE FUNCTION generate_username_from_name(full_name TEXT)
RETURNS TEXT AS $$
DECLARE
  normalized TEXT;
  words TEXT[];
  result TEXT := '';
  word TEXT;
BEGIN
  IF full_name IS NULL OR full_name = '' THEN
    RETURN 'User';
  END IF;
  
  -- Bỏ dấu tiếng Việt bằng unaccent (nếu extension có sẵn) hoặc dùng translate
  normalized := translate(full_name, 
    'àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ',
    'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyydAAAAAAAAAAAAAAAAAEEEEEEEEEEEIIIIIOOOOOOOOOOOOOOOOOUUUUUUUUUUUYYYYYD'
  );
  
  -- Tách thành các từ
  words := regexp_split_to_array(trim(normalized), '\s+');
  
  -- Viết hoa chữ cái đầu mỗi từ và nối bằng dấu chấm
  FOREACH word IN ARRAY words
  LOOP
    IF word != '' THEN
      IF result != '' THEN
        result := result || '.';
      END IF;
      result := result || initcap(word);
    END IF;
  END LOOP;
  
  RETURN COALESCE(NULLIF(result, ''), 'User');
END;
$$ LANGUAGE plpgsql;

-- Function để tạo unique username code
CREATE OR REPLACE FUNCTION generate_unique_referral_code(base_name TEXT, exclude_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  test_code TEXT;
  counter INTEGER := 0;
  existing_count INTEGER;
BEGIN
  LOOP
    IF counter = 0 THEN
      test_code := base_name;
    ELSE
      test_code := base_name || counter::TEXT;
    END IF;
    
    -- Kiểm tra xem code đã tồn tại chưa (trừ record hiện tại nếu có)
    SELECT COUNT(*) INTO existing_count
    FROM referral_codes
    WHERE LOWER(code) = LOWER(test_code)
      AND (exclude_id IS NULL OR id != exclude_id);
    
    IF existing_count = 0 THEN
      RETURN test_code;
    END IF;
    
    counter := counter + 1;
    
    -- Giới hạn để tránh infinite loop
    IF counter > 1000 THEN
      RETURN base_name || '_' || gen_random_uuid()::TEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Cập nhật tất cả referral codes hiện có
DO $$
DECLARE
  ref_record RECORD;
  new_code TEXT;
  base_name TEXT;
BEGIN
  FOR ref_record IN 
    SELECT rc.id, rc.user_id, rc.code, p.full_name
    FROM referral_codes rc
    LEFT JOIN profiles p ON rc.user_id = p.user_id
    WHERE rc.is_active = true
  LOOP
    -- Tạo base name từ full_name
    base_name := generate_username_from_name(COALESCE(ref_record.full_name, 'User'));
    
    -- Tạo unique code
    new_code := generate_unique_referral_code(base_name, ref_record.id);
    
    -- Cập nhật record
    UPDATE referral_codes 
    SET code = new_code, updated_at = NOW()
    WHERE id = ref_record.id;
    
    RAISE NOTICE 'Updated % -> %', ref_record.code, new_code;
  END LOOP;
END $$;
