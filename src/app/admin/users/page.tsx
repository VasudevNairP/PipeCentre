import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { UsersClient } from './UsersClient'
import { createServerClient } from '@/lib/supabase-server'

export const revalidate = 0

export default async function AdminUsersPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  // Get current user's profile to check if owner
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session?.user?.id)
    .single()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at')

  const isOwner = currentProfile?.role === 'owner'

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <AdminSidebar userEmail={session?.user?.email} />
      <main className="flex-1 p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Staff &amp; User Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage shop staff who have access to this dashboard</p>
        </div>
        <UsersClient
          initialProfiles={profiles || []}
          isOwner={isOwner}
          currentUserId={session?.user?.id}
        />
      </main>
    </div>
  )
}
