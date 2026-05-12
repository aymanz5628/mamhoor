import styles from "../dashboard.module.css";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { FileText, Hourglass, CheckCircle, Users } from "lucide-react";
import { StatusPieChart, ActivityBarChart } from "./dashboard-charts";
import { format, subDays } from "date-fns";

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

  // ترجمة الحالات والألوان للرسم البياني
  const statusLabels: Record<string, string> = {
    DRAFT: "مسودة",
    IN_REVIEW: "قيد المراجعة",
    CHANGES_REQUESTED: "تعديلات مطلوبة",
    PENDING_APPROVAL: "بانتظار الاعتماد",
    APPROVED: "معتمد",
    PUBLISHED: "منشور",
    ARCHIVED: "مؤرشف",
  };

  // استخدمنا ألوان Hex بدلاً من متغيرات CSS لأن Recharts يتطلبها للـ Tooltip والـ Cell أحياناً
  // ولكن يمكننا استخدام متغيرات CSS إذا تعاملنا معها بحذر، سنستخدم ألوان واضحة
  const pieColors: Record<string, string> = {
    DRAFT: "#94a3b8", // slate-400
    IN_REVIEW: "#3b82f6", // blue-500
    CHANGES_REQUESTED: "#f59e0b", // amber-500
    PENDING_APPROVAL: "#eab308", // yellow-500
    APPROVED: "#10b981", // emerald-500
    PUBLISHED: "#059669", // emerald-600
    ARCHIVED: "#64748b", // slate-500
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

  const statusData = Object.keys(statusLabels).map(key => ({
    name: statusLabels[key],
    value: statusMap[key] || 0,
    color: pieColors[key]
  }));

  // حساب نشاطات آخر 7 أيام
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    return {
      date: format(d, 'MM/dd'),
      startOfDay: new Date(d.setHours(0, 0, 0, 0)),
      endOfDay: new Date(d.setHours(23, 59, 59, 999))
    };
  });

  const recentTransitions = await prisma.stateTransition.findMany({
    where: { 
      material: { project: projectWhere },
      createdAt: { gte: last7Days[0].startOfDay }
    },
    select: { createdAt: true }
  });

  const activityData = last7Days.map(day => {
    const count = recentTransitions.filter(t => 
      t.createdAt >= day.startOfDay && t.createdAt <= day.endOfDay
    ).length;
    return {
      date: day.date,
      count
    };
  });

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
        {/* Status Distribution Chart */}
        <div className={styles.dashCard}>
          <h2 className={styles.sectionCardTitle}>توزيع حالات المواد</h2>
          <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            <StatusPieChart statusData={statusData} />
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {statusData.filter(d => d.value > 0).map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: d.color }}></span>
                  {d.name} ({d.value})
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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

          {/* Activity Bar Chart */}
          <div className={styles.dashCard}>
            <h2 className={styles.sectionCardTitle}>معدل الإنجاز والتحديثات (آخر 7 أيام)</h2>
            <ActivityBarChart activityData={activityData} />
          </div>
        </div>
      </div>
    </>
  );
}
