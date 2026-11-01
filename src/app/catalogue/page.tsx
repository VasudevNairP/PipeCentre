import { Suspense } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CatalogueClient } from './CatalogueClient'
import { createServerClient } from '@/lib/supabase-server'

export const revalidate = 30

async function getInitialData() {
  try {
    const supabase = createServerClient()
    const [{ data: products }, { data: categories }] = await Promise.all([
      supabase
        .from('products')
        .select('*, category:categories(id,name,slug,parent_id)')
        .eq('active', true)
        .order('name'),
      supabase
        .from('categories')
        .select('*')
        .order('sort_order'),
    ])
    return { products: products || [], categories: categories || [] }
  } catch {
    return { products: [], categories: [] }
  }
}

export default async function CataloguePage() {
  const { products, categories } = await getInitialData()

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="page-title mb-6">Product Catalogue</h1>
        <Suspense fallback={<div className="py-12 text-center text-gray-400">Loading catalogue…</div>}>
          <CatalogueClient products={products} categories={categories} />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
