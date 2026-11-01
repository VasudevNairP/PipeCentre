import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customer_name, customer_phone, customer_email, note, items, reference } = body

    if (!customer_name || !customer_phone || !items?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Use anon key — RLS allows public insert on enquiries
    const supabase = createRouteHandlerClient({ cookies })

    // Insert enquiry
    const { data: enquiry, error: enqErr } = await supabase
      .from('enquiries')
      .insert({
        reference,
        customer_name,
        customer_phone,
        customer_email: customer_email || null,
        note: note || null,
        status: 'new',
      })
      .select()
      .single()

    if (enqErr) throw enqErr

    // Insert items
    const itemRows = items.map((item: any) => ({
      enquiry_id: enquiry.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_price: item.product_price,
      qty: item.qty,
      unit: item.unit,
    }))

    const { error: itemErr } = await supabase
      .from('enquiry_items')
      .insert(itemRows)

    if (itemErr) throw itemErr

    return NextResponse.json({ success: true, reference: enquiry.reference })
  } catch (e: any) {
    console.error('Enquiry error:', e)
    return NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const offset = (page - 1) * limit

    let query = supabase
      .from('enquiries')
      .select('*, items:enquiry_items(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) query = query.eq('status', status)

    const { data, count, error } = await query
    if (error) throw error

    return NextResponse.json({ data, count })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
