"use client";

import { useActionState } from "react";
import { addComment, resolveComment } from "@/app/actions/comment";
import { updateMaterialStatus } from "@/app/actions/material";
import { useState, useTransition } from "react";
import { Send, Edit3, ClipboardCheck, CheckCircle, Rocket, Archive } from "lucide-react";

// ============================================
// نموذج إضافة تعليق
// ============================================
export function AddCommentForm({ materialId }: { materialId: string }) {
  const [state, formAction, isPending] = useActionState(addComment, null);
  const [value, setValue] = useState("");

  return (
    <form
      action={async (formData) => {
        await formAction(formData);
        setValue("");
      }}
      style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}
    >
      <input type="hidden" name="materialId" value={materialId} />
      <input
        name="content"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="اكتب تعليقاً..."
        style={{
          flex: 1,
          padding: "10px 14px",
          borderRadius: "8px",
          border: "1.5px solid var(--cream-dark)",
          fontFamily: "var(--font-body)",
          fontSize: "0.9rem",
          outline: "none",
          background: "var(--white)",
          transition: "border-color 0.2s",
        }}
      />
      <button
        type="submit"
        disabled={isPending || !value.trim()}
        className="btn btn--primary btn--sm"
        style={{ opacity: isPending || !value.trim() ? 0.6 : 1 }}
      >
        {isPending ? "..." : "إرسال"}
      </button>
      {state && "error" in state && state.error && (
        <span style={{ color: "var(--error)", fontSize: "0.8rem" }}>{state.error as string}</span>
      )}
    </form>
  );
}

// ============================================
// زر حل تعليق
// ============================================
export function ResolveCommentButton({ commentId }: { commentId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => resolveComment(commentId))}
      disabled={isPending}
      style={{
        background: "none", border: "none", cursor: "pointer",
        color: "var(--success)", fontSize: "0.75rem", fontWeight: 600,
        fontFamily: "var(--font-heading)", opacity: isPending ? 0.5 : 1,
        padding: "2px 6px", borderRadius: "4px",
      }}
    >
      {isPending ? "..." : "✓ حل"}
    </button>
  );
}

// ============================================
// أزرار تغيير الحالة
// ============================================
const STATUS_ACTIONS: Record<string, { label: string; next: string; style: string; icon: React.ReactNode; allowedRoles: string[] }[]> = {
  DRAFT: [{ label: "إرسال للمراجعة", next: "IN_REVIEW", style: "btn--primary", icon: <Send size={16} />, allowedRoles: ["OWNER", "ADMIN", "PROJECT_MANAGER", "CREATOR"] }],
  IN_REVIEW: [
    { label: "طلب تعديلات", next: "CHANGES_REQUESTED", style: "btn--ghost", icon: <Edit3 size={16} />, allowedRoles: ["OWNER", "ADMIN", "PROJECT_MANAGER", "REVIEWER", "APPROVER"] },
    { label: "إرسال للاعتماد", next: "PENDING_APPROVAL", style: "btn--primary", icon: <ClipboardCheck size={16} />, allowedRoles: ["OWNER", "ADMIN", "PROJECT_MANAGER", "REVIEWER"] },
  ],
  CHANGES_REQUESTED: [{ label: "إعادة إرسال للمراجعة", next: "IN_REVIEW", style: "btn--primary", icon: <Send size={16} />, allowedRoles: ["OWNER", "ADMIN", "PROJECT_MANAGER", "CREATOR"] }],
  PENDING_APPROVAL: [
    { label: "طلب تعديلات", next: "CHANGES_REQUESTED", style: "btn--ghost", icon: <Edit3 size={16} />, allowedRoles: ["OWNER", "ADMIN", "PROJECT_MANAGER", "REVIEWER", "APPROVER"] },
    { label: "اعتماد", next: "APPROVED", style: "btn--gold", icon: <CheckCircle size={16} />, allowedRoles: ["OWNER", "ADMIN", "PROJECT_MANAGER", "APPROVER"] },
  ],
  APPROVED: [
    { label: "نشر", next: "PUBLISHED", style: "btn--primary", icon: <Rocket size={16} />, allowedRoles: ["OWNER", "ADMIN", "PROJECT_MANAGER"] },
    { label: "أرشفة", next: "ARCHIVED", style: "btn--ghost", icon: <Archive size={16} />, allowedRoles: ["OWNER", "ADMIN", "PROJECT_MANAGER"] },
  ],
  PUBLISHED: [{ label: "أرشفة", next: "ARCHIVED", style: "btn--ghost", icon: <Archive size={16} />, allowedRoles: ["OWNER", "ADMIN", "PROJECT_MANAGER"] }],
};

export function StatusActions({ materialId, currentStatus, userRole, isCreator, isOwner }: { materialId: string; currentStatus: string; userRole: string; isCreator: boolean; isOwner: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  
  const allActions = STATUS_ACTIONS[currentStatus];
  if (!allActions || allActions.length === 0) return null;

  // Filter actions based on RBAC
  const actions = allActions.filter(action => {
    if (isOwner) return true;
    if (action.allowedRoles.includes(userRole)) {
      // Creator can send to review if they created it
      if (userRole === "CREATOR" && !isCreator && action.next === "IN_REVIEW") return false;
      return true;
    }
    return false;
  });

  if (actions.length === 0) return null;

  return (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
      {actions.map((action) => (
        <button
          key={action.next}
          className={`btn btn--sm ${action.style}`}
          disabled={isPending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await updateMaterialStatus(materialId, action.next);
              if (result && "error" in result) {
                setError(result.error as string);
              }
            });
          }}
          style={{ opacity: isPending ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {action.icon}
          {isPending ? "..." : action.label}
        </button>
      ))}
      {error && <span style={{ color: "var(--error)", fontSize: "0.8rem" }}>{error}</span>}
    </div>
  );
}
