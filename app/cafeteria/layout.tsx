import NoSidebarDashboardLayout from "@/components/layout/NoSidebarDashboardLayout";
import type { Metadata } from "next";
import { roleMetadataMap } from "@/lib/routeMetadata";
import { requireRole } from "@/lib/serverAuth";

export const metadata: Metadata = roleMetadataMap.cafeteria;

export default async function CafeteriaLayout({ children }: { children: React.ReactNode }) {
  await requireRole("CAFETERIA");

  return <NoSidebarDashboardLayout>{children}</NoSidebarDashboardLayout>;
}
