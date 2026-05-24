import NoSidebarDashboardLayout from "@/components/layout/NoSidebarDashboardLayout";
import type { Metadata } from "next";
import { roleMetadataMap } from "@/lib/routeMetadata";

export const metadata: Metadata = roleMetadataMap.student;

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <NoSidebarDashboardLayout bleed>{children}</NoSidebarDashboardLayout>;
}
