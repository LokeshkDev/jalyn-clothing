import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Undo2, ArrowRightLeft, CheckCircle2, AlertCircle, PackageCheck, Search, Plus, Trash2 } from 'lucide-react';
import api from '../services/api';

const RETURN_REASONS = [
  'Incorrect Size / Fitting Issue',
  'Defective / Fabric Quality Issue',
  'Customer Mind Change / Disliked Design',
  'Wrong Item / Color Shipped',
  'Damaged in Transit / Tag Intact',
  'Other Reason (Specify)',
];

export default function ReturnReplaceModal({ isOpen, onClose, order, onSuccess }) {
  const [returnType, setReturnType] = useState('return'); // 'return' or 'replace'
  const [selectedItems, setSelectedItems] = useState({});
  const [itemReasons, setItemReasons] = useState({});
  const [customReasons, setCustomReasons] = useState({});
  const [replacementItems, setReplacementItems] = useState([]);
  
  // Replacement catalog search
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [searching, setSearching] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (order && order.items) {
      const initialSel = {};
      const initialReas = {};
      order.items.forEach((it) => {
        const key = it.id || it.product_name;
        initialSel[key] = {
          selected: false,
          quantity: 1,
          maxQty: Number(it.quantity || 1),
          returned_quantity: Number(it.returned_quantity || 0),
          product_id: it.product_id || it.id || null,
          product_name: it.product_name,
          sku: it.sku || null,
          size: it.size || null,
          color: it.color || null,
          price: Number(it.price || 0),
        };
        initialReas[key] = '';
      });
      setSelectedItems(initialSel);
      setItemReasons(initialReas);
      setCustomReasons({});
      setReplacementItems([]);
      setErrorMsg('');
    }
  }, [order, isOpen]);

  // Search catalog for replacement product selection
  useEffect(() => {
    if (returnType === 'replace' && searchQuery.trim().length > 1) {
      const timer = setTimeout(async () => {
        setSearching(true);
        try {
          const res = await api.get(`/products?search=${encodeURIComponent(searchQuery)}`);
          setCatalogProducts(res.data?.products || []);
        } catch (_) {
          setCatalogProducts([]);
        } finally {
          setSearching(false);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setCatalogProducts([]);
    }
  }, [searchQuery, returnType]);

  if (!isOpen || !order) return null;

  const itemsList = order.items || [];

  const handleToggleItem = (key) => {
    setSelectedItems((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        selected: !prev[key]?.selected,
      },
    }));
  };

  const handleQtyChange = (key, delta) => {
    setSelectedItems((prev) => {
      const current = prev[key];
      if (!current) return prev;
      const newQty = Math.max(1, Math.min(current.maxQty, current.quantity + delta));
      return {
        ...prev,
        [key]: { ...current, quantity: newQty },
      };
    });
  };

  const handleReasonSelect = (key, reason) => {
    setItemReasons((prev) => ({
      ...prev,
      [key]: reason,
    }));
  };

  const handleCustomReasonChange = (key, text) => {
    setCustomReasons((prev) => ({
      ...prev,
      [key]: text,
    }));
  };

  // Check if at least 1 item is selected for return
  const activeReturnEntries = Object.entries(selectedItems).filter(([_, val]) => val.selected);
  const totalReturnQty = activeReturnEntries.reduce((sum, [_, val]) => sum + val.quantity, 0);
  const totalReturnAmount = activeReturnEntries.reduce((sum, [_, val]) => sum + val.quantity * val.price, 0);

  // Check if mandatory reason is provided for ALL selected returned items!
  const isReasonMissing = activeReturnEntries.some(([key, val]) => {
    if (!val.selected) return false;
    const r = itemReasons[key];
    if (!r) return true;
    if (r === 'Other Reason (Specify)' && (!customReasons[key] || !customReasons[key].trim())) return true;
    return false;
  });

  // Calculate replacement totals
  const totalReplacementAmount = replacementItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const netSettlement = totalReturnAmount - totalReplacementAmount; // Positive = Refund due to customer, Negative = Extra amount to collect

  const addReplacementProduct = (prod) => {
    setReplacementItems((prev) => {
      const exists = prev.find((p) => p.product_id === prod.id);
      if (exists) {
        return prev.map((p) => (p.product_id === prod.id ? { ...p, quantity: p.quantity + 1 } : p));
      }
      return [
        ...prev,
        {
          product_id: prod.id,
          product_name: prod.title,
          price: Number(prod.price || 0),
          quantity: 1,
        },
      ];
    });
    setSearchQuery('');
    setCatalogProducts([]);
  };

  const removeReplacementItem = (index) => {
    setReplacementItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeReturnEntries.length === 0) {
      setErrorMsg('Please select at least one item to return.');
      return;
    }

    if (isReasonMissing) {
      setErrorMsg('Mandatory return reason is missing for one or more selected items. Please select a reason to proceed.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const formattedReturnedItems = activeReturnEntries.map(([key, val]) => {
      const selectedReason = itemReasons[key];
      const finalReason = selectedReason === 'Other Reason (Specify)' ? customReasons[key] : selectedReason;
      return {
        product_id: val.product_id || null,
        product_name: val.product_name,
        sku: val.sku || null,
        size: val.size || null,
        color: val.color || null,
        quantity: val.quantity,
        price: val.price,
        reason: finalReason,
      };
    });

    try {
      const payload = {
        return_type: returnType,
        returned_items: formattedReturnedItems,
        replacement_items: returnType === 'replace' ? replacementItems : [],
        total_refund_amount: netSettlement > 0 ? netSettlement : 0,
        balance_collected: netSettlement < 0 ? Math.abs(netSettlement) : 0,
      };

      const res = await api.post(`/orders/${order.id}/return-replace`, payload);
      if (res.data && res.data.success) {
        if (onSuccess) onSuccess(res.data.message);
        onClose();
      } else {
        setErrorMsg(res.data?.message || 'Failed to process return.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Error executing return transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#2A1A22] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#AD4A85] text-white flex items-center justify-center font-bold">
              <Undo2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Return & Replace Order Items</h3>
              <p className="text-xs text-pink-200">
                Invoice #{order.order_number || order.id} · {order.customer_name || 'Walk-in Customer'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 flex-1 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Mode Switcher */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setReturnType('return')}
              className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                returnType === 'return'
                  ? 'bg-purple-50 border-[#AD4A85] text-[#AD4A85] shadow-xs'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Undo2 className="w-4 h-4" />
              <span>Return & Restock Inventory</span>
            </button>
            <button
              type="button"
              onClick={() => setReturnType('replace')}
              className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                returnType === 'replace'
                  ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Replace Item(s)</span>
            </button>
          </div>

          {/* Item Selection List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
              <span>1. Select Order Line Items to Return</span>
              <span className="text-[11px] text-[#AD4A85] font-semibold">
                {activeReturnEntries.length} items selected
              </span>
            </h4>

            <div className="space-y-3">
              {itemsList.map((item) => {
                const key = item.id || item.product_name;
                const state = selectedItems[key] || { selected: false, quantity: 1, maxQty: 1 };
                const reason = itemReasons[key] || '';

                return (
                  <div
                    key={key}
                    className={`p-3.5 rounded-xl border transition ${
                      state.selected ? 'bg-purple-50/50 border-[#AD4A85]' : 'bg-gray-50/70 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={state.selected}
                        onChange={() => handleToggleItem(key)}
                        className="mt-1 w-4 h-4 text-[#AD4A85] rounded border-gray-300 focus:ring-[#AD4A85] cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-xs text-gray-900 truncate">{item.product_name}</p>
                          <span className="text-xs font-extrabold text-gray-800">
                            ₹{Number(item.price || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2 flex-wrap">
                          <span>Bought: {item.quantity || 1} pcs {item.size && `· Size: ${item.size}`} {item.color && `· Color: ${item.color}`}</span>
                          {Number(item.returned_quantity) > 0 && (
                            <span className="text-purple-700 font-bold bg-purple-100 px-1.5 py-0.5 rounded text-[10px] border border-purple-200">
                              Already Returned: {item.returned_quantity} pcs
                            </span>
                          )}
                        </p>

                        {/* Quantity Stepper & Mandatory Reason (if selected) */}
                        {state.selected && (
                          <div className="mt-3 pt-3 border-t border-purple-100 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-bold text-gray-700">Return Quantity:</span>
                              <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg p-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleQtyChange(key, -1)}
                                  disabled={state.quantity <= 1}
                                  className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center disabled:opacity-40 cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center text-xs font-bold text-gray-900">
                                  {state.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleQtyChange(key, 1)}
                                  disabled={state.quantity >= state.maxQty}
                                  className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center disabled:opacity-40 cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* MANDATORY RETURN REASON SELECTOR */}
                            <div>
                              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                Return Reason <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={reason}
                                onChange={(e) => handleReasonSelect(key, e.target.value)}
                                className={`w-full text-xs p-2 rounded-lg border bg-white focus:outline-none transition ${
                                  !reason ? 'border-red-400 bg-red-50/30' : 'border-gray-300 focus:border-[#AD4A85]'
                                }`}
                                required
                              >
                                <option value="">-- Select Mandatory Return Reason --</option>
                                {RETURN_REASONS.map((r) => (
                                  <option key={r} value={r}>
                                    {r}
                                  </option>
                                ))}
                              </select>

                              {reason === 'Other Reason (Specify)' && (
                                <input
                                  type="text"
                                  placeholder="Specify exact return reason..."
                                  value={customReasons[key] || ''}
                                  onChange={(e) => handleCustomReasonChange(key, e.target.value)}
                                  className="mt-1.5 w-full text-xs p-2 rounded-lg border border-gray-300 focus:border-[#AD4A85] bg-white"
                                  required
                                />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Replacement Selector (If mode === replace) */}
          {returnType === 'replace' && (
            <div className="space-y-3 pt-2 border-t border-gray-200">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                2. Select Replacement Product from Store Catalog
              </h4>

              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search replacement product title or barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-gray-300 focus:border-blue-600 focus:outline-none bg-white"
                />
              </div>

              {/* Search dropdown results */}
              {catalogProducts.length > 0 && (
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-xl bg-white divide-y divide-gray-100 shadow-md">
                  {catalogProducts.map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => addReplacementProduct(prod)}
                      className="w-full p-2.5 text-left hover:bg-blue-50 transition flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div>
                        <p className="font-bold text-gray-800">{prod.title}</p>
                        <p className="text-[11px] text-gray-500">Stock: {prod.stock || 0} pcs</p>
                      </div>
                      <span className="font-extrabold text-blue-700">₹{Number(prod.price || 0).toLocaleString('en-IN')}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Replacement Items */}
              {replacementItems.length > 0 && (
                <div className="space-y-2">
                  {replacementItems.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-gray-900">{item.product_name}</p>
                        <p className="text-[11px] text-blue-700 font-semibold">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeReplacementItem(idx)}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Restocking Inventory Confirmation Pill */}
          {totalReturnQty > 0 && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Inventory Restock Ready</p>
                <p className="text-[11px] text-emerald-700">
                  +{totalReturnQty} returned item units will be automatically added back to product stock upon submission.
                </p>
              </div>
            </div>
          )}

          {/* Financial Settlement Summary */}
          {activeReturnEntries.length > 0 && (
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Returned Items Total:</span>
                <span className="font-bold text-gray-900">₹{totalReturnAmount.toLocaleString('en-IN')}</span>
              </div>
              {returnType === 'replace' && (
                <div className="flex justify-between text-gray-600">
                  <span>Replacement Items Total:</span>
                  <span className="font-bold text-blue-700">−₹{totalReplacementAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold border-t border-gray-200 pt-2 text-gray-900">
                <span>{netSettlement >= 0 ? 'Net Refund to Customer:' : 'Additional Receivable Amount:'}</span>
                <span className={netSettlement >= 0 ? 'text-emerald-700' : 'text-amber-700'}>
                  ₹{Math.abs(netSettlement).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || activeReturnEntries.length === 0 || isReasonMissing}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition flex items-center gap-2 cursor-pointer shadow-sm ${
                loading || activeReturnEntries.length === 0 || isReasonMissing
                  ? 'bg-gray-400 cursor-not-allowed opacity-60'
                  : 'bg-[#AD4A85] hover:bg-[#8E3466]'
              }`}
            >
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>
                {returnType === 'replace' ? 'Complete Replacement & Restock' : 'Proceed Return & Restock Stock'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

