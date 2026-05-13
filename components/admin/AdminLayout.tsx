"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { tabs, TabKey,} from "./tabConfig";

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [open, setOpen] = useState(true);
  const currentTab = tabs.find( (tab) => tab.key === activeTab);
  return (
    <div className=" min-h-screen flex bg-slate-100 text-slate-900">
      <AdminSidebar
        open={open}
        setOpen={setOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <main className={`flex-1 transition-all duration-300 ${open ? "ml-64" : "ml-20"} `}>
        <div className="p-6">
          <AdminHeader activeTab={activeTab} />
          <div className=" rounded-2xl transition-all">
            {currentTab?.component}
          </div>
        </div>
      </main>
    </div>
  );
}