"use client"

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import {
  apiApply,
  apiArchiveOpportunity,
  apiListApplications,
  apiListOpportunities,
  apiLogout,
  apiMe,
  apiOrgBadges,
  apiPublishOpportunity,
  apiSaveOpportunity,
  apiSaveProfile,
  apiUpdateApplication,
  apiVerifyEmail,
  type ApiApplication,
  type ApiOpportunity,
  type AuthResponse,
} from "@/lib/auth/client"
import { scoreOpportunityMatch } from "@/lib/matching/score"
import type { AuthUser, ProfileSnapshot } from "@/lib/auth/types"
import type { Organization, VerificationStatus } from "@/lib/org/types"

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
  evidenceBacked?: boolean
}

export type Education = {
  id: string
  institution: string
  qualification: string
  field: string
  location?: string
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
  organizationId?: string
  applicants?: number
  matchScore?: number | null
  status?: string
}

export type ApplicationStatus =
  | "saved"
  | "submitted"
  | "under_review"
  | "shortlisted"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "applied"
  | "interview"
  | "offer"

export type Application = {
  id?: string
  opportunityId: string
  status: ApplicationStatus
  updatedAt: string
  opportunityTitle?: string
  organizationName?: string
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
  name: "Sample Student",
  email: "",
  headline: "",
  location: "Freetown, Sierra Leone",
  about: "",
  interests: [],
  avatar: "chart-1",
}

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
  slug: "portfolio",
  visibility: "unlisted",
  showContact: false,
  showEvidence: true,
  tagline: "",
}

const defaultPrivacy: PrivacySettings = {
  searchable: true,
  showToEmployers: true,
  shareAnalytics: false,
  emailNotifications: true,
  matchAlerts: true,
}

