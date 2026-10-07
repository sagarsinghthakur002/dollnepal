import type { Order, ShippingStatus, TrackingStep } from "./types";

const STEP_ORDER: ShippingStatus[] = [
  "processing",
  "dispatched",
  "in_transit",
  "out_for_delivery",
  "delivered",
];

const STEP_LABELS: Record<ShippingStatus, { label: string; description: string }> = {
  processing: {
    label: "Processing",
    description: "Your order has been received and is being prepared.",
  },
  dispatched: {
    label: "Dispatched",
    description: "Your package has left our Kathmandu facility.",
  },
  in_transit: {
    label: "In Transit via NCM",
    description: "On its way with Nepal Can Move to your city.",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    description: "A rider is on the way with your package today.",
  },
  delivered: {
    label: "Delivered",
    description: "Delivered — we hope you loved it!",
  },
  cancelled: {
    label: "Cancelled",
    description: "This order was cancelled.",
  },
};

/**
 * Modular NCM (Nepal Can Move) tracking integration.
 *
 * When NCM_API_KEY / NCM_VENDOR_ID / NCM_API_URL are configured, this calls
 * the real NCM order-status endpoint using the order's NCM tracking id
 * (an AWB/order number the admin enters when marking an order "Dispatched").
 * Until then, it falls back to a deterministic mock built from our own
 * `shippingStatus` field, which the admin panel controls — see
 * `getTrackingSteps` below.
 */
async function fetchNcmStatus(ncmTrackingId: string): Promise<ShippingStatus | null> {
  const { NCM_API_KEY, NCM_VENDOR_ID, NCM_API_URL } = process.env;
  if (!NCM_API_KEY || !NCM_VENDOR_ID || !NCM_API_URL) return null;

  try {
    const res = await fetch(
      `${NCM_API_URL}/order/status?id=${encodeURIComponent(ncmTrackingId)}`,
      {
        headers: {
          Authorization: `Bearer ${NCM_API_KEY}`,
          "X-Vendor-Id": NCM_VENDOR_ID,
        },
        cache: "no-store",
      }
    );
    if (!res.ok) return null;

    const data = (await res.json()) as { status?: string };
    // Map NCM's own status vocabulary onto ours — adjust once real API docs
    // and response shape are available.
    const map: Record<string, ShippingStatus> = {
      pickup_pending: "processing",
      picked_up: "dispatched",
      in_transit: "in_transit",
      out_for_delivery: "out_for_delivery",
      delivered: "delivered",
    };
    return (data.status && map[data.status]) || null;
  } catch {
    return null;
  }
}

export async function getTrackingSteps(order: Order): Promise<{
  steps: TrackingStep[];
  isLive: boolean;
}> {
  let effectiveStatus: ShippingStatus = order.shippingStatus;
  let isLive = false;

  // Live API lookup only applies to NCM shipments (legacy orders without a courier count as NCM).
  if (order.ncmTrackingId && (order.courier === "ncm" || order.courier === null)) {
    const liveStatus = await fetchNcmStatus(order.ncmTrackingId);
    if (liveStatus) {
      effectiveStatus = liveStatus;
      isLive = true;
    }
  }

  if (effectiveStatus === "cancelled") {
    return {
      isLive,
      steps: [
        {
          key: "cancelled",
          ...STEP_LABELS.cancelled,
          done: true,
          current: true,
        },
      ],
    };
  }

  const courierName = order.courier === "upaya" ? "Upaya" : "NCM";
  const courierFull = order.courier === "upaya" ? "Upaya Services" : "Nepal Can Move";
  const currentIndex = STEP_ORDER.indexOf(effectiveStatus);

  return {
    isLive,
    steps: STEP_ORDER.map((key, index) => ({
      key,
      ...STEP_LABELS[key],
      ...(key === "in_transit"
        ? { label: `In Transit via ${courierName}`, description: `On its way with ${courierFull} to your city.` }
        : {}),
      done: index <= currentIndex,
      current: index === currentIndex,
    })),
  };
}
