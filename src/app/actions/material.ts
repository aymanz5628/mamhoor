"use server";

import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import { Role } from "@prisma/client";

const CreateMaterialSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب").max(200),
  description: z.string().max(500).optional(),
  type: z.enum(["TEXT", "IMAGE", "VIDEO", "AUDIO"]),
  projectId: z.string().min(1, "المشروع مطلوب"),
  content: z.string().optional(),
  dueDate: z.string().optional(),
});

export async function createMaterial(prevState: unknown, formData: FormData) {
  const session = await verifySession();

  const rawData = {
    title: (formData.get("title") as string) || "",
    description: (formData.get("description") as string) || "",
    type: (formData.get("type") as string) || "",
    projectId: (formData.get("projectId") as string) || "",
    content: (formData.get("content") as string) || "",
    dueDate: formData.get("dueDate") as string || undefined,
  };

  const parsed = CreateMaterialSchema.safeParse(rawData);
  if (!parsed.success) {
    const firstError = parsed.error.issues?.[0]?.message;
    return { error: firstError || "بيانات غير صالحة" };
  }

  const project = await prisma.project.findUnique({
    where: { id: parsed.data.projectId },
    include: { members: { where: { userId: session.userId } } },
  });

  if (!project) {
    return { error: "المشروع غير موجود" };
  }

  const isOwner = project.ownerId === session.userId;
  const userRole = project.members[0]?.role;

  // CREATOR and above can create materials
  const canCreate = isOwner || ["ADMIN", "PROJECT_MANAGER", "CREATOR"].includes(userRole as string);

  if (!canCreate) {
    return { error: "ليس لديك صلاحية لإنشاء مادة في هذا المشروع" };
  }

  // معالجة الملف إذا وجد
  const file = formData.get("file") as File | null;
  let fileUrl = null;

  if (file && file.size > 0) {
    const uploadsDir = path.join(process.cwd(), "public/uploads");
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filepath = path.join(uploadsDir, filename);
    
    await fs.writeFile(filepath, buffer);
    fileUrl = `/uploads/${filename}`;
  }

  // إنشاء المادة
  const material = await prisma.material.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      type: parsed.data.type as "TEXT" | "IMAGE" | "VIDEO" | "AUDIO",
      content: parsed.data.content || null,
      fileUrl: fileUrl,
      projectId: parsed.data.projectId,
      creatorId: session.userId,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    },
  });

  // إنشاء أول تحول في سجل الحالات
  await prisma.stateTransition.create({
    data: {
      materialId: material.id,
      fromStatus: null,
      toStatus: "DRAFT",
      userId: session.userId,
      note: "تم إنشاء المادة",
    },
  });

  redirect(`/dashboard/content/${material.id}`);
}

// ============================================
// تغيير حالة المادة — Update Material Status
// ============================================

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["IN_REVIEW"],
  IN_REVIEW: ["CHANGES_REQUESTED", "PENDING_APPROVAL"],
  CHANGES_REQUESTED: ["IN_REVIEW"],
  PENDING_APPROVAL: ["APPROVED", "CHANGES_REQUESTED"],
  APPROVED: ["PUBLISHED", "ARCHIVED"],
  PUBLISHED: ["ARCHIVED"],
};

const transitionNotes: Record<string, string> = {
  IN_REVIEW: "تم إرسال المادة للمراجعة",
  CHANGES_REQUESTED: "تم طلب تعديلات",
  PENDING_APPROVAL: "تم إرسال المادة للاعتماد",
  APPROVED: "تم اعتماد المادة ✓",
  PUBLISHED: "تم نشر المادة",
  ARCHIVED: "تم أرشفة المادة",
};

