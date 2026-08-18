package session

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository interface {
	Create(ctx context.Context, s *Session) error
}

type PostgresRepository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *PostgresRepository {
	return &PostgresRepository{
		db: db,
	}
}

func (r *PostgresRepository) Create(ctx context.Context, s *Session) error {
	_, err := r.db.Exec(ctx, `
	INSERT INTO sessions (
	id, user_id, refresh_token_hash, expires_at, created_at
	)VALUES($1,$2, $3,$4,$5)
	`, s.ID, s.UserID, s.RefreshTokenHash, s.ExpiresAt, s.CreatedAt)
	return err

}
