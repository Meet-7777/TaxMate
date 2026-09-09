package health

import (
	"encoding/json"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

type Handler struct {
	db    *pgxpool.Pool
	redis *redis.Client
}

func NewHandler(db *pgxpool.Pool, redis *redis.Client) *Handler {
	return &Handler{
		db:    db,
		redis: redis,
	}
}

func (h *Handler) Check(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{
		"status":  "ok",
		"service": "taxmate-server",
	}
	if err := h.db.Ping(r.Context()); err != nil {
		response["postgres"] = "down"
	} else {
		response["postgres"] = "ok"
	}
	if err := h.redis.Ping(r.Context()).Err(); err != nil {
		response["redis"] = "down"
	} else {
		response["redis"] = "up"
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
