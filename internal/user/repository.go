package user

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type User struct {
	ID            uuid.UUID
	Email         string
	PasswordHash  string
	PhoneNumber   *string
	EmailVerified bool
	PhoneVerified bool
}

type UserRepository interface {
	Create(ctx context.Context, email string, passwordHash string) (User, error)
}

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{
		db: db,
	}
}

func (r *Repository) Create(ctx context.Context, email string, passwordHash string) (User, error) {
	var u User
	err := r.db.QueryRow(ctx, `INSERT INTO users (
			id,
			email,
			password_hash
		)
		VALUES ($1, $2, $3)
		RETURNING
			id,
			email,
			password_hash,
			phone_number,
			email_verified,
			phone_verified`, uuid.New(), email, passwordHash).Scan(&u.ID, &u.Email, &u.PasswordHash, &u.PhoneNumber, &u.EmailVerified, &u.PhoneVerified)
	return u, err
}
