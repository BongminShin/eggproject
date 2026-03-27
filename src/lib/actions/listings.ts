'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createListing(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const priceRaw = formData.get('price') as string
  const isFreeFlag = formData.get('is_free') === 'true'
  const condition = formData.get('condition') as string
  const category_id = parseInt(formData.get('category_id') as string)
  const suburb = formData.get('suburb') as string
  const city = formData.get('city') as string
  const imagesRaw = formData.get('images') as string
  const images = imagesRaw ? JSON.parse(imagesRaw) : []

  const price = isFreeFlag ? 0 : Math.round(parseFloat(priceRaw || '0') * 100)

  const { data, error } = await supabase
    .from('listings')
    .insert({
      seller_id: user.id,
      title,
      description,
      price,
      condition,
      category_id,
      suburb,
      city: city || 'Auckland',
      images,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/listings')
  revalidatePath('/')
  redirect(`/listings/${data.id}`)
}

export async function toggleLike(listingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { liked: false }

  const { data: existing } = await supabase
    .from('listing_likes')
    .select('listing_id')
    .eq('listing_id', listingId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('listing_likes').delete()
      .eq('listing_id', listingId).eq('user_id', user.id)
    revalidatePath(`/listings/${listingId}`)
    return { liked: false }
  } else {
    await supabase.from('listing_likes').insert({ listing_id: listingId, user_id: user.id })
    revalidatePath(`/listings/${listingId}`)
    return { liked: true }
  }
}

export async function deleteListing(listingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('listings').delete()
    .eq('id', listingId).eq('seller_id', user.id)

  revalidatePath('/listings')
  revalidatePath('/')
  redirect('/listings')
}

export async function markAsSold(listingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('listings')
    .update({ status: 'sold' })
    .eq('id', listingId).eq('seller_id', user.id)

  revalidatePath(`/listings/${listingId}`)
  revalidatePath('/listings')
}
