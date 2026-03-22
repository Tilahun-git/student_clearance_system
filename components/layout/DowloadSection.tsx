import Link from "next/link";

const DownloadSection = () => {
  return (
    <div className="w-full px-6 py-6 bg-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
      
      <h1 className="text-xl md:text-2xl font-bold text-gray-800">
        Clearance Progress
      </h1>
      <Link
        href="/student/clearance/request"
        className="
          inline-flex items-center justify-center
          px-6 py-3
          bg-gray-400 hover:bg-slate-700
          text-black font-semibold
          rounded-xl
          shadow-md hover:shadow-lg
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
        "
      >
        Request Clearance
      </Link>

      <Link
        href="/dashboard"
        className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-3 rounded-full shadow-md transition-all duration-300"
      >
        Download
      </Link>
    </div>
  );
};

export default DownloadSection;