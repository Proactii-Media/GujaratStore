// app/api/testimonials/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import  Testimonial  from "@/lib/models/testimonial";


export async function GET(request: NextRequest) {
  try {
    await connectToDB();
    
    const searchParams = request.nextUrl.searchParams;

    // Get pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const rating = searchParams.get("rating"); // Optional: filter by rating
    const isAdmin = searchParams.get("admin") === "true"; // Admin flag to show all testimonials

    // Build query filter
    let filter: any = isAdmin ? {} : { isApproved: true }; // Show all for admin, only approved for public
    
    if (search) {
      filter.$or = [
        { author: { $regex: search, $options: "i" } },
        { quote: { $regex: search, $options: "i" } },
        { productType: { $regex: search, $options: "i" } }
      ];
    }
    
    if (rating) {
      filter.rating = parseInt(rating);
    }


    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries in parallel
    const [testimonials, total] = await Promise.all([
      Testimonial.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Testimonial.countDocuments(filter)
    ]);

    // Transform data for response
    const transformedTestimonials = testimonials.map(t => ({
      id: t._id.toString(),
      imageId: t.imageId,
     author : t.author,
        position : t.position,
        quote : t.quote,
        productType : t.productType,
        rating : t.rating,
      isApproved: t.isApproved,
      createdAt: t.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: transformedTestimonials,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error in GET testimonials:", error);
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
    
    // Validate required fields
    const requiredFields = ['author', 'position', 'quote', 'productType', 'imageId'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Validate rating range
    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }
    
    // Create testimonial (pending approval)
    const testimonial = await Testimonial.create({
      imageId: body.imageId,
      author: body.author,
      position: body.position,
      quote: body.quote,
      productType: body.productType,
      rating: body.rating,
      review: body.review,
      isApproved: true 
    });
    
    return NextResponse.json({
      success: true,
      data: {
        id: testimonial._id.toString(),
       imageId: testimonial.imageId,
       author : testimonial.author,
        position : testimonial.position,
        quote : testimonial.quote,
        rating : testimonial.rating,
        review: testimonial.review,
        productType : testimonial.productType,
        isApproved: testimonial.isApproved,
        createdAt: testimonial.createdAt,
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error in POST testimonial:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}