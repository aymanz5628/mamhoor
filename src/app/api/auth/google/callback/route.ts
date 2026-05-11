import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/login?error=NoCode`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Missing Google Credentials" }, { status: 500 });
  }

  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  try {
    // 1. Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("Token error:", tokenData);
      return NextResponse.redirect(`${baseUrl}/login?error=GoogleAuthFailed`);
    }

    // 2. Get user info
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();

    if (!userData.email) {
      return NextResponse.redirect(`${baseUrl}/login?error=NoEmailFromGoogle`);
    }

    // 3. Find or create user
    let user = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    let isNewUser = false;

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name || userData.email.split("@")[0],
          passwordHash: "", // No password for OAuth users
          avatarUrl: userData.picture || null,
          onboardingComplete: false,
        },
      });
      isNewUser = true;
    }

    // 4. Create session
    await createSession(user.id, user.role);

    // 5. Redirect based on onboarding status
    if (user.onboardingComplete) {
      return NextResponse.redirect(`${baseUrl}/dashboard`);
    } else {
      return NextResponse.redirect(`${baseUrl}/onboarding`);
    }

  } catch (error) {
    console.error("Google Auth Error:", error);
    return NextResponse.redirect(`${baseUrl}/login?error=InternalError`);
  }
}
