// app/api/testimonials/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Testimonial from "@/lib/models/testimonial";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

// ================= GET BY ID =================
export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectToDB();

    const { id } = await params;

    const testimonial = await Testimonial.findById(id).lean();

    if (!testimonial) {
      return NextResponse.json(
        { success: false, error: "Testimonial not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: testimonial._id.toString(),
        imageId: testimonial.imageId,
        author: testimonial.author,
        position: testimonial.position,
        quote: testimonial.quote,
        productType: testimonial.productType,
        rating: testimonial.rating,
        review: testimonial.review,
        isApproved: testimonial.isApproved,
        createdAt: testimonial.createdAt,
      },
    });
  } catch (error) {
    console.error("GET BY ID ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Invalid ID or server error" },
      { status: 500 }
    );
  }
}

// ================= UPDATE =================
export async function PUT(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectToDB();

    const { id } = await params;
    const body = await req.json();

    const updated = await Testimonial.findByIdAndUpdate(
      id,
      body,
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Testimonial not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Update failed" },
      { status: 500 }
    );
  }
}

// ================= DELETE =================
export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectToDB();

    const { id } = await params;

    const deleted = await Testimonial.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Testimonial not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Delete failed" },
      { status: 500 }
    );
  }
}