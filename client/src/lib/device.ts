import type { DeviceType } from '@/api/auth'

// Detect whether the current device is mobile or laptop/desktop.
// Uses navigator.userAgent — no library needed.
// The backend only accepts "mobile" | "laptop" so we map everything else to "laptop".
export function detectDeviceType(): DeviceType {
  const ua = navigator.userAgent
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
  // iPad with iPadOS 13+ reports as desktop Safari — check for touch + small screen
  const isTabletLike = navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua)
  return isMobile || isTabletLike ? 'mobile' : 'laptop'
}
