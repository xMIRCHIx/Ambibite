"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Star,
  Clock,
  ShieldCheck,
  Plus,
  Minus,
  Check,
  Flame,
  Heart,
  Share2,
  Sparkles,
  ShoppingBag,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  restaurantId: string;
  restaurantName: string;
  category: string;
  price: number;
  originalPrice: number;
  isVeg: boolean;
  rating: number;
  reviewsCount: number;
  prepTime: string;
  calories: string;
  protein: string;
  description: string;
  chefNote: string;
  imageUrl: string;
  ingredients: string[];
}

const PRODUCTS_DATABASE: { [key: string]: Product } = {
  "1": {
    id: "1",
    name: "Special Chicken Dum Biryani (Handi)",
    restaurantId: "rest-1",
    restaurantName: "The Royal Kitchen",
    category: "Biryani Special",
    price: 320,
    originalPrice: 380,
    isVeg: false,
    rating: 4.8,
    reviewsCount: 420,
    prepTime: "25-30 Mins",
    calories: "650 kcal",
    protein: "38g Protein",
    description:
      "Slow cooked in traditional earthen handi using marinated tender farm chicken, premium long-grain aged Daawat basmati rice, hard-boiled egg, saffron milk and rich pure Desi ghee. Served hot with creamy cucumber boondi raita and spicy salan.",
    chefNote: "Cooked fresh every afternoon and evening over low firewood flame according to Ambikapur royal spices recipe.",
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800&auto=format&fit=crop",
    ingredients: ["Aged Basmati Rice", "Tender Farm Chicken", "Kashmiri Saffron", "Desi Ghee", "Boiled Egg", "Star Anise & Green Cardamom"],
  },
  "2": {
    id: "2",
    name: "Paneer Tikka Butter Roll",
    restaurantId: "rest-1",
    restaurantName: "The Royal Kitchen",
    category: "Rolls & Wraps",
    price: 120,
    originalPrice: 150,
    isVeg: true,
    rating: 4.6,
    reviewsCount: 180,
    prepTime: "15-20 Mins",
    calories: "420 kcal",
    protein: "18g Protein",
    description:
      "Chunks of fresh cottage cheese marinated in hung curd and red tandoori masala, charred in clay oven, wrapped tightly inside crisp butter layered flaky lachha paratha with tangy pudina chutney and crunchy onion rings.",
    chefNote: "Prepared live upon order placement to ensure paratha remains crispy and piping hot.",
    imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800&auto=format&fit=crop",
    ingredients: ["Fresh Malai Paneer", "Whole Wheat Lachha Paratha", "Mint Coriander Salsa", "Amul Butter", "Chaat Masala Spiced Onions"],
  },
  "3": {
    id: "3",
    name: "Tandoori Roasted Chicken (Half)",
    restaurantId: "rest-1",
    restaurantName: "The Royal Kitchen",
    category: "Tandoor Starters",
    price: 250,
    originalPrice: 290,
    isVeg: false,
    rating: 4.7,
    reviewsCount: 215,
    prepTime: "20-25 Mins",
    calories: "520 kcal",
    protein: "46g Protein",
    description:
      "Tender half chicken bone-in cuts soaked in overnight citrus spice brine, marinated in Kashmiri red chilli and hung yogurt, roasted over charcoal coals for that authentic smoky aroma.",
    chefNote: "Served with lemon wedges, spicy pickled onions and our signature green mint chutney.",
    imageUrl: "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?q=80&w=800&auto=format&fit=crop",
    ingredients: ["Bone-in Chicken", "Hung Curd", "Degi Mirch", "Kasuri Methi", "Charcoal Roasted Aromatics"],
  },
  "4": {
    id: "4",
    name: "Ambikapur Royal Veg Thali",
    restaurantId: "rest-1",
    restaurantName: "The Royal Kitchen",
    category: "Thali Meals",
    price: 180,
    originalPrice: 220,
    isVeg: true,
    rating: 4.5,
    reviewsCount: 190,
    prepTime: "20 Mins",
    calories: "780 kcal",
    protein: "24g Protein",
    description:
      "Grand wholesome meal combo including Paneer Butter Masala, Dal Makhani / Tadka, Seasonal Sukhi Sabzi, 4 Tawa Butter Rotis, fragrant Jeera Rice, fresh Cucumber Tomato Salad, Lemon Pickle and 1 soft Gulab Jamun.",
    chefNote: "Ambikapur's most loved complete lunch thali for over 10 years.",
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800&auto=format&fit=crop",
    ingredients: ["Paneer Gravy", "Yellow Dal Tadka", "4 Butter Rotis", "Jeera Rice", "Gulab Jamun"],
  },
  "5": {
    id: "5",
    name: "Double Cheese Crunchy Burger",
    restaurantId: "rest-2",
    restaurantName: "Burger Hub",
    category: "Burgers",
    price: 140,
    originalPrice: 170,
    isVeg: true,
    rating: 4.6,
    reviewsCount: 130,
    prepTime: "15 Mins",
    calories: "490 kcal",
    protein: "14g Protein",
    description:
      "Double layer of molten cheese slice over a super crispy spiced potato vegetable patty, topped with fresh iceberg lettuce, sliced tomatoes, gherkins and smoky chipotle mayo on toasted brioche bun.",
    chefNote: "Pair with seasoned peri peri fries and chocolate shake for the best combo.",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop",
    ingredients: ["Toasted Brioche Bun", "Crispy Herb Patty", "Dual Cheddar Slices", "Iceberg Lettuce", "Chipotle Mayo"],
  },
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = (params?.id as string) || "1";
  const product = PRODUCTS_DATABASE[productId] || PRODUCTS_DATABASE["1"];

  const [quantity, setQuantity] = useState(1);
  const [spiceLevel, setSpiceLevel] = useState<"Medium" | "Spicy" | "Extra Spicy">("Spicy");
  const [selectedAddons, setSelectedAddons] = useState<{ [name: string]: number }>({});
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);

  const addonsList = [
    { name: "Extra Pure Desi Ghee", price: 30 },
    { name: "Extra Spiced Raita", price: 25 },
    { name: "Special Mirchi Ka Salan", price: 20 },
    { name: "Extra Boiled Egg (1 Pc)", price: 15 },
  ];

  const toggleAddon = (name: string, price: number) => {
    setSelectedAddons((prev) => {
      const copy = { ...prev };
      if (copy[name]) {
        delete copy[name];
      } else {
        copy[name] = price;
      }
      return copy;
    });
  };

  const addonsTotal = Object.values(selectedAddons).reduce((a, b) => a + b, 0);
  const finalUnitPrice = product.price + addonsTotal;
  const totalPrice = finalUnitPrice * quantity;

  const handleAddToCart = () => {
    setIsAddedSuccess(true);
    setTimeout(() => {
      router.push("/");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 antialiased pb-28">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <Link
          href={`/restaurant/${product.restaurantId}`}
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-bold text-xs transition"
        >
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4" />
          </div>
          <span>Back to {product.restaurantName}</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
          >
            <ShoppingBag className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Product Showcase Card */}
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md">
          
          {/* Big Photo Banner */}
          <div className="relative h-72 sm:h-96 w-full bg-slate-100 overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

            {/* Badges on Top */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div
                className={`p-2 rounded-xl backdrop-blur-md shadow-md bg-white/95 ${
                  product.isVeg ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 border-2 flex items-center justify-center ${
                    product.isVeg ? "border-emerald-600" : "border-rose-600"
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${product.isVeg ? "bg-emerald-600" : "bg-rose-600"}`} />
                </div>
              </div>

              <span className="bg-slate-900/80 backdrop-blur-md text-white text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1 shadow">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{product.rating}</span>
                <span className="text-slate-400 font-medium">({product.reviewsCount} reviews)</span>
              </span>
            </div>

            {/* Nutrition & Prep Info on Bottom */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 text-white">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-orange-400 block">
                  {product.restaurantName}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black drop-shadow-md">
                  {product.name}
                </h1>
              </div>

              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold">
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                <span>{product.prepTime}</span>
                <span className="opacity-50">•</span>
                <span>{product.calories}</span>
              </div>
            </div>

          </div>

          {/* Pricing & Description */}
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-slate-900">₹{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-base text-slate-400 line-through font-semibold">
                      ₹{product.originalPrice}
                    </span>
                  )}
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-2 py-0.5 rounded-lg border border-emerald-200">
                    Save ₹{product.originalPrice - product.price}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold mt-1">Inclusive of all local Ambikapur taxes</p>
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center gap-3 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-2xl shadow-inner">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-lg bg-white text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center transition shadow-xs"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-base font-black text-slate-900 w-6 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-7 h-7 rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-700 flex items-center justify-center transition shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Description Paragraph */}
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">
                Dish Description
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {product.description}
              </p>
            </div>

            {/* Chef's Note Box */}
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs font-black text-amber-900 block">Chef's Heritage Note</strong>
                <p className="text-xs text-amber-800 mt-0.5 leading-snug font-medium">{product.chefNote}</p>
              </div>
            </div>

            {/* Fresh Ingredients Tags */}
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2.5">
                Key Fresh Ingredients
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200/80"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            {/* Customization 1: Spice Preference */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-slate-900">Customise Spice Level</h3>
                <span className="text-[11px] text-orange-600 font-bold uppercase">Required</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {(["Medium", "Spicy", "Extra Spicy"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setSpiceLevel(level)}
                    className={`py-3 px-3 rounded-2xl text-xs font-bold border transition flex flex-col items-center gap-1 ${
                      spiceLevel === level
                        ? "bg-orange-50 border-orange-500 text-orange-700 shadow-sm ring-1 ring-orange-500"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Flame className={`w-4 h-4 ${spiceLevel === level ? "text-orange-600" : "text-slate-400"}`} />
                    <span>{level}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Customization 2: Add-ons selection */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-slate-900">Optional Add-ons & Sides</h3>
                <span className="text-[11px] text-slate-400 font-semibold">Select multiple</span>
              </div>

              <div className="space-y-2.5">
                {addonsList.map((addon) => {
                  const isChecked = !!selectedAddons[addon.name];
                  return (
                    <div
                      key={addon.name}
                      onClick={() => toggleAddon(addon.name, addon.price)}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                        isChecked
                          ? "bg-orange-50/60 border-orange-300"
                          : "bg-white border-slate-200/80 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                            isChecked
                              ? "bg-orange-600 border-orange-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-bold text-slate-800">{addon.name}</span>
                      </div>
                      <span className="text-xs font-black text-slate-900">+₹{addon.price}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Assurance */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 text-xs text-slate-600 font-semibold">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Piping hot delivery guaranteed within 30 minutes in Ambikapur or ₹50 cashback!</span>
            </div>

          </div>

        </div>

      </main>

      {/* Floating Bottom Sticky Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
              Total ({quantity} item{quantity > 1 ? "s" : ""})
            </span>
            <span className="text-xl font-black text-slate-900">₹{totalPrice}</span>
          </div>

          <button
            onClick={handleAddToCart}
            className={`flex-1 sm:max-w-xs py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition active:scale-98 ${
              isAddedSuccess
                ? "bg-emerald-600 text-white shadow-emerald-600/30"
                : "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/30"
            }`}
          >
            {isAddedSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Added to Basket!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Basket • ₹{totalPrice}</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
