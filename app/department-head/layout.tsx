import DashBoardNavbar from "@/components/layout/DashBoardNavbar";
import Footer from "@/components/layout/Footer";
import { requireRole } from "@/lib/serverAuth";

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
