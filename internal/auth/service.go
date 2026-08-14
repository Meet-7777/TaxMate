package auth

import (
	"context"

	"github.com/Meet-7777/taxmate-server/internal/user"
	"github.com/Meet-7777/taxmate-server/pkg/crypto"
)

type Service struct {
	users *user.Repository
}

func NewService(users *user.Repository) *Service {
	return &Service{
		users: users,
	}
}

func (s *Service) Signup(
	ctx context.Context,
	email string,
	password string,
) (user.User, error) {
	passwordHash, err := crypto.HashPassword(password)
	if err != nil {
		return user.User{}, err
	}
	return s.users.Create(ctx, email, passwordHash)
}
