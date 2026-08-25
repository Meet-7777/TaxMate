package auth

import (
	"context"
	"errors"

	"time"

	"github.com/Meet-7777/taxmate-server/internal/session"
	"github.com/Meet-7777/taxmate-server/internal/user"
	"github.com/Meet-7777/taxmate-server/pkg/crypto"
	"github.com/Meet-7777/taxmate-server/pkg/token"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"
)

var ErrInvalidPassword = errors.New("password must be at least 8 characters")
var ErrEmailAlreadyExists = errors.New("email already exists")
var ErrInvalidCredentials = errors.New("invalid credentials")
var ErrInvalidRefreshToken = errors.New("invalid refresh token")

type Service struct {
	users   user.UserRepository
	session session.Repository
}

type LoginResult struct {
	User         user.User
	RefreshToken string
	AccessToken  string
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
	ctx context.Context, email string, password string) (LoginResult, error) {
	u, err := s.users.FindByEmail(ctx, email)
	if err != nil {
		return LoginResult{}, ErrInvalidCredentials
	}
	if !crypto.VerifyPassword(password, u.PasswordHash) {
		return LoginResult{}, ErrInvalidCredentials
	}
	refreshToken, err := crypto.GenerateToken()
	if err != nil {
		return LoginResult{}, err
	}
	accessToken, err := token.CreateAccessToken(u.ID)
	if err != nil {
		return LoginResult{}, err
	}
	newSession := &session.Session{
		ID:               uuid.New(),
		UserID:           u.ID,
		RefreshTokenHash: crypto.HashToken(refreshToken),
		ExpiresAt:        time.Now().Add(7 * 24 * time.Hour),
		CreatedAt:        time.Now(),
	}
	if err := s.session.Create(ctx, newSession); err != nil {
		return LoginResult{}, err
	}
	return LoginResult{
		User:         u,
		RefreshToken: refreshToken,
		AccessToken:  accessToken,
	}, nil
}

func (s *Service) Refresh(ctx context.Context, refreshToken string) (string, error) {
	refreshTokenHash := crypto.HashToken(refreshToken)
	currentSession, err := s.session.FindByRefreshTokenHash(ctx, refreshTokenHash)
	if err != nil {
		return "", ErrInvalidRefreshToken
	}
	if currentSession.RevokedAt != nil {
		return "", ErrInvalidRefreshToken
	}
	if time.Now().After(currentSession.ExpiresAt) {
		return "", ErrInvalidRefreshToken
	}
	accessToken, err := token.CreateAccessToken(currentSession.UserID)
	if err != nil {
		return "", err
	}
	return accessToken, nil
}
