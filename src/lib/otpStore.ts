/**
 * In-memory OTP Store for Verification Codes
 * Features 10-minute automatic expiration and single-use invalidation.
 */

interface OtpRecord {
  code: string;
  email: string;
  expiresAt: number; // Timestamp
  verified: boolean;
}

// Global variable survives HMR in Next.js development
const globalForOtp = global as unknown as { otpCache: Map<string, OtpRecord> };
const otpCache = globalForOtp.otpCache || new Map<string, OtpRecord>();
if (process.env.NODE_ENV !== "production") globalForOtp.otpCache = otpCache;

export function storeOtp(email: string, code: string): void {
  const normalized = email.toLowerCase().trim();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpCache.set(normalized, {
    code,
    email: normalized,
    expiresAt,
    verified: false,
  });

  // Prune expired records
  const now = Date.now();
  for (const [key, val] of otpCache.entries()) {
    if (val.expiresAt < now) {
      otpCache.delete(key);
    }
  }
}

export function verifyOtpCode(email: string, inputCode: string): { valid: boolean; reason?: string } {
  const normalized = email.toLowerCase().trim();
  const record = otpCache.get(normalized);

  if (!record) {
    return { valid: false, reason: "No OTP found or expired. Please request a new one." };
  }

  if (Date.now() > record.expiresAt) {
    otpCache.delete(normalized);
    return { valid: false, reason: "OTP has expired. Please request a new code." };
  }

  if (record.code !== inputCode.trim()) {
    return { valid: false, reason: "Incorrect OTP code. Please check and try again." };
  }

  // Mark verified
  record.verified = true;
  otpCache.set(normalized, record);

  return { valid: true };
}

export function isEmailOtpVerified(email: string): boolean {
  const normalized = email.toLowerCase().trim();
  const record = otpCache.get(normalized);
  if (!record) return false;
  if (Date.now() > record.expiresAt) return false;
  return record.verified === true;
}

export function consumeOtpVerification(email: string): void {
  const normalized = email.toLowerCase().trim();
  otpCache.delete(normalized);
}
