import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInviteEmail(to: string, projectName: string, inviterName: string, role: string) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️ RESEND_API_KEY is not set. Email not sent to:", to);
      return false;
    }

    const { data, error } = await resend.emails.send({
      from: 'Mamhoor <noreply@mamhoor.com>', // TODO: Update this to a verified domain on Resend
      to: [to],
      subject: `دعوة للانضمام إلى مشروع "${projectName}" - منصة ممهور`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 24px;">
          <h2 style="color: #4f46e5; text-align: center; margin-bottom: 24px;">منصة ممهور - Mamhoor</h2>
          
          <p style="font-size: 16px;">مرحباً بك،</p>
          
          <p style="font-size: 16px;">لقد قام <strong>${inviterName || 'أحد أعضاء الفريق'}</strong> بدعوتك للانضمام إلى مشروع <strong>"${projectName}"</strong> بصلاحية <strong>${role}</strong>.</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://mamhoor.com'}/dashboard/projects" 
               style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              عرض المشروع
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
            إذا لم يكن لديك حساب في منصة ممهور، يرجى التسجيل أولاً باستخدام هذا البريد الإلكتروني.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Email Exception:", err);
    return false;
  }
}
