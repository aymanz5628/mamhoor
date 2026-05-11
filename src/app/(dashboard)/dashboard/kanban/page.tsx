import styles from "./kanban.module.css";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import KanbanBoard from "./kanban-board";

export default async function KanbanPage() {
  const session = await verifySession();

  const projectWhere = {
    OR: [
      { ownerId: session.userId },
      { members: { some: { userId: session.userId } } }
    ]
  };

  // جلب كل المشاريع مع موادها
  const projects = await prisma.project.findMany({
    where: projectWhere,
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });

  // جلب كل المواد (لكل المشاريع)
  const materials = await prisma.material.findMany({
    where: { project: projectWhere },
    include: {
      project: { select: { name: true } },
      creator: { select: { name: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>لوحة كانبان</h1>
          <p className={styles.subtitle}>تتبع حالة المواد عبر دورة حياة الاعتماد — {materials.length} مادة</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/dashboard/content/new" className="btn btn--primary">مادة جديدة</Link>
        </div>
      </div>

      <KanbanBoard initialMaterials={materials} />
    </div>
  );
}
