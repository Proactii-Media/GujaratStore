import { NextResponse, NextRequest } from "next/server";
import crypto from "crypto";
import { updateOrderFromWebhook } from "@/lib/handlers/shiprocket-order.handler";

export async function POST(request: NextRequest) {
  const raw = await request.text();

  // signature verify
  const secret = process.env.SHIPROCKET_WEBHOOK_SECRET;

  if (secret) {
    const hmac = crypto.createHmac("sha256", secret).update(raw).digest("hex");
    const signature = request.headers.get("x-shiprocket-signature");

    if (signature !== hmac) {
      return NextResponse.json({ success: false }, { status: 401 });
    }
  }

  const payload = JSON.parse(raw);

  const result = await updateOrderFromWebhook(payload);

  return NextResponse.json({ success: true });
}