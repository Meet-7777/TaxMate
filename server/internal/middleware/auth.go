package middleware

import (
	"context"
	"net/http"

	"github.com/Meet-7777/taxmate-server/internal/session"
	"github.com/Meet-7777/taxmate-server/pkg/token"
	"github.com/google/uuid"
)

type contextKey string

const userIDKey contextKey = "userID"

func Auth(sessionRepo session.Repository) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			cookie, err := r.Cookie("access_token")
			if err != nil {
				http.Error(w, "missing access token", http.StatusUnauthorized)
				return
			}
			claims, err := token.VerifyAccessToken(cookie.Value)
			if err != nil {
				http.Error(w, "invalid access token", http.StatusUnauthorized)
				return
			}

			// Check if THIS specific session is still active (not revoked)
			isActive, err := sessionRepo.IsSessionActive(r.Context(), claims.SessionID)
			if err != nil || !isActive {
				http.Error(w, "session revoked", http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), userIDKey, claims.UserID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func UserID(ctx context.Context) (uuid.UUID, bool) {
	UserID, ok := ctx.Value(userIDKey).(uuid.UUID)
	return UserID, ok
}
