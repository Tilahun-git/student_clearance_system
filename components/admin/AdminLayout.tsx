"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { tabs, TabKey } from "./tabConfig";

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== "undefined" ? window.innerWidth >= 768 : true
  );
  const activeTabConfig = tabs.find((t) => t.key === activeTab);
  return (
    <div className="flex flex-1 overflow-hidden">
      <AdminSidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <main
        className="flex-1 min-h-0 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
        <AdminHeader activeTab={activeTab} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
          {activeTabConfig?.component}
        </div>
      </main>
    </div>
  );
}
