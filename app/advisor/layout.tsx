import NoSidebarDashboardLayout from "@/components/layout/NoSidebarDashboardLayout";
import type { Metadata } from "next";
import { roleMetadataMap } from "@/lib/routeMetadata";

export const metadata: Metadata = roleMetadataMap.advisor;

export default function AdvisorLayout({ children }: { children: React.ReactNode }) {
  return <NoSidebarDashboardLayout>{children}</NoSidebarDashboardLayout>;
}
