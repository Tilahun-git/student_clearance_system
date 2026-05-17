"use client";

import { ChevronLeft, ChevronRight, X, ClipboardCheck, BookOpen } from "lucide-react";

export type LibraryTab = "approvals" | "borrowed";

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  activeTab: LibraryTab;
  setActiveTab: (t: LibraryTab) => void;
};

function NavContent({
  activeTab,
  setActiveTab,
  onSelect,
}: Omit<Props, "open" | "setOpen"> & { onSelect: () => void }) {
  return (
    <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
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

      <button
        onClick={() => { setActiveTab("borrowed"); onSelect(); }}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
          text-sm font-medium transition-all duration-150
          ${activeTab === "borrowed"
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"}
        `}
      >
        <BookOpen size={17} className="shrink-0" />
        <span className="truncate">Borrowed Students</span>
      </button>
    </nav>
  );
}

export default function LibrarySidebar({ open, setOpen, activeTab, setActiveTab }: Props) {
  function handleSelect() {
    if (typeof window !== "undefined" && window.innerWidth < 768) setOpen(false);
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
          <NavContent activeTab={activeTab} setActiveTab={setActiveTab} onSelect={handleSelect} />
        ) : (
          <nav className="flex-1 p-2 space-y-0.5">
            {(["approvals", "borrowed"] as LibraryTab[]).map((tab) => {
              const Icon = tab === "approvals" ? ClipboardCheck : BookOpen;
              const label = tab === "approvals" ? "Clearance Requests" : "Borrowed Students";
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  title={label}
                  className={`
                    relative w-full flex items-center justify-center py-2.5 rounded-xl
                    transition-all duration-150 group
                    ${activeTab === tab
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"}
                  `}
                >
                  <Icon size={17} />
                  <span className="absolute left-full ml-3 px-2.5 py-1.5 text-xs font-medium bg-slate-800 text-white rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                    {label}
                  </span>
                </button>
              );
            })}
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
        <NavContent activeTab={activeTab} setActiveTab={setActiveTab} onSelect={handleSelect} />
      </aside>
    </>
  );
}
