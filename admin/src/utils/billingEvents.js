// Global event dispatcher for opening POS Billing Modal from any component (Header, Dashboard, etc.)
const POS_BILLING_EVENT = 'jalyn_open_pos_billing';

export const openGlobalPosBilling = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(POS_BILLING_EVENT));
  }
};

export const onGlobalPosBilling = (callback) => {
  if (typeof window === 'undefined') return () => {};
  const handler = () => callback();
  window.addEventListener(POS_BILLING_EVENT, handler);
  return () => window.removeEventListener(POS_BILLING_EVENT, handler);
};
