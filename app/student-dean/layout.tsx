import NoSidebarDashboardLayout from "@/components/layout/NoSidebarDashboardLayout";

export default function StudentDeanLayout({ children }: { children: React.ReactNode }) {
  return <NoSidebarDashboardLayout>{children}</NoSidebarDashboardLayout>;
}
