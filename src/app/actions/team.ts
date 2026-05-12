"use server";

import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Role } from "@prisma/client";
import { sendInviteEmail } from "@/lib/email";

const InviteMemberSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  projectId: z.string().min(1, "المشروع مطلوب"),
  role: z.enum(["ADMIN", "PROJECT_MANAGER", "CREATOR", "REVIEWER", "APPROVER"]),
});

export async function inviteMember(prevState: any, formData: FormData) {
  const session = await verifySession();

  const rawData = {
    email: formData.get("email"),
    projectId: formData.get("projectId"),
    role: formData.get("role"),
  };

  const parsed = InviteMemberSchema.safeParse(rawData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "بيانات غير صالحة" };
  }

  const { email, projectId, role } = parsed.data;

  // 1. Verify that the current user owns the project or is an ADMIN
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: { where: { userId: session.userId } },
    },
  });

  if (!project) {
    return { error: "المشروع غير موجود" };
  }

  const isOwner = project.ownerId === session.userId;
  const isProjectAdmin = project.members.some((m: any) => m.role === "ADMIN");

  if (!isOwner && !isProjectAdmin) {
    return { error: "ليس لديك صلاحية لإضافة أعضاء لهذا المشروع" };
  }

  // 2. Find the user to invite
  const targetUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!targetUser) {
    return { error: "لم يتم العثور على مستخدم بهذا البريد الإلكتروني. يرجى تسجيله في المنصة أولاً." };
  }

  // 3. Prevent self-invite or duplicate invites
  if (targetUser.id === session.userId) {
    return { error: "لا يمكنك دعوة نفسك" };
  }

  if (targetUser.id === project.ownerId) {
    return { error: "هذا المستخدم هو مالك المشروع بالفعل" };
  }

  // 4. Upsert ProjectMember (if they already exist, update their role)
  await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId,
        userId: targetUser.id,
      },
    },
    update: {
      role: role as Role,
    },
    create: {
      projectId,
      userId: targetUser.id,
      role: role as Role,
    },
  });

  // 5. Create an in-app notification for the invited user
  await prisma.notification.create({
    data: {
      userId: targetUser.id,
      title: "دعوة انضمام لمشروع",
      message: `تمت إضافتك إلى مشروع "${project.name}" بصلاحية ${role}.`,
      link: `/dashboard/projects/${project.id}`,
      type: "SUCCESS",
    },
  });

  // 6. Send an actual email to the user
  const inviter = await prisma.user.findUnique({ where: { id: session.userId } });
  await sendInviteEmail(
    targetUser.email,
    project.name,
    inviter?.name || "زميلك",
    role
  );

  revalidatePath("/dashboard/team");
  revalidatePath(`/dashboard/projects/${projectId}`);

  return { success: true };
}
