import { RotateCcw, ShieldCheck, Truck, HelpCircle } from 'lucide-react'

export default function Returns() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-ink">Returns & Refunds</h2>
        <p className="text-xs text-ink-muted">Track return requests and understand JALYN return policies</p>
      </div>

      {/* Policy Card */}
      <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-soft space-y-4 text-xs text-ink-muted leading-relaxed">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-light/50 text-primary">
            <RotateCcw className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-heading text-sm font-bold text-ink">7-Day Easy Returns & Instant Exchange</h4>
            <p className="text-xs text-ink-muted">Hassle-free reverse doorstep pickup across India</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="rounded-xl bg-surface p-3 border border-primary/5">
            <span className="font-bold text-ink block mb-1">1. Initiate Request</span>
            <span>Go to My Orders and click "Return / Exchange" within 7 days of delivery.</span>
          </div>
          <div className="rounded-xl bg-surface p-3 border border-primary/5">
            <span className="font-bold text-ink block mb-1">2. Doorstep Pickup</span>
            <span>Our courier agent will collect the item from your address within 48 hours.</span>
          </div>
          <div className="rounded-xl bg-surface p-3 border border-primary/5">
            <span className="font-bold text-ink block mb-1">3. Instant Refund</span>
            <span>Refund is processed directly to your original payment method or JALYN wallet.</span>
          </div>
        </div>
      </div>

      {/* Recent Return Requests */}
      <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-soft text-center py-12">
        <RotateCcw className="mx-auto h-10 w-10 text-primary/30 mb-2" />
        <h4 className="font-heading text-sm font-bold text-ink">No Active Return Requests</h4>
        <p className="text-xs text-ink-muted mt-1">All your past orders are within standard return timelines.</p>
      </div>
    </div>
  )
}
