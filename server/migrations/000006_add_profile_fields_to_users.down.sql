ALTER TABLE users
    DROP COLUMN IF EXISTS first_name,
    DROP COLUMN IF EXISTS last_name,
    DROP COLUMN IF EXISTS abn,
    DROP COLUMN IF EXISTS work_type,
    DROP COLUMN IF EXISTS needs_bas,
    DROP COLUMN IF EXISTS profile_completed_at;
