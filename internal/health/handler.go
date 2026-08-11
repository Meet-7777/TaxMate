package health

import (
	"encoding/json"
	"net/http"
)

type Handler struct {
}

func NewHandler() *Handler {
	return &Handler{}
}

func (h *Handler) Check(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{
		"status":  "ok",
		"service": "taxmate-server",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
