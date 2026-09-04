import PricingTable from "@/components/pricing/PricingTable";
import { resolveAllServices } from "@/lib/plans";
import { getLivePrices } from "@/lib/pricing.server";

// Re-resolve live Razorpay prices at most hourly (ISR). Falls back to the
// config defaults in lib/plans.ts when Razorpay is not configured.
export const revalidate = 3600;

export default async function PricingPage() {
  const live = await getLivePrices();
  const services = resolveAllServices(live);
  return <PricingTable services={services} />;
}
