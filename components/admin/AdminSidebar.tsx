"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import SidebarItem from "./SidebarItem";
import { tabs, TabKey } from "./tabConfig";

type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
};

export default function AdminSidebar({
  open,
  setOpen,
  activeTab,
  setActiveTab,
}: Props) {
  function handleTabClick(tab: TabKey) {
    setActiveTab(tab);

    if (window.innerWidth < 768) {
      setOpen(false);
    }
  }
  function renderTabs(sidebarOpen: boolean) {
    return tabs.map((tab) => {
      const Icon = tab.icon;

      return (
        <SidebarItem
          key={tab.key}
          icon={<Icon size={18} />}
          label={tab.label}
          active={activeTab === tab.key}
          open={sidebarOpen}
          onClick={() => handleTabClick(tab.key)}
        />
      );
    });
  }

  return (
    <>
      <div
        className={`
          fixed inset-0 z-30
          bg-black/40 backdrop-blur-sm
          md:hidden
          transition-opacity duration-300 ease-in-out

          ${
            open
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }
        `}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={`
          hidden md:flex
          sticky top-0 self-start
          h-screen shrink-0
          flex-col z-40

          bg-white border-r border-slate-200
          shadow-sm

          transition-all duration-300 ease-in-out

          ${open ? "w-56" : "w-16"}
        `}
      >
        <div
          className={`
            flex items-center
            border-b border-slate-100
            px-2 py-3

            ${open ? "justify-end" : "justify-center"}
          `}
        >
          <button
            onClick={() => setOpen(!open)}
            className="
              p-1.5 rounded-lg
              text-slate-400
              hover:text-slate-700
              hover:bg-slate-100
              transition-colors
            "
            title={
              open
                ? "Collapse sidebar"
                : "Expand sidebar"
            }
          >
            {open ? (
              <ChevronLeft size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {renderTabs(open)}
        </nav>
      </aside>
      <aside
        className={`
          fixed left-0 top-0 bottom-0
          z-40 w-64

          flex flex-col

          bg-white border-r border-slate-200
          shadow-xl
          transition-transform duration-300 ease-in-out
          md:hidden
          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        <div
          className="
            flex items-center justify-end
            border-b border-slate-100
            px-3 py-3
          "
        >
          <button
            onClick={() => setOpen(false)}
            className="
              p-1.5 rounded-lg
              text-slate-400
              hover:text-slate-700
              hover:bg-slate-100
              transition-colors
            "
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {renderTabs(true)}
        </nav>
      </aside>
    </>
  );
}