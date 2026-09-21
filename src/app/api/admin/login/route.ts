import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, createAdminSession } from "@/lib/admin-session";

export async function POST(request: Request) {
  const expectedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedEmail || !expectedPassword) {
    return NextResponse.json(
      { message: "Admin credentials are not configured on the server." },
      { status: 503 },
    );
  }

  let payload: { email?: string; password?: string };
  try {
    payload = (await request.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ message: "Invalid login request." }, { status: 400 });
  }

  const email = payload.email?.trim().toLowerCase() || "";
  const password = payload.password || "";

  if (email !== expectedEmail || password !== expectedPassword) {
    return NextResponse.json({ message: "Invalid admin email or password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, email: expectedEmail });
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSession(expectedEmail), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
