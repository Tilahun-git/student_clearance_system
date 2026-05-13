import Footer from "@/components/layout/Footer";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100">

      <main className="w-full mx-auto py-2">
        {children}
      </main>
      <Footer/>
    </div>
  );
}