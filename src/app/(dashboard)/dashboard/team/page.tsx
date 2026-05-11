import styles from "./team.module.css";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { InviteMemberModal } from "./invite-member-modal";
import { Crown, Shield, BarChart, PenTool, Search, CheckCircle } from "lucide-react";

const roleLabels: Record<string, string> = {
  OWNER: "مالك",
  ADMIN: "مدير",
  PROJECT_MANAGER: "مدير مشروع",
  CREATOR: "منشئ",
  REVIEWER: "مراجع",
  APPROVER: "معتمد",
};

const roleColors: Record<string, string> = {
  OWNER: "var(--gold-dark)",
  ADMIN: "var(--status-in-review)",
  PROJECT_MANAGER: "var(--status-in-review)",
  CREATOR: "var(--status-draft)",
  REVIEWER: "var(--status-changes)",
  APPROVER: "var(--status-approved)",
};

const roleIcons: Record<string, React.ReactNode> = {
  OWNER: <Crown size={16} />, 
  ADMIN: <Shield size={16} />, 
  PROJECT_MANAGER: <BarChart size={16} />,
  CREATOR: <PenTool size={16} />, 
  REVIEWER: <Search size={16} />, 
  APPROVER: <CheckCircle size={16} />,
};

export default async function TeamPage() {
  const session = await verifySession();

  const projectWhere = {
    OR: [
      { ownerId: session.userId },
      { members: { some: { userId: session.userId } } }
    ]
  };

  // جلب أعضاء الفريق من كل مشاريع المستخدم
  const members = await prisma.projectMember.findMany({
    where: { project: projectWhere },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      project: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // تجميع الأعضاء الفريدين (قد يكون عضو في أكثر من مشروع)
  const uniqueMembers = new Map<string, {
    user: { id: string; name: string | null; email: string; role: string };
    projects: string[];
    memberRole: string;
  }>();

  for (const m of members) {
    if (uniqueMembers.has(m.user.id)) {
      uniqueMembers.get(m.user.id)!.projects.push(m.project.name);
    } else {
      uniqueMembers.set(m.user.id, {
        user: m.user,
        projects: [m.project.name],
        memberRole: m.role,
      });
    }
  }

  const teamList = Array.from(uniqueMembers.values());
  const projectCount = await prisma.project.count({ where: projectWhere });

  // Get projects for the invite modal
  const projects = await prisma.project.findMany({
    where: projectWhere,
    select: { id: true, name: true },
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>الفريق</h1>
          <p className={styles.subtitle}>إدارة أعضاء الفريق والأدوار والصلاحيات</p>
        </div>
        <InviteMemberModal projects={projects} />
      </div>

      {/* إحصائيات سريعة */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{teamList.length}</div>
          <div className={styles.statLabel}>إجمالي الأعضاء</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue} style={{ color: "var(--success)" }}>
            {teamList.length}
          </div>
          <div className={styles.statLabel}>أعضاء نشطون</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{projectCount}</div>
          <div className={styles.statLabel}>مشاريع نشطة</div>
        </div>
      </div>

      {/* قائمة الأعضاء */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>العضو</th>
                <th>الدور</th>
                <th>المشاريع</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {teamList.map((member) => (
                <tr key={member.user.id}>
                  <td>
                    <div className={styles.memberCell}>
                      <div className={styles.avatar} style={{ background: roleColors[member.memberRole] || "var(--gold)" }}>
                        {member.user.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <div className={styles.memberName}>{member.user.name}</div>
                        <div className={styles.memberEmail}>{member.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={styles.roleBadge}
                      style={{
                        background: (roleColors[member.memberRole] || "var(--gold)") + "22",
                        color: roleColors[member.memberRole] || "var(--gold)"
                      }}
                    >
                      {roleLabels[member.memberRole] || member.memberRole}
                    </span>
                  </td>
                  <td>
                    <span className={styles.countValue}>
                      {member.projects.join("، ")}
                    </span>
                  </td>
                  <td>
                    {member.memberRole !== "OWNER" && (
                      <button className={styles.actionBtn}>تعديل</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* قسم الأدوار */}
      <div className={styles.rolesSection}>
        <h2 className={styles.sectionTitle} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>🔑 الأدوار والصلاحيات</h2>
        <div className={styles.rolesGrid}>
          {[
            { name: "مالك", desc: "صلاحيات كاملة — إدارة الفريق، الإعدادات، والمشاريع", icon: <Crown size={24} />, color: "var(--gold-dark)" },
            { name: "مدير المشروع", desc: "إدارة المشاريع، تعيين المهام، ومتابعة التقدم", icon: <BarChart size={24} />, color: "var(--status-in-review)" },
            { name: "منشئ", desc: "إنشاء المواد وتحريرها وإرسالها للمراجعة", icon: <PenTool size={24} />, color: "var(--status-draft)" },
            { name: "مراجع", desc: "مراجعة المواد وإضافة تعليقات وطلب التعديلات", icon: <Search size={24} />, color: "var(--status-changes)" },
            { name: "معتمد", desc: "الموافقة النهائية على المواد قبل النشر", icon: <CheckCircle size={24} />, color: "var(--status-approved)" },
          ].map((role, i) => (
            <div key={i} className={styles.roleCard}>
              <div className={styles.roleIcon} style={{ background: role.color + "22", color: role.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{role.icon}</div>
              <div>
                <div className={styles.roleName} style={{ color: role.color }}>{role.name}</div>
                <div className={styles.roleDesc}>{role.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
