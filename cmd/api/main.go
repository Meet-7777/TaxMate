package main

import (
	"context"
	"net/http"

	"github.com/Meet-7777/taxmate-server/pkg/logger"
	"github.com/rs/zerolog/log"

	"github.com/Meet-7777/taxmate-server/config"
	"github.com/Meet-7777/taxmate-server/internal/database"
	"github.com/Meet-7777/taxmate-server/internal/server"
)

func main() {
	logger.Init()
	cfg := config.Load()
	ctx := context.Background()
	db, err := database.NewPostgres(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to connect to postgres")
	}
	defer db.Close()
	err = db.Ping(ctx)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to ping postgreSQl")
	}
	log.Info().Msg("Postgres connected")

	redisClient, err := database.NewRedis(ctx, cfg.RedisURL)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to connect to redis")
	}
	defer redisClient.Close()
	log.Info().Msg("Redis connected")

	router := server.New(db, redisClient)
	log.Info().
		Str("port", cfg.Port).
		Msg("TaxMate server started")
	err = http.ListenAndServe(":"+cfg.Port, router)
	if err != nil {
		log.Error().Err(err).Msg("server failed")
	}

}
