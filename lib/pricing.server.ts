// Server-only: constructs the Razorpay client and must never be imported into a
// client component (would leak the secret). Named `.server.ts` by convention.
import { PLANS } from "./plans";

/**
 * Fetch live monthly amounts (in ₹) for each subscription plan from Razorpay.
 *
 * Returns a map of `${key}_monthly` → ₹. Any plan without configured
 * credentials, without a plan id, or that fails to fetch is simply omitted, so
 * the caller falls back to the config default in `lib/plans.ts`. This never
 * throws — pricing must always render.
 *
 * The Razorpay SDK is imported dynamically and the client is constructed only
 * when credentials exist, so an unconfigured environment (the current state)
 * costs nothing and cannot crash the page.
 */
export async function getLivePrices(): Promise<Record<string, number>> {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return {};

  let RazorpayCtor: any;
  try {
    RazorpayCtor = (await import("razorpay")).default;
  } catch {
    return {};
  }

  let client: any;
  try {
    client = new RazorpayCtor({ key_id: keyId, key_secret: keySecret });
  } catch {
    return {};
  }

  const out: Record<string, number> = {};

  await Promise.all(
    PLANS.filter((p) => p.razorpayPlanEnv).map(async (p) => {
      const planId = process.env[p.razorpayPlanEnv!.monthly];
      if (!planId) return;
      try {
        const plan = await client.plans.fetch(planId);
        const paise = Number(plan?.item?.amount);
        if (Number.isFinite(paise) && paise > 0) {
          out[`${p.key}_monthly`] = Math.round(paise / 100);
        }
      } catch {
        // leave unset → config default is used
      }
    })
  );

  return out;
}
