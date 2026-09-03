package token

import (
	"errors"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

var ErrInvalidAccessToken = errors.New("invalid access token")

func VerifyAccessToken(tokenString string) (uuid.UUID, error) {
	token, err := jwt.Parse(
		tokenString,
		func(token *jwt.Token) (interface{}, error) {
			if token.Method != jwt.SigningMethodHS256 {
				return nil, ErrInvalidAccessToken
			}

			return secretKey, nil
		},
	)

	if err != nil || !token.Valid {
		return uuid.Nil, ErrInvalidAccessToken
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return uuid.Nil, ErrInvalidAccessToken
	}

	sub, ok := claims["sub"].(string)
	if !ok {
		return uuid.Nil, ErrInvalidAccessToken
	}

	userID, err := uuid.Parse(sub)
	if err != nil {
		return uuid.Nil, ErrInvalidAccessToken
	}

	return userID, nil
}
