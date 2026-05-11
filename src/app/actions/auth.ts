"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import {
  SignupFormSchema,
  LoginFormSchema,
  type SignupFormState,
  type LoginFormState,
} from "@/lib/definitions";

// ============================================
// إنشاء حساب — Sign Up
// ============================================

export async function signup(
  state: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  // 1. التحقق من صحة الحقول
  const validatedFields = SignupFormSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    orgName: formData.get("orgName"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { firstName, lastName, email, password } = validatedFields.data;

  // 2. التحقق من عدم وجود مستخدم بنفس البريد
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      message: "هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول.",
    };
  }

  // 3. تشفير كلمة المرور وإنشاء المستخدم
  const hashedPassword = await bcrypt.hash(password, 10);
  const fullName = `${firstName} ${lastName}`.trim();

  const user = await prisma.user.create({
    data: {
      email,
      name: fullName,
      passwordHash: hashedPassword,
      role: "OWNER", // أول مستخدم يسجل يكون مالكاً
    },
  });

  if (!user) {
    return {
      message: "حدث خطأ أثناء إنشاء حسابك. يرجى المحاولة مرة أخرى.",
    };
  }

  // 4. إنشاء جلسة
  await createSession(user.id, user.role);

  // 5. توجيه المستخدم للـ Onboarding
  redirect("/onboarding");
}

// ============================================
// تسجيل الدخول — Sign In
// ============================================

export async function login(
  state: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  // 1. التحقق من صحة الحقول
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  // 2. البحث عن المستخدم
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return {
      message: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    };
  }

  // 3. مقارنة كلمة المرور
  const passwordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatch) {
    return {
      message: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    };
  }

  // 4. إنشاء جلسة
  await createSession(user.id, user.role);

  // 5. توجيه المستخدم
  if (!user.onboardingComplete) {
    redirect("/onboarding");
  }

  redirect("/dashboard");
}

// ============================================
// تسجيل الخروج — Logout
// ============================================

export async function logout() {
  await deleteSession();
  redirect("/login");
}
