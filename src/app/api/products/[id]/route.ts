import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { stock_delta, reason, ...productFields } = body

    // Update product fields
    if (Object.keys(productFields).length > 0) {
      const { error } = await supabase
        .from('products')
        .update({ ...productFields, updated_at: new Date().toISOString() })
        .eq('id', params.id)
      if (error) throw error
    }

    // Handle stock adjustment
    if (stock_delta !== undefined && stock_delta !== 0) {
      await supabase.from('stock_movements').insert({
        product_id: params.id,
        delta: stock_delta,
        reason: reason || 'Manual adjustment',
        performed_by: session.user.id,
      })
      await supabase.rpc('adjust_stock', {
        p_product_id: params.id,
        p_delta: stock_delta,
      })
    }

    const { data } = await supabase.from('products').select('*').eq('id', params.id).single()
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { error } = await supabase.from('products').delete().eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
