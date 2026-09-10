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
var ErrInvalidDeviceType = errors.New("invalid device type")
var ErrIncorrectPassword = errors.New("current password is incorrect")
var ErrUserNotFound = errors.New("user not found")
var ErrInvalidWorkType = errors.New("invalid work_type: must be one of uber, didi, ubereats, doordash, menulog, casual_employee, freelancer, tradie, other")
var ErrPhoneAlreadyExists = errors.New("phone number already registered")

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

	sessionID := uuid.New()
	now := time.Now()

	accessToken, err := token.CreateAccessToken(
		u.ID,
		sessionID,
	)
	if err != nil {
		return LoginResult{}, err
	}

	newSession := &session.Session{
		ID:               sessionID,
		UserID:           u.ID,
		RefreshTokenHash: crypto.HashToken(refreshToken),
		FamilyID:         sessionID,
		DeviceType:       deviceType,

		// Refresh token/session expires 7 days after login.
		ExpiresAt: now.Add(7 * 24 * time.Hour),

		CreatedAt: now,
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

	now := time.Now()

	if now.After(currentSession.ExpiresAt) {
		return LoginResult{}, ErrInvalidRefreshToken
	}

	newRefreshToken, err := crypto.GenerateToken()
	if err != nil {
		return LoginResult{}, err
	}

	newSessionID := uuid.New()

	newAccessToken, err := token.CreateAccessToken(
		currentSession.UserID,
		newSessionID,
	)
	if err != nil {
		return LoginResult{}, err
	}

	newSession := &session.Session{
		ID:               newSessionID,
		UserID:           currentSession.UserID,
		RefreshTokenHash: crypto.HashToken(newRefreshToken),
		FamilyID:         currentSession.FamilyID,
		DeviceType:       currentSession.DeviceType,

		ExpiresAt: currentSession.ExpiresAt,

		CreatedAt: now,
	}

	if err := s.session.Rotate(
		ctx,
		currentSession.ID,
		newSession,
	); err != nil {
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

func (s *Service) GetProfile(ctx context.Context, userID uuid.UUID) (user.User, error) {
	u, err := s.users.FindByID(ctx, userID)
	if err != nil {
		return user.User{}, ErrUserNotFound
	}
	return u, nil
}

func (s *Service) UpdateProfile(ctx context.Context, userID uuid.UUID, data user.ProfileData) (user.User, error) {
	validWorkTypes := map[user.WorkType]bool{
		user.WorkTypeUber:           true,
		user.WorkTypeDiDi:           true,
		user.WorkTypeUberEats:       true,
		user.WorkTypeDoorDash:       true,
		user.WorkTypeMenulog:        true,
		user.WorkTypeCasualEmployee: true,
		user.WorkTypeFreelancer:     true,
		user.WorkTypeTradie:         true,
		user.WorkTypeOther:          true,
	}
	if !validWorkTypes[data.WorkType] {
		return user.User{}, ErrInvalidWorkType
	}

	u, err := s.users.UpdateProfile(ctx, userID, data)
	if err != nil {

		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" && pgErr.ConstraintName == "users_phone_number_key" {
			return user.User{}, ErrPhoneAlreadyExists
		}
		return user.User{}, err
	}
	return u, nil
}

func (s *Service) ChangePassword(
	ctx context.Context,
	userID uuid.UUID,
	oldPassword string,
	newPassword string,
) error {
	if len(newPassword) < 8 {
		return ErrInvalidPassword
	}

	u, err := s.users.FindByID(ctx, userID)
	if err != nil {
		return ErrUserNotFound
	}

	if !crypto.VerifyPassword(oldPassword, u.PasswordHash) {
		return ErrIncorrectPassword
	}

	newHash, err := crypto.HashPassword(newPassword)
	if err != nil {
		return err
	}

	return s.users.UpdatePassword(ctx, userID, newHash)
}
