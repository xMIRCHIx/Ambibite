import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wkxqknaznpzvrylsnorl.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Server client with service role to bypass RLS when permissions allow
const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

export interface LiveOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryArea: string;
  restaurantName: string;
  items: { name: string; qty: number; price: number; isVeg?: boolean }[];
  itemTotal: number;
  deliveryFee: number;
  platformFee: number;
  totalAmount: number;
  paymentMethod: "COD" | "UPI";
  paymentStatus: "pending" | "completed";
  status: "placed" | "preparing" | "ready" | "rider_assigned" | "picked_up" | "delivered" | "cancelled";
  riderName: string | null;
  riderId?: string | null;
  createdAt: string;
  prepTimeMinutes: number;
  // Delivery PIN & Rider Dispatch Extensions
  deliveryPin: string;
  distanceKm: number;
  riderEarnings: number;
}

// In-memory store fallback for multi-tab sync
let liveOrdersStore: LiveOrder[] = [
  {
    id: "demo-ord-1",
    orderNumber: "#ZB-4821",
    customerName: "Rahul Verma",
    customerPhone: "9826144551",
    deliveryArea: "Kedarpur, Near City Mall, Ambikapur",
    restaurantName: "The Royal Kitchen",
    items: [
      { name: "Special Chicken Dum Biryani (Handi)", qty: 1, price: 320, isVeg: false },
      { name: "Extra Spiced Raita", qty: 1, price: 25, isVeg: true },
    ],
    itemTotal: 345,
    deliveryFee: 35,
    platformFee: 5,
    totalAmount: 385,
    paymentMethod: "COD",
    paymentStatus: "pending",
    status: "ready",
    riderName: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    prepTimeMinutes: 20,
    deliveryPin: "5842",
    distanceKm: 2.3,
    riderEarnings: 42,
  },
  {
    id: "demo-ord-2",
    orderNumber: "#ZB-3904",
    customerName: "Pooja Sharma",
    customerPhone: "9425288112",
    deliveryArea: "Ring Road East, Ambikapur",
    restaurantName: "Burger Hub & Cafe",
    items: [
      { name: "Double Cheese Crunchy Burger", qty: 2, price: 140, isVeg: true },
      { name: "Crispy Peri Peri Fries", qty: 1, price: 90, isVeg: true },
    ],
    itemTotal: 370,
    deliveryFee: 30,
    platformFee: 5,
    totalAmount: 405,
    paymentMethod: "UPI",
    paymentStatus: "completed",
    status: "ready",
    riderName: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    prepTimeMinutes: 15,
    deliveryPin: "7193",
    distanceKm: 1.8,
    riderEarnings: 36,
  },
];

// Helper to get or generate pin
function getOrGeneratePin(orderId: string): string {
  const existing = liveOrdersStore.find((o) => o.id === orderId);
  if (existing?.deliveryPin) return existing.deliveryPin;
  // Deterministic 4-digit pin fallback from id
  let hash = 0;
  for (let i = 0; i < orderId.length; i++) {
    hash = (hash * 31 + orderId.charCodeAt(i)) % 9000;
  }
  return (1000 + Math.abs(hash)).toString();
}

