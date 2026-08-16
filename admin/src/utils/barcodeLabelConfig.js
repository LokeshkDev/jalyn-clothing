// Barcode Label Configuration — Single Source of Truth
// Global label size: 3 × 2 inches (76.2mm × 50.8mm)

export const BARCODE_LABEL_CONFIG = {
  // Physical dimensions
  widthIn: 3,
  heightIn: 2,
  widthMm: 76.2,
  heightMm: 50.8,
  
  // Print resolution
  dpi: 300,
  pxWidth: 900,   // 3 * 300
  pxHeight: 600,  // 2 * 300
  
  // A4 bulk printing
  a4: {
    widthMm: 210,
    heightMm: 297,
    marginMm: 10,
    gapMm: 2,
  },
  
  // Default scanner settings
  scanner: {
    debounceMs: 300,
    minBarcodeLength: 8,
    maxBarcodeLength: 30,
    charIntervalThresholdMs: 80,  // chars arriving faster than this = scanner
    terminator: 'Enter',
  },
  
  // Default label content settings
  label: {
    companyName: 'JALYN',
    showProductName: true,
    showColor: true,
    showSize: true,
    showPrice: true,
    showBarcodeNumber: true,
  },
  
  // Low stock threshold
  lowStockThreshold: 5,
};

// Helper: calculate A4 grid layout
export function calculateA4Grid(config = BARCODE_LABEL_CONFIG) {
  const { a4, widthMm, heightMm } = config;
  const usableWidth = a4.widthMm - (2 * a4.marginMm);
  const usableHeight = a4.heightMm - (2 * a4.marginMm);
  const cols = Math.floor((usableWidth + a4.gapMm) / (widthMm + a4.gapMm));
  const rows = Math.floor((usableHeight + a4.gapMm) / (heightMm + a4.gapMm));
  return { cols, rows, labelsPerPage: cols * rows };
}
