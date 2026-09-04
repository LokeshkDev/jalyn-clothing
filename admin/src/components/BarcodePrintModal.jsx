import React, { useState, useEffect, useMemo } from 'react';
import { X, Printer, Download, Plus, Minus, Info } from 'lucide-react';
import BarcodeLabel from './BarcodeLabel';
import { generateBarcodeSVG, generateBarcodePNG } from '../utils/barcodeEncoder';
import { BARCODE_LABEL_CONFIG } from '../utils/barcodeLabelConfig';

const LABEL_WIDTH_MM = 33;
const LABEL_HEIGHT_MM = 25;

const BarcodePrintModal = ({ isOpen, onClose, barcodes = [], defaultCopies = 1 }) => {
  const [copiesMap, setCopiesMap] = useState({});
  const [globalCopies, setGlobalCopies] = useState(defaultCopies);
  const [layoutMode, setLayoutMode] = useState('2_per_row'); // Default to '2_per_row' (100mm 2 Stickers / Row)

  const [companyName, setCompanyName] = useState(BARCODE_LABEL_CONFIG.label.companyName);

  const [showProductName, setShowProductName] = useState(BARCODE_LABEL_CONFIG.label.showProductName);
  const [showColor, setShowColor] = useState(BARCODE_LABEL_CONFIG.label.showColor);
  const [showSize, setShowSize] = useState(BARCODE_LABEL_CONFIG.label.showSize);
  const [showPrice, setShowPrice] = useState(BARCODE_LABEL_CONFIG.label.showPrice); // MRP
  const [showSellingPrice, setShowSellingPrice] = useState(false); // Selling Price (SP)
  const [showBarcodeNumber, setShowBarcodeNumber] = useState(BARCODE_LABEL_CONFIG.label.showBarcodeNumber);

  const labelsPerRow = layoutMode === '3_per_row' ? 3 : (layoutMode === '2_per_row' ? 2 : 1);
  const currentLabelWidthMm = layoutMode === '3_per_row' ? 33 : 48.5;
  const pageWidthMm = layoutMode === '3_per_row' ? 105 : (layoutMode === '2_per_row' ? 100 : 50);

  useEffect(() => {
    if (isOpen) {
      const initialMap = {};
      barcodes.forEach(b => {
        initialMap[b.barcode] = defaultCopies;
      });
      setCopiesMap(initialMap);
      setGlobalCopies(defaultCopies);
    }
  }, [isOpen, barcodes, defaultCopies]);

  const handleGlobalCopiesChange = (val) => {
    const newCopies = Math.max(1, Math.min(50, val));
    setGlobalCopies(newCopies);
    const newMap = {};
    barcodes.forEach(b => {
      newMap[b.barcode] = newCopies;
    });
    setCopiesMap(newMap);
  };

  const handleCopyChange = (barcode, delta) => {
    setCopiesMap(prev => {
      const current = prev[barcode] || 1;
      const next = Math.max(1, Math.min(50, current + delta));
      return { ...prev, [barcode]: next };
    });
  };

  const handlePrint = () => {
    const isThreePerRow = layoutMode === '3_per_row';
    const isTwoPerRow = layoutMode === '2_per_row';
    const rowWidth = isThreePerRow ? '105mm' : (isTwoPerRow ? '100mm' : '50mm');
    const labelWidth = isThreePerRow ? '33mm' : '48.5mm';
    const labelHeight = '24mm';
    const rowHeight = '25mm';

    const rowsHtml = printRows.map((row) => {
      const labelsHtml = row.map((item) => {
        const barcodeSvg = generateBarcodeSVG(item.barcode, {
          width: '100%',
          height: isThreePerRow ? 22 : 28,
          showText: false,
          moduleWidth: isThreePerRow ? 1.5 : 2,
          quietZone: isThreePerRow ? 4 : 6,
          barColor: '#000000',
          backgroundColor: '#ffffff'
        });

        const displayMrp = item.mrp !== undefined && item.mrp !== null && item.mrp !== '' ? item.mrp : (item.original_price || item.compare_price || item.price);
        const displaySellingPrice = item.price !== undefined && item.price !== null && item.price !== '' ? item.price : item.mrp;
        const clothName = (item.barcodeShortName && item.barcodeShortName.trim()) || (item.barcode_short_name && item.barcode_short_name.trim()) || item.productName || '';
        const formattedSize = item.size ? `(${String(item.size).replace(/^\(|\)$/g, '').trim()})` : '';

        const barcodeRowParts = [];
        if (showBarcodeNumber && item.barcode) {
          barcodeRowParts.push(item.barcode);
        }
        if (showSize && formattedSize) {
          barcodeRowParts.push(formattedSize);
        }
        if (showProductName && clothName) {
          barcodeRowParts.push(clothName.toUpperCase());
        }
        const combinedBarcodeInfo = barcodeRowParts.join(' ');

        const priceParts = [];
        if (showPrice && displayMrp) {
          priceParts.push(`MRP: ₹${Number(displayMrp).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`);
        }
        if (showSellingPrice && displaySellingPrice) {
          priceParts.push(`SP: ₹${Number(displaySellingPrice).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`);
        }
        const priceLineText = priceParts.join(' &nbsp; ');

        return `
          <div class="sticker-label">
            <div class="brand-title">${String(companyName || 'JALYN APPARELS').toUpperCase().replace(/[&<>"']/g, '')}</div>
            <div class="barcode-box">
              ${barcodeSvg}
            </div>
            ${combinedBarcodeInfo ? `<div class="barcode-num">${String(combinedBarcodeInfo).replace(/[&<>"']/g, '')}</div>` : ''}
            ${priceLineText ? `<div class="price-line" style="${priceParts.length > 1 ? 'font-size:' + (isThreePerRow ? '7.5pt' : '10pt') : ''}">${priceLineText}</div>` : ''}
          </div>
        `;
      }).join('');

      return `<div class="sticker-row">${labelsHtml}</div>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Barcode Stickers - ${layoutMode}</title>
<style>
  @page {
    size: ${rowWidth} ${rowHeight};
    margin: 0;
  }
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    width: ${rowWidth} !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .sticker-row {
    width: ${rowWidth} !important;
    height: ${rowHeight} !important;
    max-height: ${rowHeight} !important;
    display: flex !important;
    flex-direction: row !important;
    justify-content: ${isThreePerRow || isTwoPerRow ? 'space-between' : 'center'} !important;
    align-items: center !important;
    padding: ${isThreePerRow ? '0.3mm 0.5mm' : '0.4mm 0.8mm'} !important;
    box-sizing: border-box !important;
    page-break-after: always !important;
    break-after: page !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    overflow: hidden !important;
    background: #ffffff !important;
  }
  .sticker-label {
    width: ${labelWidth} !important;
    height: ${labelHeight} !important;
    max-width: ${labelWidth} !important;
    max-height: ${labelHeight} !important;
    box-sizing: border-box !important;
    padding: ${isThreePerRow ? '0.8mm 0.6mm 0.2mm' : '1.2mm 1mm 0.4mm'} !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
    align-items: center !important;
    text-align: center !important;
    background: #ffffff !important;
    border: none !important;
    box-shadow: none !important;
    overflow: hidden !important;
  }
  .brand-title {
    font-size: ${isThreePerRow ? '7.5pt' : '10.5pt'};
    font-weight: 900;
    letter-spacing: ${isThreePerRow ? '0.3px' : '1px'};
    line-height: 1.05;
    text-transform: uppercase;
    color: #000000;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: ${isThreePerRow ? '0.2mm' : '0.4mm'};
  }
  .barcode-box {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0.1mm 0;
  }
  .barcode-box svg {
    max-height: ${isThreePerRow ? '20px' : '26px'};
    height: ${isThreePerRow ? '20px' : '26px'};
    width: 100%;
    shape-rendering: crispEdges;
  }
  .barcode-num {
    font-family: monospace;
    font-size: ${isThreePerRow ? '6.8pt' : '8.5pt'};
    font-weight: 900;
    letter-spacing: ${isThreePerRow ? '0.2px' : '0.5px'};
    line-height: 1.1;
    color: #000000;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }
  .price-line {
    font-size: ${isThreePerRow ? '9.5pt' : '12pt'};
    font-weight: 900;
    line-height: 1.05;
    color: #000000;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    letter-spacing: -0.3px;
  }
  @media print {
    @page {
      size: ${rowWidth} ${rowHeight};
      margin: 0 !important;
    }
    html, body {
      width: ${rowWidth} !important;
      height: ${rowHeight} !important;
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
    }
  }
</style>
</head>
<body>
  ${rowsHtml}
</body>
</html>`;

    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 2000);
    }, 350);
  };

  const downloadBarcodePNG = (item) => {
    const labelData = {
      companyName,
      productName: item.productName,
      color: item.color,
      size: item.size,
      price: item.price,
      mrp: item.mrp,
      barcode: item.barcode
    };

    const config = {
      ...BARCODE_LABEL_CONFIG,
      label: {
        ...BARCODE_LABEL_CONFIG.label,
        companyName,
        showProductName,
        showColor,
        showSize,
        showPrice,
        showSellingPrice,
        showBarcodeNumber
      }
    };

    const dataUrl = generateBarcodePNG(labelData, config);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `barcode_${item.barcode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadPNG = () => {
    if (barcodes.length === 1) {
      downloadBarcodePNG(barcodes[0]);
    } else {
      barcodes.forEach(b => {
        downloadBarcodePNG(b);
      });
    }
  };

  // Expand copies into the full label list, then chunk into rows
  const printLabels = useMemo(() => {
    const list = [];
    barcodes.forEach(item => {
      const count = copiesMap[item.barcode] || 1;
      for (let i = 0; i < count; i++) {
        list.push(item);
      }
    });
    return list;
  }, [barcodes, copiesMap]);

  const printRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < printLabels.length; i += labelsPerRow) {
      rows.push(printLabels.slice(i, i + labelsPerRow));
    }
    return rows;
  }, [printLabels, labelsPerRow]);

  const totalRows = printRows.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[850px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <Printer className="w-5 h-5 text-brand-600" />
            <h2 className="text-xl font-heading font-semibold text-gray-900">Print Barcode Labels (50mm × 25mm)</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">

          {/* Left: Preview Area */}
          <div className="flex-1 min-w-0 bg-gray-50 overflow-y-auto p-6 flex flex-col relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-700">Preview</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-xs">
                  {printLabels.length} Total Labels
                </span>
                <span className="text-xs font-semibold text-gray-600 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-xs">
                  {totalRows} Row{totalRows === 1 ? '' : 's'} ({layoutMode === '3_per_row' ? '3 Stickers / Row' : (layoutMode === '2_per_row' ? '2 Stickers / Row' : '1 Sticker / Row')})
                </span>
              </div>
            </div>

            <div className="flex-1 flex items-start justify-center">
              <div className="w-full max-w-full space-y-6">
                {barcodes.map(item => (
                  <div key={item.barcode} className="flex flex-col items-center gap-2">
                    <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center">
                      <BarcodeLabel
                        barcode={item.barcode}
                        productName={item.productName}
                        barcodeShortName={item.barcodeShortName || item.barcode_short_name}
                        size={item.size}
                        price={item.price}
                        mrp={item.mrp || item.original_price || item.compare_price || item.price}
                        companyName={companyName}
                        showProductName={showProductName}
                        showColor={showColor}
                        showSize={showSize}
                        showPrice={showPrice}
                        showSellingPrice={showSellingPrice}
                        showBarcodeNumber={showBarcodeNumber}
                        layoutMode={layoutMode}
                        forPrint={false}
                      />
                    </div>

                    {/* Copy Control */}
                    <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                      <button
                        onClick={() => handleCopyChange(item.barcode, -1)}
                        className="p-1 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                        disabled={(copiesMap[item.barcode] || 1) <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center text-sm font-bold text-gray-700">
                        {copiesMap[item.barcode] || 1}
                      </span>
                      <button
                        onClick={() => handleCopyChange(item.barcode, 1)}
                        className="p-1 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                        disabled={(copiesMap[item.barcode] || 1) >= 50}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Bulk row layout preview */}
                {barcodes.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-3 font-bold">
                      Print sheet layout preview ({pageWidthMm}mm × {LABEL_HEIGHT_MM}mm per row):
                    </p>
                    <div className="space-y-1.5 bg-white p-3 rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                      {printRows.slice(0, 4).map((row, rIdx) => (
                        <div key={rIdx} className="flex justify-between border border-dashed border-gray-300" style={{ width: `${pageWidthMm}mm` }}>
                          {row.map((item, i) => (
                            <div key={i} style={{ width: `${currentLabelWidthMm}mm`, height: `${LABEL_HEIGHT_MM}mm` }} className="shrink-0">
                              <BarcodeLabel
                                barcode={item.barcode}
                                productName={item.productName}
                                barcodeShortName={item.barcodeShortName || item.barcode_short_name}
                                size={item.size}
                                price={item.price}
                                mrp={item.mrp || item.original_price || item.compare_price || item.price}
                                companyName={companyName}
                                showProductName={showProductName}
                                showColor={showColor}
                                showSize={showSize}
                                showPrice={showPrice}
                                showSellingPrice={showSellingPrice}
                                showBarcodeNumber={showBarcodeNumber}
                                layoutMode={layoutMode}
                                forPrint={false}
                              />
                            </div>
                          ))}
                        </div>
                      ))}
                      {printRows.length > 4 && (
                        <p className="text-[10px] text-gray-400 text-center pt-1 font-semibold">
                          + {printRows.length - 4} more row{printRows.length - 4 === 1 ? '' : 's'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="w-full md:w-[340px] border-l border-gray-200 bg-white flex flex-col h-full shrink-0">
            <div className="flex-1 overflow-y-auto p-5 space-y-5">

              {/* Printer Roll Mode Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-900 uppercase tracking-wide block">Sticker Roll Format</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setLayoutMode('3_per_row')}
                    className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-0.5 cursor-pointer ${
                      layoutMode === '3_per_row'
                        ? 'border-[#2A1A22] bg-[#2A1A22] text-white font-bold shadow-xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-[11px] font-black">3 / Row</span>
                    <span className="text-[9px] opacity-80">TVS (105mm)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutMode('2_per_row')}
                    className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-0.5 cursor-pointer ${
                      layoutMode === '2_per_row'
                        ? 'border-[#2A1A22] bg-[#2A1A22] text-white font-bold shadow-xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-[11px] font-black">2 / Row</span>
                    <span className="text-[9px] opacity-80">100mm</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutMode('1_per_row')}
                    className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-0.5 cursor-pointer ${
                      layoutMode === '1_per_row'
                        ? 'border-[#2A1A22] bg-[#2A1A22] text-white font-bold shadow-xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-[11px] font-black">1 / Row</span>
                    <span className="text-[9px] opacity-80">50mm</span>
                  </button>
                </div>
              </div>

              {/* TVS LP-46 Lite Setup Guide */}
              <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-3 space-y-1.5 text-xs text-amber-900">
                <div className="font-black flex items-center gap-1.5 text-amber-950 text-[11.5px]">
                  <Printer className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>TVS LP-46 Lite Print Settings</span>
                </div>
                <ul className="list-disc pl-3.5 space-y-1 font-semibold text-[10.5px] text-amber-900 leading-tight">
                  <li><strong>Destination:</strong> TVS LP-46 Lite</li>
                  <li><strong>Paper Size:</strong> 105mm × 25mm (or 3-Up Label)</li>
                  <li><strong>Margins:</strong> None (0mm)</li>
                  <li><strong>Options:</strong> <span className="text-red-700 font-black underline">UNCHECK "Headers & Footers"</span></li>
                </ul>
              </div>

              {/* Global Copies */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">Copies Per Label</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={globalCopies}
                    onChange={(e) => handleGlobalCopiesChange(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                  <span className="text-xs text-gray-500 whitespace-nowrap">per label</span>
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Content Settings */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Label Content</h3>

                <div className="space-y-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">Company / Brand Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      placeholder="e.g. JALYN APPARELS"
                    />
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showProductName}
                        onChange={(e) => setShowProductName(e.target.checked)}
                        className="w-3.5 h-3.5 text-brand-600 rounded border-gray-300 focus:ring-brand-500 cursor-pointer"
                      />
                      <span className="text-xs font-medium text-gray-700">Product / Short Name</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showSize}
                        onChange={(e) => setShowSize(e.target.checked)}
                        className="w-3.5 h-3.5 text-brand-600 rounded border-gray-300 focus:ring-brand-500 cursor-pointer"
                      />
                      <span className="text-xs font-medium text-gray-700">Size</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showPrice}
                        onChange={(e) => setShowPrice(e.target.checked)}
                        className="w-3.5 h-3.5 text-brand-600 rounded border-gray-300 focus:ring-brand-500 cursor-pointer"
                      />
                      <span className="text-xs font-medium text-gray-700">MRP / Tag Price (MRP ₹)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showSellingPrice}
                        onChange={(e) => setShowSellingPrice(e.target.checked)}
                        className="w-3.5 h-3.5 text-brand-600 rounded border-gray-300 focus:ring-brand-500 cursor-pointer"
                      />
                      <span className="text-xs font-medium text-gray-700">Selling Price (SP ₹)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showBarcodeNumber}
                        onChange={(e) => setShowBarcodeNumber(e.target.checked)}
                        className="w-3.5 h-3.5 text-brand-600 rounded border-gray-300 focus:ring-brand-500 cursor-pointer"
                      />
                      <span className="text-xs font-medium text-gray-700">Barcode Digits</span>
                    </label>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex flex-col gap-2.5 shrink-0">
              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 bg-[#2A1A22] hover:bg-[#3D2631] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-pink-300" />
                Print Sticker Sheet
              </button>
              <button
                onClick={handleDownloadPNG}
                className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download PNG
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Print Area */}
      <div id="barcode-print-area" style={{ display: 'none' }}>
        {printRows.map((row, rowIndex) => (
          <div key={rowIndex} className="print-label-row">
            {row.map((item, labelIndex) => (
              <div key={`${item.barcode}-${rowIndex}-${labelIndex}`} className="print-label">
                <BarcodeLabel
                  barcode={item.barcode}
                  productName={item.productName}
                  color={item.color}
                  size={item.size}
                  price={item.price}
                  companyName={companyName}
                  showProductName={showProductName}
                  showColor={showColor}
                  showSize={showSize}
                  showPrice={showPrice}
                  showBarcodeNumber={showBarcodeNumber}
                  forPrint={true}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Print Styles — exact physical dimensions, zero margins, bold black text */}
      <style dangerouslySetInnerHTML={{ __html: `
        @page barcode-row {
          size: ${pageWidthMm}mm ${LABEL_HEIGHT_MM}mm;
          margin: 0;
        }

        @media print {
          body * {
            visibility: hidden !important;
          }
          #barcode-print-area,
          #barcode-print-area * {
            visibility: visible !important;
          }
          #barcode-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
            width: ${pageWidthMm}mm !important;
          }
          .print-label-row {
            page: barcode-row;
            display: flex !important;
            flex-direction: row !important;
            width: ${pageWidthMm}mm !important;
            height: ${LABEL_HEIGHT_MM}mm !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            break-after: page !important;
            page-break-after: always !important;
          }
          .print-label {
            width: ${LABEL_WIDTH_MM}mm !important;
            height: ${LABEL_HEIGHT_MM}mm !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}} />
    </div>
  );
};

export default BarcodePrintModal;
