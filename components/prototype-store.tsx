"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { apiLogout, apiMe, apiSaveProfile, type AuthResponse } from "@/lib/auth/client"
import type { AuthUser, ProfileSnapshot } from "@/lib/auth/types"

/* ---------------------------------- Types --------------------------------- */

export type EvidenceStatus = "pending" | "verified"
export type EvidenceType = "certificate" | "reference" | "photo" | "link" | "document"

export type Evidence = {
  id: string
  type: EvidenceType
  label: string
  status: EvidenceStatus
}

export type Skill = {
  id: string
  name: string
  level: number // 1-5
  category: "Communication" | "Leadership" | "Technical" | "Teamwork" | "Problem Solving" | "Creativity" | "Organization"
  source: string
  verified: boolean
}

export type Education = {
  id: string
  institution: string
  qualification: string
  field: string
  start: string
  end: string
  grade?: string
  description?: string
}

export type ExperienceType = "volunteer" | "internship" | "work"

export type Experience = {
  id: string
  type: ExperienceType
  role: string
  organization: string
  location: string
  start: string
  end: string
  current: boolean
  hours?: number
  description: string
  skills: string[]
  evidence: Evidence[]
}

export type Project = {
  id: string
  title: string
  category: "school" | "community" | "personal"
  role: string
  description: string
  outcome: string
  link?: string
  skills: string[]
  evidence: Evidence[]
}

export type Achievement = {
  id: string
  title: string
  issuer: string
  date: string
  category: "award" | "certification" | "leadership"
  description: string
  evidence: Evidence[]
}

export type OppType = "job" | "internship" | "scholarship" | "volunteering" | "training"

export type Opportunity = {
  id: string
  title: string
  org: string
  type: OppType
  location: string
  remote: boolean
  description: string
  skills: string[]
  deadline: string
  compensation?: string
  providerId?: string
  applicants?: number
}

export type ApplicationStatus = "saved" | "applied" | "interview" | "offer" | "rejected"

export type Application = {
  opportunityId: string
  status: ApplicationStatus
  updatedAt: string
}

export type Profile = {
  name: string
  email: string
  headline: string
  location: string
  about: string
  interests: string[]
  avatar: string // initials color hex-ish token
}

export type Role = "student" | "employer" | "admin"

export type NotificationKind = "match" | "application" | "verification" | "system" | "endorsement"

export type AppNotification = {
  id: string
  kind: NotificationKind
  title: string
  body: string
  time: string
  read: boolean
  href?: string
}

export type CvTemplate = "modern" | "classic" | "compact"
export type PortfolioTheme = "aurora" | "minimal" | "bold"
export type Visibility = "public" | "unlisted" | "private"

export type PortfolioSettings = {
  published: boolean
  theme: PortfolioTheme
  slug: string
  visibility: Visibility
  showContact: boolean
  showEvidence: boolean
  tagline: string
}

export type PrivacySettings = {
  searchable: boolean
  showToEmployers: boolean
  shareAnalytics: boolean
  emailNotifications: boolean
  matchAlerts: boolean
}

export type AdminUser = {
  id: string
  name: string
  email: string
  role: Exclude<Role, "admin">
  status: "active" | "pending" | "suspended"
  joined: string
  profileStrength: number
}

export type PlatformCategory = {
  id: string
  name: string
  skillCount: number
  active: boolean
}

/* --------------------------------- Seed data ------------------------------- */

const uid = () => Math.random().toString(36).slice(2, 9)

const demoEducation: Education[] = [
  {
    id: uid(),
    institution: "Riverside Community College",
    qualification: "A-Levels",
    field: "Biology, Psychology, Sociology",
    start: "2022",
    end: "2024",
    grade: "AAB",
    description: "Head of the student wellbeing committee; organised peer-support sessions.",
  },
]

