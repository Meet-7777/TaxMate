package auth

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/Meet-7777/taxmate-server/internal/middleware"
	"github.com/Meet-7777/taxmate-server/internal/session"
	"github.com/Meet-7777/taxmate-server/internal/user"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// ── request types ─────────────────────────────────────────────────────────────

type SignupRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email      string `json:"email"`
	Password   string `json:"password"`
	DeviceType string `json:"device_type"` // optional, defaults to "laptop"
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password"`
	NewPassword string `json:"new_password"`
}

type UpdateProfileRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Phone     string `json:"phone"`
	ABN       string `json:"abn"`
	WorkType  string `json:"work_type"`
	NeedsBAS  bool   `json:"needs_bas"`
}

// ── response helpers ──────────────────────────────────────────────────────────

// profileResponse is the shape returned by /me and PATCH /me/profile.
type profileResponse struct {
	ID               string  `json:"id"`
	Email            string  `json:"email"`
	FirstName        *string `json:"first_name"`
	LastName         *string `json:"last_name"`
	Phone            *string `json:"phone"`
	ABN              *string `json:"abn"`
	WorkType         *string `json:"work_type"`
	NeedsBAS         bool    `json:"needs_bas"`
	ProfileCompleted bool    `json:"profile_completed"`
}

func toProfileResponse(u user.User) profileResponse {
	var workType *string
	if u.WorkType != nil {
		s := string(*u.WorkType)
		workType = &s
	}
	return profileResponse{
		ID:               u.ID.String(),
		Email:            u.Email,
		FirstName:        u.FirstName,
		LastName:         u.LastName,
		Phone:            u.PhoneNumber,
		ABN:              u.ABN,
		WorkType:         workType,
		NeedsBAS:         u.NeedsBAS,
		ProfileCompleted: u.ProfileCompleted(),
	}
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

// ── handlers ──────────────────────────────────────────────────────────────────

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

	u, err := h.service.Signup(r.Context(), req.Email, req.Password)
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

	writeJSON(w, http.StatusCreated, map[string]string{
		"id":    u.ID.String(),
		"email": u.Email,
	})
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	// Default to laptop if not provided
	if req.DeviceType == "" {
		req.DeviceType = "laptop"
	}

	deviceType := session.DeviceType(req.DeviceType)
	if !session.IsValidDeviceType(deviceType) {
		http.Error(w, "invalid device type", http.StatusBadRequest)
		return
	}

	result, err := h.service.Login(r.Context(), req.Email, req.Password, deviceType)
	if err != nil {
		if errors.Is(err, ErrInvalidCredentials) {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}
		if errors.Is(err, ErrInvalidDeviceType) {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		http.Error(w, "failed to login", http.StatusInternalServerError)
		return
	}

	setAuthCookies(w, result.RefreshToken, result.AccessToken)
	writeJSON(w, http.StatusOK, map[string]string{
		"id":    result.User.ID.String(),
		"email": result.User.Email,
	})
}

func (h *Handler) Refresh(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("refresh_token")
	if err != nil {
		http.Error(w, "missing refresh token", http.StatusUnauthorized)
		return
	}

	result, err := h.service.Refresh(r.Context(), cookie.Value)
	if err != nil {
		if errors.Is(err, ErrInvalidRefreshToken) {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}
		http.Error(w, "failed to refresh session", http.StatusInternalServerError)
		return
	}

	setAuthCookies(w, result.RefreshToken, result.AccessToken)
	w.WriteHeader(http.StatusOK)
}

// Me returns the full user profile. Requires access_token cookie.
func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserID(r.Context())
	if !ok {
		http.Error(w, "user not found", http.StatusInternalServerError)
		return
	}

	u, err := h.service.GetProfile(r.Context(), userID)
	if err != nil {
		if errors.Is(err, ErrUserNotFound) {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		http.Error(w, "failed to fetch user", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusOK, toProfileResponse(u))
}

// UpdateProfile saves the user's onboarding data. Requires access_token cookie.
func (h *Handler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserID(r.Context())
	if !ok {
		http.Error(w, "user not found", http.StatusInternalServerError)
		return
	}

	var req UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	if req.FirstName == "" || req.LastName == "" {
		http.Error(w, "first_name and last_name are required", http.StatusBadRequest)
		return
	}
	if req.ABN == "" {
		http.Error(w, "abn is required", http.StatusBadRequest)
		return
	}
	if req.WorkType == "" {
		http.Error(w, "work_type is required", http.StatusBadRequest)
		return
	}

	u, err := h.service.UpdateProfile(r.Context(), userID, user.ProfileData{
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Phone:     req.Phone,
		ABN:       req.ABN,
		WorkType:  user.WorkType(req.WorkType),
		NeedsBAS:  req.NeedsBAS,
	})
	if err != nil {
		if errors.Is(err, ErrInvalidWorkType) {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if errors.Is(err, ErrUserNotFound) {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		http.Error(w, "failed to update profile", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusOK, toProfileResponse(u))
}

// Logout clears both auth cookies.
func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	clearAuthCookies(w)
	w.WriteHeader(http.StatusNoContent)
}

// ChangePassword verifies the old password then replaces it.
func (h *Handler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserID(r.Context())
	if !ok {
		http.Error(w, "user not found", http.StatusInternalServerError)
		return
	}

	var req ChangePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}
	if req.OldPassword == "" || req.NewPassword == "" {
		http.Error(w, "old_password and new_password are required", http.StatusBadRequest)
		return
	}

	err := h.service.ChangePassword(r.Context(), userID, req.OldPassword, req.NewPassword)
	if err != nil {
		if errors.Is(err, ErrInvalidPassword) {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if errors.Is(err, ErrIncorrectPassword) {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}
		if errors.Is(err, ErrUserNotFound) {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		http.Error(w, "failed to change password", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ── cookie helpers ─────────────────────────────────────────────────────────────

func setAuthCookies(w http.ResponseWriter, refreshToken, accessToken string) {
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		Path:     "/api/auth",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   7 * 24 * 60 * 60,
	})
	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    accessToken,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   15 * 60,
	})
}

func clearAuthCookies(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Path:     "/api/auth",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
	})
	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
	})
}

// unused import guard — time is used by cookie MaxAge calculation reference
var _ = time.Second
