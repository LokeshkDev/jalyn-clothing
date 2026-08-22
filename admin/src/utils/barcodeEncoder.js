import { BARCODE_LABEL_CONFIG } from './barcodeLabelConfig.js';

// Canonical ISO/IEC 15417 Code 128 Symbol Widths (Indices 0 to 106)
const CODE128_WIDTHS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112'
];

export const CODE128_PATTERNS = CODE128_WIDTHS.map((w) => {
  let res = '';
  let isBar = true;
  for (const digit of w) {
    res += (isBar ? '1' : '0').repeat(parseInt(digit, 10));
    isBar = !isBar;
  }
  return res;
});

export function encodeCode128(text) {
  if (!text) return '';
  
  const clean = String(text).trim();
  const START_B = 104;
  const STOP = 106;
  
  let checkDigit = START_B;
  let encoding = CODE128_PATTERNS[START_B];
  
  for (let i = 0; i < clean.length; i++) {
    const charCode = clean.charCodeAt(i);
    const value = charCode - 32;
    if (value < 0 || value > 95) {
      console.warn(`Character '${clean[i]}' not supported in Code 128B, skipping`);
      continue;
    }
    
    encoding += CODE128_PATTERNS[value];
    checkDigit = (checkDigit + (i + 1) * value) % 103;
  }
  
  encoding += CODE128_PATTERNS[checkDigit];
  encoding += CODE128_PATTERNS[STOP];
  
  return encoding;
}

export function generateBarcodeSVG(text, options = {}) {
  const {
    width = '100%',
    height = 50,
    moduleWidth = 2,
    quietZone = 10,
    showText = false,
    fontSize = 14,
    textMargin = 2,
    barColor = '#000000',
    backgroundColor = '#ffffff'
  } = options;
  
  const encoding = encodeCode128(text);
  if (!encoding) return '';
  
  const totalModules = encoding.length + (quietZone * 2);
  const calculatedWidth = totalModules * moduleWidth;
  const barcodeHeight = showText ? height - fontSize - textMargin : height;
  
  let rects = '';
  let currentX = quietZone * moduleWidth;
  
  for (let i = 0; i < encoding.length; i++) {
    if (encoding[i] === '1') {
      rects += `<rect x="${currentX}" y="0" width="${moduleWidth}" height="${barcodeHeight}" fill="${barColor}" shape-rendering="crispEdges" />`;
    }
    currentX += moduleWidth;
  }
  
  let textSvg = '';
  if (showText) {
    const textY = barcodeHeight + textMargin + (fontSize * 0.8);
    const textX = calculatedWidth / 2;
    textSvg = `<text x="${textX}" y="${textY}" font-family="monospace" font-weight="900" font-size="${fontSize}" text-anchor="middle" fill="${barColor}">${text}</text>`;
  }
  
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${calculatedWidth} ${height}" preserveAspectRatio="xMidYMid meet" shape-rendering="crispEdges">
      <rect width="100%" height="100%" fill="${backgroundColor}" />
      ${rects}
      ${textSvg}
    </svg>
  `.trim();
}

export function generateBarcodePNG(labelData, config = BARCODE_LABEL_CONFIG) {
  const canvas = document.createElement('canvas');
  canvas.width = config.pxWidth;
  canvas.height = config.pxHeight;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const marginX = 26;
  const marginY = 14;

  // Company Name
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.font = '900 28px sans-serif';
  ctx.fillText(labelData.companyName || config.label.companyName, canvas.width / 2, marginY + 28);

  // Product Name
  ctx.font = '800 22px sans-serif';
  const maxWidth = canvas.width - (marginX * 2);
  let productName = labelData.productName || 'Unknown Product';
  // Simple truncation
  if (ctx.measureText(productName).width > maxWidth) {
    while (ctx.measureText(productName + '...').width > maxWidth && productName.length > 0) {
      productName = productName.slice(0, -1);
    }
    productName += '...';
  }
  ctx.fillText(productName, canvas.width / 2, marginY + 64);

  // Color • Size • Price
  ctx.font = 'bold 19px sans-serif';
  const details = [];
  if (labelData.color && config.label.showColor) details.push(labelData.color);
  if (labelData.size && config.label.showSize) details.push(`Size: ${labelData.size}`);
  if (labelData.price && config.label.showPrice) details.push(`₹${labelData.price}`);

  ctx.fillText(details.join(' • '), canvas.width / 2, marginY + 98);

  // Barcode
  const barcodeY = marginY + 116;
  const barcodeHeight = 116;
  const barcodeText = labelData.barcode || '';

  if (barcodeText) {
    const encoding = encodeCode128(barcodeText);
    const moduleWidth = 2.6;
    const quietZone = 8;
    const totalBarcodeWidth = (encoding.length + (quietZone * 2)) * moduleWidth;
    const startX = (canvas.width - totalBarcodeWidth) / 2 + (quietZone * moduleWidth);

    ctx.fillStyle = '#000000';
    let currentX = startX;

    for (let i = 0; i < encoding.length; i++) {
      if (encoding[i] === '1') {
        ctx.fillRect(currentX, barcodeY, moduleWidth, barcodeHeight);
      }
      currentX += moduleWidth;
    }

    // Barcode Number
    if (config.label.showBarcodeNumber) {
      ctx.font = '900 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(barcodeText, canvas.width / 2, barcodeY + barcodeHeight + 24);
    }
  }

  return canvas.toDataURL('image/png');
}
