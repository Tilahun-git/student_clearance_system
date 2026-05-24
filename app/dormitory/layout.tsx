import NoSidebarDashboardLayout from "@/components/layout/NoSidebarDashboardLayout";
import type { Metadata } from "next";
import { roleMetadataMap } from "@/lib/routeMetadata";
import { requireRole } from "@/lib/serverAuth";

export const metadata: Metadata = roleMetadataMap.dormitory;

export default async function DormitoryLayout({ children }: { children: React.ReactNode }) {
  await requireRole("DORMITORY");

  return <NoSidebarDashboardLayout>{children}</NoSidebarDashboardLayout>;
}
