"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import styles from "../auth.module.css";
import Link from "next/link";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className={styles.authPage}>
      {/* Form Side */}
      <div className={styles.authForm}>
        <div className={styles.authHeader}>
          <Link href="/" className={styles.authLogo}>
            <div className={styles.authLogoIcon}>م</div>
            <span>ممهور</span>
          </Link>
          <h1 className={styles.authTitle}>مرحباً بعودتك</h1>
          <p className={styles.authSubtitle}>
            سجّل دخولك للمتابعة إلى لوحة التحكم
          </p>
        </div>

        {state?.message && (
          <div className={styles.formError}>{state.message}</div>
        )}

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
              autoComplete="current-password"
              required
            />
            {state?.errors?.password && (
              <p className={styles.fieldError}>{state.errors.password[0]}</p>
            )}
            <Link href="/forgot-password" className={styles.forgotLink}>
              نسيت كلمة المرور؟
            </Link>
          </div>

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.formSubmit}
              disabled={pending}
            >
              {pending ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
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
          الاستمرار باستخدام Google
        </a>


        <p className={styles.authFooter}>
          ليس لديك حساب؟{" "}
          <Link href="/register" className={styles.authFooterLink}>
            أنشئ حساباً جديداً
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
            نظّم محتواك
            <br />
            من الفكرة إلى النشر
          </h2>
          <p className={styles.authPanelDesc}>
            سير عمل واضح، تعليقات سياقية، واعتماد نهائي — كل ذلك في منصة واحدة
            أنيقة.
          </p>
        </div>
      </div>
    </div>
  );
}
