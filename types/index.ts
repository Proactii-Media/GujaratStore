import { Address } from "@/lib/validations";
import { Document, Schema, Types } from "mongoose";
import { Control } from "react-hook-form";
import { z } from "zod";

export interface IBlog {
  _id: String;
  vendorId: string;
  imageId: string;
  user: string;
  date: string;
  heading: string;
  description: string;
  category: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdminBlog extends Document {
  _id: Types.ObjectId;
  imageId: string;
  user: string;
  date: string;
  heading: string;
  description: string;
  category: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminTransformedBlog {
  id: string;
  imageId: string;
  user: string;
  date: string;
  heading: string;
  description: string;
  category: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

type DeliveryAddress = z.infer<typeof Address>;

export interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  editingAddress: DeliveryAddress | null;
  onSubmit: (data: DeliveryAddress) => Promise<void>;
}

export interface IPriceCalculatorProps {
  control: Control<IProduct>;
}

export interface IReferral {
  _id: string;
  name: string;
  description?: string;
  code: string;
  rewardPoints: number;
  vendorId: Schema.Types.ObjectId;
  expiryDate: Date | string;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IAdminReferral {
  _id: string;
  name: string;
  description?: string;
  code: string;
  discountType: "percentage" | "amount";
  discountValue: number;
  parentCategory: {
    _id: string;
    name: string;
    isActive: boolean;
  };
  expiryDate: Date | string;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}



// Pagination Types (if not already defined)
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationInfo;
  error?: string;
}


export interface IHeroSlider {
  _id: Types.ObjectId;
  imageId: string;
  title: string;
  boldtitle: string;
  gujratititle: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHeroSliderInput {
  imageId: string;
  title: string;
  boldtitle: string;
  gujratititle: string;
  isApproved?: boolean;
}

export interface TransformedHeroslider {
  _id: string;
  imageId: string;
  title: string;
  boldtitle: string;
  gujratititle: string;
  isApproved: boolean;
  createdAt?: string;
}



// Testimonial Types
export interface ITestimonial {
  _id?: Types.ObjectId;
  name: string;
  product: string;
  rating: number;
  review: string;
  category: string;
  isApproved: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}


export interface TransformedTestimonial {
  _id: string;
  author: string;
  position?: string;
  quote: string;
  productType: string;
  rating: number;
  imageId?: string;
  isApproved: boolean;
  createdAt?: string;
}