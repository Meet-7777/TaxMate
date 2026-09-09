# TaxMate

A comprehensive tax management platform for Australian ABN holders, built with Go (backend) and React (frontend).

## 🏗️ Project Structure

```
taxmate/
├── client/                 # React frontend application
│   ├── src/               # React source code
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   └── vite.config.ts     # Vite configuration
├── server/                # Go backend application
│   ├── cmd/               # Application entrypoints
│   ├── internal/          # Private application code
│   ├── pkg/               # Public packages
│   ├── migrations/        # Database migrations
│   ├── go.mod             # Go dependencies
│   └── .env               # Server environment variables
├── docs/                  # Project documentation
├── .github/               # GitHub workflows
├── README.md              # This file
├── DEVELOPMENT_PROGRESS.md # Development checklist
├── PRODUCTION_AUDIT.md    # Security and production readiness
└── .gitignore            # Git ignore rules
```

## ✨ Features

### 🔐 Authentication & Security
- **Secure JWT Authentication** - Access + refresh token flow
- **Multi-device Session Management** - Cross-device logout support
- **Password Security** - Argon2id hashing with random salts
- **Session Tracking** - Database-backed with immediate revocation
- **HttpOnly Cookies** - XSS prevention with secure token storage

### 👤 User Experience
- **User Registration & Login** - Complete onboarding flow
- **Profile Management** - ABN, work type, and tax preferences
- **3-Step Onboarding Wizard** - Guided setup for new users
- **Responsive Design** - Mobile-friendly across all devices
- **Real-time Validation** - Instant form feedback and error handling

### 🎯 Business Logic
- **Australian Tax Focus** - ABN validation and GST requirements
- **Work Type Detection** - Auto-configure BAS needs based on work type
- **Pricing Tiers** - $59 (tax-only) vs $69 (tax+BAS)
- **Professional Workflow** - Ready for accountant integration

## 🚀 Quick Start

### Prerequisites
- **Go 1.21+** - Backend language
- **Node.js 18+** - Frontend tooling
- **PostgreSQL 15+** - Primary database
- **Redis 6+** - Session storage and caching

### 🖥️ Backend Setup (Server)

```bash
# Navigate to server directory
cd server

# Install Go dependencies
go mod download

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Setup database
createdb taxmate
go run cmd/migrate/main.go up

# Run the server
go run cmd/api/main.go
```

### 🎨 Frontend Setup (Client)

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with API URL (usually http://localhost:8080)

# Run development server
npm run dev
```

### 🌐 Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/health

## 🏛️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │────│   Go API Server  │────│   PostgreSQL    │
│   (Port 5173)   │    │   (Port 8080)    │    │   (Port 5432)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                         
                                │                ┌─────────────────┐
                                └────────────────│     Redis       │
                                                 │   (Port 6379)   │
                                                 └─────────────────┘
```

## 📡 API Endpoints

### Authentication
```
POST /api/auth/signup          # User registration
POST /api/auth/login           # User login  
POST /api/auth/refresh         # Refresh access token
POST /api/auth/logout          # User logout
POST /api/auth/change-password # Change password
```

### User Management
```
GET  /api/me                   # Get current user profile
PATCH /api/me/profile          # Update user profile
```

### System
```
GET /health                    # Health check endpoint
```

## 🗄️ Database Schema

### Users Table
```sql
users (
    id UUID PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    first_name VARCHAR,
    last_name VARCHAR,
    abn VARCHAR,
    work_type VARCHAR,           -- uber, didi, freelancer, tradie, etc.
    needs_bas BOOLEAN,           -- Auto-set based on work_type
    profile_completed_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

### Sessions Table  
```sql
sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    refresh_token_hash VARCHAR NOT NULL,
    device_type VARCHAR DEFAULT 'laptop',
    expires_at TIMESTAMP,
    created_at TIMESTAMP,
    revoked_at TIMESTAMP
)
```

## 🔒 Security Features

- **Password Hashing**: Argon2id with random salts
- **JWT Security**: Short-lived access tokens (15 min) with refresh flow
- **Session Management**: Database-backed with immediate cross-device revocation
- **Input Validation**: Comprehensive validation with Zod schemas
- **SQL Injection Prevention**: Parameterized queries throughout
- **XSS Prevention**: HttpOnly cookies and secure headers
- **CSRF Protection**: SameSite cookie configuration

## 🧪 Development

### Running Tests
```bash
# Backend tests
cd server && go test ./...

# Frontend tests  
cd client && npm test
```

### Database Migrations
```bash
cd server

# Create new migration
migrate create -ext sql -dir migrations -seq migration_name

# Run migrations
go run cmd/migrate/main.go up

# Rollback migration
go run cmd/migrate/main.go down 1
```

### Code Quality
```bash
# Backend linting
cd server && golangci-lint run

# Frontend linting
cd client && npm run lint
```

## 📈 Development Progress

**Core Authentication**: ✅ Complete  
**User Profiles**: ✅ Complete  
**Frontend**: ✅ Complete  
**Production Hardening**: 🟡 In Progress (see PRODUCTION_AUDIT.md)  
**Document Management**: 🔵 Planned  
**Tax Workflow**: 🔵 Planned  

See `DEVELOPMENT_PROGRESS.md` for detailed 30-day development checklist.

## 🚀 Deployment

### Production Readiness Checklist
- [ ] Fix RefreshCoordinator memory leak
- [ ] Add rate limiting middleware  
- [ ] Set secure cookie flags (`Secure: true`)
- [ ] Add database indexes for sessions table
- [ ] Configure CORS for production domain
- [ ] Set up SSL/TLS certificates
- [ ] Configure monitoring and logging

See `PRODUCTION_AUDIT.md` for security audit and `DEPLOY.md` for deployment guide.

## 🛠️ Tech Stack

### Backend (Server)
- **Go 1.21+** - Core language
- **Chi Router** - HTTP routing and middleware
- **PostgreSQL** - Primary database with pgx driver
- **Redis** - Session storage and caching
- **JWT** - Authentication tokens
- **Zerolog** - Structured logging

### Frontend (Client)  
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first styling
- **shadcn/ui** - Component library
- **React Hook Form** - Form validation
- **Zod** - Runtime type checking
- **Axios** - HTTP client with interceptors

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@taxmate.com.au or create an issue in this repository.