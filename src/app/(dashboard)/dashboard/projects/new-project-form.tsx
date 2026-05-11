"use client";

import { useActionState } from "react";
import { createProject } from "@/app/actions/project";
import { useState } from "react";
import { FolderPlus } from "lucide-react";

export function NewProjectForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createProject, null);

  if (!isOpen) {
    return (
      <button className="btn btn--primary" onClick={() => setIsOpen(true)}>
        <span>+</span> مشروع جديد
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        style={{
          position: "fixed", inset: 0, background: "rgba(18,21,43,0.5)",
          zIndex: 999, backdropFilter: "blur(4px)",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          background: "var(--white)", borderRadius: "16px", padding: "32px",
          width: "min(480px, 90vw)", zIndex: 1000,
          boxShadow: "0 24px 64px rgba(18,21,43,0.2)",
          fontFamily: "var(--font-heading)",
        }}
        dir="rtl"
      >
        <h2 style={{
          fontSize: "1.3rem", fontWeight: 800, color: "var(--indigo)",
          marginBottom: "20px",
          display: "flex", alignItems: "center", gap: "8px",
        }}>
          <FolderPlus size={24} /> مشروع جديد
        </h2>

        <form action={formAction}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{
              display: "block", fontSize: "0.85rem", fontWeight: 700,
              color: "var(--text-secondary)", marginBottom: "6px",
            }}>
              اسم المشروع *
            </label>
            <input
              name="name"
              required
              placeholder="مثال: حملة التسويق الرقمي"
              style={{
                width: "100%", padding: "10px 14px", borderRadius: "8px",
                border: "1.5px solid var(--cream-dark)", fontSize: "0.95rem",
                fontFamily: "var(--font-body)", outline: "none",
                background: "var(--cream-light)", transition: "border-color 0.2s",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block", fontSize: "0.85rem", fontWeight: 700,
              color: "var(--text-secondary)", marginBottom: "6px",
            }}>
              وصف المشروع (اختياري)
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="وصف مختصر للمشروع..."
              style={{
                width: "100%", padding: "10px 14px", borderRadius: "8px",
                border: "1.5px solid var(--cream-dark)", fontSize: "0.9rem",
                fontFamily: "var(--font-body)", outline: "none", resize: "vertical",
                background: "var(--cream-light)", transition: "border-color 0.2s",
              }}
            />
          </div>

          {state && "error" in state && state.error && (
            <div style={{
              background: "rgba(184,92,92,0.1)", color: "var(--error)",
              padding: "10px 14px", borderRadius: "8px", fontSize: "0.85rem",
              marginBottom: "16px", fontWeight: 600,
            }}>
              {state.error as string}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-start" }}>
            <button
              type="submit"
              disabled={isPending}
              className="btn btn--primary"
              style={{ opacity: isPending ? 0.6 : 1 }}
            >
              {isPending ? "جاري الإنشاء..." : "إنشاء المشروع"}
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setIsOpen(false)}
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
