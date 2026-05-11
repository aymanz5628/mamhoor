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
