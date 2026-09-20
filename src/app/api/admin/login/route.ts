import { NextResponse } from "next/server";

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

  return NextResponse.json({ ok: true, email: expectedEmail });
}
