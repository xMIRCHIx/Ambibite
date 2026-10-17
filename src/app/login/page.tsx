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
  Mail,
  Upload,
  FileCheck,
  Check,
  Clock,
  ExternalLink,
} from "lucide-react";
import { compressImage } from "@/lib/imageCompression";

type RoleType = "customer" | "partner" | "rider" | "admin";
type AuthMode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [activeRole, setActiveRole] = useState<RoleType>("customer");

  // Login form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Common Registration states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [phone, setPhone] = useState("+91 ");

  // OTP Verification states (Brevo)
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Restaurant KYC states
  const [kitchenName, setKitchenName] = useState("");
  const [cuisine, setCuisine] = useState("North Indian, Fast Food, Snacks");
  const [area, setArea] = useState("Gandhi Chowk");
  const [address, setAddress] = useState("");
  const [fssaiNumber, setFssaiNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [panDocUrl, setPanDocUrl] = useState("");
  const [aadhaarDocUrl, setAadhaarDocUrl] = useState("");
  const [panDocStats, setPanDocStats] = useState<string | null>(null);
  const [aadhaarDocStats, setAadhaarDocStats] = useState<string | null>(null);
  const [isUploadingPan, setIsUploadingPan] = useState(false);
  const [isUploadingAadhaar, setIsUploadingAadhaar] = useState(false);

  // Rider KYC states
  const [vehicleNumber, setVehicleNumber] = useState("CG 15 ");
  const [dlNumber, setDlNumber] = useState("");
  const [dlDocUrl, setDlDocUrl] = useState("");
  const [dlDocStats, setDlDocStats] = useState<string | null>(null);
  const [isUploadingDl, setIsUploadingDl] = useState(false);

  // UI feedback states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submittedPending, setSubmittedPending] = useState<boolean>(false);

  // Check if already authenticated
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

  // Resend Countdown Timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Reset inputs when switching role or mode
  useEffect(() => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmittedPending(false);
  }, [activeRole, authMode]);

  // 1. Send OTP via Brevo
  const handleSendOtp = async () => {
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address to receive OTP.");
      return;
    }

    setIsSendingOtp(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: fullName || kitchenName || "Foodie",
          role: activeRole,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setResendCountdown(60);
        setSuccessMsg(`Verification code sent to ${email} via Brevo!`);
      } else {
        setErrorMsg(data.error || "Failed to send OTP email.");
      }
    } catch (err: any) {
      setErrorMsg("Network error sending OTP: " + err.message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length < 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsVerifyingOtp(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await res.json();
      if (data.success) {
        setIsEmailVerified(true);
        setSuccessMsg("Email verified successfully! You can now proceed.");
      } else {
        setErrorMsg(data.error || "Invalid OTP code.");
      }
    } catch (err: any) {
      setErrorMsg("Network error verifying OTP: " + err.message);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // 3. Upload & Compress Document to Cloudflare R2
  const handleCompressAndUpload = async (
    file: File,
    type: "pan" | "aadhaar" | "dl"
  ) => {
    if (type === "pan") setIsUploadingPan(true);
    else if (type === "aadhaar") setIsUploadingAadhaar(true);
    else if (type === "dl") setIsUploadingDl(true);

    setErrorMsg(null);

    try {
      // Step A: Client-Side Compression to ~150KB
      const compressed = await compressImage(file, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.8,
      });

      const statsText = `${compressed.originalSizeKb} KB ➔ ${compressed.compressedSizeKb} KB (${compressed.savedPercent}% saved)`;

      // Step B: Upload Compressed Blob to Cloudflare R2 CDN
      const fd = new FormData();
      fd.append("file", compressed.file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (data.success && data.url) {
        if (type === "pan") {
          setPanDocUrl(data.url);
          setPanDocStats(statsText);
        } else if (type === "aadhaar") {
          setAadhaarDocUrl(data.url);
          setAadhaarDocStats(statsText);
        } else if (type === "dl") {
          setDlDocUrl(data.url);
          setDlDocStats(statsText);
        }
      } else {
        setErrorMsg("Failed to upload document to Cloudflare CDN.");
      }
    } catch (err: any) {
      setErrorMsg("Document upload notice: " + err.message);
    } finally {
      if (type === "pan") setIsUploadingPan(false);
      else if (type === "aadhaar") setIsUploadingAadhaar(false);
      else if (type === "dl") setIsUploadingDl(false);
    }
  };

  // 4. Handle Registration Submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isEmailVerified) {
      setErrorMsg("Please verify your email address with OTP before submitting.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: activeRole,
          name: fullName || kitchenName || "Partner",
          email,
          password: regPassword,
          phone,
          // Restaurant Fields
          kitchenName,
          cuisine,
          area,
          address,
          fssaiNumber,
          panNumber,
          aadhaarNumber,
          panDocUrl,
          aadhaarDocUrl,
          // Rider Fields
          vehicleNumber,
          dlNumber,
          dlDocUrl,
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.status === "pending_verification") {
          setSubmittedPending(true);
        } else {
          setSuccessMsg("Account created! Redirecting to food menu...");
          setTimeout(() => router.push("/"), 800);
        }
      } else {
        setErrorMsg(data.error || "Registration failed.");
      }
    } catch (err: any) {
      setErrorMsg("Registration error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 5. Handle Login Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setErrorMsg(data.error || "Login failed. Please check your credentials.");
      }
    } catch (err: any) {
      setErrorMsg("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Logins for existing restaurants
  const quickLoginKitchen = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setLoading(true);
    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "partner", username: user, password: pass }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setSuccessMsg(`Logged in to ${d.user.restaurantName}!`);
          setTimeout(() => router.push("/partner"), 600);
        } else {
          setErrorMsg(d.error || "Failed");
          setLoading(false);
        }
      });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      {/* Top Navbar */}
      <header className="px-6 py-4 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-40">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-400 hover:text-white font-bold text-xs transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Food Store</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold text-slate-400">
            Ambikapur Identity Portal
          </span>
        </div>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl space-y-6">
          {/* Logo & Header Title */}
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <span className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-orange-600/30 group-hover:scale-105 transition">
                A
              </span>
              <div className="text-left">
                <span className="text-2xl font-black tracking-tight text-white block">
                  AmbiBites
                </span>
                <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest block leading-none">
                  Ambikapur Express
                </span>
              </div>
            </Link>

            <h2 className="text-xl sm:text-2xl font-black text-white pt-2">
              {authMode === "login"
                ? "Welcome back to AmbiBites"
                : "Create Your Account & Get Started"}
            </h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {authMode === "login"
                ? "Access your food orders, restaurant kitchen POS, or rider fleet dashboard."
                : "Register with your verified email and submit KYC to start operating in Ambikapur."}
            </p>
          </div>

          {/* Mode Switcher: Login vs Register */}
          <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setAuthMode("login")}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                authMode === "login"
                  ? "bg-orange-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In (Login)
            </button>
            <button
              onClick={() => setAuthMode("register")}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                authMode === "register"
                  ? "bg-orange-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Register New Account (KYC)
            </button>
          </div>

          {/* Role Picker Pills */}
          <div className="grid grid-cols-4 gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
            {[
              { id: "customer", label: "Customer", icon: User },
              { id: "partner", label: "Restaurant", icon: Store },
              { id: "rider", label: "Rider", icon: Bike },
              { id: "admin", label: "Admin", icon: ShieldCheck },
            ].map((role) => {
              const Icon = role.icon;
              const isSelected = activeRole === role.id;
              // Admin cannot self-register
              if (authMode === "register" && role.id === "admin") return null;

              return (
                <button
                  key={role.id}
                  onClick={() => setActiveRole(role.id as RoleType)}
                  className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl transition cursor-pointer ${
                    isSelected
                      ? "bg-slate-800 text-white border border-orange-500/50 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isSelected ? "text-orange-400" : "text-slate-500"
                    }`}
                  />
                  <span className="text-[11px] font-bold">{role.label}</span>
                </button>
              );
            })}
          </div>

          {/* Card Wrapper */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            {/* Feedback Notifications */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* PENDING APPROVAL SUBMITTED SCREEN */}
            {submittedPending ? (
              <div className="text-center py-6 space-y-5 animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 animate-pulse" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-white">
                    Application Submitted for Verification!
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong>{fullName || kitchenName}</strong>! Your
                    KYC documents and credentials have been submitted to the{" "}
                    <strong>AmbiBites Ambikapur Admin Team</strong>.
                  </p>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Role Applied:</span>
                    <strong className="text-white uppercase font-black">
                      {activeRole === "partner" ? "Restaurant Partner" : "Fleet Delivery Rider"}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Verification Status:</span>
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Under Review (2-4 hrs)
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Email Updates:</span>
                    <span className="text-white font-mono">{email}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  You will receive a confirmation email via Brevo once your
                  account is approved. You can then log in and start receiving orders.
                </p>

                <button
                  onClick={() => {
                    setSubmittedPending(false);
                    setAuthMode("login");
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-black text-xs px-6 py-3 rounded-2xl shadow-lg transition"
                >
                  Return to Sign In Screen
                </button>
              </div>
            ) : authMode === "login" ? (
              /* ================== LOGIN FORM ================== */
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    {activeRole === "customer"
                      ? "Email or Mobile Number"
                      : activeRole === "partner"
                      ? "Kitchen Email or Username"
                      : activeRole === "rider"
                      ? "Rider Email or Username"
                      : "Admin Username / Email"}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder={
                        activeRole === "partner"
                          ? "royal@ambibite.com"
                          : activeRole === "rider"
                          ? "rider@ambibite.com"
                          : "user@example.com"
                      }
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        alert(
                          "To reset your password, please register with your verified email or contact Ambikapur Admin."
                        )
                      }
                      className="text-[10px] text-orange-400 hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-black text-xs py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating in Ambikapur Grid...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In as {activeRole.toUpperCase()}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Quick Demo Kitchen Logins */}
                {activeRole === "partner" && (
                  <div className="pt-4 border-t border-slate-800/80 space-y-2">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      Quick Demo Kitchen Credentials:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => quickLoginKitchen("royal", "royal123")}
                        className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-orange-500/50 text-left"
                      >
                        <strong className="text-white block">The Royal Kitchen</strong>
                        <span className="text-slate-500 text-[10px]">royal / royal123</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => quickLoginKitchen("burger", "burger123")}
                        className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-orange-500/50 text-left"
                      >
                        <strong className="text-white block">Burger Hub & Cafe</strong>
                        <span className="text-slate-500 text-[10px]">burger / burger123</span>
                      </button>
                    </div>
                  </div>
                )}
              </form>
            ) : (
              /* ================== REGISTRATION & KYC FORM ================== */
              <form onSubmit={handleRegister} className="space-y-5">
                {/* Step 1: Basic Info */}
                <div className="space-y-3.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-orange-400 flex items-center gap-1.5 border-b border-slate-800 pb-1">
                    <span>1. Basic Profile & Identity</span>
                  </h4>

                  {activeRole === "partner" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">
                          Restaurant / Cafe Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Royal Sweets & Cafe"
                          value={kitchenName}
                          onChange={(e) => setKitchenName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">
                          Owner / Partner Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Agrawal"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Full Legal Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 outline-none"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98261 44551"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Create Password (min 6 chars) *
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 outline-none"
                      />
                    </div>
                  </div>

                  {activeRole === "partner" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">
                          Ambikapur Area *
                        </label>
                        <select
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 outline-none"
                        >
                          <option>Gandhi Chowk</option>
                          <option>Ghadi Chowk</option>
                          <option>Ring Road East</option>
                          <option>Kedarpur</option>
                          <option>Sadhar Hospital Road</option>
                          <option>Main Market</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">
                          Primary Cuisines
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. North Indian, Biryani"
                          value={cuisine}
                          onChange={(e) => setCuisine(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {activeRole === "rider" && (
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">
                        Vehicle Details & Plate Number *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Hero Splendor (CG 15 AB 1002)"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Step 2: Email OTP Verification (Brevo) */}
                <div className="space-y-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span>2. Email OTP Verification (Brevo API)</span>
                    </h4>
                    {isEmailVerified && (
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      disabled={isEmailVerified}
                      placeholder="Enter email e.g. you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-orange-500 outline-none disabled:opacity-60"
                    />
                    <button
                      type="button"
                      disabled={isSendingOtp || isEmailVerified || resendCountdown > 0}
                      onClick={handleSendOtp}
                      className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-[11px] px-3.5 py-2 rounded-xl transition shrink-0"
                    >
                      {isSendingOtp
                        ? "Sending..."
                        : resendCountdown > 0
                        ? `Resend in ${resendCountdown}s`
                        : "Send OTP"}
                    </button>
                  </div>

                  {otpSent && !isEmailVerified && (
                    <div className="flex items-center gap-2 pt-2 animate-in fade-in">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit OTP"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-36 bg-slate-900 border border-orange-500/60 rounded-xl px-3 py-2 text-xs text-white text-center font-mono tracking-widest outline-none"
                      />
                      <button
                        type="button"
                        disabled={isVerifyingOtp}
                        onClick={handleVerifyOtp}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
                      >
                        {isVerifyingOtp ? "Verifying..." : "Verify Code"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Step 3: KYC Documents (Only for Restaurant & Rider) */}
                {(activeRole === "partner" || activeRole === "rider") && (
                  <div className="space-y-4 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>3. KYC Documents (Compressed for Cloudflare R2)</span>
                      </h4>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        Max ~200KB auto-compression
                      </span>
                    </div>

                    {/* Restaurant Partner Docs */}
                    {activeRole === "partner" && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">
                              FSSAI License No.
                            </label>
                            <input
                              type="text"
                              placeholder="14-digit FSSAI Number"
                              value={fssaiNumber}
                              onChange={(e) => setFssaiNumber(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">
                              PAN Card Number
                            </label>
                            <input
                              type="text"
                              placeholder="ABCDE1234F"
                              value={panNumber}
                              onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none uppercase"
                            />
                          </div>
                        </div>

                        {/* PAN Photo Upload */}
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-white block">
                              PAN Card Photo
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {panDocStats || "JPG, PNG (Auto-compressed to ~150KB)"}
                            </span>
                          </div>
                          <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl border border-slate-700 inline-flex items-center gap-1.5 transition">
                            <Upload className="w-3 h-3 text-orange-400" />
                            <span>
                              {isUploadingPan
                                ? "Compressing & Uploading..."
                                : panDocUrl
                                ? "Uploaded ✓"
                                : "Upload Photo"}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleCompressAndUpload(f, "pan");
                              }}
                            />
                          </label>
                        </div>

                        {/* Aadhaar Photo Upload */}
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-white block">
                              Aadhaar Card Photo
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {aadhaarDocStats || "JPG, PNG (Auto-compressed to ~150KB)"}
                            </span>
                          </div>
                          <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl border border-slate-700 inline-flex items-center gap-1.5 transition">
                            <Upload className="w-3 h-3 text-orange-400" />
                            <span>
                              {isUploadingAadhaar
                                ? "Compressing & Uploading..."
                                : aadhaarDocUrl
                                ? "Uploaded ✓"
                                : "Upload Photo"}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleCompressAndUpload(f, "aadhaar");
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Rider Docs */}
                    {activeRole === "rider" && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">
                              Driving License (DL) Number
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. CG-15-2022001122"
                              value={dlNumber}
                              onChange={(e) => setDlNumber(e.target.value.toUpperCase())}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none uppercase"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">
                              Aadhaar Number
                            </label>
                            <input
                              type="text"
                              maxLength={12}
                              placeholder="12-digit Aadhaar Number"
                              value={aadhaarNumber}
                              onChange={(e) => setAadhaarNumber(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                            />
                          </div>
                        </div>

                        {/* DL Photo Upload */}
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-white block">
                              Driving License Photo
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {dlDocStats || "JPG, PNG (Auto-compressed to ~150KB)"}
                            </span>
                          </div>
                          <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl border border-slate-700 inline-flex items-center gap-1.5 transition">
                            <Upload className="w-3 h-3 text-orange-400" />
                            <span>
                              {isUploadingDl
                                ? "Compressing & Uploading..."
                                : dlDocUrl
                                ? "Uploaded ✓"
                                : "Upload Photo"}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleCompressAndUpload(f, "dl");
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Register Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-black text-xs py-3.5 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Registration to Ambikapur Admin...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {activeRole === "customer"
                          ? "Complete Registration & Start Ordering"
                          : `Submit ${activeRole.toUpperCase()} Application for Admin Approval`}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-900">
        © 2026 AmbiBites Technologies • Zero-Egress Cloudflare R2 & Brevo Integration • Ambikapur, Surguja (CG)
      </footer>
    </div>
  );
}
