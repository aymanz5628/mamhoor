"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/app/actions/password-reset";
import styles from "../auth.module.css";
import Link from "next/link";
import { Suspense } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [state, action, pending] = useActionState(resetPassword, undefined);

  // لا يوجد توكن في الرابط
  if (!token) {
    return (
      <div className={styles.authPage}>
        <div className={styles.authForm}>
          <div className={styles.authHeader}>
            <Link href="/" className={styles.authLogo}>
              <div className={styles.authLogoIcon}>م</div>
              <span>ممهور</span>
            </Link>
            <h1 className={styles.authTitle}>رابط غير صالح</h1>
            <p className={styles.authSubtitle}>
              يبدو أن رابط إعادة التعيين غير صحيح أو ناقص.
            </p>
          </div>

          <div className={styles.formError}>
            رابط إعادة التعيين غير صالح. يرجى طلب رابط جديد.
          </div>

          <Link
            href="/forgot-password"
            className={styles.formSubmit}
            style={{
              display: "block",
              textAlign: "center",
              textDecoration: "none",
              marginTop: "var(--space-6)",
            }}
          >
            طلب رابط جديد
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authPage}>
      {/* Form Side */}
      <div className={styles.authForm}>
        <div className={styles.authHeader}>
          <Link href="/" className={styles.authLogo}>
            <div className={styles.authLogoIcon}>م</div>
            <span>ممهور</span>
          </Link>
          <h1 className={styles.authTitle}>إعادة تعيين كلمة المرور</h1>
          <p className={styles.authSubtitle}>
            اختر كلمة مرور جديدة وقوية لحسابك
          </p>
        </div>

        {state?.message && (
          <div
            className={
              state.success ? styles.formSuccess : styles.formError
            }
          >
            {state.success && <span className={styles.successIcon}>✓</span>}
            {state.message}
          </div>
        )}

        {!state?.success ? (
          <form action={action}>
            <input type="hidden" name="token" value={token} />

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.formLabel}>
                كلمة المرور الجديدة
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className={styles.formInput}
                placeholder="••••••••"
                dir="ltr"
                autoComplete="new-password"
                required
              />
              {state?.errors?.password && (
                <p className={styles.fieldError}>
                  {state.errors.password[0]}
                </p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.formLabel}>
                تأكيد كلمة المرور
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className={styles.formInput}
                placeholder="••••••••"
                dir="ltr"
                autoComplete="new-password"
                required
              />
              {state?.errors?.confirmPassword && (
                <p className={styles.fieldError}>
                  {state.errors.confirmPassword[0]}
                </p>
              )}
            </div>

            <div className={styles.passwordHints}>
              <p className={styles.passwordHint}>• 8 أحرف على الأقل</p>
              <p className={styles.passwordHint}>
                • حرف إنجليزي واحد على الأقل
              </p>
              <p className={styles.passwordHint}>• رقم واحد على الأقل</p>
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.formSubmit}
                disabled={pending}
              >
                {pending ? "جاري التحديث..." : "تعيين كلمة المرور الجديدة"}
              </button>
            </div>
          </form>
        ) : (
          <Link
            href="/login"
            className={styles.formSubmit}
            style={{
              display: "block",
              textAlign: "center",
              textDecoration: "none",
            }}
          >
            الانتقال لتسجيل الدخول
          </Link>
        )}

        <p className={styles.authFooter}>
          تذكرت كلمة المرور؟{" "}
          <Link href="/login" className={styles.authFooterLink}>
            تسجيل الدخول
          </Link>
        </p>
      </div>

      {/* Decorative Side */}
      <div className={styles.authPanel}>
        <span
          className={`star star--lg star--cream ${styles.authPanelDecor} ${styles.authDecorStar1}`}
        />
        <span
          className={`star star--cream ${styles.authPanelDecor} ${styles.authDecorStar2}`}
        />
        <span
          className={`star star--lg star--cream ${styles.authPanelDecor} ${styles.authDecorStar3}`}
          style={{ width: 80, height: 80 }}
        />
        <div className={styles.authPanelContent}>
          <h2 className={styles.authPanelTitle}>
            كلمة مرور جديدة
            <br />
            بداية آمنة
          </h2>
          <p className={styles.authPanelDesc}>
            اختر كلمة مرور قوية للحفاظ على أمان محتواك ومشاريعك.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
