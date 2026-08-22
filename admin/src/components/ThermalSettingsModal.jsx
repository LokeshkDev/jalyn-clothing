import React, { useState, useEffect } from 'react';
import {
  X, Settings, Save, RotateCcw, Printer, Check, Store, FileText,
  Sliders, Eye, Phone, Mail, MapPin, Tag, ShieldCheck, HelpCircle, Image,
  Plus, Trash2, ArrowUp, ArrowDown, ListPlus
} from 'lucide-react';
import {
  getThermalSettings, fetchThermalSettingsFromDB, saveThermalSettings, resetThermalSettings, DEFAULT_THERMAL_SETTINGS
} from '../utils/thermalSettings';
import jalynLogoSmallUrl from '../assets/jalyn-logo-small.jpg';

export default function ThermalSettingsModal({ isOpen, onClose, onSaved }) {
  const [settings, setSettings] = useState(DEFAULT_THERMAL_SETTINGS);
  const [activeTab, setActiveTab] = useState('fields'); // 'fields', 'toggles', 'terms', 'layout'
  const [newTermInput, setNewTermInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(getThermalSettings());
      setSavedSuccess(false);
      setNewTermInput('');
      // Synchronize latest settings directly from MySQL DB
      fetchThermalSettingsFromDB().then((dbData) => {
        if (dbData) setSettings(dbData);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  // Terms & Conditions CRUD operations
  const handleAddTerm = () => {
    if (!newTermInput.trim()) return;
    const currentTerms = Array.isArray(settings.termsAndConditions) ? settings.termsAndConditions : [];
    handleChange('termsAndConditions', [...currentTerms, newTermInput.trim()]);
    setNewTermInput('');
  };

  const handleUpdateTerm = (index, value) => {
    const currentTerms = Array.isArray(settings.termsAndConditions) ? [...settings.termsAndConditions] : [];
    currentTerms[index] = value;
    handleChange('termsAndConditions', currentTerms);
  };

  const handleDeleteTerm = (index) => {
    const currentTerms = Array.isArray(settings.termsAndConditions) ? [...settings.termsAndConditions] : [];
    currentTerms.splice(index, 1);
    handleChange('termsAndConditions', currentTerms);
  };

  const handleMoveTerm = (index, direction) => {
    const currentTerms = Array.isArray(settings.termsAndConditions) ? [...settings.termsAndConditions] : [];
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= currentTerms.length) return;
    const [moved] = currentTerms.splice(index, 1);
    currentTerms.splice(newIdx, 0, moved);
    handleChange('termsAndConditions', currentTerms);
  };

  const handleSave = async () => {
    const saved = await saveThermalSettings(settings);
    setSettings(saved);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    onSaved?.(saved);
  };

  const handleReset = async () => {
    if (window.confirm('Reset thermal receipt format to default settings?')) {
      const reset = await resetThermalSettings();
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
            <div className="flex border-b border-gray-200 px-6 pt-3 gap-2 bg-gray-50/70 shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('fields')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
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
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'toggles'
                    ? 'border-[#AD4A85] text-[#AD4A85]'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" /> Display Toggles
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('terms')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'terms'
                    ? 'border-[#AD4A85] text-[#AD4A85]'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Terms &amp; Policies (CRUD)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('layout')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
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
                        placeholder="Raghavendra Nagar, Rajakilpakkam, Chennai 73"
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-[#AD4A85] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">City, State &amp; PIN</label>
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
                    <label className="block font-bold text-gray-700 mb-1">Footer Thank You Message</label>
                    <input
                      type="text"
                      value={settings.footerMessage}
                      onChange={(e) => handleChange('footerMessage', e.target.value)}
                      placeholder="Thank you for your purchase"
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
                      { key: 'showCustomerPhone', label: 'Customer Phone Number' },
                      { key: 'showPlaceOfSupply', label: 'Place of Supply (e.g. Tamil Nadu)' },
                      { key: 'showShipTo', label: 'Ship To (Business Name)' },
                      { key: 'showItemSku', label: 'Item Code / SKU (e.g. JLN-XX)' },
                      { key: 'showItemRate', label: 'Item Rate Column (Taxable Rate)' },
                      { key: 'showItemGstRate', label: 'Item GST % Line (e.g. "GST: 18%")' },
                      { key: 'showTaxBreakdown', label: 'Tax Breakdown (Taxable, CGST, SGST)' },
                      { key: 'showYouSaved', label: '"You Saved" Discount Line' },
                      { key: 'showReceivedBalance', label: 'Received & Balance Amount' },
                      { key: 'showFooterMessage', label: 'Footer Thank You Message' },
                      { key: 'showTermsAndConditions', label: 'Terms & Conditions Policy List' },
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

              {activeTab === 'terms' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-[#AD4A85]" /> Thermal Receipt Terms &amp; Conditions (CRUD)
                      </h4>
                      <p className="text-gray-500 text-[11px]">
                        Add, edit, reorder or remove terms &amp; conditions lines printed at the bottom of the bill.
                      </p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="font-bold text-gray-700 text-[11px]">Print Terms</span>
                      <input
                        type="checkbox"
                        checked={settings.showTermsAndConditions !== false}
                        onChange={(e) => handleChange('showTermsAndConditions', e.target.checked)}
                        className="w-4 h-4 text-[#AD4A85] rounded border-gray-300 focus:ring-[#AD4A85]"
                      />
                    </label>
                  </div>

                  {/* Add New Term Input Box (Create) */}
                  <div className="p-3 bg-pink-50/60 rounded-xl border border-pink-200/80 space-y-2">
                    <label className="block text-[11px] font-bold text-gray-800">Add New Term / Exchange Policy Line</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newTermInput}
                        onChange={(e) => setNewTermInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTerm();
                          }
                        }}
                        placeholder="e.g. Exchanges accepted within 7 days with original tags intact."
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs text-gray-900 focus:ring-2 focus:ring-[#AD4A85] outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddTerm}
                        disabled={!newTermInput.trim()}
                        className="px-3.5 py-2 bg-[#AD4A85] hover:bg-[#963c71] disabled:opacity-50 text-white font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Term
                      </button>
                    </div>
                  </div>

                  {/* Existing Terms List (Read, Update, Delete, Reorder) */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-gray-700">
                      Active Terms &amp; Conditions ({Array.isArray(settings.termsAndConditions) ? settings.termsAndConditions.length : 0})
                    </label>

                    {(!Array.isArray(settings.termsAndConditions) || settings.termsAndConditions.length === 0) ? (
                      <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-center text-gray-500">
                        No terms added yet. Add a policy above to customize receipt footer terms.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {settings.termsAndConditions.map((term, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-white rounded-xl border border-gray-200 hover:border-pink-200 flex items-center gap-2 transition shadow-xs"
                          >
                            <span className="w-6 h-6 rounded-full bg-pink-100 text-[#AD4A85] font-black text-xs flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              value={term}
                              onChange={(e) => handleUpdateTerm(idx, e.target.value)}
                              className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white text-xs font-semibold text-gray-900 focus:ring-1 focus:ring-[#AD4A85] outline-none"
                            />
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveTerm(idx, -1)}
                                className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100 cursor-pointer"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === settings.termsAndConditions.length - 1}
                                onClick={() => handleMoveTerm(idx, 1)}
                                className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100 cursor-pointer"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTerm(idx)}
                                className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"
                                title="Delete Term"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                        <option value="inclusive">MRP Includes GST (Indian Standard)</option>
                        <option value="exclusive">Add GST to MRP</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2 rounded-xl bg-[#2A1A22] hover:bg-[#3D2631] text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Save className="w-3.5 h-3.5 text-pink-300" /> Save Settings
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Thermal Bill Preview (5 Cols) */}
          <div className="md:col-span-5 p-6 flex flex-col items-center justify-start bg-gray-100 overflow-y-auto">
            <div className="w-full max-w-[320px] space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500 font-bold px-1">
                <span>LIVE THERMAL PREVIEW</span>
                <span>{settings.paperWidth} Roll</span>
              </div>

              {/* Thermal Paper Container */}
              <div
                className="bg-white shadow-xl border border-gray-300 text-black font-sans font-extrabold p-4 text-[11.5px] leading-snug space-y-2 rounded-sm"
                style={{
                  width: settings.paperWidth === '58mm' ? '230px' : '310px',
                  fontFamily: "'Segoe UI', Arial, -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
                  fontWeight: 800
                }}
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
                      <span>Invoice No : <strong className="font-black">ORD-2026-5275126</strong></span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date : <strong className="font-black">22/08/2026</strong></span>
                    </div>
                    <div>Bill To : loktest</div>
                    {settings.showCustomerPhone && <div>Ph. : 7010558149</div>}
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
                        <div>LUCKNOWI CHIKANKARI COTTON KURTI</div>
                        <div className="text-[9.5px] text-gray-900 font-bold">
                          {[settings.showItemSku ? 'JLN-18' : '', 'M', 'cream'].filter(Boolean).join(', ')}
                        </div>
                        {settings.showItemGstRate && <div className="text-[9.5px] font-bold">GST: 18%</div>}
                      </div>
                      <span className="w-10 text-center font-bold">1 Qty</span>
                      {settings.showItemRate && <span className="w-14 text-right font-bold">1948.31</span>}
                      <span className="w-12 text-right font-black">2299</span>
                    </div>
                  </div>

                  {/* Sample Row 2 */}
                  <div className="py-1.5 space-y-0.5 text-[11px]">
                    <div className="flex justify-between items-start">
                      <span className="w-4 font-black">2</span>
                      <div className="flex-1 px-1 font-black">
                        <div>LUCKNOWI CHIKANKARI COTTON KURTI</div>
                        <div className="text-[9.5px] text-gray-900 font-bold">
                          {[settings.showItemSku ? 'JLN-18' : '', 'S', 'cream'].filter(Boolean).join(', ')}
                        </div>
                        {settings.showItemGstRate && <div className="text-[9.5px] font-bold">GST: 18%</div>}
                      </div>
                      <span className="w-10 text-center font-bold">1 Qty</span>
                      {settings.showItemRate && <span className="w-14 text-right font-bold">1948.31</span>}
                      <span className="w-12 text-right font-black">2299</span>
                    </div>
                  </div>
                </div>

                {/* Sub Total & Calculations */}
                <div className="border-t-1.5 border-dashed border-black pt-1.5 space-y-1 text-[11.5px] font-bold text-black">
                  <div className="flex justify-between font-black">
                    <span>Sub Total</span>
                    <span>2</span>
                    <span>₹ 4,598</span>
                  </div>

                  {settings.showTaxBreakdown && (
                    <>
                      <div className="flex justify-between">
                        <span>Taxable Amount</span>
                        <span>₹ 3,896.61</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CGST @9%</span>
                        <span>₹ 350.7</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SGST @9%</span>
                        <span>₹ 350.7</span>
                      </div>
                    </>
                  )}

                  <div className="border-t-1.5 border-black pt-1 flex justify-between font-black text-sm text-black">
                    <span>Total</span>
                    <span>₹ 4,598</span>
                  </div>

                  {settings.showYouSaved && (
                    <div className="flex justify-between font-black text-black">
                      <span>You Saved</span>
                      <span>- ₹ 100</span>
                    </div>
                  )}

                  {settings.showReceivedBalance && (
                    <>
                      <div className="flex justify-between font-black text-black">
                        <span>Payment Mode</span>
                        <span>CASH</span>
                      </div>
                      <div className="flex justify-between font-black text-black">
                        <span>Received (₹)</span>
                        <span>₹ 12,000</span>
                      </div>
                      <div className="flex justify-between font-black text-black">
                        <span>Change / Balance</span>
                        <span>₹ 702</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer */}
                {settings.showFooterMessage && (
                  <div className="border-t-1.5 border-dashed border-black pt-2 text-center text-[11px] font-bold text-black space-y-1">
                    <div className="font-black">{settings.footerMessage}</div>
                    {settings.showTermsAndConditions !== false && Array.isArray(settings.termsAndConditions) && settings.termsAndConditions.length > 0 ? (
                      <div className="text-[9px] leading-tight text-gray-900 font-bold space-y-0.5 pt-0.5">
                        {settings.termsAndConditions.map((term, i) => (
                          <div key={i}>{term}</div>
                        ))}
                      </div>
                    ) : (
                      settings.termsNote && (
                        <div className="text-[9.5px] text-gray-900 mt-0.5 font-bold">{settings.termsNote}</div>
                      )
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
