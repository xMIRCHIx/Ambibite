import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import {
  AuthUser,
  KITCHEN_CREDENTIALS,
  RIDER_CREDENTIALS,
  ADMIN_CREDENTIALS,
  signSession,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wkxqknaznpzvrylsnorl.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role, username, password, phone, customerName } = body;
    const cleanUser = username?.trim().toLowerCase();
    const cleanPass = password?.trim();

    let authenticatedUser: AuthUser | null = null;

    // 1. Restaurant Partner Login
    if (role === "partner") {
      // A. Check Seeded / Built-in Kitchens
      const match = KITCHEN_CREDENTIALS.find(
        (k) =>
          (k.username.toLowerCase() === cleanUser ||
            k.email.toLowerCase() === cleanUser ||
            k.phone.replace(/\s+/g, "") === cleanUser.replace(/\s+/g, "")) &&
          k.password === cleanPass
      );

      if (match) {
        authenticatedUser = {
          id: `partner-${match.username}`,
          role: "partner",
          name: match.restaurantName,
          phone: match.phone,
          email: match.email,
          restaurantId: match.restaurantId,
          restaurantName: match.restaurantName,
        };
      } else {
        // B. Check Dynamic Supabase Registered Partners
        const { data: supaAuth, error: supaErr } = await supabase.auth.signInWithPassword({
          email: cleanUser,
          password: cleanPass,
        });

        if (supaErr || !supaAuth.user) {
          return NextResponse.json(
            { success: false, error: "Invalid kitchen email or password." },
            { status: 401 }
          );
        }

        const meta = supaAuth.user.user_metadata || {};
        const restId = meta.restaurantId;

        // Verify KYC approval status in restaurants table
        if (restId) {
          const { data: restRecord } = await supabase
            .from("restaurants")
            .select("is_blocked, is_open, name")
            .eq("id", restId)
            .maybeSingle();

          if (restRecord?.is_blocked) {
            return NextResponse.json(
              {
                success: false,
                status: "pending_verification",
                error:
                  "Your kitchen application is currently under verification by Ambikapur Admin. Once verified, you will be able to log in and receive orders.",
              },
              { status: 403 }
            );
          }

          authenticatedUser = {
            id: supaAuth.user.id,
            role: "partner",
            name: restRecord?.name || meta.restaurantName || "Partner Kitchen",
            email: supaAuth.user.email,
            phone: meta.phone,
            restaurantId: restId,
            restaurantName: restRecord?.name || meta.restaurantName,
          };
        } else {
          return NextResponse.json(
            { success: false, error: "Kitchen profile not bound to this account." },
            { status: 400 }
          );
        }
      }
    }

    // 2. Delivery Rider Login
    else if (role === "rider") {
      // A. Check Seeded Rider
      const match = RIDER_CREDENTIALS.find(
        (r) =>
          (r.username.toLowerCase() === cleanUser ||
            r.email.toLowerCase() === cleanUser ||
            r.phone.replace(/\s+/g, "") === cleanUser.replace(/\s+/g, "")) &&
          r.password === cleanPass
      );

      if (match) {
        authenticatedUser = {
          id: match.id,
          role: "rider",
          name: match.name,
          phone: match.phone,
          email: match.email,
          vehicle: match.vehicle,
        };
      } else {
        // B. Check Dynamic Supabase Rider
        const { data: supaAuth, error: supaErr } = await supabase.auth.signInWithPassword({
          email: cleanUser,
          password: cleanPass,
        });

        if (supaErr || !supaAuth.user) {
          return NextResponse.json(
            { success: false, error: "Invalid rider email or password." },
            { status: 401 }
          );
        }

        const meta = supaAuth.user.user_metadata || {};
        if (meta.status === "pending_verification") {
          return NextResponse.json(
            {
              success: false,
              status: "pending_verification",
              error:
                "Your Rider KYC documents are under review by Ambikapur Fleet Admin. We will activate your account shortly.",
            },
            { status: 403 }
          );
        }

        authenticatedUser = {
          id: supaAuth.user.id,
          role: "rider",
          name: meta.full_name || "Ambikapur Rider",
          phone: meta.phone,
          email: supaAuth.user.email,
          vehicle: meta.vehicle || "Hero Splendor (CG 15)",
        };
      }
    }

    // 3. Super Admin Login
    else if (role === "admin") {
      if (
        (ADMIN_CREDENTIALS.username === cleanUser ||
          ADMIN_CREDENTIALS.email === cleanUser) &&
        ADMIN_CREDENTIALS.password === cleanPass
      ) {
        authenticatedUser = {
          id: ADMIN_CREDENTIALS.id,
          role: "admin",
          name: ADMIN_CREDENTIALS.name,
          email: ADMIN_CREDENTIALS.email,
        };
      } else {
        return NextResponse.json(
          { success: false, error: "Invalid admin credentials." },
          { status: 401 }
        );
      }
    }

    // 4. Customer Login
    else if (role === "customer") {
      if (cleanPass) {
        // Email + Password Login
        const { data: supaAuth, error: supaErr } = await supabase.auth.signInWithPassword({
          email: cleanUser,
          password: cleanPass,
        });

        if (supaErr || !supaAuth.user) {
          return NextResponse.json(
            { success: false, error: "Invalid customer email or password. You can also sign up with OTP." },
            { status: 401 }
          );
        }

        const meta = supaAuth.user.user_metadata || {};
        authenticatedUser = {
          id: supaAuth.user.id,
          role: "customer",
          name: meta.full_name || "Ambikapur Customer",
          email: supaAuth.user.email,
          phone: meta.phone,
        };
      } else {
        // Quick Phone Login fallback
        const name = customerName?.trim() || username?.trim() || "Ambikapur Customer";
        const userPhone = phone?.trim() || "+91 98261 44551";

        authenticatedUser = {
          id: `customer-${Date.now().toString(36)}`,
          role: "customer",
          name,
          phone: userPhone,
        };
      }
    } else {
      return NextResponse.json({ success: false, error: "Invalid role specified." }, { status: 400 });
    }

    // Create cryptographically signed session token
    const token = signSession(authenticatedUser);

    // Set secure HttpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({
      success: true,
      user: authenticatedUser,
      message: `Welcome back, ${authenticatedUser.name}!`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
