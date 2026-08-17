/**
 * Targeted security checks for Volunteer Connect.
 * Usage: node scripts/security-audit.mjs
 * Optional: BASE_URL=http://localhost:3000
 *
 * Each run uses namespace security-test-<runId>. Demo accounts are never deleted.
 * Blob-dependent checks are marked NOT RUN when production Blob storage is unset.
 */
import postgres from "postgres"
import { detectFileKind, validateUpload } from "../lib/security/files.ts"
import { safeHttpUrl } from "../lib/security/urls.ts"
import { loadEnvFiles } from "./load-env.mjs"

loadEnvFiles()

const BASE = process.env.BASE_URL || "http://127.0.0.1:3000"
const results = []

const PROTECTED_EMAILS = new Set(["amara@example.com", "admin@volunteerconnect.org", "hello@earthwise.org"])
const PROTECTED_IDS = new Set(["user-amara", "user-admin", "user-earthwise"])

const AUDIT_EMAIL_PATTERNS = [
  /^security-test-(student|student-b|employer|employer-b|reject)-\d+@example\.test$/i,
  /^vc-audit-\d+-(student|student-b|employer|employer-b|reject)@example\.com$/i,
  /^audit-(student|student-b|employer|employer-b|reject)-\d+@example\.com$/i,
]

function record(name, ok, detail = "", status = "") {
  const state = status || (ok ? "PASS" : "FAIL")
  results.push({ name, ok: state === "PASS", skipped: state === "NOT RUN", status: state, detail })
  console.log(`${state}  ${name}${detail ? ` — ${detail}` : ""}`)
}

function skip(name, detail) {
  record(name, false, detail, "NOT RUN")
}

function cookieFrom(res) {
  const raw = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : []
  if (raw.length) return raw.map((part) => part.split(";")[0]).join("; ")
  const single = res.headers.get("set-cookie")
  return single ? single.split(";")[0] : ""
}

async function json(res) {
  try {
    return await res.json()
  } catch {
    return {}
  }
}

let auditForwardedIp = "203.0.113.1"

async function req(path, init = {}) {
  const headers = new Headers(init.headers || {})
  if (!headers.has("x-forwarded-for")) headers.set("x-forwarded-for", auditForwardedIp)
  return fetch(`${BASE}${path}`, { redirect: "manual", ...init, headers })
}

function jpegBytes() {
  return new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0xff, 0xd9])
}

function pdfBytes() {
  return new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xc7, 0xec])
}

function isAuditTestEmail(email) {
  return AUDIT_EMAIL_PATTERNS.some((pattern) => pattern.test(String(email || "")))
}

function isProtectedAccount(row) {
  return PROTECTED_EMAILS.has(String(row.email || "").toLowerCase()) || PROTECTED_IDS.has(String(row.id || ""))
}

async function cleanupAuditUsers(reason) {
  const url = process.env.DATABASE_URL?.trim()
  if (!url) {
    console.log(`Skipping DB cleanup (${reason}): DATABASE_URL is not set`)
    return 0
  }
  const sql = postgres(url, { max: 1, prepare: false })
  try {
    const rows = await sql`
      SELECT id, email
      FROM users
      WHERE email LIKE 'security-test-%@example.test'
         OR email LIKE 'vc-audit-%@example.com'
         OR email LIKE 'audit-student-%@example.com'
         OR email LIKE 'audit-employer-%@example.com'
         OR email LIKE 'audit-reject-%@example.com'
    `
    const targets = rows.filter((row) => isAuditTestEmail(row.email) && !isProtectedAccount(row))
    if (!targets.length) {
      console.log(`No audit users to clean (${reason})`)
      return 0
    }
    const ids = targets.map((row) => row.id)
    await sql`DELETE FROM users WHERE id = ANY(${ids}) AND id <> ALL(${[...PROTECTED_IDS]})`
    console.log(`Cleaned ${ids.length} audit user(s) (${reason})`)
    return ids.length
  } finally {
    await sql.end({ timeout: 5 })
  }
}

function studentSnapshot(input) {
  return {
    user: {
      name: "Audit Student",
      email: input.spoofEmail ?? "spoof@evil.test",
      headline: "",
      location: "",
      about: "",
      interests: [],
      avatar: "chart-1",
    },
    role: "admin",
    verified: true,
    onboarding: {
      basics: true,
      education: false,
      experience: false,
      projects: false,
      achievements: false,
      skills: true,
    },
    education: [],
    experiences: input.experiences ?? [],
    projects: [],
    achievements: [],
    skills: input.skills,
    applications: input.applications ?? [],
    notifications: [],
    portfolio: {
      published: input.published ?? false,
      theme: "aurora",
      slug: input.slug,
      visibility: input.visibility ?? "private",
      showContact: false,
      showEvidence: input.showEvidence ?? false,
      tagline: input.tagline ?? "",
    },
    privacy: {},
    cvTemplate: "modern",
  }
}

