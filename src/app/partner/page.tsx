"use client";

import React, { useState, useEffect } from "react";
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
  Bike,
  Plus,
  UploadCloud,
  X,
  Loader2,
} from "lucide-react";

interface IncomingOrder {
  id: string;
  orderNumber: string;
  timeRemainingSec: number;
  customerName: string;
  deliveryArea: string;
  items: { name: string; qty: number; price: number; isVeg?: boolean }[];
  totalAmount: number;
  status: "incoming" | "preparing" | "ready";
  rawStatus: string;
  riderName?: string | null;
  prepTimeMinutes: number;
}

export default function RestaurantPartnerHub() {
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [orders, setOrders] = useState<IncomingOrder[]>([]);

  const fetchPartnerOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success && data.orders) {
        // Map to partner format
        const mapped: IncomingOrder[] = data.orders.map((o: any) => {
          let posStatus: "incoming" | "preparing" | "ready" = "incoming";
          if (o.status === "preparing") posStatus = "preparing";
          else if (o.status === "ready" || o.status === "rider_assigned" || o.status === "picked_up" || o.status === "delivered") posStatus = "ready";
          else if (o.status === "placed") posStatus = "incoming";

          return {
            id: o.id,
            orderNumber: o.orderNumber,
            timeRemainingSec: 180,
            customerName: o.customerName,
            deliveryArea: o.deliveryArea,
            items: o.items || [],
            totalAmount: o.totalAmount,
            status: posStatus,
            rawStatus: o.status,
            riderName: o.riderName,
            prepTimeMinutes: o.prepTimeMinutes || 20,
          };
        });
        setOrders(mapped);
      }
    } catch (e) {
      console.warn("Partner fetch notice:", e);
    }
  };

  const handleDispatchRider = async (orderId: string) => {
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: "rider_assigned",
          riderName: "Ramesh Kumar",
        }),
      });
      fetchPartnerOrders();
    } catch (e) {
      console.error(e);
    }
  };

  const [menuItems, setMenuItems] = useState<any[]>([
    { id: "1", name: "Special Chicken Dum Biryani", price: 320, inStock: true },
    { id: "2", name: "Paneer Tikka Butter Roll", price: 120, inStock: true },
    { id: "3", name: "Roasted Chicken Half", price: 250, inStock: true },
    { id: "4", name: "Ambikapur Royal Veg Thali", price: 180, inStock: true },
  ]);

  // Add dish state
  const [showAddDish, setShowAddDish] = useState(false);
  const [dishUploading, setDishUploading] = useState(false);
  const [dishName, setDishName] = useState("");
  const [dishPrice, setDishPrice] = useState("");
  const [dishCategory, setDishCategory] = useState("Main Course");
  const [dishIsVeg, setDishIsVeg] = useState(true);
  const [dishImages, setDishImages] = useState<string[]>([]);

  const fetchMenuItems = async () => {
    try {
      const res = await fetch("/api/menu");
      const data = await res.json();
      if (data.success && data.items?.length > 0) {
        setMenuItems(
          data.items.map((m: any) => ({
            id: m.id,
            name: m.name,
            price: m.price,
            inStock: m.in_stock !== false,
            imageUrl: m.image_url,
            category: m.category,
          }))
        );
      }
    } catch (e) {
      console.warn("Menu fetch error:", e);
    }
  };

  useEffect(() => {
    fetchPartnerOrders();
    fetchMenuItems();
    const interval = setInterval(fetchPartnerOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleDishUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setDishUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((file) => {
        fd.append("files", file);
      });
      fd.append("folder", "food");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success && (data.urls || data.url)) {
        const newUrls = data.urls || [data.url];
        setDishImages((prev) => [...prev, ...newUrls]);
      } else {
        alert("Upload failed: " + (data.error || "Unknown"));
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setDishUploading(false);
    }
  };

  const removeDishImage = (idxToRemove: number) => {
    setDishImages((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName || !dishPrice) {
      alert("Name and price are required");
      return;
    }
    try {
      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: dishName,
          price: Number(dishPrice),
          category: dishCategory,
          is_veg: dishIsVeg,
          imageUrl: dishImages[0] || "https://pub-6173aeb8009d4efd9966052cb0ea9b71.r2.dev/food/1.jpg",
          images: dishImages,
          description: "Freshly prepared in Ambikapur kitchen.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddDish(false);
        setDishName("");
        setDishPrice("");
        setDishImages([]);
        fetchMenuItems();
      } else {
        alert("Failed to add dish: " + (data.error || "Unknown"));
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleAccept = async (orderId: string) => {
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: "preparing" }),
      });
      fetchPartnerOrders();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (orderId: string) => {
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: "cancelled" }),
      });
      fetchPartnerOrders();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkReady = async (orderId: string) => {
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: "ready" }),
      });
      fetchPartnerOrders();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleStock = async (id: string | number, currentStock: boolean) => {
    setMenuItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, inStock: !currentStock } : m))
    );
    try {
      await fetch("/api/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: id, in_stock: !currentStock }),
      });
    } catch (e) {
      console.error("Stock update error:", e);
    }
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
                      <div className="w-full space-y-2">
                        {ord.rawStatus === "picked_up" ? (
                          <div className="bg-indigo-950/60 border border-indigo-500/40 p-2.5 rounded-xl text-center text-xs text-indigo-300 font-bold flex items-center justify-center gap-2">
                            <Bike className="w-4 h-4 text-indigo-400" />
                            <span>Picked Up by {ord.riderName || "Rider"} • On the way to Customer!</span>
                          </div>
                        ) : ord.rawStatus === "delivered" ? (
                          <div className="bg-emerald-950/60 border border-emerald-500/40 p-2.5 rounded-xl text-center text-xs text-emerald-300 font-bold flex items-center justify-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>Order Delivered to Customer • Payment Completed</span>
                          </div>
                        ) : ord.rawStatus === "rider_assigned" ? (
                          <div className="bg-purple-950/60 border border-purple-500/40 p-2.5 rounded-xl text-center text-xs text-purple-300 font-bold flex items-center justify-center gap-2">
                            <Bike className="w-4 h-4 text-purple-400 animate-pulse" />
                            <span>Rider Assigned ({ord.riderName}) • Waiting for Rider to Accept & Pickup</span>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                            <div className="flex-1 bg-slate-900 border border-emerald-500/30 p-2.5 rounded-xl text-center text-xs text-emerald-400 font-bold flex items-center justify-center gap-2">
                              <Check className="w-4 h-4" />
                              <span>Food Ready • Open to All Online Riders</span>
                            </div>
                            <button
                              onClick={() => handleDispatchRider(ord.id)}
                              className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                            >
                              <Bike className="w-4 h-4" />
                              <span>Dispatch to Rider</span>
                            </button>
                          </div>
                        )}
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
              <button
                onClick={() => setShowAddDish(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Food Item</span>
              </button>
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
                  <div className="flex items-center gap-3">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                      />
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.name}</h4>
                      <span className="text-xs font-semibold text-slate-400">₹{item.price}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleStock(item.id, item.inStock)}
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

      {/* Add Dish Modal with Cloudflare R2 Upload */}
      {showAddDish && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 relative text-white shadow-2xl animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowAddDish(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black mb-1 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-orange-500" />
              <span>Add Dish to Live Menu</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Add food photo & pricing. Automatically uploads to Cloudflare R2 CDN & updates Supabase.
            </p>

            <form onSubmit={handleSaveDish} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chicken Dum Biryani"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="250"
                    value={dishPrice}
                    onChange={(e) => setDishPrice(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Food Type
                  </label>
                  <div className="flex bg-slate-800 border border-slate-700 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setDishIsVeg(true)}
                      className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition ${
                        dishIsVeg ? "bg-emerald-600 text-white" : "text-slate-400"
                      }`}
                    >
                      Veg
                    </button>
                    <button
                      type="button"
                      onClick={() => setDishIsVeg(false)}
                      className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition ${
                        !dishIsVeg ? "bg-rose-600 text-white" : "text-slate-400"
                      }`}
                    >
                      Non-Veg
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Category
                </label>
                <select
                  value={dishCategory}
                  onChange={(e) => setDishCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="Biryani & Rice">Biryani & Rice</option>
                  <option value="Main Course">Main Course</option>
                  <option value="Rolls & Starters">Rolls & Starters</option>
                  <option value="Burgers & Fast Food">Burgers & Fast Food</option>
                  <option value="Thalis">Thalis</option>
                  <option value="Beverages & Shakes">Beverages & Shakes</option>
                  <option value="Desserts">Desserts</option>
                </select>
              </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Food Photos (Multiple Carousel Photos Supported)
                  </label>
                  <label className="w-full bg-slate-800 hover:bg-slate-700 border border-dashed border-slate-600 rounded-xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition">
                    {dishUploading ? (
                      <div className="flex items-center gap-2 text-xs text-orange-400 font-bold">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading Photos to Cloudflare R2...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-300">
                        <div className="flex items-center gap-2 text-xs font-bold text-orange-400">
                          <UploadCloud className="w-4 h-4" />
                          <span>Click to Select Single or Multiple Photos</span>
                        </div>
                        <span className="text-[10px] text-slate-400">You can select multiple photos at once</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleDishUpload}
                      disabled={dishUploading}
                      className="hidden"
                    />
                  </label>

                  {dishImages.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-bold text-white">
                          Uploaded Photos ({dishImages.length})
                        </span>
                        <span className="text-emerald-400 font-semibold">Carousel Ready</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto p-1 bg-slate-800/60 rounded-xl border border-slate-700/60">
                        {dishImages.map((img, idx) => (
                          <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-700 aspect-square">
                            <img
                              src={img}
                              alt={`Dish ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeDishImage(idx)}
                              className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-0.5 shadow transition opacity-90 group-hover:opacity-100"
                              title="Remove photo"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <span className="absolute bottom-0.5 left-0.5 bg-black/70 text-[9px] text-white px-1 rounded font-bold">
                              #{idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDish(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dishUploading}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-black py-2.5 rounded-xl text-xs transition shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2"
                >
                  <span>Save Dish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
