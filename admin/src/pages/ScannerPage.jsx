import React, { useState, useRef, useCallback, useEffect } from 'react';
import Header from '../components/Header';
import ScanResultPopup from '../components/ScanResultPopup';
import api from '../services/api';
import useScannerInput from '../hooks/useScannerInput';
import { BARCODE_LABEL_CONFIG } from '../utils/barcodeLabelConfig';
import { 
  Scan, 
  Package, 
  Clock, 
  AlertTriangle, 
  ArrowDown, 
  CheckCircle2, 
  Loader2, 
  XCircle, 
  Trash2, 
  Zap 
} from 'lucide-react';

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [recentScans, setRecentScans] = useState([]);
  const [stats, setStats] = useState({ totalScans: 0, totalDeducted: 0, errors: 0 });
  const inputRef = useRef(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleScan = useCallback(async (barcode) => {
    if (scanning) return;
    setScanning(true);
    
    try {
      const response = await api.post('/barcodes/scan', { barcode });
      const result = { success: true, data: response.data.data };
      setScanResult(result);
      setPopupVisible(true);
      
      // Add to recent scans
      setRecentScans(prev => [{
        id: Date.now(),
        barcode,
        productName: response.data.data.product.name,
        variant: response.data.data.variant,
        quantityBefore: response.data.data.quantityBefore,
        quantityAfter: response.data.data.quantityAfter,
        timestamp: new Date(),
        success: true
      }, ...prev].slice(0, 20));
      
      setStats(prev => ({
        totalScans: prev.totalScans + 1,
        totalDeducted: prev.totalDeducted + 1,
        errors: prev.errors
      }));
    } catch (error) {
      const errorData = error.response?.data;
      let errorCode = 'SERVER_ERROR';
      let errorMessage = 'An unexpected error occurred.';
      
      if (errorData?.code) {
        errorCode = errorData.code;
        errorMessage = errorData.message;
      } else if (error.response?.status === 404) {
        errorCode = 'BARCODE_NOT_FOUND';
        errorMessage = 'Barcode not found in the system.';
      }
      
      const result = { success: false, error: { code: errorCode, message: errorMessage, barcode } };
      setScanResult(result);
      setPopupVisible(true);
      
      setRecentScans(prev => [{
        id: Date.now(),
        barcode,
        error: errorMessage,
        timestamp: new Date(),
        success: false
      }, ...prev].slice(0, 20));
      
      setStats(prev => ({
        totalScans: prev.totalScans + 1,
        totalDeducted: prev.totalDeducted,
        errors: prev.errors + 1
      }));
    } finally {
      setScanning(false);
      setManualBarcode('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [scanning]);

  useScannerInput(handleScan);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const barcode = manualBarcode.trim();
    if (barcode.length >= BARCODE_LABEL_CONFIG.scanner.minBarcodeLength && 
        barcode.length <= BARCODE_LABEL_CONFIG.scanner.maxBarcodeLength) {
      handleScan(barcode);
    }
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  const clearRecentScans = () => {
    setRecentScans([]);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50">
      <Header title="Inventory Scanner" subtitle="Scan barcodes to deduct stock. Works with any USB or Bluetooth HID barcode scanner." />
      
      <main className="p-6 max-w-6xl mx-auto space-y-6">
        
        {/* Scanner Input Card */}
        <section className="bg-white p-8 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col items-center max-w-3xl mx-auto">
          <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-4">
            <Scan className="w-8 h-8 text-brand-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Scan Barcode</h2>
          <p className="text-gray-500 mb-8 text-center max-w-md">
            Point your scanner at any barcode or enter it manually
          </p>

          <form onSubmit={handleManualSubmit} className="w-full max-w-md relative mb-6">
            <div className="relative flex items-center">
              <div className="absolute left-4 text-gray-400">
                <Scan className="w-6 h-6" />
              </div>
              <input
                ref={inputRef}
                type="text"
                data-scan-capture="true"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Scan or enter barcode..."
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value.replace(/[^0-9]/g, ''))}
                onKeyDown={(e) => { if (e.key === 'Enter') handleManualSubmit(e); }}
                className="w-full pl-12 pr-4 py-4 text-xl font-mono text-center rounded-xl border border-gray-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 transition-all bg-gray-50 focus:bg-white shadow-inner placeholder:font-sans"
              />
            </div>
            
            <button
              type="submit"
              disabled={scanning || manualBarcode.length < BARCODE_LABEL_CONFIG.scanner.minBarcodeLength}
              className="mt-4 w-full bg-brand-600 text-white font-semibold py-4 rounded-xl hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
            >
              {scanning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Process Barcode
                </>
              )}
            </button>
          </form>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 text-sm font-medium">
            {scanning ? (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>
                <span className="text-amber-600">Processing...</span>
              </>
            ) : (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-green-600">Ready for scanning...</span>
              </>
            )}
          </div>
        </section>

        {/* Session Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Scan className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Total Scans</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalScans}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <ArrowDown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Stock Deducted</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDeducted}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats.errors > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Errors</p>
              <p className={`text-2xl font-bold ${stats.errors > 0 ? 'text-red-600' : 'text-gray-900'}`}>{stats.errors}</p>
            </div>
          </div>
        </section>

        {/* Recent Scans Log */}
        <section className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                Recent Scans
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Showing last {recentScans.length} scans from this session
              </p>
            </div>
            {recentScans.length > 0 && (
              <button 
                onClick={clearRecentScans}
                className="text-sm text-gray-500 hover:text-red-600 font-medium flex items-center gap-1 transition"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
          
          <div className="overflow-x-auto">
            {recentScans.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500">
                <Zap className="w-12 h-12 text-gray-300 mb-3" />
                <p>No scans yet.</p>
                <p className="text-sm">Start scanning to see results here.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Time</th>
                    <th className="p-4 font-semibold">Barcode</th>
                    <th className="p-4 font-semibold">Product Details</th>
                    <th className="p-4 font-semibold">Result</th>
                    <th className="p-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentScans.map((scan, index) => (
                    <tr 
                      key={scan.id} 
                      className={`
                        transition-colors
                        ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
                        ${scan.success ? 'hover:bg-emerald-50/30' : 'bg-red-50/20 hover:bg-red-50/40'}
                      `}
                    >
                      <td className="p-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(scan.timestamp)}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="font-mono text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {scan.barcode}
                        </span>
                      </td>
                      <td className="p-4">
                        {scan.success ? (
                          <div>
                            <p className="font-medium text-gray-900">{scan.productName}</p>
                            {scan.variant && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {[scan.variant.color, scan.variant.size].filter(Boolean).join(' • ')}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-red-600 font-medium text-sm">{scan.error}</p>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {scan.success ? (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500 line-through">{scan.quantityBefore}</span>
                            <ArrowDown className="w-3 h-3 text-emerald-500" />
                            <span className="font-bold text-gray-900">{scan.quantityAfter}</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs font-semibold">
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap text-right">
                        {scan.success ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>

      {/* Assuming ScanResultPopup exists in components */}
      {popupVisible && scanResult && (
        <ScanResultPopup
          visible={popupVisible}
          result={scanResult}
          onClose={() => setPopupVisible(false)}
        />
      )}
    </div>
  );
}
