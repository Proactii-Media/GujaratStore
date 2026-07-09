import { NextResponse, NextRequest } from "next/server";
import shiprocket from "@/lib/shiprocket/backend";

type RouteParams = {
  params: Promise<{
    awb: string;
  }>;
};

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { awb } = await params;

    const resp = await shiprocket.shiprocketRequest(
      `/v1/external/courier/track/awb/${encodeURIComponent(awb)}`,
      { method: "GET" }
    );

    return NextResponse.json({
      success: true,
      data: resp,
    });
  } catch (error) {
    console.error("[Shiprocket Tracking] Order lookup failed", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Tracking failed",
      },
      { status: 500 }
    );
  }
}