"use server";

import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// ============================================
// إضافة تعليق — Add Comment
// ============================================

const AddCommentSchema = z.object({
  content: z.string().min(1, "التعليق مطلوب").max(2000),
  materialId: z.string().min(1, "المادة مطلوبة"),
});

export async function addComment(prevState: unknown, formData: FormData) {
  const session = await verifySession();

  const rawData = {
    content: (formData.get("content") as string) || "",
    materialId: (formData.get("materialId") as string) || "",
  };

  const parsed = AddCommentSchema.safeParse(rawData);
  if (!parsed.success) {
    const firstError = parsed.error.errors?.[0]?.message;
    return { error: firstError || "بيانات غير صالحة" };
  }

  // التحقق من وجود المادة وأنها تخص المستخدم
  const material = await prisma.material.findUnique({
    where: { id: parsed.data.materialId },
    include: { project: { select: { ownerId: true, members: { select: { userId: true } } } } },
  });

  if (!material) {
    return { error: "المادة غير موجودة" };
  }

  // التحقق من الصلاحية (المالك أو عضو في المشروع)
  const isOwner = material.project.ownerId === session.userId;
  const isMember = material.project.members.some((m) => m.userId === session.userId);

  if (!isOwner && !isMember) {
    return { error: "ليس لديك صلاحية للتعليق على هذه المادة" };
  }

  await prisma.comment.create({
    data: {
      content: parsed.data.content,
      materialId: parsed.data.materialId,
      authorId: session.userId,
    },
  });

  revalidatePath(`/dashboard/content/${parsed.data.materialId}`);
  revalidatePath("/dashboard/comments");

  return { success: true };
}

// ============================================
// حل تعليق — Resolve Comment
// ============================================

export async function resolveComment(commentId: string) {
  const session = await verifySession();

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { 
      material: { 
        select: { 
          project: { 
            include: { members: { where: { userId: session.userId } } } 
          } 
        } 
      } 
    },
  });

  if (!comment) {
    return { error: "التعليق غير موجود" };
  }

  const isOwner = comment.material.project.ownerId === session.userId;
  const isAuthor = comment.authorId === session.userId;
  const userRole = comment.material.project.members[0]?.role;

  const canResolve = isOwner || isAuthor || ["ADMIN", "PROJECT_MANAGER", "REVIEWER"].includes(userRole as string);

  if (!canResolve) {
    return { error: "غير مصرح لك بحل هذا التعليق" };
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: { status: "RESOLVED" },
  });

  revalidatePath(`/dashboard/content/${comment.materialId}`);
  revalidatePath("/dashboard/comments");

  return { success: true };
}
