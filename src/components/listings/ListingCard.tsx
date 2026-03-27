import Link from 'next/link'
import Image from 'next/image'
import { Heart, MapPin } from 'lucide-react'
import { formatPrice, formatRelativeTime } from '@/lib/utils'

interface Props {
  listing: {
    id: string
    title: string
    price: number
    is_free: boolean
    condition: string
    suburb: string | null
    city: string
    images: string[]
    like_count: number
    created_at: string
    category?: { label: string } | null
  }
}

const CONDITION_LABEL: Record<string, string> = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
}

export default function ListingCard({ listing }: Props) {
  const image = listing.images?.[0]
  const location = listing.suburb ? `${listing.suburb}, ${listing.city}` : listing.city

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group bg-white rounded-2xl border border-warm-200 overflow-hidden hover:shadow-md hover:border-egg-200 transition-all"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-warm-100">
        {image ? (
          <Image
            src={image}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl text-warm-300">
            📦
          </div>
        )}
        {/* Like count */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
          <Heart size={11} fill="white" />
          {listing.like_count}
        </div>
        {/* Free badge */}
        {listing.is_free && (
          <div className="absolute top-2 left-2 bg-kiwi-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            FREE
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-1 mb-1">
          <span className="font-bold text-warm-900 text-sm">
            {formatPrice(listing.price)}
          </span>
          <span className="text-xs text-warm-400 bg-warm-100 px-1.5 py-0.5 rounded-md shrink-0">
            {CONDITION_LABEL[listing.condition] ?? listing.condition}
          </span>
        </div>
        <p className="text-sm text-warm-800 line-clamp-2 leading-snug mb-2">
          {listing.title}
        </p>
        <div className="flex items-center gap-1 text-xs text-warm-400">
          <MapPin size={11} />
          <span className="truncate">{location}</span>
          <span className="ml-auto shrink-0">{formatRelativeTime(listing.created_at)}</span>
        </div>
      </div>
    </Link>
  )
}
