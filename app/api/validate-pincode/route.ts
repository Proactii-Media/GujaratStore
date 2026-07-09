import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pincode = searchParams.get('pincode');

  if (!pincode || !/^[1-9][0-9]{5}$/.test(pincode)) {
    return NextResponse.json({ error: 'Invalid pincode' }, { status: 400 });
  }

  try {

    const response = await fetch(`http://www.postalpincode.in/api/pincode/${pincode}`);
    const data = await response.json();

    console.log('API response:', JSON.stringify(data, null, 2));


    if (data && data.Status === 'Success' && data.PostOffice?.length) {
      const state = data.PostOffice[0].State;
      return NextResponse.json({ success: true, state });
    } else {
      return NextResponse.json({ error: 'Pincode not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}