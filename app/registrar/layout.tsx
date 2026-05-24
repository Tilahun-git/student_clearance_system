import NoSidebarDashboardLayout from "@/components/layout/NoSidebarDashboardLayout";
import { requireRole } from "@/lib/serverAuth";

export default async function RegistrarLayout({ children }: { children: React.ReactNode }) {
  await requireRole("REGISTRAR");

  return <NoSidebarDashboardLayout bleed>{children}</NoSidebarDashboardLayout>;
}
