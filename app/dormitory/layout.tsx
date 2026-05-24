import NoSidebarDashboardLayout from "@/components/layout/NoSidebarDashboardLayout";
import { requireRole } from "@/lib/serverAuth";

export default async function DormitoryLayout({ children }: { children: React.ReactNode }) {
  await requireRole("DORMITORY");

  return <NoSidebarDashboardLayout>{children}</NoSidebarDashboardLayout>;
}
