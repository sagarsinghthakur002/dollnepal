import { formatNPR } from "./currency";
import type { Order } from "./types";

export const WHATSAPP_NUMBER = "9779761302887"; // +977-9761302887, digits only

export function buildGeneralWhatsAppLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildOrderWhatsAppLink(order: Order, orderUrl: string): string {
  const message = [
    `Hello DollNepal! Here is my order for verification.`,
    ``,
    `Order ID: ${order.orderId}`,
    `Name: ${order.customer.name}`,
    `Total: ${formatNPR(order.total)}`,
    `Order summary: ${orderUrl}`,
    ``,
    `I have made the payment — please verify and confirm. Thank you!`,
  ].join("\n");

  return buildGeneralWhatsAppLink(message);
}
