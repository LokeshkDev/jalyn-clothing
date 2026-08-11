import React, { useState, useMemo } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Search, X, Sparkles, ArrowRight, ShoppingBag } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useUIStore } from '@/store'
import { useProductsApi } from '@/hooks/useProductsApi'
import { formatINR } from '@/lib/utils'

const QUICK_SEARCH_CHIPS = ['Midi Dress', 'Satin', 'Linen', 'Kurta Set', 'Co-ord', 'Evening Gown']

export default function SearchModal() {
  const { searchOpen, setSearchOpen } = useUIStore()
  const { products } = useProductsApi()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  // Filter matching suggestions dynamically as user types
  const suggestions = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase().trim()
    return products.filter((p) => {
      const matchTitle = p.title?.toLowerCase().includes(q)
      const matchCat = p.category?.toLowerCase().includes(q) || p.category_slug?.toLowerCase().includes(q)
      const matchDesc = p.description?.toLowerCase().includes(q)
      const matchBrand = p.brand?.toLowerCase().includes(q)
      return matchTitle || matchCat || matchDesc || matchBrand
    }).slice(0, 6) // Top 6 live suggestions
  }, [query, products])

  const handleSelectProduct = (slug) => {
    setSearchOpen(false)
    setQuery('')
    navigate(`/products/${slug}`)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setSearchOpen(false)
    navigate(`/shop?search=${encodeURIComponent(query.trim())}`)
  }

  return (
    <Dialog.Root open={searchOpen} onOpenChange={setSearchOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-md transition-opacity" />
        <Dialog.Content className="fixed inset-x-0 top-0 z-[80] bg-white p-4 shadow-2xl outline-none sm:p-6 rounded-b-3xl border-b border-primary/10 max-h-[90vh] overflow-y-auto">
          <div className="container-luxury max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between gap-4 border-b border-primary/10 pb-3">
              <Dialog.Title className="font-display text-lg font-bold text-ink flex items-center gap-2">
                <span>Search Collection</span>
              </Dialog.Title>
              <Dialog.Close
                aria-label="Close search"
                onClick={() => setQuery('')}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-muted transition text-ink-muted hover:text-ink"
              >
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>

            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <span className="sr-only">Search products</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
              <input
                autoFocus
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dresses, tops, ethnic wear, linen..."
                className="w-full rounded-2xl border-2 border-primary/20 bg-[#FFF6F9] py-3.5 pl-12 pr-10 text-sm font-medium outline-none transition focus:border-primary focus:bg-white shadow-inner"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>

            {/* Quick Suggestion Chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Try:</span>
              {QUICK_SEARCH_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setQuery(chip)}
                  className="px-3 py-1 rounded-full bg-surface border border-primary/10 text-xs font-medium text-ink hover:border-primary hover:text-primary transition"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* LIVE TYPEAHEAD SUGGESTIONS DROPDOWN */}
            {query.trim() !== '' && (
              <div className="pt-2 border-t border-primary/10 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-ink uppercase tracking-wider">
                    {suggestions.length > 0
                      ? `Matching Products (${suggestions.length})`
                      : 'No Matching Products Found'}
                  </p>
                  {suggestions.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      View All Results <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {suggestions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {suggestions.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectProduct(p.slug)}
                        className="flex items-center gap-3 p-2.5 rounded-2xl border border-primary/10 bg-white hover:border-primary hover:bg-[#FFF6F9] transition cursor-pointer group shadow-xs"
                      >
                        <img
                          src={p.primary_image || p.image}
                          alt={p.title}
                          className="h-14 w-12 rounded-xl object-cover shrink-0 border border-black/5"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs text-ink truncate group-hover:text-primary transition">
                            {p.title}
                          </p>
                          <span className="inline-block bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-0.5">
                            {p.category_slug || p.category}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-bold text-xs text-primary">{formatINR(p.price)}</span>
                            {p.original_price > p.price && (
                              <span className="text-[10px] text-ink-muted line-through">
                                {formatINR(p.original_price)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-ink-muted bg-surface rounded-2xl border border-dashed border-primary/20">
                    No products found for "<strong>{query}</strong>". Try another keyword like <em>dress, satin, or kurta</em>.
                  </div>
                )}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
