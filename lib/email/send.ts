/**
 * Email delivery abstraction.
 * Development: no provider required; codes are not emailed.
 * Production: Brevo (Sendinblue) transactional API. The plaintext code is never logged.
 */
import { publicAppUrl } from "@/lib/runtime/app-url"

function brevoApiKey(): string {
  return (process.env.BREVO_API_KEY || process.env.BRIVO_API_KEY || "").trim()
}

function parseFrom(value: string): { email: string; name?: string } {
  const match = value.match(/^(.*)<([^>]+)>$/)
  if (match) {
    return {
      name: match[1].trim().replace(/^["']|["']$/g, "") || undefined,
      email: match[2].trim(),
    }
  }
  return { email: value.trim() }
}

export function emailProviderConfigured(): boolean {
  return Boolean(brevoApiKey() && process.env.EMAIL_FROM?.trim())
}

export async function sendVerificationEmail(input: { to: string; code: string }): Promise<void> {
  if (!isProductionLike() && !emailProviderConfigured()) {
    console.info("[email] verification code issued (development; not emailed)")
    return
  }

  const apiKey = brevoApiKey()
  const fromRaw = process.env.EMAIL_FROM?.trim()
  if (!apiKey || !fromRaw) {
    throw new Error("BREVO_API_KEY and EMAIL_FROM are required to send email.")
  }

  const sender = parseFrom(fromRaw)
  const verifyUrl = `${publicAppUrl()}/verify`
  const text = [
    "Your Volunteer Connect verification code expires in 15 minutes.",
    "",
    `Code: ${input.code}`,
    `Verify at: ${verifyUrl}`,
    "",
    "If you did not request this, you can ignore this email.",
  ].join("\n")

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender,
      to: [{ email: input.to }],
      subject: "Your Volunteer Connect verification code",
      textContent: text,
    }),
  })

  if (!res.ok) {
    throw new Error("Could not send the verification email.")
  }
}

function isProductionLike(): boolean {
  return process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production"
}
