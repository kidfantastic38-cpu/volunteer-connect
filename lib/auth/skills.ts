import { randomUUID } from "node:crypto"
import { and, eq } from "drizzle-orm"
import { getDb } from "@/lib/db/client"
import { skillVerifications, skills } from "@/lib/db/schema"

export type SkillVerificationRecord = {
  skillKey: string
  skillName: string
  verified: boolean
  verifiedBy: string | null
  verifiedAt: string
  source: string
}

export function normalizeSkillKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ")
}

export async function listSkillVerifications(userId: string): Promise<SkillVerificationRecord[]> {
  const rows = await getDb().select().from(skillVerifications).where(eq(skillVerifications.userId, userId))
  return rows.map((row) => ({
    skillKey: row.skillKey,
    skillName: row.skillName,
    verified: Boolean(row.verified),
    verifiedBy: row.verifiedBy,
    verifiedAt: row.verifiedAt,
    source: row.source,
  }))
}

export async function skillVerificationMap(userId: string): Promise<Map<string, SkillVerificationRecord>> {
  return new Map((await listSkillVerifications(userId)).map((row) => [row.skillKey, row]))
}

export async function setSkillVerification(input: {
  userId: string
  skillName: string
  verified: boolean
  verifiedBy: string
  source?: string
}): Promise<SkillVerificationRecord | null> {
  const skillName = input.skillName.trim().slice(0, 80)
  const skillKey = normalizeSkillKey(skillName)
  if (!skillKey) return null
  const stamp = new Date().toISOString()
  const db = getDb()
  if (!input.verified) {
    await db
      .delete(skillVerifications)
      .where(and(eq(skillVerifications.userId, input.userId), eq(skillVerifications.skillKey, skillKey)))
    return { skillKey, skillName, verified: false, verifiedBy: input.verifiedBy, verifiedAt: stamp, source: input.source ?? "admin" }
  }
  const [skill] = await db
    .select({ id: skills.id })
    .from(skills)
    .where(and(eq(skills.userId, input.userId), eq(skills.name, skillName)))
    .limit(1)
  await db
    .insert(skillVerifications)
    .values({
      id: randomUUID(),
      userId: input.userId,
      skillId: skill?.id ?? null,
      skillKey,
      skillName,
      verified: true,
      evidenceBacked: false,
      verifiedBy: input.verifiedBy,
      verifiedAt: stamp,
      source: input.source ?? "admin",
    })
    .onConflictDoUpdate({
      target: [skillVerifications.userId, skillVerifications.skillKey],
      set: {
        skillName,
        skillId: skill?.id ?? null,
        verified: true,
        verifiedBy: input.verifiedBy,
        verifiedAt: stamp,
        source: input.source ?? "admin",
      },
    })
  return { skillKey, skillName, verified: true, verifiedBy: input.verifiedBy, verifiedAt: stamp, source: input.source ?? "admin" }
}
