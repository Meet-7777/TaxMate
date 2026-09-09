# TaxMate Server (Go Backend)

The backend API server for TaxMate, built with Go and following clean architecture principles.

## 🏗️ Project Structure

```
server/
├── cmd/                    # Application entrypoints
│   ├── api/               # Main API server
│   └── migrate/           # Database migration tool
├── internal/              # Private application code
│   ├── auth/              # Authentication service & handlers
│   ├── database/          # Database connections (Postgres, Redis)
│   ├── middleware/        # HTTP middleware (auth, logging, etc.)
│   ├── server/            # HTTP server setup
│   ├── session/           # Session management
│   └── user/              # User repository
├── pkg/                   # Public packages (reusable)
│   └── token/             # JWT token utilities
├── migrations/            # Database schema migrations
├── sql/                   # SQL queries and schemas
├── scripts/               # Build and deployment scripts
├── go.mod                 # Go module dependencies
└── .env                   # Environment variables
```

## 🚀 Quick Start

### Prerequisites
- **Go 1.21+**
- **PostgreSQL 15+** 
- **Redis 6+**
- **golang-migrate** CLI tool

### Setup

1. **Install dependencies**
   ```bash
   go mod download
   ```

2. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Create database**
   ```bash
   createdb taxmate
   ```

4. **Run migrations**
   ```bash
   go run cmd/migrate/main.go up
   ```

5. **Start Redis**
   ```bash
   redis-server
   ```

6. **Run the server**
   ```bash
   go run cmd/api/main.go
   ```

The API server will start on `http://localhost:8080`

## 📡 API Routes

### Public Endpoints
```
POST /api/auth/signup          # User registration
POST /api/auth/login           # User login
POST /api/auth/refresh         # Token refresh
GET  /health                   # Health check
```

### Protected Endpoints (require authentication)
```
GET   /api/me                  # Get current user
PATCH /api/me/profile          # Update user profile
POST  /api/auth/logout         # User logout
POST  /api/auth/change-password # Change password
```

## 🗄️ Database

### Schema
- **users** - User accounts with profiles
- **sessions** - Active user sessions for security

### Migrations
```bash
# Run all pending migrations
go run cmd/migrate/main.go up

# Rollback one migration
go run cmd/migrate/main.go down 1

# Create new migration
migrate create -ext sql -dir migrations -seq add_new_table
```

## 🔒 Authentication Flow

1. **Signup/Login** → Generate JWT access token (15 min) + refresh token (7 days)
2. **Store in HttpOnly cookies** → Prevent XSS attacks
3. **Session tracking** → Database record for immediate revocation
4. **Middleware validation** → Check token + active session on each request
5. **Token refresh** → Automatic renewal with rotation for security
6. **Cross-device logout** → Revoke session across all devices

## ⚙️ Configuration

### Environment Variables
```env
# Server
PORT=8080

# Database
DATABASE_URL=postgres://user:pass@localhost:5432/taxmate?sslmode=disable

# Redis
REDIS_URL=localhost:6379
REDIS_PASSWORD=

# Security
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters
BCRYPT_COST=12

# CORS (production)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## 🧪 Testing

```bash
# Run all tests
go test ./...

# Run tests with coverage
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out

# Run specific package tests
go test ./internal/auth
```

## 📊 Performance & Monitoring

### Health Check
```bash
curl http://localhost:8080/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T10:30:45Z",
  "version": "1.0.0"
}
```

### Logging
- **Structured logging** with Zerolog
- **Request ID tracking** for tracing
- **Error context** with stack traces in development

## 🔧 Development

### Code Organization
- **Handler** → HTTP request/response handling
- **Service** → Business logic and validation  
- **Repository** → Data access layer
- **Middleware** → Cross-cutting concerns (auth, logging, etc.)

### Adding New Features
1. Create migration (if database changes needed)
2. Update repository layer (data access)
3. Implement service layer (business logic)
4. Add handler functions (HTTP endpoints)
5. Register routes in server setup
6. Add tests for each layer

### Dependencies
- **chi** - HTTP router and middleware
- **pgx** - PostgreSQL driver with connection pooling
- **redis** - Redis client for caching/sessions
- **jwt** - JSON Web Token implementation
- **zerolog** - Structured logging
- **testify** - Testing utilities

## 🚀 Deployment

### Build
```bash
# Build binary
go build -o bin/api cmd/api/main.go

# Run binary
./bin/api
```

### Docker
```bash
# Build image
docker build -t taxmate-server .

# Run container
docker run -p 8080:8080 --env-file .env taxmate-server
```

## 📈 Production Considerations

### Security Checklist
- [ ] **Rate limiting** - Prevent API abuse
- [ ] **CORS configuration** - Restrict allowed origins
- [ ] **Secure cookies** - Set `Secure: true` for HTTPS
- [ ] **Database indexes** - Optimize query performance
- [ ] **Request timeouts** - Prevent hanging connections
- [ ] **Input validation** - Sanitize all user input

### Scaling
- **Stateless design** - Can run multiple instances
- **Database connection pooling** - Efficient resource usage
- **Redis caching** - Reduce database load
- **Horizontal scaling** - Add more server instances behind load balancer

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   lsof -ti:8080 | xargs kill -9
   ```

2. **Database connection failed**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env
   - Ensure database exists

3. **Redis connection failed**
   - Check Redis is running: `redis-cli ping`
   - Verify REDIS_URL in .env

4. **Migration errors**
   - Check database permissions
   - Verify migration files are valid SQL
   - Check migration table exists

### Logs
- **Application logs** - Structured JSON with request context
- **Database query logs** - Enable in development for debugging
- **Access logs** - HTTP request/response logging with middleware