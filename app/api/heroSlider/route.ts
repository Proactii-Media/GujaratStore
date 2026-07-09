// app/api/heroSlider/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import HeroSlider from "@/lib/models/heroSlider";

export async function GET(request: NextRequest) {
  try {
    await connectToDB();
    
    const searchParams = request.nextUrl.searchParams;

    // Get pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const isAdmin = searchParams.get("admin") === "true";

    // Build query filter
    let filter: any = isAdmin ? {} : { isApproved: true };
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { boldtitle: { $regex: search, $options: "i" } },
        { gujratititle: { $regex: search, $options: "i" } }
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries in parallel
    const [heroSlides, total] = await Promise.all([
      HeroSlider.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      HeroSlider.countDocuments(filter)
    ]);

    // Transform data for response
    const transformedHeroSlides = heroSlides.map(s => ({
      id: s._id.toString(),
      imageId: s.imageId,
      title: s.title,
      boldtitle: s.boldtitle,
      gujratititle: s.gujratititle,
      isApproved: s.isApproved,  
      createdAt: s.createdAt      
    }));

    return NextResponse.json({
      success: true,
      data: transformedHeroSlides,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error in GET hero slides:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}
  
export async function POST(request: NextRequest) {
  try {
    await connectToDB();
    
    const body = await request.json();
    

    const requiredFields = ['title', 'boldtitle', 'gujratititle', 'imageId'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Create hero slider entry
    const heroSlider = await HeroSlider.create({
      imageId: body.imageId,
      title: body.title,
      boldtitle: body.boldtitle,
      gujratititle: body.gujratititle,
      isApproved: true 
    });
    
    return NextResponse.json({
      success: true,
      data: {
        id: heroSlider._id.toString(),
        imageId: heroSlider.imageId,
        title: heroSlider.title,
        boldtitle: heroSlider.boldtitle,
        gujratititle: heroSlider.gujratititle,
        isApproved: heroSlider.isApproved,
        createdAt: heroSlider.createdAt,
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error in POST hero slider:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}