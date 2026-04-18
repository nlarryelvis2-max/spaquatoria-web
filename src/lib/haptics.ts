// iOS-style haptic feedback via Web Vibration API
// Falls back silently on unsupported browsers

export function hapticLight() {
  try { navigator?.vibrate?.(1); } catch {}
}

export function hapticMedium() {
  try { navigator?.vibrate?.(10); } catch {}
}

export function hapticSuccess() {
  try { navigator?.vibrate?.([5, 30, 5]); } catch {}
}

export function hapticError() {
  try { navigator?.vibrate?.([10, 50, 10, 50, 10]); } catch {}
}
