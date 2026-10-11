"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChefHat,
  Bike,
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  Sparkles,
  Store,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Phone,
} from "lucide-react";

type RoleType = "partner" | "rider" | "admin" | "customer";

export default function LoginPage() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<RoleType>("partner");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [customerPhone, setCustomerPhone] = useState("+91 98261 44551");
  const [customerName, setCustomerName] = useState("Ambikapur Foodie");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Check if already logged in
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          if (data.user.role === "partner") router.push("/partner");
          else if (data.user.role === "rider") router.push("/rider");
          else if (data.user.role === "admin") router.push("/admin");
        }
      })
      .catch(() => {});
  }, [router]);

  // Set default demo inputs when role tab changes
  useEffect(() => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (activeRole === "partner") {
      setUsername("royal");
      setPassword("royal123");
    } else if (activeRole === "rider") {
      setUsername("rider");
      setPassword("rider123");
    } else if (activeRole === "admin") {
      setUsername("admin");
      setPassword("admin123");
    }
  }, [activeRole]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: activeRole,
          username,
          password,
          phone: customerPhone,
          customerName,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Welcome, ${data.user.name}! Redirecting...`);
        setTimeout(() => {
          if (activeRole === "partner") router.push("/partner");
          else if (activeRole === "rider") router.push("/rider");
          else if (activeRole === "admin") router.push("/admin");
          else router.push("/");
        }, 800);
      } else {
        setErrorMsg(data.error || "Login failed. Please check credentials.");
      }
    } catch (err: any) {
      setErrorMsg("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickLoginKitchen = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    // Submit with these credentials
    setLoading(true);
    setErrorMsg(null);
    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "partner", username: user, password: pass }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setSuccessMsg(`Logged in to ${data.user.restaurantName}! Redirecting...`);
          setTimeout(() => router.push("/partner"), 600);
        } else {
          setErrorMsg(data.error || "Failed");
          setLoading(false);
        }
      })
      .catch((e) => {
        setErrorMsg(e.message);
        setLoading(false);
      });
  };

  const quickLoginRider = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setLoading(true);
    setErrorMsg(null);
    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "rider", username: user, password: pass }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setSuccessMsg(`Logged in as ${data.user.name}! Redirecting...`);
          setTimeout(() => router.push("/rider"), 600);
        } else {
          setErrorMsg(data.error || "Failed");
          setLoading(false);
        }
      })
      .catch((e) => {
        setErrorMsg(e.message);
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top back to home */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between z-10">
        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition font-bold"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Food Menu</span>
        </Link>
        <span className="text-[11px] font-black uppercase text-orange-400 tracking-wider bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full">
          Ambikapur Auth v2.0
        </span>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 mx-auto flex items-center justify-center text-white shadow-xl shadow-orange-600/30">
            <ChefHat className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">AmbiBite Portal Login</h1>
            <p className="text-xs text-slate-400 mt-1">
              Secure, role-isolated authentication for Ambikapur City
            </p>
          </div>
        </div>

        {/* Role Switcher Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveRole("partner")}
            className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
              activeRole === "partner"
                ? "bg-orange-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span className="text-[10px]">Kitchen</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRole("rider")}
            className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
              activeRole === "rider"
                ? "bg-orange-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Bike className="w-4 h-4" />
            <span className="text-[10px]">Rider</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRole("admin")}
            className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
              activeRole === "admin"
                ? "bg-orange-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px]">Admin</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRole("customer")}
            className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
              activeRole === "customer"
                ? "bg-orange-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <User className="w-4 h-4" />
            <span className="text-[10px]">User</span>
          </button>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2 text-rose-400 text-xs font-bold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2 text-emerald-400 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {activeRole !== "customer" ? (
            <>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  {activeRole === "partner"
                    ? "Kitchen Username / Email / Phone"
                    : activeRole === "rider"
                    ? "Rider Username / Phone"
                    : "Admin Username"}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. royal or phone number"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Your Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Mobile Phone (Ambikapur)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98261 44551"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-3 rounded-2xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>
                  {activeRole === "partner"
                    ? "Enter Kitchen POS"
                    : activeRole === "rider"
                    ? "Enter Rider Dashboard"
                    : activeRole === "admin"
                    ? "Access Master Admin"
                    : "Login & Continue"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo 1-Click Login Cards for Kitchens */}
        {activeRole === "partner" && (
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span className="flex items-center gap-1 text-orange-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Click Kitchen Login (Demo Accounts):</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => quickLoginKitchen("royal", "royal123")}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl p-2.5 text-left transition cursor-pointer"
              >
                <span className="font-black text-white block truncate">The Royal Kitchen</span>
                <span className="text-[10px] text-slate-500">royal / royal123</span>
              </button>

              <button
                type="button"
                onClick={() => quickLoginKitchen("burger", "burger123")}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl p-2.5 text-left transition cursor-pointer"
              >
                <span className="font-black text-white block truncate">Burger Hub & Cafe</span>
                <span className="text-[10px] text-slate-500">burger / burger123</span>
              </button>

              <button
                type="button"
                onClick={() => quickLoginKitchen("dosa", "dosa123")}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl p-2.5 text-left transition cursor-pointer"
              >
                <span className="font-black text-white block truncate">Dosa Plaza</span>
                <span className="text-[10px] text-slate-500">dosa / dosa123</span>
              </button>

              <button
                type="button"
                onClick={() => quickLoginKitchen("rolls", "rolls123")}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl p-2.5 text-left transition cursor-pointer"
              >
                <span className="font-black text-white block truncate">Kolkata Rolls</span>
                <span className="text-[10px] text-slate-500">rolls / rolls123</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Demo 1-Click for Riders */}
        {activeRole === "rider" && (
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <span className="text-[11px] font-bold text-orange-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Rider Login:</span>
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => quickLoginRider("rider", "rider123")}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl p-2.5 text-left transition cursor-pointer"
              >
                <span className="font-black text-white block truncate">Rahul Sharma</span>
                <span className="text-[10px] text-slate-500">rider / rider123</span>
              </button>
              <button
                type="button"
                onClick={() => quickLoginRider("amit", "rider123")}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl p-2.5 text-left transition cursor-pointer"
              >
                <span className="font-black text-white block truncate">Amit Toppo</span>
                <span className="text-[10px] text-slate-500">amit / rider123</span>
              </button>
            </div>
          </div>
        )}

        {/* Security badge footer */}
        <div className="text-[10.5px] text-center text-slate-500 pt-2 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Zero-Trust Server Session • Protected with HMAC SHA-256</span>
        </div>
      </div>
    </div>
  );
}
