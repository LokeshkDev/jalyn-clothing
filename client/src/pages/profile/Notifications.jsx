import { Bell, CheckCircle2 } from 'lucide-react'
import { useUserStore } from '@/store'
import { cn } from '@/lib/utils'

export default function Notifications() {
  const notifications = useUserStore((s) => s.notifications)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-ink">Notifications</h2>
        <p className="text-xs text-ink-muted">Stay updated on your orders, deliveries, and offers</p>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={cn(
              'rounded-2xl border p-4 transition-all text-xs flex items-start gap-3.5 bg-white shadow-soft',
              n.read ? 'border-primary/10 opacity-80' : 'border-primary bg-rose-light/10',
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-light/50 text-primary">
              <Bell className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-ink text-sm">{n.title}</h4>
                <span className="text-[11px] text-ink-muted">{n.time}</span>
              </div>
              <p className="mt-1 text-ink-muted leading-relaxed">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
