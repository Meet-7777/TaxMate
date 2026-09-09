package session

import (
	"time"

	"github.com/google/uuid"
)

type DeviceType string

const (
	DeviceMobile DeviceType = "mobile"
	DeviceLaptop DeviceType = "laptop"
)

func IsValidDeviceType(deviceType DeviceType) bool {
	return deviceType == DeviceMobile || deviceType == DeviceLaptop
}

type Session struct {
	ID               uuid.UUID
	UserID           uuid.UUID
	RefreshTokenHash string
	FamilyID         uuid.UUID
	ReplacedBy       *uuid.UUID
	ExpiresAt        time.Time
	CreatedAt        time.Time
	RotatedAt        *time.Time
	RevokedAt        *time.Time
	DeviceType       DeviceType
}
