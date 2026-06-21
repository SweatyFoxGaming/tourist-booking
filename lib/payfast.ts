import crypto from "crypto";
import { getAppUrl } from "@/lib/booking";

const SANDBOX_HOST = "sandbox.payfast.co.za";
const LIVE_HOST = "www.payfast.co.za";

export function isPayfastSandbox(): boolean {
  return process.env.PAYFAST_SANDBOX !== "false";
}

export function getPayfastHost(): string {
  return isPayfastSandbox() ? SANDBOX_HOST : LIVE_HOST;
}

export function getPayfastProcessUrl(): string {
  return `https://${getPayfastHost()}/eng/process`;
}

export function isPayfastConfigured(): boolean {
  const merchantId = process.env.PAYFAST_MERCHANT_ID ?? "";
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY ?? "";

  return (
    !!merchantId &&
    !!merchantKey &&
    !merchantId.includes("placeholder") &&
    !merchantKey.includes("placeholder")
  );
}

export function payfastEncode(value: string): string {
  return encodeURIComponent(String(value).trim())
    .replace(/%([0-9a-f]{2})/gi, (_, hex) => `%${hex.toUpperCase()}`)
    .replace(/%20/g, "+");
}

export function generatePayfastSignature(
  data: Record<string, string>,
  passphrase?: string
): string {
  let paramString = "";

  for (const [key, val] of Object.entries(data)) {
    if (val !== "") {
      paramString += `${key}=${payfastEncode(val)}&`;
    }
  }

  paramString = paramString.slice(0, -1);

  if (passphrase) {
    paramString += `&passphrase=${payfastEncode(passphrase.trim())}`;
  }

  return crypto.createHash("md5").update(paramString).digest("hex");
}

export function formatPayfastAmount(amount: number): string {
  return amount.toFixed(2);
}

export function splitName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { first: "Guest", last: "-" };
  }

  if (parts.length === 1) {
    return { first: parts[0], last: "-" };
  }

  return { first: parts[0], last: parts.slice(1).join(" ") };
}

export function buildPayfastCheckoutData(options: {
  bookingId: string;
  activityId: string;
  amount: number;
  itemName: string;
  itemDescription?: string;
  customerName: string;
  customerEmail: string;
}): { action: string; fields: Record<string, string> } {
  const appUrl = getAppUrl();
  const { first, last } = splitName(options.customerName);

  const data: Record<string, string> = {
    merchant_id: process.env.PAYFAST_MERCHANT_ID!,
    merchant_key: process.env.PAYFAST_MERCHANT_KEY!,
    return_url: `${appUrl}/booking/success?bookingId=${options.bookingId}`,
    cancel_url: `${appUrl}/book/${options.activityId}?cancelled=true`,
    notify_url: `${appUrl}/api/payfast/notify`,
    name_first: first,
    name_last: last,
    email_address: options.customerEmail,
    m_payment_id: options.bookingId,
    amount: formatPayfastAmount(options.amount),
    item_name: options.itemName.slice(0, 100),
  };

  if (options.itemDescription) {
    data.item_description = options.itemDescription.slice(0, 255);
  }

  const passphrase = process.env.PAYFAST_PASSPHRASE?.trim();
  data.signature = generatePayfastSignature(data, passphrase || undefined);

  return {
    action: getPayfastProcessUrl(),
    fields: data,
  };
}

export function parsePayfastItnBody(body: string): Record<string, string> {
  const params = new URLSearchParams(body);
  const data: Record<string, string> = {};

  params.forEach((value, key) => {
    data[key] = value;
  });

  return data;
}

export function buildItnParamString(data: Record<string, string>): string {
  const parts: string[] = [];

  for (const [key, val] of Object.entries(data)) {
    if (key === "signature") {
      break;
    }
    parts.push(`${key}=${payfastEncode(val)}`);
  }

  return parts.join("&");
}

export function verifyPayfastItnSignature(
  data: Record<string, string>,
  paramString: string,
  passphrase?: string
): boolean {
  let tempParamString = paramString;

  if (passphrase) {
    tempParamString += `&passphrase=${payfastEncode(passphrase.trim())}`;
  }

  const signature = crypto.createHash("md5").update(tempParamString).digest("hex");
  return data.signature === signature;
}

export function amountsMatch(expected: number, received: string): boolean {
  return Math.abs(expected - parseFloat(received)) <= 0.01;
}

export async function validateItnWithPayfast(paramString: string): Promise<boolean> {
  const url = `https://${getPayfastHost()}/eng/query/validate`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: paramString,
  });

  const text = await response.text();
  return text.trim() === "VALID";
}
