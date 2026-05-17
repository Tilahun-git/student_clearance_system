"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import RoleApprovalPage from "@/components/layout/RoleApprovalPage";
import BorrowedStudents from "@/components/library/BorrowedStudents";
import LibrarySidebar, { LibraryTab } from "@/components/library/LibrarySidebar";

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<LibraryTab>("approvals");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Default expanded on desktop after mount
  useEffect(() => {
    if (window.innerWidth >= 768) setSidebarOpen(true);
  }, []);

  const pageTitle = activeTab === "approvals" ? "Clearance Requests" : "Borrowed Students";

  return (
    <div className="flex flex-1 overflow-hidden">
      <LibrarySidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 min-h-0 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
        {/* Header bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center gap-3">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition md:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Library</span>
            <span className="text-xs text-slate-300">/</span>
            <span className="text-xs font-semibold text-slate-700">{pageTitle}</span>
          </div>
        </div>

        {/* Page body — scrollable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
          {activeTab === "approvals" && <RoleApprovalPage role="LIBRARY" />}
          {activeTab === "borrowed"  && <BorrowedStudents />}
        </div>
      </main>
    </div>
  );
}
