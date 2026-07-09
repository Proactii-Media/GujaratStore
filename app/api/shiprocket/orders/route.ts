import { NextResponse, NextRequest } from "next/server";
import shiprocket from '@/lib/shiprocket/backend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward to Shiprocket create order adhoc endpoint
    const resp = await shiprocket.shiprocketRequest('/v1/external/orders/create/adhoc', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    // Shiprocket returns object with order_id/shipment_id/awb etc under resp
    return NextResponse.json({ success: true, data: resp });
  } catch (error) {
    console.error('[Shiprocket Orders] Create failed', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Order creation failed' }, { status: 500 });
  }
}
