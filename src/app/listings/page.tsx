import Link from 'next/link'
import { Search, SlidersHorizontal } from 'lucide-react'
import { getListings } from '@/lib/data/listings'
import ListingCard from '@/components/listings/ListingCard'

const CATEGORIES = [
  { slug: 'all', label: 'All', icon: '🏠' },
  { slug: 'electronics', label: 'Electronics', icon: '💻' },
  { slug: 'furniture', label: 'Furniture', icon: '🛋️' },
  { slug: 'clothing', label: 'Clothing', icon: '👕' },
  { slug: 'vehicles', label: 'Vehicles', icon: '🚗' },
  { slug: 'sports', label: 'Sports', icon: '🏋️' },
  { slug: 'books', label: 'Books', icon: '📚' },
  { slug: 'tools', label: 'Tools', icon: '🔧' },
  { slug: 'garden', label: 'Garden', icon: '🌿' },
  { slug: 'toys', label: 'Toys & Kids', icon: '🧸' },
  { slug: 'food', label: 'Food', icon: '🍎' },
  { slug: 'free', label: 'Free Stuff', icon: '🎁' },
  { slug: 'other', label: 'Other', icon: '📦' },
]

interface Props {
  searchParams: Promise<{
    q?: string
    category?: string
    condition?: string
    sort?: string
    suburb?: string
  }>
}

export default async function ListingsPage({ searchParams }: Props) {
  const params = await searchParams
  const { q, category, condition, sort, suburb } = params

  const listings = await getListings({
    q,
    category,
    condition,
    sort: sort as 'newest' | 'price_asc' | 'price_desc',
    suburb,
  })

  const activeCategory = category ?? 'all'

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Search bar */}
      <form method="GET" className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search listings..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-warm-200 focus:outline-none focus:border-egg-400 focus:ring-2 focus:ring-egg-100 text-sm"
          />
        </div>
        <select
          name="sort"
          defaultValue={sort ?? 'newest'}
          className="px-3 py-2.5 rounded-xl border border-warm-200 text-sm text-warm-700 focus:outline-none focus:border-egg-400"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2.5 bg-egg-500 hover:bg-egg-600 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Search
        </button>
      </form>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-6">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/listings?${new URLSearchParams({ ...params, category: cat.slug }).toString()}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.slug
                ? 'bg-egg-500 text-white'
                : 'bg-white border border-warm-200 text-warm-700 hover:border-egg-300 hover:bg-egg-50'
            }`}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-warm-500">
          {listings.length > 0 ? `${listings.length} listings` : 'No listings found'}
        </p>
        <div className="flex gap-2">
          <select
            name="condition"
            defaultValue={condition ?? ''}
            className="px-3 py-1.5 rounded-lg border border-warm-200 text-sm text-warm-700 focus:outline-none"
            onChange={(e) => {
              // handled via form submit — static for SSR
            }}
          >
            <option value="">All conditions</option>
            <option value="new">New</option>
            <option value="like_new">Like New</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {listings.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {listings.map((listing: any) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-warm-200 py-20 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-warm-500 font-medium">No listings found</p>
          <p className="text-warm-400 text-sm mt-1">Try a different search or category</p>
          <Link
            href="/listings/new"
            className="inline-block mt-4 px-5 py-2 bg-egg-500 hover:bg-egg-600 text-white text-sm font-semibold rounded-full transition-colors"
          >
            Post a listing
          </Link>
        </div>
      )}
    </div>
  )
}
