import { NextResponse, NextRequest } from "next/server";
import shiprocket from "@/lib/shiprocket/backend";

export async function GET(req: NextRequest) {
  try {
    const token = await shiprocket.login();
    // Do not leak full token in responses in production
    const masked = token ? `${token.slice(0, 8)}...${token.slice(-8)}` : null;
    return NextResponse.json({ success: true, token: masked });
  } catch (error) {
    console.error('[Shiprocket Auth] Status check failed', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Auth failed' }, { status: 500 });
  }
}
