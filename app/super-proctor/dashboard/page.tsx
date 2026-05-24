"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import SuperProctorSidebar, { SuperProctorTab } from "@/components/super-proctor/SuperProctorSidebar";
import AssignProctorSection from "@/components/super-proctor/AssignProctorSection";
import ManageProctorsSection from "@/components/super-proctor/ManageProctorsSection";

const PAGE_TITLES: Record<SuperProctorTab, string> = {
  "assign-proctor":  "Assign Proctors",
  "manage-proctors": "Manage Proctors",
};

export default function SuperProctorPage() {
  const [activeTab, setActiveTab]     = useState<SuperProctorTab>("assign-proctor");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (window.innerWidth >= 768) setSidebarOpen(true);
  }, []);

  return (
    <div className="flex flex-1 overflow-hidden">
      <SuperProctorSidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 min-h-0 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
        {/* Header bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition md:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Super Proctor</span>
            <span className="text-xs text-slate-300">/</span>
            <span className="text-xs font-semibold text-slate-700">
              {PAGE_TITLES[activeTab]}
            </span>
          </div>
        </div>

        {/* Page body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
          {activeTab === "assign-proctor"  && <AssignProctorSection />}
          {activeTab === "manage-proctors" && <ManageProctorsSection />}
        </div>
      </main>
    </div>
  );
}
