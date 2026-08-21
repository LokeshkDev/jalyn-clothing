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
      height: 42,
      showText: false,
      moduleWidth: 2,
      quietZone: 5,
      barColor: '#000000',
      backgroundColor: '#ffffff'
    });
  }, [barcode]);

  return (
    <div
      className={`bg-white flex flex-col items-center justify-between box-border overflow-hidden ${
        forPrint ? '' : 'border border-gray-200 shadow-sm'
      }`}
      style={{
        width: '50mm',
        height: '25mm',
        padding: '1mm 1.5mm'
      }}
    >
      <div className="w-full text-center flex-1 flex flex-col justify-start items-center overflow-hidden">
        {/* Company Name */}
        <div
          style={{ fontSize: '6pt', letterSpacing: '1.5px', lineHeight: '1.25' }}
          className="font-sans font-bold uppercase text-black"
        >
          {companyName}
        </div>

        {/* Product Name */}
        {showProductName && productName && (
          <div
            style={{ fontSize: '6.5pt', lineHeight: '1.15' }}
            className="font-sans font-semibold text-black mt-0.5 line-clamp-1 w-full text-center px-0.5"
            title={productName}
          >
            {productName}
          </div>
        )}

        {/* Variant Info Line */}
        <div
          style={{ fontSize: '5.5pt' }}
          className="font-sans text-black mt-0.5 flex items-center justify-center gap-1 flex-wrap w-full"
        >
          {showColor && color && <span>{color}</span>}
          {showColor && color && showSize && size && <span>•</span>}
          {showSize && size && <span>{size}</span>}
          {((showColor && color) || (showSize && size)) && showPrice && price && <span>•</span>}
          {showPrice && price && <span>₹{price}</span>}
        </div>
      </div>

      {/* Barcode Area */}
      <div className="w-full flex flex-col items-center justify-end shrink-0" style={{ height: '42%' }}>
        {barcode ? (
          <>
            <div
              className="w-full flex justify-center items-end"
              dangerouslySetInnerHTML={{ __html: barcodeSvg }}
            />
            {showBarcodeNumber && (
              <div style={{ fontSize: '5.5pt', marginTop: '0.5mm', lineHeight: '1.2' }} className="font-mono text-black font-semibold tracking-tight">
                {barcode}
              </div>
            )}
          </>
        ) : (
          <div className="text-gray-400 text-[5.5pt] italic pb-1">No barcode data</div>
        )}
      </div>
    </div>
  );
}
