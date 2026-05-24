import NoSidebarDashboardLayout from "@/components/layout/NoSidebarDashboardLayout";
import type { Metadata } from "next";
import { roleMetadataMap } from "@/lib/routeMetadata";
import { requireRole } from "@/lib/serverAuth";

export const metadata: Metadata = roleMetadataMap["student-dean"];

export default async function StudentDeanLayout({ children }: { children: React.ReactNode }) {
  await requireRole("STUDENT_DEAN");

  return <NoSidebarDashboardLayout>{children}</NoSidebarDashboardLayout>;
}
