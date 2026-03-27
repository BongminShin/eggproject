import { createClient } from '@/lib/supabase/server'

export interface ListingFilters {
  category?: string
  q?: string
  minPrice?: number
  maxPrice?: number
  condition?: string
  suburb?: string
  sort?: 'newest' | 'price_asc' | 'price_desc'
  page?: number
}

export async function getListings(filters: ListingFilters = {}) {
  const supabase = await createClient()
  const { category, q, minPrice, maxPrice, condition, suburb, sort = 'newest', page = 1 } = filters
  const PAGE_SIZE = 20

  let query = supabase
    .from('listings')
    .select('*, seller:profiles(id, username, display_name, avatar_url, suburb), category:categories(id, slug, label, icon)')
    .eq('status', 'active')
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  if (q) query = query.ilike('title', `%${q}%`)
  if (condition) query = query.eq('condition', condition)
  if (suburb) query = query.ilike('suburb', `%${suburb}%`)
  if (minPrice != null) query = query.gte('price', minPrice * 100)
  if (maxPrice != null) query = query.lte('price', maxPrice * 100)

  if (sort === 'price_asc') query = query.order('price', { ascending: true })
  else if (sort === 'price_desc') query = query.order('price', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) return []

  // category slug filter (post-query since foreign table filter is tricky)
  if (category && category !== 'all') {
    return (data ?? []).filter((l: any) => l.category?.slug === category)
  }

  return data ?? []
}

export async function getListing(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('listings')
    .select('*, seller:profiles(id, username, display_name, avatar_url, suburb, city, rating_avg, rating_count, is_verified), category:categories(id, slug, label, icon)')
    .eq('id', id)
    .single()
  return data
}

export async function getUserListings(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('listings')
    .select('*, category:categories(id, slug, label, icon)')
    .eq('seller_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function isListingLiked(listingId: string, userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('listing_likes')
    .select('listing_id')
    .eq('listing_id', listingId)
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
}
