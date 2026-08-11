export default function MobileModelInfo({ product }) {
  return (
    <div className="mx-4 flex items-center gap-4 rounded-2xl border border-primary/10 bg-white p-4 shadow-[0_2px_12px_rgba(173,74,133,0.06)]">
      <img
        src={product.images.primary}
        alt="Model wearing outfit"
        className="h-20 w-16 shrink-0 rounded-xl border border-primary/10 object-cover object-top"
      />
      <div className="text-[12px]">
        <p className="text-[14px] font-bold text-[#222222]">Model Information</p>
        <p className="mt-1 text-[13px]">
          Model is wearing: <span className="font-bold text-primary">Size S</span>
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[#666666]">
          <span>
            Height: <strong className="text-[#222222]">5'7"</strong>
          </span>
          <span>
            Bust: <strong className="text-[#222222]">32"</strong>
          </span>
          <span>
            Waist: <strong className="text-[#222222]">26"</strong>
          </span>
          <span>
            Hips: <strong className="text-[#222222]">34"</strong>
          </span>
        </div>
      </div>
    </div>
  )
}
