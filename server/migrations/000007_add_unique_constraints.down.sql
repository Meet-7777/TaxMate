-- Rollback unique constraint on ABN
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_abn_key;
