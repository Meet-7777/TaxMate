package auth

import (
	"encoding/json"
	"net/http"
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

func (h *Handler) Signup(w http.ResponseWriter, r *http.Request) {
	var req SignupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	user, err := h.service.Signup(r.Context(), req.Email, req.Password)
	if err != nil {
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
