'use client'

import Link from 'next/link'
import { MessageCircle, Trash2, CheckCircle2 } from 'lucide-react'
import LikeButton from './LikeButton'
import { deleteListing, markAsSold } from '@/lib/actions/listings'

interface Props {
  listingId: string
  sellerId: string
  sellerUsername: string
  isOwner: boolean
  isLoggedIn: boolean
  liked: boolean
  likeCount: number
}

export default function ListingActions({
  listingId, sellerUsername, isOwner, isLoggedIn, liked, likeCount
}: Props) {
  if (isOwner) {
    return (
      <div className="flex flex-col gap-2 mt-2">
        <form action={markAsSold.bind(null, listingId)}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-kiwi-500 hover:bg-kiwi-600 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            <CheckCircle2 size={16} /> Mark as Sold
          </button>
        </form>
        <form action={deleteListing.bind(null, listingId)}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-500 hover:bg-red-50 font-medium rounded-xl transition-colors text-sm"
          >
            <Trash2 size={15} /> Delete listing
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="flex gap-2 mt-2">
      {isLoggedIn ? (
        <>
          <Link
            href={`/messages?listing=${listingId}&seller=${sellerUsername}`}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-egg-500 hover:bg-egg-600 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            <MessageCircle size={16} /> Chat with seller
          </Link>
          <LikeButton listingId={listingId} initialLiked={liked} initialCount={likeCount} />
        </>
      ) : (
        <Link
          href="/login"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-egg-500 hover:bg-egg-600 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          <MessageCircle size={16} /> Log in to contact seller
        </Link>
      )}
    </div>
  )
}
