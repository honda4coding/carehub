import { fetchClient } from "./fetchClient";

const PAYMENT_BASE = "/payments";

export async function createCheckout(payload: {
  amount: number;
  purpose: "appointment" | "followup" | "subscription";
  referenceId: string;
  paymentMethod?: "card";
  useWallet?: boolean;
}): Promise<{ url: string }> {
  const res = await fetchClient.post(`${PAYMENT_BASE}/checkout`, payload);
  return { url: res.data?.paymentUrl || res.paymentUrl };
}

export async function payWithWallet(payload: {
  amount: number;
  purpose: "appointment" | "followup" | "subscription";
  referenceId: string;
}): Promise<{ status: string }> {
  const res = await fetchClient.post(`${PAYMENT_BASE}/checkout-wallet`, payload);
  return res.data ?? res;
}
