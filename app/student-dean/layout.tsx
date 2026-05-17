import DashBoardNavbar from "@/components/layout/DashBoardNavbar";
import Footer from "@/components/layout/Footer";

export default function StudentDeanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <DashBoardNavbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-5 py-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}
