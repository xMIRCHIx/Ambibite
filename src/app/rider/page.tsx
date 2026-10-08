"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ToggleRight,
  ToggleLeft,
  MapPin,
  Navigation,
  Banknote,
  Phone,
  Clock,
  ShieldAlert,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Check,
  X,
  RefreshCw,
  Bike,
} from "lucide-react";

export default function RiderDashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const [currentRiderName, setCurrentRiderName] = useState("Ramesh Kumar");
  const [liveOrders, setLiveOrders] = useState<any[]>([]);
  const [cashCollected, setCashCollected] = useState(420);
  const [todayEarnings, setTodayEarnings] = useState(150);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchRiderOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success && data.orders) {
        setLiveOrders(data.orders);
      }
    } catch (e) {
      console.warn("Rider fetch notice:", e);
    }
  };

  useEffect(() => {
    fetchRiderOrders();
    const interval = setInterval(fetchRiderOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  // Find any active order assigned to this rider or pending rider action
  const assignedOrder = liveOrders.find(
    (o) =>
      (o.riderName === currentRiderName || !o.riderName) &&
      (o.status === "rider_assigned" || o.status === "picked_up")
  );

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: "picked_up",
          riderName: currentRiderName,
        }),
      });
      setStatusMessage("Order accepted! Proceed to restaurant for pickup.");
      fetchRiderOrders();
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: "ready", // Return to ready queue so admin can reassign
          riderName: null,
        }),
      });
      setStatusMessage("Order rejected. Task returned to Admin queue.");
      fetchRiderOrders();
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeliverOrder = async (orderId: string, amount: number) => {
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: "delivered",
        }),
      });
      setCashCollected((prev) => prev + amount);
      setTodayEarnings((prev) => prev + 40);
      setStatusMessage(`Order Delivered! ₹${amount} collected & ₹40 trip earning credited.`);
      fetchRiderOrders();
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center items-start sm:py-8 font-sans antialiased">
      
      {/* Mobile Device Simulation Shell */}
      <div className="w-full max-w-md bg-[#f8fafc] text-slate-800 min-h-screen sm:min-h-[844px] sm:rounded-[40px] flex flex-col relative shadow-2xl sm:border-[8px] sm:border-slate-800 overflow-hidden">
        
        {/* Dynamic Island / Speaker cutout simulation */}
        <div className="hidden sm:flex justify-center pt-2 pb-1 bg-white">
          <div className="w-28 h-4 bg-slate-900 rounded-full" />
        </div>

        {/* Top App Header */}
        <header className="bg-white px-5 py-3.5 border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div>
            <div className="flex items-center gap-1.5">
              <Link href="/" className="font-black text-slate-900 text-lg hover:text-orange-600 transition">
                AmbiBites
              </Link>
              <span className="bg-orange-100 text-orange-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                Rider
              </span>
            </div>
            
            {/* Rider Selector Dropdown */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
              <select
                value={currentRiderName}
                onChange={(e) => setCurrentRiderName(e.target.value)}
                className="text-[11px] font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
              >
                <option value="Ramesh Kumar">Ramesh Kumar (Splendor)</option>
                <option value="Suresh Mandavi">Suresh Mandavi (Activa)</option>
                <option value="Ajay Patel">Ajay Patel (Pulsar)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-[10px] font-bold text-slate-500 hover:text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg"
            >
              Home
            </Link>
            <button
              onClick={() => setIsOnline(!isOnline)}
              className="transition active:scale-90"
            >
              {isOnline ? (
                <ToggleRight className="w-9 h-9 text-emerald-500" />
              ) : (
                <ToggleLeft className="w-9 h-9 text-slate-300" />
              )}
            </button>
          </div>
        </header>

        {/* Status Notification Toast */}
        {statusMessage && (
          <div className="bg-slate-900 text-white text-xs font-bold px-4 py-2.5 mx-4 mt-3 rounded-2xl shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2">
            <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Scrollable Tasks Body */}
        <main className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 pb-24">
          
          {/* Cash Leakage Protection Warning Banner */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 flex items-start gap-2.5 shadow-xs">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-amber-900">COD Cash Limit: ₹2,000 Max</span>
              <p className="text-amber-700 text-[11px] mt-0.5 leading-tight">
                Current physical cash held is <strong>₹{cashCollected}</strong>. Handover cash to admin to unlock more orders.
              </p>
            </div>
          </div>

          {/* ACTIVE DISPATCHED ORDER CARD */}
          {assignedOrder ? (
            <div className="bg-white rounded-3xl p-5 border border-orange-200 shadow-xl shadow-orange-500/5 relative overflow-hidden animate-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <span className="bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                  Active Task • {assignedOrder.orderNumber}
                </span>
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-orange-500" /> 18 mins left
                </span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-black text-slate-900">
                  Delivery to {assignedOrder.deliveryArea.split(",")[0]}
                </h2>
                <span className="text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-lg">
                  Collect ₹{assignedOrder.totalAmount} ({assignedOrder.paymentMethod})
                </span>
              </div>

              {/* Waypoints Timeline */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                
                {/* Pickup Waypoint */}
                <div className="relative">
                  <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-orange-600 border-2 border-white shadow-sm flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </span>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-orange-600 tracking-wider block">
                      Restaurant (Pickup)
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{assignedOrder.restaurantName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                      Gandhi Chowk Main Market, Ambikapur
                    </p>
                  </div>
                </div>

                {/* Drop Waypoint */}
                <div className="relative">
                  <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow-sm flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </span>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-emerald-600 tracking-wider block">
                      Customer Location (Drop)
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      {assignedOrder.customerName} ({assignedOrder.customerPhone || "Ambikapur"})
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                      {assignedOrder.deliveryArea}
                    </p>
                  </div>
                </div>

              </div>

              {/* Navigation button */}
              <div className="mt-5 rounded-2xl overflow-hidden relative border border-slate-200 h-32 bg-slate-100 shadow-inner group">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop"
                  alt="Ambikapur Map"
                  className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2.5">
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-white/95 backdrop-blur-md text-slate-900 font-extrabold text-xs py-2 px-3 rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-white transition"
                  >
                    <Navigation className="w-3.5 h-3.5 text-orange-600" />
                    <span>Navigate to {assignedOrder.deliveryArea.split(",")[0]} (1.5 km)</span>
                  </a>
                </div>
              </div>

              {/* ACTION BUTTONS (ACCEPT / REJECT OR DELIVER) */}
              <div className="mt-5 space-y-2">
                {assignedOrder.status === "rider_assigned" ? (
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 text-center block tracking-wider">
                      Dispatch Decision Required
                    </span>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => handleAcceptOrder(assignedOrder.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-3 rounded-2xl shadow-lg transition active:scale-95 flex items-center justify-center gap-1.5 text-xs"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>ACCEPT TASK</span>
                      </button>
                      <button
                        onClick={() => handleRejectOrder(assignedOrder.id)}
                        className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-black py-3.5 px-3 rounded-2xl transition active:scale-95 flex items-center justify-center gap-1.5 text-xs"
                      >
                        <X className="w-4 h-4 stroke-[3]" />
                        <span>REJECT</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 text-center block mb-2 tracking-wider">
                      Active In Transit
                    </span>
                    <button
                      onClick={() => handleDeliverOrder(assignedOrder.id, assignedOrder.totalAmount)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-xl shadow-orange-600/30 transition active:scale-98 flex items-center justify-center gap-2 text-xs"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Collect ₹{assignedOrder.totalAmount} & Complete Delivery</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center shadow-xs space-y-3">
              <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto shadow-inner">
                <Bike className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">Rider Radar Online</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Waiting for Ambikapur Admin or Restaurant to dispatch the next order to <strong>{currentRiderName}</strong>...
                </p>
              </div>
              <button
                onClick={fetchRiderOrders}
                className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl inline-flex items-center gap-2 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Radar</span>
              </button>
            </div>
          )}

          {/* Cash & Ledger Stats */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider mb-1">
                COD Cash Held
              </span>
              <h4 className="text-2xl font-black text-slate-900">₹{cashCollected}</h4>
              <p className="text-[10px] font-bold text-amber-600 mt-1">
                Handover due tonight
              </p>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider mb-1">
                Your Earnings Today
              </span>
              <h4 className="text-2xl font-black text-emerald-600">₹{todayEarnings}</h4>
              <p className="text-[10px] font-bold text-slate-400 mt-1">
                ₹40 per delivery trip
              </p>
            </div>
          </div>

        </main>

        {/* Bottom Tab Bar (Mobile) */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 px-6 py-3.5 flex items-center justify-around z-20">
          <button className="flex flex-col items-center gap-1 text-orange-600">
            <Navigation className="w-5 h-5" />
            <span className="text-[10px] font-black">Orders</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition">
            <Banknote className="w-5 h-5" />
            <span className="text-[10px] font-bold">Ledger</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition">
            <Clock className="w-5 h-5" />
            <span className="text-[10px] font-bold">History</span>
          </button>
        </div>

      </div>

    </div>
  );
}
