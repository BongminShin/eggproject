'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { ShoppingBag, MessageCircle, User as UserIcon, LogOut, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  user: User | null
  profile: { username: string; display_name: string | null; avatar_url: string | null } | null
}

export default function NavbarClient({ user, profile }: Props) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (!user) {
    return (
      <nav className="flex items-center gap-2">
        <Link
          href="/login"
          className="px-4 py-1.5 text-sm font-medium text-warm-700 hover:text-warm-900 transition-colors"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="px-4 py-1.5 text-sm font-semibold bg-egg-500 hover:bg-egg-600 text-white rounded-full transition-colors"
        >
          Sign up
        </Link>
      </nav>
    )
  }

  return (
    <nav className="flex items-center gap-1">
      <Link
        href="/listings/new"
        className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold bg-egg-500 hover:bg-egg-600 text-white rounded-full transition-colors"
      >
        <ShoppingBag size={15} />
        Sell
      </Link>

      <Link
        href="/messages"
        className="p-2 text-warm-500 hover:text-warm-900 hover:bg-warm-100 rounded-full transition-colors"
        title="Messages"
      >
        <MessageCircle size={20} />
      </Link>

      {/* Profile dropdown */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-1 p-1.5 hover:bg-warm-100 rounded-full transition-colors"
        >
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name ?? 'avatar'}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-egg-200 flex items-center justify-center">
              <UserIcon size={14} className="text-egg-700" />
            </div>
          )}
          <ChevronDown size={14} className="text-warm-500" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-warm-200 rounded-xl shadow-lg py-1 z-50">
            <div className="px-3 py-2 border-b border-warm-100">
              <p className="text-sm font-semibold text-warm-900 truncate">
                {profile?.display_name ?? 'User'}
              </p>
              <p className="text-xs text-warm-500 truncate">@{profile?.username}</p>
            </div>
            <Link
              href={`/profile/${profile?.username}`}
              className="flex items-center gap-2 px-3 py-2 text-sm text-warm-700 hover:bg-warm-50 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              <UserIcon size={15} />
              My Profile
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-warm-700 hover:bg-warm-50 transition-colors"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
