import OrdersManager from "@/components/admin/OrdersManager";
import { getAllOrders } from "@/lib/data/orders";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();
  return <OrdersManager orders={orders} />;
}