const demoExperiences: Experience[] = [
  {
    id: uid(),
    type: "volunteer",
    role: "Youth Mentor",
    organization: "Bright Futures Community Trust",
    location: "Manchester, UK",
    start: "2023-01",
    end: "",
    current: true,
    hours: 240,
    description:
      "Mentored a group of 12 teenagers weekly, running study clubs and confidence workshops. Coordinated volunteers and reported outcomes to the programme lead.",
    skills: ["Mentoring", "Communication", "Organization"],
    evidence: [
      { id: uid(), type: "reference", label: "Reference — Programme Lead", status: "verified" },
      { id: uid(), type: "certificate", label: "Safeguarding Level 1", status: "verified" },
    ],
  },
  {
    id: uid(),
    type: "internship",
    role: "Marketing Intern",
    organization: "GreenLeaf Startups",
    location: "Remote",
    start: "2023-07",
    end: "2023-09",
    current: false,
    hours: 160,
    description:
      "Ran the social channels for a sustainability startup, growing engagement 38% over the summer and building a content calendar the team still uses.",
    skills: ["Content Creation", "Analytics", "Creativity"],
    evidence: [{ id: uid(), type: "link", label: "Campaign portfolio link", status: "pending" }],
  },
]

const demoProjects: Project[] = [
  {
    id: uid(),
    title: "Campus Recycling Drive",
    category: "community",
    role: "Project Lead",
    description:
      "Designed and led a term-long recycling initiative across the college campus, coordinating 20 volunteers.",
    outcome: "Diverted an estimated 1.2 tonnes of waste and won the regional Youth Green Award.",
    link: "",
    skills: ["Leadership", "Project Management", "Teamwork"],
    evidence: [{ id: uid(), type: "photo", label: "Event photos", status: "verified" }],
  },
]

const demoAchievements: Achievement[] = [
  {
    id: uid(),
    title: "Regional Youth Green Award",
    issuer: "North West Youth Council",
    date: "2024-03",
    category: "award",
    description: "Recognised for outstanding community environmental leadership.",
    evidence: [{ id: uid(), type: "certificate", label: "Award certificate", status: "verified" }],
  },
  {
    id: uid(),
    title: "Duke of Edinburgh — Silver",
    issuer: "DofE",
    date: "2023-08",
    category: "certification",
    description: "Completed volunteering, physical, skills and expedition sections.",
    evidence: [{ id: uid(), type: "certificate", label: "DofE certificate", status: "verified" }],
  },
]

const demoSkills: Skill[] = [
  { id: uid(), name: "Communication", level: 5, category: "Communication", source: "Youth Mentor", verified: true },
  { id: uid(), name: "Leadership", level: 4, category: "Leadership", source: "Recycling Drive", verified: true },
  { id: uid(), name: "Teamwork", level: 4, category: "Teamwork", source: "Recycling Drive", verified: true },
  { id: uid(), name: "Organization", level: 4, category: "Organization", source: "Youth Mentor", verified: true },
  { id: uid(), name: "Content Creation", level: 3, category: "Creativity", source: "Marketing Intern", verified: false },
  { id: uid(), name: "Analytics", level: 3, category: "Technical", source: "Marketing Intern", verified: false },
  { id: uid(), name: "Problem Solving", level: 4, category: "Problem Solving", source: "Recycling Drive", verified: true },
]

const demoProfile: Profile = {
  name: "Amara Okafor",
  email: "amara@example.com",
  headline: "Aspiring community & sustainability leader",
  location: "Manchester, UK",
  about:
    "18-year-old college leaver with two years of hands-on volunteering and a marketing internship. Passionate about community impact, sustainability and youth work.",
  interests: ["Sustainability", "Community work", "Marketing", "Youth mentoring"],
  avatar: "chart-1",
}

