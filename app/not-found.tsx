import Link from "next/link";

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-6 text-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-lg">
        <h1 className="mb-4 text-7xl font-extrabold text-blue-600">
          404
        </h1>
        <h2 className="mb-3 text-2xl font-semibold text-gray-800">
          Page Not Found
        </h2>
        <p className="mb-8 text-sm leading-relaxed text-gray-500">
          The page you are looking for does not exist or may have been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;