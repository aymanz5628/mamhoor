import styles from "./notifications.module.css";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { FileText, Search, Edit3, ClipboardList, CheckCircle, Rocket, Package, MessageSquare, Bell, Folder, RefreshCcw } from "lucide-react";

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "أمس";
  if (days < 30) return `منذ ${days} يوم`;
  return date.toLocaleDateString("ar-SA", { day: "numeric", month: "short" });
}

// تحويل تحول الحالة إلى إشعار
interface AppNotification {
  id: string;
  type: "status" | "comment" | "create" | "system";
  icon: React.ReactNode;
  title: string;
  message: string;
  time: Date;
  projectName: string | null;
  materialId: string | null;
}

const statusIcons: Record<string, React.ReactNode> = {
  DRAFT: <FileText size={20} />,
  IN_REVIEW: <Search size={20} />,
  CHANGES_REQUESTED: <Edit3 size={20} />,
  PENDING_APPROVAL: <ClipboardList size={20} />,
  APPROVED: <CheckCircle size={20} />,
  PUBLISHED: <Rocket size={20} />,
  ARCHIVED: <Package size={20} />,
};

const statusMessages: Record<string, string> = {
  DRAFT: "تم إنشاء مادة جديدة",
  IN_REVIEW: "تم إرسال المادة للمراجعة",
  CHANGES_REQUESTED: "تم طلب تعديلات على المادة",
  PENDING_APPROVAL: "المادة بانتظار الاعتماد",
  APPROVED: "تم اعتماد المادة ✓",
  PUBLISHED: "تم نشر المادة",
  ARCHIVED: "تم أرشفة المادة",
};

const typeColors: Record<string, string> = {
  status: "var(--status-in-review)",
  comment: "var(--gold-dark)",
  create: "var(--status-draft)",
};

export default async function NotificationsPage() {
  const session = await verifySession();

  const projectWhere = {
    OR: [
      { ownerId: session.userId },
      { members: { some: { userId: session.userId } } }
    ]
  };

  // جلب آخر تحولات الحالة من كل مواد المشاريع التي يملكها أو ينتمي إليها
  const transitions = await prisma.stateTransition.findMany({
    where: { material: { project: projectWhere } },
    include: {
      material: {
        select: {
          id: true, title: true,
          project: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  // جلب آخر التعليقات
  const comments = await prisma.comment.findMany({
    where: { material: { project: projectWhere } },
    include: {
      author: { select: { name: true } },
      material: {
        select: {
          id: true, title: true,
          project: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // جلب الإشعارات من النظام المباشر
  const dbNotifications = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // تحويل الأحداث إلى إشعارات موحدة
  const notifications: AppNotification[] = [];

  for (const n of dbNotifications) {
    notifications.push({
      id: `n-${n.id}`,
      type: "system",
      icon: <Bell size={20} />,
      title: n.title,
      message: n.message,
      time: n.createdAt,
      projectName: null,
      materialId: n.link?.replace("/dashboard/content/", "") || null,
    });
  }

  for (const t of transitions) {
    notifications.push({
      id: `t-${t.id}`,
      type: t.fromStatus === null ? "create" : "status",
      icon: statusIcons[t.toStatus] || <RefreshCcw size={20} />,
      title: t.fromStatus === null
        ? `مادة جديدة: "${t.material.title}"`
        : statusMessages[t.toStatus] || "تغيير حالة",
      message: t.fromStatus === null
        ? `تم إنشاء مادة "${t.material.title}" كمسودة`
        : `"${t.material.title}" — ${t.note || statusMessages[t.toStatus] || "تغيير الحالة"}`,
      time: t.createdAt,
      projectName: t.material.project.name,
      materialId: t.material.id,
    });
  }

  for (const c of comments) {
    notifications.push({
      id: `c-${c.id}`,
      type: "comment",
      icon: <MessageSquare size={20} />,
      title: `تعليق جديد على "${c.material.title}"`,
      message: `${c.author.name}: ${c.content.length > 80 ? c.content.substring(0, 80) + "..." : c.content}`,
      time: c.createdAt,
      projectName: c.material.project.name,
      materialId: c.material.id,
    });
  }

  // ترتيب حسب الوقت (الأحدث أولاً)
  notifications.sort((a, b) => b.time.getTime() - a.time.getTime());

  // آخر 24 ساعة = "جديد"
  const recentCutoff = Date.now() - 24 * 60 * 60 * 1000;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            الإشعارات
            {notifications.filter(n => n.time.getTime() > recentCutoff).length > 0 && (
              <span className={styles.unreadBadge}>
                {notifications.filter(n => n.time.getTime() > recentCutoff).length}
              </span>
            )}
          </h1>
          <p className={styles.subtitle}>آخر التحديثات والأنشطة في مساحة عملك — {notifications.length} حدث</p>
        </div>
      </div>

      {/* فلاتر */}
      <div className={styles.filters}>
        <button className={`${styles.filterBtn} ${styles.active}`}>الكل ({notifications.length})</button>
        <button className={styles.filterBtn}>إشعارات النظام ({dbNotifications.length})</button>
        <button className={styles.filterBtn}>تحولات ({transitions.length})</button>
        <button className={styles.filterBtn}>تعليقات ({comments.length})</button>
      </div>

      {notifications.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 20px",
          fontFamily: "var(--font-body)", color: "var(--text-muted)"
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: "16px", color: 'var(--text-muted)' }}><Bell size={48} /></div>
          <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>لا توجد إشعارات بعد</p>
          <p style={{ fontSize: "0.9rem", marginTop: "6px" }}>
            ستظهر هنا عند إنشاء مواد أو تغيير حالاتها أو إضافة تعليقات
          </p>
        </div>
      ) : (
        <div className={styles.notificationsList}>
          {notifications.map((notif) => {
            const isRecent = notif.time.getTime() > recentCutoff;
            return (
              <Link
                key={notif.id}
                href={notif.materialId ? `/dashboard/content/${notif.materialId}` : "#"}
                className={`${styles.notifCard} ${isRecent ? styles.unread : ""}`}
              >
                <div
                  className={styles.notifIcon}
                  style={{ background: (typeColors[notif.type] || "var(--gold)") + "18" }}
                >
                  {notif.icon}
                </div>
                <div className={styles.notifContent}>
                  <div className={styles.notifHeader}>
                    <h3 className={styles.notifTitle}>{notif.title}</h3>
                    <span className={styles.notifTime}>{timeAgo(notif.time)}</span>
                  </div>
                  <p className={styles.notifMessage}>{notif.message}</p>
                  {notif.projectName && (
                    <span className={styles.notifProject} style={{display: 'flex', alignItems: 'center', gap: '4px'}}><Folder size={12} /> {notif.projectName}</span>
                  )}
                </div>
                {isRecent && <div className={styles.unreadDot} />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
