import DashBoardNavbar from "@/components/layout/DashBoardNavbar";
import Footer from "@/components/layout/Footer";
import { requireRole } from "@/lib/serverAuth";

export default async function LibraryLayout({ children }: { children: React.ReactNode }) {
  await requireRole("LIBRARY");

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
