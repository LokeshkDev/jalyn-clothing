import { cn } from '@/lib/utils'

const STYLES = {
  new: 'bg-primary text-white',
  sale: 'bg-primary-deep text-white',
  limited: 'bg-[#5C3344] text-white',
  discount: 'bg-rose text-primary-deep',
}

export default function ProductBadge({ type, children, className }) {
  return (
    <span
      className={cn(
        'rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
        STYLES[type] || STYLES.new,
        className,
      )}
    >
      {children}
    </span>
  )
}
