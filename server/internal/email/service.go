package email

import "context"

type Service interface {
	SendVerificationEmail(
		ctx context.Context,
		recipient string,
		verificationURL string,
	) error
}
