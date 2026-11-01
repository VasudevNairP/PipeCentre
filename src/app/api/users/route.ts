import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check if current user is owner
    const { data: caller } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (caller?.role !== 'owner') {
      return NextResponse.json({ error: 'Only owners can manage users' }, { status: 403 })
    }

    const { email, password, full_name, role } = await req.json()

    // Create auth user (needs service role in real production, or use supabase admin API)
    // For now we create the auth signup and then profile row
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name } },
    })

    if (authErr) throw authErr

    if (authData.user) {
      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          role: role || 'staff',
          full_name,
        })
        .select()
        .single()

      if (profErr) throw profErr
      return NextResponse.json({ data: profile }, { status: 201 })
    }

    return NextResponse.json({ error: 'Failed to create user' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: caller } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (caller?.role !== 'owner') {
      return NextResponse.json({ error: 'Only owners can manage users' }, { status: 403 })
    }

    // Delete profile
    const { error } = await supabase.from('profiles').delete().eq('id', params.id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
