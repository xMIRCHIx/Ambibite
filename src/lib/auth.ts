import crypto from "crypto";
import { cookies } from "next/headers";

export interface AuthUser {
  id: string;
  role: "partner" | "rider" | "customer" | "admin";
  name: string;
  phone?: string;
  email?: string;
  restaurantId?: string; // Strictly bound for partner
  restaurantName?: string;
  vehicle?: string;
}

const AUTH_SECRET = process.env.AUTH_SECRET || "ambibite-ambikapur-secret-key-2026-hyperlocal";
export const SESSION_COOKIE_NAME = "ambibite_auth_session";

// 1. Built-in Credentials for Existing Ambikapur Kitchens
export const KITCHEN_CREDENTIALS = [
  {
    restaurantId: "11111111-1111-1111-1111-111111111111",
    restaurantName: "The Royal Kitchen",
    username: "royal",
    email: "royal@ambibite.com",
    password: "royal123",
    phone: "+91 98261 44551",
    area: "Gandhi Chowk",
  },
  {
    restaurantId: "22222222-2222-2222-2222-222222222222",
    restaurantName: "Burger Hub & Cafe",
    username: "burger",
    email: "burger@ambibite.com",
    password: "burger123",
    phone: "+91 70002 99120",
    area: "Ghadi Chowk",
  },
  {
    restaurantId: "33333333-3333-3333-3333-333333333333",
    restaurantName: "Ambikapur Dosa Plaza",
    username: "dosa",
    email: "dosa@ambibite.com",
    password: "dosa123",
    phone: "+91 94252 11029",
    area: "Kedarpur",
  },
  {
    restaurantId: "44444444-4444-4444-4444-444444444444",
    restaurantName: "Kolkata Kathi Rolls Corner",
    username: "rolls",
    email: "rolls@ambibite.com",
    password: "rolls123",
    phone: "+91 99814 77218",
    area: "Ring Road East",
  },
];

// 2. Built-in Rider Credentials
export const RIDER_CREDENTIALS = [
  {
    id: "rider-1",
    username: "rider",
    email: "rider@ambibite.com",
    password: "rider123",
    name: "Rahul Sharma",
    phone: "+91 98261 99001",
    vehicle: "Hero Splendor Plus (CG 15 AB 1002)",
  },
  {
    id: "rider-2",
    username: "amit",
    email: "amit@ambibite.com",
    password: "rider123",
    name: "Amit Toppo",
    phone: "+91 91310 88204",
    vehicle: "Bajaj Pulsar 125 (CG 15 K 4410)",
  },
];

// 3. Admin Credentials
export const ADMIN_CREDENTIALS = {
  id: "admin-master",
  username: "admin",
  email: "admin@ambibite.com",
  password: "admin123",
  name: "Master Admin Ambikapur",
};

// Cryptographic HMAC token signing & verification
export function signSession(user: AuthUser): string {
  const payload = Buffer.from(JSON.stringify(user)).toString("base64url");
  const signature = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySession(token: string | undefined | null): AuthUser | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  const expectedSig = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("base64url");
  if (signature !== expectedSig) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
  } catch {
    return null;
  }
}

// Server-side session getter
export async function getSessionUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    return verifySession(token);
  } catch {
    return null;
  }
}
