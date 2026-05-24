import NoSidebarDashboardLayout from "@/components/layout/NoSidebarDashboardLayout";
import { requireRole } from "@/lib/serverAuth";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requireRole("STUDENT");

  return <NoSidebarDashboardLayout bleed>{children}</NoSidebarDashboardLayout>;
}
