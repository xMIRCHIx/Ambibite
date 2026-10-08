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
}

// In-memory store fallback for multi-tab sync
let liveOrdersStore: LiveOrder[] = [];

export async function GET() {
  try {
    // Fetch real orders with their order items from Supabase
    const { data: dbOrders, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (!error && dbOrders && dbOrders.length > 0) {
      // Map database schema to frontend LiveOrder format
      const formatted: LiveOrder[] = dbOrders.map((o) => {
        // Map ready_for_pickup to ready for frontend consistency
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

        return {
          id: o.id,
          orderNumber: o.order_number || `#AB-${o.id.slice(0, 4)}`,
          customerName: o.customer_name || "Ambikapur Customer",
          customerPhone: o.customer_phone || "9876543210",
          deliveryArea: o.delivery_address || "Ambikapur Center",
          restaurantName: "The Royal Kitchen",
          items,
          itemTotal: Number(o.item_total || 0),
          deliveryFee: Number(o.delivery_fee || 20),
          platformFee: Number(o.platform_fee || 5),
          totalAmount: Number(o.total_amount || 0),
          paymentMethod: (o.payment_method as "COD" | "UPI") || "COD",
          paymentStatus: (o.payment_status as "pending" | "completed") || "pending",
          status: frontendStatus,
          riderName: o.rider_name || (frontendStatus === "picked_up" ? "Ramesh Kumar" : null),
          riderId: o.rider_id || null,
          createdAt: o.created_at,
          prepTimeMinutes: 20,
        };
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
    const orderNum = `#AB-${Math.floor(1000 + Math.random() * 9000)}`;
    const newId = `ord-${Date.now()}`;

    const newOrder: LiveOrder = {
      id: newId,
      orderNumber: orderNum,
      customerName: body.customerName || "Customer",
      customerPhone: body.customerPhone || "9876543210",
      deliveryArea: body.deliveryArea || "Gandhi Chowk, Ambikapur",
      restaurantName: body.restaurantName || "The Royal Kitchen",
      items: body.items || [],
      itemTotal: body.itemTotal || 0,
      deliveryFee: body.deliveryFee ?? 20,
      platformFee: body.platformFee ?? 5,
      totalAmount: body.totalAmount || 0,
      paymentMethod: body.paymentMethod || "COD",
      paymentStatus: body.paymentMethod === "UPI" ? "completed" : "pending",
      status: "placed", // Initial status: alerts Restaurant POS
      riderName: null,
      createdAt: new Date().toISOString(),
      prepTimeMinutes: 20,
    };

    // Prepend to memory store so it's instantly available to all portals
    liveOrdersStore = [newOrder, ...liveOrdersStore];

    // Attempt saving to Supabase Postgres as well
    try {
      const { data: dbCreated, error: dbErr } = await supabase.from("orders").insert({
        order_number: orderNum,
        restaurant_id: "11111111-1111-1111-1111-111111111111", // The Royal Kitchen default
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

        // Also save each item to order_items in Supabase
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
    const { orderId, status, riderName } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Missing orderId" }, { status: 400 });
    }

    // Update in memory store
    let updatedOrder: LiveOrder | null = null;
    liveOrdersStore = liveOrdersStore.map((o) => {
      if (o.id === orderId || o.orderNumber === orderId) {
        updatedOrder = {
          ...o,
          ...(status ? { status } : {}),
          ...(riderName !== undefined ? { riderName } : {}),
        };
        return updatedOrder;
      }
      return o;
    });

    // Map status for Supabase database enum constraint
    let dbStatus = status;
    if (status === "ready") {
      dbStatus = "ready_for_pickup";
    }

    // Attempt updating in Supabase
    try {
      const updatePayload: Record<string, any> = {};
      if (dbStatus) updatePayload.status = dbStatus;

      await supabase
        .from("orders")
        .update(updatePayload)
        .or(`id.eq.${orderId},order_number.eq.${orderId}`);
    } catch (e) {
      console.warn("Supabase patch notice:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
