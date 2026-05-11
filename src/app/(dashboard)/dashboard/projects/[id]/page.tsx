import styles from "./project-detail.module.css";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { FileText, Image as ImageIcon, Film, Mic, Rocket, Video, Book, Target, Lightbulb, Calendar, Package, CheckCircle, Users } from "lucide-react";

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

const typeIcons: Record<string, React.ReactNode> = {
  TEXT: <FileText size={20} />,
  IMAGE: <ImageIcon size={20} />,
  VIDEO: <Film size={20} />,
  AUDIO: <Mic size={20} />,
};

const typeLabels: Record<string, string> = {
  TEXT: "نص",
  IMAGE: "صورة",
  VIDEO: "فيديو",
  AUDIO: "صوت",
};

const roleLabels: Record<string, string> = {
  OWNER: "مالك",
  ADMIN: "مدير",
  PROJECT_MANAGER: "مدير مشروع",
  CREATOR: "منشئ",
  REVIEWER: "مراجع",
  APPROVER: "معتمد",
};

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "اليوم";
  if (days === 1) return "أمس";
  return date.toLocaleDateString("ar-SA", { day: "numeric", month: "long" });
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await verifySession();

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      owner: { select: { name: true } },
      materials: {
        include: { creator: { select: { name: true } } },
        orderBy: { updatedAt: "desc" },
      },
      members: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
  });

  const isOwner = project.ownerId === session.userId;
  const isMember = project.members.some(m => m.userId === session.userId);

  if (!project || (!isOwner && !isMember)) {
    notFound();
  }

  const approvedCount = project.materials.filter(m => m.status === "APPROVED").length;
  const inReviewCount = project.materials.filter(m => m.status === "IN_REVIEW").length;
  const projectIcons = [
    <Rocket key="1" size={32} />, 
    <Video key="2" size={32} />, 
    <Book key="3" size={32} />, 
    <Target key="4" size={32} />, 
    <Lightbulb key="5" size={32} />
  ];
  const icon = projectIcons[Math.abs(project.id.charCodeAt(0)) % projectIcons.length];
  const projectStatus = project.status === "ACTIVE" ? "نشط" : "مؤرشف";
  const projectStatusColor = project.status === "ACTIVE" ? "var(--success)" : "var(--text-muted)";

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/dashboard/projects" className={styles.breadcrumbLink}>المشاريع</Link>
        <span className={styles.breadcrumbSep}>←</span>
        <span className={styles.breadcrumbCurrent}>{project.name}</span>
      </div>

      {/* بطاقة المشروع */}
      <div className={styles.projectCard}>
        <div className={styles.projectTop}>
          <div className={styles.projectIconLarge}>{icon}</div>
          <div className={styles.projectInfo}>
            <div className={styles.titleRow}>
              <h1 className={styles.projectName}>{project.name}</h1>
              <span className={styles.statusBadge} style={{ background: projectStatusColor + "22", color: projectStatusColor }}>{projectStatus}</span>
            </div>
            <p className={styles.projectDesc}>{project.description || "لا يوجد وصف لهذا المشروع"}</p>
            <div className={styles.projectMeta}>
              <span className={styles.metaTag} style={{display: 'flex', alignItems: 'center', gap: '4px'}}><Calendar size={14} /> أُنشئ: {formatDate(project.createdAt)}</span>
              <span className={styles.metaTag} style={{display: 'flex', alignItems: 'center', gap: '4px'}}><Package size={14} /> {project.materials.length} مادة</span>
              <span className={styles.metaTag} style={{display: 'flex', alignItems: 'center', gap: '4px'}}><CheckCircle size={14} /> {approvedCount} معتمد</span>
            </div>
          </div>
        </div>
      </div>

      {/* إحصائيات */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{project.materials.length}</div>
          <div className={styles.statLabel}>إجمالي المواد</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: "var(--success)" }}>{approvedCount}</div>
          <div className={styles.statLabel}>معتمد</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: "var(--status-in-review)" }}>{inReviewCount}</div>
          <div className={styles.statLabel}>قيد المراجعة</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{project.members.length + 1}</div>
          <div className={styles.statLabel}>أعضاء الفريق</div>
        </div>
      </div>

      {/* قسمان: المواد + الأعضاء */}
      <div className={styles.twoColumns}>
        {/* قائمة المواد */}
        <div className={styles.materialsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle} style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Package size={20} /> المواد</h2>
            <Link href="/dashboard/content/new" className="btn btn--primary btn--sm">+ رفع مادة</Link>
          </div>

          <div className={styles.materialsList}>
            {project.materials.length === 0 ? (
              <div style={{ padding: "var(--space-6)", textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)" }}>لا توجد مواد بعد</p>
              </div>
            ) : (
              project.materials.map((mat) => (
                <Link key={mat.id} href={`/dashboard/content/${mat.id}`} className={styles.materialRow}>
                  <div className={styles.materialInfo}>
                    <div className={styles.materialIcon}>{typeIcons[mat.type] || <FileText size={20} />}</div>
                    <div>
                      <div className={styles.materialName}>{mat.title}</div>
                      <div className={styles.materialMeta}>{typeLabels[mat.type]} · v{mat.version} · {formatDate(mat.updatedAt)}</div>
                    </div>
                  </div>
                  <span className={styles.materialStatus} style={{ background: (statusColors[mat.status] || "var(--text-muted)") + "22", color: statusColors[mat.status] }}>
                    {statusLabels[mat.status] || mat.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* أعضاء الفريق */}
        <div className={styles.membersSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle} style={{display: 'flex', alignItems: 'center', gap: '8px'}}><Users size={20} /> الفريق</h2>
            <button className="btn btn--ghost btn--sm">+ دعوة</button>
          </div>

          <div className={styles.membersList}>
            {/* المالك */}
            <div className={styles.memberRow}>
              <div className={styles.memberAvatar} style={{ background: "var(--gold)" }}>
                {project.owner.name?.charAt(0) || "?"}
              </div>
              <div className={styles.memberInfo}>
                <div className={styles.memberName}>{project.owner.name}</div>
                <div className={styles.memberRole}>مالك</div>
              </div>
            </div>
            {/* الأعضاء */}
            {project.members.map((member, i) => (
              <div key={i} className={styles.memberRow}>
                <div className={styles.memberAvatar} style={{ background: `hsl(${(i + 1) * 60}, 45%, 55%)` }}>
                  {member.user.name?.charAt(0) || "?"}
                </div>
                <div className={styles.memberInfo}>
                  <div className={styles.memberName}>{member.user.name}</div>
                  <div className={styles.memberRole}>{roleLabels[member.role] || member.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
