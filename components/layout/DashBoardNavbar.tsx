import Image from "next/image";
import logo from "../../public/wldu_logo.jpg";
import ProfileSection from "./ProfileSection";
import NotificationBell from "../UI/NotificationBell";

const DashBoardNavbar = () => {
  return (
    <nav className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-5 lg:px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2.5 shrink-0">
          <Image
            src={logo}
            alt="University Logo"
            width={34}
            height={34}
            className="rounded-lg"
          />
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-800">WDU Clearance</span>
            <span className="text-[10px] text-slate-400 tracking-wide">Student clearance system</span>
          </div>
        </div>

        {/* Center — system title */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none hidden md:block">
          <p className="text-xs font-semibold tracking-widest uppercase text-indigo-600">
            WDU Student Clearance System
          </p>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-3 shrink-0">
          <NotificationBell />
          <div className="w-px h-5 bg-slate-200" />
          <ProfileSection />
        </div>
      </div>
    </nav>
  );
};

export default DashBoardNavbar;
