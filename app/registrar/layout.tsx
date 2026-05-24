import NoSidebarDashboardLayout from "@/components/layout/NoSidebarDashboardLayout";
import type { Metadata } from "next";
import { roleMetadataMap } from "@/lib/routeMetadata";
import { requireRole } from "@/lib/serverAuth";

export const metadata: Metadata = roleMetadataMap.registrar;

export default async function RegistrarLayout({ children }: { children: React.ReactNode }) {
  await requireRole("REGISTRAR");

  return <NoSidebarDashboardLayout bleed>{children}</NoSidebarDashboardLayout>;
}
