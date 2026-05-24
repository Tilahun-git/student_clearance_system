import NoSidebarDashboardLayout from "@/components/layout/NoSidebarDashboardLayout";
import type { Metadata } from "next";
import { roleMetadataMap } from "@/lib/routeMetadata";
import { requireRole } from "@/lib/serverAuth";

export const metadata: Metadata = roleMetadataMap.student;

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requireRole("STUDENT");

  return <NoSidebarDashboardLayout bleed>{children}</NoSidebarDashboardLayout>;
}
