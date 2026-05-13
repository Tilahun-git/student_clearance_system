"use client";

import logo from "../../public/wldu_logo.jpg";
import { Menu } from "lucide-react";
import SidebarItem from "./SidebarItem";
import { tabs, TabKey } from "./tabConfig";
type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
  activeTab: TabKey;
  setActiveTab: (
    tab: TabKey
  ) => void;
};

export default function AdminSidebar({
  open,
  setOpen,
  activeTab,
  setActiveTab,
}: Props) {
  return (
    <aside
      className={`h-screen fixed left-0 top-0 z-50
      bg-white border-r border-slate-200 shadow-sm
      transition-all duration-300
      ${open ? "w-64" : "w-20"}`}
    >
      <div className="h-16 flex items-center justify-between px-3 border-b border-slate-200">
        {open && (
           <img
                src={logo.src}
                alt="University Logo"
                className="w-10 h-10 object-contain rounded-lg"
              />
        )}
        <button
          onClick={() =>
            setOpen(!open)
          }
          className="p-2 rounded-lg hover:bg-slate-100 transition"
        >
          <Menu size={18} />
        </button>
      </div>

      <nav className="p-3 space-y-1 text-sm">

        {tabs.map((tab) => {

          const Icon = tab.icon;

          return (
            <SidebarItem
              key={tab.key}
              icon={<Icon size={18} />}
              label={tab.label}
              active={
                activeTab === tab.key
              }
              open={open}
              onClick={() =>
                setActiveTab(tab.key)
              }
            />
          );
        })}

      </nav>
    </aside>
  );
}