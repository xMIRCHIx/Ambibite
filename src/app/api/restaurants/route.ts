import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wkxqknaznpzvrylsnorl.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      restaurants: data || [],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const slug = (body.name || "new-restaurant")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + "-" + Math.floor(100 + Math.random() * 900);

    const { data, error } = await supabase
      .from("restaurants")
      .insert({
        name: body.name,
        slug,
        cuisine: body.cuisine || "Multi-Cuisine, Fast Food",
        phone: body.phone || "+91 98261 44551",
        area: body.area || "Ambikapur",
        address: body.address || `${body.area || "Main Road"}, Ambikapur`,
        is_open: true,
        commission_percent: body.commissionPercent || 20.0,
        delivery_time_text: body.deliveryTime || "25-30 min",
        rating: body.rating || 4.5,
        banner_url: body.bannerUrl || "https://pub-6173aeb8009d4efd9966052cb0ea9b71.r2.dev/restaurants/the_royal_kitchen.jpg",
      })
      .select();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Restaurant added successfully!",
      restaurant: data?.[0],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, is_open, is_blocked } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing restaurant id" }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (is_open !== undefined) updates.is_open = is_open;
    if (is_blocked !== undefined) updates.is_blocked = is_blocked;

    const { data, error } = await supabase
      .from("restaurants")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Restaurant updated successfully",
      restaurant: data?.[0],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
