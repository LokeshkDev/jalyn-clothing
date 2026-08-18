export default function HomePageSkeleton() {
  return (
    <div className="animate-pulse bg-white" aria-busy="true" aria-label="Loading homepage">
      {/* Hero Banner */}
      <section className="bg-[#F7F0F3]">
        <div className="container-luxury max-w-7xl grid gap-8 px-4 py-10 sm:px-6 md:py-16 lg:grid-cols-2 lg:items-center">
          <div className="space-y-4">
            <div className="h-3 w-28 rounded bg-rose-light/80" />
            <div className="h-9 w-4/5 rounded bg-rose-light/70" />
            <div className="h-9 w-3/5 rounded bg-rose-light/70" />
            <div className="h-4 w-2/3 rounded bg-rose-light/60" />
            <div className="flex gap-3 pt-2">
              <div className="h-12 w-40 rounded-full bg-rose-light/80" />
              <div className="h-12 w-32 rounded-full bg-rose-light/50" />
            </div>
          </div>
          <div className="aspect-[4/3] rounded-[24px] bg-rose-light/50 lg:aspect-[4/5]" />
        </div>
      </section>

      {/* Category Grid */}
      <section className="container-luxury max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="h-3 w-32 rounded bg-rose-light/70" />
          <div className="h-8 w-64 rounded bg-rose-light/60" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[3/4] rounded-2xl bg-rose-light/50" />
              <div className="mx-auto h-4 w-2/3 rounded bg-rose-light/70" />
              <div className="mx-auto h-3 w-1/3 rounded bg-rose-light/50" />
            </div>
          ))}
        </div>
      </section>

      {/* New Arrivals / Product Carousel */}
      <section className="container-luxury max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-8 w-52 rounded bg-rose-light/60" />
          <div className="hidden h-8 w-24 rounded bg-rose-light/50 md:block" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-[4/5] rounded-[18px] bg-rose-light/60" />
              <div className="h-3 w-1/3 rounded bg-rose-light/70" />
              <div className="h-4 w-3/4 rounded bg-rose-light/80" />
              <div className="h-4 w-1/2 rounded bg-rose-light/60" />
            </div>
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="container-luxury max-w-7xl px-4 py-12 sm:px-6">
        <div className="aspect-[4/3] rounded-[24px] bg-rose-light/50 md:aspect-[21/9]" />
      </section>

      {/* Why Jalyn */}
      <section className="container-luxury max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="h-3 w-32 rounded bg-rose-light/70" />
          <div className="h-8 w-72 rounded bg-rose-light/60" />
        </div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3 text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-rose-light/60" />
              <div className="mx-auto h-4 w-3/4 rounded bg-rose-light/70" />
              <div className="mx-auto h-3 w-full rounded bg-rose-light/50" />
              <div className="mx-auto h-3 w-2/3 rounded bg-rose-light/50" />
            </div>
          ))}
        </div>
      </section>

      {/* Services Strip */}
      <section className="border-y border-primary/10 bg-[#F7F0F3] py-10">
        <div className="container-luxury max-w-7xl grid grid-cols-2 gap-8 px-4 sm:px-6 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-rose-light/60" />
              <div className="h-3 w-24 rounded bg-rose-light/70" />
            </div>
          ))}
        </div>
      </section>

      {/* Instagram Feed */}
      <section className="container-luxury max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="h-3 w-40 rounded bg-rose-light/70" />
          <div className="h-8 w-56 rounded bg-rose-light/60" />
        </div>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-rose-light/50" />
          ))}
        </div>
      </section>
    </div>
  )
}