import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CreateListingForm from './CreateListingForm'

export default async function NewListingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/listings/new')

  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug, label, icon')
    .order('sort_order')

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-warm-900 mb-1">Post a listing</h1>
      <p className="text-warm-500 text-sm mb-8">Sell something in your neighbourhood</p>
      <CreateListingForm categories={categories ?? []} />
    </div>
  )
}