const seedOpportunities: Opportunity[] = [
  {
    id: "op-1",
    title: "Sustainability Programme Assistant",
    org: "EarthWise Foundation",
    type: "job",
    location: "Manchester, UK",
    remote: false,
    description: "Support the delivery of community sustainability programmes and volunteer coordination.",
    skills: ["Leadership", "Organization", "Communication", "Teamwork"],
    deadline: "2026-09-15",
    compensation: "£23,000 / year",
    applicants: 34,
  },
  {
    id: "op-2",
    title: "Digital Marketing Internship",
    org: "GreenLeaf Startups",
    type: "internship",
    location: "Remote",
    remote: true,
    description: "12-week paid internship running social campaigns for climate-focused startups.",
    skills: ["Content Creation", "Analytics", "Creativity", "Communication"],
    deadline: "2026-08-30",
    compensation: "£1,400 / month",
    applicants: 58,
  },
  {
    id: "op-3",
    title: "Youth Leadership Scholarship",
    org: "Future Leaders Trust",
    type: "scholarship",
    location: "UK-wide",
    remote: true,
    description: "£5,000 scholarship for young people demonstrating exceptional community leadership.",
    skills: ["Leadership", "Communication", "Problem Solving"],
    deadline: "2026-10-01",
    compensation: "£5,000 award",
    applicants: 120,
  },
  {
    id: "op-4",
    title: "Weekend Food Bank Volunteer",
    org: "City Harvest",
    type: "volunteering",
    location: "Manchester, UK",
    remote: false,
    description: "Help sort and distribute food parcels to local families every Saturday.",
    skills: ["Teamwork", "Organization"],
    deadline: "2026-12-31",
    applicants: 12,
  },
  {
    id: "op-5",
    title: "Data & Impact Analysis Bootcamp",
    org: "SkillBridge Academy",
    type: "training",
    location: "Online",
    remote: true,
    description: "Free 6-week training in measuring social impact with spreadsheets and dashboards.",
    skills: ["Analytics", "Technical", "Problem Solving"],
    deadline: "2026-09-20",
    applicants: 90,
  },
  {
    id: "op-6",
    title: "Communications Assistant",
    org: "Northern Arts Collective",
    type: "job",
    location: "Leeds, UK",
    remote: false,
    description: "Draft newsletters, manage the events calendar and support the small comms team.",
    skills: ["Communication", "Content Creation", "Organization"],
    deadline: "2026-09-10",
    compensation: "£21,500 / year",
    applicants: 26,
  },
]

const demoNotifications: AppNotification[] = [
  {
    id: uid(),
    kind: "match",
    title: "New 95% match",
    body: "Sustainability Programme Assistant at EarthWise Foundation fits your verified skills.",
    time: "2h ago",
    read: false,
    href: "/opportunities",
  },
  {
    id: uid(),
    kind: "verification",
    title: "Evidence verified",
    body: "Your Safeguarding Level 1 certificate was verified by the programme lead.",
    time: "1d ago",
    read: false,
    href: "/profile",
  },
  {
    id: uid(),
    kind: "application",
    title: "Application update",
    body: "GreenLeaf Startups moved your internship application to Interview.",
    time: "3d ago",
    read: true,
    href: "/applications",
  },
  {
    id: uid(),
    kind: "endorsement",
    title: "Skill endorsed",
    body: "A mentor endorsed your Leadership skill from the Campus Recycling Drive.",
    time: "5d ago",
    read: true,
    href: "/skills",
  },
]

const defaultPortfolio: PortfolioSettings = {
  published: false,
  theme: "aurora",
  slug: "amara-okafor",
  visibility: "unlisted",
  showContact: true,
  showEvidence: true,
  tagline: "Turning community impact into a career in sustainability.",
}

const defaultPrivacy: PrivacySettings = {
  searchable: true,
  showToEmployers: true,
  shareAnalytics: false,
  emailNotifications: true,
  matchAlerts: true,
}

