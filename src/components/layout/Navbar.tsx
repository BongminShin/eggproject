import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import NavbarClient from './NavbarClient'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username, display_name, avatar_url')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-warm-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 shrink-0">
          <span className="text-2xl">🥚</span>
          <span className="text-xl font-bold text-egg-600 tracking-tight">egg</span>
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side — client component handles auth state interactions */}
        <NavbarClient user={user} profile={profile} />
      </div>
    </header>
  )
}
