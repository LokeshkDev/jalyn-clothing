import { BARCODE_LABEL_CONFIG } from './barcodeLabelConfig';

const CODE128_ENCODINGS = '11011001100 11001101100 11001100110 10010011000 10010001100 10001001100 10011001000 10011000100 10001100100 11001001000 11001000100 11000100100 10110011100 10011011100 10011001110 10111001100 10011101100 10011100110 11001110010 11001011100 11001001110 11011100100 11001110100 11101101110 11101001100 11100101100 11100100110 11101100100 11100110100 11100110010 11011011000 11011000110 11000110110 10100011000 10001011000 10001000110 10110001000 10001101000 10001100010 11010001000 11000101000 11000100010 10110111000 10110001110 10001101110 10111011000 10111000110 10001110110 11101011000 11101000110 11100010110 11011101000 11011100010 11001110100 11110100010 11010111000 11010001110 11000101110 11011101110 11110101000 11110100010 10100110000 10100001100 10010110000 10010000110 10000101100 10000100110 10110010000 10110000100 10011010000 10011000010 10000110100 10000110010 11000010010 11001010000 11110111010 11000010100 10001111010 10100111100 10010111100 10010011110 10111100100 10011110100 10011110010 11110100100 11110010100 11110010010 11011011110 11011110110 11110110110 10101111000 10100011110 10001011110 10111101000 10111100010 11110101000 11110100010 10111011110 10111101110 11101011110 11110101110 11010000100 11010010000 11010011100 1100011101011'.split(' ');

export function encodeCode128(text) {
  if (!text) return '';
  
  const START_B = 104;
  const STOP = 106;
  
  let checkDigit = START_B;
  let encoding = CODE128_ENCODINGS[START_B];
  
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const value = charCode - 32;
    if (value < 0 || value > 95) {
      console.warn(`Character '${text[i]}' not supported in Code 128B`);
      continue;
    }
    
    encoding += CODE128_ENCODINGS[value];
    checkDigit = (checkDigit + (i + 1) * value) % 103;
  }
  
  encoding += CODE128_ENCODINGS[checkDigit];
  encoding += CODE128_ENCODINGS[STOP];
  
  return encoding;
}

export function generateBarcodeSVG(text, options = {}) {
  const {
    width = '100%',
    height = 60,
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
      rects += `<rect x="${currentX}" y="0" width="${moduleWidth}" height="${barcodeHeight}" fill="${barColor}" />`;
    }
    currentX += moduleWidth;
  }
  
  let textSvg = '';
  if (showText) {
    const textY = barcodeHeight + textMargin + (fontSize * 0.8);
    const textX = calculatedWidth / 2;
    textSvg = `<text x="${textX}" y="${textY}" font-family="monospace" font-size="${fontSize}" text-anchor="middle" fill="${barColor}">${text}</text>`;
  }
  
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${calculatedWidth} ${height}">
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
  
  const marginX = 40;
  const marginY = 40;
  
  // Company Name
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.font = 'bold 48px sans-serif';
  ctx.fillText(labelData.companyName || config.label.companyName, canvas.width / 2, marginY + 40);
  
  // Product Name
  ctx.font = '36px sans-serif';
  const maxWidth = canvas.width - (marginX * 2);
  let productName = labelData.productName || 'Unknown Product';
  // Simple truncation
  if (ctx.measureText(productName).width > maxWidth) {
    while (ctx.measureText(productName + '...').width > maxWidth && productName.length > 0) {
      productName = productName.slice(0, -1);
    }
    productName += '...';
  }
  ctx.fillText(productName, canvas.width / 2, marginY + 110);
  
  // Color • Size • Price
  ctx.font = '32px sans-serif';
  const details = [];
  if (labelData.color && config.label.showColor) details.push(labelData.color);
  if (labelData.size && config.label.showSize) details.push(`Size: ${labelData.size}`);
  if (labelData.price && config.label.showPrice) details.push(`₹${labelData.price}`);
  
  ctx.fillText(details.join(' • '), canvas.width / 2, marginY + 170);
  
  // Barcode
  const barcodeY = marginY + 220;
  const barcodeHeight = 180;
  const barcodeText = labelData.barcode || '';
  
  if (barcodeText) {
    const encoding = encodeCode128(barcodeText);
    const moduleWidth = 6;
    const quietZone = 10;
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
      ctx.font = '32px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(barcodeText, canvas.width / 2, barcodeY + barcodeHeight + 40);
    }
  }
  
  return canvas.toDataURL('image/png');
}
