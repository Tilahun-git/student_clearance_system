import NoSidebarDashboardLayout from "@/components/layout/NoSidebarDashboardLayout";
import { requireRole } from "@/lib/serverAuth";

export default async function SchoolDeanLayout({ children }: { children: React.ReactNode }) {
  await requireRole("SCHOOL_DEAN");

  return <NoSidebarDashboardLayout>{children}</NoSidebarDashboardLayout>;
}
