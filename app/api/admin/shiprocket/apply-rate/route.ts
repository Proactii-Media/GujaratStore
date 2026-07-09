import { NextResponse, NextRequest } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Order from "@/lib/models/order.model";

const BACKEND_URL = process.env.SHIPROCKET_BACKEND_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      courierName,
      shippingRate,
      estimatedDelivery,
      rateDetails,
    } = body;

    if (!orderId || !courierName || !shippingRate) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      );
    }

    await connectToDB();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const updateData: any = {
      "shipping.preferred_courier": courierName,
      "shipping.calculated_rate": shippingRate,
      "shipping.rate_calculation_date": new Date(),
      "shipping.rate_details": rateDetails,
    };

    if (estimatedDelivery) {
      updateData["shipping.estimated_delivery"] = new Date(estimatedDelivery);
    }

    const currentDeliveryCharges = order.deliveryCharges || 0;
    const newDeliveryCharges = Math.round(shippingRate);

    if (currentDeliveryCharges !== newDeliveryCharges) {
      const difference = newDeliveryCharges - currentDeliveryCharges;
      updateData.deliveryCharges = newDeliveryCharges;
      updateData.total = order.total + difference;
    }

    await Order.findByIdAndUpdate(orderId, updateData);

    try {
      await fetch(`${BACKEND_URL}/shiprocket/apply-rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (err) {}

    return NextResponse.json({
      success: true,
      message: "Shipping rate applied successfully",
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}