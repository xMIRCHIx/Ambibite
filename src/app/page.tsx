"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Search,
  ChevronDown,
  ShoppingBag,
  X,
  Minus,
  Plus,
  Compass,
  Star,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard,
  Banknote,
  Sparkles,
  Percent,
  SlidersHorizontal,
  Flame,
  Bike,
  Store,
  ChevronRight,
  Heart,
} from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  restaurantId: string;
  restaurantName: string;
  category: string;
  price: number;
  originalPrice?: number;
  isVeg: boolean;
  isBestseller?: boolean;
  rating: number;
  votes: number;
  description: string;
  imageUrl: string;
}

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  distance: string;
  area: string;
  discount: string;
  imageUrl: string;
  isOpen: boolean;
}

const RESTAURANTS: Restaurant[] = [
  {
    id: "rest-1",
    name: "The Royal Kitchen",
    cuisine: "North Indian, Mughlai, Biryani",
    rating: 4.8,
    reviews: 1420,
    deliveryTime: "25-30 min",
    distance: "1.8 km",
    area: "Gandhi Chowk",
    discount: "20% OFF UPTO ₹100",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop",
    isOpen: true,
  },
  {
    id: "rest-2",
    name: "Burger Hub & Cafe",
    cuisine: "Burgers, Fries, Shakes, Wraps",
    rating: 4.6,
    reviews: 890,
    deliveryTime: "20-25 min",
    distance: "2.3 km",
    area: "Ghadi Chowk",
    discount: "FLAT ₹50 OFF",
    imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop",
    isOpen: true,
  },
  {
    id: "rest-3",
    name: "Ambikapur Dosa Plaza",
    cuisine: "South Indian, Dosas, Filter Coffee",
    rating: 4.7,
    reviews: 630,
    deliveryTime: "30-35 min",
    distance: "3.1 km",
    area: "Ring Road East",
    discount: "ITEMS AT ₹99",
    imageUrl: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=800&auto=format&fit=crop",
    isOpen: true,
  },
  {
    id: "rest-4",
    name: "Kolkata Kathi Rolls",
    cuisine: "Rolls, Shawarma, Fast Food",
    rating: 4.5,
    reviews: 512,
    deliveryTime: "15-20 min",
    distance: "1.2 km",
    area: "Sadhar Hospital Road",
    discount: "FREE DELIVERY",
    imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=800&auto=format&fit=crop",
    isOpen: true,
  },
];

