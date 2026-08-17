/**
 * Targeted security checks for Volunteer Connect.
 * Usage: node scripts/security-audit.mjs
 * Optional: BASE_URL=http://localhost:3000
 */
import { detectFileKind, validateUpload } from "../lib/security/files.ts"
import { safeHttpUrl } from "../lib/security/urls.ts"

const BASE = process.env.BASE_URL || "http://127.0.0.1:3000"
const results = []

function record(name, ok, detail = "") {
  results.push({ name, ok, detail })
  const mark = ok ? "PASS" : "FAIL"
  console.log(`${mark}  ${name}${detail ? ` — ${detail}` : ""}`)
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

async function req(path, init = {}) {
  return fetch(`${BASE}${path}`, { redirect: "manual", ...init })
}

function jpegBytes() {
  return new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0xff, 0xd9])
}

function pdfBytes() {
  return new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xc7, 0xec])
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
  const stamp = Date.now()
  const studentEmail = `audit-student-${stamp}@example.com`
  const employerEmail = `audit-employer-${stamp}@example.com`
  const studentPass = "student-pass-1"
  const employerPass = "employer-pass-1"

  const health = await req("/login")
  if (health.status >= 500) {
    record("application reachable", false, `GET /login -> ${health.status}`)
    return
  }
  record("application reachable", health.status < 500)

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
      snapshot: {
        user: { name: "Audit Student", email: "spoof@evil.test", headline: "", location: "", about: "", interests: [], avatar: "chart-1" },
        role: "admin",
        verified: true,
        onboarding: { basics: true, education: false, experience: false, projects: false, achievements: false, skills: true },
        education: [],
        experiences: [],
        projects: [],
        achievements: [],
        skills: [{ id: "sk-fake", name: "Leadership", level: 5, category: "Leadership", source: "Self", verified: true }],
        applications: [],
        notifications: [],
        portfolio: { published: false, theme: "aurora", slug: `audit-student-${stamp}`, visibility: "private", showContact: false, showEvidence: false, tagline: "" },
        privacy: {},
        cvTemplate: "modern",
      },
    }),
  })
  const escalateBody = await json(escalate)
  record("profile save ignores client role/admin", escalate.ok && escalateBody.snapshot?.role === "student")
  record("profile save ignores client verified email flag", escalateBody.snapshot?.verified === false)
  record("profile save ignores client skill.verified", escalateBody.snapshot?.skills?.[0]?.verified === false)
  record("profile save keeps server email", escalateBody.snapshot?.user?.email === studentEmail)

  const otherProfile = await req("/api/auth/profile?id=user-amara", {
    method: "PUT",
    headers: { "Content-Type": "application/json", cookie: studentCookie },
    body: JSON.stringify({
      snapshot: {
        user: { name: "Hacked", email: "amara@example.com", headline: "", location: "", about: "", interests: [], avatar: "chart-1" },
        role: "student",
        verified: true,
        onboarding: { basics: true, education: true, experience: true, projects: true, achievements: true, skills: true },
        education: [],
        experiences: [{ id: "exp-hack", type: "work", role: "Hacked", organization: "Nope", location: "", start: "", end: "", current: false, description: "", skills: [], evidence: [] }],
        projects: [],
        achievements: [],
        skills: [],
        applications: [],
        notifications: [],
        portfolio: { published: false, theme: "aurora", slug: "amara-okafor", visibility: "private", showContact: false, showEvidence: false, tagline: "" },
        privacy: {},
        cvTemplate: "modern",
      },
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
  record("amara experience was not overwritten", !(amaraBody.snapshot?.experiences ?? []).some((item) => item.id === "exp-hack"))

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
        name: `Audit Org ${stamp}`,
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
    body: JSON.stringify({ title: "Community Garden Lead", description: "Help run a weekend garden programme." }),
  })
  const publishedOpp = await json(publishOk)
  record("verified employer can publish", publishOk.ok)
  const opportunityId = publishedOpp.opportunity?.id

  const studentCreateOpp = await req("/api/opportunities", {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: studentCookie },
    body: JSON.stringify({ title: "Should fail", description: "Students cannot post." }),
  })
  record("student cannot create opportunity", studentCreateOpp.status === 403)

  const otherEmployerEmail = `audit-employer-b-${stamp}@example.com`
  const otherEmployerReg = await req("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Other Employer",
      email: otherEmployerEmail,
      password: employerPass,
      role: "employer",
      organization: {
        name: `Other Org ${stamp}`,
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
      title: "Expired role",
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

  const otherStudentEmail = `audit-student-b-${stamp}@example.com`
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
  const otherStudentCookie = cookieFrom(otherStudentReg)
  const stealApp = await req(`/api/applications/${applyBody.application?.id || "missing"}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: otherStudentCookie },
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
    body: JSON.stringify({ title: "Draft only", description: "Not public yet.", status: "draft" }),
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
    body: JSON.stringify({ title: "Closed role", description: "No longer accepting.", status: "published" }),
  })
  const closedBody = await json(closedOpp)
  await req(`/api/employer/opportunities/${closedBody.opportunity?.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", cookie: employerCookie },
    body: JSON.stringify({ title: "Closed role", description: "No longer accepting.", status: "closed" }),
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
    employerStatus.ok && (employerStatusBody.application?.status === "shortlisted"),
  )

  const randomApp = await req("/api/applications/00000000-0000-4000-8000-000000000000", { headers: { cookie: otherStudentCookie } })
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

  const fakeJpeg = new File([jpegBytes()], "photo.jpg", { type: "image/jpeg" })
  const formOk = new FormData()
  formOk.append("file", fakeJpeg)
  const uploadOk = await req("/api/uploads", { method: "POST", headers: { cookie: studentCookie }, body: formOk })
  const uploadBody = await json(uploadOk)
  record("allowed jpeg upload accepted", uploadOk.ok)
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

  const publishPortfolio = await req("/api/auth/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json", cookie: studentCookie },
    body: JSON.stringify({
      snapshot: {
        ...escalateBody.snapshot,
        portfolio: {
          published: true,
          theme: "aurora",
          slug: `audit-student-${stamp}`,
          visibility: "public",
          showContact: false,
          showEvidence: true,
          tagline: "Public audit portfolio",
        },
        applications: [{ opportunityId: "secret-app", status: "applied", updatedAt: "2026-01-01" }],
        experiences: [
          {
            id: "exp-label",
            type: "volunteer",
            role: "Volunteer",
            organization: "Label Only",
            location: "",
            start: "2024-01",
            end: "",
            current: true,
            description: "Labels are not evidence.",
            skills: ["Leadership"],
            evidence: [{ id: "ev-fake", type: "certificate", label: "I say this is verified", status: "verified" }],
          },
        ],
      },
    }),
  })
  const published = await json(publishPortfolio)
  record(
    "evidence labels do not make a skill evidence-backed",
    published.snapshot?.skills?.every((skill) => skill.name !== "Leadership" || skill.evidenceBacked === false),
  )
  const publicRes = await req(`/api/public/portfolio/${published.snapshot?.portfolio?.slug || `audit-student-${stamp}`}`)
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

  const unlistedSlug = `audit-unlisted-${stamp}`
  await req("/api/auth/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json", cookie: studentCookie },
    body: JSON.stringify({
      snapshot: {
        ...published.snapshot,
        portfolio: {
          published: true,
          theme: "aurora",
          slug: unlistedSlug,
          visibility: "unlisted",
          showContact: false,
          showEvidence: false,
          tagline: "",
        },
      },
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
try {
  await unitTests()
  await httpTests()
} catch (err) {
  record("audit harness", false, err instanceof Error ? err.message : String(err))
}

for (const item of results) {
  if (!item.ok) failed.push(item.name)
}
console.log("")
console.log(`${results.filter((item) => item.ok).length}/${results.length} checks passed`)
if (failed.length) {
  console.error("Failed:", failed.join(", "))
  process.exit(1)
}
