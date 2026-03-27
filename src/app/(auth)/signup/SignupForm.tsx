'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, full_name: username },
        emailRedirectTo: `${location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <p className="text-3xl mb-3">📬</p>
        <p className="font-semibold text-warm-900">Check your email</p>
        <p className="text-sm text-warm-500 mt-1">
          We sent a confirmation link to <strong>{email}</strong>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-warm-700 mb-1.5">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
          required
          minLength={3}
          maxLength={20}
          placeholder="kiwi_trader"
          className="w-full px-3 py-2.5 rounded-xl border border-warm-200 focus:outline-none focus:border-egg-400 focus:ring-2 focus:ring-egg-100 text-sm transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-warm-700 mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="w-full px-3 py-2.5 rounded-xl border border-warm-200 focus:outline-none focus:border-egg-400 focus:ring-2 focus:ring-egg-100 text-sm transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-warm-700 mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          placeholder="••••••••"
          className="w-full px-3 py-2.5 rounded-xl border border-warm-200 focus:outline-none focus:border-egg-400 focus:ring-2 focus:ring-egg-100 text-sm transition-colors"
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-egg-500 hover:bg-egg-600 disabled:bg-warm-300 text-white font-semibold rounded-xl transition-colors text-sm mt-1"
      >
        {loading ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  )
}
