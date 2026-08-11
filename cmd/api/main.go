package main

import (
	"net/http"

	"github.com/Meet-7777/taxmate-server/pkg/logger"
	"github.com/rs/zerolog/log"

	"github.com/Meet-7777/taxmate-server/config"
	"github.com/Meet-7777/taxmate-server/internal/server"
)

func main() {
	logger.Init()
	cfg := config.Load()
	router := server.New()
	log.Info().
		Str("port", cfg.Port).
		Msg("TaxMate server started")
	err := http.ListenAndServe(":"+cfg.Port, router)
	if err != nil {
		log.Error().Err(err).Msg("server failed")
	}

}
