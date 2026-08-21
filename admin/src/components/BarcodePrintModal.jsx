import React, { useState, useEffect, useMemo } from 'react';
import { X, Printer, Download, Plus, Minus, Info } from 'lucide-react';
import BarcodeLabel from './BarcodeLabel';
import { generateBarcodePNG } from '../utils/barcodeEncoder';
import { BARCODE_LABEL_CONFIG } from '../utils/barcodeLabelConfig';

const LABELS_PER_ROW = 2;
const LABEL_WIDTH_MM = 50;
const LABEL_HEIGHT_MM = 25;
const ROW_WIDTH_MM = LABELS_PER_ROW * LABEL_WIDTH_MM; // 100mm
const ROW_HEIGHT_MM = LABEL_HEIGHT_MM; // 25mm

const BarcodePrintModal = ({ isOpen, onClose, barcodes = [], defaultCopies = 1 }) => {
  const [copiesMap, setCopiesMap] = useState({});
  const [globalCopies, setGlobalCopies] = useState(defaultCopies);

  const [companyName, setCompanyName] = useState(BARCODE_LABEL_CONFIG.label.companyName);

  const [showProductName, setShowProductName] = useState(BARCODE_LABEL_CONFIG.label.showProductName);
  const [showColor, setShowColor] = useState(BARCODE_LABEL_CONFIG.label.showColor);
  const [showSize, setShowSize] = useState(BARCODE_LABEL_CONFIG.label.showSize);
  const [showPrice, setShowPrice] = useState(BARCODE_LABEL_CONFIG.label.showPrice);
  const [showBarcodeNumber, setShowBarcodeNumber] = useState(BARCODE_LABEL_CONFIG.label.showBarcodeNumber);

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
    window.print();
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

  // Expand copies into the full label list, then chunk into rows of 2
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
    for (let i = 0; i < printLabels.length; i += LABELS_PER_ROW) {
      rows.push(printLabels.slice(i, i + LABELS_PER_ROW));
    }
    return rows;
  }, [printLabels]);

  const totalRows = printRows.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Printer className="w-5 h-5 text-brand-600" />
            <h2 className="text-xl font-heading font-semibold text-gray-900">Print Barcode Labels</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">

          {/* Left: Preview Area */}
          <div className="flex-1 bg-gray-50 overflow-y-auto p-6 flex flex-col relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Preview</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                  {printLabels.length} Total Labels
                </span>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                  {totalRows} Row{totalRows === 1 ? '' : 's'} × {LABELS_PER_ROW}
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
                        className="p-1 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors disabled:opacity-50"
                        disabled={(copiesMap[item.barcode] || 1) <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center text-sm font-medium text-gray-700">
                        {copiesMap[item.barcode] || 1}
                      </span>
                      <button
                        onClick={() => handleCopyChange(item.barcode, 1)}
                        className="p-1 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors disabled:opacity-50"
                        disabled={(copiesMap[item.barcode] || 1) >= 50}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Bulk row layout preview (2 per row) */}
                {barcodes.length > 1 && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-3 font-medium">
                      Bulk layout — exactly {LABELS_PER_ROW} stickers per row ({ROW_WIDTH_MM}mm × {ROW_HEIGHT_MM}mm each row):
                    </p>
                    <div className="space-y-1 bg-white p-3 rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                      {printRows.slice(0, 4).map((row, rIdx) => (
                        <div key={rIdx} className="flex" style={{ width: `${ROW_WIDTH_MM}mm` }}>
                          {row.map((item, i) => (
                            <div key={i} style={{ width: `${LABEL_WIDTH_MM}mm`, height: `${LABEL_HEIGHT_MM}mm` }} className="shrink-0">
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
                          ))}
                        </div>
                      ))}
                      {printRows.length > 4 && (
                        <p className="text-[10px] text-gray-400 text-center pt-1">
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

              {/* Global Copies */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-900 block">Copies Per Label</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={globalCopies}
                    onChange={(e) => handleGlobalCopiesChange(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                  <span className="text-xs text-gray-500 whitespace-nowrap">per label</span>
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Content Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Label Content</h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
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
                      <span className="text-sm text-gray-700">Product Name</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showColor}
                        onChange={(e) => setShowColor(e.target.checked)}
                        className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                      />
                      <span className="text-sm text-gray-700">Color</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showSize}
                        onChange={(e) => setShowSize(e.target.checked)}
                        className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                      />
                      <span className="text-sm text-gray-700">Size</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showPrice}
                        onChange={(e) => setShowPrice(e.target.checked)}
                        className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                      />
                      <span className="text-sm text-gray-700">Price</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showBarcodeNumber}
                        onChange={(e) => setShowBarcodeNumber(e.target.checked)}
                        className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                      />
                      <span className="text-sm text-gray-700">Barcode Number</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                <Info className="w-5 h-5 text-blue-500 shrink-0" />
                <div className="text-xs text-blue-800 space-y-1">
                  <p className="font-medium">Fixed Label Size — 50mm × 25mm</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Exactly {LABELS_PER_ROW} stickers per row ({ROW_WIDTH_MM}mm × {ROW_HEIGHT_MM}mm)</li>
                    <li>Print height: {totalRows} row{totalRows === 1 ? '' : 's'} × {ROW_HEIGHT_MM}mm = {totalRows * ROW_HEIGHT_MM}mm</li>
                    <li>Scale: 100% (Actual Size) — no "Fit to Page"</li>
                    <li>Margins: None (0mm)</li>
                  </ul>
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col gap-3">
              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print Labels
              </button>
              <button
                onClick={handleDownloadPNG}
                className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Print Area — rows of exactly 2 labels, each row = one 100mm × 25mm page */}
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

      {/* Print Styles — physical 50×25mm stickers, 2 per row, no scaling, no rotation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @page barcode-row {
          size: ${ROW_WIDTH_MM}mm ${ROW_HEIGHT_MM}mm;
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
            width: ${ROW_WIDTH_MM}mm !important;
          }
          .print-label-row {
            page: barcode-row;
            display: grid !important;
            grid-template-columns: repeat(${LABELS_PER_ROW}, ${LABEL_WIDTH_MM}mm) !important;
            grid-auto-rows: ${LABEL_HEIGHT_MM}mm !important;
            width: ${ROW_WIDTH_MM}mm !important;
            height: ${ROW_HEIGHT_MM}mm !important;
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