const seedAdminUsers: AdminUser[] = [
  { id: uid(), name: "Amara Okafor", email: "amara@example.com", role: "student", status: "active", joined: "2024-01-12", profileStrength: 100 },
  { id: uid(), name: "James Whitfield", email: "james@example.com", role: "student", status: "active", joined: "2024-02-03", profileStrength: 72 },
  { id: uid(), name: "Priya Nair", email: "priya@example.com", role: "student", status: "pending", joined: "2024-03-19", profileStrength: 34 },
  { id: uid(), name: "EarthWise Foundation", email: "hello@earthwise.org", role: "employer", status: "active", joined: "2024-01-30", profileStrength: 88 },
  { id: uid(), name: "GreenLeaf Startups", email: "team@greenleaf.io", role: "employer", status: "active", joined: "2024-02-22", profileStrength: 95 },
  { id: uid(), name: "SkillBridge Academy", email: "admin@skillbridge.ac", role: "employer", status: "suspended", joined: "2024-03-01", profileStrength: 60 },
]

const seedCategories: PlatformCategory[] = [
  { id: uid(), name: "Communication", skillCount: 14, active: true },
  { id: uid(), name: "Leadership", skillCount: 11, active: true },
  { id: uid(), name: "Technical", skillCount: 22, active: true },
  { id: uid(), name: "Teamwork", skillCount: 9, active: true },
  { id: uid(), name: "Problem Solving", skillCount: 8, active: true },
  { id: uid(), name: "Creativity", skillCount: 7, active: true },
  { id: uid(), name: "Organization", skillCount: 10, active: false },
]

/* --------------------------------- Context --------------------------------- */

export type OnboardingState = {
  basics: boolean
  education: boolean
  experience: boolean
  projects: boolean
  achievements: boolean
  skills: boolean
}

type Store = {
  sessionReady: boolean
  accountId: string | null
  role: Role | null
  user: Profile | null
  loggedIn: boolean
  verified: boolean
  onboarding: OnboardingState
  education: Education[]
  experiences: Experience[]
  projects: Project[]
  achievements: Achievement[]
  skills: Skill[]
  opportunities: Opportunity[]
  applications: Application[]
  notifications: AppNotification[]
  portfolio: PortfolioSettings
  privacy: PrivacySettings
  cvTemplate: CvTemplate
  adminUsers: AdminUser[]
  categories: PlatformCategory[]
  // auth — session is cookie + SQLite only; these hydrate UI from API payloads
  restoreAccount: (payload: AuthResponse) => void
  verifyAccount: () => void
  logout: () => void
  // notifications
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  // portfolio / cv / privacy
  updatePortfolio: (p: Partial<PortfolioSettings>) => void
  publishPortfolio: () => void
  setCvTemplate: (t: CvTemplate) => void
  updatePrivacy: (p: Partial<PrivacySettings>) => void
  // admin
  setUserStatus: (id: string, status: AdminUser["status"]) => void
  toggleCategory: (id: string) => void
  addCategory: (name: string) => void
  removeOpportunity: (id: string) => void
  // profile
  updateProfile: (p: Partial<Profile>) => void
  setOnboardingStep: (k: keyof OnboardingState, v: boolean) => void
  // crud
  addEducation: (e: Omit<Education, "id">) => void
  removeEducation: (id: string) => void
  addExperience: (e: Omit<Experience, "id">) => void
  removeExperience: (id: string) => void
  addProject: (p: Omit<Project, "id">) => void
  removeProject: (id: string) => void
  addAchievement: (a: Omit<Achievement, "id">) => void
  removeAchievement: (id: string) => void
  addSkill: (s: Omit<Skill, "id">) => void
  removeSkill: (id: string) => void
  loadSample: () => void
  // opportunities
  setApplication: (opportunityId: string, status: ApplicationStatus) => void
  postOpportunity: (o: Omit<Opportunity, "id" | "providerId" | "applicants">) => void
  matchScore: (o: Opportunity) => number
}

const Ctx = createContext<Store | null>(null)

const emptyOnboarding: OnboardingState = {
  basics: false,
  education: false,
  experience: false,
  projects: false,
  achievements: false,
  skills: false,
}

