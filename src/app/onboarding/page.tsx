import { getCurrentUser } from "@/lib/dal";
import { redirect } from "next/navigation";
import OnboardingWizard from "./onboarding-wizard";

export const metadata = {
  title: "ممهور — مرحباً بك",
  description: "أعد مساحة عملك في ممهور",
};

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // إذا أكمل المستخدم الـ Onboarding بالفعل → الداشبورد
  if (user.onboardingComplete) {
    redirect("/dashboard");
  }

  return <OnboardingWizard userName={user.name || ""} />;
}
