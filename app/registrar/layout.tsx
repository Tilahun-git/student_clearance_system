import NoSidebarDashboardLayout from "@/components/layout/NoSidebarDashboardLayout";
import type { Metadata } from "next";
import { roleMetadataMap } from "@/lib/routeMetadata";

export const metadata: Metadata = roleMetadataMap.registrar;

export default function RegistrarLayout({ children }: { children: React.ReactNode }) {
  return <NoSidebarDashboardLayout bleed>{children}</NoSidebarDashboardLayout>;
}
