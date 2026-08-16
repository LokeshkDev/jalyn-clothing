import { useEffect, useRef, useCallback } from 'react';
import { BARCODE_LABEL_CONFIG } from '../utils/barcodeLabelConfig';

export default function useScannerInput(onScan, options = {}) {
  const {
    debounceMs = BARCODE_LABEL_CONFIG.scanner.debounceMs,
    minLength = BARCODE_LABEL_CONFIG.scanner.minBarcodeLength,
    maxLength = BARCODE_LABEL_CONFIG.scanner.maxBarcodeLength,
    charIntervalThreshold = BARCODE_LABEL_CONFIG.scanner.charIntervalThresholdMs,
  } = options;

  const bufferRef = useRef('');
  const timestampsRef = useRef([]);
  const lastScanTimeRef = useRef(0);
  const timeoutRef = useRef(null);

  const handleKeyDown = useCallback((e) => {
    // Check if the currently focused element should capture scan input
    const activeEl = document.activeElement;
    const isOnScanField = activeEl?.getAttribute('data-scan-capture') === 'true';
    
    // If user is typing in a normal form field (not scan-capture), ignore
    if (activeEl && !isOnScanField) {
      const tag = activeEl.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || activeEl.isContentEditable) {
        return; // Don't capture — user is typing in a normal field
      }
    }

    const now = Date.now();

    // Handle Enter/Tab (terminator)
    if (e.key === 'Enter' || e.key === 'Tab') {
      if (bufferRef.current.length >= minLength && bufferRef.current.length <= maxLength) {
        // Check if input was fast enough to be a scanner (or if on scan field, always accept)
        const isFastInput = isOnScanField || isLikelyScannerInput(timestampsRef.current, charIntervalThreshold);
        
        if (isFastInput || isOnScanField) {
          // Debounce: prevent duplicate bursts
          if (now - lastScanTimeRef.current > debounceMs) {
            e.preventDefault();
            e.stopPropagation();
            const barcode = bufferRef.current;
            lastScanTimeRef.current = now;
            onScan(barcode);
          }
        }
      }
      // Clear buffer
      bufferRef.current = '';
      timestampsRef.current = [];
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    // Only capture numeric characters and some barcode chars
    if (e.key.length === 1 && /[0-9]/.test(e.key)) {
      bufferRef.current += e.key;
      timestampsRef.current.push(now);
      
      // Clear buffer after timeout (if no more chars come)
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        bufferRef.current = '';
        timestampsRef.current = [];
      }, 500);
      
      // Prevent buffer overflow
      if (bufferRef.current.length > maxLength) {
        bufferRef.current = '';
        timestampsRef.current = [];
      }
    }
  }, [onScan, debounceMs, minLength, maxLength, charIntervalThreshold]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [handleKeyDown]);
}

function isLikelyScannerInput(timestamps, threshold) {
  if (timestamps.length < 3) return false;
  let fastCount = 0;
  for (let i = 1; i < timestamps.length; i++) {
    if (timestamps[i] - timestamps[i - 1] < threshold) {
      fastCount++;
    }
  }
  // If majority of intervals are fast, it's likely a scanner
  return fastCount / (timestamps.length - 1) > 0.6;
}
