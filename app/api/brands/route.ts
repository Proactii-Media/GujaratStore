import { NextRequest, NextResponse } from "next/server";
import Brand from "@/lib/models/brand.model";
import { connectToDB } from "@/lib/mongodb";
import { withAdminOrVendorAuth } from "@/lib/middleware/auth";

export const GET = withAdminOrVendorAuth(async (request: NextRequest) => {
  try {
    await connectToDB();

    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "asc";

    const skip = (page - 1) * limit;

    const query = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    const brands = await Brand.find(query)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit);

    const total = await Brand.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: brands,
      pagination: {
        page,
        limit,
        total,
      },
    });
  } catch (error) {
    console.error("API Error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
});