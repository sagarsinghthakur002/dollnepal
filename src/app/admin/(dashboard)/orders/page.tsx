import OrdersManager from "@/components/admin/OrdersManager";
import { getAllOrders } from "@/lib/data/orders";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();
  return (
    <>
      <div className="mb-4 rounded-2xl bg-brand-cream-100 p-4 text-sm text-neutral-700 ring-1 ring-black/5">
        <p className="font-semibold text-neutral-900">New-order workflow</p>
        <ol className="mt-1 list-decimal space-y-0.5 pl-5">
          <li>You get a &quot;New Order Received!&quot; email when a customer pays.</li>
          <li>Open the order below: check the payment screenshot, items, and shipping info.</li>
          <li>Mark payment as Paid, assign a courier and tracking ID, then update the shipping status.</li>
        </ol>
      </div>
      <OrdersManager orders={orders} />
    </>
  );
}
