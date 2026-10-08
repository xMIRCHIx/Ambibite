"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Bike,
  Banknote,
  Search,
  Bell,
  User,
  ToggleRight,
  ToggleLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  PhoneCall,
  Check,
  X,
  ExternalLink,
  DollarSign,
  Download,
} from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "restaurants" | "riders" | "payouts">("dashboard");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // State: Orders
  const [orders, setOrders] = useState([
    { id: "#AB-8102", rest: "The Royal Kitchen", customer: "Aryan Gupta", area: "Gandhi Chowk", rider: "Ramesh K.", amt: 465, status: "Preparing", step: "Kitchen", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { id: "#AB-8101", rest: "Burger Hub", customer: "Pooja Singh", area: "Ghadi Chowk", rider: "Suresh M.", amt: 340, status: "Rider Assigned", step: "Pickup", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    { id: "#AB-8099", rest: "Kolkata Roll Corner", customer: "Vikas Verma", area: "Ring Road East", rider: "Ajay P.", amt: 220, status: "In Transit", step: "Delivery", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    { id: "#AB-8095", rest: "Dosa Plaza", customer: "Manish Tiwari", area: "Sadhar Hospital", rider: "Ramesh K.", amt: 190, status: "Delivered", step: "Completed", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  ]);

  // State: Restaurants
  const [restaurants, setRestaurants] = useState([
    { id: 1, name: "The Royal Kitchen (Gandhi Chowk)", area: "Gandhi Chowk", phone: "+91 98261 44551", commission: "20%", status: "Open", ordersToday: 38, isBlocked: false },
    { id: 2, name: "Burger Hub & Cafe (Ghadi Chowk)", area: "Ghadi Chowk", phone: "+91 70002 99120", commission: "20%", status: "Open", ordersToday: 26, isBlocked: false },
    { id: 3, name: "Ambikapur Dosa Plaza (Ring Road)", area: "Ring Road", phone: "+91 94252 11029", commission: "20%", status: "Closed", ordersToday: 12, isBlocked: false },
    { id: 4, name: "Kolkata Kathi Rolls Corner", area: "Hospital Road", phone: "+91 99814 77218", commission: "20%", status: "Open", ordersToday: 9, isBlocked: false },
  ]);

  // State: Riders
  const [riders, setRiders] = useState([
    { id: 1, name: "Ramesh Kumar", phone: "+91 98261 11223", vehicle: "Hero Splendor (CG 15)", status: "On Transit", cashHeld: 420, completedToday: 11, isOnline: true },
    { id: 2, name: "Suresh Mandavi", phone: "+91 70002 33445", vehicle: "Honda Activa (CG 15)", status: "Idle at Chowk", cashHeld: 180, completedToday: 8, isOnline: true },
    { id: 3, name: "Ajay Patel", phone: "+91 99814 55667", vehicle: "Bajaj Pulsar (CG 15)", status: "Delivering #AB-8099", cashHeld: 1240, completedToday: 14, isOnline: true },
    { id: 4, name: "Deepak Sahu", phone: "+91 91312 88990", vehicle: "TVS Jupiter (CG 15)", status: "Offline", cashHeld: 0, completedToday: 0, isOnline: false },
  ]);

  const dispatchOrder = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "In Transit", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" } : o))
    );
    showToast(`Order ${id} manual override: Dispatched to active rider!`);
  };

  const toggleRestaurantStatus = (id: number) => {
    setRestaurants((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const newStatus = r.status === "Open" ? "Closed" : "Open";
          showToast(`${r.name} status switched to ${newStatus}`);
          return { ...r, status: newStatus };
        }
        return r;
      })
    );
  };

  const toggleRestaurantBlock = (id: number) => {
    setRestaurants((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const newBlocked = !r.isBlocked;
          showToast(newBlocked ? `${r.name} has been BLOCKED from accepting orders` : `${r.name} unblocked successfully`);
          return { ...r, isBlocked: newBlocked };
        }
        return r;
      })
    );
  };

  const collectRiderCash = (riderId: number, name: string, currentHeld: number) => {
    setRiders((prev) =>
      prev.map((r) => (r.id === riderId ? { ...r, cashHeld: 0 } : r))
    );
    showToast(`Physical cash ₹${currentHeld} collected from ${name}. Digital ledger reset to ₹0!`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex font-sans antialiased">
      
      {/* Toast Banner Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-orange-600 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4">
          <CheckCircle className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar - Sleek Dark Control Center */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between hidden lg:flex shrink-0">
        <div>
          {/* Brand Logo */}
          <div className="p-6 border-b border-slate-800/80">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="w-9 h-9 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-orange-600/30">
                A
              </span>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white group-hover:text-orange-400 transition">
                  AmbiBites
                </h1>
                <p className="text-[10px] text-orange-400 font-extrabold uppercase tracking-wider">
                  Master Control
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "orders", label: "Live Orders", icon: ShoppingBag, badge: `${orders.filter(o => o.status !== "Delivered").length} Live` },
              { id: "restaurants", label: "Restaurants", icon: Store, count: `${restaurants.length}` },
              { id: "riders", label: "Rider Fleet", icon: Bike, count: `${riders.filter(r => r.isOnline).length} Online` },
              { id: "payouts", label: "Weekly Payouts", icon: Banknote },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-xs transition duration-200 cursor-pointer ${
                    isActive
                      ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                  {item.count && (
                    <span className="text-[10px] text-slate-500 font-bold">{item.count}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Portal Switch Links */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/50 space-y-2">
          <p className="text-[10px] font-black uppercase text-slate-500 px-2 tracking-wider">Quick Jump</p>
          <div className="flex flex-col gap-1 text-xs font-semibold">
            <Link href="/" className="px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 flex items-center justify-between transition">
              <span>Customer Home</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </Link>
            <Link href="/partner" className="px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 flex items-center justify-between transition">
              <span>Restaurant Partner</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </Link>
            <Link href="/rider" className="px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 flex items-center justify-between transition">
              <span>Rider Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-black text-white shadow-md text-xs">
              AG
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="text-xs font-bold text-white truncate">Aryan Gupta</h4>
              <p className="text-[10px] text-slate-400 truncate">Super Admin (Ambikapur)</p>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </aside>

      {/* Main Command Surface */}
      <div className="flex-1 flex flex-col bg-slate-900 min-w-0 overflow-y-auto">
        
        {/* Top Navbar */}
        <header className="h-16 px-6 lg:px-8 border-b border-slate-800 bg-slate-950/60 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search orders, restaurants, riders or customer mobile..."
                className="w-full bg-slate-900/90 border border-slate-800 pl-10 pr-4 py-2 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => showToast("All system webhooks synced with Supabase")}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline">Sync DB</span>
            </button>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Ambikapur Grid Online</span>
            </div>
          </div>
        </header>

        {/* Dynamic Content Views based on activeTab */}
        <main className="p-6 lg:p-8 space-y-8">
          
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">System Control Matrix</h2>
                <p className="text-xs text-slate-400 mt-0.5">Real-time status of orders, food outlets, and active delivery partners in Ambikapur.</p>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { title: "Today's Orders", val: "85", change: "+14.2% vs yesterday", icon: ShoppingBag, color: "from-orange-600 to-amber-600" },
                  { title: "Net Revenue (Keep)", val: "₹25,430", change: "20% platform cut locked", icon: TrendingUp, color: "from-emerald-600 to-teal-600" },
                  { title: "Rider Cash Held", val: "₹1,840", change: "Under ₹2,000 threshold", icon: Banknote, color: "from-blue-600 to-indigo-600" },
                  { title: "Avg Delivery Time", val: "24.5 Mins", change: "Ambikapur city limits", icon: Clock, color: "from-purple-600 to-pink-600" },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="bg-slate-950 p-5 rounded-3xl border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.title}</span>
                        <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${stat.color} text-white shadow-md`}>
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-black text-white tracking-tight">{stat.val}</h3>
                      <p className="text-[11px] text-slate-500 font-semibold mt-1 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                        {stat.change}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Live Orders & Rider Fleet Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Live Orders Queue (Col span 2) */}
                <div className="lg:col-span-2 bg-slate-950 rounded-3xl p-6 border border-slate-800">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-base font-black text-white">Live Dispatched Orders</h3>
                      <p className="text-xs text-slate-500">Live webhook synchronised with Razorpay & Rider fleet</p>
                    </div>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-xs font-bold text-orange-400 hover:underline"
                    >
                      View All Orders →
                    </button>
                  </div>

                  <div className="space-y-3">
                    {orders.slice(0, 3).map((o, idx) => (
                      <div key={idx} className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 font-black text-white text-xs flex items-center justify-center">
                            {o.id.replace("#AB-", "")}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-white">{o.rest}</h4>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${o.color}`}>
                                {o.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              To: <strong className="text-slate-300">{o.customer} ({o.area})</strong> • Rider: <span className="text-orange-400 font-semibold">{o.rider}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-sm font-black text-white">₹{o.amt}</span>
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">Paid Online</span>
                          </div>
                          {o.status !== "In Transit" && o.status !== "Delivered" && (
                            <button
                              onClick={() => dispatchOrder(o.id)}
                              className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow transition"
                            >
                              Dispatch
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rider Fleet Status Tracker */}
                <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-black text-white">Active Riders</h3>
                    <button
                      onClick={() => setActiveTab("riders")}
                      className="text-xs font-bold text-orange-400 hover:underline"
                    >
                      Fleet Control →
                    </button>
                  </div>

                  <div className="space-y-4">
                    {riders.slice(0, 3).map((rider, index) => (
                      <div key={index} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-9 h-9 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center font-bold">
                                <Bike className="w-5 h-5" />
                              </div>
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900 absolute -bottom-0.5 -right-0.5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-extrabold text-white">{rider.name}</h4>
                              <p className="text-[11px] text-slate-400">{rider.status}</p>
                            </div>
                          </div>
                          <span className="text-xs font-black text-emerald-400">
                            ₹{rider.cashHeld}
                          </span>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                          <span>Limit: <strong className="text-slate-300">₹2,000 max</strong></span>
                          <button
                            onClick={() => showToast(`Simulated ping alert sent to ${rider.name} (${rider.phone})`)}
                            className="text-orange-400 hover:underline font-bold"
                          >
                            Ping Rider
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: LIVE ORDERS MANAGEMENT */}
          {activeTab === "orders" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Live Orders Master Queue</h2>
                  <p className="text-xs text-slate-400">Monitor all customer orders placed across Ambikapur in real-time.</p>
                </div>
                <button
                  onClick={() => showToast("Order queue updated")}
                  className="bg-orange-600 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Queue</span>
                </button>
              </div>

              <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold bg-slate-900/60">
                        <th className="py-4 px-4">Order ID</th>
                        <th className="py-4 px-4">Restaurant</th>
                        <th className="py-4 px-4">Customer & Location</th>
                        <th className="py-4 px-4">Rider</th>
                        <th className="py-4 px-4">Amount</th>
                        <th className="py-4 px-4">Status</th>
                        <th className="py-4 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-900/40 transition">
                          <td className="py-4 px-4 font-black text-orange-400">{ord.id}</td>
                          <td className="py-4 px-4 font-bold text-white">{ord.rest}</td>
                          <td className="py-4 px-4">
                            <span className="font-bold text-white block">{ord.customer}</span>
                            <span className="text-slate-400 text-[11px]">{ord.area}</span>
                          </td>
                          <td className="py-4 px-4 font-medium text-slate-300">{ord.rider}</td>
                          <td className="py-4 px-4 font-black text-white">₹{ord.amt}</td>
                          <td className="py-4 px-4">
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${ord.color}`}>
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right space-x-2">
                            {ord.status !== "Delivered" ? (
                              <button
                                onClick={() => dispatchOrder(ord.id)}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-3 py-1.5 rounded-xl transition"
                              >
                                Dispatch
                              </button>
                            ) : (
                              <span className="text-emerald-400 font-bold text-[11px]">Completed</span>
                            )}
                            <button
                              onClick={() => showToast(`Calling customer ${ord.customer}...`)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-xl transition"
                            >
                              Call
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RESTAURANTS MANAGEMENT */}
          {activeTab === "restaurants" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Partner Restaurants (Ambikapur)</h2>
                  <p className="text-xs text-slate-400">Toggle store availability, modify commissions and block bad actors.</p>
                </div>
                <button
                  onClick={() => showToast("Restaurant onboarding form opened")}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow"
                >
                  + Add New Kitchen
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {restaurants.map((rest) => (
                  <div key={rest.id} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-base text-white">{rest.name}</h3>
                          {rest.isBlocked && (
                            <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black px-2 py-0.5 rounded-md">
                              BLOCKED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{rest.area} • Phone: {rest.phone}</p>
                      </div>

                      <button
                        onClick={() => toggleRestaurantStatus(rest.id)}
                        className="flex items-center gap-1.5 transition"
                      >
                        {rest.status === "Open" ? (
                          <ToggleRight className="w-8 h-8 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-slate-600" />
                        )}
                        <span className={`text-xs font-bold ${rest.status === "Open" ? "text-emerald-400" : "text-slate-500"}`}>
                          {rest.status}
                        </span>
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-900 p-3 rounded-2xl border border-slate-800 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block font-bold">Commission</span>
                        <span className="font-black text-orange-400">{rest.commission}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block font-bold">Today Orders</span>
                        <span className="font-black text-white">{rest.ordersToday}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block font-bold">Payout Mode</span>
                        <span className="font-black text-emerald-400">Weekly UPI</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Link
                        href={`/restaurant/rest-${rest.id}`}
                        className="text-xs font-bold text-orange-400 hover:underline flex items-center gap-1"
                      >
                        <span>View Live Menu</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <div className="space-x-2">
                        <button
                          onClick={() => toggleRestaurantBlock(rest.id)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                            rest.isBlocked
                              ? "bg-emerald-600 text-white border-emerald-500"
                              : "bg-slate-900 text-rose-400 border-rose-500/30 hover:bg-rose-950/40"
                          }`}
                        >
                          {rest.isBlocked ? "Unblock" : "Block Store"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RIDERS FLEET CONTROL */}
          {activeTab === "riders" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Rider Fleet & COD Ledger Lockout</h2>
                  <p className="text-xs text-slate-400">
                    Enforces the Blueprint's Reverse-Ledger Loop (Riders locked out if cash held exceeds ₹2,000).
                  </p>
                </div>
                <button
                  onClick={() => showToast("Rider registration form opened")}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow"
                >
                  + Onboard Rider
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {riders.map((r) => {
                  const isNearLimit = r.cashHeld >= 1000;
                  const isLocked = r.cashHeld >= 2000;
                  return (
                    <div key={r.id} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-orange-600/20 text-orange-400 flex items-center justify-center font-bold">
                            <Bike className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-black text-base text-white">{r.name}</h3>
                              <span className={`w-2 h-2 rounded-full ${r.isOnline ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{r.phone} • {r.vehicle}</p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                          isLocked
                            ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                            : isNearLimit
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        }`}>
                          {isLocked ? "LOCKOUT ACTIVE" : isNearLimit ? "NEAR THRESHOLD" : "ACTIVE"}
                        </span>
                      </div>

                      {/* Cash Held Meter */}
                      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-semibold">Physical Cash Held</span>
                          <span className="text-base font-black text-white">₹{r.cashHeld} <span className="text-xs text-slate-500">/ ₹2,000 max</span></span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isLocked ? "bg-rose-500" : isNearLimit ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(100, (r.cashHeld / 2000) * 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Cash Handover Button */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-slate-400 font-semibold">
                          Completed: <strong className="text-white">{r.completedToday} trips</strong>
                        </span>

                        <button
                          onClick={() => collectRiderCash(r.id, r.name, r.cashHeld)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2 rounded-xl transition shadow flex items-center gap-1.5"
                        >
                          <Banknote className="w-4 h-4" />
                          <span>Cash Received Handover (Reset)</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: WEEKLY PAYOUTS (BLUEPRINT COMPLIANT) */}
          {activeTab === "payouts" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Monday Weekly Payout Engine</h2>
                  <p className="text-xs text-slate-400">
                    Following Blueprint Page 7 & 12: Real money stays in your bank until Monday UPI payouts to avoid RBI wallet regulations.
                  </p>
                </div>
                <button
                  onClick={() => showToast("CA Tax & Ledger Report downloaded (CSV)")}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download CA Report</span>
                </button>
              </div>

              <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 space-y-4">
                <h3 className="text-base font-black text-white">Pending Monday UPI Transfers</h3>
                
                <div className="space-y-3">
                  {[
                    { recipient: "The Royal Kitchen (Gandhi Chowk)", type: "Restaurant 80% Cut", upi: "royalkitchen@oksbi", due: "₹18,420" },
                    { recipient: "Burger Hub (Ghadi Chowk)", type: "Restaurant 80% Cut", upi: "burgerhub@axl", due: "₹11,350" },
                    { recipient: "Ramesh Kumar (Rider)", type: "Rider Delivery Earnings (₹40/trip)", upi: "9826111223@paytm", due: "₹2,640" },
                    { recipient: "Suresh Mandavi (Rider)", type: "Rider Delivery Earnings (₹40/trip)", upi: "7000233445@ybl", due: "₹1,920" },
                  ].map((pay, i) => (
                    <div key={i} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-white">{pay.recipient}</h4>
                        <p className="text-xs text-slate-400">{pay.type} • UPI ID: <strong className="text-slate-300">{pay.upi}</strong></p>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-base font-black text-emerald-400">{pay.due}</span>
                        <button
                          onClick={() => showToast(`Triggered manual UPI transfer of ${pay.due} to ${pay.upi}`)}
                          className="bg-orange-600 hover:bg-orange-700 text-white font-black text-xs px-4 py-2 rounded-xl transition shadow"
                        >
                          Pay UPI
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
