import DashBoardNavbar from "@/components/layout/DashBoardNavbar";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100">
      <DashBoardNavbar />
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-2">
        {children}
      </main>
      <Footer/>
    </div>
  );
}