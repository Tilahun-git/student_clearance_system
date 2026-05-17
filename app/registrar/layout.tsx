import DashBoardNavbar from "@/components/layout/DashBoardNavbar";
import Footer from "@/components/layout/Footer";

export default function RegistrarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <DashBoardNavbar />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
