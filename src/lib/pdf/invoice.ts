import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatNPR } from "@/lib/currency";
import type { Order } from "@/lib/types";

export function generateInvoicePdf(order: Order): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  doc.setFontSize(20);
  doc.setTextColor(211, 27, 112); // brand pink-600
  doc.text("DollNepal", 40, 50);

  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text("Cute Gifts • Dolls • Love", 40, 66);
  doc.text("dollnepal.np@gmail.com  ·  +977-9761302887", 40, 80);

  doc.setFontSize(14);
  doc.setTextColor(20, 20, 20);
  doc.text("Order Invoice", 40, 112);

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const infoLines = [
    `Order ID: ${order.orderId}`,
    `Date: ${new Date(order.createdAt).toLocaleDateString("en-GB")}`,
    `Customer: ${order.customer.name}`,
    `Phone: ${order.customer.phone}`,
    `Delivery Location: ${order.customer.location}`,
  ];
  infoLines.forEach((line, i) => doc.text(line, 40, 134 + i * 16));

  autoTable(doc, {
    startY: 134 + infoLines.length * 16 + 16,
    head: [["Item", "Qty", "Rate", "Amount"]],
    body: order.items.map((item) => [
      item.name,
      String(item.qty),
      formatNPR(item.price),
      formatNPR(item.lineTotal),
    ]),
    headStyles: { fillColor: [239, 47, 135] },
    styles: { fontSize: 10, cellPadding: 8 },
    columnStyles: { 1: { halign: "center" }, 2: { halign: "right" }, 3: { halign: "right" } },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- jspdf-autotable augments the doc instance at runtime
  const finalY = (doc as any).lastAutoTable?.finalY ?? 300;

  doc.setFontSize(12);
  doc.setTextColor(20, 20, 20);
  doc.text(`Total Payable: ${formatNPR(order.total)}`, 40, finalY + 30);

  doc.setFontSize(9);
  doc.setTextColor(130, 130, 130);
  doc.text(
    "Thank you for shopping with DollNepal! This invoice confirms your order details for payment verification.",
    40,
    finalY + 60,
    { maxWidth: 500 }
  );

  doc.save(`DollNepal-Invoice-${order.orderId}.pdf`);
}
