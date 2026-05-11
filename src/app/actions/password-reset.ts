"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  ForgotPasswordFormSchema,
  ResetPasswordFormSchema,
  type ForgotPasswordFormState,
  type ResetPasswordFormState,
} from "@/lib/definitions";

// ============================================
// طلب إعادة تعيين كلمة المرور — Forgot Password
// ============================================

export async function requestPasswordReset(
  state: ForgotPasswordFormState,
  formData: FormData
): Promise<ForgotPasswordFormState> {
  // 1. التحقق من صحة الحقول
  const validatedFields = ForgotPasswordFormSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email } = validatedFields.data;

  // 2. البحث عن المستخدم (لا نكشف وجوده من عدمه — أمان)
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // دائماً نعرض رسالة نجاح حتى لو لم يكن البريد موجوداً (حماية من التعداد)
  if (!user) {
    return {
      success: true,
      message:
        "إذا كان هذا البريد مسجلاً لدينا، ستجد رابط إعادة التعيين في صندوق الوارد.",
    };
  }

  // 3. إلغاء التوكنات السابقة غير المستخدمة
  await prisma.passwordResetToken.updateMany({
    where: {
      userId: user.id,
      used: false,
    },
    data: {
      used: true,
    },
  });

  // 4. إنشاء توكن جديد (صالح لمدة ساعة)
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // ساعة واحدة

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  // 5. في بيئة التطوير: طباعة الرابط في الـ console
  // في الإنتاج: هنا يتم إرسال بريد إلكتروني
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;
  
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║      🔑 رابط إعادة تعيين كلمة المرور (تطوير)       ║");
  console.log("╠══════════════════════════════════════════════════════╣");
  console.log(`║  البريد: ${email}`);
  console.log(`║  الرابط: ${resetUrl}`);
  console.log(`║  صالح حتى: ${expiresAt.toLocaleString("ar-SA")}`);
  console.log("╚══════════════════════════════════════════════════════╝\n");

  return {
    success: true,
    message:
      "إذا كان هذا البريد مسجلاً لدينا، ستجد رابط إعادة التعيين في صندوق الوارد.",
  };
}

// ============================================
// إعادة تعيين كلمة المرور — Reset Password
// ============================================

export async function resetPassword(
  state: ResetPasswordFormState,
  formData: FormData
): Promise<ResetPasswordFormState> {
  // 1. التحقق من صحة الحقول
  const validatedFields = ResetPasswordFormSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { token, password } = validatedFields.data;

  // 2. التحقق من صحة التوكن
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken) {
    return {
      message: "رابط إعادة التعيين غير صالح. يرجى طلب رابط جديد.",
    };
  }

  if (resetToken.used) {
    return {
      message: "هذا الرابط تم استخدامه بالفعل. يرجى طلب رابط جديد.",
    };
  }

  if (resetToken.expiresAt < new Date()) {
    return {
      message: "انتهت صلاحية رابط إعادة التعيين. يرجى طلب رابط جديد.",
    };
  }

  // 3. تحديث كلمة المرور
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { passwordHash: hashedPassword },
  });

  // 4. تعليم التوكن كمستخدم
  await prisma.passwordResetToken.update({
    where: { id: resetToken.id },
    data: { used: true },
  });

  return {
    success: true,
    message: "تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.",
  };
}
