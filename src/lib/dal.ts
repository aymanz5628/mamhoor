import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// ============================================
// طبقة الوصول للبيانات — Data Access Layer
// ============================================

/**
 * التحقق من الجلسة — يُستخدم في Server Components و Server Actions
 * يعيد معلومات الجلسة أو يحول المستخدم لصفحة الدخول
 */
export const verifySession = cache(async () => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect("/login");
  }

  return { isAuth: true, userId: session.userId, role: session.role };
});

/**
 * الحصول على بيانات المستخدم الحالي
 */
export const getCurrentUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        onboardingComplete: true,
        createdAt: true,
      },
    });

    return user;
  } catch {
    console.log("فشل في جلب بيانات المستخدم");
    return null;
  }
});

/**
 * التحقق من الجلسة بشكل اختياري — لا يعيد توجيه
 * مفيد للصفحات العامة التي تتصرف بشكل مختلف للمستخدم المسجل
 */
export const getOptionalSession = cache(async () => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    return null;
  }

  return { isAuth: true, userId: session.userId, role: session.role };
});
