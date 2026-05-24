import NoSidebarDashboardLayout from "@/components/layout/NoSidebarDashboardLayout";
import type { Metadata } from "next";
import { roleMetadataMap } from "@/lib/routeMetadata";

export const metadata: Metadata = roleMetadataMap.cafeteria;

export default function CafeteriaLayout({ children }: { children: React.ReactNode }) {
  return <NoSidebarDashboardLayout>{children}</NoSidebarDashboardLayout>;
}
