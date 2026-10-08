"use client";

import React, { useState } from "react";
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
} from "lucide-react";

export default function RiderDashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const [taskStatus, setTaskStatus] = useState<"assigned" | "picked_up" | "delivered">("assigned");
  const [cashCollected, setCashCollected] = useState(320);
  const [todayEarnings, setTodayEarnings] = useState(150);

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center items-start sm:py-8 font-sans antialiased">
      
      {/* Mobile Device Simulation Shell */}
      <div className="w-full max-w-md bg-[#f8fafc] text-slate-800 min-h-screen sm:min-h-[844px] sm:rounded-[40px] flex flex-col relative shadow-2xl sm:border-[8px] sm:border-slate-800 overflow-hidden">
        
        {/* Dynamic Island / Speaker cutout simulation */}
        <div className="hidden sm:flex justify-center pt-2 pb-1 bg-white">
          <div className="w-28 h-4 bg-slate-900 rounded-full" />
        </div>

        {/* Top App Header */}
        <header className="bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-slate-900 text-lg">AmbiBites</span>
              <span className="bg-orange-100 text-orange-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                Rider
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
              <span className={`text-[11px] font-extrabold uppercase tracking-wide ${isOnline ? "text-emerald-600" : "text-slate-500"}`}>
                {isOnline ? "Status: Online" : "Status: Offline"}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsOnline(!isOnline)}
            className="transition active:scale-90"
          >
            {isOnline ? (
              <ToggleRight className="w-11 h-11 text-emerald-500" />
            ) : (
              <ToggleLeft className="w-11 h-11 text-slate-300" />
            )}
          </button>
        </header>

        {/* Scrollable Tasks Body */}
        <main className="flex-1 p-5 overflow-y-auto space-y-5 pb-24">
          
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

          {/* Active Order Card */}
          {taskStatus !== "delivered" ? (
            <div className="bg-white rounded-3xl p-5 border border-orange-200 shadow-xl shadow-orange-500/5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <span className="bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                  Active Task • Order #AB-8102
                </span>
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-orange-500" /> 18 mins left
                </span>
              </div>

              <h2 className="text-lg font-black text-slate-900 mb-4">
                Delivery to Gandhi Chowk
              </h2>

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
                    <h4 className="text-sm font-bold text-slate-900">The Royal Kitchen</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                      Shop 14, Main Road, Gandhi Chowk, Ambikapur
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
                    <h4 className="text-sm font-bold text-slate-900">Aryan Gupta (+91 98261...)</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                      Ward 15, Near Water Tank, Gandhi Chowk
                    </p>
                  </div>
                </div>

              </div>

              {/* Interactive Ambikapur Route Preview */}
              <div className="mt-5 rounded-2xl overflow-hidden relative border border-slate-200 h-36 bg-slate-100 shadow-inner group">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop"
                  alt="Ambikapur Map"
                  className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-white/95 backdrop-blur-md text-slate-900 font-extrabold text-xs py-2 px-3 rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-white transition"
                  >
                    <Navigation className="w-3.5 h-3.5 text-orange-600" />
                    <span>Navigate in Ola / Google Maps (1.8 km)</span>
                  </a>
                </div>
              </div>

              {/* Dynamic Status Action Button */}
              <div className="mt-5">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 text-center block mb-2 tracking-wider">
                  Update Delivery Step
                </span>

                {taskStatus === "assigned" ? (
                  <button
                    onClick={() => setTaskStatus("picked_up")}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg transition active:scale-98 flex items-center justify-center gap-2"
                  >
                    <span>Tap to Confirm Pickup (Food Ready)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setTaskStatus("delivered");
                      setCashCollected((prev) => prev + 465);
                      setTodayEarnings((prev) => prev + 40);
                    }}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-4 px-4 rounded-2xl shadow-xl shadow-orange-600/30 transition active:scale-98 flex items-center justify-center gap-2 text-sm"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Collect ₹465 (COD) & Deliver Order</span>
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center shadow-sm">
              <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="font-black text-slate-900 text-lg">Order Delivered!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                ₹40 added to your Ambikapur Rider Ledger. Cash ledger updated.
              </p>
              <button
                onClick={() => setTaskStatus("assigned")}
                className="mt-4 bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl"
              >
                Simulate Next Order
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
