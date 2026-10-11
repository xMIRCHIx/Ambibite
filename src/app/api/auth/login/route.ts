import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  AuthUser,
  KITCHEN_CREDENTIALS,
  RIDER_CREDENTIALS,
  ADMIN_CREDENTIALS,
  signSession,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role, username, password, phone, customerName } = body;

    let authenticatedUser: AuthUser | null = null;

    // 1. Restaurant Partner Login
    if (role === "partner") {
      const match = KITCHEN_CREDENTIALS.find(
        (k) =>
          (k.username.toLowerCase() === username?.trim().toLowerCase() ||
            k.email.toLowerCase() === username?.trim().toLowerCase() ||
            k.phone.replace(/\s+/g, "") === username?.trim().replace(/\s+/g, "")) &&
          k.password === password?.trim()
      );

      if (!match) {
        return NextResponse.json(
          { success: false, error: "Invalid kitchen username or password." },
          { status: 401 }
        );
      }

      authenticatedUser = {
        id: `partner-${match.username}`,
        role: "partner",
        name: match.restaurantName,
        phone: match.phone,
        email: match.email,
        restaurantId: match.restaurantId,
        restaurantName: match.restaurantName,
      };
    }

    // 2. Delivery Rider Login
    else if (role === "rider") {
      const match = RIDER_CREDENTIALS.find(
        (r) =>
          (r.username.toLowerCase() === username?.trim().toLowerCase() ||
            r.email.toLowerCase() === username?.trim().toLowerCase() ||
            r.phone.replace(/\s+/g, "") === username?.trim().replace(/\s+/g, "")) &&
          r.password === password?.trim()
      );

      if (!match) {
        return NextResponse.json(
          { success: false, error: "Invalid rider username or password." },
          { status: 401 }
        );
      }

      authenticatedUser = {
        id: match.id,
        role: "rider",
        name: match.name,
        phone: match.phone,
        email: match.email,
        vehicle: match.vehicle,
      };
    }

    // 3. Super Admin Login
    else if (role === "admin") {
      if (
        (ADMIN_CREDENTIALS.username === username?.trim().toLowerCase() ||
          ADMIN_CREDENTIALS.email === username?.trim().toLowerCase()) &&
        ADMIN_CREDENTIALS.password === password?.trim()
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

    // 4. Customer Login (Phone or Name)
    else if (role === "customer") {
      const name = customerName?.trim() || username?.trim() || "Ambikapur Customer";
      const userPhone = phone?.trim() || "+91 98261 44551";

      authenticatedUser = {
        id: `customer-${Date.now().toString(36)}`,
        role: "customer",
        name: name,
        phone: userPhone,
      };
    } else {
      return NextResponse.json({ success: false, error: "Invalid role specified." }, { status: 400 });
    }

    // Create cryptographically signed token
    const token = signSession(authenticatedUser);

    // Set secure HttpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
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
