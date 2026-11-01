import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, MessageCircle } from 'lucide-react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { EnquiryDetailClient } from './EnquiryDetailClient'
import { createServerClient } from '@/lib/supabase-server'

export const revalidate = 0

interface Props {
  params: { id: string }
}

export default async function AdminEnquiryDetailPage({ params }: Props) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  const { data: enquiry } = await supabase
    .from('enquiries')
    .select('*, items:enquiry_items(*)')
    .eq('id', params.id)
    .single()

  if (!enquiry) notFound()

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <AdminSidebar userEmail={session?.user?.email} />
      <main className="flex-1 p-6 max-w-4xl">
        <Link href="/admin/enquiries" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Enquiries
        </Link>
        <EnquiryDetailClient initialEnquiry={enquiry} />
      </main>
    </div>
  )
}
