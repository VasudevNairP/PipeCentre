import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { DEFAULT_CATEGORIES } from '@/lib/utils'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order')

    if (!error && data && data.length > 0) {
      return NextResponse.json({ data })
    }

    // If categories table is empty and user is authenticated, populate default categories into Supabase
    if (session) {
      try {
        const parents = DEFAULT_CATEGORIES.filter(c => !c.parent_id).map(({ id, name, slug, sort_order }) => ({
          id, name, slug, parent_id: null, sort_order
        }))
        await supabase.from('categories').upsert(parents)

        const children = DEFAULT_CATEGORIES.filter(c => c.parent_id).map(({ id, name, slug, parent_id, sort_order }) => ({
          id, name, slug, parent_id, sort_order
        }))
        await supabase.from('categories').upsert(children)

        const { data: seeded } = await supabase.from('categories').select('*').order('sort_order')
        if (seeded && seeded.length > 0) {
          return NextResponse.json({ data: seeded })
        }
      } catch {}
    }

    return NextResponse.json({ data: DEFAULT_CATEGORIES })
  } catch {
    return NextResponse.json({ data: DEFAULT_CATEGORIES })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { name, slug, parent_id, sort_order } = body

    const { data, error } = await supabase
      .from('categories')
      .insert({ name, slug, parent_id: parent_id || null, sort_order: sort_order ?? 0 })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
