import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { sendCampaignEmails } from "@/services/campaign.service";

export async function GET() {
  try {

    await connectToDB();

    const result = await sendCampaignEmails();

    console.log("RESULT:", result);

    // return NextResponse.json(result);

     return Response.json({
    success: true,
    message: "Campaign disabled",
  });
  } catch (error) {
  
    console.log("ROUTE ERROR:", error);
    return NextResponse.json({
      success: false,
      error: String(error),
    });
  }
}








