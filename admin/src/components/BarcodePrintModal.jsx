import React, { useState, useEffect, useMemo } from 'react';
import { X, Printer, Download, Plus, Minus, Settings, FileText, Info } from 'lucide-react';
import BarcodeLabel from './BarcodeLabel';
import { generateBarcodePNG } from '../utils/barcodeEncoder';
import { BARCODE_LABEL_CONFIG, calculateA4Grid } from '../utils/barcodeLabelConfig';

const BarcodePrintModal = ({ isOpen, onClose, barcodes = [], defaultCopies = 1 }) => {
  const [copiesMap, setCopiesMap] = useState({});
  const [globalCopies, setGlobalCopies] = useState(defaultCopies);
  
  const [printMode, setPrintMode] = useState('direct'); // 'direct' or 'a4'
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

  if (!isOpen) return null;

  const isSingle = barcodes.length === 1;

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
              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                {printLabels.length} Total Labels
              </span>
            </div>
            
            <div className={`flex-1 flex ${isSingle ? 'items-center justify-center' : 'items-start justify-center'}`}>
              <div className={isSingle ? '' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'}>
                {barcodes.map(item => (
                  <div key={item.barcode} className="flex flex-col items-center gap-3">
                    <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm transition-transform hover:scale-105">
                      <div className="relative overflow-hidden bg-white" style={{ width: '76.2mm', height: '50.8mm' }}>
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
              </div>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="w-full md:w-80 border-l border-gray-100 bg-white flex flex-col h-full shrink-0">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Print Mode */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-500" />
                  Print Mode
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPrintMode('direct')}
                    className={`flex flex-col items-center p-3 rounded-xl border text-xs font-medium transition-colors ${
                      printMode === 'direct' 
                        ? 'border-brand-500 bg-brand-50 text-brand-700' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Printer className={`w-5 h-5 mb-1 ${printMode === 'direct' ? 'text-brand-600' : 'text-gray-400'}`} />
                    Direct Label
                  </button>
                  <button
                    onClick={() => setPrintMode('a4')}
                    className={`flex flex-col items-center p-3 rounded-xl border text-xs font-medium transition-colors ${
                      printMode === 'a4' 
                        ? 'border-brand-500 bg-brand-50 text-brand-700' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <FileText className={`w-5 h-5 mb-1 ${printMode === 'a4' ? 'text-brand-600' : 'text-gray-400'}`} />
                    A4 Bulk
                  </button>
                </div>
              </div>

              {/* Global Copies */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-900 block">Global Copies</label>
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
                  <p className="font-medium">Print Settings:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Scale: 100% (Actual Size)</li>
                    <li>Disable "Fit to Page"</li>
                    <li>Use correct paper size</li>
                    <li>Margins: Minimum</li>
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

      {/* Hidden Print Area */}
      <div id="barcode-print-area" className={printMode === 'a4' ? 'barcode-print-grid' : ''} style={{ display: 'none' }}>
        {printLabels.map((item, index) => (
          <div key={`${item.barcode}-${index}`} className="print-label">
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

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
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
            display: flex !important;
            flex-wrap: wrap;
            align-content: flex-start;
          }
          .barcode-print-grid {
            display: grid !important;
            grid-template-columns: repeat(auto-fill, 76.2mm);
            gap: 2mm;
            padding: 10mm;
          }
          .print-label {
            width: 76.2mm !important;
            height: 50.8mm !important;
            box-sizing: border-box !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          @page {
            margin: 0;
            size: ${printMode === 'a4' ? 'A4' : '76.2mm 50.8mm'};
          }
        }
      `}} />
    </div>
  );
};

export default BarcodePrintModal;
