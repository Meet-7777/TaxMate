package auth

import (
	"context"
	"errors"
	"fmt"

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
var ErrInvalidDeviceType = errors.New("invalid device type")

type Service struct {
	users       user.UserRepository
	session     session.Repository
	coordinator *session.RefreshCoordinator
}

type LoginResult struct {
	User         user.User
	RefreshToken string
	AccessToken  string
}

func NewService(repo user.UserRepository, sessionRepo session.Repository) *Service {
	return &Service{
		users:       repo,
		session:     sessionRepo,
		coordinator: session.NewRefreshCoordinator(),
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
	ctx context.Context,
	email string,
	password string,
	deviceType session.DeviceType,
) (LoginResult, error) {
	if !session.IsValidDeviceType(deviceType) {
		return LoginResult{}, ErrInvalidDeviceType
	}

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

	sessionID := uuid.New()
	now := time.Now()

	newSession := &session.Session{
		ID:               sessionID,
		UserID:           u.ID,
		RefreshTokenHash: crypto.HashToken(refreshToken),
		FamilyID:         sessionID,
		DeviceType:       deviceType,
		ExpiresAt:        now.Add(7 * 24 * time.Hour),
		CreatedAt:        now,
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

func (s *Service) Refresh(
	ctx context.Context,
	refreshToken string,
) (LoginResult, error) {
	refreshTokenHash := crypto.HashToken(refreshToken)

	unlock := s.coordinator.Lock(refreshTokenHash)
	defer unlock()

	if cached, ok := s.coordinator.Get(refreshTokenHash); ok {
		return LoginResult{
			RefreshToken: cached.RefreshToken,
			AccessToken:  cached.AccessToken,
		}, nil
	}

	currentSession, err := s.session.FindByRefreshTokenHash(
		ctx,
		refreshTokenHash,
	)
	if err != nil {
		return LoginResult{}, ErrInvalidRefreshToken
	}

	if currentSession.RevokedAt != nil {
		return LoginResult{}, ErrInvalidRefreshToken
	}

	if time.Now().After(currentSession.ExpiresAt) {
		return LoginResult{}, ErrInvalidRefreshToken
	}

	newRefreshToken, err := crypto.GenerateToken()
	if err != nil {
		return LoginResult{}, err
	}

	newAccessToken, err := token.CreateAccessToken(currentSession.UserID)
	if err != nil {
		return LoginResult{}, err
	}

	newSession := &session.Session{
		ID:               uuid.New(),
		UserID:           currentSession.UserID,
		RefreshTokenHash: crypto.HashToken(newRefreshToken),
		FamilyID:         currentSession.FamilyID,
		DeviceType:       currentSession.DeviceType,
		ExpiresAt:        currentSession.ExpiresAt,
		CreatedAt:        time.Now(),
	}

	if err := s.session.Rotate(
		ctx,
		currentSession.ID,
		newSession,
	); err != nil {
		fmt.Printf("ROTATE ERROR: %v\n", err)
		return LoginResult{}, ErrInvalidRefreshToken
	}

	result := session.RefreshResult{
		RefreshToken: newRefreshToken,
		AccessToken:  newAccessToken,
	}

	s.coordinator.Set(refreshTokenHash, result)

	return LoginResult{
		User: user.User{
			ID: currentSession.UserID,
		},
		RefreshToken: newRefreshToken,
		AccessToken:  newAccessToken,
	}, nil
}
