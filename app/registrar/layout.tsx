import NoSidebarDashboardLayout from "@/components/layout/NoSidebarDashboardLayout";

export default function RegistrarLayout({ children }: { children: React.ReactNode }) {
  return <NoSidebarDashboardLayout bleed>{children}</NoSidebarDashboardLayout>;
}
