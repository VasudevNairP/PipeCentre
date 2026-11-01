import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ProductCard } from '@/components/catalogue/ProductCard'
import { Phone, MessageCircle, MapPin, Clock, ArrowRight, Droplets, Zap } from 'lucide-react'
import { SHOP_CONFIG, buildWhatsAppUrl, addStockStatus } from '@/lib/utils'
import { createServerClient } from '@/lib/supabase-server'

export const revalidate = 60

async function getFeaturedProducts() {
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(id,name,slug)')
      .eq('featured', true)
      .eq('active', true)
      .order('name')
      .limit(8)
    return (data || []).map(addStockStatus)
  } catch {
    return []
  }
}

async function getCategories() {
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .order('sort_order')
    return data || []
  } catch {
    return []
  }
}

const categoryIcons: Record<string, React.ReactNode> = {
  plumbing: <Droplets className="w-8 h-8" />,
  electrical: <Zap className="w-8 h-8" />,
}

export default async function HomePage() {
  const [featured, categories] = await Promise.all([getFeaturedProducts(), getCategories()])
  const waUrl = buildWhatsAppUrl('Hello! I saw your catalogue online and would like to enquire about your products.')

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-brand-600 via-brand-700 to-orange-800 text-white">
          <div className="max-w-7xl mx-auto px-4 py-14 md:py-20">
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight tracking-tight">
                Your Complete<br />
                <span className="text-orange-200">Plumbing &amp; Electrical</span><br />
                Supplies Shop
              </h1>
              <p className="text-orange-100 text-sm md:text-base mb-8 leading-relaxed">
                Browse our full catalogue of pipes, taps, fittings, bulbs, fans, wiring and more.
                Add items to your enquiry list and contact us for the best prices.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/catalogue" className="btn-primary bg-white text-brand-700 hover:bg-orange-50">
                  Browse Catalogue <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href={`tel:${SHOP_CONFIG.phone}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-white text-white text-sm bg-transparent hover:bg-white/10 font-semibold transition-colors"
                >
                  <Phone className="w-4 h-4" /> Call Now
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Category tiles */}
        <section className="max-w-7xl mx-auto px-4 py-10 md:py-14">
          <h2 className="section-title mb-6">Shop by Category</h2>
          {categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/catalogue?category=${cat.slug}`}
                  className="card p-5 flex flex-col items-center gap-3 hover:border-brand-300 hover:bg-orange-50 transition-all group text-center"
                >
                  <div className="w-12 h-12 bg-brand-100 text-brand-700 rounded-xl flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    {categoryIcons[cat.slug] || <Droplets className="w-6 h-6" />}
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{cat.name}</span>
                </Link>
              ))}
              <Link
                href="/catalogue"
                className="card p-5 flex flex-col items-center gap-3 hover:border-brand-300 hover:bg-orange-50 transition-all group text-center border-dashed"
              >
                <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-xl flex items-center justify-center group-hover:bg-brand-50 transition-colors text-xl font-bold">
                  +
                </div>
                <span className="text-sm font-semibold text-gray-500">All Products</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[
                { label: 'Plumbing', slug: 'plumbing', icon: <Droplets className="w-6 h-6" /> },
                { label: 'Electrical', slug: 'electrical', icon: <Zap className="w-6 h-6" /> },
              ].map(cat => (
                <Link
                  key={cat.slug}
                  href={`/catalogue?category=${cat.slug}`}
                  className="card p-5 flex flex-col items-center gap-3 hover:border-brand-300 hover:bg-orange-50 transition-all group text-center"
                >
                  <div className="w-12 h-12 bg-brand-100 text-brand-700 rounded-xl flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    {cat.icon}
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{cat.label}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Featured products */}
        {featured.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 pb-10 md:pb-14">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title">Featured Products</h2>
              <Link href="/catalogue" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* Contact banner */}
        <section className="bg-gray-50 border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
            <div className="text-center mb-8">
              <h2 className="section-title mb-2">Visit Us or Get in Touch</h2>
              <p className="text-sm text-gray-500">We're happy to help you find the right product at the right price.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-11 h-11 bg-brand-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-brand-700" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Address</span>
                <span className="text-xs text-gray-500">{SHOP_CONFIG.address}</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-11 h-11 bg-brand-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-brand-700" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Hours</span>
                <span className="text-xs text-gray-500">{SHOP_CONFIG.hours}</span>
              </div>
              <a href={`tel:${SHOP_CONFIG.phone}`} className="flex flex-col items-center text-center gap-2 hover:opacity-80">
                <div className="w-11 h-11 bg-brand-100 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-brand-700" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Call</span>
                <span className="text-xs text-brand-600 font-medium">{SHOP_CONFIG.phone}</span>
              </a>
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-center gap-2 hover:opacity-80">
                <div className="w-11 h-11 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-green-700" />
                </div>
                <span className="text-sm font-semibold text-gray-900">WhatsApp</span>
                <span className="text-xs text-green-600 font-medium">Message us</span>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
