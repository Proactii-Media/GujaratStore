import { NextResponse, NextRequest } from "next/server";
import shiprocket from '@/lib/shiprocket/backend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Expected: pickup_postcode, delivery_postcode, weight, length, breadth, height, cod, declared_value
    const payload = {
      pickup_postcode: body.pickup_postcode,
      delivery_postcode: body.delivery_postcode,
      weight: body.weight,
      cod: body.cod ? 1 : 0,
      length: body.length || 10,
      breadth: body.breadth || 10,
      height: body.height || 10,
      declared_value: body.declared_value || 0,
    };

    // Call serviceability endpoint (best-effort mapping)
    const resp = await shiprocket.shiprocketRequest('/v1/external/courier/serviceability', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    // Map Shiprocket response to frontend-friendly rates array
    const services = resp?.data || resp?.couriers || resp || [];
    const rates = (Array.isArray(services) ? services : []).map((s: any) => {
      const rate = s.cost || s.rate || s.charges || 0;
      const cod_charges = s.cod_charges || 0;
      return {
        courier_name: s.courier_name || s.name || s.courier || 'Courier',
        rate: Number(rate) || 0,
        estimated_delivery_date: s.estimated_delivery_date || s.eta || null,
        cod_charges: Number(cod_charges) || 0,
        fuel_surcharge: s.fuel_surcharge || 0,
        total_rate: Number(rate || 0) + Number(cod_charges || 0) + Number(s.fuel_surcharge || 0),
        raw: s,
      };
    });

    return NextResponse.json({ success: true, data: { rates } });
  } catch (error) {
    console.error('[Admin Shiprocket] Calculate rates failed', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Failed to calculate rates' }, { status: 500 });
  }
}
