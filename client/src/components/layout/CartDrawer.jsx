import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Minus, Plus, Trash2, MapPin, CheckCircle2, AlertCircle, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCartStore, useDeliveryStore } from '@/store'
import { formatINR, cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export default function CartDrawer() {
  const { isOpen, closeCart, items, updateQty, removeItem, getSubtotal } =
    useCartStore()

  const deliveryStore = useDeliveryStore()
  const [inputPincode, setInputPincode] = useState(deliveryStore.pincode || '')
  const [pincodeError, setPincodeError] = useState('')

  useEffect(() => {
    if (deliveryStore.pincode) {
      setInputPincode(deliveryStore.pincode)
    }
  }, [deliveryStore.pincode])

  const handleCheckDelivery = (e) => {
    e.preventDefault()
    setPincodeError('')
    const res = deliveryStore.verifyPincode(inputPincode)
    if (!res.success) {
      setPincodeError(res.message)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => !o && closeCart()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-in" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-[80] flex w-full max-w-md flex-col bg-white shadow-lift outline-none data-[state=open]:animate-in">
          <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
            <Dialog.Title className="font-heading text-lg font-semibold text-ink">
              Your Bag ({items.reduce((s, i) => s + i.qty, 0)})
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close cart"
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-muted transition"
            >
              <X className="h-5 w-5 text-primary" />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 theme-scrollbar">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center py-12">
                <p className="font-heading text-xl font-medium text-ink">Your bag is empty</p>
                <p className="mt-2 text-sm text-ink-muted">
                  Discover pieces made for comfort &amp; style.
                </p>
                <Link to="/shop" onClick={closeCart} className="mt-6">
                  <Button type="button">Continue Shopping</Button>
                </Link>
              </div>
            ) : (
              <ul className="space-y-5">
                {items.map((item) => {
                  const title = item.name || item.title || 'Jalyn Essential Item'
                  const img =
                    item.image ||
                    item.primary_image ||
                    item.images?.primary ||
                    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'

                  return (
                    <li key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4 p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                      <img
                        src={img}
                        alt={title}
                        className="h-24 w-20 rounded-lg object-cover bg-rose-light/20 shrink-0"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'
                        }}
                      />
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex justify-between gap-2">
                            <h4 className="font-heading text-base font-semibold text-ink line-clamp-1">{title}</h4>
                            <button
                              type="button"
                              aria-label={`Remove ${title}`}
                              onClick={() => removeItem(item.id)}
                              className="text-ink-muted hover:text-primary transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          {(item.size || item.color) && (
                            <p className="text-xs text-ink-muted mt-0.5">
                              {item.size && <span>Size: <strong>{item.size}</strong></span>}
                              {item.size && item.color && <span> | </span>}
                              {item.color && <span>Color: <strong>{item.color}</strong></span>}
                            </p>
                          )}
                          <p className="mt-1.5 text-sm font-semibold text-primary">
                            {formatINR(item.price)}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => updateQty(item.id, item.qty - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded border border-black/10 hover:bg-white transition"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => updateQty(item.id, item.qty + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded border border-black/10 hover:bg-white transition"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-black/5 px-5 py-4 bg-white space-y-3">
              {/* Delivery Pincode Checker Widget in Cart */}
              <div className={cn(
                'rounded-xl border p-3 text-xs space-y-2 transition',
                deliveryStore.isVerified
                  ? 'border-emerald-200 bg-emerald-50/50'
                  : 'border-amber-300 bg-amber-50/40'
              )}>
                <div className="flex items-center justify-between font-label text-xs font-bold text-ink">
                  <div className="flex items-center gap-1.5">
                    <MapPin className={cn('h-3.5 w-3.5', deliveryStore.isVerified ? 'text-emerald-600' : 'text-amber-600')} />
                    <span>Delivery Pincode</span>
                  </div>
                  {deliveryStore.isVerified && (
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Verified ({deliveryStore.pincode})
                    </span>
                  )}
                </div>

                {!deliveryStore.isVerified && (
                  <form onSubmit={handleCheckDelivery} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      maxLength={6}
                      value={inputPincode}
                      onChange={(e) => setInputPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter Pincode (e.g. 400050)"
                      className="flex-1 rounded-lg border border-primary/20 bg-white px-3 py-1.5 text-xs font-mono font-medium outline-none focus:border-primary"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white uppercase hover:bg-primary-deep transition"
                    >
                      Check
                    </button>
                  </form>
                )}

                {pincodeError && (
                  <p className="flex items-center gap-1 text-[11px] text-red-500 font-medium">
                    <AlertCircle className="h-3 w-3" /> {pincodeError}
                  </p>
                )}

                {!deliveryStore.isVerified && (
                  <p className="text-[11px] text-amber-800 flex items-center gap-1">
                    <Lock className="h-3 w-3 text-amber-600 shrink-0" />
                    <span>Check pincode above to enable <strong>Checkout</strong>.</span>
                  </p>
                )}
              </div>

              <div className="flex justify-between font-heading text-lg pt-1">
                <span className="text-ink-muted font-medium">Subtotal</span>
                <span className="font-bold text-primary">{formatINR(getSubtotal())}</span>
              </div>

              {deliveryStore.isVerified ? (
                <Button className="w-full text-xs tracking-widest uppercase py-3.5" type="button">
                  <Link to="/checkout" onClick={closeCart} className="contents">
                    CHECKOUT
                  </Link>
                </Button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full rounded-xl bg-gray-300 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-widest cursor-not-allowed opacity-80"
                >
                  ENTER PINCODE TO CHECKOUT
                </button>
              )}

              <p className="text-center text-[11px] text-ink-muted">
                Free Delivery &amp; Taxes calculated at checkout
              </p>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
