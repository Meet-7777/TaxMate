package auth

import (
	"context"
	"errors"

	"github.com/Meet-7777/taxmate-server/internal/session"
	"github.com/Meet-7777/taxmate-server/internal/user"
	"github.com/Meet-7777/taxmate-server/pkg/crypto"
	"github.com/jackc/pgx/v5/pgconn"
)

var ErrInvalidPassword = errors.New("password must be at least 8 characters")
var ErrEmailAlreadyExists = errors.New("email already exists")
var ErrInvalidCredentials = errors.New("invalid credentials")

type Service struct {
	users   user.UserRepository
	session session.Repository
}

func NewService(repo user.UserRepository, sessionRepo session.Repository) *Service {
	return &Service{
		users:   repo,
		session: sessionRepo,
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

func (s *Service) Login(
	ctx context.Context, email string, password string) (user.User, error) {
	u, err := s.users.FindByEmail(ctx, email)
	if err != nil {
		return user.User{}, ErrInvalidCredentials
	}
	if !crypto.VerifyPassword(password, u.PasswordHash) {
		return user.User{}, ErrInvalidCredentials
	}
	return u, nil
}
