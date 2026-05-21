import NoSidebarDashboardLayout from "@/components/layout/NoSidebarDashboardLayout";

export default function DormitoryLayout({ children }: { children: React.ReactNode }) {
  return <NoSidebarDashboardLayout>{children}</NoSidebarDashboardLayout>;
}
