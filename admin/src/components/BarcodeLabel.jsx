import React, { useMemo } from 'react';
import { generateBarcodeSVG } from '../utils/barcodeEncoder';

export default function BarcodeLabel({
  barcode,
  productName,
  barcodeShortName,
  barcode_short_name,
  size,
  price,
  mrp,
  companyName = 'JALYN APPARELS',
  showProductName = true,
  showSize = true,
  showPrice = true,
  showBarcodeNumber = true,
  forPrint = false
}) {
  const displayPrice = mrp !== undefined && mrp !== null && mrp !== '' ? mrp : price;
  const clothName = (barcodeShortName && barcodeShortName.trim()) || (barcode_short_name && barcode_short_name.trim()) || productName || '';
  const formattedSize = size ? `(${String(size).replace(/^\(|\)$/g, '').trim()})` : '';

  const barcodeSvg = useMemo(() => {
    if (!barcode) return '';
    return generateBarcodeSVG(barcode, {
      width: '100%',
      height: 28,
      showText: false,
      moduleWidth: 2,
      quietZone: 6,
      barColor: '#000000',
      backgroundColor: '#ffffff'
    });
  }, [barcode]);

  // Combined code line: "JN-43320 (M) KURTIN"
  const barcodeRowParts = [];
  if (showBarcodeNumber && barcode) {
    barcodeRowParts.push(barcode);
  }
  if (showSize && formattedSize) {
    barcodeRowParts.push(formattedSize);
  }
  if (showProductName && clothName) {
    barcodeRowParts.push(clothName.toUpperCase());
  }
  const combinedBarcodeInfo = barcodeRowParts.join(' ');

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
        padding: '1.2mm 1mm 0.4mm',
        boxSizing: 'border-box',
        overflow: 'hidden',
        background: '#ffffff',
        border: 'none',
        boxShadow: 'none'
      }}
    >
      {/* 1. Shop / Company Name (JALYN APPARELS in CAPS, increased 2px font size, spaced down from top edge) */}
      <div
        style={{
          fontSize: '10.5pt',
          letterSpacing: '1px',
          lineHeight: '1.05',
          fontWeight: 900,
          color: '#000000',
          marginBottom: '0.4mm'
        }}
        className="font-sans uppercase text-black w-full text-center truncate shrink-0"
      >
        {String(companyName || 'JALYN APPARELS').toUpperCase()}
      </div>

      {/* 2. Barcode Visual */}
      <div className="w-full flex flex-col items-center justify-center overflow-hidden shrink-0 my-0.2">
        {barcode ? (
          <div
            className="w-full flex justify-center items-center overflow-hidden"
            style={{ maxHeight: '26px', height: '26px' }}
            dangerouslySetInnerHTML={{ __html: barcodeSvg }}
          />
        ) : (
          <div className="text-gray-400 text-[6pt] italic">No barcode</div>
        )}
      </div>

      {/* 3. Barcode Code + (Size) + Short Name in ONE Row */}
      {combinedBarcodeInfo && (
        <div
          style={{
            fontSize: '8.5pt',
            lineHeight: '1.1',
            letterSpacing: '0.5px',
            fontWeight: 900,
            color: '#000000',
            marginTop: '0.2mm'
          }}
          className="font-mono text-black text-center w-full truncate shrink-0 px-0.5"
          title={combinedBarcodeInfo}
        >
          {combinedBarcodeInfo}
        </div>
      )}

      {/* 4. Price (Extra Bold, Increased Font Size, Rupee symbol.00, No MRP) */}
      {showPrice && displayPrice && (
        <div
          style={{
            fontSize: '13pt',
            lineHeight: '1.05',
            fontWeight: 900,
            color: '#000000',
            letterSpacing: '-0.3px'
          }}
          className="font-sans text-black text-center w-full shrink-0 tracking-tight"
        >
          ₹{Number(displayPrice).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      )}
    </div>
  );
}
