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
    // On mobile, close the drawer after selecting a tab
    if (window.innerWidth < 768) setOpen(false);
  }

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/*
        Desktop: sticky sidebar — sits in the flex row below the navbar,
        stretches to fill the remaining height naturally. No top offset needed.

        Mobile: fixed overlay drawer that slides in from the left.
      */}
      <aside
        className={`
          shrink-0 sticky top-0 self-start h-full
          bg-white border-r border-slate-200
          flex flex-col z-40
          transition-all duration-300 ease-in-out

          hidden md:flex
          ${open ? "w-56" : "w-14"}
        `}
      >
        {/* Toggle button */}
        <div className={`flex items-center border-b border-slate-100 px-2 py-3 ${open ? "justify-end" : "justify-center"}`}>
          <button
            onClick={() => setOpen(!open)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title={open ? "Collapse sidebar" : "Expand sidebar"}
          >
            {open ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <SidebarItem
                key={tab.key}
                icon={<Icon size={17} />}
                label={tab.label}
                active={activeTab === tab.key}
                open={open}
                onClick={() => handleTabClick(tab.key)}
              />
            );
          })}
        </nav>
      </aside>

      {/* Mobile: fixed overlay drawer */}
      <aside
        className={`
          fixed left-0 top-0 bottom-0 z-40
          bg-white border-r border-slate-200
          flex flex-col w-64
          transition-transform duration-300 ease-in-out
          md:hidden
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Close button row */}
        <div className="flex items-center justify-end border-b border-slate-100 px-2 py-3">
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Close sidebar"
          >
            <X size={15} />
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <SidebarItem
                key={tab.key}
                icon={<Icon size={17} />}
                label={tab.label}
                active={activeTab === tab.key}
                open={true}
                onClick={() => handleTabClick(tab.key)}
              />
            );
          })}
        </nav>
      </aside>
    </>
  );
}
