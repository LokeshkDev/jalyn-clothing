import { Link } from 'react-router-dom'

export default function MobilePromo() {
  return (
    <section className="mt-6 px-4" aria-label="Sale promotion">
      <div className="relative flex min-h-[150px] overflow-hidden rounded-2xl bg-[#EDE4DC] sm:min-h-[170px]">
        <div className="relative z-10 flex w-[48%] flex-col justify-center py-5 pl-4 pr-2">
          <p className="font-label text-[20px] font-bold leading-tight text-[#4A2F3C] sm:text-[22px]">
            UP TO{' '}
            <span className="text-primary">30% OFF</span>
          </p>
          <p className="mt-1 font-label text-[12px] font-medium text-[#4A2F3C]/80">
            On Selected Styles
          </p>
          <Link
            to="/collections/sale"
            className="mt-3 inline-flex w-fit items-center justify-center rounded-lg bg-primary px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white"
          >
            Shop Now
          </Link>
        </div>
        <div className="absolute inset-y-0 right-0 w-[58%]">
          <img
            src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80"
            alt="Selected styles on sale"
            className="h-full w-full object-cover object-top"
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-[#EDE4DC] to-transparent" />
        </div>
      </div>
    </section>
  )
}
