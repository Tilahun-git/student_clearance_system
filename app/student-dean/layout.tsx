import NoSidebarDashboardLayout from "@/components/layout/NoSidebarDashboardLayout";
import type { Metadata } from "next";
import { roleMetadataMap } from "@/lib/routeMetadata";

export const metadata: Metadata = roleMetadataMap["student-dean"];

export default function StudentDeanLayout({ children }: { children: React.ReactNode }) {
  return <NoSidebarDashboardLayout>{children}</NoSidebarDashboardLayout>;
}
