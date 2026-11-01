import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { slugify, DEFAULT_CATEGORIES } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const offset = (page - 1) * limit

    let query = supabase
      .from('products')
      .select('*, category:categories(id,name,slug)', { count: 'exact' })
      .order('name')
      .range(offset, offset + limit - 1)

    if (search) query = query.ilike('name', `%${search}%`)
    if (category) query = query.eq('categories.slug', category)

    const { data, count, error } = await query
    if (error) throw error
    return NextResponse.json({ data, count })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { name, category_id, brand, price, unit, description, specs, images, featured, active, low_stock_threshold, stock_qty } = body

    if (!name || !category_id || !unit) {
      return NextResponse.json({ error: 'name, category_id, and unit are required' }, { status: 400 })
    }

    // Ensure category exists in categories table (prevents foreign key constraint violation)
    const { data: existingCat } = await supabase
      .from('categories')
      .select('id')
      .eq('id', category_id)
      .maybeSingle()

    if (!existingCat) {
      const defCat = DEFAULT_CATEGORIES.find(c => c.id === category_id)
      if (defCat) {
        // If it's a child category, ensure its parent category is inserted first
        if (defCat.parent_id) {
          const parentDef = DEFAULT_CATEGORIES.find(c => c.id === defCat.parent_id)
          if (parentDef) {
            await supabase.from('categories').upsert({
              id: parentDef.id,
              name: parentDef.name,
              slug: parentDef.slug,
              parent_id: null,
              sort_order: parentDef.sort_order,
            })
          }
        }
        await supabase.from('categories').upsert({
          id: defCat.id,
          name: defCat.name,
          slug: defCat.slug,
          parent_id: defCat.parent_id,
          sort_order: defCat.sort_order,
        })
      } else {
        return NextResponse.json(
          { error: `Category "${category_id}" was not found in the database. Please select or create a valid category.` },
          { status: 400 }
        )
      }
    }

    const slug = slugify(name) + '-' + Date.now().toString(36)

    const { data, error } = await supabase
      .from('products')
      .insert({
        name,
        slug,
        category_id,
        brand: brand || null,
        price: price ?? null,
        unit,
        description: description || null,
        specs: specs || null,
        images: images || [],
        featured: featured ?? false,
        active: active ?? true,
        low_stock_threshold: low_stock_threshold ?? 5,
        stock_qty: stock_qty ?? 0,
      })
      .select()
      .single()

    if (error) throw error

    // Initial stock movement if qty > 0
    if (stock_qty > 0) {
      let performedBy: string | null = null

      if (session?.user?.id) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle()

        if (!prof) {
          try {
            await supabase.from('profiles').insert({
              id: session.user.id,
              role: 'owner',
              full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Shop Owner',
            })
            performedBy = session.user.id
          } catch {
            performedBy = null
          }
        } else {
          performedBy = session.user.id
        }
      }

      await supabase.from('stock_movements').insert({
        product_id: data.id,
        delta: stock_qty,
        reason: 'Initial stock',
        performed_by: performedBy,
      })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
