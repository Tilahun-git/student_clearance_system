"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MdClose } from "react-icons/md"
import { signIn } from "next-auth/react"

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: Props) {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setError("")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // NextAuth credentials login
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (!res || res.error) {
        setError("Email or password is incorrect")
        setPassword("")
        setLoading(false)
        return
      }

      // Fetch session to get role
      const sessionRes = await fetch("/api/auth/session")
      const sessionData = await sessionRes.json()

      const role = sessionData?.user?.role
      if (role === "ADMIN") {
        router.push("/admin")
      } else {
        router.push("/student")
      }

      resetForm()
      onClose()
      setLoading(false)
    } catch (err) {
      console.error("Login error:", err)
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={() => {
            resetForm()
            onClose()
          }}
        >
          <MdClose size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        {/* Error Message */}
        {error && <p className="text-red-500 mb-3 text-center">{error}</p>}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white transition ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-900 hover:bg-yellow-400"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  )
}