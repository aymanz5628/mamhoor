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
