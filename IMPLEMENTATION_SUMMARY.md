# Phone & ABN Uniqueness - Implementation Summary

## ✅ Requirements Met

### 1. Signup Flow
- **Phone NOT required** at signup
- Only email + password needed to create account
- User can sign up without providing phone number

### 2. Profile Completion/Edit Flow  
- **Phone IS required** when completing profile (onboarding)
- Phone field shows **no "(optional)" label** - it's mandatory
- Both **Phone and ABN must be unique** across all users
- Proper error handling for duplicates

## ✅ Backend Implementation

### Database (Migrations Applied)
```sql
-- Migration 000007: Added ABN unique constraint
ALTER TABLE users ADD CONSTRAINT users_abn_key UNIQUE (abn);

-- Migration 000008: Made phone nullable (not required at signup)
ALTER TABLE users ALTER COLUMN phone_number DROP NOT NULL;
```

**Current Schema:**
- `phone_number TEXT UNIQUE` (nullable, unique when provided)
- `abn TEXT UNIQUE` (nullable, unique when provided)

### Service Layer (`server/internal/auth/service.go`)
```go
var ErrPhoneAlreadyExists = errors.New("phone number already registered")
var ErrABNAlreadyExists = errors.New("ABN already registered")

// UpdateProfile checks both constraints and returns specific errors
if pgErr.ConstraintName == "users_phone_number_key" {
    return user.User{}, ErrPhoneAlreadyExists
}
if pgErr.ConstraintName == "users_abn_key" {
    return user.User{}, ErrABNAlreadyExists
}
```

### Handler Layer (`server/internal/auth/handler.go`)
```go
// Validation: phone is required during profile completion
if req.Phone == "" {
    http.Error(w, "phone is required", http.StatusBadRequest)
    return
}

// Error handling for duplicates
if errors.Is(err, ErrPhoneAlreadyExists) {
    http.Error(w, err.Error(), http.StatusConflict)
    return
}
if errors.Is(err, ErrABNAlreadyExists) {
    http.Error(w, err.Error(), http.StatusConflict)
    return
}
```

## ✅ Frontend Implementation

### Schema Validation (`client/src/lib/schemas.ts`)
```typescript
export const profileStep1Schema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name:  z.string().min(1, 'Last name is required'),
  phone:      z.string().min(1, 'Phone number is required'), // ✅ Required
})
```

### Onboarding Page (`client/src/pages/OnboardingPage.tsx`)
- Phone field labeled as **"Phone"** (no "optional" text)
- Error handling navigates user to correct step:
  - Phone duplicate → back to Step 1
  - ABN duplicate → back to Step 2

```typescript
if (errorMessage.includes('phone number already registered')) {
  setFormError('This phone number is already registered. Please use a different phone number.')
  goTo(1) // Go back to step 1
} else if (errorMessage.includes('ABN already registered')) {
  setFormError('This ABN is already registered. Please use a different ABN.')
  goTo(2) // Go back to step 2
}
```

### Profile Page (`client/src/pages/ProfilePage.tsx`)
- Phone field labeled as **"Phone *"** (required indicator)
- Validation enforces phone is not empty
- Inline error display for duplicate phone/ABN

## ✅ API Endpoints

### POST /api/auth/signup
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- ❌ Phone NOT required

### PATCH /api/me/profile
**Request:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "0412345678",      // ✅ Required
  "abn": "12345678901",       // ✅ Required, must be unique
  "work_type": "uber",
  "needs_bas": true
}
```

**Error Responses:**
- `400 Bad Request`: "phone is required" (if phone empty)
- `409 Conflict`: "phone number already registered" (if duplicate phone)
- `409 Conflict`: "ABN already registered" (if duplicate ABN)

## ✅ Testing Status

- ✅ Migrations applied successfully
- ✅ Backend compiles without errors
- ✅ Database constraints verified:
  - `users_phone_number_key` UNIQUE exists
  - `users_abn_key` UNIQUE exists
  - `phone_number` is nullable
  - `abn` is nullable

## User Experience Flow

1. **Signup**: User enters email + password → Account created ✅
2. **Onboarding Step 1**: User enters name + phone (required) ✅
3. **Onboarding Step 2**: User enters ABN (required, checked for uniqueness) ✅
4. **Submit**: If phone/ABN duplicate detected → User sees error and goes back to correct step ✅
5. **Profile Edit**: Same validation and uniqueness checks apply ✅

## Files Modified

### Backend
- `server/migrations/000007_add_unique_constraints.up.sql` (created)
- `server/migrations/000007_add_unique_constraints.down.sql` (created)
- `server/migrations/000008_make_phone_nullable.up.sql` (created)
- `server/migrations/000008_make_phone_nullable.down.sql` (created)
- `server/internal/auth/service.go` (updated)
- `server/internal/auth/handler.go` (updated)

### Frontend
- `client/src/lib/schemas.ts` (updated)
- `client/src/pages/OnboardingPage.tsx` (updated)
- `client/src/pages/ProfilePage.tsx` (updated)

## Summary

✅ **Signup**: Phone NOT required  
✅ **Profile completion**: Phone required, no "(optional)" label  
✅ **ABN uniqueness**: Properly handled with specific error messages  
✅ **Phone uniqueness**: Properly handled with specific error messages  
✅ **Error UX**: Users navigated back to appropriate step when duplicate detected
