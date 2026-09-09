package token

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

func getSecretKey() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		panic("JWT_SECRET environment variable is required")
	}
	return []byte(secret)
}

func CreateAccessToken(userID uuid.UUID, sessionID uuid.UUID) (string, error) {
	now := time.Now()
	claims := jwt.MapClaims{
		"sub": userID.String(),
		"sid": sessionID.String(), // Add session ID to token
		"iat": now.Unix(),
		"exp": now.Add(15 * time.Minute).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(getSecretKey())
}
