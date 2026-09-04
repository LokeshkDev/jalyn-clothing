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
  showSellingPrice = false,
  showBarcodeNumber = true,
  layoutMode = '2_per_row', // '3_per_row', '2_per_row' (default), '1_per_row'
  forPrint = false
}) {
  const isThreePerRow = layoutMode === '3_per_row';
  const displayMrp = mrp !== undefined && mrp !== null && mrp !== '' ? mrp : price;
  const displaySellingPrice = price !== undefined && price !== null && price !== '' ? price : mrp;
  const clothName = (barcodeShortName && barcodeShortName.trim()) || (barcode_short_name && barcode_short_name.trim()) || productName || '';
  const formattedSize = size ? `(${String(size).replace(/^\(|\)$/g, '').trim()})` : '';

  const barcodeSvg = useMemo(() => {
    if (!barcode) return '';
    return generateBarcodeSVG(barcode, {
      width: '100%',
      height: isThreePerRow ? 22 : 28,
      showText: false,
      moduleWidth: isThreePerRow ? 1.5 : 2,
      quietZone: isThreePerRow ? 4 : 6,
      barColor: '#000000',
      backgroundColor: '#ffffff'
    });
  }, [barcode, isThreePerRow]);

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

  // Format Price Line (MRP and/or Selling Price)
  const priceParts = [];
  if (showPrice && displayMrp) {
    priceParts.push(`MRP: ₹${Number(displayMrp).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`);
  }
  if (showSellingPrice && displaySellingPrice) {
    priceParts.push(`SP: ₹${Number(displaySellingPrice).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`);
  }
  const priceLineText = priceParts.join('  ');

  const labelWidth = isThreePerRow
    ? (forPrint ? '32.5mm' : '33mm')
    : (forPrint ? '48.5mm' : '50mm');
  const labelHeight = forPrint ? '24mm' : '25mm';

  return (
    <div
      className={`bg-white flex flex-col items-center justify-between box-border overflow-hidden select-none ${
        forPrint ? '' : 'border border-gray-300 shadow-xs rounded-sm'
      }`}
      style={{
        width: labelWidth,
        height: labelHeight,
        maxWidth: labelWidth,
        maxHeight: labelHeight,
        padding: isThreePerRow ? '0.8mm 0.6mm 0.2mm' : '1.2mm 1mm 0.4mm',
        boxSizing: 'border-box',
        overflow: 'hidden',
        background: '#ffffff',
        border: 'none',
        boxShadow: 'none'
      }}
    >
      {/* 1. Shop / Company Name */}
      <div
        style={{
          fontSize: isThreePerRow ? '7.5pt' : '10.5pt',
          letterSpacing: isThreePerRow ? '0.3px' : '1px',
          lineHeight: '1.05',
          fontWeight: 900,
          color: '#000000',
          marginBottom: isThreePerRow ? '0.2mm' : '0.4mm'
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
            style={{ maxHeight: isThreePerRow ? '20px' : '26px', height: isThreePerRow ? '20px' : '26px' }}
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
            fontSize: isThreePerRow ? '6.8pt' : '8.5pt',
            lineHeight: '1.1',
            letterSpacing: isThreePerRow ? '0.2px' : '0.5px',
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

      {/* 4. Price Line (MRP / Selling Price) */}
      {priceLineText && (
        <div
          style={{
            fontSize: isThreePerRow ? (priceParts.length > 1 ? '7.5pt' : '9.5pt') : (priceParts.length > 1 ? '10pt' : '12pt'),
            lineHeight: '1.05',
            fontWeight: 900,
            color: '#000000',
            letterSpacing: '-0.3px'
          }}
          className="font-sans text-black text-center w-full shrink-0 tracking-tight truncate px-0.5"
          title={priceLineText}
        >
          {priceLineText}
        </div>
      )}
    </div>
  );
}
