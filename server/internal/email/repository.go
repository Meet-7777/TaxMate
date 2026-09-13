package email

import (
	"context"
	"time"

	"github.com/Meet-7777/taxmate-server/pkg/crypto"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type VerificationToken struct {
	ID        uuid.UUID
	UserID    uuid.UUID
	ExpiresAt time.Time
	UsedAt    *time.Time
}

type Repository interface {
	CreateVerificationToken(
		ctx context.Context,
		userID uuid.UUID,
		rawToken string,
		expiresAt time.Time,
	) error

	FindValidVerificationToken(
		ctx context.Context,
		rawToken string,
	) (VerificationToken, error)

	MarkVerificationTokenUsed(
		ctx context.Context,
		tokenID uuid.UUID,
	) error
}

type repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) Repository {
	return &repository{
		db: db,
	}
}

func (r *repository) CreateVerificationToken(
	ctx context.Context,
	userID uuid.UUID,
	rawToken string,
	expiresAt time.Time,
) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}

	defer tx.Rollback(ctx)

	// Invalidate all previous unused verification tokens.
	_, err = tx.Exec(ctx, `
		UPDATE email_verification_tokens
		SET used_at = NOW()
		WHERE user_id = $1
		  AND used_at IS NULL
	`, userID)
	if err != nil {
		return err
	}

	tokenHash := crypto.HashToken(rawToken)

	_, err = tx.Exec(ctx, `
		INSERT INTO email_verification_tokens (
			id,
			user_id,
			token_hash,
			expires_at
		)
		VALUES ($1, $2, $3, $4)
	`,
		uuid.New(),
		userID,
		tokenHash,
		expiresAt,
	)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *repository) FindValidVerificationToken(
	ctx context.Context,
	rawToken string,
) (VerificationToken, error) {
	tokenHash := crypto.HashToken(rawToken)

	var token VerificationToken

	err := r.db.QueryRow(ctx, `
		SELECT
			id,
			user_id,
			expires_at,
			used_at
		FROM email_verification_tokens
		WHERE token_hash = $1
		  AND used_at IS NULL
		  AND expires_at > NOW()
	`, tokenHash).Scan(
		&token.ID,
		&token.UserID,
		&token.ExpiresAt,
		&token.UsedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return VerificationToken{}, ErrInvalidVerificationToken
		}

		return VerificationToken{}, err
	}

	return token, nil
}

func (r *repository) MarkVerificationTokenUsed(
	ctx context.Context,
	tokenID uuid.UUID,
) error {
	_, err := r.db.Exec(ctx, `
		UPDATE email_verification_tokens
		SET used_at = NOW()
		WHERE id = $1
		  AND used_at IS NULL
	`, tokenID)

	return err
}
