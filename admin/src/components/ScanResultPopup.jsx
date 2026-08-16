import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, X, Package, TrendingDown, AlertCircle } from 'lucide-react';
import { playSuccessBeep, playErrorBeep } from '../utils/audioFeedback';

export default function ScanResultPopup({ visible, result, onClose }) {
  const [localResult, setLocalResult] = useState(null);

  useEffect(() => {
    if (result) {
      setLocalResult(result);
      if (result.success) {
        playSuccessBeep();
      } else {
        playErrorBeep();
      }
      
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [result, onClose]);

  const show = visible && localResult;

  if (!localResult) return null;

  const { success, data, error } = localResult;

  return (
    <div
      className={`fixed top-6 right-6 z-[100] w-[420px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl transition-all duration-300 transform ${
        show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } overflow-hidden flex flex-col border border-gray-200/80`}
    >
      {/* Top indicator bar */}
      <div className={`h-1.5 w-full ${success ? 'bg-green-500' : 'bg-red-500'}`}></div>
      
      <div className="p-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {success && data ? (
          <div>
            <div className="flex items-start gap-3">
              <div className="mt-1 shrink-0">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1 pr-6 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-50 text-brand-700 rounded-md tracking-wide uppercase">
                    {data.product?.brand || 'JALYN'}
                  </span>
                  <span className="text-xs text-gray-500 font-mono tracking-tight">{data.barcode}</span>
                </div>
                <h3 className="font-semibold text-gray-900 leading-tight text-sm truncate">
                  {data.product?.name}
                </h3>
                
                {data.variant?.hasVariant && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    {data.variant.color && (
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: data.variant.color.toLowerCase() }}></span>
                        <span className="text-xs font-medium">{data.variant.color}</span>
                      </span>
                    )}
                    {data.variant.color && data.variant.size && <span className="text-gray-300">•</span>}
                    {data.variant.size && (
                      <span className="px-2 py-0.5 bg-gray-100 rounded-md text-xs font-semibold text-gray-700">
                        {data.variant.size}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {data.product?.image && (
                <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-gray-200/80 bg-gray-50 flex items-center justify-center">
                  <img src={data.product.image} alt={data.product.name} className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="mt-4 bg-gray-50/80 rounded-xl p-3 border border-gray-100">
              <div className="grid grid-cols-3 gap-2 text-center divide-x divide-gray-200">
                <div>
                  <div className="text-[11px] font-medium text-gray-500 mb-1 uppercase tracking-wide">Initial Stock</div>
                  <div className="font-semibold text-gray-900">{data.quantityBefore}</div>
                </div>
                <div>
                  <div className="text-[11px] font-medium text-gray-500 mb-1 uppercase tracking-wide">Scanned</div>
                  <div className="font-semibold text-brand-600">
                    {data.quantityChange > 0 ? `+${data.quantityChange}` : data.quantityChange}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-medium text-gray-500 mb-1 uppercase tracking-wide">Remaining</div>
                  <div className="font-bold text-xl text-gray-900 leading-none">{data.quantityAfter}</div>
                </div>
              </div>
            </div>

            {data.outOfStock ? (
              <div className="mt-3 flex items-center gap-2 px-3 py-2.5 bg-red-50 text-red-700 rounded-xl border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-sm font-semibold tracking-wide">OUT OF STOCK</span>
              </div>
            ) : data.lowStock ? (
              <div className="mt-3 flex items-center gap-2 px-3 py-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
                <TrendingDown className="w-4 h-4 shrink-0" />
                <span className="text-sm font-semibold">Low Stock Warning <span className="font-normal opacity-80">({data.quantityAfter} left)</span></span>
              </div>
            ) : null}
          </div>
        ) : (
          <div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {error?.code === 'OUT_OF_STOCK' || error?.code === 'SERVER_ERROR' ? (
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500" />
                )}
              </div>
              <div className="flex-1 pr-6">
                <h3 className="font-bold text-red-600 text-sm mb-1">
                  {error?.code === 'BARCODE_NOT_FOUND' && 'Barcode not found'}
                  {error?.code === 'BARCODE_INACTIVE' && 'This barcode is inactive'}
                  {error?.code === 'OUT_OF_STOCK' && 'Product is out of stock'}
                  {error?.code === 'INVALID_BARCODE' && 'Invalid barcode'}
                  {error?.code === 'SERVER_ERROR' && 'Server error'}
                  {!['BARCODE_NOT_FOUND', 'BARCODE_INACTIVE', 'OUT_OF_STOCK', 'INVALID_BARCODE', 'SERVER_ERROR'].includes(error?.code) && (error?.code || 'Error')}
                </h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {error?.message}
                </p>
                {localResult.barcode && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="font-mono text-sm font-semibold text-gray-700">{localResult.barcode}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