function emptyProfile(account: AuthUser): Profile {
  return {
    name: account.name,
    email: account.email,
    headline: account.role === "student" ? "New member" : account.role === "admin" ? "Platform administrator" : "Opportunity provider",
    location: "",
    about: "",
    interests: [],
    avatar: account.role === "admin" ? "chart-4" : "chart-1",
  }
}

function applyAccountPayload(
  payload: AuthResponse,
  set: {
    setAccountId: (v: string | null) => void
    setRole: (v: Role | null) => void
    setUser: (v: Profile | null) => void
    setLoggedIn: (v: boolean) => void
    setVerified: (v: boolean) => void
    setOnboarding: (v: OnboardingState) => void
    setEducation: (v: Education[]) => void
    setExperiences: (v: Experience[]) => void
    setProjects: (v: Project[]) => void
    setAchievements: (v: Achievement[]) => void
    setSkills: (v: Skill[]) => void
    setApplications: (v: Application[]) => void
    setNotifications: (v: AppNotification[]) => void
    setPortfolio: (v: PortfolioSettings) => void
    setPrivacy: (v: PrivacySettings) => void
    setCvTemplateState: (v: CvTemplate) => void
  },
) {
  const { user: account, snapshot } = payload
  set.setAccountId(account.id)
  set.setRole(account.role)
  set.setLoggedIn(true)

  if (snapshot?.user) {
    set.setUser(snapshot.user)
    set.setVerified(snapshot.verified)
    set.setOnboarding(snapshot.onboarding ?? emptyOnboarding)
    set.setEducation((snapshot.education as Education[]) ?? [])
    set.setExperiences((snapshot.experiences as Experience[]) ?? [])
    set.setProjects((snapshot.projects as Project[]) ?? [])
    set.setAchievements((snapshot.achievements as Achievement[]) ?? [])
    set.setSkills((snapshot.skills as Skill[]) ?? [])
    set.setApplications((snapshot.applications as Application[]) ?? [])
    set.setNotifications((snapshot.notifications as AppNotification[]) ?? [])
    set.setPortfolio((snapshot.portfolio as PortfolioSettings) ?? defaultPortfolio)
    set.setPrivacy((snapshot.privacy as PrivacySettings) ?? defaultPrivacy)
    set.setCvTemplateState((snapshot.cvTemplate as CvTemplate) ?? "modern")
    return
  }

  set.setUser(emptyProfile(account))
  set.setVerified(account.role === "admin")
  set.setOnboarding(emptyOnboarding)
  set.setEducation([])
  set.setExperiences([])
  set.setProjects([])
  set.setAchievements([])
  set.setSkills([])
  set.setApplications([])
  set.setNotifications([])
  set.setPortfolio({
    ...defaultPortfolio,
    slug: account.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "my-portfolio",
  })
  set.setPrivacy(defaultPrivacy)
  set.setCvTemplateState("modern")
}

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [sessionReady, setSessionReady] = useState(false)
  const [accountId, setAccountId] = useState<string | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [user, setUser] = useState<Profile | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const [verified, setVerified] = useState(false)
  const [onboarding, setOnboarding] = useState<OnboardingState>(emptyOnboarding)
  const [education, setEducation] = useState<Education[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>(seedOpportunities)
  const [applications, setApplications] = useState<Application[]>([])
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioSettings>(defaultPortfolio)
  const [privacy, setPrivacy] = useState<PrivacySettings>(defaultPrivacy)
  const [cvTemplate, setCvTemplateState] = useState<CvTemplate>("modern")
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(seedAdminUsers)
  const [categories, setCategories] = useState<PlatformCategory[]>(seedCategories)

  useEffect(() => {
    const boot = async () => {
      try {
        sessionStorage.removeItem("vc-demo-session")
      } catch {
        /* ignore */
      }
      const remote = await apiMe()
      if (remote?.user) {
        applyAccountPayload(remote, {
          setAccountId,
          setRole,
          setUser,
          setLoggedIn,
          setVerified,
          setOnboarding,
          setEducation,
          setExperiences,
          setProjects,
          setAchievements,
          setSkills,
          setApplications,
          setNotifications,
          setPortfolio,
          setPrivacy,
          setCvTemplateState,
        })
      }
      setSessionReady(true)
    }
    void boot()
  }, [])

  useEffect(() => {
    if (!sessionReady || !loggedIn || !accountId || !user || !role) return
    const snapshot: ProfileSnapshot = {
      user,
      role,
      verified,
      onboarding,
      education,
      experiences,
      projects,
      achievements,
      skills,
      applications,
      notifications,
      portfolio,
      privacy,
      cvTemplate,
    }
    const t = window.setTimeout(() => {
      void apiSaveProfile(snapshot)
    }, 700)
    return () => window.clearTimeout(t)
  }, [
    sessionReady,
    loggedIn,
    accountId,
    user,
    role,
    verified,
    onboarding,
    education,
    experiences,
    projects,
    achievements,
    skills,
    applications,
    notifications,
    portfolio,
    privacy,
    cvTemplate,
  ])

  const loadDemoData = () => {
    setUser(demoProfile)
    setEducation(demoEducation)
    setExperiences(demoExperiences)
    setProjects(demoProjects)
    setAchievements(demoAchievements)
    setSkills(demoSkills)
    setNotifications(demoNotifications)
    setPortfolio(defaultPortfolio)
    setPrivacy(defaultPrivacy)
    setVerified(true)
    setOnboarding({
      basics: true,
      education: true,
      experience: true,
      projects: true,
      achievements: true,
      skills: true,
    })
  }

  const store: Store = {
    sessionReady,
    accountId,
    role,
    user,
    loggedIn,
    verified,
    onboarding,
    education,
    experiences,
    projects,
    achievements,
    skills,
    opportunities,
    applications,
    notifications,
    portfolio,
    privacy,
    cvTemplate,
    adminUsers,
    categories,
    restoreAccount: (payload) => {
      applyAccountPayload(payload, {
        setAccountId,
        setRole,
        setUser,
        setLoggedIn,
        setVerified,
        setOnboarding,
        setEducation,
        setExperiences,
        setProjects,
        setAchievements,
        setSkills,
        setApplications,
        setNotifications,
        setPortfolio,
        setPrivacy,
        setCvTemplateState,
      })
    },
    verifyAccount: () => setVerified(true),
    logout: () => {
      void apiLogout()
      setAccountId(null)
      setLoggedIn(false)
      setRole(null)
      setUser(null)
      setVerified(false)
      setOnboarding(emptyOnboarding)
      setEducation([])
      setExperiences([])
      setProjects([])
      setAchievements([])
      setSkills([])
      setApplications([])
      setNotifications([])
      setPortfolio(defaultPortfolio)
      setPrivacy(defaultPrivacy)
      setOpportunities(seedOpportunities)
    },
    markNotificationRead: (id) =>
      setNotifications((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n))),
    markAllNotificationsRead: () => setNotifications((list) => list.map((n) => ({ ...n, read: true }))),
    updatePortfolio: (p) => setPortfolio((cur) => ({ ...cur, ...p })),
    publishPortfolio: () => setPortfolio((cur) => ({ ...cur, published: true })),
    setCvTemplate: (t) => setCvTemplateState(t),
    updatePrivacy: (p) => setPrivacy((cur) => ({ ...cur, ...p })),
    setUserStatus: (id, status) =>
      setAdminUsers((list) => list.map((u) => (u.id === id ? { ...u, status } : u))),
    toggleCategory: (id) =>
      setCategories((list) => list.map((c) => (c.id === id ? { ...c, active: !c.active } : c))),
    addCategory: (name) =>
      setCategories((list) => [...list, { id: uid(), name, skillCount: 0, active: true }]),
    removeOpportunity: (id) => setOpportunities((list) => list.filter((o) => o.id !== id)),
    updateProfile: (p) => setUser((u) => (u ? { ...u, ...p } : u)),
    setOnboardingStep: (k, v) => setOnboarding((o) => ({ ...o, [k]: v })),
    addEducation: (e) => setEducation((list) => [...list, { ...e, id: uid() }]),
    removeEducation: (id) => setEducation((list) => list.filter((x) => x.id !== id)),
    addExperience: (e) => setExperiences((list) => [...list, { ...e, id: uid() }]),
    removeExperience: (id) => setExperiences((list) => list.filter((x) => x.id !== id)),
    addProject: (p) => setProjects((list) => [...list, { ...p, id: uid() }]),
    removeProject: (id) => setProjects((list) => list.filter((x) => x.id !== id)),
    addAchievement: (a) => setAchievements((list) => [...list, { ...a, id: uid() }]),
    removeAchievement: (id) => setAchievements((list) => list.filter((x) => x.id !== id)),
    addSkill: (s) => setSkills((list) => [...list, { ...s, id: uid() }]),
    removeSkill: (id) => setSkills((list) => list.filter((x) => x.id !== id)),
    loadSample: loadDemoData,
    setApplication: (opportunityId, status) =>
      setApplications((list) => {
        const rest = list.filter((a) => a.opportunityId !== opportunityId)
        return [...rest, { opportunityId, status, updatedAt: new Date().toISOString() }]
      }),
    postOpportunity: (o) =>
      setOpportunities((list) => [
        { ...o, id: uid(), providerId: "me", applicants: 0 },
        ...list,
      ]),
    matchScore: (o) => {
      // Build a lookup of the user's skills -> proficiency + verification.
      const byName = new Map<string, Skill>()
      for (const s of skills) byName.set(s.name.toLowerCase(), s)
      const cats = new Map<string, Skill>()
      for (const s of skills) if (!cats.has(s.category.toLowerCase())) cats.set(s.category.toLowerCase(), s)
      const interests = (user?.interests ?? []).map((i) => i.toLowerCase())

      if (o.skills.length === 0) return 55

      let score = 0
      for (const req of o.skills) {
        const l = req.toLowerCase()
        const direct = byName.get(l)
        const viaCat = cats.get(l)
        if (direct) {
          // 0.55 base for owning it, scaled by proficiency, +bonus if verified.
          score += 0.55 + (direct.level / 5) * 0.35 + (direct.verified ? 0.1 : 0)
        } else if (viaCat) {
          score += 0.4 + (viaCat.level / 5) * 0.2
        } else if (interests.some((i) => l.includes(i) || i.includes(l))) {
          score += 0.3
        }
        // otherwise: a genuine gap, contributes 0
      }
      const base = (score / o.skills.length) * 100

      // Interest overlap with the role text nudges it up slightly.
      const text = `${o.title} ${o.description}`.toLowerCase()
      const interestBoost = interests.some((i) => text.includes(i)) ? 6 : 0

      return Math.max(18, Math.min(98, Math.round(base + interestBoost)))
    },
  }

  const value = useMemo(() => store, [
    sessionReady,
    accountId,
    role,
    user,
    loggedIn,
    verified,
    onboarding,
    education,
    experiences,
    projects,
    achievements,
    skills,
    opportunities,
    applications,
    notifications,
    portfolio,
    privacy,
    cvTemplate,
    adminUsers,
    categories,
  ])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePrototype() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("usePrototype must be used within PrototypeProvider")
  return ctx
}

/* --------------------------------- Helpers --------------------------------- */

export const oppTypeLabel: Record<OppType, string> = {
  job: "Job",
  internship: "Internship",
  scholarship: "Scholarship",
  volunteering: "Volunteering",
  training: "Training",
}

export const experienceTypeLabel: Record<ExperienceType, string> = {
  volunteer: "Volunteering",
  internship: "Internship",
  work: "Work experience",
}

export function profileCompletion(s: {
  onboarding: OnboardingState
}): number {
  const steps = Object.values(s.onboarding)
  const done = steps.filter(Boolean).length
  return Math.round((done / steps.length) * 100)
}
