"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/app/actions/password-reset";
import styles from "../auth.module.css";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(
    requestPasswordReset,
    undefined
  );

  return (
    <div className={styles.authPage}>
      {/* Form Side */}
      <div className={styles.authForm}>
        <div className={styles.authHeader}>
          <Link href="/" className={styles.authLogo}>
            <div className={styles.authLogoIcon}>م</div>
            <span>ممهور</span>
          </Link>
          <h1 className={styles.authTitle}>نسيت كلمة المرور؟</h1>
          <p className={styles.authSubtitle}>
            أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
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

        {!state?.success && (
          <form action={action}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>
                البريد الإلكتروني
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={styles.formInput}
                placeholder="name@company.com"
                dir="ltr"
                autoComplete="email"
                required
              />
              {state?.errors?.email && (
                <p className={styles.fieldError}>{state.errors.email[0]}</p>
              )}
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.formSubmit}
                disabled={pending}
              >
                {pending ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
              </button>
            </div>
          </form>
        )}

        {state?.success && (
          <Link href="/login" className={styles.formSubmit} style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
            العودة لتسجيل الدخول
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
            لا تقلق
            <br />
            سنساعدك في العودة
          </h2>
          <p className={styles.authPanelDesc}>
            خطوة واحدة فقط لاستعادة الوصول إلى حسابك وإدارة محتواك بأمان.
          </p>
        </div>
      </div>
    </div>
  );
}
