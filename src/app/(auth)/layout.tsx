import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ممهور — الدخول",
  description: "سجّل دخولك إلى نظام ممهور لإدارة واعتماد المحتوى",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
