"use server";

import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createNotification(userId: string, title: string, message: string, type: "INFO" | "WARNING" | "SUCCESS" | "ERROR", link?: string) {
  await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      link,
    },
  });
}

export async function markNotificationAsRead(notificationId: string) {
  const session = await verifySession();
  
  await prisma.notification.update({
    where: { id: notificationId, userId: session.userId },
    data: { read: true },
  });
  
  revalidatePath("/dashboard");
}

export async function markAllNotificationsAsRead() {
  const session = await verifySession();
  
  await prisma.notification.updateMany({
    where: { userId: session.userId, read: false },
    data: { read: true },
  });
  
  revalidatePath("/dashboard");
}
