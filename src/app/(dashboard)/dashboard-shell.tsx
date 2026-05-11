"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import styles from "./dashboard.module.css";
import { Home, Folder, FileText, KanbanSquare, MessageSquare, Users, Bell, Settings, LogOut, Search } from "lucide-react";

/* Seal Logo SVG */
function MamhoorSeal({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="56" stroke="#C4A265" strokeWidth="2.5" fill="none" />
      <circle cx="60" cy="60" r="48" stroke="#C4A265" strokeWidth="1.5" fill="none" strokeDasharray="6 4" />
      <circle cx="60" cy="60" r="40" fill="#212842" />
      <circle cx="60" cy="60" r="36" stroke="#C4A265" strokeWidth="1" fill="none" />
      <text x="60" y="68" textAnchor="middle" fontFamily="Cairo, sans-serif" fontWeight="900" fontSize="36" fill="#C4A265">م</text>
      <circle cx="60" cy="12" r="3" fill="#C4A265" />
      <circle cx="60" cy="108" r="3" fill="#C4A265" />
      <circle cx="12" cy="60" r="3" fill="#C4A265" />
      <circle cx="108" cy="60" r="3" fill="#C4A265" />
    </svg>
  );
}

/* Navigation Items */
const navItems = [
  {
    section: "الرئيسية",
    links: [
      { href: "/dashboard", icon: <Home size={20} />, label: "لوحة التحكم" },
      { href: "/dashboard/projects", icon: <Folder size={20} />, label: "المشاريع" },
    ],
  },
  {
    section: "المحتوى",
    links: [
      { href: "/dashboard/content", icon: <FileText size={20} />, label: "المواد" },
      { href: "/dashboard/kanban", icon: <KanbanSquare size={20} />, label: "لوحة كانبان" },
      { href: "/dashboard/comments", icon: <MessageSquare size={20} />, label: "التعليقات" },
    ],
  },
  {
    section: "الإدارة",
    links: [
      { href: "/dashboard/team", icon: <Users size={20} />, label: "الفريق" },
      { href: "/dashboard/notifications", icon: <Bell size={20} />, label: "الإشعارات" },
      { href: "/dashboard/settings", icon: <Settings size={20} />, label: "الإعدادات" },
    ],
  },
];

// ترجمة الأدوار
const roleLabels: Record<string, string> = {
  OWNER: "المالك",
  ADMIN: "المسؤول",
  PROJECT_MANAGER: "مدير المشروع",
  CREATOR: "منشئ المحتوى",
  REVIEWER: "المراجع",
  APPROVER: "المعتمد",
};

type DashboardLayoutProps = {
  children: React.ReactNode;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    avatarUrl: string | null;
  };
};

export default function DashboardShell({ children, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const userInitial = user.name ? user.name.charAt(0) : user.email.charAt(0);
  const displayName = user.name || user.email;
  const roleName = roleLabels[user.role] || user.role;

  return (
    <div className={styles.dashboardLayout}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className={`${styles.sidebarOverlay} ${styles.sidebarOverlayVisible}`}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.sidebarLogo}>
            <MamhoorSeal size={32} />
            <span>ممهور</span>
          </Link>
          <button
            className={styles.sidebarClose}
            onClick={() => setSidebarOpen(false)}
            aria-label="إغلاق القائمة"
          >
            ✕
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map((section) => (
            <div key={section.section} className={styles.sidebarSection}>
              <div className={styles.sidebarSectionLabel}>{section.section}</div>
              {section.links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ""}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className={styles.sidebarIcon}>{link.icon}</span>
                    {link.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.sidebarUser}>
            <div className={styles.sidebarAvatar}>{userInitial}</div>
            <div className={styles.sidebarUserInfo}>
              <div className={styles.sidebarUserName}>{displayName}</div>
              <div className={styles.sidebarUserRole}>{roleName}</div>
            </div>
          </div>
          <form action={logout}>
            <button type="submit" className={styles.logoutBtn} title="تسجيل الخروج">
              <LogOut size={20} />
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <button
            className={styles.headerMenuBtn}
            onClick={() => setSidebarOpen(true)}
            aria-label="فتح القائمة"
          >
            ☰
          </button>

          <h1 className={styles.headerTitle}>لوحة التحكم</h1>

          <div className={styles.headerSpacer} />

          {/* Search */}
          <div className={styles.headerSearch}>
            <span className={styles.headerSearchIcon} style={{display: 'flex', alignItems: 'center'}}><Search size={18} /></span>
            <input
              type="text"
              className={styles.headerSearchInput}
              placeholder="ابحث في المواد..."
            />
          </div>

          {/* Actions */}
          <div className={styles.headerActions}>
            <button className={styles.headerIconBtn} aria-label="الإشعارات" style={{display: 'flex', alignItems: 'center'}}>
              <Bell size={20} />
              <span className={styles.headerNotifDot} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className={styles.pageContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
