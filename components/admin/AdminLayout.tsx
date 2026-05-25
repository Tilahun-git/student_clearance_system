"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { tabs, TabKey } from "./tabConfig";

function isValidTab(value: string | null): value is TabKey {
  return value !== null && tabs.some((tab) => tab.key === value);
}

export default function AdminLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = useMemo<TabKey>(() => {
    const tab = searchParams.get("tab");
    return isValidTab(tab) ? tab : "dashboard";
  }, [searchParams]);

  const setActiveTab = useCallback(
    (tab: TabKey) => {
      const currentTab = searchParams.get("tab") ?? "dashboard";

      if (currentTab === tab) {
        return;
      }

      const nextParams = new URLSearchParams(searchParams.toString());

      if (tab === "dashboard") {
        nextParams.delete("tab");
      } else {
        nextParams.set("tab", tab);
      }

      const nextUrl = nextParams.toString()
        ? `${pathname}?${nextParams.toString()}`
        : pathname;

      router.push(nextUrl, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : true,
  );
  const activeTabConfig = tabs.find((t) => t.key === activeTab);

  return (
    <div className="flex flex-1 overflow-hidden">
      <AdminSidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
        <AdminHeader
          activeTab={activeTab}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
          {activeTabConfig?.component}
        </div>
      </main>
    </div>
  );
}
