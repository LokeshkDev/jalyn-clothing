export default function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] rounded-[18px] bg-rose-light/60" />
      <div className="mt-3 space-y-2 px-0.5">
        <div className="h-3 w-1/3 rounded bg-rose-light/80" />
        <div className="h-4 w-3/4 rounded bg-rose-light" />
        <div className="h-4 w-1/2 rounded bg-rose-light/70" />
        <div className="h-3 w-2/5 rounded bg-rose-light/50" />
      </div>
    </div>
  )
}
