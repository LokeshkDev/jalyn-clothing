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
  showPlaceOfSupply: true,
  showShipTo: true,
  showItemRate: true, // Shows taxable unit rate column
  showItemGstRate: true, // Shows "GST: 5%" under item name
  showTaxBreakdown: true, // Shows Taxable Amount, CGST, SGST breakdown
  showYouSaved: true, // Shows "You Saved - ₹ XX" line
  showReceivedBalance: true, // Shows Received and Balance Amount lines
  showBarcode: false, // Optional bottom barcode
  showFooterMessage: true,

  // Footer & Policy Notes
  footerMessage: 'Thank you for your purchase',
  termsNote: 'Exchanges accepted within 7 days with original tags intact.',

  // Default Tax Settings
  defaultGstRate: 5, // 5%
  isGstInclusive: true, // Indian retail standard
};

const STORAGE_KEY = 'jalyn_thermal_settings_v1';

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

export function saveThermalSettings(settings) {
  try {
    const updated = { ...DEFAULT_THERMAL_SETTINGS, ...settings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('thermal-settings-updated', { detail: updated }));
    }
    return updated;
  } catch (e) {
    console.error('Error saving thermal settings to localStorage:', e);
    return settings;
  }
}

export function resetThermalSettings() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('thermal-settings-updated', { detail: DEFAULT_THERMAL_SETTINGS }));
    }
    return { ...DEFAULT_THERMAL_SETTINGS };
  } catch (e) {
    return { ...DEFAULT_THERMAL_SETTINGS };
  }
}
