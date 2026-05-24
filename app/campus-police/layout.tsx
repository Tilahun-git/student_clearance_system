import NoSidebarDashboardLayout from "@/components/layout/NoSidebarDashboardLayout";
import type { Metadata } from "next";
import { roleMetadataMap } from "@/lib/routeMetadata";

export const metadata: Metadata = roleMetadataMap["campus-police"];

export default function CampusPoliceLayout({ children }: { children: React.ReactNode }) {
  return <NoSidebarDashboardLayout>{children}</NoSidebarDashboardLayout>;
}
