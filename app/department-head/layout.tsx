import DashBoardNavbar from "@/components/layout/DashBoardNavbar";
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";
import { roleMetadataMap } from "@/lib/routeMetadata";
import { requireRole } from "@/lib/serverAuth";

export const metadata: Metadata = roleMetadataMap["department-head"];

export default async function DepartmentHeadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("DEPARTMENT_HEAD");

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      <DashBoardNavbar />
      <div className="flex flex-1 overflow-hidden">
        {children}
      </div>
      <Footer />
    </div>
  );
}
