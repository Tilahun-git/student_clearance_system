import "../globals.css";
import DashBoardNavbar from "@/components/layout/DashBoardNavbar";
import Footer from "@/components/layout/Footer";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
           
      <DashBoardNavbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}