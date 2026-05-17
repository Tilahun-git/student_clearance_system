import DashBoardNavbar from "@/components/layout/DashBoardNavbar";
import Footer from "@/components/layout/Footer";

export default function DepartmentHeadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      <DashBoardNavbar />
      <div className="flex flex-1 overflow-hidden">
        {children}
      </div>
      <Footer/>
    </div>
  );
}
