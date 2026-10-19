import { formatNPR } from "./currency";
import type { Order } from "./types";

/**
 * Admin email notifications via Resend's REST API (no extra dependency).
 *
 * Env vars (server-side):
 *   RESEND_API_KEY        API key from resend.com
 *   ADMIN_NOTIFY_EMAIL    where "New Order Received!" emails go (comma-separate for several)
 *   EMAIL_FROM            optional sender, default "DollNepal <onboarding@resend.dev>"
 *                         (onboarding@resend.dev can only deliver to your own Resend account email;
 *                          verify your domain in Resend to use e.g. orders@yourdomain.com)
 *   NEXT_PUBLIC_SITE_URL  used for the admin dashboard link
 *
 * Without RESEND_API_KEY / ADMIN_NOTIFY_EMAIL this is a silent no-op, so orders never fail because of email.
 */

const METHOD_LABELS: Record<string, string> = {
  esewa: "eSewa",
  khalti: "Khalti",
  bank: "Prabhu Bank transfer",
  fonpay: "Fonpay",
};

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "Asia/Kathmandu",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export type OrderEmailKind = "placed" | "paid";

export function buildAdminOrderEmail(order: Order, adminUrl: string, kind: OrderEmailKind = "paid") {
  const paid = kind === "paid";
  const subject = `New Order Received! Order #${order.orderId} (${paid ? "payment submitted" : "awaiting payment"})`;
  const date = formatDate(order.createdAt);
  const method = order.paymentMethod ? METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod : "—";
  const total = formatNPR(order.total);

  const text = [
    subject,
    ``,
    `Customer Name: ${order.customer.name}`,
    `${paid ? "Total Paid" : "Order Total (not paid yet)"}: ${paid ? `${total} (via ${method})` : total}`,
    `Order ID: ${order.orderId}`,
    `Date: ${date}`,
    ``,
    `Please open the admin panel to review the payment screenshot, full product details and shipping info,`,
    `verify the payment and update the order status:`,
    adminUrl,
  ].join("\n");

  const row = (label: string, value: string) =>
    `<tr><td style="padding:8px 0;color:#737373;font-size:14px;width:140px">${label}</td><td style="padding:8px 0;color:#171717;font-size:14px;font-weight:600">${esc(value)}</td></tr>`;

  const html = `<!doctype html><html><body style="margin:0;background:#fdf6f9;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;padding:28px">
<tr><td>
<p style="margin:0;color:#d31b70;font-size:13px;font-weight:700;letter-spacing:.05em;text-transform:uppercase">DollNepal</p>
<h1 style="margin:6px 0 4px;font-size:22px;color:#171717">New Order Received! Order #${esc(order.orderId)}</h1>
<p style="margin:0 0 16px;color:#525252;font-size:14px">${paid ? "A customer has just paid and submitted their payment proof." : "A customer has just placed an order. Payment has not been submitted yet."}</p>
<table role="presentation" width="100%" style="border-top:1px solid #eee;border-bottom:1px solid #eee">
${row("Customer Name", order.customer.name)}
${row(paid ? "Total Paid" : "Order Total", paid ? `${total} (via ${method})` : `${total} - not paid yet`)}
${row("Order ID", order.orderId)}
${row("Date", date)}
</table>
<p style="margin:16px 0;color:#525252;font-size:14px;line-height:1.5">Open the admin panel to check the payment screenshot, view full product details and shipping info, verify the payment and manage the order status.</p>
<a href="${esc(adminUrl)}" style="display:inline-block;background:#d31b70;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 24px;border-radius:999px">Open Admin Dashboard</a>
<p style="margin:16px 0 0;color:#a3a3a3;font-size:12px">Or paste this link in your browser: ${esc(adminUrl)}</p>
</td></tr></table></td></tr></table></body></html>`;

  return { subject, text, html };
}

/** Emails the admin that a new paid order needs attention. Never throws. */
export async function sendAdminNewOrderEmail(order: Order, kind: OrderEmailKind = "paid"): Promise<void> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const to = (process.env.ADMIN_NOTIFY_EMAIL || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!apiKey || to.length === 0) {
      console.error("[email] skipped: RESEND_API_KEY or ADMIN_NOTIFY_EMAIL is not set in this environment");
      return;
    }

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
    const { subject, text, html } = buildAdminOrderEmail(order, `${siteUrl}/admin/orders`, kind);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "DollNepal <onboarding@resend.dev>",
        to,
        subject,
        text,
        html,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("[email] admin notification failed", res.status, await res.text().catch(() => ""));
  } catch (err) {
    console.error("[email] admin notification failed", err);
  }
}
