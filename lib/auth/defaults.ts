import type { AuthUser, ProfileSnapshot } from "@/lib/auth/types"

export function defaultProfileSnapshot(account: AuthUser): ProfileSnapshot {
  return {
    user: {
      name: account.name,
      email: account.email,
      headline:
        account.role === "student"
          ? "New member"
          : account.role === "admin"
            ? "Platform administrator"
            : "Opportunity provider",
      location: "",
      about: "",
      interests: [],
      avatar: account.role === "admin" ? "chart-4" : "chart-1",
    },
    role: account.role,
    verified: account.role === "admin",
    onboarding: {
      basics: false,
      education: false,
      experience: false,
      projects: false,
      achievements: false,
      skills: false,
    },
    education: [],
    experiences: [],
    projects: [],
    achievements: [],
    skills: [],
    applications: [],
    notifications: [],
    portfolio: {
      published: false,
      theme: "aurora",
      slug: account.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "my-portfolio",
      visibility: "unlisted",
      showContact: false,
      showEvidence: true,
      tagline: "",
    },
    privacy: {
      searchable: true,
      showToEmployers: true,
      shareAnalytics: false,
      emailNotifications: true,
      matchAlerts: true,
    },
    cvTemplate: "modern",
  }
}

/** Seeded Amara profile — stored in SQLite so demo login does not depend on browser state. */
export function amaraDemoSnapshot(): ProfileSnapshot {
  return {
    user: {
      name: "Amara Okafor",
      email: "amara@example.com",
      headline: "Aspiring community & sustainability leader",
      location: "Manchester, UK",
      about:
        "18-year-old college leaver with two years of hands-on volunteering and a marketing internship. Passionate about community impact, sustainability and youth work.",
      interests: ["Sustainability", "Community work", "Marketing", "Youth mentoring"],
      avatar: "chart-1",
    },
    role: "student",
    verified: true,
    onboarding: {
      basics: true,
      education: true,
      experience: true,
      projects: true,
      achievements: true,
      skills: true,
    },
    education: [
      {
        id: "edu-amara-1",
        institution: "Manchester College",
        qualification: "A-Levels",
        field: "Business, Geography, Sociology",
        start: "2022-09",
        end: "2024-06",
        grade: "ABB",
        description: "Focused on community studies and business.",
      },
    ],
    experiences: [
      {
        id: "exp-amara-1",
        type: "volunteer",
        role: "Youth Mentor",
        organization: "Bright Futures Youth Hub",
        location: "Manchester, UK",
        start: "2023-01",
        end: "",
        current: true,
        hours: 180,
        description:
          "Mentor younger students weekly, run study clubs, and help plan community events.",
        skills: ["Communication", "Leadership", "Organization"],
        evidence: [{ id: "ev-amara-1", type: "reference", label: "Supervisor reference", status: "verified" }],
      },
      {
        id: "exp-amara-2",
        type: "internship",
        role: "Marketing Intern",
        organization: "GreenLeaf Startups",
        location: "Remote",
        start: "2023-07",
        end: "2023-09",
        current: false,
        hours: 160,
        description:
          "Ran the social channels for a sustainability startup, growing engagement 38% over the summer.",
        skills: ["Content Creation", "Analytics", "Creativity"],
        evidence: [{ id: "ev-amara-2", type: "link", label: "Campaign portfolio link", status: "pending" }],
      },
    ],
    projects: [
      {
        id: "proj-amara-1",
        title: "Campus Recycling Drive",
        category: "community",
        role: "Project Lead",
        description: "Designed and led a term-long recycling initiative across campus.",
        outcome: "Diverted an estimated 1.2 tonnes of waste and won the regional Youth Green Award.",
        link: "",
        skills: ["Leadership", "Project Management", "Teamwork"],
        evidence: [{ id: "ev-amara-3", type: "photo", label: "Event photos", status: "verified" }],
      },
    ],
    achievements: [
      {
        id: "ach-amara-1",
        title: "Regional Youth Green Award",
        issuer: "North West Youth Council",
        date: "2024-03",
        category: "award",
        description: "Recognised for outstanding community environmental leadership.",
        evidence: [{ id: "ev-amara-4", type: "certificate", label: "Award certificate", status: "verified" }],
      },
    ],
    skills: [
      { id: "sk-amara-1", name: "Communication", level: 5, category: "Communication", source: "Youth Mentor", verified: true },
      { id: "sk-amara-2", name: "Leadership", level: 4, category: "Leadership", source: "Recycling Drive", verified: true },
      { id: "sk-amara-3", name: "Teamwork", level: 4, category: "Teamwork", source: "Recycling Drive", verified: true },
    ],
    applications: [],
    notifications: [
      {
        id: "nt-amara-1",
        kind: "match",
        title: "New 95% match",
        body: "Sustainability Programme Assistant at EarthWise Foundation fits your verified skills.",
        time: "2h ago",
        read: false,
        href: "/opportunities",
      },
    ],
    portfolio: {
      published: false,
      theme: "aurora",
      slug: "amara-okafor",
      visibility: "unlisted",
      showContact: true,
      showEvidence: true,
      tagline: "Turning community impact into a career in sustainability.",
    },
    privacy: {
      searchable: true,
      showToEmployers: true,
      shareAnalytics: false,
      emailNotifications: true,
      matchAlerts: true,
    },
    cvTemplate: "modern",
  }
}
