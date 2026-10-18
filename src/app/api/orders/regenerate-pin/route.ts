import { NextResponse } from "next/server";
import { LiveOrder } from "../route";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Missing orderId" }, { status: 400 });
    }

    // Generate fresh random 4-digit PIN
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();

    // Call internal patch to update order
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/orders`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, newPin }),
    });

    const data = await res.json();

    return NextResponse.json({
      success: true,
      newPin,
      message: "Delivery PIN regenerated successfully! Share this new code with the rider.",
      order: data.order,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
