import React, { useState, useEffect } from 'react';
import {
  X, Settings, Save, RotateCcw, Printer, Check, Store, FileText,
  Sliders, Eye, Phone, Mail, MapPin, Tag, ShieldCheck, HelpCircle, Image
} from 'lucide-react';
import {
  getThermalSettings, saveThermalSettings, resetThermalSettings, DEFAULT_THERMAL_SETTINGS
} from '../utils/thermalSettings';
import jalynLogoSmallUrl from '../assets/jalyn-logo-small.jpg';

export default function ThermalSettingsModal({ isOpen, onClose, onSaved }) {
  const [settings, setSettings] = useState(DEFAULT_THERMAL_SETTINGS);
  const [activeTab, setActiveTab] = useState('fields'); // 'fields', 'toggles', 'layout'
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(getThermalSettings());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const saved = saveThermalSettings(settings);
    setSettings(saved);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    onSaved?.(saved);
  };

  const handleReset = () => {
    if (window.confirm('Reset thermal receipt format to default settings?')) {
      const reset = resetThermalSettings();
      setSettings(reset);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
      onSaved?.(reset);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 overflow-y-auto">
      <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#2A1A22] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Settings className="w-5 h-5 text-pink-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Thermal Billing Format &amp; Print Settings</h2>
              <p className="text-xs text-gray-300">Customize store header, tax layout, visible fields, and print styles.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/15 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - 2 Columns (Left Controls, Right Live Preview) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-gray-200 bg-gray-50">
          
          {/* Left Column: Settings Form & Toggles (7 Cols) */}
          <div className="md:col-span-7 flex flex-col h-full bg-white overflow-hidden">
            
            {/* Sub-Tabs */}
            <div className="flex border-b border-gray-200 px-6 pt-3 gap-2 bg-gray-50/70 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('fields')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'fields'
                    ? 'border-[#AD4A85] text-[#AD4A85]'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Store className="w-3.5 h-3.5" /> Store Details &amp; Headers
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('toggles')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'toggles'
                    ? 'border-[#AD4A85] text-[#AD4A85]'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" /> Display Toggles
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('layout')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'layout'
                    ? 'border-[#AD4A85] text-[#AD4A85]'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Printer className="w-3.5 h-3.5" /> Paper &amp; Tax Defaults
              </button>
            </div>

            {/* Form Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeTab === 'fields' && (
                <div className="space-y-3.5 text-xs">
                  {/* Top Logo Controls */}
                  <div className="p-3 bg-pink-50/50 rounded-xl border border-pink-200/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 flex items-center gap-1.5">
                        <Image className="w-4 h-4 text-[#AD4A85]" /> Thermal Receipt Top Logo
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.showLogo}
                          onChange={(e) => handleChange('showLogo', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#AD4A85]"></div>
                      </label>
                    </div>
                    {settings.showLogo && (
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-0.5">Custom Logo Image URL (Optional)</label>
                        <input
                          type="text"
                          value={settings.logoUrl || ''}
                          onChange={(e) => handleChange('logoUrl', e.target.value)}
                          placeholder="Leave empty for standard JALYN brand logo"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-900 focus:ring-1 focus:ring-[#AD4A85] outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Store / Business Name *</label>
                    <input
                      type="text"
                      value={settings.storeName}
                      onChange={(e) => handleChange('storeName', e.target.value)}
                      placeholder="e.g. JALYN APPARELS"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold text-gray-900 focus:ring-2 focus:ring-[#AD4A85] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Shop No &amp; Street</label>
                      <input
                        type="text"
                        value={settings.shopNo}
                        onChange={(e) => handleChange('shopNo', e.target.value)}
                        placeholder="Shop No : 6, Madambakkam Main Road"
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-[#AD4A85] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Area / Locality</label>
                      <input
                        type="text"
                        value={settings.addressLine2}
                        onChange={(e) => handleChange('addressLine2', e.target.value)}
                        placeholder="Raghavendra Nagar, Rajakilpakkam"
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-[#AD4A85] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">City, State &amp; PIN Code</label>
                      <input
                        type="text"
                        value={settings.cityStatePin}
                        onChange={(e) => handleChange('cityStatePin', e.target.value)}
                        placeholder="Chennai, Tamil Nadu, 600073"
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-[#AD4A85] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Place of Supply</label>
                      <input
                        type="text"
                        value={settings.placeOfSupply}
                        onChange={(e) => handleChange('placeOfSupply', e.target.value)}
                        placeholder="Tamil Nadu"
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-[#AD4A85] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Contact Phone Number</label>
                      <input
                        type="text"
                        value={settings.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="9790904504"
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-[#AD4A85] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">GSTIN Number</label>
                      <input
                        type="text"
                        value={settings.gstin}
                        onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
                        placeholder="33BPCPA4714D1ZP"
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono text-gray-900 uppercase focus:ring-2 focus:ring-[#AD4A85] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Store Support Email</label>
                      <input
                        type="email"
                        value={settings.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="connect.jalyn@gmail.com"
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-[#AD4A85] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Bill Header Title</label>
                      <input
                        type="text"
                        value={settings.invoiceTitle}
                        onChange={(e) => handleChange('invoiceTitle', e.target.value)}
                        placeholder="TAX INVOICE"
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold uppercase text-gray-900 focus:ring-2 focus:ring-[#AD4A85] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Footer Message</label>
                    <input
                      type="text"
                      value={settings.footerMessage}
                      onChange={(e) => handleChange('footerMessage', e.target.value)}
                      placeholder="Thank you for your purchase"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-[#AD4A85] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Exchange / Terms Policy (Optional)</label>
                    <input
                      type="text"
                      value={settings.termsNote}
                      onChange={(e) => handleChange('termsNote', e.target.value)}
                      placeholder="Exchanges accepted within 7 days with original tags intact."
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-[#AD4A85] outline-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'toggles' && (
                <div className="space-y-2.5 text-xs">
                  <p className="text-gray-500 text-[11px] mb-2">
                    Enable or disable specific sections from appearing on the printed thermal roll receipt.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { key: 'showStoreHeader', label: 'Store Name Header' },
                      { key: 'showAddress', label: 'Store Address Lines' },
                      { key: 'showPhone', label: 'Store Phone Number' },
                      { key: 'showGstin', label: 'Store GSTIN' },
                      { key: 'showEmail', label: 'Store Email' },
                      { key: 'showInvoiceTitle', label: 'Invoice Title ("TAX INVOICE")' },
                      { key: 'showCustomerInfo', label: 'Bill To / Customer Info' },
                      { key: 'showPlaceOfSupply', label: 'Place of Supply' },
                      { key: 'showItemRate', label: 'Item Rate Column (Taxable Rate)' },
                      { key: 'showItemGstRate', label: 'Item GST % Line ("GST: 5%")' },
                      { key: 'showTaxBreakdown', label: 'Tax Breakdown (Taxable, CGST, SGST)' },
                      { key: 'showYouSaved', label: '"You Saved" Discount Line' },
                      { key: 'showReceivedBalance', label: 'Received & Balance Amount' },
                      { key: 'showFooterMessage', label: 'Footer Thank You Message' },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white hover:border-pink-200 transition cursor-pointer"
                      >
                        <span className="font-semibold text-gray-800">{item.label}</span>
                        <input
                          type="checkbox"
                          checked={!!settings[item.key]}
                          onChange={(e) => handleChange(item.key, e.target.checked)}
                          className="w-4 h-4 text-[#AD4A85] rounded border-gray-300 focus:ring-[#AD4A85]"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'layout' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Thermal Printer Paper Width</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleChange('paperWidth', '80mm')}
                        className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                          settings.paperWidth === '80mm'
                            ? 'border-[#2A1A22] bg-[#2A1A22] text-white font-bold'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-sm font-bold">80mm (3 Inch)</span>
                        <span className="text-[10px] opacity-80">Standard Retail POS (Recommended)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChange('paperWidth', '58mm')}
                        className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                          settings.paperWidth === '58mm'
                            ? 'border-[#2A1A22] bg-[#2A1A22] text-white font-bold'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-sm font-bold">58mm (2 Inch)</span>
                        <span className="text-[10px] opacity-80">Compact Mobile / Bluetooth Printer</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Default POS GST Percentage</label>
                      <select
                        value={settings.defaultGstRate}
                        onChange={(e) => handleChange('defaultGstRate', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold bg-white text-gray-900 focus:ring-2 focus:ring-[#AD4A85] outline-none"
                      >
                        <option value={5}>5% GST (Apparel Standard &le; ₹2,500)</option>
                        <option value={18}>18% GST (Apparel Standard &gt; ₹2,500)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Default GST Calculation Mode</label>
                      <select
                        value={settings.isGstInclusive ? 'inclusive' : 'exclusive'}
                        onChange={(e) => handleChange('isGstInclusive', e.target.value === 'inclusive')}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 font-bold bg-white text-gray-900 focus:ring-2 focus:ring-[#AD4A85] outline-none"
                      >
                        <option value="inclusive">MRP Includes GST (Inclusive - Standard)</option>
                        <option value="exclusive">Add GST on top of Price (Exclusive)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 text-xs font-bold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#2A1A22] hover:bg-[#3D2631] rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-pink-300" /> Save Settings
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Live Thermal Receipt Preview (5 Cols) */}
          <div className="md:col-span-5 flex flex-col h-full bg-gray-100 overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-200/80 border-b border-gray-300 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#AD4A85]" /> Live Thermal Bill Preview ({settings.paperWidth})
              </span>
              <span className="text-[10px] text-gray-500 font-mono">Instant Preview</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex items-start justify-center">
              {/* Receipt Paper Simulation */}
              <div
                className="bg-white shadow-xl border border-gray-300 text-black font-mono p-4 text-[12px] leading-tight space-y-2 rounded-sm"
                style={{ width: settings.paperWidth === '58mm' ? '230px' : '310px' }}
              >
                {/* Store Header */}
                {settings.showStoreHeader && (
                  <div className="text-center space-y-1">
                    {settings.showLogo && (
                      <img
                        src={settings.logoUrl || jalynLogoSmallUrl}
                        alt="Logo"
                        className="max-h-11 mx-auto mb-1 block object-contain"
                      />
                    )}
                    <div className="font-black text-base uppercase tracking-wider text-black">{settings.storeName}</div>
                    {settings.showAddress && (
                      <>
                        <div className="text-[11px] font-bold text-black">{settings.shopNo}</div>
                        <div className="text-[11px] font-bold text-black">{settings.addressLine2}</div>
                        <div className="text-[11px] font-bold text-black">{settings.cityStatePin}</div>
                      </>
                    )}
                    {settings.showPhone && settings.phone && (
                      <div className="text-[11px] font-bold text-black">Phone No : {settings.phone}</div>
                    )}
                    {settings.showGstin && settings.gstin && (
                      <div className="text-[11px] font-black text-black">GST : {settings.gstin}</div>
                    )}
                    {settings.showEmail && settings.email && (
                      <div className="text-[11px] font-bold text-black">Email : {settings.email}</div>
                    )}
                  </div>
                )}

                {settings.showInvoiceTitle && (
                  <div className="text-center font-black text-sm tracking-widest border-t-2 border-dashed border-black pt-1.5 mt-1.5 uppercase text-black">
                    {settings.invoiceTitle}
                  </div>
                )}

                {/* Meta Block */}
                {settings.showCustomerInfo && (
                  <div className="border-t-1.5 border-dashed border-black pt-1.5 space-y-0.5 text-[11px] font-bold text-black">
                    <div className="flex justify-between">
                      <span>Invoice No : <strong className="font-black">1833</strong></span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date : <strong className="font-black">21/08/2026</strong></span>
                    </div>
                    <div>Bill To : Cash Sale</div>
                    {settings.showPhone && <div>Ph. : 9790904504</div>}
                    {settings.showPlaceOfSupply && <div>Place of Supply : {settings.placeOfSupply}</div>}
                    {settings.showShipTo && <div>Ship To : {settings.defaultShipTo}</div>}
                  </div>
                )}

                {/* Items Table */}
                <div className="border-t-1.5 border-dashed border-black pt-1.5">
                  <div className="flex justify-between font-black text-[11.5px] pb-1 border-b-1.5 border-black text-black">
                    <span className="w-4">#</span>
                    <span className="flex-1 px-1">Item</span>
                    <span className="w-10 text-center">Qty</span>
                    {settings.showItemRate && <span className="w-14 text-right">Rate</span>}
                    <span className="w-12 text-right">Amt</span>
                  </div>

                  {/* Sample Row 1 */}
                  <div className="py-1.5 border-b border-gray-300 space-y-0.5 text-[11px]">
                    <div className="flex justify-between items-start">
                      <span className="w-4 font-black">1</span>
                      <div className="flex-1 px-1 font-black">
                        <div>REY</div>
                        <div className="text-[9.5px] text-gray-800 font-bold">UMB(XL,2XL)</div>
                        {settings.showItemGstRate && <div className="text-[9.5px] font-bold">GST: 5%</div>}
                      </div>
                      <span className="w-10 text-center font-bold">1 Qty</span>
                      {settings.showItemRate && <span className="w-14 text-right font-bold">522.86</span>}
                      <span className="w-12 text-right font-black">549</span>
                    </div>
                  </div>

                  {/* Sample Row 2 */}
                  <div className="py-1.5 space-y-0.5 text-[11px]">
                    <div className="flex justify-between items-start">
                      <span className="w-4 font-black">2</span>
                      <div className="flex-1 px-1 font-black">
                        <div>REG TOPS</div>
                        {settings.showItemGstRate && <div className="text-[9.5px] font-bold">GST: 5%</div>}
                      </div>
                      <span className="w-10 text-center font-bold">1 Pcs</span>
                      {settings.showItemRate && <span className="w-14 text-right font-bold">760.95</span>}
                      <span className="w-12 text-right font-black">799</span>
                    </div>
                  </div>
                </div>

                {/* Sub Total & Calculations */}
                <div className="border-t-1.5 border-dashed border-black pt-1.5 space-y-1 text-[11.5px] font-bold text-black">
                  <div className="flex justify-between font-black">
                    <span>Sub Total</span>
                    <span>2</span>
                    <span>₹ 1,348</span>
                  </div>

                  {settings.showTaxBreakdown && (
                    <>
                      <div className="flex justify-between">
                        <span>Taxable Amount</span>
                        <span>₹ 1,283.81</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CGST @2.5%</span>
                        <span>₹ 32.1</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SGST @2.5%</span>
                        <span>₹ 32.1</span>
                      </div>
                    </>
                  )}

                  <div className="border-t-1.5 border-black pt-1 flex justify-between font-black text-sm text-black">
                    <span>Total</span>
                    <span>₹ 1,300</span>
                  </div>

                  {settings.showYouSaved && (
                    <div className="flex justify-between font-black text-black">
                      <span>You Saved</span>
                      <span>- ₹ 48</span>
                    </div>
                  )}

                  {settings.showReceivedBalance && (
                    <>
                      <div className="flex justify-between font-black text-black">
                        <span>Received</span>
                        <span>₹ 1,300</span>
                      </div>
                      <div className="flex justify-between font-black text-black">
                        <span>Balance Amount</span>
                        <span>₹ 0</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer */}
                {settings.showFooterMessage && (
                  <div className="border-t-1.5 border-dashed border-black pt-2 text-center text-[11px] font-bold text-black">
                    <div className="font-black">{settings.footerMessage}</div>
                    {settings.termsNote && (
                      <div className="text-[9.5px] text-gray-800 mt-0.5 font-bold">{settings.termsNote}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
