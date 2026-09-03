package auth

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/Meet-7777/taxmate-server/internal/middleware"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

type SignupRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *Handler) Signup(w http.ResponseWriter, r *http.Request) {
	var req SignupRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	if req.Email == "" {
		http.Error(w, "email is required", http.StatusBadRequest)
		return
	}

	user, err := h.service.Signup(
		r.Context(),
		req.Email,
		req.Password,
	)

	if err != nil {

		if errors.Is(err, ErrInvalidPassword) {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if errors.Is(err, ErrEmailAlreadyExists) {
			http.Error(w, err.Error(), http.StatusConflict)
			return
		}

		http.Error(w, "failed to create user", http.StatusInternalServerError)
		return
	}

	response := map[string]string{
		"id":    user.ID.String(),
		"email": user.Email,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}
	u, err := h.service.Login(
		r.Context(), req.Email, req.Password,
	)
	if err != nil {
		if errors.Is(err, ErrInvalidCredentials) {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		http.Error(w, "failed to login", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    u.RefreshToken,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   7 * 24 * 60 * 60,
	})
	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    u.AccessToken,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   15 * 60,
	})

	response := map[string]string{
		"id":    u.User.ID.String(),
		"email": u.User.Email,
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func (h *Handler) Refresh(w http.ResponseWriter, r *http.Request) {

	cookie, err := r.Cookie("refresh_token")
	if err != nil {
		http.Error(w, "missing refresh token", http.StatusUnauthorized)
		return
	}

	accessToken, err := h.service.Refresh(
		r.Context(),
		cookie.Value,
	)
	if err != nil {
		if errors.Is(err, ErrInvalidRefreshToken) {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		http.Error(
			w,
			"failed to refresh session",
			http.StatusInternalServerError,
		)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    accessToken,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   15 * 60,
	})

	w.WriteHeader(http.StatusOK)
}

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserID(r.Context())
	if !ok {
		http.Error(w, "user not found", http.StatusInternalServerError)
		return
	}

	response := map[string]string{
		"id": userID.String(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
