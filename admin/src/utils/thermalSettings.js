// Thermal Billing Receipt Configuration & CRUD Storage
// Provides customizable store details, layout toggles, tax configuration, and paper sizing

export const DEFAULT_THERMAL_SETTINGS = {
  // Store Header
  storeName: 'JALYN APPARELS',
  tagline: 'Style Meets Comfort',
  shopNo: 'Shop No : 6, Madambakkam Main Road',
  addressLine2: 'Raghavendra Nagar, Rajakilpakkam, Chennai 73',
  cityStatePin: 'Chennai, Tamil Nadu, 600073',
  phone: '9790904504',
  gstin: '33BPCPA4714D1ZP',
  email: 'connect.jalyn@gmail.com',
  invoiceTitle: 'TAX INVOICE',
  placeOfSupply: 'Tamil Nadu',
  defaultShipTo: 'Business Name',

  // Print Configuration
  paperWidth: '80mm', // '80mm' or '58mm'
  fontSize: 'large', // 'compact', 'normal', 'large'
  showLogo: true, // Show store logo at the top
  logoUrl: '',

  // Visibility Toggles
  showStoreHeader: true,
  showAddress: true,
  showPhone: true,
  showGstin: true,
  showEmail: true,
  showInvoiceTitle: true,
  showCustomerInfo: true,
  showCustomerPhone: true,
  showPlaceOfSupply: false, // Clean layout - disabled by default
  showShipTo: false, // Clean layout - disabled by default
  showItemSku: false, // Clean layout - hides JLN-XX codes under item
  showItemRate: true, // Shows taxable unit rate column
  showItemGstRate: false, // Clean layout - hides individual GST % line under item (already in totals breakdown)
  showTaxBreakdown: true, // Shows Taxable Amount, CGST, SGST breakdown
  showYouSaved: true, // Shows "You Saved - ₹ XX" line
  showReceivedBalance: true, // Shows Received and Balance Amount lines
  showBarcode: false, // Optional bottom barcode
  showFooterMessage: true,
  showTermsAndConditions: true,

  // Footer & Terms and Conditions (Array for full CRUD)
  footerMessage: 'Thank you for your purchase',
  termsNote: 'Exchanges accepted within 7 days with original tags intact.',
  termsAndConditions: [
    'Exchanges accepted within 7 days with original tags intact.',
    'Original invoice copy required for all exchanges.'
  ],

  // Default Tax Settings
  defaultGstRate: 5, // 5%
  isGstInclusive: true, // Indian retail standard
};

const STORAGE_KEY = 'jalyn_thermal_settings_v1';

import api from '../services/api';

/**
 * Synchronous local retrieval (instant fallback for offline/modals)
 */
export function getThermalSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_THERMAL_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_THERMAL_SETTINGS, ...parsed };
  } catch (e) {
    console.warn('Error reading thermal settings from localStorage:', e);
    return { ...DEFAULT_THERMAL_SETTINGS };
  }
}

/**
 * Fetch thermal settings directly from MySQL Database via CMS API
 */
export async function fetchThermalSettingsFromDB() {
  try {
    const res = await api.get('/cms/sections');
    const dbSettings = res.data?.data?.thermal_settings;
    if (dbSettings && typeof dbSettings === 'object') {
      const merged = { ...DEFAULT_THERMAL_SETTINGS, ...dbSettings };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('thermal-settings-updated', { detail: merged }));
      }
      return merged;
    }
  } catch (err) {
    console.warn('Could not fetch thermal settings from DB, using cached:', err.message);
  }
  return getThermalSettings();
}

/**
 * Persist thermal settings to both LocalStorage and MySQL Database
 */
export async function saveThermalSettings(settings) {
  const updated = { ...DEFAULT_THERMAL_SETTINGS, ...settings };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('thermal-settings-updated', { detail: updated }));
    }
    // Async DB update via CMS Sections endpoint
    await api.put('/cms/sections/thermal_settings', updated);
    return updated;
  } catch (e) {
    console.error('Error saving thermal settings to DB/localStorage:', e);
    return updated;
  }
}

/**
 * Reset thermal settings to defaults in LocalStorage and MySQL Database
 */
export async function resetThermalSettings() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('thermal-settings-updated', { detail: DEFAULT_THERMAL_SETTINGS }));
    }
    await api.put('/cms/sections/thermal_settings', DEFAULT_THERMAL_SETTINGS);
    return { ...DEFAULT_THERMAL_SETTINGS };
  } catch (e) {
    console.error('Error resetting thermal settings in DB:', e);
    return { ...DEFAULT_THERMAL_SETTINGS };
  }
}
