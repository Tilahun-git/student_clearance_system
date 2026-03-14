'use client'
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import bg from "../public/wldu_bg.jpg"
import logo from "../public/wldu_logo.jpg"

export default function Home() {
  const router = useRouter()

  const handleLoginRedirect = () => {
    router.push("/auth/login") 
  }

  return (
    <div className="relative min-h-screen w-screen">
      {/* <Image
        src={bg}
        alt="University Head Office"
        fill
        className="object-cover"
      /> */}
      <div className="absolute inset-0 bg-black/50 -z-10"></div>

      <nav className="sticky top-0 z-30 bg-white/20 dark:bg-slate-900/30 backdrop-blur-md shadow-md px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Image
            src={logo}
            alt="University Logo"
            width={50}
            height={50}
            className="rounded-md"
          />
        </div>
          <button
            onClick={handleLoginRedirect}
            aria-label="Go to login page"
            className="bg-yellow-500 text-black px-4 py-2 rounded-md font-semibold hover:bg-yellow-400 transition"
          >
            Login
          </button>
       
      </nav>

      {/* Main content */}
      <main className="relative z-20 flex flex-col items-center justify-center h-[calc(100vh-80px)] px-6 text-center">
        <h1 className="text-yellow-400 text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 drop-shadow-lg">
          Student Clearance System
        </h1>

        <h2 className="text-white text-4xl sm:text-5xl font-extrabold mb-4 drop-shadow-lg">
          Welcome to Woldia University
        </h2>

        <p className="text-white/90 text-lg sm:text-xl max-w-2xl drop-shadow-md">
          The Student Clearance System allows graduating students and university departments
          to complete clearance electronically.
        </p>

        <div className="mt-10 flex gap-4 flex-wrap justify-center">
          <Link
            href="/about"
            className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-black transition"
          >
            Show More
          </Link>
        </div>
      </main>
    </div>
  )
}