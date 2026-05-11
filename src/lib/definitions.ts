import * as z from "zod";

// ============================================
// مخططات التحقق — Validation Schemas
// ============================================

export const SignupFormSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "الاسم الأول يجب أن يكون حرفين على الأقل" })
    .trim(),
  lastName: z
    .string()
    .min(2, { message: "اسم العائلة يجب أن يكون حرفين على الأقل" })
    .trim(),
  email: z
    .string()
    .email({ message: "يرجى إدخال بريد إلكتروني صحيح" })
    .trim(),
  orgName: z.string().optional(),
  password: z
    .string()
    .min(8, { message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" })
    .regex(/[a-zA-Z]/, { message: "يجب أن تحتوي على حرف واحد على الأقل" })
    .regex(/[0-9]/, { message: "يجب أن تحتوي على رقم واحد على الأقل" })
    .trim(),
});

export const LoginFormSchema = z.object({
  email: z
    .string()
    .email({ message: "يرجى إدخال بريد إلكتروني صحيح" })
    .trim(),
  password: z
    .string()
    .min(1, { message: "يرجى إدخال كلمة المرور" })
    .trim(),
});

export const ForgotPasswordFormSchema = z.object({
  email: z
    .string()
    .email({ message: "يرجى إدخال بريد إلكتروني صحيح" })
    .trim(),
});

export const ResetPasswordFormSchema = z.object({
  token: z.string().min(1, { message: "رمز إعادة التعيين مطلوب" }),
  password: z
    .string()
    .min(8, { message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" })
    .regex(/[a-zA-Z]/, { message: "يجب أن تحتوي على حرف واحد على الأقل" })
    .regex(/[0-9]/, { message: "يجب أن تحتوي على رقم واحد على الأقل" })
    .trim(),
  confirmPassword: z.string().min(1, { message: "يرجى تأكيد كلمة المرور" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين",
  path: ["confirmPassword"],
});

// ============================================
// أنواع البيانات — Types
// ============================================

export type SignupFormState =
  | {
      errors?: {
        firstName?: string[];
        lastName?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export type LoginFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export type ForgotPasswordFormState =
  | {
      errors?: {
        email?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;

export type ResetPasswordFormState =
  | {
      errors?: {
        token?: string[];
        password?: string[];
        confirmPassword?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;

export type SessionPayload = {
  userId: string;
  role: string;
  expiresAt: Date;
};
