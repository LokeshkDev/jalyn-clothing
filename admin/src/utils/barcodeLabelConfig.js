// Barcode Label Configuration — Single Source of Truth
// Supports 3 Stickers/Row (TVS LP-46 Lite 3-Up), 2 Stickers/Row (100×25mm), and 1 Sticker/Row (50×25mm)

export const BARCODE_LABEL_CONFIG = {
  // Physical dimensions
  widthIn: 1.97,
  heightIn: 0.98,
  widthMm: 50,
  heightMm: 25,

  // Print resolution
  dpi: 203, // Standard thermal printer DPI (TVS LP-46 Lite is 203 DPI)

  // Label Layout Modes
  modes: {
    '3_per_row': {
      id: '3_per_row',
      name: '3 Stickers / Row (TVS LP-46 Lite 3-Up)',
      labelsPerRow: 3,
      rowWidthMm: 105,
      rowHeightMm: 25,
      labelWidthMm: 33,
      labelHeightMm: 24,
      gapMm: 2,
    },
    '2_per_row': {
      id: '2_per_row',
      name: '2 Stickers / Row (100mm × 25mm)',
      labelsPerRow: 2,
      rowWidthMm: 100,
      rowHeightMm: 25,
      labelWidthMm: 48.5,
      labelHeightMm: 24,
      gapMm: 2,
    },
    '1_per_row': {
      id: '1_per_row',
      name: '1 Sticker / Row (50mm × 25mm)',
      labelsPerRow: 1,
      rowWidthMm: 50,
      rowHeightMm: 25,
      labelWidthMm: 48.5,
      labelHeightMm: 24,
      gapMm: 0,
    },
  },

  // Default bulk setting
  bulk: {
    labelsPerRow: 3,
    rowWidthMm: 105,
    rowHeightMm: 25,
  },

  // Default scanner settings
  scanner: {
    debounceMs: 300,
    minBarcodeLength: 6,
    maxBarcodeLength: 30,
    charIntervalThresholdMs: 80,
    terminator: 'Enter',
  },

  // Default label content settings
  label: {
    companyName: 'JALYN APPARELS',
    showProductName: true,
    showColor: false,
    showSize: true,
    showPrice: true,
    showBarcodeNumber: true,
  },

  lowStockThreshold: 5,
};

export function calculateBulkRows(labelCount, modeKey = '3_per_row') {
  const mode = BARCODE_LABEL_CONFIG.modes[modeKey] || BARCODE_LABEL_CONFIG.modes['3_per_row'];
  return Math.ceil((labelCount || 0) / mode.labelsPerRow);
}
