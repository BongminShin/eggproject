'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { toggleLike } from '@/lib/actions/listings'

interface Props {
  listingId: string
  initialLiked: boolean
  initialCount: number
}

export default function LikeButton({ listingId, initialLiked, initialCount }: Props) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (loading) return
    setLoading(true)
    // Optimistic update
    setLiked(!liked)
    setCount((c) => liked ? c - 1 : c + 1)

    try {
      await toggleLike(listingId)
    } catch {
      // Revert on error
      setLiked(liked)
      setCount(count)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
        liked
          ? 'bg-red-50 border-red-200 text-red-500'
          : 'bg-white border-warm-200 text-warm-600 hover:border-red-200 hover:text-red-400'
      }`}
    >
      <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
      {count}
    </button>
  )
}
