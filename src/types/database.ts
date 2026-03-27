export type ListingStatus = 'active' | 'sold' | 'reserved' | 'hidden'
export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor'
export type CommunityPostType = 'general' | 'lost_found' | 'event' | 'recommendation' | 'warning'

export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  suburb: string | null
  city: string
  rating_avg: number
  rating_count: number
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  slug: string
  label: string
  icon: string
  sort_order: number
}

export interface Listing {
  id: string
  seller_id: string
  category_id: number
  title: string
  description: string | null
  price: number
  is_free: boolean
  condition: ListingCondition
  suburb: string | null
  city: string
  images: string[]
  status: ListingStatus
  view_count: number
  like_count: number
  created_at: string
  updated_at: string
}

export interface ListingWithRelations extends Listing {
  seller: Profile
  category: Category
  is_liked?: boolean
}

export interface Message {
  id: string
  listing_id: string
  sender_id: string
  receiver_id: string
  body: string
  is_read: boolean
  created_at: string
}

export interface MessageWithRelations extends Message {
  sender: Profile
  receiver: Profile
  listing: Pick<Listing, 'id' | 'title' | 'images'>
}

export interface CommunityPost {
  id: string
  author_id: string
  post_type: CommunityPostType
  title: string
  body: string
  images: string[]
  suburb: string | null
  city: string
  like_count: number
  comment_count: number
  created_at: string
  updated_at: string
}

export interface CommunityPostWithRelations extends CommunityPost {
  author: Profile
}

export interface CommunityComment {
  id: string
  post_id: string
  author_id: string
  body: string
  created_at: string
}

export interface CommunityCommentWithRelations extends CommunityComment {
  author: Profile
}
