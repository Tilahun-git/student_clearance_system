import NoSidebarDashboardLayout from "@/components/layout/NoSidebarDashboardLayout";
import { requireRole } from "@/lib/serverAuth";

export default async function StudentDeanLayout({ children }: { children: React.ReactNode }) {
  await requireRole("STUDENT_DEAN");

  return <NoSidebarDashboardLayout>{children}</NoSidebarDashboardLayout>;
}
