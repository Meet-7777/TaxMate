ALTER TABLE sessions
ADD COLUMN family_id UUID,
ADD COLUMN replaced_by UUID,
ADD COLUMN rotated_at TIMESTAMPTZ;

UPDATE sessions
SET family_id = id
WHERE family_id IS NULL;

ALTER TABLE sessions
ALTER COLUMN family_id SET NOT NULL;

CREATE INDEX idx_sessions_family_id
ON sessions(family_id);

CREATE INDEX idx_sessions_replaced_by
ON sessions(replaced_by);