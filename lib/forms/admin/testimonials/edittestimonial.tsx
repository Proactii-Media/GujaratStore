/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormField,
  FormMessage,
} from "@/components/ui/form";

import Loader from "@/components/Loader";
import { toast } from "@/hooks/use-toast";

import {
  gettestimonialById,
  updatetestimonials,
} from "@/lib/actions/admin/testimonial.actions";

import "quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});

// ======================
// Validation Schema
// ======================

const testimonialSchema = z.object({
  imageId: z.string().optional(),
author: z.string().min(2, "Author name is required"),
position: z.string().min(2, "Position is required"),
quote: z.string().min(10, "Quote must be at least 10 characters"),
productType: z.string().min(2, "Product type is required"),
rating: z.coerce  .number()
  .min(1, "Rating must be at least 1")
  .max(5, "Rating cannot be more than 5"),
  isApproved: z.boolean().default(true),
});

type TestimonialFormData = z.infer<typeof testimonialSchema>;

const EditTestimonial = () => {
  // ======================
  // States
  // ======================

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [postImage, setPostImage] = useState<string | null>(null);

  const [existingImageId, setExistingImageId] = useState<
    string | null
  >(null);

  const { id } = useParams();
  const router = useRouter();

  // ======================
  // Form
  // ======================

  const form = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),

    defaultValues: {
      imageId: "",
      author: "",
      position: "",
      quote : "",
      rating: 5,
      productType: "",
      isApproved: true,
    },
  });

  // ======================
  // File Upload
  // ======================

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setPostImage(URL.createObjectURL(file));

        onChange(data.fileId);
      }
    } catch (error) {
      console.error("Upload error:", error);

      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    }
  };

  // ======================
  // Submit
  // ======================

  const handleSubmit = async (
    data: TestimonialFormData
  ) => {
    setIsSubmitting(true);

    try {
      // Keep old image if new image not uploaded
      if (!data.imageId && existingImageId) {
        data.imageId = existingImageId;
      }

      const result = await updatetestimonials(
        id as string,
        data
      );

      if (result?.success) {
        toast({
          title: "Success",
          description:
            "Testimonial updated successfully.",
        });

        router.push("/admin/testimonials");
      } else {
        throw new Error(
          result?.error || "Failed to update testimonial"
        );
      }
    } catch (error) {
      console.error(error);

      toast({
        title: "Error",
        description: "Failed to update testimonial.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ======================
  // Fetch Existing Data
  // ======================

  useEffect(() => {
    const fetchTestimonial = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        const testimonial = await gettestimonialById(
          id as string
        );

        if (testimonial) {
          setExistingImageId(
            testimonial.imageId || null
          );

          // Image Preview
          if (testimonial.imageId) {
            const response = await fetch(
              `/api/files/${testimonial.imageId}`
            );

            const blob = await response.blob();

            const imageUrl = URL.createObjectURL(blob);

            setPostImage(imageUrl);
          }

          // Form Reset
          form.reset({
            // imageId: testimonial.imageId || "",
            author: testimonial.author || "",
            position: testimonial.position || "",
            quote: testimonial.quote || "",
            productType: testimonial.productType || "",
            rating: testimonial.rating || 5,
            isApproved: testimonial.isApproved ?? true,
          });
        }
      } catch (error) {
        console.error(
          "Failed to fetch testimonial:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonial();

    return () => {
      if (postImage) {
        URL.revokeObjectURL(postImage);
      }
    };
  }, [id, form]);

  // ======================
  // Loader
  // ======================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  // ======================
  // UI
  // ======================

  return (
    <section className="sm:px-5 md:px-1 lg:px-2">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          {/* Image + Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <FormField
              control={form.control}
              name="imageId"
              render={({ field: { onChange,...field } }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>

                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(
                          e,
                          onChange
                        )
                      }
                    />
                  </FormControl>

                  {postImage && (
                    <div className="relative w-full h-[220px] mt-2">
                      <Image
                        src={postImage}
                        alt="Preview"
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">

              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Author Name"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

                 </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Position"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Type</FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Product Type"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              </div>


              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        max={5}
                        placeholder="Rating"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>

                    <div className="w-full mt-4">
                      <FormField
                        control={form.control}
                        name="quote"
                        render={({ field: { onChange, value, ...field } }) => (
                          <FormItem>
                            <FormLabel>Quote</FormLabel>
                            <FormControl>
                              <ReactQuill
                                {...field}
                                theme="snow"
                                value={value || ""}
                                onChange={onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
       

   

          {/* Buttons */}
          <div className="flex gap-2 mt-6">

            <Button
              type="submit"
              className="primary-btn"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Updating..."
                : "Update Testimonial"}
            </Button>

            <Button variant="outline" asChild>
              <Link href="/admin/testimonials">
                Cancel
              </Link>
            </Button>

          </div>
        </form>
      </Form>
    </section>
  );
};

export default EditTestimonial;