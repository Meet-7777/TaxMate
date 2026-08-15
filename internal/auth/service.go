package auth

import (
	"context"
	"errors"

	"github.com/Meet-7777/taxmate-server/internal/user"
	"github.com/Meet-7777/taxmate-server/pkg/crypto"
	"github.com/jackc/pgx/v5/pgconn"
)

var ErrInvalidPassword = errors.New("password must be at least 8 characters")
var ErrEmailAlreadyExists = errors.New("email already exists")

type Service struct {
	users user.UserRepository
}

func NewService(repo user.UserRepository) *Service {
	return &Service{
		users: repo,
	}
}

func (s *Service) Signup(
	ctx context.Context,
	email string,
	password string,
) (user.User, error) {

	if len(password) < 8 {
		return user.User{}, ErrInvalidPassword
	}

	passwordHash, err := crypto.HashPassword(password)
	if err != nil {
		return user.User{}, err
	}

	newUser, err := s.users.Create(ctx, email, passwordHash)

	if err != nil {
		var pgErr *pgconn.PgError

		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return user.User{}, ErrEmailAlreadyExists
		}

		return user.User{}, err
	}

	return newUser, nil
}
