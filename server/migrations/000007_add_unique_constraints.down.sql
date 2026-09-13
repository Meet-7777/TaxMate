-- Rollback unique constraint on ABN and NOT NULL on phone_number
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_abn_key;
ALTER TABLE users ALTER COLUMN phone_number DROP NOT NULL;
