import styles from "./content.module.css";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import SearchAndFilter from "@/components/search-and-filter";
import { FileText, Image as ImageIcon, Film, Mic, Inbox } from "lucide-react";

const statusLabels: Record<string, string> = {
  DRAFT: "مسودة",
  IN_REVIEW: "قيد المراجعة",
  CHANGES_REQUESTED: "تعديلات مطلوبة",
  PENDING_APPROVAL: "بانتظار الاعتماد",
  APPROVED: "معتمد",
  PUBLISHED: "منشور",
  ARCHIVED: "مؤرشف",
};

const statusColors: Record<string, string> = {
  DRAFT: "var(--status-draft)",
  IN_REVIEW: "var(--status-in-review)",
  CHANGES_REQUESTED: "var(--status-changes)",
  PENDING_APPROVAL: "var(--warning)",
  APPROVED: "var(--status-approved)",
  PUBLISHED: "var(--success)",
  ARCHIVED: "var(--text-muted)",
};

const typeLabels: Record<string, string> = {
  TEXT: "نص",
  IMAGE: "صورة",
  VIDEO: "فيديو",
  AUDIO: "صوت",
};

const typeIcons: Record<string, React.ReactNode> = {
  TEXT: <FileText size={20} />,
  IMAGE: <ImageIcon size={20} />,
  VIDEO: <Film size={20} />,
  AUDIO: <Mic size={20} />,
};

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) {
    return `اليوم، ${date.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (days === 1) return "أمس";
  return date.toLocaleDateString("ar-SA", { day: "numeric", month: "long", year: "numeric" });
}

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const session = await verifySession();
  const { q, status } = await searchParams;

  const projectWhere = {
    OR: [
      { ownerId: session.userId },
      { members: { some: { userId: session.userId } } }
    ]
  };

  const whereClause: any = {
    project: projectWhere,
  };

  if (q) {
    whereClause.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { project: { name: { contains: q } } },
    ];
  }

  if (status && status !== "ALL") {
    whereClause.status = status;
  }

  const materials = await prisma.material.findMany({
    where: whereClause,
    include: {
      project: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  // إحصائيات الفلاتر
  const total = materials.length;
  const inReview = materials.filter((m: any) => m.status === "IN_REVIEW").length;
  const changesReq = materials.filter((m: any) => m.status === "CHANGES_REQUESTED").length;
  const pending = materials.filter((m: any) => m.status === "PENDING_APPROVAL").length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>جميع المواد</h1>
          <p className={styles.subtitle}>تصفح وإدارة كافة المواد عبر مشاريعك</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/dashboard/content/new" className="btn btn--primary">+ رفع مادة جديدة</Link>
        </div>
      </div>

      <SearchAndFilter 
        placeholder="ابحث عن مادة باسمها، وصفها، أو اسم المشروع..."
        statuses={[
          { value: "DRAFT", label: "مسودة" },
          { value: "IN_REVIEW", label: `قيد المراجعة${inReview > 0 ? ` (${inReview})` : ""}` },
          { value: "CHANGES_REQUESTED", label: `تحتاج تعديل${changesReq > 0 ? ` (${changesReq})` : ""}` },
          { value: "PENDING_APPROVAL", label: `بانتظار الاعتماد${pending > 0 ? ` (${pending})` : ""}` },
          { value: "APPROVED", label: "معتمد" },
          { value: "PUBLISHED", label: "منشور" },
        ]}
      />

      <div className={styles.tableCard}>
        {materials.length === 0 ? (
          <div style={{ padding: "var(--space-8)", textAlign: "center" }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: "var(--space-4)", color: 'var(--text-muted)' }}><Inbox size={48} /></div>
            <h3 style={{ fontFamily: "var(--font-heading)", color: "var(--indigo)", marginBottom: "var(--space-2)" }}>لا توجد مواد بعد</h3>
            <p style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)", marginBottom: "var(--space-4)" }}>ابدأ برفع أول مادة في أحد مشاريعك</p>
            <Link href="/dashboard/content/new" className="btn btn--primary">+ رفع مادة جديدة</Link>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>المادة</th>
                  <th>المشروع</th>
                  <th>النوع</th>
                  <th>الإصدار</th>
                  <th>الحالة</th>
                  <th>تاريخ التحديث</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((mat: any) => (
                  <tr key={mat.id}>
                    <td>
                      <div className={styles.materialName}>
                        <div className={styles.materialIcon}>{typeIcons[mat.type] || <FileText size={20} />}</div>
                        <div>
                          <div className={styles.name}>{mat.title}</div>
                          <div className={styles.desc}>{mat.description || ""}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={styles.projectName}>{mat.project.name}</span></td>
                    <td><span className={styles.typeBadge}>{typeLabels[mat.type] || mat.type}</span></td>
                    <td>v{mat.version}</td>
                    <td>
                      <span className={styles.statusBadge} style={{ background: statusColors[mat.status], color: "white" }}>
                        {statusLabels[mat.status] || mat.status}
                      </span>
                    </td>
                    <td><span className={styles.date}>{formatDate(mat.updatedAt)}</span></td>
                    <td>
                      <Link href={`/dashboard/content/${mat.id}`} className={styles.actionBtn}>عرض</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
