#!/bin/bash

# TaxMate Development Helper Script

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}🚀 TaxMate Development Helper${NC}"
    echo "=========================="
}

print_step() {
    echo -e "${GREEN}▶ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if we're in the right directory
if [[ ! -f "README.md" ]] || [[ ! -d "client" ]] || [[ ! -d "server" ]]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_header

case "$1" in
    "setup")
        print_step "Setting up TaxMate development environment..."
        
        # Setup server
        print_step "Installing server dependencies..."
        cd server && go mod download && cd ..
        
        # Setup client  
        print_step "Installing client dependencies..."
        cd client && npm install && cd ..
        
        # Create .env files if they don't exist
        if [[ ! -f "server/.env" ]] && [[ -f "server/.env.example" ]]; then
            print_step "Creating server .env file..."
            cp server/.env.example server/.env
            echo "⚠️  Please edit server/.env with your database credentials"
        fi
        
        if [[ ! -f "client/.env" ]] && [[ -f "client/.env.example" ]]; then
            print_step "Creating client .env file..."
            cp client/.env.example client/.env
        fi
        
        print_step "✅ Setup complete! Run './scripts/dev.sh start' to begin development"
        ;;
        
    "start")
        print_step "Starting TaxMate development servers..."
        
        # Check if .env files exist
        if [[ ! -f "server/.env" ]]; then
            print_error "Server .env file missing. Run './scripts/dev.sh setup' first"
            exit 1
        fi
        
        print_step "Starting servers in background..."
        echo "🔸 Backend API: http://localhost:8080"
        echo "🔸 Frontend: http://localhost:5173"
        echo "🔸 Press Ctrl+C to stop all servers"
        
        # Start both servers and wait
        trap 'kill $(jobs -p) 2>/dev/null' EXIT
        
        (cd server && go run cmd/api/main.go) &
        (cd client && npm run dev) &
        
        wait
        ;;
        
    "build")
        print_step "Building TaxMate for production..."
        
        # Build server
        print_step "Building server binary..."
        cd server && go build -o bin/api cmd/api/main.go && cd ..
        
        # Build client
        print_step "Building client assets..."
        cd client && npm run build && cd ..
        
        print_step "✅ Build complete!"
        echo "📁 Server binary: server/bin/api"
        echo "📁 Client assets: client/dist/"
        ;;
        
    "test")
        print_step "Running TaxMate test suite..."
        
        # Test server
        print_step "Running server tests..."
        cd server && go test ./... && cd ..
        
        # Test client (if tests exist)
        if [[ -f "client/package.json" ]] && grep -q "\"test\":" client/package.json; then
            print_step "Running client tests..."
            cd client && npm test && cd ..
        fi
        
        print_step "✅ All tests passed!"
        ;;
        
    "clean")
        print_step "Cleaning build artifacts..."
        
        # Clean server builds
        rm -rf server/bin/
        rm -f server/main server/api
        
        # Clean client builds
        rm -rf client/dist/
        
        print_step "✅ Clean complete!"
        ;;
        
    "db")
        case "$2" in
            "migrate")
                print_step "Running database migrations..."
                cd server && go run cmd/migrate/main.go up && cd ..
                ;;
            "rollback")
                print_step "Rolling back last migration..."
                cd server && go run cmd/migrate/main.go down 1 && cd ..
                ;;
            "reset")
                print_step "⚠️  Resetting database (this will delete all data)..."
                read -p "Are you sure? (y/N): " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    cd server && go run cmd/migrate/main.go down && cd ..
                    cd server && go run cmd/migrate/main.go up && cd ..
                    print_step "✅ Database reset complete!"
                else
                    echo "Cancelled."
                fi
                ;;
            *)
                echo "Database commands:"
                echo "  ./scripts/dev.sh db migrate   # Run migrations"
                echo "  ./scripts/dev.sh db rollback  # Rollback last migration"
                echo "  ./scripts/dev.sh db reset     # Reset database (destructive)"
                ;;
        esac
        ;;
        
    "help"|*)
        echo "TaxMate Development Commands:"
        echo ""
        echo "  setup    # Install dependencies and create .env files"
        echo "  start    # Start development servers (client + server)"
        echo "  build    # Build for production"
        echo "  test     # Run test suite"
        echo "  clean    # Remove build artifacts"
        echo "  db       # Database management commands"
        echo "  help     # Show this help message"
        echo ""
        echo "Examples:"
        echo "  ./scripts/dev.sh setup"
        echo "  ./scripts/dev.sh start"
        echo "  ./scripts/dev.sh db migrate"
        ;;
esac