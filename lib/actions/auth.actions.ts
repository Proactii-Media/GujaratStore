"use server";

import { connectToDB } from "@/lib/mongodb";
import User from "@/lib/models/user.model";
import OTP from "@/lib/models/otp.model";
import { generateOTP, sendEmailOTP } from "@/lib/authlast";

type SignUpData = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "user";
  referral?: string; // Add optional referral field
};

type ActionResponse = {
  success: boolean;
  message: string;
  data?: { tempUserId?: string };
};

// * Sign Up Action
// * Sign Up Action
export async function signUp(data: SignUpData): Promise<ActionResponse> {
  try {
    await connectToDB();

    const existingUser = await User.findOne({
      $or: [{ email: data.email }, { phone: data.phone }],
    });
    if (existingUser) {
      return { success: false, message: "User already exists" };
    }

    const otp = generateOTP();

    const emailResult = await sendEmailOTP(data.email, otp);
    if (!emailResult?.success) {
      return {
        success: false,
        message: emailResult?.message || "Failed to send OTP. Please try again.",
      };
    }

    // Store OTP
    await OTP.create({ email: data.email, otp });

    // ✅ Create the user immediately (but marked unverified)
    const user = await User.create({
      ...data,
      isVerified: false,
      rewardPoints: 0,
      referral: data.referral || null,
      referralUsed: !!data.referral,
    });

    // ... handle referral increment ...

    return {
      success: true,
      message: "User created. OTP sent to email.",
      data: { tempUserId: user._id.toString() },
    };
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, message: "Internal server error" };
  }
}

// * Verify OTP Action
// * Verify OTP Action
export async function verifyOTP(email: string, otp: string): Promise<ActionResponse> {
  try {
    await connectToDB();

    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return { success: false, message: "Invalid OTP" };
    }

    // ✅ No need to check userData – user already exists
    // Update verification status
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { isVerified: true } },
      { new: true }
    );

    if (!user) {
      return { success: false, message: "User not found" };
    }

    await OTP.deleteOne({ email });

    // Send welcome email (optional)
    // ...

    return { success: true, message: "Email verified successfully" };
  } catch (error) {
    console.error("Verification error:", error);
    return { success: false, message: "Internal server error" };
  }
}

// * Resend OTP Action
export async function resendOTP(email: string): Promise<ActionResponse> {
  try {
    await connectToDB();

    const newOtp = generateOTP();

    // Use $set to update only the otp field, leaving userData untouched
    await OTP.findOneAndUpdate(
      { email },
      { $set: { otp: newOtp } },
      { upsert: true, new: true }
    );

    await sendEmailOTP(email, newOtp);

    return { success: true, message: "OTP resent successfully" };
  } catch (error) {
    console.error("Error resending OTP:", error);
    return { success: false, message: "Failed to resend OTP" };
  }
}

// * Sign Out Action
export async function signOut(): Promise<ActionResponse> {
  return {
    success: true,
    message: "Signed out successfully",
  };
}

// * Reset Password intiation
export async function initiatePasswordReset(
  email: string
): Promise<ActionResponse> {
  try {
    await connectToDB();

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return {
        success: false,
        message: "No account found with this email address",
      };
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP with expiration
    await OTP.findOneAndUpdate(
      { email },
      {
        otp,
        type: "password-reset",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
      { upsert: true, new: true }
    );

    // Send password reset email
    await sendEmailOTP(email, otp);

    return {
      success: true,
      message: "Password reset instructions sent to your email",
    };
  } catch (error) {
    console.error("Password reset initiation error:", error);
    return {
      success: false,
      message: "Failed to process password reset request",
    };
  }
}

// * Reset Password
export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string
): Promise<ActionResponse> {
  try {
    await connectToDB();

    // Verify OTP
    const otpRecord = await OTP.findOne({
      email,
      otp,
      type: "password-reset",
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return {
        success: false,
        message: "Invalid or expired reset code",
      };
    }

    // Update password
    await User.updateOne({ email }, { password: newPassword });

    // Delete used OTP
    await OTP.deleteOne({ email, type: "password-reset" });

    return {
      success: true,
      message: "Password reset successfully",
    };
  } catch (error) {
    console.error("Password reset error:", error);
    return {
      success: false,
      message: "Failed to reset password",
    };
  }
}
