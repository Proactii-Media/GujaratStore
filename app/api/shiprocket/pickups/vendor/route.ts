import { NextResponse, NextRequest } from "next/server";
import shiprocket from '@/lib/shiprocket/backend';

export async function POST(request: NextRequest) {
  try {
    const vendor = await request.json();

    // Build pickup address payload from vendor object
    const address = (vendor.store && (vendor.store.addresses?.[0] || vendor.store.address)) || vendor.store?.addresses || null;
    const payload = {
      pickup_location: vendor.shiprocket_pickup_location || vendor.name || `Vendor_${vendor._id}`,
      name: vendor.name || vendor.store?.storeName || 'Vendor',
      email: vendor.email || '',
      phone: (vendor.store && vendor.store.contact) || vendor.phone || '',
      address: address?.address_line_1 || address?.address || '',
      address_2: address?.address_line_2 || '',
      city: address?.city || address?.locality || '',
      state: address?.state || '',
      country: address?.country || 'India',
      pin_code: address?.pincode || address?.pin_code || address?.postal_code || '',
    };

    const resp = await shiprocket.shiprocketRequest('/v1/external/settings/company/add', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return NextResponse.json({ success: true, data: resp, location_name: payload.pickup_location });
  } catch (error) {
    console.error('[Shiprocket Pickups Vendor] Create failed', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Failed to create vendor pickup' }, { status: 500 });
  }
}
