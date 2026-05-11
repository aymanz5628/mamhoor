"use client";

import { useActionState } from "react";
import { signup } from "@/app/actions/auth";
import styles from "../auth.module.css";
import Link from "next/link";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <div className={styles.authPage}>
      {/* Form Side */}
      <div className={styles.authForm}>
        <div className={styles.authHeader}>
          <Link href="/" className={styles.authLogo}>
            <div className={styles.authLogoIcon}>م</div>
            <span>ممهور</span>
          </Link>
          <h1 className={styles.authTitle}>أنشئ حسابك</h1>
          <p className={styles.authSubtitle}>
            ابدأ بتنظيم واعتماد محتواك اليوم — مجاناً
          </p>
        </div>

        {state?.message && (
          <div className={styles.formError}>{state.message}</div>
        )}

        <form action={action}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName" className={styles.formLabel}>
                الاسم الأول
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className={styles.formInput}
                placeholder="أحمد"
                autoComplete="given-name"
                required
              />
              {state?.errors?.firstName && (
                <p className={styles.fieldError}>{state.errors.firstName[0]}</p>
              )}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="lastName" className={styles.formLabel}>
                اسم العائلة
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className={styles.formInput}
                placeholder="محمد"
                autoComplete="family-name"
                required
              />
              {state?.errors?.lastName && (
                <p className={styles.fieldError}>{state.errors.lastName[0]}</p>
              )}
            </div>
          </div>

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

          <div className={styles.formGroup}>
            <label htmlFor="orgName" className={styles.formLabel}>
              اسم المنظمة
              <span
                style={{
                  color: "var(--text-muted)",
                  fontWeight: 400,
                  marginRight: 4,
                }}
              >
                (اختياري)
              </span>
            </label>
            <input
              type="text"
              id="orgName"
              name="orgName"
              className={styles.formInput}
              placeholder="اسم شركتك أو فريقك"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>
              كلمة المرور
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
              <div className={styles.fieldError}>
                {state.errors.password.map((error) => (
                  <p key={error}>• {error}</p>
                ))}
              </div>
            )}
          </div>

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.formSubmit}
              disabled={pending}
            >
              {pending ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
            </button>
          </div>
        </form>

        <div className={styles.divider}>أو</div>
        
        <a href="/api/auth/google" className={styles.googleBtn}>
          <svg className={styles.googleIcon} viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
            <path d="M1 1h22v22H1z" fill="none" />
          </svg>
          التسجيل باستخدام Google
        </a>


        <p className={styles.authFooter}>
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className={styles.authFooterLink}>
            سجّل دخولك
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
            انضم لفرق تثق
            <br />
            في جودة محتواها
          </h2>
          <p className={styles.authPanelDesc}>
            مئات الفرق تستخدم ممهور لإدارة واعتماد محتواها بكفاءة وشفافية.
          </p>
        </div>
      </div>
    </div>
  );
}
