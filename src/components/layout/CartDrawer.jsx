import * as Dialog from '@radix-ui/react-dialog'
import { X, Minus, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCartStore } from '@/store'
import { formatINR } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export default function CartDrawer() {
  const { isOpen, closeCart, items, updateQty, removeItem, getSubtotal } =
    useCartStore()

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => !o && closeCart()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-in" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-[80] flex w-full max-w-md flex-col bg-white shadow-lift outline-none data-[state=open]:animate-in">
          <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
            <Dialog.Title className="font-heading text-lg font-semibold">
              Your Bag ({items.reduce((s, i) => s + i.qty, 0)})
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close cart"
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-muted"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="font-heading text-lg font-medium">Your bag is empty</p>
                <p className="mt-2 text-sm text-ink-muted">
                  Discover pieces made for comfort &amp; style.
                </p>
                <Link to="/collections/new-arrivals" onClick={closeCart} className="mt-6">
                  <Button type="button">Continue Shopping</Button>
                </Link>
              </div>
            ) : (
              <ul className="space-y-5">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-24 w-20 rounded-lg object-cover"
                    />
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <h4 className="font-heading text-sm font-medium">{item.name}</h4>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => removeItem(item.id)}
                          className="text-ink-muted hover:text-primary"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-1 text-sm font-semibold">
                        {formatINR(item.price)}
                      </p>
                      <div className="mt-auto flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded border border-black/10"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm">{item.qty}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded border border-black/10"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-black/5 px-5 py-5">
              <div className="mb-4 flex justify-between font-heading">
                <span className="text-ink-muted">Subtotal</span>
                <span className="font-semibold">{formatINR(getSubtotal())}</span>
              </div>
              <Button className="w-full" type="button">
                <Link to="/checkout" onClick={closeCart} className="contents">
                  Checkout
                </Link>
              </Button>
              <p className="mt-3 text-center text-xs text-ink-muted">
                Shipping &amp; taxes calculated at checkout
              </p>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
