package server

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

func New() *chi.Mux {
	router := chi.NewRouter()
	router.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("TaxMate API"))
	})
	return router
}
