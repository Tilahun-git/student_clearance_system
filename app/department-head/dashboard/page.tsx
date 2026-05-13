"use client";

import { useState } from "react";
import { ClipboardCheck,Users,ChevronDown,ChevronRight,} from "lucide-react";
import RoleApprovalPage from "@/components/layout/RoleApprovalPage";
import AssignAdvisorSection from "@/components/department/AssignAdvisorSection";
import DashBoardNavbar from "@/components/layout/DashBoardNavbar";
import Header from "@/components/layout/Header";

type Tab = "approvals" | "assign-advisor";

export default function DepartmentHeadPage() {
  const [activeTab, setActiveTab] = useState<Tab>("approvals");
  const [openAdvisorMenu, setOpenAdvisorMenu] = useState(false);
  const [selectedSection, setSelectedSection] =useState("Section A");

  return (
      <div className="min-h-screen  bg-slate-100">
        <DashBoardNavbar/>
              {/* <Header/> */}
          <div className="min-h-screen flex bg-slate-100">
            <aside className="w-72 bg-white border-r border-slate-200 shadow-sm">

            <div className="p-5 border-b">
              <h2 className="text-xl font-bold text-slate-800">
                Department Head
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                 Manage approvals and advisors
              </p>
            </div>
        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveTab("approvals")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activeTab === "approvals"
                ? "bg-indigo-100 text-indigo-700"
                : "hover:bg-slate-100 text-slate-700"
            }`}>
            <ClipboardCheck size={18} />
            Clearance Requests
          </button>
          <div>
            <button onClick={() => setOpenAdvisorMenu(!openAdvisorMenu)
              }
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-100 text-slate-700">
              <div className="flex items-center gap-3">
                <Users size={18} />
                Assign Advisors
              </div>
              {openAdvisorMenu ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
            {openAdvisorMenu && (
              <div className="ml-6 mt-2 space-y-1">
                {["A", "B", "C"].map(
                  (section) => (
                    <button
                      key={section}
                      onClick={() => {
                        setSelectedSection(section);
                        setActiveTab("assign-advisor");
                      }}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                        selectedSection === section
                          ? "bg-indigo-50 text-indigo-700"
                          : "hover:bg-slate-100 text-slate-600"
                      }`}>
                      {`Section ${section}`}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        {activeTab === "approvals" && (
          <RoleApprovalPage role="DEPARTMENT_HEAD"/>
        )}
        {activeTab === "assign-advisor" && (
          <AssignAdvisorSection
            section={selectedSection}/>
        )}
      </main>
    </div>
    </div>
  );
}