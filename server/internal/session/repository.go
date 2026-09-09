package session

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrSessionAlreadyRotated = errors.New("session already rotated")

type Repository interface {
	Create(ctx context.Context, s *Session) error
	FindByRefreshTokenHash(ctx context.Context, refreshTokenHash string) (*Session, error)
	Rotate(ctx context.Context, oldSessionID uuid.UUID, newSession *Session) error
	RevokeFamily(ctx context.Context, familyID uuid.UUID) error
	IsSessionActive(ctx context.Context, sessionID uuid.UUID) (bool, error)
}

type PostgresRepository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *PostgresRepository {
	return &PostgresRepository{
		db: db,
	}
}

func (r *PostgresRepository) Create(
	ctx context.Context,
	s *Session,
) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, `
		UPDATE sessions
		SET revoked_at = NOW()
		WHERE user_id = $1
		  AND device_type = $2
		  AND revoked_at IS NULL
	`,
		s.UserID,
		s.DeviceType,
	)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO sessions (
			id,
			user_id,
			refresh_token_hash,
			family_id,
			device_type,
			expires_at,
			created_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`,
		s.ID,
		s.UserID,
		s.RefreshTokenHash,
		s.FamilyID,
		s.DeviceType,
		s.ExpiresAt,
		s.CreatedAt,
	)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *PostgresRepository) FindByRefreshTokenHash(
	ctx context.Context,
	refreshTokenHash string,
) (*Session, error) {
	var s Session

	err := r.db.QueryRow(ctx, `
		SELECT
			id,
			user_id,
			refresh_token_hash,
			family_id,
			device_type,
			expires_at,
			created_at,
			replaced_by,
			rotated_at,
			revoked_at
		FROM sessions
		WHERE refresh_token_hash = $1
	`,
		refreshTokenHash,
	).Scan(
		&s.ID,
		&s.UserID,
		&s.RefreshTokenHash,
		&s.FamilyID,
		&s.DeviceType,
		&s.ExpiresAt,
		&s.CreatedAt,
		&s.ReplacedBy,
		&s.RotatedAt,
		&s.RevokedAt,
	)

	if err != nil {
		return nil, err
	}

	return &s, nil
}

func (r *PostgresRepository) Rotate(
	ctx context.Context,
	oldSessionID uuid.UUID,
	newSession *Session,
) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var revokedAt *time.Time
	var replacedBy *uuid.UUID

	err = tx.QueryRow(ctx, `
		SELECT revoked_at, replaced_by
		FROM sessions
		WHERE id = $1
		FOR UPDATE
	`,
		oldSessionID,
	).Scan(
		&revokedAt,
		&replacedBy,
	)

	if err != nil {
		return err
	}

	if revokedAt != nil || replacedBy != nil {
		return ErrSessionAlreadyRotated
	}

	now := time.Now()

	_, err = tx.Exec(ctx, `
		UPDATE sessions
		SET
			revoked_at = $1,
			replaced_by = $2,
			rotated_at = $1
		WHERE id = $3
	`,
		now,
		newSession.ID,
		oldSessionID,
	)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO sessions (
			id,
			user_id,
			refresh_token_hash,
			family_id,
			device_type,
			expires_at,
			created_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`,
		newSession.ID,
		newSession.UserID,
		newSession.RefreshTokenHash,
		newSession.FamilyID,
		newSession.DeviceType,
		newSession.ExpiresAt,
		newSession.CreatedAt,
	)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *PostgresRepository) RevokeFamily(
	ctx context.Context,
	familyID uuid.UUID,
) error {
	_, err := r.db.Exec(ctx, `
		UPDATE sessions
		SET revoked_at = COALESCE(revoked_at, NOW())
		WHERE family_id = $1
		  AND revoked_at IS NULL
	`,
		familyID,
	)

	return err
}

func (r *PostgresRepository) IsSessionActive(
	ctx context.Context,
	sessionID uuid.UUID,
) (bool, error) {
	var revokedAt *time.Time

	err := r.db.QueryRow(ctx, `
		SELECT revoked_at
		FROM sessions
		WHERE id = $1
		  AND expires_at > NOW()
	`,
		sessionID,
	).Scan(&revokedAt)

	if err != nil {
		return false, nil // Session not found = not active
	}

	return revokedAt == nil, nil
}
