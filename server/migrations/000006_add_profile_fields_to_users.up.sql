ALTER TABLE users
    ADD COLUMN first_name           TEXT,
    ADD COLUMN last_name            TEXT,
    ADD COLUMN abn                  TEXT,
    ADD COLUMN work_type            TEXT CHECK (work_type IN (
        'uber', 'didi', 'ubereats', 'doordash', 'menulog',
        'casual_employee', 'freelancer', 'tradie', 'other'
    )),
    ADD COLUMN needs_bas            BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN profile_completed_at TIMESTAMPTZ;
