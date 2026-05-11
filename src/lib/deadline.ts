export function getDeadlineColor(createdAt: Date, dueDate: Date | null): string | null {
  if (!dueDate) return null;

  const now = new Date().getTime();
  const start = new Date(createdAt).getTime();
  const end = new Date(dueDate).getTime();

  // If deadline passed
  if (now >= end) return "var(--error-dark, #000000)"; // Black or very dark red for expired

  const totalDuration = end - start;
  if (totalDuration <= 0) return "var(--error-dark, #000000)";

  const remainingDuration = end - now;
  const percentage = remainingDuration / totalDuration;

  if (percentage <= 0.1) {
    return "var(--error, #dc2626)"; // 10% or less -> Red
  } else if (percentage <= 0.3) {
    return "var(--warning, #f59e0b)"; // 30% or less -> Yellow
  }
  
  return "var(--success, #16a34a)"; // Healthy -> Green
}

export function formatRemainingTime(dueDate: Date | null): string {
  if (!dueDate) return "";
  
  const now = new Date().getTime();
  const end = new Date(dueDate).getTime();
  const diff = end - now;
  
  if (diff <= 0) return "منتهي الصلاحية";
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `متبقي ${days} يوم`;
  if (hours > 0) return `متبقي ${hours} ساعة`;
  return "ينتهي قريباً جداً";
}
