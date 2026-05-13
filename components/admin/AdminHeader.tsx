"use client";

import Link from "next/link";
import { PlusCircle } from "lucide-react";
import {tabs,TabKey,} from "./tabConfig";

type Props = {
  activeTab: TabKey;
};

export default function AdminHeader({
  activeTab,
}: Props) {

  const currentTab = tabs.find(
    (tab) => tab.key === activeTab
  );

  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          {currentTab?.label}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          University management system
          administration panel
        </p>
      </div>

      {currentTab?.action && (
        <Link
          href={currentTab.action.href}
          className={`
            flex items-center gap-2
            text-white px-4 py-2 rounded-xl
            text-sm font-medium shadow-sm transition
            ${currentTab.action.color}
          `}
        >
          <PlusCircle size={16} />
          {currentTab.action.label}
        </Link>
      )}
    </div>
  );
}