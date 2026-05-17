"use client";

import { Menu } from "lucide-react";
import { tabs, TabKey } from "./tabConfig";

type Props = {
  activeTab: TabKey;
  onMenuClick: () => void;
};

export default function AdminHeader({ activeTab, onMenuClick }: Props) {
  const currentTab = tabs.find((tab) => tab.key === activeTab);

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center gap-3">
      <button
        onClick={onMenuClick}
        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition md:hidden"
        aria-label="Open sidebar"
      >
        <Menu size={18} />
      </button>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">Admin</span>
        <span className="text-xs text-slate-300">/</span>
        <span className="text-xs font-semibold text-slate-700">
          {currentTab?.label ?? "Dashboard"}
        </span>
      </div>
    </div>
  );
}
