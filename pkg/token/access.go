package token

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

var secretKey = []byte("development-secret-change-me")

func CreateAccessToken(userID uuid.UUID) (string, error) {
	now := time.Now()
	claims := jwt.MapClaims{
		"sub": userID.String(),
		"iat": now.Unix(),
		"exp": now.Add(15 * time.Minute).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(secretKey)
}
