import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw, Plus, Trash2, Pencil, Search, Calculator } from 'lucide-react';
import api from '../services/api';
import { calculateOrderTax } from '../utils/taxUtils';

export default function EditBillModal({ isOpen, onClose, order, onSuccess }) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [orderStatus, setOrderStatus] = useState('delivered');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [receivedAmount, setReceivedAmount] = useState('');

  const [items, setItems] = useState([]);
  
  // Catalog search to add new item
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [searching, setSearching] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (order && isOpen) {
      setCustomerName(order.customer_name || '');
      setCustomerPhone(order.customer_phone || '');
      setCustomerEmail(order.customer_email || '');
      setShippingAddress(order.shipping_address || 'In-Store Counter');
      setPaymentStatus(order.payment_status || 'paid');
      setPaymentMethod(order.payment_method || 'Cash');
      setOrderStatus(order.order_status || 'delivered');
      setDiscountAmount(Number(order.discount_amount) || 0);
      setReceivedAmount(order.received_amount !== undefined && order.received_amount !== null ? String(order.received_amount) : '');
      
      const orderItems = (order.items || []).map((it) => ({
        product_id: it.product_id || null,
        product_name: it.product_name || 'Untitled Item',
        price: Number(it.price || 0),
        quantity: Number(it.quantity || 1),
        size: it.size || '',
        color: it.color || '',
        gst_rate: Number(it.gst_rate || 5),
      }));
      setItems(orderItems);
      setErrorMsg('');
    }
  }, [order, isOpen]);

  // Catalog search handler
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
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
  }, [searchQuery]);

  if (!isOpen || !order) return null;

  const handleItemQtyChange = (index, delta) => {
    setItems((prev) =>
      prev.map((it, idx) => {
        if (idx !== index) return it;
        const newQty = Math.max(1, it.quantity + delta);
        return { ...it, quantity: newQty };
      })
    );
  };

  const handleItemPriceChange = (index, newPrice) => {
    setItems((prev) =>
      prev.map((it, idx) => {
        if (idx !== index) return it;
        return { ...it, price: Math.max(0, Number(newPrice) || 0) };
      })
    );
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const addCatalogProduct = (prod) => {
    setItems((prev) => [
      ...prev,
      {
        product_id: prod.id,
        product_name: prod.title,
        price: Number(prod.price || 0),
        quantity: 1,
        size: '',
        color: '',
        gst_rate: Number(prod.gst_rate || 5),
      },
    ]);
    setSearchQuery('');
    setCatalogProducts([]);
  };

  // Recalculate totals
  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const grandTotal = Math.max(0, subtotal - Number(discountAmount || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMsg('Bill must contain at least one line item.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        shipping_address: shippingAddress,
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        order_status: orderStatus,
        discount_amount: Number(discountAmount) || 0,
        total_amount: grandTotal,
        received_amount: receivedAmount !== '' ? Number(receivedAmount) : grandTotal,
        balance_amount: receivedAmount !== '' ? Math.max(0, Number(receivedAmount) - grandTotal) : 0,
        items,
      };

      const res = await api.put(`/orders/${order.id}`, payload);
      if (res.data && res.data.success) {
        if (onSuccess) onSuccess('Bill updated successfully.');
        onClose();
      } else {
        setErrorMsg(res.data?.message || 'Failed to update bill.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Error saving bill updates.');
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
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Edit Bill / Walk-in Invoice</h3>
              <p className="text-xs text-pink-200">
                Invoice #{order.order_number || order.id}
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
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Customer Particulars */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Customer Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:border-[#AD4A85] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:border-[#AD4A85] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Items Particulars */}
          <div className="space-y-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Bill Particulars / Line Items
              </h4>
              <span className="text-xs font-bold text-[#AD4A85]">{items.length} items</span>
            </div>

            {/* Item list */}
            <div className="space-y-2">
              {items.map((it, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{it.product_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-gray-500">Price ₹:</span>
                      <input
                        type="number"
                        min="0"
                        value={it.price}
                        onChange={(e) => handleItemPriceChange(idx, e.target.value)}
                        className="w-20 p-1 border border-gray-300 rounded text-center text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => handleItemQtyChange(idx, -1)}
                        className="w-6 h-6 rounded bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-7 text-center font-bold">{it.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleItemQtyChange(idx, 1)}
                        className="w-6 h-6 rounded bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-extrabold text-gray-900 w-20 text-right">
                      ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Item from Catalog */}
            <div className="relative pt-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Search catalog to add item to bill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-gray-300 focus:border-[#AD4A85] focus:outline-none bg-white"
              />
            </div>

            {catalogProducts.length > 0 && (
              <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-xl bg-white divide-y divide-gray-100 shadow-md">
                {catalogProducts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addCatalogProduct(p)}
                    className="w-full p-2 text-left hover:bg-pink-50 flex items-center justify-between text-xs cursor-pointer"
                  >
                    <span className="font-bold text-gray-800">{p.title}</span>
                    <span className="font-extrabold text-[#AD4A85]">₹{Number(p.price || 0).toLocaleString('en-IN')}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="space-y-3 pt-3 border-t border-gray-200">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Payment & Status Details
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI / QR">UPI / QR</option>
                  <option value="Card">Credit / Debit Card</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white"
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Discount ₹</label>
                <input
                  type="number"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Calculation Footer */}
          <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 flex items-center justify-between text-xs">
            <div>
              <p className="text-gray-600">Subtotal: <strong>₹{subtotal.toLocaleString('en-IN')}</strong></p>
              <p className="text-gray-600">Discount: <strong>−₹{Number(discountAmount || 0).toLocaleString('en-IN')}</strong></p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500 font-bold uppercase">Updated Total:</span>
              <p className="text-xl font-extrabold text-[#AD4A85]">₹{grandTotal.toLocaleString('en-IN')}</p>
            </div>
          </div>

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
              disabled={loading || items.length === 0}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#AD4A85] hover:bg-[#8E3466] transition flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Bill Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