export async function updateMaterialStatus(materialId: string, newStatus: string, note?: string) {
  const session = await verifySession();

  const material = await prisma.material.findUnique({
    where: { id: materialId },
    include: { 
      project: { 
        include: { members: { where: { userId: session.userId } } } 
      } 
    },
  });

  if (!material) {
    return { error: "المادة غير موجودة" };
  }

  const isOwner = material.project.ownerId === session.userId;
  const userRole = material.project.members[0]?.role;

  // التحقق من صحة التحول (State Machine)
  const allowedStatuses = VALID_TRANSITIONS[material.status];
  if (!allowedStatuses || !allowedStatuses.includes(newStatus)) {
    return { error: `لا يمكن الانتقال من "${material.status}" إلى "${newStatus}"` };
  }

  // RBAC: من يحق له عمل هذا التحول؟
  let canTransition = isOwner || ["ADMIN", "PROJECT_MANAGER"].includes(userRole as string);

  if (!canTransition) {
    if (newStatus === "IN_REVIEW" && (userRole === "CREATOR" || material.creatorId === session.userId)) {
      // المنشئ يمكنه إرسال المادة للمراجعة
      canTransition = true;
    } else if ((newStatus === "CHANGES_REQUESTED" || newStatus === "PENDING_APPROVAL") && userRole === "REVIEWER") {
      // المراجع يمكنه طلب تعديلات أو إرسال للاعتماد
      canTransition = true;
    } else if ((newStatus === "APPROVED" || newStatus === "CHANGES_REQUESTED") && userRole === "APPROVER") {
      // المعتمد يمكنه الاعتماد أو طلب تعديلات
      canTransition = true;
    }
  }

  if (!canTransition) {
    return { error: "ليس لديك صلاحية لتغيير حالة المادة إلى هذه الحالة" };
  }

  // تحديث الحالة
  await prisma.material.update({
    where: { id: materialId },
    data: { status: newStatus as any },
  });

  // تسجيل التحول
  await prisma.stateTransition.create({
    data: {
      materialId,
      fromStatus: material.status,
      toStatus: newStatus as any,
      userId: session.userId,
      note: note || transitionNotes[newStatus] || "تغيير الحالة",
    },
  });

  // إرسال إشعارات
  const projectMembers = await prisma.projectMember.findMany({
    where: { projectId: material.projectId }
  });

  const notifyUsers = (roles: string[], message: string, type: "INFO"| "WARNING" | "SUCCESS" = "INFO") => {
    const targetUsers = projectMembers.filter((m: any) => roles.includes(m.role));
    const allTargets = [...targetUsers.map((m: any) => m.userId), material.project.ownerId];
    const uniqueTargets = Array.from(new Set(allTargets)).filter(id => id !== session.userId);

    const notifications = uniqueTargets.map(userId => ({
      userId,
      title: `تحديث في مادة: ${material.title}`,
      message,
      type,
      link: `/dashboard/content/${materialId}`
    }));

    if (notifications.length > 0) {
      prisma.notification.createMany({ data: notifications }).catch(console.error);
    }
  };

  if (newStatus === "IN_REVIEW") {
    notifyUsers(["REVIEWER", "PROJECT_MANAGER"], "تم إرسال المادة للمراجعة، يرجى مراجعتها.");
  } else if (newStatus === "CHANGES_REQUESTED") {
    if (material.creatorId !== session.userId) {
      prisma.notification.create({
        data: {
          userId: material.creatorId,
          title: `تعديلات مطلوبة: ${material.title}`,
          message: "تم طلب تعديلات على المادة الخاصة بك.",
          type: "WARNING",
          link: `/dashboard/content/${materialId}`
        }
      }).catch(console.error);
    }
  } else if (newStatus === "PENDING_APPROVAL") {
    notifyUsers(["APPROVER", "PROJECT_MANAGER"], "المادة بانتظار الاعتماد النهائي.");
  } else if (newStatus === "APPROVED") {
    notifyUsers(["CREATOR", "PROJECT_MANAGER"], "تم اعتماد المادة بنجاح!", "SUCCESS");
  }

  revalidatePath(`/dashboard/content/${materialId}`);
  revalidatePath("/dashboard/content");
  revalidatePath("/dashboard/kanban");
  revalidatePath("/dashboard");

  return { success: true };
}
