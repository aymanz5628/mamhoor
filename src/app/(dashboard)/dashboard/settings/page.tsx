import styles from "./settings.module.css";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

const roleLabels: Record<string, string> = {
  OWNER: "مالك", ADMIN: "مدير", PROJECT_MANAGER: "مدير مشروع",
  CREATOR: "منشئ", REVIEWER: "مراجع", APPROVER: "معتمد",
};

export default async function SettingsPage() {
  const session = await verifySession();
  const user = await prisma.user.findUnique({ where: { id: session.userId } });


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>الإعدادات</h1>
        <p className={styles.subtitle}>إدارة حسابك وإعدادات مساحة العمل</p>
      </div>

      {/* الملف الشخصي */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>👤 الملف الشخصي</h2>
        <div className={styles.profileCard}>
          <div className={styles.avatarLarge}>
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className={styles.profileInfo}>
            <h3 className={styles.profileName}>{user?.name}</h3>
            <p className={styles.profileEmail}>{user?.email}</p>
            <span className={styles.profileRole}>المالك</span>
          </div>
          <button className="btn btn--ghost btn--sm">تعديل الملف</button>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>الاسم الكامل</label>
            <input type="text" className={styles.input} defaultValue={user?.name || ""} readOnly />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>البريد الإلكتروني</label>
            <input type="email" className={styles.input} defaultValue={user?.email || ""} readOnly />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>الدور</label>
            <input type="text" className={styles.input} defaultValue={roleLabels[user?.role || ""] || user?.role || "مستخدم"} readOnly />
          </div>
        </div>
      </div>

      {/* إعدادات مساحة العمل */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>🏢 مساحة العمل</h2>
        <div className={styles.settingsList}>
          <div className={styles.settingRow}>
            <div>
              <div className={styles.settingName}>اسم مساحة العمل</div>
              <div className={styles.settingDesc}>الاسم المعروض لمساحة العمل</div>
            </div>
            <input type="text" className={styles.settingInput} defaultValue="ممهور" readOnly />
          </div>
          <div className={styles.settingRow}>
            <div>
              <div className={styles.settingName}>اللغة الافتراضية</div>
              <div className={styles.settingDesc}>اللغة المستخدمة في الواجهة</div>
            </div>
            <select className={styles.settingSelect} defaultValue="ar">
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className={styles.settingRow}>
            <div>
              <div className={styles.settingName}>المنطقة الزمنية</div>
              <div className={styles.settingDesc}>تستخدم لعرض التواريخ والأوقات</div>
            </div>
            <select className={styles.settingSelect} defaultValue="riyadh">
              <option value="riyadh">الرياض (GMT+3)</option>
              <option value="dubai">دبي (GMT+4)</option>
              <option value="cairo">القاهرة (GMT+2)</option>
            </select>
          </div>
        </div>
      </div>

      {/* الإشعارات */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>🔔 الإشعارات</h2>
        <div className={styles.settingsList}>
          <div className={styles.settingRow}>
            <div>
              <div className={styles.settingName}>إشعارات البريد</div>
              <div className={styles.settingDesc}>إرسال إشعارات عبر البريد عند وجود تحديثات</div>
            </div>
            <label className={styles.toggle}>
              <input type="checkbox" defaultChecked />
              <span className={styles.toggleSlider} />
            </label>
          </div>
          <div className={styles.settingRow}>
            <div>
              <div className={styles.settingName}>إشعارات التعليقات</div>
              <div className={styles.settingDesc}>تنبيه عند إضافة تعليق جديد على موادي</div>
            </div>
            <label className={styles.toggle}>
              <input type="checkbox" defaultChecked />
              <span className={styles.toggleSlider} />
            </label>
          </div>
          <div className={styles.settingRow}>
            <div>
              <div className={styles.settingName}>إشعارات الاعتماد</div>
              <div className={styles.settingDesc}>تنبيه عند اعتماد أو رفض مادة</div>
            </div>
            <label className={styles.toggle}>
              <input type="checkbox" defaultChecked />
              <span className={styles.toggleSlider} />
            </label>
          </div>
        </div>
      </div>

      {/* منطقة خطرة */}
      <div className={`${styles.section} ${styles.dangerSection}`}>
        <h2 className={styles.sectionTitle}>⚠️ منطقة خطرة</h2>
        <div className={styles.dangerRow}>
          <div>
            <div className={styles.settingName}>حذف الحساب</div>
            <div className={styles.settingDesc}>حذف الحساب نهائياً مع جميع البيانات — لا يمكن التراجع</div>
          </div>
          <button className={styles.dangerBtn}>حذف الحساب</button>
        </div>
      </div>
    </div>
  );
}
