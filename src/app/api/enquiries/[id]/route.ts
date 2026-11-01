import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { status, internal_notes } = body

    const updates: any = {}
    if (status) updates.status = status
    if (internal_notes !== undefined) updates.internal_notes = internal_notes

    const { data, error } = await supabase
      .from('enquiries')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    // If completed, optionally deduct stock
    if (status === 'completed') {
      const { data: items } = await supabase
        .from('enquiry_items')
        .select('*')
        .eq('enquiry_id', params.id)

      if (items) {
        for (const item of items) {
          // Add stock movement
          await supabase.from('stock_movements').insert({
            product_id: item.product_id,
            delta: -item.qty,
            reason: `Order completed (enquiry ${data.reference})`,
            performed_by: session.user.id,
            enquiry_id: params.id,
          })
          // Decrement stock
          await supabase.rpc('decrement_stock', {
            p_product_id: item.product_id,
            p_qty: item.qty,
          })
        }
      }
    }

    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
