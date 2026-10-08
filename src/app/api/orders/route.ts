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

// In-memory store for instant multi-tab sync across Ambikapur network
let liveOrdersStore: LiveOrder[] = [
  {
    id: "ord-demo-1",
    orderNumber: "#AB-8102",
    customerName: "Aryan Gupta",
    customerPhone: "9876543210",
    deliveryArea: "Gandhi Chowk (1.2 km)",
    restaurantName: "The Royal Kitchen",
    items: [
      { name: "Special Chicken Dum Biryani", qty: 1, price: 320, isVeg: false },
      { name: "Paneer Tikka Butter Roll", qty: 1, price: 120, isVeg: true },
    ],
    itemTotal: 440,
    deliveryFee: 20,
    platformFee: 5,
    totalAmount: 465,
    paymentMethod: "COD",
    paymentStatus: "pending",
    status: "placed",
    riderName: null,
    createdAt: new Date().toISOString(),
    prepTimeMinutes: 20,
  },
];

export async function GET() {
  try {
    // Attempt fetching from Supabase if table permissions are granted
    const { data: dbOrders, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && dbOrders && dbOrders.length > 0) {
      // Map database schema to frontend LiveOrder format
      const formatted: LiveOrder[] = dbOrders.map((o) => ({
        id: o.id,
        orderNumber: o.order_number || `#AB-${o.id.slice(0, 4)}`,
        customerName: o.customer_name || "Ambikapur Customer",
        customerPhone: o.customer_phone || "9876543210",
        deliveryArea: o.delivery_address || "Ambikapur Center",
        restaurantName: o.restaurant_name || "The Royal Kitchen",
        items: o.items || [{ name: "Handi Special Biryani", qty: 1, price: o.total_amount || 320 }],
        itemTotal: Number(o.item_total || o.total_amount - 25),
        deliveryFee: Number(o.delivery_fee || 20),
        platformFee: Number(o.platform_fee || 5),
        totalAmount: Number(o.total_amount),
        paymentMethod: o.payment_method || "COD",
        paymentStatus: o.payment_status || "pending",
        status: o.status || "placed",
        riderName: o.rider_name || null,
        riderId: o.rider_id || null,
        createdAt: o.created_at,
        prepTimeMinutes: o.prep_time_minutes || 20,
      }));

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
      await supabase.from("orders").insert({
        order_number: orderNum,
        customer_name: newOrder.customerName,
        customer_phone: newOrder.customerPhone,
        delivery_address: newOrder.deliveryArea,
        restaurant_name: newOrder.restaurantName,
        item_total: newOrder.itemTotal,
        delivery_fee: newOrder.deliveryFee,
        platform_fee: newOrder.platformFee,
        total_amount: newOrder.totalAmount,
        payment_method: newOrder.paymentMethod,
        payment_status: newOrder.paymentStatus,
        status: "placed",
        prep_time_minutes: 20,
      });
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

    // Attempt updating in Supabase
    try {
      await supabase
        .from("orders")
        .update({
          ...(status ? { status } : {}),
          ...(riderName !== undefined ? { rider_name: riderName } : {}),
          updated_at: new Date().toISOString(),
        })
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
