import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Eye, Heart, ArrowLeft, CheckCircle } from 'lucide-react'
import { getListing, isListingLiked } from '@/lib/data/listings'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatRelativeTime } from '@/lib/utils'
import LikeButton from '@/components/listings/LikeButton'
import ListingActions from '@/components/listings/ListingActions'
import ImageGallery from '@/components/listings/ImageGallery'

const CONDITION_LABEL: Record<string, string> = {
  new: 'New', like_new: 'Like New', good: 'Good', fair: 'Fair', poor: 'Poor',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params
  const listing = await getListing(id)
  if (!listing) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const liked = user ? await isListingLiked(id, user.id) : false
  const isOwner = user?.id === listing.seller_id

  const location = listing.suburb
    ? `${listing.suburb}, ${listing.city}`
    : listing.city

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Back */}
      <Link
        href="/listings"
        className="inline-flex items-center gap-1.5 text-sm text-warm-500 hover:text-warm-900 mb-5 transition-colors"
      >
        <ArrowLeft size={15} /> Back to listings
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Left: images */}
        <div className="md:col-span-3">
          <ImageGallery images={listing.images} title={listing.title} />
        </div>

        {/* Right: info */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {/* Price + condition */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={`text-3xl font-bold ${listing.is_free ? 'text-kiwi-600' : 'text-warm-900'}`}>
                {formatPrice(listing.price)}
              </p>
              {listing.category && (
                <p className="text-sm text-warm-400 mt-0.5">{listing.category.label}</p>
              )}
            </div>
            <span className="text-xs font-medium text-warm-600 bg-warm-100 px-2.5 py-1 rounded-full mt-1">
              {CONDITION_LABEL[listing.condition]}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-warm-900 leading-snug">{listing.title}</h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-warm-400">
            <span className="flex items-center gap-1"><MapPin size={12} />{location}</span>
            <span className="flex items-center gap-1"><Eye size={12} />{listing.view_count} views</span>
            <span className="flex items-center gap-1"><Heart size={12} />{listing.like_count}</span>
            <span>{formatRelativeTime(listing.created_at)}</span>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="bg-warm-50 rounded-xl p-4">
              <p className="text-sm text-warm-700 whitespace-pre-line leading-relaxed">{listing.description}</p>
            </div>
          )}

          {/* Seller card */}
          <div className="border border-warm-200 rounded-xl p-4">
            <Link href={`/profile/${listing.seller.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              {listing.seller.avatar_url ? (
                <img src={listing.seller.avatar_url} alt={listing.seller.display_name ?? ''} className="w-11 h-11 rounded-full object-cover" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-egg-100 flex items-center justify-center text-xl">🥚</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-warm-900 text-sm truncate">
                    {listing.seller.display_name ?? listing.seller.username}
                  </p>
                  {listing.seller.is_verified && (
                    <CheckCircle size={14} className="text-kiwi-500 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-warm-400">@{listing.seller.username}</p>
                {listing.seller.suburb && (
                  <p className="text-xs text-warm-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} />{listing.seller.suburb}
                  </p>
                )}
              </div>
            </Link>
          </div>

          {/* Actions */}
          <ListingActions
            listingId={id}
            sellerId={listing.seller_id}
            sellerUsername={listing.seller.username}
            isOwner={isOwner}
            isLoggedIn={!!user}
            liked={liked}
            likeCount={listing.like_count}
          />
        </div>
      </div>
    </div>
  )
}
