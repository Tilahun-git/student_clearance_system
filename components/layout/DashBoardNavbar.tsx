import logo from "../../public/wldu_logo.jpg";
import ProfileSection from "@/components/layout/ProfileSection";
import NotificationBell from "@/components/UI/NotificationBell";

const DashBoardNavbar = () => {
  return (
    <nav className="flex justify-between items-center w-full sticky top-0 z-30 
      bg-white/80 dark:bg-slate-900/40 backdrop-blur-lg 
      shadow-lg px-8 py-4 rounded-b-2xl">
      <div>
        <img
          src={logo.src}
          alt="University Logo"
          width={50}
          height={50}
          className="rounded-lg shadow-md"
        />
      </div>
      <h1 className="text-lg md:text-xl font-bold tracking-wide text-gray-800 dark:text-white">
        WDU STUDENT CLEARANCE SYSTEM
      </h1>
      <NotificationBell/>
      <ProfileSection />
    </nav>
  );
};

export default DashBoardNavbar;