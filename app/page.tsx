"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import logo from "../public/wldu_logo.jpg"
import { useEffect } from "react"

export default function Home() {
const router = useRouter()

  useEffect(() => {
    fetch("/api/health");
  }, []);
  const handleLoginRedirect = () => {
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen w-screen bg-linear-to-br from-slate-100 via-white to-indigo-100 text-slate-800">

      <nav className="sticky top-0 z-30 bg-white/70 backdrop-blur-lg border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Image
            src={logo}
            alt="University Logo"
            width={45}
            height={45}
            style={{height:"auto"}}
            className="rounded-md"
          />
          <span className="font-semibold text-lg text-slate-800 hidden sm:block">
            Woldia University
          </span>
        </div>

        <button
          onClick={handleLoginRedirect}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-sm"
        >
          Login
        </button>
      </nav>

      <main className="flex flex-col items-center justify-center h-[calc(100vh-80px)] px-6 text-center">

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight bg-linear-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
          Student Clearance System
        </h1>

        <h2 className="text-slate-700 text-2xl sm:text-3xl md:text-4xl font-semibold mb-6">
          Welcome to Woldia University
        </h2>

        <p className="text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed">
          A modern platform that enables students and university departments
          to complete clearance processes efficiently, transparently, and securely.
        </p>

        <div className="mt-10 flex gap-4 flex-wrap justify-center">

          <Link
            href="/about"
            className="px-6 py-3 rounded-lg font-medium border border-gray-300 text-slate-700 hover:bg-slate-800 hover:text-white transition"
          >
            Learn More
          </Link>

          <button
            onClick={handleLoginRedirect}
            className="px-6 py-3 rounded-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-lg"
          >
            Get Started
          </button>

        </div>
      </main>
    </div>
  )
}