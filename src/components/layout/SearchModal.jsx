import * as Dialog from '@radix-ui/react-dialog'
import { Search, X } from 'lucide-react'
import { useUIStore } from '@/store'

export default function SearchModal() {
  const { searchOpen, setSearchOpen } = useUIStore()

  return (
    <Dialog.Root open={searchOpen} onOpenChange={setSearchOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-x-0 top-0 z-[80] bg-white p-4 shadow-lift outline-none sm:p-6">
          <div className="container-luxury">
            <div className="flex items-center justify-between gap-4">
              <Dialog.Title className="font-heading text-lg font-semibold">
                Search
              </Dialog.Title>
              <Dialog.Close
                aria-label="Close search"
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-muted"
              >
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>
            <label className="relative mt-4 block">
              <span className="sr-only">Search products</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
              <input
                autoFocus
                type="search"
                placeholder="Search dresses, tops, ethnic wear…"
                className="w-full rounded-xl border border-black/10 bg-surface py-4 pl-12 pr-4 text-base outline-none transition focus:border-primary"
              />
            </label>
            <p className="mt-3 text-xs text-ink-muted">
              Try: midi dress, linen, lounge, kurta
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
