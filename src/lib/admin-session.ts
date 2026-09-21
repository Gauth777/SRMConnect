import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_SESSION_COOKIE = "cc_admin_session";

function sign(email: string, secret: string) {
  return createHmac("sha256", secret).update(email).digest("hex");
}

export function createAdminSession(email: string) {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("ADMIN_PASSWORD is not configured.");
  const normalized = email.trim().toLowerCase();
  return `${Buffer.from(normalized).toString("base64url")}.${sign(normalized, secret)}`;
}

export function verifyAdminSession(token?: string | null) {
  if (!token) return false;
  const expectedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const secret = process.env.ADMIN_PASSWORD;
  if (!expectedEmail || !secret) return false;

  const [encodedEmail, suppliedSignature] = token.split(".");
  if (!encodedEmail || !suppliedSignature) return false;

  let email = "";
  try {
    email = Buffer.from(encodedEmail, "base64url").toString("utf8").trim().toLowerCase();
  } catch {
    return false;
  }
  if (email !== expectedEmail) return false;

  const expectedSignature = sign(email, secret);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
