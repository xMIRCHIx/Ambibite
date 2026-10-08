"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Store,
  Bell,
  Clock,
  CheckCircle,
  XCircle,
  Volume2,
  VolumeX,
  AlertTriangle,
  ChefHat,
  ArrowRight,
  ToggleRight,
  ToggleLeft,
  ChevronRight,
  Check,
} from "lucide-react";

interface IncomingOrder {
  id: string;
  orderNumber: string;
  timeRemainingSec: number;
  customerName: string;
  deliveryArea: string;
  items: { name: string; qty: number; price: number; isVeg: boolean }[];
  totalAmount: number;
  status: "incoming" | "preparing" | "ready";
  prepTimeMinutes: number;
}

export default function RestaurantPartnerHub() {
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [orders, setOrders] = useState<IncomingOrder[]>([
    {
      id: "ord-1",
      orderNumber: "#AB-8105",
      timeRemainingSec: 145,
      customerName: "Rahul Sharma",
      deliveryArea: "Gandhi Chowk (1.2 km)",
      items: [
        { name: "Special Chicken Dum Biryani", qty: 2, price: 320, isVeg: false },
        { name: "Paneer Tikka Butter Roll", qty: 1, price: 120, isVeg: true },
      ],
      totalAmount: 760,
      status: "incoming",
      prepTimeMinutes: 20,
    },
    {
      id: "ord-2",
      orderNumber: "#AB-8102",
      timeRemainingSec: 0,
      customerName: "Aryan Gupta",
      deliveryArea: "Ward 15, Near Water Tank",
      items: [
        { name: "Paneer Tikka Butter Roll", qty: 1, price: 120, isVeg: true },
        { name: "Roasted Chicken Half", qty: 1, price: 250, isVeg: false },
      ],
      totalAmount: 370,
      status: "preparing",
      prepTimeMinutes: 15,
    },
  ]);

  const [menuItems, setMenuItems] = useState([
    { id: 1, name: "Special Chicken Dum Biryani", price: 320, inStock: true },
    { id: 2, name: "Paneer Tikka Butter Roll", price: 120, inStock: true },
    { id: 3, name: "Roasted Chicken Half", price: 250, inStock: true },
    { id: 4, name: "Fresh Mango Kulfi Shake", price: 90, inStock: false },
  ]);

  const handleAccept = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "preparing" } : o))
    );
  };

  const handleReject = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const handleMarkReady = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "ready" } : o))
    );
  };

  const toggleStock = (id: number) => {
    setMenuItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, inStock: !m.inStock } : m))
    );
  };

  const incomingCount = orders.filter((o) => o.status === "incoming").length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased flex flex-col">
      
      {/* Top Hub Bar */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 sm:px-6 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-3 sm:gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-600/30 shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black text-white">The Royal Kitchen</h1>
              <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                Partner POS
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400">Ambikapur Main Branch • Gandhi Chowk</p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          
          {/* Sound Loud Alert Toggle */}
          <button
            onClick={() => setIsSoundMuted(!isSoundMuted)}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-[11px] sm:text-xs font-bold transition ${
              isSoundMuted
                ? "bg-slate-900 border-slate-800 text-slate-500"
                : "bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse"
            }`}
          >
            {isSoundMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            <span>{isSoundMuted ? "Muted" : "Loud Ring Active"}</span>
          </button>

          {/* Restaurant Open / Closed Switch */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 sm:px-4 py-1.5 rounded-xl">
            <button
              onClick={() => setIsAcceptingOrders(!isAcceptingOrders)}
              className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold"
            >
              {isAcceptingOrders ? (
                <>
                  <ToggleRight className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400" />
                  <span className="text-emerald-400 font-black">Taking Orders</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-6 h-6 sm:w-7 sm:h-7 text-slate-600" />
                  <span className="text-slate-500">Store Paused</span>
                </>
              )}
            </button>
          </div>

          <Link
            href="/"
            className="text-[11px] sm:text-xs font-bold text-slate-400 hover:text-white transition px-2 py-1 rounded-lg"
          >
            Customer View →
          </Link>
        </div>
      </header>

      {/* Main Grid View */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-20 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Orders Processing Board */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Urgent Incoming Orders Warning Banner */}
          {incomingCount > 0 && (
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-4 rounded-3xl text-white shadow-xl flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
                  <Bell className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-base font-black">
                    {incomingCount} New Order Ringing!
                  </h3>
                  <p className="text-xs text-orange-100">
                    Accept within 3 minutes before auto-cancellation sequence initiates.
                  </p>
                </div>
              </div>
              <span className="bg-white text-orange-600 px-3 py-1 rounded-xl font-black text-xs">
                ACTION REQUIRED
              </span>
            </div>
          )}

          {/* Orders Section */}
          <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800">
            <h2 className="text-base font-black text-white mb-4 flex items-center justify-between">
              <span>Kitchen Orders Flow</span>
              <span className="text-xs font-bold text-slate-400">
                {orders.length} Active in Kitchen
              </span>
            </h2>

            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className={`p-5 rounded-2xl border transition duration-200 ${
                    ord.status === "incoming"
                      ? "bg-slate-900 border-orange-500/80 ring-2 ring-orange-500/20"
                      : ord.status === "preparing"
                      ? "bg-slate-900/90 border-slate-800"
                      : "bg-emerald-950/20 border-emerald-500/30"
                  }`}
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-black text-white">{ord.orderNumber}</span>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        ord.status === "incoming"
                          ? "bg-orange-500/20 text-orange-400 border-orange-500/30 animate-pulse"
                          : ord.status === "preparing"
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      }`}>
                        {ord.status === "incoming" ? "RINGING..." : ord.status === "preparing" ? "IN KITCHEN" : "FOOD READY FOR RIDER"}
                      </span>
                    </div>

                    {ord.status === "incoming" ? (
                      <div className="flex items-center gap-1.5 text-xs font-black text-orange-400 bg-orange-950/60 px-2.5 py-1 rounded-lg border border-orange-800">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Timer: 02:25</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-bold">
                        Prep Time: {ord.prepTimeMinutes} mins
                      </span>
                    )}
                  </div>

                  {/* Customer info & items */}
                  <div className="space-y-2 mb-4">
                    <div className="text-xs text-slate-400 flex items-center justify-between">
                      <span>Customer: <strong className="text-white">{ord.customerName}</strong> ({ord.deliveryArea})</span>
                      <span className="text-sm font-black text-white">₹{ord.totalAmount}</span>
                    </div>

                    <div className="bg-slate-950/80 p-3 rounded-xl space-y-1.5 border border-slate-800/80">
                      {ord.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-medium">
                            <strong className="text-orange-400 mr-1.5">{item.qty}x</strong> {item.name}
                          </span>
                          <span className="text-slate-400">₹{item.price * item.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions according to Blueprint (Screenshot 5) */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    {ord.status === "incoming" && (
                      <>
                        <button
                          onClick={() => handleReject(ord.id)}
                          className="px-4 py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-950/40 text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject Order</span>
                        </button>
                        <button
                          onClick={() => handleAccept(ord.id)}
                          className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-black transition flex items-center gap-1.5 shadow-lg shadow-orange-600/30"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Accept (20 Mins Prep)</span>
                        </button>
                      </>
                    )}

                    {ord.status === "preparing" && (
                      <button
                        onClick={() => handleMarkReady(ord.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                      >
                        <ChefHat className="w-4 h-4" />
                        <span>Food Packed: Mark 'Ready for Rider'</span>
                      </button>
                    )}

                    {ord.status === "ready" && (
                      <div className="w-full bg-slate-900 border border-emerald-500/30 p-2.5 rounded-xl text-center text-xs text-emerald-400 font-bold flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>Waiting for Ambikapur Rider pickup...</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Quick Menu In-Stock / Out-of-Stock Manager */}
        <div className="space-y-6">
          <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-white">Menu Stock Toggles</h3>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                Instant Update
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Toggle items out-of-stock instantly so Ambikapur customers cannot order finished items.
            </p>

            <div className="space-y-3">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.name}</h4>
                    <span className="text-xs font-semibold text-slate-400">₹{item.price}</span>
                  </div>

                  <button
                    onClick={() => toggleStock(item.id)}
                    className="flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {item.inStock ? (
                      <>
                        <span className="text-[10px] text-emerald-400 font-bold">In Stock</span>
                        <ToggleRight className="w-6 h-6 text-emerald-400" />
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] text-rose-400 font-bold">Sold Out</span>
                        <ToggleLeft className="w-6 h-6 text-slate-600" />
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Shift Summary */}
          <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800">
            <h3 className="text-base font-black text-white mb-3">Today's Restaurant Shift</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Orders Fulfilled</span>
                <strong className="text-white">38 Orders</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Gross Food Sales</span>
                <strong className="text-white">₹14,280</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Platform Commission (20%)</span>
                <strong className="text-orange-400">-₹2,856</strong>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-black text-emerald-400">
                <span>Your Payout (Net)</span>
                <span>₹11,424</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
