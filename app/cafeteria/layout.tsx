import NoSidebarDashboardLayout from "@/components/layout/NoSidebarDashboardLayout";
import { requireRole } from "@/lib/serverAuth";

export default async function CafeteriaLayout({ children }: { children: React.ReactNode }) {
  await requireRole("CAFETERIA");

  return <NoSidebarDashboardLayout>{children}</NoSidebarDashboardLayout>;
}
