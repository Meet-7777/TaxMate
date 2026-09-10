package server

import (
	"github.com/Meet-7777/taxmate-server/internal/auth"
	"github.com/Meet-7777/taxmate-server/internal/health"
	"github.com/Meet-7777/taxmate-server/internal/middleware"
	"github.com/Meet-7777/taxmate-server/internal/session"
	"github.com/Meet-7777/taxmate-server/internal/user"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

func New(db *pgxpool.Pool, redis *redis.Client) *chi.Mux {
	router := chi.NewRouter()

	healthHandler := health.NewHandler(db, redis)
	router.Get("/health", healthHandler.Check)

	userRepo := user.NewRepository(db)
	sessionRepo := session.NewRepository(db)

	authService := auth.NewService(userRepo, sessionRepo)
	authHandler := auth.NewHandler(authService)

	router.Route("/api", func(r chi.Router) {
		r.Post("/auth/signup", authHandler.Signup)
		r.Post("/auth/login", authHandler.Login)
		r.Post("/auth/refresh", authHandler.Refresh)
		r.Post("/auth/logout", authHandler.Logout)

		r.With(middleware.Auth(sessionRepo)).Get("/me", authHandler.Me)
		r.With(middleware.Auth(sessionRepo)).Patch("/me/profile", authHandler.UpdateProfile)
		r.With(middleware.Auth(sessionRepo)).Post("/auth/change-password", authHandler.ChangePassword)
	})

	return router
}
