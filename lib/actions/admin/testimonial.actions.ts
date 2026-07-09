/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { connectToDB } from "@/lib/mongodb";
import Testimonial from "@/lib/models/testimonial";
import { testimonialSchema } from "@/lib/validations";
import { ITestimonial, TransformedTestimonial } from "@/types";
import { Types } from "mongoose";

// Create a new testimonial
export async function createTestimonial(formData: FormData) {
  try {
    await connectToDB();

    const validatedData = testimonialSchema.parse({
      imageId: formData.get("imageId"),
      author : formData.get("author"),
      position : formData.get("position"),
      quote : formData.get("quote"),
      productType : formData.get("productType"),
      rating : parseInt(formData.get("rating") as string),
      isApproved: formData.get("isApproved") === "true" ? true : false,
    });

    const testimonial = await Testimonial.create(validatedData);
    return { success: true, data: testimonial };
  } catch (error) {
    console.error("Testimonial creation error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create testimonial" 
    };
  }
}

// Get all testimonials with pagination (for admin - shows all)
export async function getAllTestimonials(
  params: PaginationParams = {}
): Promise<PaginatedResponse<TransformedTestimonial>> {
  try {
    await connectToDB();

    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    // Build query - Admin sees ALL testimonials (no isApproved filter)
    const query: any = {};

    // Add search functionality
    if (search) {
      query.$or = [
        { author: { $regex: search, $options: "i" } },
        { quote: { $regex: search, $options: "i" } },
        { productType: { $regex: search, $options: "i" } },

      ];
    }

    // Build sort object
    const sortObject: any = {};
    sortObject[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const totalItems = await Testimonial.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    // Fetch paginated data
    const testimonials = await Testimonial.find(query)
      .sort(sortObject)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    // Transform data
    const transformedTestimonials: TransformedTestimonial[] = testimonials.map((testimonial) => ({
      _id: (testimonial._id as Types.ObjectId).toString(),
      imageId: testimonial.imageId,
      author : testimonial.author,
      position : testimonial.position,
      quote : testimonial.quote,
      productType : testimonial.productType,
      rating: testimonial.rating,

      isApproved: testimonial.isApproved,
      createdAt: testimonial.createdAt?.toString(),
    }));

    // Build pagination info
    const pagination: PaginationInfo = {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    return {
      success: true,
      data: transformedTestimonials,
      pagination,
    };
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return {
      success: false,
      error: "Failed to fetch testimonials",
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
}

// Get public testimonials (only approved ones)
export async function getPublicTestimonials(
  params: PaginationParams = {}
): Promise<PaginatedResponse<TransformedTestimonial>> {
  try {
    await connectToDB();

    const {
      page = 1,
      limit = 12,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    // Build query - Only show approved testimonials
    const query: any = { isApproved: true };

    // Add search functionality
    if (search) {
      query.$or = [
        { author: { $regex: search, $options: "i" } },
        { quote: { $regex: search, $options: "i" } },
        { productType: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sortObject: any = {};
    sortObject[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const totalItems = await Testimonial.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    // Fetch paginated data
    const testimonials = await Testimonial.find(query)
      .sort(sortObject)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    // Transform data
    const transformedTestimonials: TransformedTestimonial[] = testimonials.map((testimonial) => ({
      _id: (testimonial._id as Types.ObjectId).toString(),
      author : testimonial.author,
      position : testimonial.position,
      quote : testimonial.quote,
      imageId: testimonial.imageId,
      productType : testimonial.productType,
      rating: testimonial.rating,
      isApproved: testimonial.isApproved,
      createdAt: testimonial.createdAt?.toString(),
    }));

    // Build pagination info
    const pagination: PaginationInfo = {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    return {
      success: true,
      data: transformedTestimonials,
      pagination,
    };
  } catch (error) {
    console.error("Error fetching public testimonials:", error);
    return {
      success: false,
      error: "Failed to fetch testimonials",
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 12,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
}

// Get all testimonials without pagination (legacy)
export async function getAllTestimonialsLegacy() {
  try {
    await connectToDB();

    const testimonials = await Testimonial.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const transformedTestimonials = testimonials.map((testimonial) => ({
      id: (testimonial._id as Types.ObjectId).toString(),
      imageId: testimonial.imageId,
      author : testimonial.author,
      position : testimonial.position,
      quote : testimonial.quote,
      productType : testimonial.productType,
      rating: testimonial.rating,
      isApproved: testimonial.isApproved,
      createdAt: testimonial.createdAt,
    }));

    return {
      success: true,
      data: transformedTestimonials,
    };
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return {
      success: false,
      error: "Failed to fetch testimonials",
    };
  }
}

// Get testimonial by ID
export async function gettestimonialById(id: string): Promise<TransformedTestimonial | null> {
  try {
    await connectToDB();

    // Check if the ObjectId is valid
    if (!Types.ObjectId.isValid(id)) return null;

    // Fetch the testimonial from the database
    const testimonial = await Testimonial.findById(id).lean();

    // If the testimonial doesn't exist, return null
    if (!testimonial) return null;

    // Transform the testimonial data
    const transformedTestimonial: TransformedTestimonial = {
      _id: (testimonial._id as Types.ObjectId).toString(),
      imageId: testimonial.imageId,
      author : testimonial.author,
      position : testimonial.position,
      quote : testimonial.quote,
      productType : testimonial.productType,
      rating: testimonial.rating,
      isApproved: testimonial.isApproved,
      createdAt: testimonial.createdAt?.toString(),
    };

    return transformedTestimonial;
  } catch (error) {
    console.error("Error fetching testimonial:", error);
    return null;
  }
}

// Update a testimonial
export async function updatetestimonials(
  id: string,
  updateData: Partial<TransformedTestimonial>
) {
  try {
    await connectToDB();

    const existingTestimonial = await Testimonial.findById(id);

    if (!existingTestimonial) {
      throw new Error("Testimonial not found");
    }

    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      id,
      {
        imageId: updateData.imageId,
        author: updateData.author,
        position: updateData.position,
        quote: updateData.quote,
        productType: updateData.productType,
        rating: updateData.rating,
        isApproved: updateData.isApproved,
      },
      { new: true, lean: true }
    );

    return { success: true, data: updatedTestimonial };
  } catch (error) {
    console.error(`Failed to update testimonial with id ${id}:`, error);
    return {
      success: false,
      error: "Failed to update testimonial",
    };
  }
}

// Delete a testimonial
export async function deleteTestimonial(id: string) {
  try {
    await connectToDB();
    const deletedTestimonial = await Testimonial.findByIdAndDelete(id).lean();
    
    if (!deletedTestimonial) {
      throw new Error("Testimonial not found");
    }
    
    return { success: true, message: "Testimonial deleted successfully" };
  } catch (error) {
    console.error(`Failed to delete testimonial with id ${id}:`, error);
    return { success: false, error: "Failed to delete testimonial" };
  }
}

// Toggle approval status
export async function toggleTestimonialApproval(id: string, isApproved: boolean) {
  try {
    await connectToDB();
    
    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true, lean: true }
    );
    
    if (!updatedTestimonial) {
      throw new Error("Testimonial not found");
    }
    
    return { 
      success: true, 
      data: {
        _id: (updatedTestimonial._id as Types.ObjectId).toString(),
        isApproved: updatedTestimonial.isApproved,
      }
    };
  } catch (error) {
    console.error(`Failed to toggle testimonial approval for id ${id}:`, error);
    return { success: false, error: "Failed to update testimonial status" };
  }
}






