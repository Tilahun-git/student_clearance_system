import NoSidebarDashboardLayout from "@/components/layout/NoSidebarDashboardLayout";
import type { Metadata } from "next";
import { roleMetadataMap } from "@/lib/routeMetadata";
import { requireRole } from "@/lib/serverAuth";

export const metadata: Metadata = roleMetadataMap["school-dean"];

export default async function SchoolDeanLayout({ children }: { children: React.ReactNode }) {
  await requireRole("SCHOOL_DEAN");

  return <NoSidebarDashboardLayout>{children}</NoSidebarDashboardLayout>;
}
