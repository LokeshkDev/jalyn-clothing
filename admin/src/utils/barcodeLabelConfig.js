// Barcode Label Configuration — Single Source of Truth
// Fixed physical label size: 50mm × 25mm (2" × 1")
// Bulk layout: exactly 2 stickers per row (100mm × 25mm per row)

export const BARCODE_LABEL_CONFIG = {
  // Physical dimensions
  widthIn: 1.97,
  heightIn: 0.98,
  widthMm: 50,
  heightMm: 25,

  // Print resolution
  dpi: 300,
  pxWidth: 591,   // 50mm at 300dpi (590.55)
  pxHeight: 295,  // 25mm at 300dpi (295.27)

  // Bulk label printing — 2 stickers per row on a continuous 100mm × 25mm sheet
  bulk: {
    labelsPerRow: 2,
    rowWidthMm: 100,
    rowHeightMm: 25,
    gapMm: 0,
    marginMm: 0,
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

// Helper: rows needed for a given label count (2 stickers per row)
export function calculateBulkRows(labelCount, config = BARCODE_LABEL_CONFIG) {
  return Math.ceil((labelCount || 0) / config.bulk.labelsPerRow);
}
