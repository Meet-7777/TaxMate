#!/bin/bash

set -e

echo "======================================"
echo " TaxMate Email Verification Setup"
echo "======================================"

# Move to project root
cd "$(dirname "$0")/../.."

echo ""
echo "1. Checking AWS CLI..."

if ! command -v aws >/dev/null 2>&1; then
    echo "ERROR: AWS CLI is not installed."
    exit 1
fi

echo "✓ AWS CLI found"

echo ""
echo "2. Checking .env..."

if [ ! -f .env ]; then
    echo "ERROR: .env file not found."
    exit 1
fi

echo "✓ .env found"

echo ""
echo "3. Loading configuration..."

set -a
source .env
set +a

if [ -z "$AWS_REGION" ]; then
    echo "ERROR: AWS_REGION is missing from .env"
    exit 1
fi

if [ -z "$EMAIL_FROM_ADDRESS" ]; then
    echo "ERROR: EMAIL_FROM_ADDRESS is missing from .env"
    exit 1
fi

echo "✓ AWS_REGION=$AWS_REGION"
echo "✓ EMAIL_FROM_ADDRESS=$EMAIL_FROM_ADDRESS"

echo ""
echo "4. Checking AWS credentials..."

if ! aws sts get-caller-identity >/dev/null 2>&1; then
    echo "ERROR: AWS credentials are not configured."
    echo ""
    echo "Run:"
    echo "  aws configure"
    exit 1
fi

echo "✓ AWS credentials working"

echo ""
echo "5. Checking SES sender verification..."

STATUS=$(aws sesv2 get-email-identity \
    --email-identity "$EMAIL_FROM_ADDRESS" \
    --region "$AWS_REGION" \
    --query 'VerifiedForSendingStatus' \
    --output text 2>/dev/null || true)

if [ "$STATUS" != "True" ]; then
    echo "ERROR: SES sender is not verified:"
    echo "  $EMAIL_FROM_ADDRESS"
    echo ""
    echo "Verify it in AWS SES first."
    exit 1
fi

echo "✓ SES sender verified"

echo ""
echo "6. Checking Go dependencies..."

go mod tidy

echo "✓ Go dependencies ready"

echo ""
echo "7. Running tests..."

go test ./...

echo ""
echo "======================================"
echo " Email setup complete!"
echo "======================================"

echo ""
echo "AWS Region:"
echo "  $AWS_REGION"

echo ""
echo "SES Sender:"
echo "  $EMAIL_FROM_ADDRESS"

echo ""
echo "Start TaxMate with:"
echo "  go run ./cmd/api"

echo ""
echo "Then test signup with:"
echo ""
echo '  curl -X POST http://localhost:8080/api/auth/signup \'
echo '    -H "Content-Type: application/json" \'
echo '    -d '\''{"email":"YOUR_EMAIL","password":"password123"}'\'''
echo ""

echo "======================================"