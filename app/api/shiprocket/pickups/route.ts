import { NextResponse, NextRequest } from "next/server";
import shiprocket from '@/lib/shiprocket/backend';

export async function GET() {
  try {
    const resp = await shiprocket.shiprocketRequest('/v1/external/settings/company/list', { method: 'GET' });
    return NextResponse.json({ success: true, data: resp });
  } catch (error) {
    console.error('[Shiprocket Pickups] List failed', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Failed to list pickups' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const resp = await shiprocket.shiprocketRequest('/v1/external/settings/company/add', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return NextResponse.json({ success: true, data: resp });
  } catch (error) {
    console.error('[Shiprocket Pickups] Create failed', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Failed to create pickup' }, { status: 500 });
  }
}
