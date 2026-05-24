import Footer from "@/components/layout/Footer";
import "../globals.css";
import DashBoardNavbar from "@/components/layout/DashBoardNavbar";
import type { Metadata } from "next";
import { roleMetadataMap } from "@/lib/routeMetadata";

export const metadata: Metadata = roleMetadataMap.admin;

export default function AdminRootLayout({
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
