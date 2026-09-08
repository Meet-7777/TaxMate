DROP INDEX IF EXISTS idx_one_active_session_per_device;

ALTER TABLE sessions
DROP CONSTRAINT IF EXISTS sessions_device_type_check;

ALTER TABLE sessions
DROP COLUMN IF EXISTS device_type;