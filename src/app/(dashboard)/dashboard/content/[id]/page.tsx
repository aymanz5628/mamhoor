import styles from "./material-detail.module.css";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AddCommentForm, ResolveCommentButton, StatusActions } from "./material-actions";
import { getDeadlineColor, formatRemainingTime } from "@/lib/deadline";
import { FileText, Image as ImageIcon, Film, Mic, Folder, Paperclip, Download, MessageSquare, History, Info, Package, GitCommit, User, Calendar, Clock } from "lucide-react";

const statusLabels: Record<string, string> = {
  DRAFT: "مسودة", IN_REVIEW: "قيد المراجعة", CHANGES_REQUESTED: "تعديلات مطلوبة",
  PENDING_APPROVAL: "بانتظار الاعتماد", APPROVED: "معتمد", PUBLISHED: "منشور", ARCHIVED: "مؤرشف",
};

const statusColors: Record<string, string> = {
  DRAFT: "var(--status-draft)", IN_REVIEW: "var(--status-in-review)", CHANGES_REQUESTED: "var(--status-changes)",
  PENDING_APPROVAL: "var(--warning)", APPROVED: "var(--status-approved)", PUBLISHED: "var(--success)", ARCHIVED: "var(--text-muted)",
};

const typeLabels: Record<string, string> = { TEXT: "نص", IMAGE: "صورة", VIDEO: "فيديو", AUDIO: "صوت" };
const typeIcons: Record<string, React.ReactNode> = { TEXT: <FileText size={24} />, IMAGE: <ImageIcon size={24} />, VIDEO: <Film size={24} />, AUDIO: <Mic size={24} /> };

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

function formatDate(date: Date): string {
  return date.toLocaleDateString("ar-SA", { day: "numeric", month: "long", year: "numeric" });
}

