import { NextResponse, NextRequest } from "next/server";
import shiprocket from '@/lib/shiprocket/backend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Try to call update endpoint if available, otherwise add new
    try {
      const resp = await shiprocket.shiprocketRequest('/v1/external/settings/company/update', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return NextResponse.json({ success: true, data: resp });
    } catch (e) {
      // Fallback to add
      const resp = await shiprocket.shiprocketRequest('/v1/external/settings/company/add', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return NextResponse.json({ success: true, data: resp });
    }
  } catch (error) {
    console.error('[Shiprocket Pickups Vendor Update] failed', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Failed to update vendor pickup' }, { status: 500 });
  }
}
