import React, { useState, useEffect, useMemo } from 'react';
import { X, Printer, Download, Plus, Minus, Info } from 'lucide-react';
import BarcodeLabel from './BarcodeLabel';
import { generateBarcodeSVG, generateBarcodePNG } from '../utils/barcodeEncoder';
import { BARCODE_LABEL_CONFIG } from '../utils/barcodeLabelConfig';

const LABEL_WIDTH_MM = 50;
const LABEL_HEIGHT_MM = 25;

const BarcodePrintModal = ({ isOpen, onClose, barcodes = [], defaultCopies = 1 }) => {
  const [copiesMap, setCopiesMap] = useState({});
  const [globalCopies, setGlobalCopies] = useState(defaultCopies);
  const [layoutMode, setLayoutMode] = useState('2_per_row'); // '2_per_row' (100mm) or '1_per_row' (50mm)

  const [companyName, setCompanyName] = useState(BARCODE_LABEL_CONFIG.label.companyName);

  const [showProductName, setShowProductName] = useState(BARCODE_LABEL_CONFIG.label.showProductName);
  const [showColor, setShowColor] = useState(BARCODE_LABEL_CONFIG.label.showColor);
  const [showSize, setShowSize] = useState(BARCODE_LABEL_CONFIG.label.showSize);
  const [showPrice, setShowPrice] = useState(BARCODE_LABEL_CONFIG.label.showPrice);
  const [showBarcodeNumber, setShowBarcodeNumber] = useState(BARCODE_LABEL_CONFIG.label.showBarcodeNumber);

  const labelsPerRow = layoutMode === '2_per_row' ? 2 : 1;
  const pageWidthMm = labelsPerRow * LABEL_WIDTH_MM;

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
    const isTwoPerRow = layoutMode === '2_per_row';
    const rowWidth = isTwoPerRow ? '100mm' : '50mm';
    const labelWidth = '48mm';
    const labelHeight = '24mm';
    const rowHeight = '25mm';

    const rowsHtml = printRows.map((row) => {
      const labelsHtml = row.map((item) => {
        const barcodeSvg = generateBarcodeSVG(item.barcode, {
          width: '100%',
          height: 30,
          showText: false,
          moduleWidth: 2,
          quietZone: 6,
          barColor: '#000000',
          backgroundColor: '#ffffff'
        });

        const displayPrice = item.mrp !== undefined && item.mrp !== null && item.mrp !== '' ? item.mrp : (item.original_price || item.compare_price || item.price);
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

        return `
          <div class="sticker-label">
            <div class="brand-title">${String(companyName || 'JALYN APPARELS').toUpperCase().replace(/[&<>"']/g, '')}</div>
            <div class="barcode-box">
              ${barcodeSvg}
            </div>
            ${combinedBarcodeInfo ? `<div class="barcode-num">${String(combinedBarcodeInfo).replace(/[&<>"']/g, '')}</div>` : ''}
            ${showPrice && displayPrice ? `<div class="price-line">₹${Number(displayPrice).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>` : ''}
          </div>
        `;
      }).join('');

      return `<div class="sticker-row">${labelsHtml}</div>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Zebra Barcode Labels</title>
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
    justify-content: ${isTwoPerRow ? 'space-between' : 'center'} !important;
    align-items: center !important;
    padding: 0.4mm 0.8mm !important;
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
    padding: 1.2mm 1mm 0.4mm !important;
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
    font-size: 10.5pt;
    font-weight: 900;
    letter-spacing: 1px;
    line-height: 1.05;
    text-transform: uppercase;
    color: #000000;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 0.4mm;
  }
  .barcode-box {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0.2mm 0;
  }
  .barcode-box svg {
    max-height: 26px;
    height: 26px;
    width: 100%;
    shape-rendering: crispEdges;
  }
  .barcode-num {
    font-family: monospace;
    font-size: 8.5pt;
    font-weight: 900;
    letter-spacing: 0.5px;
    line-height: 1.1;
    color: #000000;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }
  .price-line {
    font-size: 13pt;
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
    <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
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
          <div className="flex-1 bg-gray-50 overflow-y-auto p-6 flex flex-col relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-700">Preview</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-xs">
                  {printLabels.length} Total Labels
                </span>
                <span className="text-xs font-semibold text-gray-600 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-xs">
                  {totalRows} Row{totalRows === 1 ? '' : 's'} ({layoutMode === '2_per_row' ? '2 Stickers / Row' : '1 Sticker / Row'})
                </span>
              </div>
            </div>

            <div className="flex-1 flex items-start justify-center">
              <div className="w-full max-w-full space-y-6">
                {barcodes.map(item => (
                  <div key={item.barcode} className="flex flex-col items-center gap-2">
                    <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
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
                        <div key={rIdx} className="flex border border-dashed border-gray-300" style={{ width: `${pageWidthMm}mm` }}>
                          {row.map((item, i) => (
                            <div key={i} style={{ width: `${LABEL_WIDTH_MM}mm`, height: `${LABEL_HEIGHT_MM}mm` }} className="shrink-0">
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
                                showBarcodeNumber={showBarcodeNumber}
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
          <div className="w-full md:w-80 border-l border-gray-100 bg-white flex flex-col h-full shrink-0">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Printer Roll Mode Selection */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900 block">Sticker Roll Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLayoutMode('2_per_row')}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-0.5 cursor-pointer ${
                      layoutMode === '2_per_row'
                        ? 'border-[#2A1A22] bg-[#2A1A22] text-white font-bold'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xs font-bold">2 Stickers / Row</span>
                    <span className="text-[10px] opacity-80">100mm × 25mm</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutMode('1_per_row')}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-0.5 cursor-pointer ${
                      layoutMode === '1_per_row'
                        ? 'border-[#2A1A22] bg-[#2A1A22] text-white font-bold'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xs font-bold">1 Sticker / Row</span>
                    <span className="text-[10px] opacity-80">50mm × 25mm</span>
                  </button>
                </div>
              </div>

              {/* Global Copies */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900 block">Copies Per Label</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={globalCopies}
                    onChange={(e) => handleGlobalCopiesChange(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                  <span className="text-xs text-gray-500 whitespace-nowrap">per label</span>
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Content Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900">Label Content (Bold Layout)</h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Company / Brand Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      placeholder="e.g. JALYN"
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showProductName}
                        onChange={(e) => setShowProductName(e.target.checked)}
                        className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Product Name</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showColor}
                        onChange={(e) => setShowColor(e.target.checked)}
                        className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Color</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showSize}
                        onChange={(e) => setShowSize(e.target.checked)}
                        className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Size</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showPrice}
                        onChange={(e) => setShowPrice(e.target.checked)}
                        className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Price (₹)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showBarcodeNumber}
                        onChange={(e) => setShowBarcodeNumber(e.target.checked)}
                        className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Barcode Digits</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                <Info className="w-5 h-5 text-blue-500 shrink-0" />
                <div className="text-xs text-blue-800 space-y-1">
                  <p className="font-bold">Physical Sticker Size: 50mm × 25mm</p>
                  <ul className="list-disc pl-4 space-y-0.5 font-medium">
                    <li>High contrast bold letters &amp; barcode bars</li>
                    <li>Inner safe margin prevents text crossing sticker gap</li>
                    <li>Printer scale: 100% (Actual Size)</li>
                    <li>Margins: None (0mm)</li>
                  </ul>
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col gap-3">
              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 bg-[#2A1A22] hover:bg-[#3D2631] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-pink-300" />
                Print Labels
              </button>
              <button
                onClick={handleDownloadPNG}
                className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
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
