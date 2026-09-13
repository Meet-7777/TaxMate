-- Rollback: make phone_number NOT NULL again
ALTER TABLE users ALTER COLUMN phone_number SET NOT NULL;
