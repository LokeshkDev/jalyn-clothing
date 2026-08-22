import React, { useMemo } from 'react';
import { generateBarcodeSVG } from '../utils/barcodeEncoder';

export default function BarcodeLabel({
  barcode,
  productName,
  color,
  size,
  price,
  companyName = 'JALYN',
  showProductName = true,
  showColor = true,
  showSize = true,
  showPrice = true,
  showBarcodeNumber = true,
  forPrint = false
}) {
  const barcodeSvg = useMemo(() => {
    if (!barcode) return '';
    return generateBarcodeSVG(barcode, {
      width: '100%',
      height: 36,
      showText: false,
      moduleWidth: 2,
      quietZone: 8,
      barColor: '#000000',
      backgroundColor: '#ffffff'
    });
  }, [barcode]);

  return (
    <div
      className={`bg-white flex flex-col items-center justify-between box-border overflow-hidden select-none ${
        forPrint ? '' : 'border border-gray-300 shadow-xs rounded-sm'
      }`}
      style={{
        width: forPrint ? '48.5mm' : '50mm',
        height: forPrint ? '24mm' : '25mm',
        maxWidth: forPrint ? '48.5mm' : '50mm',
        maxHeight: forPrint ? '24mm' : '25mm',
        padding: '1mm 1.5mm',
        boxSizing: 'border-box',
        overflow: 'hidden',
        background: '#ffffff',
        border: 'none',
        boxShadow: 'none'
      }}
    >
      {/* Top Text Content Area */}
      <div className="w-full text-center flex-1 flex flex-col justify-start items-center overflow-hidden">
        {/* Company / Brand Name - Bold Uppercase */}
        <div
          style={{ fontSize: '7.5pt', letterSpacing: '1.5px', lineHeight: '1.2', fontWeight: 900, color: '#000000' }}
          className="font-sans uppercase text-black"
        >
          {companyName}
        </div>

        {/* Product Name - Bold High-Contrast */}
        {showProductName && productName && (
          <div
            style={{ fontSize: '7pt', lineHeight: '1.2', fontWeight: 800, color: '#000000' }}
            className="font-sans text-black mt-0.5 truncate w-full text-center px-0.5 tracking-tight"
            title={productName}
          >
            {productName}
          </div>
        )}

        {/* Variant Info Line: Color • Size • Price */}
        <div
          style={{ fontSize: '6.5pt', lineHeight: '1.2', fontWeight: 700, color: '#000000' }}
          className="font-sans text-black mt-0.5 flex items-center justify-center gap-1 flex-nowrap w-full overflow-hidden truncate"
        >
          {showColor && color && <span>{color}</span>}
          {showColor && color && showSize && size && <span className="font-extrabold">•</span>}
          {showSize && size && <span>{size}</span>}
          {((showColor && color) || (showSize && size)) && showPrice && price && <span className="font-extrabold">•</span>}
          {showPrice && price && <span>₹{Number(price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>}
        </div>
      </div>

      {/* Barcode Area - Bold Sharp SVG & Monospace Number */}
      <div className="w-full flex flex-col items-center justify-end shrink-0" style={{ height: '50%' }}>
        {barcode ? (
          <>
            <div
              className="w-full flex justify-center items-end overflow-hidden"
              style={{ maxHeight: '28px' }}
              dangerouslySetInnerHTML={{ __html: barcodeSvg }}
            />
            {showBarcodeNumber && (
              <div
                style={{ fontSize: '6.5pt', marginTop: '0.4mm', lineHeight: '1.1', letterSpacing: '1px', fontWeight: 900, color: '#000000' }}
                className="font-mono text-black text-center w-full"
              >
                {barcode}
              </div>
            )}
          </>
        ) : (
          <div className="text-gray-400 text-[6pt] italic pb-1">No barcode</div>
        )}
      </div>
    </div>
  );
}
