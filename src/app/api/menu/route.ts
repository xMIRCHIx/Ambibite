import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wkxqknaznpzvrylsnorl.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");

    let query = supabase
      .from("menu_items")
      .select("*, restaurants(name, area)")
      .order("created_at", { ascending: false });

    if (restaurantId) {
      query = query.eq("restaurant_id", restaurantId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      menuItems: data || [],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || !body.price) {
      return NextResponse.json({ success: false, error: "Name and price are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        restaurant_id: body.restaurantId || "11111111-1111-1111-1111-111111111111",
        name: body.name,
        category: body.category || "Main Course",
        price: Number(body.price),
        original_price: body.originalPrice ? Number(body.originalPrice) : null,
        is_veg: body.isVeg ?? true,
        is_bestseller: body.isBestseller ?? false,
        in_stock: true,
        description: body.description || "",
        image_url: body.imageUrl || "https://pub-6173aeb8009d4efd9966052cb0ea9b71.r2.dev/food/special_chicken_dum_biryani.jpg",
      })
      .select();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Menu item added successfully!",
      menuItem: data?.[0],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, in_stock, price } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing menu item id" }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (in_stock !== undefined) updates.in_stock = in_stock;
    if (price !== undefined) updates.price = price;

    const { data, error } = await supabase
      .from("menu_items")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Menu item updated successfully",
      menuItem: data?.[0],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
