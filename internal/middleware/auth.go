package middleware

import (
	"context"
	"net/http"

	"github.com/Meet-7777/taxmate-server/pkg/token"
	"github.com/google/uuid"
)

type contextKey string

const userIDKey contextKey = "userID"

func Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("access_token")
		if err != nil {
			http.Error(w, "missing access token", http.StatusUnauthorized)
			return
		}
		userID, err := token.VerifyAccessToken(cookie.Value)
		if err != nil {
			http.Error(w, "invalid access token", http.StatusUnauthorized)
			return
		}
		ctx := context.WithValue(r.Context(), userIDKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func UserID(ctx context.Context) (uuid.UUID, bool) {
	UserID, ok := ctx.Value(userIDKey).(uuid.UUID)
	return UserID, ok
}
