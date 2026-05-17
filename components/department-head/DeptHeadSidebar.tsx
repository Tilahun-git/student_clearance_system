"use client";

import { ChevronLeft, ChevronRight, X, ClipboardCheck, Users, ChevronDown } from "lucide-react";

export type DeptHeadTab = "approvals" | "assign-advisor";

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  activeTab: DeptHeadTab;
  setActiveTab: (t: DeptHeadTab) => void;
  selectedSection: string;
  setSelectedSection: (s: string) => void;
  advisorMenuOpen: boolean;
  setAdvisorMenuOpen: (v: boolean) => void;
};

const SECTIONS = ["A", "B", "C"];

function NavContent({
  activeTab,
  setActiveTab,
  selectedSection,
  setSelectedSection,
  advisorMenuOpen,
  setAdvisorMenuOpen,
  onSelect,
}: Omit<Props, "open" | "setOpen"> & { onSelect: () => void }) {
  return (
    <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
      {/* Clearance Requests */}
      <button
        onClick={() => { setActiveTab("approvals"); onSelect(); }}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
          text-sm font-medium transition-all duration-150
          ${activeTab === "approvals"
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"}
        `}
      >
        <ClipboardCheck size={17} className="shrink-0" />
        <span className="truncate">Clearance Requests</span>
      </button>

      {/* Assign Advisors accordion */}
      <div>
        <button
          onClick={() => setAdvisorMenuOpen(!advisorMenuOpen)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all"
        >
          <div className="flex items-center gap-3">
            <Users size={17} className="shrink-0" />
            <span className="truncate">Assign Advisors</span>
          </div>
          <ChevronDown
            size={14}
            className={`shrink-0 transition-transform duration-200 ${advisorMenuOpen ? "rotate-180" : ""}`}
          />
        </button>

        {advisorMenuOpen && (
          <div className="ml-4 mt-1 space-y-0.5 border-l border-slate-200 pl-3">
            {SECTIONS.map((section) => (
              <button
                key={section}
                onClick={() => {
                  setSelectedSection(section);
                  setActiveTab("assign-advisor");
                  onSelect();
                }}
                className={`
                  w-full text-left px-3 py-2 rounded-lg text-sm transition-all
                  ${activeTab === "assign-advisor" && selectedSection === section
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"}
                `}
              >
                Section {section}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

export default function DeptHeadSidebar(props: Props) {
  const { open, setOpen } = props;

  function handleSelect() {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setOpen(false);
    }
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

      {/* Desktop: sticky in-flow sidebar */}
      <aside
        className={`
          shrink-0 sticky top-0 self-start h-full
          bg-white border-r border-slate-200
          flex-col z-40
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

        {open ? (
          <NavContent {...props} onSelect={handleSelect} />
        ) : (
          /* Collapsed: show icon-only items with tooltips */
          <nav className="flex-1 p-2 space-y-0.5">
            <button
              onClick={() => { props.setActiveTab("approvals"); }}
              title="Clearance Requests"
              className={`
                relative w-full flex items-center justify-center py-2.5 rounded-xl
                transition-all duration-150 group
                ${props.activeTab === "approvals"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"}
              `}
            >
              <ClipboardCheck size={17} />
              <span className="absolute left-full ml-3 px-2.5 py-1.5 text-xs font-medium bg-slate-800 text-white rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                Clearance Requests
              </span>
            </button>
            <button
              onClick={() => { props.setAdvisorMenuOpen(true); setOpen(true); }}
              title="Assign Advisors"
              className="relative w-full flex items-center justify-center py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all group"
            >
              <Users size={17} />
              <span className="absolute left-full ml-3 px-2.5 py-1.5 text-xs font-medium bg-slate-800 text-white rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                Assign Advisors
              </span>
            </button>
          </nav>
        )}
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
        <div className="flex items-center justify-end border-b border-slate-100 px-2 py-3">
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Close sidebar"
          >
            <X size={15} />
          </button>
        </div>
        <NavContent {...props} onSelect={handleSelect} />
      </aside>
    </>
  );
}
