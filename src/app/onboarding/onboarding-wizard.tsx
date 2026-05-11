"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "@/app/actions/onboarding";
import styles from "./onboarding.module.css";

const STEPS = [
  { icon: "🎉", title: "مرحباً بك في ممهور!", desc: "دعنا نجهز مساحة عملك في بضع خطوات بسيطة." },
  { icon: "📁", title: "أنشئ مشروعك الأول", desc: "المشروع هو مساحة تجمع فيها كل المواد المتعلقة بحملة أو منتج أو فكرة." },
  { icon: "🚀", title: "كل شيء جاهز!", desc: "مساحة عملك جاهزة. يمكنك البدء بإنشاء المواد ودعوة فريقك." },
];

export default function OnboardingWizard({ userName }: { userName: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const handleNext = async () => {
    if (step === 0) {
      setStep(1);
      return;
    }

    if (step === 1) {
      if (!projectName.trim() || projectName.trim().length < 2) {
        setError("يرجى إدخال اسم المشروع (حرفين على الأقل)");
        return;
      }
      setError("");
      setPending(true);

      const formData = new FormData();
      formData.set("projectName", projectName);
      formData.set("projectDesc", projectDesc);

      const result = await completeOnboarding(formData);
      if (result?.error) {
        setError(result.error);
        setPending(false);
        return;
      }

      // completeOnboarding يعمل redirect تلقائياً
      // إذا وصلنا هنا يعني نجح
      setPending(false);
      setStep(2);
      return;
    }

    if (step === 2) {
      router.push("/dashboard");
    }
  };

  const firstName = userName?.split(" ")[0] || "صديق";

  return (
    <div className={styles.onboardingPage}>
      {/* Background */}
      <div className={styles.onboardingBg}>
        <div className={`${styles.bgOrb} ${styles.bgOrb1}`} />
        <div className={`${styles.bgOrb} ${styles.bgOrb2}`} />
      </div>

      <div className={styles.onboardingCard}>
        {/* Progress */}
        <div className={styles.progress}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`${styles.progressBar} ${
                i < step ? styles.progressBarDone : i === step ? styles.progressBarActive : ""
              }`}
            />
          ))}
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <>
            <div className={styles.stepIcon}>{STEPS[0].icon}</div>
            <h1 className={styles.stepTitle}>
              أهلاً {firstName}! 👋
            </h1>
            <p className={styles.stepDesc}>{STEPS[0].desc}</p>

            <div className={styles.actions}>
              <button className={styles.btnPrimary} onClick={handleNext}>
                هيا نبدأ ←
              </button>
            </div>
          </>
        )}

        {/* Step 1: Create Project */}
        {step === 1 && (
          <>
            <div className={styles.stepIcon}>{STEPS[1].icon}</div>
            <h1 className={styles.stepTitle}>{STEPS[1].title}</h1>
            <p className={styles.stepDesc}>{STEPS[1].desc}</p>

            {error && <div className={styles.errorMsg}>{error}</div>}

            <div className={styles.formGroup}>
              <label htmlFor="projectName" className={styles.formLabel}>
                اسم المشروع
              </label>
              <input
                type="text"
                id="projectName"
                className={styles.formInput}
                placeholder="مثال: حملة التسويق الرقمي"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                autoFocus
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="projectDesc" className={styles.formLabel}>
                وصف المشروع{" "}
                <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                  (اختياري)
                </span>
              </label>
              <textarea
                id="projectDesc"
                className={`${styles.formInput} ${styles.formTextarea}`}
                placeholder="وصف مختصر عن هذا المشروع..."
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
              />
            </div>

            <div className={styles.actions}>
              <button
                className={styles.btnPrimary}
                onClick={handleNext}
                disabled={pending}
              >
                {pending ? "جاري الإنشاء..." : "أنشئ المشروع ←"}
              </button>
            </div>
          </>
        )}

        {/* Step 2: Done */}
        {step === 2 && (
          <>
            <div className={styles.successIcon}>✅</div>
            <h1 className={styles.successTitle}>كل شيء جاهز!</h1>
            <p className={styles.successDesc}>
              تم إنشاء مشروعك &quot;{projectName}&quot; بنجاح.
              <br />
              يمكنك الآن البدء برفع المواد ودعوة فريقك.
            </p>

            <div className={styles.actions}>
              <button className={styles.btnPrimary} onClick={handleNext}>
                انطلق إلى لوحة التحكم 🚀
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
