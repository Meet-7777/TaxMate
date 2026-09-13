package email

import (
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/sesv2"
	"github.com/aws/aws-sdk-go-v2/service/sesv2/types"
)

type SEService struct {
	client *sesv2.Client
	from   string
}

func NewSEService(client *sesv2.Client, from string) *SEService {
	return &SEService{
		client: client,
		from:   from,
	}
}
func (s *SEService) SendVerificationEmail(
	ctx context.Context, recipient string, verificationURL string,
) error {
	subject := "Verify your TaxMate email"
	body := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>Verify your TaxMate email</title>
</head>

<body>
	<h2>Verify your TaxMate email</h2>

	<p>Thanks for creating your TaxMate account.</p>

	<p>
		Please verify your email address by clicking the button below:
	</p>

	<p>
		<a href="%s">
			Verify my email
		</a>
	</p>

	<p>
		This link will expire in 24 hours.
	</p>

	<p>
		If you didn't create this account, you can safely ignore this email.
	</p>

	<p>
		— TaxMate
	</p>
</body>
</html>
`, verificationURL)
	input := &sesv2.SendEmailInput{
		FromEmailAddress: aws.String(s.from),

		Destination: &types.Destination{
			ToAddresses: []string{
				recipient,
			},
		},

		Content: &types.EmailContent{
			Simple: &types.Message{
				Subject: &types.Content{
					Data: aws.String(subject),
				},
				Body: &types.Body{
					Html: &types.Content{
						Data: aws.String(body),
					},
				},
			},
		},
	}

	_, err := s.client.SendEmail(ctx, input)

	return err

}
