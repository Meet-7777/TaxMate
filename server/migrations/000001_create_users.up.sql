CREATE TABLE users(
    id UUID PRIMARY KEY, 
    email TEXT NOT NULL UNIQUE, 
    password_hash TEXT,
    phone_number TEXT UNIQUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);