const DISH_CATEGORIES = [
  { name: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=300&auto=format&fit=crop" },
  { name: "Rolls & Wraps", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=300&auto=format&fit=crop" },
  { name: "Burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300&auto=format&fit=crop" },
  { name: "Thali Meals", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=300&auto=format&fit=crop" },
  { name: "Pizzas", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300&auto=format&fit=crop" },
  { name: "Chaat & Street", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=300&auto=format&fit=crop" },
  { name: "Dosas", image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=300&auto=format&fit=crop" },
  { name: "Shakes & Chai", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=300&auto=format&fit=crop" },
];

const MENU_ITEMS: MenuItem[] = [
  {
    id: "1",
    restaurantId: "rest-1",
    restaurantName: "The Royal Kitchen",
    name: "Special Chicken Dum Biryani (Handi)",
    category: "Biryani",
    price: 320,
    originalPrice: 380,
    isVeg: false,
    isBestseller: true,
    rating: 4.8,
    votes: 420,
    description: "Slow wood-fired dum cooked aromatic basmati with tender marinated chicken pieces, egg and saffron ghee.",
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "2",
    restaurantId: "rest-1",
    restaurantName: "The Royal Kitchen",
    name: "Paneer Tikka Butter Roll",
    category: "Rolls & Wraps",
    price: 120,
    isVeg: true,
    isBestseller: true,
    rating: 4.6,
    votes: 180,
    description: "Tandoori grilled cottage cheese cubes wrapped in fresh butter layered paratha with spiced onion salsa.",
    imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "3",
    restaurantId: "rest-1",
    restaurantName: "The Royal Kitchen",
    name: "Tandoori Roasted Chicken (Half)",
    category: "Non-Veg Starters",
    price: 250,
    originalPrice: 290,
    isVeg: false,
    rating: 4.7,
    votes: 215,
    description: "Classic tender bone-in chicken slow roasted in coal oven with Kashmiri degi mirch & hung curd.",
    imageUrl: "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "4",
    restaurantId: "rest-1",
    restaurantName: "The Royal Kitchen",
    name: "Ambikapur Royal Veg Thali",
    category: "Thali Meals",
    price: 180,
    isVeg: true,
    isBestseller: true,
    rating: 4.5,
    votes: 190,
    description: "Deluxe wholesome thali with Paneer Butter Masala, Dal Tadka, Seasonal Sabzi, 4 Tawa Rotis, Jeera Rice, Salad & Sweet.",
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "5",
    restaurantId: "rest-2",
    restaurantName: "Burger Hub",
    name: "Double Cheese Crunchy Burger",
    category: "Burgers",
    price: 140,
    originalPrice: 170,
    isVeg: true,
    rating: 4.6,
    votes: 130,
    description: "Crispy herb patty loaded with molten cheddar cheese, pickled jalapeños and secret house dressing.",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "6",
    restaurantId: "rest-2",
    restaurantName: "Burger Hub",
    name: "Crispy Peri-Peri Chicken Wings (6 Pcs)",
    category: "Burgers",
    price: 210,
    isVeg: false,
    rating: 4.8,
    votes: 95,
    description: "Golden fried juicy chicken wings tossed vigorously in fiery African peri-peri spice dust.",
    imageUrl: "https://images.unsplash.com/photo-1527477378408-1bc097a87113?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "7",
    restaurantId: "rest-3",
    restaurantName: "Ambikapur Dosa Plaza",
    name: "Mysore Masala Butter Dosa",
    category: "Dosas",
    price: 130,
    isVeg: true,
    isBestseller: true,
    rating: 4.9,
    votes: 310,
    description: "Crispy golden fermented crepe smeared with red chilli garlic paste, filled with spiced potato mash. Served with 3 chutneys & sambar.",
    imageUrl: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "8",
    restaurantId: "rest-4",
    restaurantName: "Kolkata Kathi Rolls",
    name: "Double Egg Chicken Roll",
    category: "Rolls & Wraps",
    price: 150,
    isVeg: false,
    rating: 4.7,
    votes: 280,
    description: "Fresh paratha layered with twin beaten eggs, stuffed with juicy charred chicken tikkas, lemon & crunchy onions.",
    imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "9",
    restaurantId: "rest-1",
    restaurantName: "The Royal Kitchen",
    name: "Crispy Aloo Tikki Chaat",
    category: "Chaat & Street",
    price: 80,
    isVeg: true,
    rating: 4.4,
    votes: 155,
    description: "Hot crisp potato cakes bathed in thick spiced curd, tangy saunth, spicy coriander chutney and sev.",
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "10",
    restaurantId: "rest-1",
    restaurantName: "The Royal Kitchen",
    name: "Fresh Mango Kulfi Thickshake",
    category: "Shakes & Chai",
    price: 90,
    isVeg: true,
    rating: 4.9,
    votes: 210,
    description: "Rich blended mango shake infused with cardamom kulfi chunks and roasted almonds.",
    imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600&auto=format&fit=crop",
  },
];

export default function CustomerHome() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<{ [id: string]: number }>({
    "1": 1,
    "2": 1,
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "UPI">("COD");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Gandhi Chowk, Ambikapur");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const current = prev[id] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const filteredItems = MENU_ITEMS.filter((item) => {
    if (selectedFilter !== "All" && item.category !== selectedFilter) return false;
    if (isVegOnly && !item.isVeg) return false;
    if (
      searchQuery &&
      !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.restaurantName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const item = MENU_ITEMS.find((m) => m.id === id)!;
    return { ...item, qty };
  });

  const itemTotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const deliveryFee = itemTotal > 0 ? 20 : 0;
  const platformFee = itemTotal > 0 ? 5 : 0;
  const grandTotal = itemTotal + deliveryFee + platformFee;
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white text-[11px] font-bold py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 animate-spin" />
        <span>Ambikapur Launch Offer: Flat 20% OFF on first 3 orders • Code: <strong>AMBIKA20</strong></span>
        <span className="opacity-60 hidden sm:inline">•</span>
        <span className="hidden sm:inline">Guaranteed delivery in 30 minutes within Ambikapur limits</span>
      </div>

      {/* Primary Sticky Header */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs px-4 lg:px-8 py-3 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & City Selector */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="w-9 h-9 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-orange-600/30 group-hover:scale-105 transition">
                A
              </span>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-orange-600 transition">
                  AmbiBites
                </span>
                <span className="block text-[9px] font-black text-orange-600 uppercase tracking-widest leading-none">
                  Ambikapur Express
                </span>
              </div>
            </Link>

            {/* Address Selector Pill */}
            <div
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden md:flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer border border-slate-200 transition"
            >
              <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span>Deliver to: <strong className="text-slate-900">{selectedLocation}</strong></span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* Search, Filter & Quick Nav Links */}
          <div className="flex items-center gap-3">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food or restaurant..."
                className="pl-9 pr-4 py-2 w-44 sm:w-64 rounded-full bg-slate-100 border border-transparent text-xs sm:text-sm font-medium focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition"
              />
            </div>

            {/* Veg Only Toggle */}
            <button
              onClick={() => setIsVegOnly(!isVegOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition shadow-xs ${
                isVegOnly
                  ? "bg-emerald-50 border-emerald-400 text-emerald-700 ring-2 ring-emerald-500/20"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className={`w-3 h-3 rounded-xs border flex items-center justify-center p-0.5 ${isVegOnly ? "border-emerald-600" : "border-slate-400"}`}>
                <span className={`w-full h-full rounded-full ${isVegOnly ? "bg-emerald-600" : "bg-slate-300"}`} />
              </span>
              <span>Veg Only</span>
            </button>

            {/* Portal Switcher Buttons */}
            <div className="hidden xl:flex items-center gap-1.5 bg-slate-100 p-1 rounded-full text-[11px] font-bold">
              <Link href="/admin" className="px-3 py-1 rounded-full text-slate-600 hover:text-slate-900 hover:bg-white transition">
                Admin Panel
              </Link>
              <Link href="/rider" className="px-3 py-1 rounded-full text-slate-600 hover:text-slate-900 hover:bg-white transition">
                Rider App
              </Link>
              <Link href="/partner" className="px-3 py-1 rounded-full text-slate-600 hover:text-slate-900 hover:bg-white transition">
                Restaurant Hub
              </Link>
            </div>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-orange-600 hover:bg-orange-700 active:scale-95 text-white px-4 py-2 rounded-full font-black text-xs flex items-center gap-2 shadow-md shadow-orange-600/30 transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart</span>
              {totalItemCount > 0 && (
                <span className="bg-white text-orange-600 rounded-full px-1.5 py-0.2 text-[10px] font-black">
                  {totalItemCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 space-y-10">

        {/* 1. What's on your mind? Horizontal Food Category Circles */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                What's on your mind?
              </h2>
              <p className="text-xs text-slate-500 font-medium">Explore handpicked Ambikapur cravings</p>
            </div>
            {selectedFilter !== "All" && (
              <button
                onClick={() => setSelectedFilter("All")}
                className="text-xs font-bold text-orange-600 hover:underline"
              >
                Reset Filter
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-none scroll-smooth">
            {DISH_CATEGORIES.map((cat) => {
              const isActive = selectedFilter === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedFilter(isActive ? "All" : cat.name)}
                  className="flex flex-col items-center gap-2 group shrink-0 transition"
                >
                  <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden p-1 transition duration-300 shadow-md ${
                    isActive ? "ring-4 ring-orange-500 scale-105" : "group-hover:scale-105 group-hover:ring-2 group-hover:ring-orange-300"
                  }`}>
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <span className={`text-xs font-extrabold transition ${
                    isActive ? "text-orange-600" : "text-slate-700 group-hover:text-orange-600"
                  }`}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. Top Restaurant Chains in Ambikapur */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Top Food Outlets in Ambikapur
              </h2>
              <p className="text-xs text-slate-500 font-medium">Handpicked kitchens with highest food hygiene & 4.5+ ratings</p>
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-200/60 px-3 py-1 rounded-full">
              {RESTAURANTS.length} Kitchens Live
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {RESTAURANTS.map((rest) => (
              <Link
                key={rest.id}
                href={`/restaurant/${rest.id}`}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Photo with Offer Badge */}
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={rest.imageUrl}
                      alt={rest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    
                    {/* Discount Tag */}
                    <div className="absolute bottom-2.5 left-3">
                      <span className="text-white text-xs font-black tracking-wide drop-shadow-md flex items-center gap-1">
                        <Percent className="w-3.5 h-3.5 text-orange-400" />
                        {rest.discount}
                      </span>
                    </div>

                    {/* Delivery Time Badge */}
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black text-slate-800 shadow-md flex items-center gap-1">
                      <Clock className="w-3 h-3 text-orange-600" />
                      <span>{rest.deliveryTime}</span>
                    </div>
                  </div>

                  {/* Rest Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-orange-600 transition leading-snug">
                        {rest.name}
                      </h3>
                      <span className="bg-emerald-600 text-white text-[11px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shrink-0 shadow-xs">
                        ★ {rest.rating}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-medium">
                      {rest.cuisine}
                    </p>

                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-semibold">
                      <MapPin className="w-3 h-3 text-orange-500" />
                      <span>{rest.area}</span>
                      <span>•</span>
                      <span>{rest.distance}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. Infinite Scrolling Food Products Grid */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-600 fill-orange-600" />
                <span>All Dishes Available for Delivery</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Showing {filteredItems.length} fresh options ready to dispatch in Ambikapur
              </p>
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {["All", "Biryani", "Rolls & Wraps", "Burgers", "Thali Meals", "Dosas", "Chaat & Street", "Shakes & Chai"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-xs whitespace-nowrap ${
                    selectedFilter === tab
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Dishes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const qtyInCart = cart[item.id] || 0;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Image with Badges */}
                    <Link href={`/product/${item.id}`} className="relative w-full h-44 rounded-2xl overflow-hidden mb-3.5 bg-slate-100 shadow-inner block">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Veg / Non-veg marker */}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md p-1.5 rounded-lg shadow-md">
                        <div
                          className={`w-3.5 h-3.5 border-2 flex items-center justify-center ${
                            item.isVeg ? "border-emerald-600" : "border-rose-600"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              item.isVeg ? "bg-emerald-600" : "bg-rose-600"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Bestseller Badge */}
                      {item.isBestseller && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Bestseller</span>
                        </div>
                      )}

                      {/* Rating pill */}
                      <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 shadow">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{item.rating}</span>
                        <span className="text-slate-300">({item.votes})</span>
                      </div>
                    </Link>

                    {/* Restaurant Origin */}
                    <Link href={`/restaurant/${item.restaurantId}`} className="text-[11px] font-extrabold text-orange-600 uppercase tracking-wider hover:underline block">
                      {item.restaurantName}
                    </Link>

                    {/* Item Name & Details */}
                    <Link href={`/product/${item.id}`}>
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-orange-600 transition leading-snug mt-0.5">
                        {item.name}
                      </h3>
                    </Link>
                    
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 font-medium leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Price & Cart Actions */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-black text-slate-900">₹{item.price}</span>
                        {item.originalPrice && (
                          <span className="text-xs text-slate-400 line-through font-semibold">
                            ₹{item.originalPrice}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold block">
                        Ambikapur Fresh
                      </span>
                    </div>

                    {qtyInCart > 0 ? (
                      <div className="flex items-center gap-2.5 bg-orange-50 border border-orange-300 px-2.5 py-1 rounded-xl shadow-xs">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded-lg bg-white text-orange-600 font-bold hover:bg-orange-100 flex items-center justify-center transition shadow-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-extrabold text-orange-700 text-sm w-4 text-center">
                          {qtyInCart}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-700 flex items-center justify-center transition shadow-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-600 hover:text-white font-black text-xs px-5 py-2 rounded-xl transition shadow-xs active:scale-95 flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>ADD</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* Floating Bottom Sticky Cart Bar */}
      {totalItemCount > 0 && !isCartOpen && (
        <div className="fixed bottom-5 left-4 right-4 max-w-lg mx-auto z-40 animate-in slide-in-from-bottom-4 duration-300">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 px-6 rounded-3xl shadow-2xl flex items-center justify-between border border-slate-800 transition active:scale-98"
          >
            <div className="flex items-center gap-3">
              <span className="bg-orange-600 text-white px-2.5 py-1 rounded-xl text-xs font-black shadow-md">
                {totalItemCount} Items
              </span>
              <span className="text-base font-black">₹{grandTotal}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-black text-orange-400">
              <span>View Cart & Checkout</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Checkout Drawer (Slide Over Modal) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Drawer Body */}
          <aside className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-orange-100 text-orange-600 shadow-xs">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Your Basket</h3>
                  <p className="text-xs text-slate-500 font-medium">Ambikapur Express Delivery</p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-9 h-9 rounded-full hover:bg-slate-200/80 flex items-center justify-center text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 divide-y divide-slate-100">
              {cartItems.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-10 h-10 stroke-1" />
                  </div>
                  <h4 className="font-black text-slate-900 text-lg">Your cart is empty</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Add delicious hot meals from Ambikapur restaurants to build your order!
                  </p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="pt-3.5 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <div
                          className={`w-3.5 h-3.5 border-2 flex items-center justify-center ${
                            item.isVeg ? "border-emerald-600" : "border-rose-600"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.isVeg ? "bg-emerald-600" : "bg-rose-600"
                            }`}
                          />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">{item.name}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">{item.restaurantName}</p>
                        <span className="text-xs font-bold text-slate-700 mt-0.5 block">₹{item.price}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="text-slate-500 hover:text-orange-600 font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-slate-800 w-3 text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="text-slate-500 hover:text-orange-600 font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs font-black text-slate-900 w-12 text-right">
                        ₹{item.price * item.qty}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bill Details & Payment */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-slate-100 bg-slate-50/80 space-y-4">
                
                {/* Bill Breakdown */}
                <div className="space-y-2 text-xs font-medium text-slate-600">
                  <div className="flex justify-between">
                    <span>Item Total</span>
                    <span className="font-bold text-slate-900">₹{itemTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      Delivery Fee <span className="text-[10px] text-orange-600 font-bold">(0-2 km)</span>
                    </span>
                    <span className="font-bold text-slate-900">₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee</span>
                    <span className="font-bold text-slate-900">₹{platformFee}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-black text-slate-900">
                    <span>To Pay</span>
                    <span className="text-orange-600">₹{grandTotal}</span>
                  </div>
                </div>

                {/* Delivery Location Selector */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                  <div className="text-xs flex-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 font-bold">Delivery Location</strong>
                      <span className="text-orange-600 text-[11px] font-bold cursor-pointer hover:underline">Change</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5 leading-tight">
                      Ward 15, Near Gandhi Chowk, Ambikapur
                    </p>
                  </div>
                </div>

                {/* Payment Option Switcher */}
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Payment Method
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaymentMethod("COD")}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition ${
                        paymentMethod === "COD"
                          ? "bg-orange-50 border-orange-500 text-orange-600 shadow-xs"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Banknote className="w-3.5 h-3.5" />
                      <span>Cash (COD)</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod("UPI")}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition ${
                        paymentMethod === "UPI"
                          ? "bg-orange-50 border-orange-500 text-orange-600 shadow-xs"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Instant UPI</span>
                    </button>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={() => setOrderPlaced(true)}
                  className="w-full bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-black py-4 px-5 rounded-2xl shadow-xl shadow-orange-600/30 flex items-center justify-between transition"
                >
                  <div className="text-left">
                    <span className="text-[10px] text-orange-200 block uppercase tracking-wider">Total</span>
                    <span className="text-base font-black">₹{grandTotal}</span>
                  </div>
                  <span className="flex items-center gap-1 font-bold text-sm">
                    Place Order Now →
                  </span>
                </button>

                {/* Guarantee Banner */}
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Ambikapur Guaranteed 30-min Delivery</span>
                </div>

              </div>
            )}

            {/* Success Overlay Modal */}
            {orderPlaced && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm p-6 flex flex-col items-center justify-center text-center z-50 animate-in fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Order Placed Successfully!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-[260px]">
                  Order #AB-9041 dispatched. Ambikapur rider will pick up your food shortly.
                </p>
                <div className="mt-6 flex flex-col gap-2 w-full max-w-[220px]">
                  <Link
                    href="/rider"
                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-black py-3 rounded-xl transition shadow-md shadow-orange-600/20"
                  >
                    View in Rider App
                  </Link>
                  <button
                    onClick={() => {
                      setOrderPlaced(false);
                      setIsCartOpen(false);
                      setCart({});
                    }}
                    className="bg-slate-100 text-slate-700 text-xs font-bold py-2.5 rounded-xl hover:bg-slate-200 transition"
                  >
                    Back to Menu
                  </button>
                </div>
              </div>
            )}

          </aside>
        </div>
      )}

      {/* Ambikapur Location Picker Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsLocationModalOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
          />
          <div className="relative bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                <h3 className="font-black text-slate-900 text-base">Select Ambikapur Area</h3>
              </div>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-2">
              {[
                { name: "Gandhi Chowk (Central)", tag: "0-2 km • Free Delivery", dist: "1.2 km" },
                { name: "Ghadi Chowk (Clock Tower)", tag: "Fast Delivery", dist: "1.8 km" },
                { name: "Ring Road East (Transport Nagar)", tag: "Standard Delivery", dist: "3.2 km" },
                { name: "Kedarpur Residential Zone", tag: "Standard Delivery", dist: "2.5 km" },
                { name: "Sadhar Hospital Road", tag: "Fast Delivery", dist: "1.0 km" },
                { name: "Mahamaya Temple Road", tag: "Extended Zone", dist: "3.8 km" },
              ].map((loc, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setSelectedLocation(loc.name);
                    setIsLocationModalOpen(false);
                  }}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    selectedLocation.includes(loc.name.split(" ")[0])
                      ? "bg-orange-50 border-orange-500 shadow-xs"
                      : "bg-slate-50 border-slate-100 hover:bg-slate-100/80 hover:border-slate-200"
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{loc.name}</h4>
                    <span className="text-[10px] text-orange-600 font-bold">{loc.tag}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">{loc.dist}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsLocationModalOpen(false)}
              className="w-full bg-slate-900 hover:bg-black text-white font-black text-xs py-3.5 rounded-2xl transition"
            >
              Confirm Location
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 text-center text-xs text-slate-400 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-orange-600 text-white font-black text-xs flex items-center justify-center">
              A
            </span>
            <span className="font-bold text-slate-700">AmbiBites</span>
            <span>• Hyperlocal Food Delivery for Ambikapur City</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 font-bold">
            <Link href="/admin" className="hover:text-orange-600">Admin Control</Link>
            <Link href="/rider" className="hover:text-orange-600">Rider Fleet</Link>
            <Link href="/partner" className="hover:text-orange-600">Restaurant Partner</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
