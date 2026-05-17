"use client";

import Link from "next/link";
import { Plus, LucideIcon } from "lucide-react";

type Action = {
  href: string;
  label: string;
  color: string;
};

type Props = {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  action?: Action;
  badge?: React.ReactNode;
};

export default function PageHeader({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  action,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {action && (
          <Link
            href={action.href}
            className={`inline-flex items-center gap-1.5 text-white text-xs font-medium px-3.5 py-2 rounded-xl shadow-sm transition ${action.color}`}
          >
            <Plus size={13} />
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}
