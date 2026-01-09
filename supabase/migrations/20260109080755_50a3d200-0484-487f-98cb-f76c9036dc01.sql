-- Create referral codes for all existing users who don't have one
INSERT INTO referral_codes (user_id, code)
SELECT p.user_id, 
       UPPER(SUBSTRING(MD5(p.user_id::text || NOW()::text) FROM 1 FOR 8))
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM referral_codes r 
  WHERE r.user_id = p.user_id
);