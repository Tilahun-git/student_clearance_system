import "../globals.css";
import DashBoardNavbar from "@/components/layout/DashBoardNavbar";
import Footer from "@/components/layout/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50">
        <main className="flex-1">
          {children}
        </main>

        <Footer />

      </body>
    </html>
  );
}