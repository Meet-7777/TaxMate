ALTER TABLE sessions
ADD COLUMN device_type TEXT NOT NULL DEFAULT 'laptop';

ALTER TABLE sessions
ADD CONSTRAINT sessions_device_type_check
CHECK (device_type IN ('mobile', 'laptop'));

CREATE UNIQUE INDEX idx_one_active_session_per_device
ON sessions (user_id, device_type)
WHERE revoked_at IS NULL;