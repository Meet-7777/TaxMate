-- Make phone_number NOT NULL and add unique constraint to ABN
ALTER TABLE users ALTER COLUMN phone_number SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_abn_key UNIQUE (abn);
