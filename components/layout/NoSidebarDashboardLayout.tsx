import DashBoardNavbar from "@/components/layout/DashBoardNavbar";
import Footer from "@/components/layout/Footer";

/** Matches navbar width — use for Header inner content and page bodies */
export const DASHBOARD_CONTAINER_CLASS =
  "w-full max-w-screen-2xl mx-auto px-4 sm:px-5 lg:px-6";

type Props = {
  children: React.ReactNode;
  /** When true, children are not wrapped (e.g. full-width Header + aligned sections) */
  bleed?: boolean;
};

export default function NoSidebarDashboardLayout({
  children,
  bleed = false,
}: Props) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <DashBoardNavbar />
      <main className="flex-1 w-full py-5 sm:py-6">
        {bleed ? children : (
          <div className={DASHBOARD_CONTAINER_CLASS}>{children}</div>
        )}
      </main>
      <Footer />
    </div>
  );
}
