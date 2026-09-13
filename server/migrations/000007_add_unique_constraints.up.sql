-- Add unique constraints to phone_number and ABN
-- Note: phone_number remains nullable (not required at signup, only at profile completion)
ALTER TABLE users ADD CONSTRAINT users_abn_key UNIQUE (abn);
