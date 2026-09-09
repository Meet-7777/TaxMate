# Deployment Checklist

## Before Pushing to GitHub

- [x] `.env` added to `.gitignore`
- [x] `.env.example` created with placeholder values
- [x] JWT secret moved from hardcoded to environment variable
- [x] Access token expiry fixed (was 2 seconds, now 15 minutes)
- [x] Refresh token cookie path updated for `/api` prefix
- [x] README created with setup instructions
- [x] Build artifacts ignored (`bin/`, `main`, `api`, `dist/`)
- [x] No database credentials in code
- [x] No API keys or secrets hardcoded

## Before Production Deployment

### Security
- [ ] Generate strong JWT_SECRET (min 64 chars random)
- [ ] Change database password from development default
- [ ] Enable SSL for database connection (`sslmode=require`)
- [ ] Set secure cookie flags in production (add `Secure: true` in handler.go setAuthCookies)
- [ ] Add rate limiting middleware
- [ ] Add CORS configuration for production domain
- [ ] Review and enable security headers (helmet equivalent for Go)

### Database
- [ ] Run migrations on production database
- [ ] Set up automated database backups
- [ ] Configure connection pooling limits
- [ ] Set up read replicas if needed

### Redis
- [ ] Configure Redis password
- [ ] Set up Redis persistence (AOF or RDB)
- [ ] Configure maxmemory policy

### Monitoring
- [ ] Set up application logging (JSON structured logs)
- [ ] Configure error tracking (Sentry, Rollbar, etc.)
- [ ] Set up uptime monitoring
- [ ] Configure alerts for errors and downtime

### Performance
- [ ] Build frontend for production (`npm run build`)
- [ ] Serve frontend with CDN
- [ ] Enable gzip/brotli compression
- [ ] Configure Redis caching for sessions
- [ ] Set up database query performance monitoring

### Environment Variables (Production)
```bash
PORT=8080
DATABASE_URL=postgres://user:password@host:5432/taxmate?sslmode=require
REDIS_URL=host:6379
JWT_SECRET=<64+ character random string>
ENVIRONMENT=production
ALLOWED_ORIGINS=https://taxmate.com.au
```

## Migration Commands

**Check current version:**
```bash
migrate -path migrations -database "$DATABASE_URL" version
```

**Migrate up:**
```bash
migrate -path migrations -database "$DATABASE_URL" up
```

**Rollback one migration:**
```bash
migrate -path migrations -database "$DATABASE_URL" down 1
```

**Force version (if dirty):**
```bash
migrate -path migrations -database "$DATABASE_URL" force <version>
```

## Health Checks

Once deployed, verify:
- `GET /health` returns 200 OK
- `POST /api/auth/signup` creates users
- `POST /api/auth/login` returns cookies
- Frontend can authenticate and reach dashboard
