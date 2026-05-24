import NoSidebarDashboardLayout from "@/components/layout/NoSidebarDashboardLayout";
import { requireRole } from "@/lib/serverAuth";

export default async function CampusPoliceLayout({ children }: { children: React.ReactNode }) {
  await requireRole("CAMPUS_POLICE");

  return <NoSidebarDashboardLayout>{children}</NoSidebarDashboardLayout>;
}
