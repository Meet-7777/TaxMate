# Phone Number and ABN Uniqueness Implementation

## Summary
Made phone number required during profile completion (not at signup) and ensured both ABN and phone number are unique across all users.

## Changes Made

### 1. Database Migrations

**Migration 000007**: `add_unique_constraints`
- Added unique constraint `users_abn_key` on the `abn` column
- Note: phone_number already has unique constraint from migration 000001

**Migration 000008**: `make_phone_nullable`
- Made `phone_number` column nullable (not required at signup)
- Phone is validated as required only during profile completion

### 2. Service Layer Updates
**File**: `server/internal/auth/service.go`
- Added new error: `ErrABNAlreadyExists`
- Enhanced `UpdateProfile` to check for both phone and ABN uniqueness violations
- Returns specific error when ABN is already registered (constraint `users_abn_key`)
- Returns specific error when phone is already registered (constraint `users_phone_number_key`)

### 3. Handler Layer Updates
**File**: `server/internal/auth/handler.go`
- Added validation: phone is required during profile completion
- Added error handling for `ErrABNAlreadyExists` with HTTP 409 Conflict status
- Both phone and ABN validation return appropriate HTTP status codes:
  - 400 Bad Request for missing fields
  - 409 Conflict for duplicate values

### 4. Repository Layer Updates
**File**: `server/internal/user/repository.go`
- Phone remains nullable in database (handles empty string → NULL conversion)
- Phone is validated as required in the handler layer during profile updates

### 5. Client Updates

**File**: `client/src/lib/schemas.ts`
- Updated `profileStep1Schema` to make phone required (validation)

**File**: `client/src/pages/OnboardingPage.tsx`
- Removed "(optional)" label from phone field
- Added phone field validation error display
- Enhanced error handling to detect duplicate phone/ABN errors
- Navigates user back to appropriate step when duplicate detected

**File**: `client/src/pages/ProfilePage.tsx`
- Made phone field required with validation
- Added error handling for duplicate phone/ABN
- Shows inline field errors for duplicates

## Validation Rules

### Signup Endpoint
Required fields:
- ✅ `email`
- ✅ `password`
- ❌ `phone` (NOT required at signup)

### UpdateProfile Endpoint (Profile Completion)
Required fields:
- ✅ `first_name`
- ✅ `last_name`
- ✅ `phone` (required during profile completion)
- ✅ `abn`
- ✅ `work_type`

Unique constraints:
- ✅ `phone_number` must be unique across all users (when provided)
- ✅ `abn` must be unique across all users

## Error Responses

| Error | HTTP Status | Message |
|-------|-------------|---------|
| Phone number already exists | 409 Conflict | "phone number already registered" |
| ABN already exists | 409 Conflict | "ABN already registered" |
| Phone not provided (profile completion) | 400 Bad Request | "phone is required" |

## Database Schema

```sql
-- users table relevant columns
phone_number TEXT UNIQUE,  -- nullable, unique when provided
abn TEXT UNIQUE,           -- nullable, unique when provided
```

## Migration History

```bash
# Applied migrations:
000001_create_users          # Created users table with phone_number UNIQUE
000007_add_unique_constraints # Added ABN unique constraint
000008_make_phone_nullable    # Made phone_number nullable
```

## User Flow

1. **Signup**: User creates account with email + password (no phone required)
2. **Profile Completion**: User must provide phone number (validated as required)
3. **Uniqueness Check**: Both phone and ABN are checked for duplicates
4. **Error Handling**: User is navigated to the appropriate step if duplicate detected

## Testing

✅ Migrations applied successfully
✅ Backend code compiles
✅ Database constraints verified:
  - `users_abn_key` UNIQUE constraint exists
  - `users_phone_number_key` UNIQUE constraint exists
  - `phone_number` is nullable
  - `abn` is nullable
