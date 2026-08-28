import crypto from 'crypto';

const SALT = process.env.CONSENT_SALT || 'jalyn_secure_consent_salt_2026';

/**
 * Generates a one-way salted SHA-256 HMAC hash of an IP address.
 * Satisfies GDPR Art. 7 Proof of Consent requirements without storing identifiable PII.
 */
export function hashIpAddress(ip) {
  if (!ip) return 'anonymous_ip';
  return crypto
    .createHmac('sha256', SALT)
    .update(String(ip).trim())
    .digest('hex');
}

