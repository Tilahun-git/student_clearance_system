"use client"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import logo from "../public/wldu_logo.jpg"

export default function Home() {
  const router = useRouter()

  const handleLoginRedirect = () => {
    router.push("/auth/login") 
  }

  return (
    <div className="min-h-screen w-screen bg-white text-slate-800">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-sm px-6 py-4 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Image
            src={logo}
            alt="University Logo"
            width={45}
            height={45}
            className="rounded-md"
          />
          <span className="font-semibold text-lg text-slate-700 hidden sm:block">
            Woldia University
          </span>
        </div>

        <button
          onClick={handleLoginRedirect}
          className="bg-yellow-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition shadow-sm"
        >
          Login
        </button>
      </nav>

      {/* HERO SECTION */}
      <main className="flex flex-col items-center justify-center h-[calc(100vh-80px)] px-6 text-center">

        <h1 className="text-yellow-500 text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
          Student Clearance System
        </h1>

        <h2 className="text-slate-500 text-2xl sm:text-3xl md:text-4xl font-semibold mb-6">
          Welcome to Woldia University
        </h2>

        <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
          A modern platform that allows graduating students and university departments to complete clearance efficiently, transparently, and securely.
        </p>

        {/* CTA BUTTONS */}
        <div className="mt-10 flex gap-4 flex-wrap justify-center">

          <Link
            href="/about"
            className="border border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-800 hover:text-white transition"
          >
            Learn More
          </Link>

          <button
            onClick={handleLoginRedirect}
            className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition shadow-md"
          >
            Get Started
          </button>

        </div>
      </main>
    </div>
  )
}