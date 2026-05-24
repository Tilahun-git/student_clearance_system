import NoSidebarDashboardLayout from "@/components/layout/NoSidebarDashboardLayout";
import type { Metadata } from "next";
import { roleMetadataMap } from "@/lib/routeMetadata";
import { requireRole } from "@/lib/serverAuth";

export const metadata: Metadata = roleMetadataMap["campus-police"];

export default async function CampusPoliceLayout({ children }: { children: React.ReactNode }) {
  await requireRole("CAMPUS_POLICE");

  return <NoSidebarDashboardLayout>{children}</NoSidebarDashboardLayout>;
}