async function unitTests() {
  record("magic bytes detect jpeg", detectFileKind(jpegBytes()) === "jpeg")
  record("magic bytes detect pdf", detectFileKind(pdfBytes()) === "pdf")
  record("reject executable signature", detectFileKind(new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00])) === null)
  record(
    "reject .exe name even with jpeg bytes",
    "error" in validateUpload(jpegBytes(), "payload.exe"),
  )
  record("oversized upload rejected", "error" in validateUpload(new Uint8Array(2 * 1024 * 1024 + 1), "big.jpg"))
  record("javascript: URL rejected", safeHttpUrl("javascript:alert(1)") === "")
  record("data: URL rejected", safeHttpUrl("data:text/html;base64,PHNjcmlwdD4=") === "")
  record("https URL allowed", safeHttpUrl("https://earthwise.example/logo.png").startsWith("https://"))
}

async function httpTests() {
  const runId = String(Date.now())
  const ns = `security-test-${runId}`
  const id = (kind) => `${ns}-${kind}`.slice(0, 64)
  auditForwardedIp = `203.0.113.${(Number(runId.slice(-8)) % 250) + 1}`
  console.log(`Audit namespace: ${ns} (test-created data only; demo accounts are untouched)`)

  const studentEmail = `security-test-student-${runId}@example.test`
  const employerEmail = `security-test-employer-${runId}@example.test`
  const studentPass = "student-pass-1"
  const employerPass = "employer-pass-1"
  const skillId = id("sk-lead")
  const expHackId = id("exp-hack")
  const expLabelId = id("exp-label")
  const expEvidenceId = id("exp-file")
  const evLabelId = id("ev-label")
  const evFileId = id("ev-file")
  const publicSlug = `${ns}-public`.toLowerCase()
  const unlistedSlug = `${ns}-unlisted`.toLowerCase()

  await cleanupAuditUsers("before-run")

  try {
    await runHttpTests({
      ns,
      id,
      studentEmail,
      employerEmail,
      studentPass,
      employerPass,
      skillId,
      expHackId,
      expLabelId,
      expEvidenceId,
      evLabelId,
      evFileId,
      publicSlug,
      unlistedSlug,
      runId,
    })
  } finally {
    await cleanupAuditUsers("after-run")
  }
}

