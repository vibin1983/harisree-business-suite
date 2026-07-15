import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  const expectedUsername = process.env.HBS_USERNAME;
  const expectedPassword = process.env.HBS_PASSWORD;
  const sessionToken = process.env.HBS_SESSION_TOKEN;

  if (!expectedUsername || !expectedPassword || !sessionToken) {
    return NextResponse.json(
      { error: "Login is not configured" },
      { status: 500 }
    );
  }

  if (username !== expectedUsername || password !== expectedPassword) {
    return NextResponse.json(
      { error: "Incorrect username or password" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("hbs_session", sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
