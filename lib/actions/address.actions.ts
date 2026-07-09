"use server";

import { revalidatePath } from "next/cache";
import User from "@/lib/models/user.model";
import { connectToDB } from "@/lib/mongodb";
import { Address } from "@/lib/validations";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

// ----------------------------------------------------------------------
// Internal pincode validation – works for both array and object responses
// ----------------------------------------------------------------------
async function getPincodeData(pincode: string) {
  const url = `http://www.postalpincode.in/api/pincode/${pincode}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) {
      console.error(`[PINCODE] HTTP ${res.status}`);
      return { ok: false };
    }

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("[PINCODE] JSON parse error", e);
      return { ok: false };
    }

    // Normalise response to an array of results
    let results = null;
    if (Array.isArray(data) && data.length > 0) {
      results = data;
    } else if (data && typeof data === "object" && data.Status) {
      results = [data];
    } else {
      console.error("[PINCODE] Unexpected shape", data);
      return { ok: false };
    }

    const firstResult = results[0];
    if (firstResult.Status !== "Success") {
      console.error("[PINCODE] Status not Success");
      return { ok: false };
    }

    const postOffices = firstResult.PostOffice;
    if (!postOffices || postOffices.length === 0) {
      console.error("[PINCODE] No PostOffice array");
      return { ok: false };
    }

    const po = postOffices[0];
    return {
      ok: true,
      state: po.State,
      district: po.District,
      city: po.Region,
    };
  } catch (err) {
    console.error("[PINCODE] Fetch exception:", err);
    return { ok: false };
  }
}

// ----------------------------------------------------------------------
// ADD ADDRESS
// ----------------------------------------------------------------------
export async function addAddress(address: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, message: "Not authenticated" };
    }

    const validated = Address.parse(address);

    const location = await getPincodeData(validated.pincode);
    if (!location.ok) {
      return { success: false, message: "Invalid or unrecognized pincode" };
    }

    // Optional: state mismatch check on backend
    if (validated.state.toLowerCase() !== location.state.toLowerCase()) {
      return {
        success: false,
        message: `State mismatch: "${validated.state}" does not match pincode's state "${location.state}"`,
      };
    }

    const finalAddress = {
      ...validated,
      state: location.state,        // use official state
      locality: location.city,
    };

    // After getting location
if (validated.state.toLowerCase() !== location.state.toLowerCase()) {
  return {
    success: false,
    message: `State mismatch: "${validated.state}" does not match pincode's state "${location.state}"`,
  };
}

// Add district check (if the user provided a district)
if (validated.district && validated.district.toLowerCase() !== location.district.toLowerCase()) {
  return {
    success: false,
    message: `District mismatch: "${validated.district}" does not match pincode's district "${location.district}"`,
  };
}

    await connectToDB();

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { $push: { addresses: finalAddress } },
      { new: true }
    );

    if (!user) {
      return { success: false, message: "User not found" };
    }

    revalidatePath("/profile");

    return {
      success: true,
      addresses: user.addresses.map((a: any) => ({
        ...a.toObject(),
        _id: a._id.toString(),
      })),
    };
  } catch (error: any) {
    console.error("Add address error:", error);
    return { success: false, message: error.message || "Failed to add address" };
  }
}

// ----------------------------------------------------------------------
// UPDATE ADDRESS
// ----------------------------------------------------------------------
export async function updateAddress(addressId: string, address: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, message: "Not authenticated" };
    }

    let validated;
    try {
      validated = Address.parse(address);
    } catch (zodError: any) {
      console.error("Zod validation error:", zodError);
      return {
        success: false,
        message: `Validation error: ${zodError.errors?.map((e: any) => e.message).join(", ") || "Invalid address data"}`,
      };
    }

    const location = await getPincodeData(validated.pincode);
    if (!location.ok) {
      return { success: false, message: `Invalid or unrecognized pincode: ${validated.pincode}` };
    }

    // State mismatch check on backend
    if (validated.state.toLowerCase() !== location.state.toLowerCase()) {
      return {
        success: false,
        message: `State mismatch: "${validated.state}" does not match pincode's state "${location.state}"`,
      };
    }

    const finalAddress = {
      ...validated,
      state: location.state,
      locality: location.city,
    };

    await connectToDB();

    const user = await User.findOneAndUpdate(
      {
        email: session.user.email,
        "addresses._id": addressId,
      },
      { $set: { "addresses.$": finalAddress } },
      { new: true }
    );

    if (!user) {
      return { success: false, message: "Address not found or does not belong to this user" };
    }

    revalidatePath("/profile");

    return {
      success: true,
      addresses: user.addresses.map((a: any) => ({
        ...a.toObject(),
        _id: a._id.toString(),
      })),
    };
  } catch (error: any) {
    console.error("Unexpected error in updateAddress:", error);
    return {
      success: false,
      message: error.message || "Unknown server error",
    };
  }
}

// ----------------------------------------------------------------------
// DELETE ADDRESS
// ----------------------------------------------------------------------
export async function deleteAddress(addressId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, message: "Not authenticated" };
    }

    await connectToDB();

    await User.findOneAndUpdate(
      { email: session.user.email },
      { $pull: { addresses: { _id: addressId } } }
    );

    revalidatePath("/profile");

    return { success: true };
  } catch (error) {
    console.error("Delete address error:", error);
    return { success: false, message: "Failed to delete address" };
  }
}