import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import HeroSchema from "@/lib/models/heroSlider";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

// ================= GET =================

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectToDB();

    const { id } = await params;

    const result = await HeroSchema.findById(id);

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Hero not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: result },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 }
    );
  }
}

// ================= PUT =================

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectToDB();

    const { id } = await params;
    const body = await request.json();

    const updated = await HeroSchema.findByIdAndUpdate(
      id,
      body,
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "HeroSlider not found" },
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
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectToDB();

    const { id } = await params;

    const heroSlider = await HeroSchema.findById(id);

    if (!heroSlider) {
      return NextResponse.json(
        { success: false, error: "HeroSlider not found" },
        { status: 404 }
      );
    }

    const updated = await HeroSchema.findByIdAndUpdate(
      id,
      { isApproved: !heroSlider.isApproved },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: updated,
      message: `isApproved toggled to ${updated?.isApproved}`,
    });
  } catch (error) {
    console.error("DELETE ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Update failed" },
      { status: 500 }
    );
  }
}