const seedAdminUsers: AdminUser[] = []

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
  organization: Organization | null
  orgBadges: Record<string, VerificationStatus>
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
  verifyAccount: (code: string) => Promise<void>
  setOrganization: (org: Organization | null) => void
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
  setApplication: (opportunityId: string, status: ApplicationStatus, coverMessage?: string) => void
  postOpportunity: (o: Omit<Opportunity, "id" | "providerId" | "applicants">) => void
  matchScore: (o: Opportunity) => number
  refreshMarketplace: () => Promise<void>
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
    setOrganization: (v: Organization | null) => void
  },
) {
  const { user: account, snapshot } = payload
  set.setAccountId(account.id)
  set.setRole(account.role)
  set.setLoggedIn(true)
  set.setOrganization(payload.organization ?? null)
  set.setVerified(payload.emailVerified || account.emailVerified)

  if (snapshot?.user) {
    set.setUser({ ...snapshot.user, email: account.email })
    set.setVerified(payload.emailVerified || account.emailVerified)
    set.setOnboarding(snapshot.onboarding ?? emptyOnboarding)
    set.setEducation((snapshot.education as Education[]) ?? [])
    set.setExperiences((snapshot.experiences as Experience[]) ?? [])
    set.setProjects((snapshot.projects as Project[]) ?? [])
    set.setAchievements((snapshot.achievements as Achievement[]) ?? [])
    set.setSkills((snapshot.skills as Skill[]) ?? [])
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
  const applyingServerSkills = useRef(false)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioSettings>(defaultPortfolio)
  const [privacy, setPrivacy] = useState<PrivacySettings>(defaultPrivacy)
  const [cvTemplate, setCvTemplateState] = useState<CvTemplate>("modern")
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(seedAdminUsers)
  const [categories, setCategories] = useState<PlatformCategory[]>(seedCategories)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [orgBadges, setOrgBadges] = useState<Record<string, VerificationStatus>>({})

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
          setOrganization,
        })
      }
      const badges = await apiOrgBadges()
      setOrgBadges(badges)
      if (remote?.user) {
        const [listed, apps] = await Promise.all([
          loadOpportunities(remote.user.role),
          apiListApplications(),
        ])
        setOpportunities(listed)
        setApplications(apps.map(mapApplication))
      }
      setSessionReady(true)
    }
    void boot()
  }, [])

  useEffect(() => {
    if (!sessionReady || !loggedIn || !accountId || !user || !role) return
    if (applyingServerSkills.current) {
      applyingServerSkills.current = false
      return
    }
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
      applications: [],
      notifications,
      portfolio,
      privacy,
      cvTemplate,
    }
    const t = window.setTimeout(() => {
      void apiSaveProfile(snapshot).then((clean) => {
        if (!clean || !Array.isArray(clean.skills)) return
        const serverSkills = clean.skills as Skill[]
        const changed = serverSkills.some((skill, index) => {
          const current = skills[index]
          return !current || current.verified !== skill.verified || current.evidenceBacked !== skill.evidenceBacked
        })
        if (!changed && serverSkills.length === skills.length) return
        applyingServerSkills.current = true
        setSkills(serverSkills)
        setVerified(Boolean(clean.verified))
        if (clean.role === "student" || clean.role === "employer" || clean.role === "admin") {
          setRole(clean.role)
        }
      })
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
    organization,
    orgBadges,
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
        setOrganization,
      })
      void Promise.all([loadOpportunities(payload.user.role), apiListApplications()]).then(([listed, apps]) => {
        setOpportunities(listed)
        setApplications(apps.map(mapApplication))
      })
    },
    verifyAccount: async (code: string) => {
      const payload = await apiVerifyEmail(code)
      setVerified(payload.emailVerified)
      setOrganization(payload.organization ?? null)
    },
    setOrganization,
    logout: () => {
      void apiLogout()
      setAccountId(null)
      setLoggedIn(false)
      setRole(null)
      setUser(null)
      setVerified(false)
      setOrganization(null)
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
      setOpportunities([])
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
    removeOpportunity: (id) => {
      void apiArchiveOpportunity(id)
        .then(() => setOpportunities((list) => list.filter((o) => o.id !== id)))
        .catch(() => undefined)
    },
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
    addSkill: (s) => setSkills((list) => [...list, { ...s, id: uid(), verified: false }]),
    removeSkill: (id) => setSkills((list) => list.filter((x) => x.id !== id)),
    loadSample: loadDemoData,
    setApplication: (opportunityId, status, coverMessage) => {
      setApplications((list) => {
        const rest = list.filter((a) => a.opportunityId !== opportunityId)
        return [...rest, { opportunityId, status, updatedAt: new Date().toISOString() }]
      })
      void (async () => {
        try {
          if (status === "saved") await apiSaveOpportunity(opportunityId)
          else if (status === "applied") await apiApply(opportunityId, coverMessage)
          else if (status === "withdrawn") {
            const current = applications.find((item) => item.opportunityId === opportunityId)
            if (current?.id && !current.id.startsWith("saved:")) {
              await apiUpdateApplication(current.id, "withdrawn")
            }
          }
          const apps = await apiListApplications()
          setApplications(apps.map(mapApplication))
        } catch {
          const apps = await apiListApplications()
          setApplications(apps.map(mapApplication))
        }
      })()
    },
    postOpportunity: (o) => {
      void apiPublishOpportunity({
        title: o.title,
        description: o.description,
        type: o.type,
        location: o.location,
        remote: o.remote,
        skills: o.skills,
        deadline: o.deadline,
        compensation: o.compensation,
      })
        .then(async (created) => {
          if (created) setOpportunities((list) => [mapOpportunity(created), ...list.filter((item) => item.id !== created.id)])
          else {
            const listed = await apiListOpportunities({ mine: true })
            setOpportunities(listed.map(mapOpportunity))
          }
        })
        .catch(() => undefined)
    },
    refreshMarketplace: async () => {
      const [listed, apps] = await Promise.all([
        loadOpportunities(role),
        apiListApplications(),
      ])
      setOpportunities(listed)
      setApplications(apps.map(mapApplication))
    },
    matchScore: (o) => {
      if (typeof o.matchScore === "number") return o.matchScore
      return scoreOpportunityMatch(
        {
          skills,
          interests: user?.interests ?? [],
          location: user?.location ?? "",
        },
        o,
      )
    },
  }

  const value = useMemo(() => store, [
    sessionReady,
    accountId,
    role,
    user,
    loggedIn,
    verified,
    organization,
    orgBadges,
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

async function loadOpportunities(role?: string | null) {
  const listed = await apiListOpportunities()
  if (role !== "employer") return listed.map(mapOpportunity)
  const mine = await apiListOpportunities({ mine: true })
  const map = new Map(listed.map((item) => [item.id, mapOpportunity(item)]))
  for (const item of mine) map.set(item.id, mapOpportunity(item))
  return [...map.values()]
}

function mapOpportunity(item: ApiOpportunity): Opportunity {
  return {
    id: item.id,
    title: item.title,
    org: item.org,
    type: item.type,
    location: item.location,
    remote: item.remote,
    description: item.description,
    skills: item.skills ?? [],
    deadline: item.deadline,
    compensation: item.compensation,
    organizationId: item.organizationId,
    providerId: item.organizationId,
    applicants: item.applicants ?? 0,
    matchScore: item.matchScore,
    status: item.status,
  }
}

function mapApplication(item: ApiApplication): Application {
  return {
    id: item.id,
    opportunityId: item.opportunityId,
    status: item.status,
    updatedAt: item.updatedAt,
    opportunityTitle: item.opportunityTitle,
    organizationName: item.organizationName,
  }
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
