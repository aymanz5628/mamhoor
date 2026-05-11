"use server";

import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// ============================================
// إنشاء مشروع — Create Project
// ============================================

const CreateProjectSchema = z.object({
  name: z.string().min(2, "اسم المشروع يجب أن يكون حرفين على الأقل").max(100),
  description: z.string().max(500).optional(),
});

export async function createProject(prevState: unknown, formData: FormData) {
  const session = await verifySession();

  const rawData = {
    name: (formData.get("name") as string) || "",
    description: (formData.get("description") as string) || "",
  };

  const parsed = CreateProjectSchema.safeParse(rawData);
  if (!parsed.success) {
    const firstError = parsed.error.errors?.[0]?.message;
    return { error: firstError || "بيانات غير صالحة" };
  }

  const project = await prisma.project.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      ownerId: session.userId,
      members: {
        create: {
          userId: session.userId,
          role: "OWNER",
        },
      },
    },
  });

  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard");
  redirect(`/dashboard/projects/${project.id}`);
}
