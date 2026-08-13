export type AuthRole = "student" | "employer" | "admin"

export type AuthUser = {
  id: string
  email: string
  name: string
  role: AuthRole
}

export type ProfileSnapshot = {
  user: {
    name: string
    email: string
    headline: string
    location: string
    about: string
    interests: string[]
    avatar: string
  }
  role: AuthRole
  verified: boolean
  onboarding: {
    basics: boolean
    education: boolean
    experience: boolean
    projects: boolean
    achievements: boolean
    skills: boolean
  }
  education: unknown[]
  experiences: unknown[]
  projects: unknown[]
  achievements: unknown[]
  skills: unknown[]
  opportunities?: unknown[]
  applications: unknown[]
  notifications: unknown[]
  portfolio: unknown
  privacy: unknown
  cvTemplate: string
}

export type AuthSessionPayload = {
  sub: string
  email: string
  role: AuthRole
  exp: number
}
