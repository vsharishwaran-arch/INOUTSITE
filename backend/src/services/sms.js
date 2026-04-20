import env from '../config/env.js';

/**
 * Send OTP via Fast2SMS or fallback to console in dev mode.
 * To enable real SMS delivery:
 *   1. Recharge Fast2SMS with ₹100+ and set FAST2SMS_API_KEY in .env
 *   2. Or set SMS_PROVIDER=console in .env to always use console/dev mode
 */
export async function sendOtp(mobile, otp) {
  const apiKey = env.fast2smsApiKey;

  // If no API key or insufficient balance, use dev/console mode
  if (!apiKey || env.smsProvider === 'console') {
    console.log(`\n========================================`);
    console.log(`  OTP for +91 ${mobile}: ${otp}`);
    console.log(`========================================\n`);
    return { success: true, mode: 'console', devOtp: otp };
  }

  try {
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q',
        message: `Your INOUT Admin OTP is ${otp}. Valid for 5 minutes. Do not share with anyone.`,
        flash: 0,
        numbers: mobile,
      }),
    });

    const data = await response.json();

    if (!data.return) {
      console.error('[SMS] Fast2SMS error:', data.message);
      // Fallback to console mode on API error
      console.log(`\n========================================`);
      console.log(`  [FALLBACK] OTP for +91 ${mobile}: ${otp}`);
      console.log(`========================================\n`);
      return { success: true, mode: 'console', devOtp: otp };
    }

    return { success: true, mode: 'sms' };
  } catch (err) {
    console.error('[SMS] Network error:', err.message);
    console.log(`\n========================================`);
    console.log(`  [FALLBACK] OTP for +91 ${mobile}: ${otp}`);
    console.log(`========================================\n`);
    return { success: true, mode: 'console', devOtp: otp };
  }
}
