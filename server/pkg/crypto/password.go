package crypto

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"fmt"
	"strconv"
	"strings"

	"golang.org/x/crypto/argon2"
)

const (
	memory      = 16 * 1024
	iterations  = 3
	parallelism = 2
	keyLength   = 32
	saltLength  = 16
)

func HashPassword(password string) (string, error) {
	salt := make([]byte, saltLength)

	if _, err := rand.Read(salt); err != nil {
		return "", err
	}

	hash := argon2.IDKey(
		[]byte(password),
		salt,
		iterations,
		memory,
		parallelism,
		keyLength,
	)

	return fmt.Sprintf(
		"argon2id$v=19$m=%d,t=%d,p=%d$%s$%s",
		memory,
		iterations,
		parallelism,
		base64.RawStdEncoding.EncodeToString(salt),
		base64.RawStdEncoding.EncodeToString(hash),
	), nil
}

func VerifyPassword(password, encodedHash string) bool {
	parts := strings.Split(encodedHash, "$")

	if len(parts) != 5 {
		return false
	}

	if parts[0] != "argon2id" || parts[1] != "v=19" {
		return false
	}

	params := strings.Split(parts[2], ",")

	if len(params) != 3 {
		return false
	}

	memory, err := parseParam(params[0], "m")
	if err != nil {
		return false
	}

	iterations, err := parseParam(params[1], "t")
	if err != nil {
		return false
	}

	parallelism, err := parseParam(params[2], "p")
	if err != nil {
		return false
	}

	salt, err := base64.RawStdEncoding.DecodeString(parts[3])
	if err != nil {
		return false
	}

	expectedHash, err := base64.RawStdEncoding.DecodeString(parts[4])
	if err != nil {
		return false
	}

	actualHash := argon2.IDKey(
		[]byte(password),
		salt,
		uint32(iterations),
		uint32(memory),
		uint8(parallelism),
		uint32(len(expectedHash)),
	)

	return subtle.ConstantTimeCompare(actualHash, expectedHash) == 1
}

func parseParam(value, prefix string) (int, error) {
	if !strings.HasPrefix(value, prefix+"=") {
		return 0, fmt.Errorf("invalid parameter")
	}

	return strconv.Atoi(strings.TrimPrefix(value, prefix+"="))
}
