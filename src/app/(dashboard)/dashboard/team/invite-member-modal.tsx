"use client";

import { useActionState, useState, useEffect } from "react";
import { inviteMember } from "@/app/actions/team";
import { UserPlus, X } from "lucide-react";

interface Project {
  id: string;
  name: string;
}

export function InviteMemberModal({ projects }: { projects: Project[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(inviteMember, null);

  // Close modal on success
  useEffect(() => {
    if (state && "success" in state && state.success) {
      setIsOpen(false);
    }
  }, [state]);

  return (
    <>
      <button className="btn btn--primary" onClick={() => setIsOpen(true)}>
        <UserPlus size={18} style={{ marginLeft: "6px" }} />
        دعوة عضو
      </button>

      {isOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, padding: "20px"
        }}>
          <div style={{
            background: "var(--white)", width: "100%", maxWidth: "450px",
            borderRadius: "var(--radius-xl)", padding: "24px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            position: "relative"
          }}>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                position: "absolute", top: "20px", left: "20px",
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text-muted)"
              }}
            >
              <X size={20} />
            </button>
            
            <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--indigo)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <UserPlus size={24} /> دعوة عضو جديد
            </h2>
            <p style={{ fontFamily: "var(--font-body)", color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>
              أدخل البريد الإلكتروني للعضو وحدد الصلاحية والمشروع المراد إضافته إليه.
            </p>

            <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontFamily: "var(--font-heading)", fontSize: "0.9rem" }}>البريد الإلكتروني</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  style={{
                    width: "100%", padding: "10px", borderRadius: "8px",
                    border: "1px solid var(--border-subtle)", fontFamily: "var(--font-body)"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontFamily: "var(--font-heading)", fontSize: "0.9rem" }}>المشروع</label>
                <select
                  name="projectId"
                  required
                  style={{
                    width: "100%", padding: "10px", borderRadius: "8px",
                    border: "1px solid var(--border-subtle)", fontFamily: "var(--font-body)",
                    background: "var(--white)"
                  }}
                >
                  <option value="">اختر المشروع...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontFamily: "var(--font-heading)", fontSize: "0.9rem" }}>الدور والصلاحية</label>
                <select
                  name="role"
                  required
                  defaultValue="CREATOR"
                  style={{
                    width: "100%", padding: "10px", borderRadius: "8px",
                    border: "1px solid var(--border-subtle)", fontFamily: "var(--font-body)",
                    background: "var(--white)"
                  }}
                >
                  <option value="ADMIN">مدير (Admin)</option>
                  <option value="PROJECT_MANAGER">مدير مشروع (Project Manager)</option>
                  <option value="CREATOR">منشئ محتوى (Creator)</option>
                  <option value="REVIEWER">مراجع (Reviewer)</option>
                  <option value="APPROVER">معتمد (Approver)</option>
                </select>
              </div>

              {state && "error" in state && state.error && (
                <div style={{ color: "var(--error)", fontSize: "0.85rem", background: "rgba(220, 38, 38, 0.1)", padding: "8px", borderRadius: "4px" }}>
                  {state.error as string}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
                <button type="button" onClick={() => setIsOpen(false)} className="btn btn--ghost">إلغاء</button>
                <button type="submit" disabled={isPending} className="btn btn--primary">
                  {isPending ? "جاري الإرسال..." : "إرسال الدعوة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
