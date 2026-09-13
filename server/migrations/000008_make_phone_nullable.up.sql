-- Make phone_number nullable (not required at signup, only at profile completion)
ALTER TABLE users ALTER COLUMN phone_number DROP NOT NULL;
