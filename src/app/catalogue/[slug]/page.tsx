import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { StockBadge } from '@/components/catalogue/StockBadge'
import { AddToCartButton } from '@/components/catalogue/AddToCartButton'
import { createServerClient } from '@/lib/supabase-server'
import { formatPrice, getSupabaseImageUrl, addStockStatus } from '@/lib/utils'

export const revalidate = 60

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props) {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('products')
    .select('name, description')
    .eq('slug', params.slug)
    .single()
  if (!data) return { title: 'Product Not Found' }
  return {
    title: `${data.name} — Pipe Centre`,
    description: data.description || undefined,
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const supabase = createServerClient()
  const { data: raw } = await supabase
    .from('products')
    .select('*, category:categories(id,name,slug,parent:categories(id,name,slug))')
    .eq('slug', params.slug)
    .eq('active', true)
    .single()

  if (!raw) notFound()

  const product = addStockStatus(raw)
  const images = (product.images || []).map(getSupabaseImageUrl)
  const specs = product.specs as Record<string, string> | null

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6 flex-wrap">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/catalogue" className="hover:text-brand-600">Catalogue</Link>
          {product.category && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href={`/catalogue?category=${product.category.slug}`} className="hover:text-brand-600">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-600 truncate max-w-[160px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
              {images.length > 0 ? (
                <Image
                  src={images[0]}
                  alt={product.name}
                  fill
                  className="object-contain p-8"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-300">
                  <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.slice(1).map((src: string, i: number) => (
                  <div key={i} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    <Image src={src} alt={`${product.name} ${i + 2}`} fill className="object-contain p-1" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {product.brand && (
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-1">{product.brand}</p>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <StockBadge status={product.stock_status} />
              <span className="text-sm text-gray-400">per {product.unit}</span>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-brand-700">{formatPrice(product.price)}</span>
              {product.price && <span className="text-gray-400 text-sm ml-1">/ {product.unit}</span>}
              {!product.price && <p className="text-sm text-gray-500 mt-1">Contact us for the best price on this item.</p>}
            </div>

            {product.description && (
              <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
            )}

            {specs && Object.keys(specs).length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Specifications</h3>
                <div className="card divide-y divide-gray-100">
                  {Object.entries(specs).map(([key, val]) => (
                    <div key={key} className="flex px-4 py-2.5 text-sm">
                      <span className="w-40 text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="font-medium text-gray-900">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 mt-auto">
              <AddToCartButton product={product} />
              <p className="text-xs text-center text-gray-400">
                Add to your enquiry list, then submit it or send via WhatsApp to get a quote.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
