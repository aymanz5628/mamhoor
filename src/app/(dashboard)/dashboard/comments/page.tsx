import styles from "./comments.module.css";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { FileText, Image as ImageIcon, Film, Mic, MessageSquare } from "lucide-react";

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `منذ ${days} يوم`;
  return date.toLocaleDateString("ar-SA", { day: "numeric", month: "short" });
}

const typeIcons: Record<string, React.ReactNode> = { TEXT: <FileText size={16} />, IMAGE: <ImageIcon size={16} />, VIDEO: <Film size={16} />, AUDIO: <Mic size={16} /> };

export default async function CommentsPage() {
  const session = await verifySession();

  // جلب التعليقات الخاصة بمواد المستخدم
  const comments = await prisma.comment.findMany({
    where: {
      material: { project: { ownerId: session.userId } },
    },
    include: {
      author: { select: { name: true } },
      material: {
        select: { id: true, title: true, type: true, project: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const unresolvedCount = comments.filter((c) => c.status === "UNRESOLVED").length;
  const resolvedCount = comments.filter((c) => c.status === "RESOLVED").length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>التعليقات</h1>
          <p className={styles.subtitle}>
            {comments.length} تعليق — {unresolvedCount} لم يُحل · {resolvedCount} محلول
          </p>
        </div>
      </div>

      {comments.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 20px",
          fontFamily: "var(--font-body)", color: "var(--text-muted)"
        }}>
          <div style={{ marginBottom: "16px", display: 'flex', justifyContent: 'center' }}><MessageSquare size={48} /></div>
          <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>لا توجد تعليقات بعد</p>
          <p style={{ fontSize: "0.9rem", marginTop: "6px" }}>
            ستظهر التعليقات هنا عند إضافتها على المواد
          </p>
        </div>
      ) : (
        <div className={styles.layout}>
          {/* قائمة التعليقات */}
          <div className={styles.threadsList}>
            <div className={styles.threadItems}>
              {comments.map((comment) => (
                <Link
                  key={comment.id}
                  href={`/dashboard/content/${comment.material.id}`}
                  className={`${styles.threadItem} ${comment.status === "RESOLVED" ? styles.resolvedThread : ""}`}
                  style={comment.status === "RESOLVED" ? { opacity: 0.6 } : undefined}
                >
                  <div className={styles.threadUser}>
                    <div className={styles.avatar} style={{
                      background: comment.status === "RESOLVED" ? "var(--success)" : "var(--gold)",
                      color: "white"
                    }}>
                      {comment.author.name?.charAt(0) || "?"}
                    </div>
                    <div className={styles.userInfo}>
                      <div className={styles.userName}>{comment.author.name}</div>
                      <div className={styles.time}>{timeAgo(comment.createdAt)}</div>
                    </div>
                  </div>
                  <div className={styles.threadMeta}>
                    <span className={styles.materialName}>
                      {typeIcons[comment.material.type] || <FileText size={16} />} {comment.material.title}
                    </span>
                    <span
                      className={styles.statusBadge}
                      style={comment.status === "RESOLVED"
                        ? { background: "var(--success-bg)", color: "var(--success)" }
                        : undefined
                      }
                    >
                      {comment.status === "RESOLVED" ? "محلول" : "لم يحل"}
                    </span>
                  </div>
                  <p className={styles.threadText}>{comment.content}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* ملاحظة جانبية */}
          <div className={styles.threadDetails}>
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", padding: "40px",
              fontFamily: "var(--font-body)", color: "var(--text-muted)", textAlign: "center"
            }}>
              <div style={{ marginBottom: "16px", display: 'flex', justifyContent: 'center' }}><MessageSquare size={40} /></div>
              <p style={{ fontWeight: 600 }}>اضغط على أي تعليق للانتقال لصفحة المادة</p>
              <p style={{ fontSize: "0.85rem", marginTop: "8px" }}>
                يمكنك إضافة تعليقات جديدة من صفحة تفاصيل المادة
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
