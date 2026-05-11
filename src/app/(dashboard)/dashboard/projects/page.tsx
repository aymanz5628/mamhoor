import styles from "./projects.module.css";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { NewProjectForm } from "./new-project-form";
import SearchAndFilter from "@/components/search-and-filter";
import { FolderOpen, Rocket, Video, Book, Target, Lightbulb, Microscope, Smartphone, Palette } from "lucide-react";

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const session = await verifySession();
  const { q, status } = await searchParams;

  const whereClause: any = {
    OR: [
      { ownerId: session.userId },
      { members: { some: { userId: session.userId } } }
    ]
  };

  if (q) {
    whereClause.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
    ];
  }

  if (status && status !== "ALL") {
    whereClause.status = status;
  }

  const projects = await prisma.project.findMany({
    where: whereClause,
    include: {
      _count: { select: { materials: true, members: true } },
      materials: {
        where: { status: "APPROVED" },
        select: { id: true },
      },
      members: {
        include: { user: { select: { name: true } } },
        take: 3,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
    ACTIVE: { label: "نشط", bg: "var(--success-bg)", color: "var(--success)" },
    ARCHIVED: { label: "مؤرشف", bg: "var(--bg-secondary)", color: "var(--text-muted)" },
  };

  const projectIcons = [
    <Rocket key="1" size={24} />,
    <Video key="2" size={24} />,
    <Book key="3" size={24} />,
    <Target key="4" size={24} />,
    <Lightbulb key="5" size={24} />,
    <Microscope key="6" size={24} />,
    <Smartphone key="7" size={24} />,
    <Palette key="8" size={24} />
  ];

  return (
    <div className={styles.projectsContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>المشاريع</h1>
          <p className={styles.subtitle}>إدارة مشاريع مساحات العمل والأذونات</p>
        </div>
        <NewProjectForm />
      </div>

      <SearchAndFilter 
        placeholder="ابحث عن مشروع باسمه أو وصفه..."
        statuses={[
          { value: "ACTIVE", label: "نشط" },
          { value: "ARCHIVED", label: "مؤرشف" },
        ]}
      />

      {projects.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon} style={{display: 'flex', justifyContent: 'center', color: 'var(--text-muted)'}}><FolderOpen size={48} /></div>
          <h2 className={styles.emptyTitle}>لا توجد مشاريع بعد</h2>
          <p className={styles.emptyDesc}>أنشئ مشروعك الأول للبدء في إدارة المحتوى</p>
          <button className="btn btn--primary">+ إنشاء مشروع</button>
        </div>
      ) : (
        <div className={styles.grid}>
          {projects.map((project, i) => {
            const config = statusConfig[project.status] || statusConfig.ACTIVE;
            const approvedCount = project.materials.length;
            const icon = projectIcons[i % projectIcons.length];

            return (
              <div key={project.id} className={styles.projectCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.projectIcon}>{icon}</div>
                  <div className={styles.statusBadge} style={{ background: config.bg, color: config.color }}>
                    {config.label}
                  </div>
                </div>
                <h2 className={styles.projectName}>{project.name}</h2>
                <p className={styles.projectDesc}>{project.description || "لا يوجد وصف"}</p>

                <div className={styles.metaInfo}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>المواد</span>
                    <span className={styles.metaValue}>{project._count.materials}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>معتمد</span>
                    <span className={styles.metaValue}>{approvedCount}</span>
                  </div>
                  <div className={styles.teamAvatars}>
                    {project.members.slice(0, 3).map((m, j) => (
                      <div key={j} className={styles.avatar}>
                        {m.user.name?.charAt(0) || "?"}
                      </div>
                    ))}
                    {project._count.members > 3 && (
                      <div className={styles.avatar} style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                        +{project._count.members - 3}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <Link href={`/dashboard/projects/${project.id}`} className="btn btn--sm btn--ghost">تصفح المشروع</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
