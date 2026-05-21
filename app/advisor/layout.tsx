import NoSidebarDashboardLayout from "@/components/layout/NoSidebarDashboardLayout";

export default function AdvisorLayout({ children }: { children: React.ReactNode }) {
  return <NoSidebarDashboardLayout>{children}</NoSidebarDashboardLayout>;
}
