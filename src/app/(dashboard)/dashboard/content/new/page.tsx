import NewContentForm from "./new-content-form";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export default async function NewContentPage() {
  const session = await verifySession();

  const projects = await prisma.project.findMany({
    where: { ownerId: session.userId },
    select: { id: true, name: true },
    orderBy: { updatedAt: "desc" },
  });

  return <NewContentForm projects={projects} />;
}
