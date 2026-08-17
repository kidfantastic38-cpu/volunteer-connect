/** Shared production/runtime flags. Server-only — do not import from client components. */

export function isVercelProduction(): boolean {
  return process.env.VERCEL_ENV === "production"
}

export function isProductionRuntime(): boolean {
  if (isVercelProduction()) return true
  if (process.env.VERCEL_ENV === "preview" || process.env.VERCEL_ENV === "development") return false
  return process.env.NODE_ENV === "production"
}

/** Demo OTP only when explicitly enabled in local development. Never on Vercel. */
export function allowDemoOtp(): boolean {
  if (process.env.VERCEL) return false
  if (isVercelProduction()) return false
  if (isProductionRuntime()) return false
  return process.env.ALLOW_DEMO_OTP === "true"
}

/** Insert-if-absent demo accounts/catalog. Never runs on Vercel or production. */
export function allowDevSeed(): boolean {
  if (process.env.VERCEL) return false
  if (isVercelProduction()) return false
  if (isProductionRuntime()) return false
  return true
}
