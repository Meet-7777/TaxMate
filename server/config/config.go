package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	DatabaseURL string
	RedisURL    string
	FrontendURL string

	AWS AWSConfig

	Email EmailConfig
}

type AWSConfig struct {
	Region string
}

type EmailConfig struct {
	FromAddress string
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		panic("failed to load .env")
	}

	return &Config{
		Port:        os.Getenv("PORT"),
		DatabaseURL: os.Getenv("DATABASE_URL"),
		RedisURL:    os.Getenv("REDIS_URL"),
		FrontendURL: os.Getenv("FRONTEND_URL"),

		AWS: AWSConfig{
			Region: os.Getenv("AWS_REGION"),
		},

		Email: EmailConfig{
			FromAddress: os.Getenv("EMAIL_FROM_ADDRESS"),
		},
	}
}
