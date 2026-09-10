package user

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type WorkType string

const (
	WorkTypeUber           WorkType = "uber"
	WorkTypeDiDi           WorkType = "didi"
	WorkTypeUberEats       WorkType = "ubereats"
	WorkTypeDoorDash       WorkType = "doordash"
	WorkTypeMenulog        WorkType = "menulog"
	WorkTypeCasualEmployee WorkType = "casual_employee"
	WorkTypeFreelancer     WorkType = "freelancer"
	WorkTypeTradie         WorkType = "tradie"
	WorkTypeOther          WorkType = "other"
)

type User struct {
	ID                 uuid.UUID
	Email              string
	PasswordHash       string
	FirstName          *string
	LastName           *string
	PhoneNumber        *string
	ABN                *string
	WorkType           *WorkType
	NeedsBAS           bool
	EmailVerified      bool
	PhoneVerified      bool
	ProfileCompletedAt *time.Time
}

func (u *User) ProfileCompleted() bool {
	return u.ProfileCompletedAt != nil
}

type ProfileData struct {
	FirstName string
	LastName  string
	Phone     string
	ABN       string
	WorkType  WorkType
	NeedsBAS  bool
}

type UserRepository interface {
	Create(ctx context.Context, email string, passwordHash string) (User, error)
	FindByEmail(ctx context.Context, email string) (User, error)
	FindByID(ctx context.Context, id uuid.UUID) (User, error)
	UpdatePassword(ctx context.Context, id uuid.UUID, passwordHash string) error
	UpdateProfile(ctx context.Context, id uuid.UUID, data ProfileData) (User, error)
}

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

const selectCols = `
	id, email, password_hash,
	first_name, last_name, phone_number, abn, work_type, needs_bas,
	email_verified, phone_verified, profile_completed_at`

func scanUser(row interface{ Scan(dest ...any) error }) (User, error) {
	var u User
	err := row.Scan(
		&u.ID,
		&u.Email,
		&u.PasswordHash,
		&u.FirstName,
		&u.LastName,
		&u.PhoneNumber,
		&u.ABN,
		&u.WorkType,
		&u.NeedsBAS,
		&u.EmailVerified,
		&u.PhoneVerified,
		&u.ProfileCompletedAt,
	)
	return u, err
}

func (r *Repository) Create(ctx context.Context, email string, passwordHash string) (User, error) {
	row := r.db.QueryRow(ctx, `
		INSERT INTO users (id, email, password_hash)
		VALUES ($1, $2, $3)
		RETURNING `+selectCols,
		uuid.New(), email, passwordHash,
	)
	return scanUser(row)
}

func (r *Repository) FindByEmail(ctx context.Context, email string) (User, error) {
	row := r.db.QueryRow(ctx,
		`SELECT `+selectCols+` FROM users WHERE email = $1`, email)
	return scanUser(row)
}

func (r *Repository) FindByID(ctx context.Context, id uuid.UUID) (User, error) {
	row := r.db.QueryRow(ctx,
		`SELECT `+selectCols+` FROM users WHERE id = $1`, id)
	return scanUser(row)
}

func (r *Repository) UpdatePassword(ctx context.Context, id uuid.UUID, passwordHash string) error {
	_, err := r.db.Exec(ctx,
		`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
		passwordHash, id)
	return err
}

func (r *Repository) UpdateProfile(ctx context.Context, id uuid.UUID, data ProfileData) (User, error) {
	var phone *string
	if data.Phone != "" {
		phone = &data.Phone
	}

	row := r.db.QueryRow(ctx, `
		UPDATE users SET
			first_name           = $1,
			last_name            = $2,
			phone_number         = $3,
			abn                  = $4,
			work_type            = $5,
			needs_bas            = $6,
			profile_completed_at = COALESCE(profile_completed_at, NOW()),
			updated_at           = NOW()
		WHERE id = $7
		RETURNING `+selectCols,
		data.FirstName,
		data.LastName,
		phone,
		data.ABN,
		data.WorkType,
		data.NeedsBAS,
		id,
	)
	return scanUser(row)
}
