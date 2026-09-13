package email

import "errors"

var ErrInvalidVerificationToken = errors.New("invalid or expired verification token")
