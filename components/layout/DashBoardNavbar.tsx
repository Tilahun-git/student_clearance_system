import logo from "../../public/wldu_logo.jpg";
import ProfileSection from "@/components/layout/ProfileSection";
import NotificationBell from "@/components/UI/NotificationBell";

const DashBoardNavbar = () => {
  return (
    <nav
      className="sticky top-0 z-40 w-full 
      bg-white/70 backdrop-blur-md 
      border-b border-slate-200 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
           <div className="flex items-center justify-center w-11 h-11">
              <img
                src={logo.src}
                alt="University Logo"
                className="w-10 h-10 object-contain rounded-lg"
              />
            </div>
            <div className="hidden md:flex flex-col justify-center leading-snug">
              <h1 className="text-sm font-semibold text-slate-800">
                WDU Clearance
              </h1>
              <p className="text-xs text-slate-500">
                Student Portal
              </p>
            </div>
          </div>
        <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <h2 className="text-xs md:text-sm font-semibold tracking-wider uppercase
                       bg-linear-to-r from-indigo-600 to-blue-600 
                       bg-clip-text text-transparent">
            WDU Student Clearance System
          </h2>
          <p className="hidden md:block text-[10px] text-slate-400 tracking-wide">
            Student Clearance Platform
          </p>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <div className="w-px h-6 bg-slate-200" />
          <ProfileSection />
        </div>
      </div>
    </nav>
  );
};

export default DashBoardNavbar;