import NoSidebarDashboardLayout from "@/components/layout/NoSidebarDashboardLayout";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <NoSidebarDashboardLayout bleed>{children}</NoSidebarDashboardLayout>;
}
