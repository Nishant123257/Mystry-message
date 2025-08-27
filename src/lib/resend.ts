import { Resend } from 'resend';

let cachedResend: Resend | null = null;

export function getResendClient(): Resend {
  if (cachedResend) return cachedResend;
  const apiKey = process.env.RESEND_API_KEY || '';
  if (!apiKey) {
    // Defer throwing until actually used to avoid build-time crash
    // Create a dummy that will throw when methods are called
    const handler: ProxyHandler<Record<string, unknown>> = {
      get() {
        throw new Error('Missing RESEND_API_KEY environment variable');
      },
    };
    cachedResend = new Proxy<Record<string, unknown>>({}, handler) as unknown as Resend;
    return cachedResend;
  }
  cachedResend = new Resend(apiKey);
  return cachedResend;
}