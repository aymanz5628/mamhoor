import styles from "../dashboard.module.css";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { FileText, Hourglass, CheckCircle, Users } from "lucide-react";

export default async function DashboardPage() {
  const session = await verifySession();

  const projectWhere = {
    OR: [
      { ownerId: session.userId },
      { members: { some: { userId: session.userId } } }
    ]
  };

  // إحصائيات حقيقية من قاعدة البيانات
  const [totalMaterials, inReview, approved, teamMembers, recentMaterials, projects] = await Promise.all([
    prisma.material.count({
      where: { project: projectWhere },
    }),
    prisma.material.count({
      where: { status: "IN_REVIEW", project: projectWhere },
    }),
    prisma.material.count({
      where: { status: "APPROVED", project: projectWhere },
    }),
    prisma.projectMember.count({
      where: { project: projectWhere },
    }),
    // آخر 5 تحولات في الحالات
    prisma.stateTransition.findMany({
      where: { material: { project: projectWhere } },
      include: { material: { include: { project: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // إجمالي المشاريع لحساب الأعضاء
    prisma.project.count({ where: projectWhere }),
  ]);

  // حساب التوزيع بالحالات
  const statusCounts = await prisma.material.groupBy({
    by: ["status"],
    where: { project: projectWhere },
    _count: true,
  });

  const statusMap: Record<string, number> = {};
  statusCounts.forEach((s: any) => {
    statusMap[s.status] = s._count;
  });

  // ترجمة الحالات
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
    PENDING_APPROVAL: "var(--status-pending, var(--warning))",
    APPROVED: "var(--status-approved)",
    PUBLISHED: "var(--status-published, var(--success))",
    ARCHIVED: "var(--text-muted)",
  };

  const transitionLabels: Record<string, string> = {
    DRAFT: "مسودة",
    IN_REVIEW: "قيد المراجعة",
    CHANGES_REQUESTED: "تعديلات مطلوبة",
    PENDING_APPROVAL: "بانتظار الاعتماد",
    APPROVED: "معتمد",
    PUBLISHED: "منشور",
    ARCHIVED: "مؤرشف",
  };

  function timeAgo(date: Date): string {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "الآن";
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} يوم`;
  }

  // عندما لا توجد بيانات — عرض حالة فارغة
  const isEmpty = totalMaterials === 0 && projects === 0;

  return (
    <>
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>إجمالي المواد</span>
            <span className={styles.statIcon} style={{display: 'flex', alignItems: 'center'}}><FileText size={20} /></span>
          </div>
          <div className={styles.statValue}>{totalMaterials}</div>
          <div className={`${styles.statChange} ${styles.statUp}`}>
            {projects} مشروع نشط
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>قيد المراجعة</span>
            <span className={styles.statIcon} style={{display: 'flex', alignItems: 'center'}}><Hourglass size={20} /></span>
          </div>
          <div className={styles.statValue}>{inReview}</div>
          <div className={`${styles.statChange}`}>
            {totalMaterials > 0 ? `${Math.round((inReview / totalMaterials) * 100)}%` : "0%"} من الإجمالي
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>معتمد</span>
            <span className={styles.statIcon} style={{display: 'flex', alignItems: 'center'}}><CheckCircle size={20} /></span>
          </div>
          <div className={styles.statValue}>{approved}</div>
          <div className={`${styles.statChange} ${styles.statUp}`}>
            {totalMaterials > 0 ? `${Math.round((approved / totalMaterials) * 100)}%` : "0%"} نسبة الاعتماد
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>أعضاء الفريق</span>
            <span className={styles.statIcon} style={{display: 'flex', alignItems: 'center'}}><Users size={20} /></span>
          </div>
          <div className={styles.statValue}>{teamMembers}</div>
          <div className={`${styles.statChange}`}>
            أعضاء في مشاريعك
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {/* Activity Feed */}
        <div className={styles.dashCard}>
          <h2 className={styles.sectionCardTitle}>آخر النشاطات</h2>
          <div className={styles.activityList}>
            {recentMaterials.length === 0 && (
              <div className={styles.activityItem}>
                <div className={styles.activityDot} style={{ background: "var(--text-muted)" }} />
                <div className={styles.activityBody}>
                  <p className={styles.activityText}>لا توجد نشاطات بعد. ابدأ بإنشاء مشروع ورفع مادة!</p>
                </div>
              </div>
            )}
            {recentMaterials.map((t: any) => (
              <div key={t.id} className={styles.activityItem}>
                <div className={styles.activityDot} style={{ background: statusColors[t.toStatus] || "var(--text-muted)" }} />
                <div className={styles.activityBody}>
                  <p className={styles.activityText}>
                    <span className={styles.activityUser}>{t.material.title}</span>{" "}
                    انتقلت إلى {transitionLabels[t.toStatus] || t.toStatus}
                    {t.note && ` — ${t.note}`}
                  </p>
                  <span className={styles.activityTime}>{timeAgo(t.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div className={styles.dashCard}>
          <h2 className={styles.sectionCardTitle}>توزيع الحالات</h2>
          <div className={styles.activityList}>
            {Object.entries(statusLabels).map(([key, label]) => {
              const count = statusMap[key] || 0;
              if (isEmpty && count === 0) return null;
              return (
                <div key={key} className={styles.activityItem}>
                  <div className={styles.activityDot} style={{ background: statusColors[key] }} />
                  <div className={styles.activityBody}>
                    <p className={styles.activityText}>
                      <span className={styles.activityUser}>{label}</span>
                    </p>
                    <span className={styles.activityTime}>{count} {count === 1 ? "مادة" : count === 2 ? "مادتان" : "مواد"}</span>
                  </div>
                </div>
              );
            })}
            {isEmpty && (
              <div className={styles.activityItem}>
                <div className={styles.activityDot} style={{ background: "var(--text-muted)" }} />
                <div className={styles.activityBody}>
                  <p className={styles.activityText}>لا توجد مواد بعد</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