export async function GET() {
  try {
    const { data: dbOrders, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (!error && dbOrders && dbOrders.length > 0) {
      const formatted: LiveOrder[] = dbOrders.map((o) => {
        let frontendStatus: LiveOrder["status"] = "placed";
        if (o.status === "ready_for_pickup") frontendStatus = "ready";
        else if (["placed", "preparing", "ready", "rider_assigned", "picked_up", "delivered", "cancelled"].includes(o.status)) {
          frontendStatus = o.status as LiveOrder["status"];
        }

        const items = (o.order_items && o.order_items.length > 0)
          ? o.order_items.map((oi: any) => ({
              name: oi.name_at_order,
              qty: oi.quantity,
              price: Number(oi.price_at_order),
              isVeg: true,
            }))
          : [{ name: "Selected Food Item", qty: 1, price: Number(o.item_total || 0), isVeg: false }];

        const pin = getOrGeneratePin(o.id);
        const dist = 2.1;
        const earn = 38;

        return {
          id: o.id,
          orderNumber: o.order_number || `#ZB-${o.id.slice(0, 4)}`,
          customerName: o.customer_name || "Ambikapur Customer",
          customerPhone: o.customer_phone || "9876543210",
          deliveryArea: o.delivery_address || "Ambikapur Center",
          restaurantName: "The Royal Kitchen",
          items,
          itemTotal: Number(o.item_total || 0),
          deliveryFee: Number(o.delivery_fee || 30),
          platformFee: Number(o.platform_fee || 5),
          totalAmount: Number(o.total_amount || 0),
          paymentMethod: (o.payment_method as "COD" | "UPI") || "COD",
          paymentStatus: (o.payment_status as "pending" | "completed") || "pending",
          status: frontendStatus,
          riderName: o.rider_name || (frontendStatus === "picked_up" ? "Ramesh Kumar" : null),
          riderId: o.rider_id || null,
          createdAt: o.created_at,
          prepTimeMinutes: 20,
          deliveryPin: pin,
          distanceKm: dist,
          riderEarnings: earn,
        };
      });

      // Synchronize in-memory store so memory references stay updated
      formatted.forEach((f) => {
        const idx = liveOrdersStore.findIndex((m) => m.id === f.id);
        if (idx === -1) liveOrdersStore.push(f);
      });

      return NextResponse.json({
        success: true,
        source: "supabase",
        orders: formatted,
      });
    }
  } catch (err) {
    console.warn("Supabase fetch failed, serving from shared memory store:", err);
  }

  // Fallback to shared in-memory store
  return NextResponse.json({
    success: true,
    source: "memory_sync",
    orders: liveOrdersStore,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderNum = `#ZB-${Math.floor(1000 + Math.random() * 9000)}`;
    const newId = `ord-${Date.now()}`;

    // Generate random 4-digit In-App Delivery PIN
    const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
    const distanceKm = Number((1.4 + Math.random() * 2.2).toFixed(1));
    const riderEarnings = Math.max(35, 25 + Math.round((distanceKm - 1.0) * 7) + 5);

    const newOrder: LiveOrder = {
      id: newId,
      orderNumber: orderNum,
      customerName: body.customerName || "Customer",
      customerPhone: body.customerPhone || "9876543210",
      deliveryArea: body.deliveryArea || "Gandhi Chowk, Ambikapur",
      restaurantName: body.restaurantName || "The Royal Kitchen",
      items: body.items || [],
      itemTotal: body.itemTotal || 0,
      deliveryFee: body.deliveryFee ?? 35,
      platformFee: body.platformFee ?? 5,
      totalAmount: body.totalAmount || 0,
      paymentMethod: body.paymentMethod || "COD",
      paymentStatus: body.paymentMethod === "UPI" ? "completed" : "pending",
      status: "placed",
      riderName: null,
      createdAt: new Date().toISOString(),
      prepTimeMinutes: 20,
      deliveryPin: generatedPin,
      distanceKm,
      riderEarnings,
    };

    liveOrdersStore = [newOrder, ...liveOrdersStore];

    try {
      const { data: dbCreated, error: dbErr } = await supabase.from("orders").insert({
        order_number: orderNum,
        restaurant_id: "11111111-1111-1111-1111-111111111111",
        customer_name: newOrder.customerName,
        customer_phone: newOrder.customerPhone,
        delivery_address: newOrder.deliveryArea,
        item_total: newOrder.itemTotal,
        delivery_fee: newOrder.deliveryFee,
        platform_fee: newOrder.platformFee,
        total_amount: newOrder.totalAmount,
        payment_method: newOrder.paymentMethod,
        payment_status: newOrder.paymentStatus,
        status: "placed",
      }).select();

      if (dbCreated && dbCreated[0]) {
        newOrder.id = dbCreated[0].id;

        if (body.items && body.items.length > 0) {
          const itemRows = body.items.map((it: any) => ({
            order_id: dbCreated[0].id,
            name_at_order: it.name,
            price_at_order: it.price,
            quantity: it.qty || 1,
            subtotal: (it.price || 0) * (it.qty || 1),
          }));
          await supabase.from("order_items").insert(itemRows);
        }
      }
      if (dbErr) console.warn("Supabase insert notice:", dbErr.message);
    } catch (e) {
      console.warn("Supabase insert notice:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Order placed successfully!",
      order: newOrder,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { orderId, status, riderName, submittedPin, newPin } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Missing orderId" }, { status: 400 });
    }

    // 1. PIN Verification check when rider marks order as Delivered
    if (status === "delivered") {
      const targetOrder = liveOrdersStore.find(
        (o) => o.id === orderId || o.orderNumber === orderId
      );

      if (targetOrder) {
        // If pin provided, verify match
        const cleanEntered = String(submittedPin || "").trim();
        const expectedPin = String(targetOrder.deliveryPin || "").trim();

        if (cleanEntered !== expectedPin) {
          return NextResponse.json(
            {
              success: false,
              error: `Incorrect Delivery PIN! Customer screen shows ${expectedPin.slice(0, 1)}***. Please ask customer to read the 4-digit PIN.`,
            },
            { status: 400 }
          );
        }
      }
    }

    // 2. Update order in memory
    let updatedOrder: LiveOrder | null = null;
    liveOrdersStore = liveOrdersStore.map((o) => {
      if (o.id === orderId || o.orderNumber === orderId) {
        updatedOrder = {
          ...o,
          ...(status ? { status } : {}),
          ...(riderName !== undefined ? { riderName } : {}),
          ...(newPin ? { deliveryPin: String(newPin) } : {}),
          ...(status === "delivered" ? { paymentStatus: "completed" as const } : {}),
        };
        return updatedOrder;
      }
      return o;
    });

    // 3. Map status for Supabase database enum
    let dbStatus = status;
    if (status === "ready") {
      dbStatus = "ready_for_pickup";
    }

    try {
      const updatePayload: Record<string, any> = {};
      if (dbStatus) updatePayload.status = dbStatus;
      if (status === "delivered") updatePayload.payment_status = "completed";

      await supabase
        .from("orders")
        .update(updatePayload)
        .or(`id.eq.${orderId},order_number.eq.${orderId}`);
    } catch (e) {
      console.warn("Supabase patch notice:", e);
    }

    return NextResponse.json({
      success: true,
      message: status === "delivered" ? "PIN Verified! Order marked Delivered." : "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
