import NoSidebarDashboardLayout from "@/components/layout/NoSidebarDashboardLayout";
import type { Metadata } from "next";
import { roleMetadataMap } from "@/lib/routeMetadata";
import { requireRole } from "@/lib/serverAuth";

export const metadata: Metadata = roleMetadataMap.advisor;

export default async function AdvisorLayout({ children }: { children: React.ReactNode }) {
  await requireRole("ADVISOR");

  return <NoSidebarDashboardLayout>{children}</NoSidebarDashboardLayout>;
}
