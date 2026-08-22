import { useEffect, useRef, useCallback } from 'react';

export default function useScannerInput(onScan, options = {}) {
  const {
    debounceMs = 300,
    minLength = 3,
    maxLength = 50,
    charIntervalThreshold = 60, // ms between chars from hardware scanner
  } = options;

  const bufferRef = useRef('');
  const timestampsRef = useRef([]);
  const lastScanTimeRef = useRef(0);
  const timeoutRef = useRef(null);

  const handleKeyDown = useCallback((e) => {
    const activeEl = document.activeElement;
    const isScanCaptureEl =
      activeEl?.getAttribute('data-scan-capture') === 'true' ||
      activeEl?.id === 'pos-barcode-scanner-input' ||
      activeEl?.id === 'pos-main-search-input';

    const now = Date.now();

    // Handle Enter/Tab terminator from scanner
    if (e.key === 'Enter' || e.key === 'Tab') {
      const code = bufferRef.current.trim();
      const timestamps = timestampsRef.current;
      const isFast = isFastBurst(timestamps, charIntervalThreshold);

      if (code.length >= minLength && code.length <= maxLength && (isFast || isScanCaptureEl || code.toUpperCase().startsWith('JN-') || code.toUpperCase().startsWith('SKU-'))) {
        if (now - lastScanTimeRef.current > debounceMs) {
          e.preventDefault();
          e.stopPropagation();
          lastScanTimeRef.current = now;
          onScan(code);
        }
      }

      // Reset buffer
      bufferRef.current = '';
      timestampsRef.current = [];
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    // Capture printable characters
    if (e.key && e.key.length === 1 && /[0-9a-zA-Z\-_./#]/.test(e.key)) {
      bufferRef.current += e.key;
      timestampsRef.current.push(now);

      // Auto-clear buffer if no new character arrives within 350ms
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        bufferRef.current = '';
        timestampsRef.current = [];
      }, 350);

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

function isFastBurst(timestamps, threshold) {
  if (timestamps.length < 3) return false;
  let fastCount = 0;
  for (let i = 1; i < timestamps.length; i++) {
    if (timestamps[i] - timestamps[i - 1] <= threshold) {
      fastCount++;
    }
  }
  return fastCount / (timestamps.length - 1) >= 0.5;
}

