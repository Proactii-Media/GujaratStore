/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { connectToDB } from "@/lib/mongodb";
import HeroSlider from "@/lib/models/heroSlider"; 
import { heroSliderSchema } from "@/lib/validations"; 
import {
  IHeroSlider,
  TransformedHeroslider,
  PaginationParams,
  PaginatedResponse,
  PaginationInfo
} from "@/types";
import { Types } from "mongoose";

// Create a new hero slider
export async function createHeroslider(formData: FormData) {
  try {
    await connectToDB();

    const validatedData = heroSliderSchema.parse({
      imageId: formData.get("imageId"),
      title: formData.get("title"),
      boldtitle: formData.get("boldtitle"),
      gujratititle: formData.get("gujratititle"),
      isApproved: formData.get("isApproved") === "true" ? true : false,
    });

    const heroSlider = await HeroSlider.create(validatedData);
    return { success: true, data: heroSlider };
  } catch (error) {
    console.error("Hero Slider creation error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create hero slider" 
    };
  }
}

// Get all hero sliders with pagination (for admin - shows all)
export async function getAllHerosliders(
  params: PaginationParams = {}
): Promise<PaginatedResponse<TransformedHeroslider>> {
  try {
    await connectToDB();

    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    // Build query - Admin sees ALL hero sliders
    const query: any = {};

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { boldtitle: { $regex: search, $options: "i" } },
        { gujratititle: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sortObject: any = {};
    sortObject[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const totalItems = await HeroSlider.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    // Fetch paginated data
    const heroSliders = await HeroSlider.find(query)
      .sort(sortObject)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    // Transform data
    const transformedHerosliders: TransformedHeroslider[] = heroSliders.map((heroSlider) => ({
      _id: (heroSlider._id as Types.ObjectId).toString(),
      imageId: heroSlider.imageId,
      title: heroSlider.title,
      boldtitle: heroSlider.boldtitle,
      gujratititle: heroSlider.gujratititle,
      isApproved: heroSlider.isApproved,
      createdAt: heroSlider.createdAt?.toString(),
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
      data: transformedHerosliders,
      pagination,
    };
  } catch (error) {
    console.error("Error fetching hero sliders:", error);
    return {
      success: false,
      error: "Failed to fetch hero sliders",
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

// Get public hero sliders (only approved ones)
export async function getPublicHerosliders(
  params: PaginationParams = {}
): Promise<PaginatedResponse<TransformedHeroslider>> {
  try {
    await connectToDB();

    const {
      page = 1,
      limit = 12,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    // Build query - Only show approved hero sliders
    const query: any = { isApproved: true };

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { boldtitle: { $regex: search, $options: "i" } },
        { gujratititle: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sortObject: any = {};
    sortObject[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const totalItems = await HeroSlider.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    // Fetch paginated data
    const heroSliders = await HeroSlider.find(query)
      .sort(sortObject)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    // Transform data
    const transformedHerosliders: TransformedHeroslider[] = heroSliders.map((heroSlider) => ({
      _id: (heroSlider._id as Types.ObjectId).toString(),
      imageId: heroSlider.imageId,
      title: heroSlider.title,
      boldtitle: heroSlider.boldtitle,
      gujratititle: heroSlider.gujratititle,
      isApproved: heroSlider.isApproved,
      createdAt: heroSlider.createdAt?.toString(),
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
      data: transformedHerosliders,
      pagination,
    };
  } catch (error) {
    console.error("Error fetching public hero sliders:", error);
    return {
      success: false,
      error: "Failed to fetch hero sliders",
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

// Get all hero sliders without pagination (legacy)
export async function getAllheroSliderLegacy() {
  try {
    await connectToDB();

    const heroSliders = await HeroSlider.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const transformedHerosliders = heroSliders.map((heroSlider) => ({
      id: (heroSlider._id as Types.ObjectId).toString(),
      imageId: heroSlider.imageId,
      title: heroSlider.title,
      boldtitle: heroSlider.boldtitle,
      gujratititle: heroSlider.gujratititle,
      isApproved: heroSlider.isApproved,
      createdAt: heroSlider.createdAt,
    }));

    return {
      success: true,
      data: transformedHerosliders,
    };
  } catch (error) {
    console.error("Error fetching hero sliders:", error);
    return {
      success: false,
      error: "Failed to fetch hero sliders",
    };
  }
}

// Get hero slider by ID
export async function getherosliderById(id: string): Promise<TransformedHeroslider | null> {
  try {
    await connectToDB();

    // Check if the ObjectId is valid
    if (!Types.ObjectId.isValid(id)) return null;

    // Fetch the hero slider from the database
    const heroSlider = await HeroSlider.findById(id).lean();

    // If the hero slider doesn't exist, return null
    if (!heroSlider) return null;

    // Transform the hero slider data
    const transformedHeroslider: TransformedHeroslider = {
      _id: (heroSlider._id as Types.ObjectId).toString(),
      imageId: heroSlider.imageId,
      title: heroSlider.title,
      boldtitle: heroSlider.boldtitle,
      gujratititle: heroSlider.gujratititle,
      isApproved: heroSlider.isApproved,
      createdAt: heroSlider.createdAt?.toString(),
    };

    return transformedHeroslider;
  } catch (error) {
    console.error("Error fetching hero slider:", error);
    return null;
  }
}

// Update a hero slider
export async function updateheroslider(
  id: string,
  updateData: Partial<TransformedHeroslider>
) {
  try {
    await connectToDB();

    const existingHeroslider = await HeroSlider.findById(id);

    if (!existingHeroslider) {
      throw new Error("Hero slider not found");
    }

    const updatedHeroslider = await HeroSlider.findByIdAndUpdate(
      id,
      {
        imageId: updateData.imageId,
        title: updateData.title,
        boldtitle: updateData.boldtitle,
        gujratititle: updateData.gujratititle,
        isApproved: updateData.isApproved,
      },
      { new: true, lean: true }
    );
       
    return { success: true, data: updatedHeroslider };
  } catch (error) {
    console.error(`Failed to update hero slider with id ${id}:`, error);
    return {
      success: false,
      error: "Failed to update hero slider",
    };
  }
}

// Delete a hero slider
export async function deleteHeroSlider(id: string) {
  try {
    await connectToDB();
    const deletedHeroslider = await HeroSlider.findByIdAndDelete(id).lean();
    
    if (!deletedHeroslider) {
      throw new Error("Hero slider not found");
    }
    
    return { success: true, message: "Hero slider deleted successfully" };
  } catch (error) {
    console.error(`Failed to delete hero slider with id ${id}:`, error);
    return { success: false, error: "Failed to delete hero slider" };
  }
}

// Toggle approval status
export async function toggleHeroSliderApproval(id: string, isApproved: boolean) {
  try {
    await connectToDB();
    
    const updatedHeroslider = await HeroSlider.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true, lean: true }
    );
    
    if (!updatedHeroslider) {
      throw new Error("Hero slider not found");
    }
    
    return { 
      success: true, 
      data: {
        _id: (updatedHeroslider._id as Types.ObjectId).toString(),
        isApproved: updatedHeroslider.isApproved,
      }
    };
  } catch (error) {
    console.error(`Failed to toggle hero slider approval for id ${id}:`, error);
    return { success: false, error: "Failed to update hero slider status" };
  }
}