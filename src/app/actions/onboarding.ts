"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { redirect } from "next/navigation";

export async function completeOnboarding(formData: FormData) {
  const session = await verifySession();

  const projectName = formData.get("projectName") as string;
  const projectDesc = formData.get("projectDesc") as string;

  if (!projectName || projectName.trim().length < 2) {
    return { error: "يرجى إدخال اسم المشروع (حرفين على الأقل)" };
  }

  // إنشاء المشروع الأول
  await prisma.project.create({
    data: {
      name: projectName.trim(),
      description: projectDesc?.trim() || null,
      ownerId: session.userId,
      members: {
        create: {
          userId: session.userId,
          role: "OWNER",
        },
      },
    },
  });

  // تحديث حالة الـ Onboarding
  await prisma.user.update({
    where: { id: session.userId },
    data: { onboardingComplete: true },
  });

  redirect("/dashboard");
}
