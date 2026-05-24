import NoSidebarDashboardLayout from "@/components/layout/NoSidebarDashboardLayout";
import { requireRole } from "@/lib/serverAuth";

export default async function AdvisorLayout({ children }: { children: React.ReactNode }) {
  await requireRole("ADVISOR");

  return <NoSidebarDashboardLayout>{children}</NoSidebarDashboardLayout>;
}