export default async function MaterialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await verifySession();

  const material = await prisma.material.findUnique({
    where: { id },
    include: {
      project: { 
        select: { 
          id: true, 
          name: true, 
          ownerId: true,
          members: { where: { userId: session.userId }, select: { role: true } }
        } 
      },
      creator: { select: { name: true } },
      comments: {
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
      transitions: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  // Fetch user role based on RBAC
  // But wait, the previous code rejected access if not owner: `material.project.ownerId !== session.userId`. 
  // Let's fix that too! A project member should be able to view the material.
  const isOwner = material.project.ownerId === session.userId;
  const member = material.project.members[0];
  const isCreator = material.creatorId === session.userId;
  const userRole = isOwner ? "OWNER" : (member?.role || "GUEST");

  if (!isOwner && !member) {
    notFound(); // Not a member of the project
  }

  const unresolvedComments = material.comments.filter(c => c.status === "UNRESOLVED").length;

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/dashboard/content" className={styles.breadcrumbLink}>المواد</Link>
        <span className={styles.breadcrumbSep}>←</span>
        <span className={styles.breadcrumbCurrent}>{material.title}</span>
      </div>

      {/* بطاقة المادة */}
      <div className={styles.materialCard}>
        <div className={styles.materialTop}>
          <div className={styles.materialIconLarge}>{typeIcons[material.type] || <FileText size={24} />}</div>
          <div className={styles.materialInfo}>
            <div className={styles.titleRow}>
              <h1 className={styles.materialTitle}>{material.title}</h1>
              <span className={styles.statusBadge} style={{ background: (statusColors[material.status] || "var(--text-muted)") + "22", color: statusColors[material.status] }}>
                {statusLabels[material.status] || material.status}
              </span>
            </div>
            <p className={styles.materialDesc}>{material.description || "لا يوجد وصف"}</p>
            <div className={styles.materialMeta}>
              <span className={styles.metaTag} style={{display: 'flex', alignItems: 'center', gap: '4px'}}><Package size={14} /> {typeLabels[material.type]}</span>
              <span className={styles.metaTag} style={{display: 'flex', alignItems: 'center', gap: '4px'}}><GitCommit size={14} /> الإصدار {material.version}</span>
              <span className={styles.metaTag} style={{display: 'flex', alignItems: 'center', gap: '4px'}}><User size={14} /> {material.creator.name}</span>
              <span className={styles.metaTag} style={{display: 'flex', alignItems: 'center', gap: '4px'}}><Calendar size={14} /> {timeAgo(material.updatedAt)}</span>
              {material.dueDate && material.status !== "APPROVED" && material.status !== "PUBLISHED" && material.status !== "ARCHIVED" && (
                <span className={styles.metaTag} style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  color: getDeadlineColor(material.createdAt, material.dueDate) || "inherit",
                  fontWeight: 600
                }}>
                  <Clock size={14} /> {formatRemainingTime(material.dueDate)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.materialActions}>
          <Link href={`/dashboard/projects/${material.project.id}`} className="btn btn--ghost btn--sm" style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
            <Folder size={16} /> {material.project.name}
          </Link>
          <StatusActions 
            materialId={material.id} 
            currentStatus={material.status} 
            userRole={userRole} 
            isCreator={isCreator} 
            isOwner={isOwner} 
          />
        </div>
      </div>

      <div className={styles.twoColumns}>
        {/* المحتوى + التعليقات */}
        <div className={styles.mainColumn}>
          {/* الملف המرفق */}
          {material.fileUrl && (
            <div className={styles.contentSection} style={{ marginBottom: "var(--space-6)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
                <h2 className={styles.sectionTitle} style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Paperclip size={20} /> الملف المرفق</h2>
                <a href={material.fileUrl} download className="btn btn--ghost btn--sm" style={{display: 'flex', alignItems: 'center', gap: '6px'}}><Download size={16} /> تحميل الملف</a>
              </div>
              <div style={{ background: "var(--cream-light)", padding: "var(--space-4)", borderRadius: "var(--radius-lg)", display: "flex", justifyContent: "center" }}>
                {material.type === "IMAGE" && (
                  <img src={material.fileUrl} alt={material.title} style={{ maxWidth: "100%", maxHeight: "500px", borderRadius: "var(--radius-md)", objectFit: "contain" }} />
                )}
                {material.type === "VIDEO" && (
                  <video src={material.fileUrl} controls style={{ maxWidth: "100%", maxHeight: "500px", borderRadius: "var(--radius-md)" }} />
                )}
                {material.type === "AUDIO" && (
                  <audio src={material.fileUrl} controls style={{ width: "100%" }} />
                )}
                {material.type !== "IMAGE" && material.type !== "VIDEO" && material.type !== "AUDIO" && (
                  <p style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>ملف مرفق جاهز للتحميل</p>
                )}
              </div>
            </div>
          )}

          {/* المحتوى */}
          {material.content && (
            <div className={styles.contentSection}>
              <h2 className={styles.sectionTitle} style={{display: 'flex', alignItems: 'center', gap: '8px'}}><FileText size={20} /> المحتوى</h2>
              <div 
                className={`${styles.contentBody} rich-text-content`}
                dangerouslySetInnerHTML={{ __html: material.content }}
              />
            </div>
          )}

          {/* التعليقات */}
          <div className={styles.commentsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <MessageSquare size={20} /> التعليقات
                {unresolvedComments > 0 && (
                  <span className={styles.commentBadge}>{unresolvedComments}</span>
                )}
              </h2>
            </div>

            <div className={styles.commentsList}>
              {material.comments.length === 0 ? (
                <p style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)", padding: "var(--space-4) 0" }}>لا توجد تعليقات بعد</p>
              ) : (
                material.comments.map((comment) => (
                  <div key={comment.id} className={`${styles.commentItem} ${comment.status === "RESOLVED" ? styles.commentResolved : ""}`}>
                    <div className={styles.commentAvatar} style={{ background: comment.status === "RESOLVED" ? "var(--success)" : "var(--gold)" }}>
                      {comment.author.name?.charAt(0) || "?"}
                    </div>
                    <div className={styles.commentContent}>
                      <div className={styles.commentHeader}>
                        <span className={styles.commentAuthor}>{comment.author.name}</span>
                        <span className={styles.commentTime}>{timeAgo(comment.createdAt)}</span>
                        {comment.status === "RESOLVED" ? (
                          <span className={styles.resolvedTag}>✓ تم الحل</span>
                        ) : (
                          <ResolveCommentButton commentId={comment.id} />
                        )}
                      </div>
                      <p className={styles.commentText}>{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className={styles.addComment}>
              <AddCommentForm materialId={material.id} />
            </div>
          </div>
        </div>

        {/* سجل التحولات */}
        <div className={styles.sideColumn}>
          <div className={styles.timelineSection}>
            <h2 className={styles.sectionTitle} style={{display: 'flex', alignItems: 'center', gap: '8px'}}><History size={20} /> سجل الحالات</h2>
            <div className={styles.timeline}>
              {material.transitions.length === 0 ? (
                <p style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>لا يوجد سجل تحولات</p>
              ) : (
                material.transitions.map((t, i) => (
                  <div key={i} className={styles.timelineItem}>
                    <div className={styles.timelineDot} />
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineAction}>
                        {t.fromStatus && <span className={styles.timelineFrom}>{statusLabels[t.fromStatus] || t.fromStatus}</span>}
                        <span className={styles.timelineArrow}>←</span>
                        <span className={styles.timelineTo}>{statusLabels[t.toStatus] || t.toStatus}</span>
                      </div>
                      <div className={styles.timelineMeta}>{timeAgo(t.createdAt)}</div>
                      {t.note && <div className={styles.timelineNote}>{t.note}</div>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* التفاصيل */}
          <div className={styles.infoSection}>
            <h2 className={styles.sectionTitle} style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Info size={20} /> التفاصيل</h2>
            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>النوع</span>
                <span className={styles.infoValue}>{typeLabels[material.type]}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>الإصدار</span>
                <span className={styles.infoValue}>v{material.version}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>المنشئ</span>
                <span className={styles.infoValue}>{material.creator.name}</span>
              </div>
              {material.dueDate && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>الاعتماد المستهدف</span>
                  <span className={styles.infoValue} style={{
                    color: getDeadlineColor(material.createdAt, material.dueDate) || "inherit",
                    fontWeight: 500
                  }}>
                    {formatDate(material.dueDate)}
                  </span>
                </div>
              )}
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>أُنشئ</span>
                <span className={styles.infoValue}>{formatDate(material.createdAt)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>آخر تحديث</span>
                <span className={styles.infoValue}>{formatDate(material.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