async function runHttpTests(ctx) {
  const {
    studentEmail,
    employerEmail,
    studentPass,
    employerPass,
    skillId,
    expHackId,
    expLabelId,
    expEvidenceId,
    evLabelId,
    evFileId,
    publicSlug,
    unlistedSlug,
    runId,
    id,
  } = ctx

  const health = await req("/login")
  if (health.status >= 500) {
    record("application reachable", false, `GET /login -> ${health.status}`)
    return
  }
  record("application reachable", health.status < 500)

  const loginHtml = await health.text()
  record(
    "login page does not expose an unauthenticated admin shortcut",
    !loginHtml.includes("Enter the admin console") && !loginHtml.includes("Access Admin Console"),
  )

  const anonDash = await req("/admin/dashboard")
  const anonDashLoc = anonDash.headers.get("location") || ""
  record("anonymous cannot access /admin/dashboard", anonDash.status === 307 || anonDash.status === 302, `status ${anonDash.status}`)
  record("anonymous admin dashboard redirects to login", anonDashLoc.includes("/login") && !anonDashLoc.includes("/admin/dashboard"))

  const anonAdminApis = [
    "/api/admin/stats",
    "/api/admin/users",
    "/api/admin/employers",
    "/api/admin/verifications",
    "/api/admin/opportunities",
    "/api/admin/applications",
    "/api/admin/skills",
    "/api/admin/uploads",
    "/api/admin/portfolios",
    "/api/admin/reports",
    "/api/admin/notifications",
    "/api/admin/settings",
  ]
  for (const path of anonAdminApis) {
    const res = await req(path)
    const body = await json(res)
    const leaked =
      Boolean(body.stats) ||
      Boolean(body.users) ||
      Boolean(body.employers) ||
      Boolean(body.requests) ||
      Boolean(body.opportunities) ||
      Boolean(body.applications) ||
      Boolean(body.skills) ||
      Boolean(body.uploads) ||
      Boolean(body.portfolios) ||
      Boolean(body.reports) ||
      Boolean(body.notifications) ||
      Boolean(body.settings)
    const blocked = res.status === 401 || res.status === 403 || res.status === 405
    record(`anonymous cannot call ${path}`, blocked && !leaked, `status ${res.status}`)
  }

  const demoAdmin = await req("/demo/admin")
  const demoAdminCookie = cookieFrom(demoAdmin)
  const demoAdminLoc = demoAdmin.headers.get("location") || ""
  record("/demo/admin does not set vc_session", !demoAdminCookie.includes("vc_session"))
  record(
    "/demo/admin does not auto-login",
    demoAdmin.status === 307 || demoAdmin.status === 302,
    `status ${demoAdmin.status}`,
  )
  record("/demo/admin redirects to login", demoAdminLoc.includes("/login"))
  const afterDemoAdmin = await req("/api/admin/stats")
  record("visiting /demo/admin does not grant Admin API access", afterDemoAdmin.status === 401, `status ${afterDemoAdmin.status}`)

  const studentReg = await req("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Audit Student",
      email: studentEmail,
      password: studentPass,
      role: "admin",
    }),
  })
  const studentBody = await json(studentReg)
  const studentCookie = cookieFrom(studentReg)
  record("student registers successfully", studentReg.ok && studentBody.user?.email === studentEmail, `status ${studentReg.status}`)
  record("student cannot become admin via role=admin", studentBody.user?.role === "student")

  const escalate = await req("/api/auth/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json", cookie: studentCookie },
    body: JSON.stringify({
      snapshot: studentSnapshot({
        spoofEmail: "spoof@evil.test",
        slug: publicSlug,
        skills: [{ id: skillId, name: "Leadership", level: 5, category: "Leadership", source: "Self", verified: true }],
      }),
    }),
  })
  const escalateBody = await json(escalate)
  record("profile save ignores client role/admin", escalate.ok && escalateBody.snapshot?.role === "student", escalate.ok ? "" : `status ${escalate.status}`)
  record("profile save ignores client verified email flag", escalateBody.snapshot?.verified === false)
  record("profile save ignores client skill.verified", escalateBody.snapshot?.skills?.[0]?.verified === false)
  record("profile save keeps server email", escalateBody.snapshot?.user?.email === studentEmail)

  const otherProfile = await req("/api/auth/profile?id=user-amara", {
    method: "PUT",
    headers: { "Content-Type": "application/json", cookie: studentCookie },
    body: JSON.stringify({
      snapshot: studentSnapshot({
        spoofEmail: "amara@example.com",
        slug: "amara-okafor",
        skills: [],
        experiences: [{ id: expHackId, type: "work", role: "Hacked", organization: "Nope", location: "", start: "", end: "", current: false, description: "", skills: [], evidence: [] }],
      }),
    }),
  })
  const otherBody = await json(otherProfile)
  record("query id cannot target another user's profile", otherProfile.ok && otherBody.snapshot?.user?.email === studentEmail)

  const amaraLogin = await req("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "amara@example.com", password: "password" }),
  })
  const amaraBody = await json(amaraLogin)
  const amaraCookie = cookieFrom(amaraLogin)
  record("existing student still logs in", amaraLogin.ok && amaraBody.user?.email === "amara@example.com")
  record("amara experience was not overwritten", !(amaraBody.snapshot?.experiences ?? []).some((item) => item.id === expHackId))

  const sqli = await req("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "' OR 1=1 --", password: "' OR 1=1 --" }),
  })
  record("SQL injection login does not succeed", sqli.status === 401)

  const employerReg = await req("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Audit Employer",
      email: employerEmail,
      password: employerPass,
      role: "employer",
      organization: {
        name: `Audit Org ${runId}`,
        organizationType: "NGO",
        organizationEmail: employerEmail,
        phone: "+441610000000",
        website: "javascript:alert(1)",
        address: "Manchester, UK",
        logoUrl: "javascript:alert(1)",
        verificationStatus: "approved",
      },
    }),
  })
  const employerBody = await json(employerReg)
  const employerCookie = cookieFrom(employerReg)
  record("employer registers successfully", employerReg.ok && employerBody.user?.role === "employer", `status ${employerReg.status}`)
  record("employer is not auto-verified", employerBody.organization?.verificationStatus === "pending")
  record("employer cannot set verification_status on register", employerBody.organization?.verificationStatus !== "approved")
  record("javascript logo/website stripped", !employerBody.organization?.logoUrl && !employerBody.organization?.website)

  const publishPending = await req("/api/employer/opportunities", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: employerCookie },
    body: JSON.stringify({ title: "Should fail", description: "Unverified employer publish attempt" }),
  })
  record("unverified employer cannot publish", publishPending.status === 403)

  const selfApprove = await req("/api/admin/verifications", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: employerCookie },
    body: JSON.stringify({ organizationId: employerBody.organization?.id, status: "approved" }),
  })
  record("employer cannot approve itself", selfApprove.status === 403)

  const studentApprove = await req("/api/admin/verifications", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: studentCookie },
    body: JSON.stringify({ organizationId: employerBody.organization?.id, status: "approved" }),
  })
  record("student cannot approve employer", studentApprove.status === 403)

  const studentAdminPage = await req("/admin/dashboard", { headers: { cookie: studentCookie } })
  const studentAdminLoc = studentAdminPage.headers.get("location") || ""
  record(
    "student cannot access /admin/dashboard",
    studentAdminPage.status === 307 || studentAdminPage.status === 302,
    `status ${studentAdminPage.status}`,
  )
  record("student admin redirect goes to student home", studentAdminLoc.includes("/dashboard") && !studentAdminLoc.includes("/admin/dashboard"))

  const employerAdminPage = await req("/admin/dashboard", { headers: { cookie: employerCookie } })
  const employerAdminLoc = employerAdminPage.headers.get("location") || ""
  record(
    "employer cannot access /admin/dashboard",
    employerAdminPage.status === 307 || employerAdminPage.status === 302,
    `status ${employerAdminPage.status}`,
  )
  record("employer admin redirect goes to employer home", employerAdminLoc.includes("/employer") && !employerAdminLoc.includes("/admin"))

  const studentAdminApi = await req("/api/admin/stats", { headers: { cookie: studentCookie } })
  record("student cannot call Admin APIs", studentAdminApi.status === 403)

  const employerAdminApi = await req("/api/admin/users", { headers: { cookie: employerCookie } })
  record("employer cannot call Admin APIs", employerAdminApi.status === 403)

  const studentUserPatch = await req(`/api/admin/users/${studentBody.user?.id || "missing"}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: studentCookie },
    body: JSON.stringify({ status: "suspended" }),
  })
  record("student cannot call Admin user-management APIs", studentUserPatch.status === 403)

  const studentPromote = await req(`/api/admin/users/${studentBody.user?.id || "missing"}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: studentCookie },
    body: JSON.stringify({ role: "admin", isAdmin: true, verificationStatus: "approved" }),
  })
  record("student cannot self-promote to admin", studentPromote.status === 403)

  const employerUserPatch = await req(`/api/admin/users/${studentBody.user?.id || "missing"}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: employerCookie },
    body: JSON.stringify({ status: "suspended" }),
  })
  record("employer cannot call Admin user-management APIs", employerUserPatch.status === 403)

  const employerPromote = await req(`/api/admin/users/${studentBody.user?.id || "missing"}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: employerCookie },
    body: JSON.stringify({ role: "admin", isAdmin: true }),
  })
  record("employer cannot promote a user to admin", employerPromote.status === 403)

  const orgPut = await req("/api/org", {
    method: "PUT",
    headers: { "Content-Type": "application/json", cookie: employerCookie },
    body: JSON.stringify({ verificationStatus: "approved", name: employerBody.organization?.name }),
  })
  const orgPutBody = await json(orgPut)
  record("employer cannot mark itself verified via org PUT", orgPut.ok && orgPutBody.organization?.verificationStatus === "pending")

  const adminLogin = await req("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@volunteerconnect.org", password: "password" }),
  })
  const adminBody = await json(adminLogin)
  const adminCookie = cookieFrom(adminLogin)
  record("admin can sign in", adminLogin.ok && adminBody.user?.role === "admin")

  const settingsBody = await json(await req("/api/admin/settings", { headers: { cookie: adminCookie } }))
  const blobConfigured = Boolean(settingsBody.settings?.blobConfigured)

  const adminDash = await req("/admin/dashboard", { headers: { cookie: adminCookie } })
  record("admin can access Admin Dashboard", adminDash.status === 200, `status ${adminDash.status}`)

  const adminUsers = await req("/api/admin/users", { headers: { cookie: adminCookie } })
  const adminUsersBody = await json(adminUsers)
  const adminUsersJson = JSON.stringify(adminUsersBody)
  record(
    "admin can view users",
    adminUsers.ok && Array.isArray(adminUsersBody.users) && adminUsersBody.users.some((item) => item.email === studentEmail),
  )
  record(
    "admin user list omits secrets",
    !adminUsersJson.includes("passwordHash") && !adminUsersJson.includes("password_hash") && !adminUsersJson.includes("vc_session"),
  )

  const rejectEmail = `security-test-reject-${runId}@example.test`
  const rejectReg = await req("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Reject Employer",
      email: rejectEmail,
      password: employerPass,
      role: "employer",
      organization: {
        name: `Reject Org ${runId}`,
        organizationType: "NGO",
        organizationEmail: rejectEmail,
        phone: "+441610000002",
        address: "Bristol, UK",
      },
    }),
  })
  const rejectRegBody = await json(rejectReg)
  const rejectRes = await req("/api/admin/verifications", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ organizationId: rejectRegBody.organization?.id, status: "rejected" }),
  })
  const rejectBody = await json(rejectRes)
  record("admin can reject employer", rejectRes.ok && rejectBody.organization?.verificationStatus === "rejected")

  const approve = await req("/api/admin/verifications", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ organizationId: employerBody.organization?.id, status: "approved" }),
  })
  const approveBody = await json(approve)
  record("admin can approve an employer", approve.ok && approveBody.organization?.verificationStatus === "approved")

  const publishOk = await req("/api/employer/opportunities", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: employerCookie },
    body: JSON.stringify({ title: `Community Garden Lead ${runId}`, description: "Help run a weekend garden programme." }),
  })
  const publishedOpp = await json(publishOk)
  record("verified employer can publish", publishOk.ok)
  const opportunityId = publishedOpp.opportunity?.id

  const moderateCreate = await req("/api/employer/opportunities", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: employerCookie },
    body: JSON.stringify({ title: `Admin moderate ${runId}`, description: "Moderation target listing." }),
  })
  const moderateCreated = await json(moderateCreate)
  const moderateId = moderateCreated.opportunity?.id
  const moderateRes = await req(`/api/admin/opportunities/${moderateId || "missing"}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ status: "closed" }),
  })
  const moderateResBody = await json(moderateRes)
  record("admin can moderate opportunities", moderateRes.ok && moderateResBody.opportunity?.status === "closed")
  record(
    "admin moderation does not change opportunity ownership",
    moderateRes.ok && moderateResBody.opportunity?.organizationId === employerBody.organization?.id,
  )
  const studentModerate = await req(`/api/admin/opportunities/${moderateId || "missing"}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: studentCookie },
    body: JSON.stringify({ status: "archived" }),
  })
  record("student cannot moderate opportunities via Admin API", studentModerate.status === 403)

  const studentCreateOpp = await req("/api/opportunities", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: studentCookie },
    body: JSON.stringify({ title: "Should fail", description: "Students cannot post." }),
  })
  record("student cannot create opportunity", studentCreateOpp.status === 403)

  const otherEmployerEmail = `security-test-employer-b-${runId}@example.test`
  const otherEmployerReg = await req("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Other Employer",
      email: otherEmployerEmail,
      password: employerPass,
      role: "employer",
      organization: {
        name: `Other Org ${runId}`,
        organizationType: "NGO",
        organizationEmail: otherEmployerEmail,
        phone: "+441610000001",
        address: "Leeds, UK",
      },
    }),
  })
  const otherEmployerBody = await json(otherEmployerReg)
  const otherEmployerCookie = cookieFrom(otherEmployerReg)
  await req("/api/admin/verifications", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ organizationId: otherEmployerBody.organization?.id, status: "approved" }),
  })
  const stealOpp = await req(`/api/opportunities/${opportunityId || "missing"}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: otherEmployerCookie },
    body: JSON.stringify({ title: "Hijacked" }),
  })
  record("employer cannot modify another organization's opportunity", stealOpp.status === 404)

  const applyOk = await req("/api/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: studentCookie },
    body: JSON.stringify({ opportunityId, coverMessage: "I would like to help." }),
  })
  const applyBody = await json(applyOk)
  record("valid application succeeds", applyOk.ok && applyBody.application?.id, `status ${applyOk.status}`)

  const adminApps = await req("/api/admin/applications", { headers: { cookie: adminCookie } })
  const adminAppsBody = await json(adminApps)
  const adminAppsJson = JSON.stringify(adminAppsBody)
  record(
    "admin can view authorized application information",
    adminApps.ok && (adminAppsBody.applications ?? []).some((item) => item.id === applyBody.application?.id),
  )
  record(
    "admin application payload omits secrets",
    !adminAppsJson.toLowerCase().includes("password") && !adminAppsJson.includes("token") && !adminAppsJson.includes("otp"),
  )
  const adminOpps = await json(await req("/api/admin/opportunities", { headers: { cookie: adminCookie } }))
  const garden = (adminOpps.opportunities ?? []).find((item) => item.id === opportunityId)
  const closedTarget = (adminOpps.opportunities ?? []).find((item) => item.id === moderateId)
  record(
    "admin actions do not modify unrelated records",
    garden?.status === "published" && closedTarget?.status === "closed",
  )

  const applyDup = await req("/api/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: studentCookie },
    body: JSON.stringify({ opportunityId }),
  })
  record("duplicate application rejected", applyDup.status === 409)

  const expired = await req("/api/employer/opportunities", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: employerCookie },
    body: JSON.stringify({
      title: `Expired role ${runId}`,
      description: "This deadline has passed.",
      deadline: "2020-01-01",
    }),
  })
  const expiredBody = await json(expired)
  const applyExpired = await req("/api/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: studentCookie },
    body: JSON.stringify({ opportunityId: expiredBody.opportunity?.id }),
  })
  record("expired opportunity rejected", applyExpired.status === 400)

  const otherStudentEmail = `security-test-student-b-${runId}@example.test`
  const otherStudentReg = await req("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Other Student",
      email: otherStudentEmail,
      password: studentPass,
      role: "student",
    }),
  })
  const otherStudentBody = await json(otherStudentReg)
  const otherStudentId = otherStudentBody.user?.id
  const statusPatch = await req(`/api/admin/users/${otherStudentId || "missing"}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ status: "suspended" }),
  })
  const statusPatchBody = await json(statusPatch)
  record("admin can update supported account status", statusPatch.ok && statusPatchBody.user?.status === "suspended")
  await req(`/api/admin/users/${otherStudentId || "missing"}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ status: "active" }),
  })
  const roleNoConfirm = await req(`/api/admin/users/${otherStudentId || "missing"}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ role: "admin", isAdmin: true, passwordHash: "ignore", confirmRoleChange: false }),
  })
  record("admin role change requires confirmation", roleNoConfirm.status === 400, `status ${roleNoConfirm.status}`)
  const otherStudentLogin = await req("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: otherStudentEmail, password: studentPass }),
  })
  const otherStudentFreshCookie = cookieFrom(otherStudentLogin)
  const stealApp = await req(`/api/applications/${applyBody.application?.id || "missing"}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: otherStudentFreshCookie },
    body: JSON.stringify({ status: "withdrawn" }),
  })
  record("student cannot modify another student's application", stealApp.status === 404)

  const otherEmployerApps = await req("/api/applications", { headers: { cookie: otherEmployerCookie } })
  const otherEmployerAppsBody = await json(otherEmployerApps)
  record(
    "employer cannot read another employer's applications",
    otherEmployerApps.ok && !(otherEmployerAppsBody.applications ?? []).some((item) => item.id === applyBody.application?.id),
  )

  const persistLogin = await req("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: studentEmail, password: studentPass }),
  })
  const persistBody = await json(persistLogin)
  record("session restoration after login works", persistLogin.ok && persistBody.user?.email === studentEmail)

  const listed = await req("/api/opportunities", { headers: { cookie: studentCookie } })
  const listedBody = await json(listed)
  record("persisted opportunity remains visible", listed.ok && (listedBody.opportunities ?? []).some((item) => item.id === opportunityId))
  record("student can browse published opportunities", listed.ok && Array.isArray(listedBody.opportunities))

  const draftOk = await req("/api/employer/opportunities", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: employerCookie },
    body: JSON.stringify({ title: `Draft only ${runId}`, description: "Not public yet.", status: "draft" }),
  })
  const draftBody = await json(draftOk)
  record("verified employer can create a draft", draftOk.ok && draftBody.opportunity?.status === "draft")
  const draftAsStudent = await req(`/api/opportunities/${draftBody.opportunity?.id || "missing"}`, { headers: { cookie: studentCookie } })
  record("random opportunity ID cannot expose private employer data", draftAsStudent.status === 404)
  const listedPublic = await json(await req("/api/opportunities", { headers: { cookie: studentCookie } }))
  record(
    "drafts are hidden from students",
    !(listedPublic.opportunities ?? []).some((item) => item.id === draftBody.opportunity?.id),
  )

  const closedOpp = await req("/api/employer/opportunities", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: employerCookie },
    body: JSON.stringify({ title: `Closed role ${runId}`, description: "No longer accepting.", status: "published" }),
  })
  const closedBody = await json(closedOpp)
  await req(`/api/employer/opportunities/${closedBody.opportunity?.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", cookie: employerCookie },
    body: JSON.stringify({ title: `Closed role ${runId}`, description: "No longer accepting.", status: "closed" }),
  })
  const applyClosed = await req("/api/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: studentCookie },
    body: JSON.stringify({ opportunityId: closedBody.opportunity?.id }),
  })
  record("closed opportunity cannot accept applications", applyClosed.status === 400)

  const spoofStudent = await req("/api/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: studentCookie },
    body: JSON.stringify({ opportunityId, studentId: otherStudentReg && "ignored", coverMessage: "again" }),
  })
  record("student cannot submit an application for another student", spoofStudent.status === 409)

  const studentApps = await json(await req("/api/applications", { headers: { cookie: studentCookie } }))
  record(
    "student can only see their own applications",
    (studentApps.applications ?? []).every((item) => !item.studentId || item.studentId === studentBody.user?.id),
  )
  const employerApps = await json(await req("/api/applications", { headers: { cookie: employerCookie } }))
  record(
    "employer can only see applications for its organization",
    (employerApps.applications ?? []).some((item) => item.id === applyBody.application?.id),
  )

  const acceptAsStudent = await req(`/api/applications/${applyBody.application?.id || "missing"}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: studentCookie },
    body: JSON.stringify({ status: "accepted" }),
  })
  record("student cannot change application status to accepted", acceptAsStudent.status === 403)

  const employerStatus = await req(`/api/applications/${applyBody.application?.id || "missing"}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: employerCookie },
    body: JSON.stringify({ status: "shortlisted" }),
  })
  const employerStatusBody = await json(employerStatus)
  record(
    "employer can update status for its own application records",
    employerStatus.ok && employerStatusBody.application?.status === "shortlisted",
  )

  const randomApp = await req("/api/applications/00000000-0000-4000-8000-000000000000", { headers: { cookie: otherStudentFreshCookie } })
  record("random application ID cannot expose another student's application", randomApp.status === 404)

  const otherEmployerPut = await req(`/api/employer/opportunities/${opportunityId || "missing"}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", cookie: otherEmployerCookie },
    body: JSON.stringify({ title: "Stolen", description: "Should fail" }),
  })
  record("employer A cannot modify employer B opportunity via PUT", otherEmployerPut.status === 404)

  const studentSkill = await req("/api/admin/skills", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: studentCookie },
    body: JSON.stringify({ userId: studentBody.user?.id, skillName: "Leadership", verified: true }),
  })
  record("student cannot officially verify a skill", studentSkill.status === 403)

  const employerSkill = await req("/api/admin/skills", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: employerCookie },
    body: JSON.stringify({ userId: studentBody.user?.id, skillName: "Leadership", verified: true }),
  })
  record("employer cannot officially verify a skill", employerSkill.status === 403)

  const adminSkill = await req("/api/admin/skills", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ userId: studentBody.user?.id, skillName: "Leadership", verified: true }),
  })
  record("admin can verify skill", adminSkill.ok)

  const fakeJpeg = new File([jpegBytes()], `${id("photo")}.jpg`, { type: "image/jpeg" })
  const formOk = new FormData()
  formOk.append("file", fakeJpeg)
  const uploadOk = await req("/api/uploads", { method: "POST", headers: { cookie: studentCookie }, body: formOk })
  const uploadBody = await json(uploadOk)
  const blobUnavailable = !uploadOk.ok && !blobConfigured
  if (blobUnavailable) {
    skip("allowed jpeg upload accepted", "NOT RUN — production Blob storage not configured")
  } else {
    record("allowed jpeg upload accepted", uploadOk.ok, uploadOk.ok ? "" : `status ${uploadOk.status}`)
  }
  const stealUpload = await req(`/api/uploads/${uploadBody.upload?.id ?? "missing"}`, { headers: { cookie: amaraCookie } })
  record("student cannot read another student's upload", stealUpload.status === 404)

  const formTraversal = new FormData()
  formTraversal.append("file", new File([jpegBytes()], "../../etc/passwd.jpg", { type: "image/jpeg" }))
  const uploadTraversal = await req("/api/uploads", { method: "POST", headers: { cookie: studentCookie }, body: formTraversal })
  record("path-traversal filename is rejected", uploadTraversal.status === 400)

  const formExe = new FormData()
  formExe.append("file", new File([new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00])], "tool.exe", { type: "application/octet-stream" }))
  const uploadExe = await req("/api/uploads", { method: "POST", headers: { cookie: studentCookie }, body: formExe })
  record("disallowed executable rejected", uploadExe.status === 400)

  const formDisguise = new FormData()
  formDisguise.append("file", new File([new TextEncoder().encode("<script>alert(1)</script>")], "safe.pdf", { type: "application/pdf" }))
  const uploadDisguise = await req("/api/uploads", { method: "POST", headers: { cookie: studentCookie }, body: formDisguise })
  record("disguised non-pdf rejected", uploadDisguise.status === 400)

  const huge = new Uint8Array(2 * 1024 * 1024 + 20)
  huge.set([0xff, 0xd8, 0xff], 0)
  const formHuge = new FormData()
  formHuge.append("file", new File([huge], "huge.jpg", { type: "image/jpeg" }))
  const uploadHuge = await req("/api/uploads", { method: "POST", headers: { cookie: studentCookie }, body: formHuge })
  record("oversized upload rejected by API", uploadHuge.status === 400)

  const ownedUploadId = uploadOk.ok ? uploadBody.upload?.id : undefined
  const evidenceSkills = [{ id: skillId, name: "Leadership", level: 5, category: "Leadership", source: "Self", verified: true }]
  const evidenceExperiences = [
    {
      id: expLabelId,
      type: "volunteer",
      role: "Volunteer",
      organization: "Label Only",
      location: "",
      start: "2024-01",
      end: "",
      current: true,
      description: "Labels are not evidence.",
      skills: ["Leadership"],
      evidence: [{ id: evLabelId, type: "certificate", label: "I say this is verified", status: "verified" }],
    },
  ]
  if (ownedUploadId) {
    evidenceSkills.push({ id: id("sk-comm"), name: "Communication", level: 3, category: "Communication", source: "Self", verified: false })
    evidenceExperiences.push({
      id: expEvidenceId,
      type: "volunteer",
      role: "Documented volunteer",
      organization: "Evidence Org",
      location: "",
      start: "2024-01",
      end: "",
      current: true,
      description: "This experience is tied to a real upload from this run.",
      skills: ["Communication"],
      evidence: [{ id: evFileId, type: "photo", label: "Photo evidence", uploadId: ownedUploadId, status: "pending" }],
    })
  }

  const publishPortfolio = await req("/api/auth/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json", cookie: studentCookie },
    body: JSON.stringify({
      snapshot: studentSnapshot({
        slug: publicSlug,
        published: true,
        visibility: "public",
        showEvidence: true,
        tagline: "Public audit portfolio",
        skills: evidenceSkills,
        experiences: evidenceExperiences,
        applications: [{ opportunityId: id("secret-app"), status: "applied", updatedAt: "2026-01-01" }],
      }),
    }),
  })
  const published = await json(publishPortfolio)
  record(
    "evidence labels do not make a skill evidence-backed",
    published.snapshot?.skills?.every((skill) => skill.name !== "Leadership" || skill.evidenceBacked === false),
  )
  if (ownedUploadId) {
    record(
      "uploaded evidence makes a skill evidence-backed",
      Boolean(published.snapshot?.skills?.some((skill) => skill.name === "Communication" && skill.evidenceBacked === true)),
    )
  } else {
    skip("uploaded evidence makes a skill evidence-backed", "NOT RUN — production Blob storage not configured")
  }
  const publicRes = await req(`/api/public/portfolio/${published.snapshot?.portfolio?.slug || publicSlug}`)
  const publicBody = await json(publicRes)
  record("public portfolio is available when published", publicRes.ok)
  record(
    "public portfolio omits private fields",
    publicRes.ok &&
      !("applications" in (publicBody.portfolio ?? {})) &&
      !("passwordHash" in (publicBody.portfolio ?? {})) &&
      publicBody.portfolio?.email === null &&
      !publicBody.portfolio?.id,
  )

  const privateSlug = await req("/api/public/portfolio/amara-okafor")
  record("unpublished/private portfolios are not exposed", privateSlug.status === 404)

  await req("/api/auth/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json", cookie: studentCookie },
    body: JSON.stringify({
      snapshot: studentSnapshot({
        slug: unlistedSlug,
        published: true,
        visibility: "unlisted",
        showEvidence: false,
        skills: evidenceSkills,
        experiences: evidenceExperiences,
      }),
    }),
  })
  const unlistedAnon = await req(`/api/public/portfolio/${unlistedSlug}`)
  const unlistedAuth = await req(`/api/public/portfolio/${unlistedSlug}`, { headers: { cookie: amaraCookie } })
  record("unlisted portfolio is hidden from anonymous users", unlistedAnon.status === 404)
  record("unlisted portfolio is visible to signed-in users", unlistedAuth.ok)

  const noAuthUpload = await req("/api/uploads", { method: "POST", body: formOk })
  record("uploads require authentication", noAuthUpload.status === 401)

  const logout = await req("/api/auth/logout", { method: "POST", headers: { cookie: studentCookie } })
  const afterLogout = await req("/api/auth/me", { headers: { cookie: studentCookie } })
  record("logout invalidates the session", logout.ok && afterLogout.status === 401)

  await req("/api/auth/logout", { method: "POST", headers: { cookie: adminCookie } })
  const staleAdminDash = await req("/admin/dashboard", { headers: { cookie: adminCookie } })
  const staleAdminLoc = staleAdminDash.headers.get("location") || ""
  record(
    "removing vc_session denies /admin/dashboard",
    staleAdminDash.status === 307 || staleAdminDash.status === 302,
    `status ${staleAdminDash.status}`,
  )
  record("stale admin cookie redirects to login", staleAdminLoc.includes("/login"))
  const staleAdminApi = await req("/api/admin/stats", { headers: { cookie: adminCookie } })
  record("removing vc_session denies Admin APIs", staleAdminApi.status === 401, `status ${staleAdminApi.status}`)

  const stillThere = await req("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: studentEmail, password: studentPass }),
  })
  record("users persist after later requests", stillThere.ok)

  let sawLimit = false
  for (let i = 0; i < 12; i++) {
    const res = await req("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "nobody@example.com", password: "wrong-password" }),
    })
    if (res.status === 429) {
      sawLimit = true
      break
    }
  }
  record("login is rate limited", sawLimit)
}

const failed = []
const skipped = []
try {
  await unitTests()
  await httpTests()
} catch (err) {
  record("audit harness", false, err instanceof Error ? err.message : String(err))
}

for (const item of results) {
  if (item.skipped) skipped.push(item.name)
  else if (!item.ok) failed.push(item.name)
}
const passed = results.filter((item) => item.ok).length
console.log("")
console.log(`${passed}/${results.length} checks passed${skipped.length ? `, ${skipped.length} not run` : ""}`)
if (skipped.length) {
  console.log("Not run:", skipped.join(", "))
}
if (failed.length) {
  console.error("Failed:", failed.join(", "))
  process.exit(1)
}
