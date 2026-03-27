'use client'

import { useState, useTransition } from 'react'
import { Upload, X, DollarSign } from 'lucide-react'
import { createListing } from '@/lib/actions/listings'
import { createClient } from '@/lib/supabase/client'

interface Category {
  id: number
  slug: string
  label: string
  icon: string
}

const CATEGORY_ICONS: Record<string, string> = {
  electronics: '💻', furniture: '🛋️', clothing: '👕', vehicles: '🚗',
  sports: '🏋️', books: '📚', tools: '🔧', garden: '🌿',
  toys: '🧸', food: '🍎', services: '💼', free: '🎁', other: '📦',
}

const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
]

const NZ_CITIES = ['Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga', 'Dunedin', 'Palmerston North', 'Nelson', 'Rotorua', 'Other']

export default function CreateListingForm({ categories }: { categories: Category[] }) {
  const [isPending, startTransition] = useTransition()
  const [isFree, setIsFree] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length || images.length + files.length > 5) return

    setUploading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const urls: string[] = []
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('listing-images').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('listing-images').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    setImages((prev) => [...prev, ...urls].slice(0, 5))
    setUploading(false)
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url))
  }

  return (
    <form
      action={(formData) => {
        formData.set('images', JSON.stringify(images))
        formData.set('is_free', String(isFree))
        if (selectedCategory) formData.set('category_id', String(selectedCategory))
        startTransition(() => createListing(formData))
      }}
      className="flex flex-col gap-6"
    >
      {/* Images */}
      <div>
        <label className="block text-sm font-semibold text-warm-800 mb-2">
          Photos <span className="font-normal text-warm-400">(up to 5)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {images.map((url) => (
            <div key={url} className="relative w-24 h-24 rounded-xl overflow-hidden border border-warm-200">
              <img src={url} alt="listing" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <label className="w-24 h-24 rounded-xl border-2 border-dashed border-warm-300 hover:border-egg-400 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors text-warm-400 hover:text-egg-500">
              {uploading ? (
                <span className="text-xs">Uploading...</span>
              ) : (
                <>
                  <Upload size={18} />
                  <span className="text-xs">Add photo</span>
                </>
              )}
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
          )}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-semibold text-warm-800 mb-2">Category <span className="text-red-400">*</span></label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs transition-colors ${
                selectedCategory === cat.id
                  ? 'border-egg-500 bg-egg-50 text-egg-700'
                  : 'border-warm-200 hover:border-egg-300 text-warm-600'
              }`}
            >
              <span className="text-xl">{CATEGORY_ICONS[cat.slug] ?? '📦'}</span>
              <span className="leading-tight text-center">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-warm-800 mb-1.5">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          name="title"
          required
          maxLength={100}
          placeholder="What are you selling?"
          className="w-full px-3 py-2.5 rounded-xl border border-warm-200 focus:outline-none focus:border-egg-400 focus:ring-2 focus:ring-egg-100 text-sm"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-warm-800 mb-1.5">Description</label>
        <textarea
          name="description"
          rows={4}
          placeholder="Describe the item — condition details, reason for selling, etc."
          className="w-full px-3 py-2.5 rounded-xl border border-warm-200 focus:outline-none focus:border-egg-400 focus:ring-2 focus:ring-egg-100 text-sm resize-none"
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-semibold text-warm-800 mb-1.5">Price</label>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
              className="w-4 h-4 accent-kiwi-500"
            />
            <span className="text-sm text-warm-700">Free</span>
          </label>
          {!isFree && (
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 text-sm">$</span>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-warm-200 focus:outline-none focus:border-egg-400 focus:ring-2 focus:ring-egg-100 text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 text-xs">NZD</span>
            </div>
          )}
        </div>
      </div>

      {/* Condition */}
      <div>
        <label className="block text-sm font-semibold text-warm-800 mb-2">Condition <span className="text-red-400">*</span></label>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((c) => (
            <label key={c.value} className="cursor-pointer">
              <input type="radio" name="condition" value={c.value} required className="sr-only peer" />
              <span className="block px-3 py-1.5 rounded-full border border-warm-200 text-sm text-warm-600 peer-checked:border-egg-500 peer-checked:bg-egg-50 peer-checked:text-egg-700 hover:border-egg-300 transition-colors">
                {c.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-warm-800 mb-1.5">Suburb</label>
          <input
            name="suburb"
            placeholder="e.g. Ponsonby"
            className="w-full px-3 py-2.5 rounded-xl border border-warm-200 focus:outline-none focus:border-egg-400 focus:ring-2 focus:ring-egg-100 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-warm-800 mb-1.5">City</label>
          <select
            name="city"
            defaultValue="Auckland"
            className="w-full px-3 py-2.5 rounded-xl border border-warm-200 focus:outline-none focus:border-egg-400 text-sm text-warm-700"
          >
            {NZ_CITIES.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || !selectedCategory}
        className="w-full py-3 bg-egg-500 hover:bg-egg-600 disabled:bg-warm-300 text-white font-bold rounded-xl transition-colors text-sm mt-2"
      >
        {isPending ? 'Posting...' : 'Post listing'}
      </button>
    </form>
  )
}
