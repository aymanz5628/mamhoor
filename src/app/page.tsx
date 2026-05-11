import styles from "./page.module.css";

/* Seal Logo SVG Component */
function MamhoorSeal({ size = 42, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer ring */}
      <circle cx="60" cy="60" r="56" stroke="#C4A265" strokeWidth="2.5" fill="none" />
      {/* Inner ring with notches */}
      <circle cx="60" cy="60" r="48" stroke="#C4A265" strokeWidth="1.5" fill="none" strokeDasharray="6 4" />
      {/* Inner filled circle */}
      <circle cx="60" cy="60" r="40" fill="#212842" />
      {/* Gold inner border */}
      <circle cx="60" cy="60" r="36" stroke="#C4A265" strokeWidth="1" fill="none" />
      {/* Arabic letter "م" stylized as seal stamp */}
      <text
        x="60"
        y="68"
        textAnchor="middle"
        fontFamily="Cairo, sans-serif"
        fontWeight="900"
        fontSize="36"
        fill="#C4A265"
      >
        م
      </text>
      {/* Four corner stars */}
      <circle cx="60" cy="12" r="3" fill="#C4A265" />
      <circle cx="60" cy="108" r="3" fill="#C4A265" />
      <circle cx="12" cy="60" r="3" fill="#C4A265" />
      <circle cx="108" cy="60" r="3" fill="#C4A265" />
      {/* Decorative diamond shapes  */}
      <rect x="57" y="5" width="6" height="6" rx="1" fill="#C4A265" transform="rotate(45 60 8)" />
      <rect x="57" y="109" width="6" height="6" rx="1" fill="#C4A265" transform="rotate(45 60 112)" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className={styles.landing}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={`container ${styles.navInner}`}>
          <div className={styles.logo}>
            <MamhoorSeal size={42} className={styles.logoSealSvg} />
            <span>ممهور</span>
          </div>

          <ul className={styles.navLinks}>
            <li><a href="#features" className={styles.navLink}>المميزات</a></li>
            <li><a href="#workflow" className={styles.navLink}>سير العمل</a></li>
            <li><a href="#start" className={styles.navLink}>ابدأ الآن</a></li>
          </ul>

          <div className={styles.navActions}>
            <a href="/login" className="btn btn--ghost btn--sm">دخول</a>
            <a href="/register" className="btn btn--gold btn--sm">ابدأ مجاناً</a>
          </div>
        </div>
      </nav>

      {/* ============================================
          HERO — Cinematic Dark Section
          ============================================ */}
      <section className={styles.hero}>
        {/* Ambient gradient orbs */}
        <div className={styles.heroAmbient}>
          <div className={`${styles.heroGradientOrb} ${styles.heroOrb1}`} />
          <div className={`${styles.heroGradientOrb} ${styles.heroOrb2}`} />
          <div className={`${styles.heroGradientOrb} ${styles.heroOrb3}`} />
        </div>

        {/* Floating stars */}
        <span className={`star star--cream star--lg ${styles.heroStar} ${styles.heroStar1}`} />
        <span className={`star star--gold ${styles.heroStar} ${styles.heroStar2}`} />
        <span className={`star star--cream ${styles.heroStar} ${styles.heroStar3}`} />
        <span className={`star star--gold star--lg ${styles.heroStar} ${styles.heroStar4}`} />

        {/* Hero Content */}
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className="star star--gold star--sm" />
            نظام إدارة واعتماد المحتوى
          </div>

          <h1 className={styles.heroTitle}>
            محتواك
            <br />
            <span className={styles.heroTitleGold}>ممهور</span>
          </h1>

          <p className={styles.heroSubtitle}>
            نظام متكامل يُنظّم سير عمل المحتوى من الإنشاء حتى النشر.
            تعليقات سياقية، مراجعة هيكلية، واعتماد نهائي — كل ذلك في مكان واحد.
          </p>

          <div className={styles.heroActions}>
            <a href="/register" className="btn btn--gold btn--lg">
              ابدأ مجاناً
            </a>
            <a href="#workflow" className="btn btn--ghost btn--lg" style={{ color: 'var(--cream)', borderColor: 'rgba(240,231,213,0.25)' }}>
              شاهد كيف يعمل
            </a>
          </div>
        </div>

        {/* 3D Preview Card */}
        <div className={styles.heroPreview}>
          <div className={styles.heroPreviewCard}>
            <div className={styles.previewTitlebar}>
              <div className={`${styles.previewDot} ${styles.dotClose}`} />
              <div className={`${styles.previewDot} ${styles.dotMinimize}`} />
              <div className={`${styles.previewDot} ${styles.dotExpand}`} />
            </div>
            <div className={styles.previewBody}>
              {/* Sidebar */}
              <div className={styles.previewSidebar}>
                <div className={`${styles.previewSidebarItem} ${styles.sidebarActive}`}>
                  📋 لوحة كانبان
                </div>
                <div className={styles.previewSidebarItem}>📁 المواد</div>
                <div className={styles.previewSidebarItem}>👥 الفريق</div>
                <div className={styles.previewSidebarItem}>📊 التقارير</div>
                <div className={styles.previewSidebarItem}>⚙️ الإعدادات</div>
              </div>

              {/* Kanban Board */}
              <div className={styles.previewMain}>
                {/* Draft Column */}
                <div className={styles.kanbanCol}>
                  <div className={styles.kanbanColHeader}>
                    <span className={styles.kanbanDot} style={{ background: '#5B7DB1' }} />
                    مسودة
                    <span className={styles.kanbanCount}>3</span>
                  </div>
                  <div className={styles.kanbanCard}>
                    <div className={styles.kanbanCardTitle}>مقال: أفضل ممارسات التسويق</div>
                    <div className={styles.kanbanCardMeta}>
                      <span className={styles.kanbanTag} style={{ background: 'rgba(91,125,177,0.15)', color: '#7BA3D4' }}>نص</span>
                      <div className={styles.kanbanAvatar}>أ</div>
                    </div>
                  </div>
                  <div className={styles.kanbanCard}>
                    <div className={styles.kanbanCardTitle}>إنفوجرافيك التقرير السنوي</div>
                    <div className={styles.kanbanCardMeta}>
                      <span className={styles.kanbanTag} style={{ background: 'rgba(123,107,165,0.15)', color: '#A090CC' }}>صورة</span>
                      <div className={styles.kanbanAvatar}>م</div>
                    </div>
                  </div>
                </div>

                {/* In Review */}
                <div className={styles.kanbanCol}>
                  <div className={styles.kanbanColHeader}>
                    <span className={styles.kanbanDot} style={{ background: '#C4944A' }} />
                    قيد المراجعة
                    <span className={styles.kanbanCount}>2</span>
                  </div>
                  <div className={styles.kanbanCard}>
                    <div className={styles.kanbanCardTitle}>فيديو تعريفي بالمنتج</div>
                    <div className={styles.kanbanCardMeta}>
                      <span className={styles.kanbanTag} style={{ background: 'rgba(196,148,74,0.15)', color: '#D4AA6A' }}>فيديو</span>
                      <div className={styles.kanbanAvatar}>خ</div>
                    </div>
                  </div>
                </div>

                {/* Approved */}
                <div className={styles.kanbanCol}>
                  <div className={styles.kanbanColHeader}>
                    <span className={styles.kanbanDot} style={{ background: '#5B9A6B' }} />
                    معتمد
                    <span className={styles.kanbanCount}>4</span>
                  </div>
                  <div className={styles.kanbanCard}>
                    <div className={styles.kanbanCardTitle}>بودكاست: حوار مع الخبراء</div>
                    <div className={styles.kanbanCardMeta}>
                      <span className={styles.kanbanTag} style={{ background: 'rgba(91,154,107,0.15)', color: '#7BC08C' }}>صوت</span>
                      <div className={styles.kanbanAvatar}>ع</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className={styles.scrollIndicator}>
          <div className={styles.scrollLine} />
          اكتشف المزيد
        </div>
      </section>

      {/* ============================================
          FEATURES — Bento Grid
          ============================================ */}
      <section className={styles.features} id="features">
        <div className="container">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>
              <span className="star star--gold star--sm" />
              المميزات
            </div>
            <div className={styles.sectionDivider} />
            <h2 className={styles.sectionTitle}>
              كل ما تحتاجه لاعتماد محتوى بجودة عالية
            </h2>
            <p className={styles.sectionSubtitle}>
              أدوات متكاملة تغطي كل مرحلة من مراحل إعداد المحتوى واعتماده
            </p>
          </div>

          <div className={styles.bentoGrid}>
            {/* Large card: Workflow */}
            <div className={`${styles.bentoCard} ${styles.bentoLarge}`}>
              <div className={styles.bentoCardIcon}><span>🔄</span></div>
              <h3 className={styles.bentoCardTitle}>سير عمل مرن وقابل للتخصيص</h3>
              <p className={styles.bentoCardDesc}>
                حدد مراحل المراجعة والاعتماد حسب طبيعة مشروعك. من المسودة إلى
                النشر بخطوات واضحة ومتسلسلة. قم بتخصيص كل مرحلة حسب احتياجات فريقك.
              </p>
              <div className={styles.bentoVisual}>
                <div className={styles.bentoVisualBar}>
                  <div className={styles.bentoVisualBarFill} style={{ width: '100%', background: 'var(--status-draft)' }} />
                </div>
                <div className={styles.bentoVisualBar}>
                  <div className={styles.bentoVisualBarFill} style={{ width: '75%', background: 'var(--status-in-review)' }} />
                </div>
                <div className={styles.bentoVisualBar}>
                  <div className={styles.bentoVisualBarFill} style={{ width: '50%', background: 'var(--gold)' }} />
                </div>
                <div className={styles.bentoVisualBar}>
                  <div className={styles.bentoVisualBarFill} style={{ width: '25%', background: 'var(--status-approved)' }} />
                </div>
              </div>
            </div>

            {/* Card: Comments */}
            <div className={styles.bentoCard}>
              <div className={styles.bentoCardIcon}><span>💬</span></div>
              <h3 className={styles.bentoCardTitle}>تعليقات سياقية</h3>
              <p className={styles.bentoCardDesc}>
                علّق مباشرة على النص أو الصورة أو الفيديو. لا مزيد من الملاحظات المبعثرة.
              </p>
            </div>

            {/* Card: Roles */}
            <div className={styles.bentoCard}>
              <div className={styles.bentoCardIcon}><span>👥</span></div>
              <h3 className={styles.bentoCardTitle}>أدوار وصلاحيات</h3>
              <p className={styles.bentoCardDesc}>
                تحكم دقيق بمن يرى ومن يعدّل ومن يعتمد. نظام أدوار هرمي يناسب فرق مختلفة الأحجام.
              </p>
            </div>

            {/* Card: Kanban */}
            <div className={styles.bentoCard}>
              <div className={styles.bentoCardIcon}><span>📊</span></div>
              <h3 className={styles.bentoCardTitle}>لوحة كانبان</h3>
              <p className={styles.bentoCardDesc}>
                تتبع كل مادة بنظرة واحدة. اعرف أين وصلت كل قطعة في سلسلة الاعتماد.
              </p>
            </div>

            {/* Large card: Notifications + Mobile */}
            <div className={`${styles.bentoCard} ${styles.bentoLarge}`}>
              <div className={styles.bentoCardIcon}><span>🔔</span></div>
              <h3 className={styles.bentoCardTitle}>إشعارات ذكية ومتابعة من أي مكان</h3>
              <p className={styles.bentoCardDesc}>
                لا تفوتك أي ملاحظة أو طلب اعتماد. إشعارات فورية عند كل تغيير.
                واجهة متجاوبة تعمل بسلاسة على الهاتف والتابلت والحاسوب.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          WORKFLOW — Timeline
          ============================================ */}
      <section className={styles.workflow} id="workflow">
        <div className="container">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>
              <span className="star star--gold star--sm" />
              كيف يعمل
            </div>
            <div className={styles.sectionDivider} />
            <h2 className={styles.sectionTitle}>أربع خطوات نحو محتوى ممهور</h2>
            <p className={styles.sectionSubtitle}>
              سير عمل بسيط وواضح يضمن جودة المحتوى في كل مرحلة
            </p>
          </div>

          <div className={styles.timeline}>
            <div className={styles.timelineStep}>
              <div className={`${styles.timelineMarker} ${styles.markerDraft}`}>1</div>
              <div className={styles.timelineBody}>
                <h3 className={styles.timelineTitle}>الإنشاء والرفع</h3>
                <p className={styles.timelineDesc}>
                  يرفع المنشئ المادة (نص، صور، فيديو...) مع البيانات الوصفية، وتبدأ كمسودة قابلة للتعديل.
                </p>
              </div>
            </div>

            <div className={styles.timelineStep}>
              <div className={`${styles.timelineMarker} ${styles.markerReview}`}>2</div>
              <div className={styles.timelineBody}>
                <h3 className={styles.timelineTitle}>المراجعة والتعليق</h3>
                <p className={styles.timelineDesc}>
                  يراجع المحرر المحتوى ويضع تعليقاته السياقية. يمر المحتوى بدورات تعديل حتى يرضى المحرر.
                </p>
              </div>
            </div>

            <div className={styles.timelineStep}>
              <div className={`${styles.timelineMarker} ${styles.markerApprove}`}>3</div>
              <div className={styles.timelineBody}>
                <h3 className={styles.timelineTitle}>الاعتماد النهائي</h3>
                <p className={styles.timelineDesc}>
                  يراجع المعتمِد المادة ويختمها بالاعتماد. المادة الآن "ممهورة" — معتمدة رسمياً.
                </p>
              </div>
            </div>

            <div className={styles.timelineStep}>
              <div className={`${styles.timelineMarker} ${styles.markerPublish}`}>4</div>
              <div className={styles.timelineBody}>
                <h3 className={styles.timelineTitle}>النشر والتوزيع</h3>
                <p className={styles.timelineDesc}>
                  المادة المعتمدة جاهزة للنشر فوراً أو بجدولة. يتم تسجيل كل خطوة في سجل التدقيق.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          CTA Section
          ============================================ */}
      <section className={styles.cta} id="start">
        <div className="container">
          <div className={styles.ctaCard}>
            <div className={styles.ctaStars}>
              <span className={`star star--cream star--lg ${styles.ctaStar} ${styles.ctaStar1}`} />
              <span className={`star star--gold ${styles.ctaStar} ${styles.ctaStar2}`} />
              <span className={`star star--cream star--lg ${styles.ctaStar} ${styles.ctaStar3}`} />
            </div>
            <div className={styles.ctaContent}>
              <MamhoorSeal size={64} />
              <h2 className={styles.ctaTitle} style={{ marginTop: 'var(--space-6)' }}>
                جاهز لتختم محتواك؟
              </h2>
              <p className={styles.ctaDesc}>
                ابدأ اليوم مجاناً وحوّل فوضى المحتوى إلى سير عمل منظم وممهور.
              </p>
              <a href="/register" className="btn btn--gold btn--lg">
                أنشئ حسابك الآن
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={`container ${styles.footerInner}`}>
          <div className={styles.logo}>
            <MamhoorSeal size={36} />
            <span>ممهور</span>
          </div>
          <p className={styles.footerText}>
            © {new Date().getFullYear()} ممهور — جميع الحقوق محفوظة
          </p>
        </div>
      </footer>
    </div>
  );
}
