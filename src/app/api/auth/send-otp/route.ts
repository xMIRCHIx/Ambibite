import { NextResponse } from "next/server";
import { storeOtp } from "@/lib/otpStore";
import { sendOtpEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body.email?.trim().toLowerCase();
    const name = body.name?.trim() || "Foodie";
    const role = body.role || "customer";

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in OTP cache
    storeOtp(email, otp);

    const roleTitleMap: Record<string, string> = {
      customer: "Customer Account Verification",
      partner: "Restaurant Partner Registration",
      rider: "Rider Fleet Onboarding",
      admin: "Admin Access Verification",
    };

    const roleTitle = roleTitleMap[role] || "Account Verification";

    // Send email via Brevo
    const emailRes = await sendOtpEmail(email, name, otp, roleTitle);

    if (!emailRes.success) {
      return NextResponse.json(
        {
          success: false,
          error: emailRes.error || "Failed to dispatch email via Brevo. Please check API key.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${email}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process OTP request" },
      { status: 500 }
    );
  }
}
