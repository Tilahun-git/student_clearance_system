"use client";

type Props = {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  open: boolean;
  onClick: () => void;
};
export default function SidebarItem({ icon, label, active, open, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      title={!open ? label : undefined}
      className={`
        relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
        transition-all duration-150 group
        ${
          active
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        }`}>
      <div className="flex items-center justify-center w-5 shrink-0">{icon}</div>
      {open && <span className="text-sm font-medium truncate">{label}</span>}
      {!open && (
        <span
          className="
            absolute left-full ml-3 px-2.5 py-1.5 text-xs font-medium
            bg-slate-800 text-white rounded-lg whitespace-nowrap
            opacity-0 group-hover:opacity-100 pointer-events-none
            transition-opacity duration-150 z-50 shadow-lg
          ">
          {label}
        </span>
      )}
    </button>
  );
}
