"use client";

type Props = {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  open: boolean;
  onClick: () => void;
};

export default function SidebarItem({
  icon,
  label,
  active,
  open,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
        transition-all duration-200 relative
        ${
          active
            ? "bg-indigo-50 text-indigo-700 font-medium"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        } `} >
      {active && (
        <span className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-full" />
      )}
      <div className="flex items-center justify-center w-6">
        {icon}
      </div>

      {open && (
        <span className="text-sm truncate">
          {label}
        </span>
      )}
    </button>
  );
}