import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import Providers from "./providers";
import { Toaster } from "react-hot-toast";
import SocketProvider from "@/components/layout/SocketProvider";
import RouteTitle from "@/components/layout/RouteTitle";
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "300", "500", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: {
    default: "Student Clearance System",
    template: "%s | Student Clearance System",
  },
  description: "A modern student clearance management system for Woldia University.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.className}>
      <body>
        <Providers>
          <SocketProvider>
            <RouteTitle />
            {children}
          </SocketProvider>
        </Providers>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 1800,
            style: {
              borderRadius: "10px",
              background: "#1f2937",
              color: "#fff",
            },
            success: {
              duration: 1600,
            },
            error: {
              duration: 2600,
            },
          }}
        />
      </body>
    </html>
  );
}