package token

import (
	"errors"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

var ErrInvalidAccessToken = errors.New("invalid access token")

type AccessTokenClaims struct {
	UserID    uuid.UUID
	SessionID uuid.UUID
}

func VerifyAccessToken(tokenString string) (AccessTokenClaims, error) {
	token, err := jwt.Parse(
		tokenString,
		func(token *jwt.Token) (interface{}, error) {
			if token.Method != jwt.SigningMethodHS256 {
				return nil, ErrInvalidAccessToken
			}

			return getSecretKey(), nil
		},
	)

	if err != nil || !token.Valid {
		return AccessTokenClaims{}, ErrInvalidAccessToken
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return AccessTokenClaims{}, ErrInvalidAccessToken
	}

	sub, ok := claims["sub"].(string)
	if !ok {
		return AccessTokenClaims{}, ErrInvalidAccessToken
	}

	userID, err := uuid.Parse(sub)
	if err != nil {
		return AccessTokenClaims{}, ErrInvalidAccessToken
	}

	sid, ok := claims["sid"].(string)
	if !ok {
		return AccessTokenClaims{}, ErrInvalidAccessToken
	}

	sessionID, err := uuid.Parse(sid)
	if err != nil {
		return AccessTokenClaims{}, ErrInvalidAccessToken
	}

	return AccessTokenClaims{
		UserID:    userID,
		SessionID: sessionID,
	}, nil
}
