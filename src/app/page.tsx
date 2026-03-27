import Link from 'next/link'
import { Search } from 'lucide-react'
import { getListings } from '@/lib/data/listings'
import ListingCard from '@/components/listings/ListingCard'

const CATEGORIES = [
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

export default async function HomePage() {
  const listings = await getListings({ sort: 'newest' })
  const recentListings = listings.slice(0, 8)

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-b from-egg-100 to-egg-50 py-16 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold text-warm-900 mb-3">
            Buy and sell in your<br />
            <span className="text-egg-600">neighbourhood</span>
          </h1>
          <p className="text-warm-500 mb-8">
            New Zealand&apos;s local community marketplace 🥚
          </p>

          <Link
            href="/listings"
            className="flex items-center gap-3 w-full max-w-lg mx-auto bg-white border-2 border-warm-200 hover:border-egg-400 rounded-2xl px-4 py-3 shadow-sm transition-colors group"
          >
            <Search size={20} className="text-warm-400 group-hover:text-egg-500 transition-colors" />
            <span className="text-warm-400 text-sm">Search listings...</span>
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 px-4 border-b border-warm-200 bg-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-sm font-semibold text-warm-500 uppercase tracking-wide mb-4">Browse categories</h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/listings?category=${cat.slug}`}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-egg-50 transition-colors group"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs text-warm-600 group-hover:text-egg-700 text-center leading-tight">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent listings */}
      <section className="py-10 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-warm-900">Latest listings</h2>
            <Link href="/listings" className="text-sm text-egg-600 hover:text-egg-700 font-medium">
              View all →
            </Link>
          </div>

          {recentListings.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {recentListings.map((listing: any) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-warm-200 py-16 text-center">
              <p className="text-4xl mb-3">🥚</p>
              <p className="text-warm-500 font-medium">No listings yet</p>
              <p className="text-warm-400 text-sm mt-1">Be the first to post something!</p>
              <Link
                href="/listings/new"
                className="inline-block mt-4 px-5 py-2 bg-egg-500 hover:bg-egg-600 text-white text-sm font-semibold rounded-full transition-colors"
              >
                Post a listing
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Community teaser */}
      <section className="py-10 px-4 bg-white border-t border-warm-200">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-warm-900">Community</h2>
            <Link href="/community" className="text-sm text-egg-600 hover:text-egg-700 font-medium">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {['Lost & Found', 'Local Events', 'Recommendations'].map((type) => (
              <Link
                key={type}
                href="/community"
                className="p-4 rounded-xl border border-warm-200 hover:border-egg-300 hover:bg-egg-50 transition-colors"
              >
                <p className="font-medium text-warm-800">{type}</p>
                <p className="text-sm text-warm-400 mt-1">Share with your neighbours →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-warm-200 bg-warm-50">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">🥚</span>
            <span className="font-bold text-egg-600">egg</span>
            <span className="text-warm-400 text-sm ml-2">NZ local marketplace</span>
          </div>
          <p className="text-warm-400 text-sm">© 2025 egg. Made with ❤️ in NZ</p>
        </div>
      </footer>
    </div>
  )
}
