import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session-crypto";

// المسارات المحمية — تحتاج تسجيل دخول
const protectedRoutes = ["/dashboard", "/onboarding"];

// المسارات العامة — متاحة فقط لغير المسجلين
const authRoutes = ["/login", "/register"];

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // التحقق من نوع المسار
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));

  // فك تشفير الجلسة من الكوكيز
  const cookie = req.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  // إذا كان المسار محمي والمستخدم غير مسجل → صفحة الدخول
  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // إذا كان المستخدم مسجل ويحاول الدخول لصفحة تسجيل → الداشبورد
  if (isAuthRoute && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

// المسارات التي لا يجب أن يعمل عليها البروكسي
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$|.*\\.ico$).*)"],
};
