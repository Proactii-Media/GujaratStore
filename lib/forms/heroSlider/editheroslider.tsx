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
import { Switch } from "@/components/ui/switch";

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
  getherosliderById,
  updateheroslider,
} from "@/lib/actions/admin/heroSlider.actions";

// Dynamically import ReactQuill to avoid SSR issues
import "quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});

// ======================
// Validation Schema
// ======================

const heroSliderSchema = z.object({
  imageId: z.string().min(1, "Image is required"),
  title: z.string().min(2, "Title must be at least 2 characters"),
  boldtitle: z.string().min(2, "Bold title must be at least 2 characters"),
  gujratititle: z.string().min(2, "Gujarati title must be at least 2 characters"),
  isApproved: z.boolean().default(true),
});

type HeroSliderFormData = z.infer<typeof heroSliderSchema>;

const EditHeroSlider = () => {
  // ======================
  // States
  // ======================

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [postImage, setPostImage] = useState<string | null>(null);
  const [existingImageId, setExistingImageId] = useState<string | null>(null);

  const { id } = useParams();
  const router = useRouter();

  // ======================
  // Form
  // ======================

  const form = useForm<HeroSliderFormData>({
    resolver: zodResolver(heroSliderSchema),
    defaultValues: {
      imageId: "",
      title: "",
      boldtitle: "",
      gujratititle: "",
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
      } else {
        throw new Error(data.error || "Upload failed");
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

  const handleSubmit = async (data: HeroSliderFormData) => {
    setIsSubmitting(true);

    try {
      // Keep old image if new image not uploaded
      if (!data.imageId && existingImageId) {
        data.imageId = existingImageId;
      }

      // ✅ Using correct function name
      const result = await updateheroslider(id as string, data);

      if (result?.success) {
        toast({
          title: "Success",
          description: "Hero slider updated successfully.",
        });
        router.push("/vendor/heroslider");
      } else {
        throw new Error(result?.error || "Failed to update hero slider");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update hero slider.",
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
    const fetchHeroSlider = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        // ✅ Using correct function name
        const heroSlider = await getherosliderById(id as string);

        if (heroSlider) {
          setExistingImageId(heroSlider.imageId || null);

          // Image Preview
          if (heroSlider.imageId) {
            try {
              const response = await fetch(`/api/files/${heroSlider.imageId}`);
              if (response.ok) {
                const blob = await response.blob();
                const imageUrl = URL.createObjectURL(blob);
                setPostImage(imageUrl);
              }
            } catch (error) {
              console.error("Failed to fetch image:", error);
            }
          }

          // Form Reset
          form.reset({
            imageId: heroSlider.imageId || "",
            title: heroSlider.title || "",
            boldtitle: heroSlider.boldtitle || "",
            gujratititle: heroSlider.gujratititle || "",
            isApproved: heroSlider.isApproved ?? true,
          });
        } else {
          toast({
            title: "Error",
            description: "Hero slider not found",
            variant: "destructive",
          });
          router.push("/vendor/heroslider");
        }
      } catch (error) {
        console.error("Failed to fetch hero slider:", error);
        toast({
          title: "Error",
          description: "Failed to fetch hero slider data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroSlider();

    return () => {
      if (postImage && postImage.startsWith('blob:')) {
        URL.revokeObjectURL(postImage);
      }
    };
  }, [id, form, router]);

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
          <div className=" gap-4">

            <FormField
              control={form.control}
              name="imageId"
              render={({ field: { onChange, ...field } }) => (
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


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Title"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gujratititle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gujarati Title</FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Gujarati Title"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>




          </div>

          <div className="w-full mt-4">
            <FormField
              control={form.control}
              name="boldtitle"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Bold Title</FormLabel>
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
                : "Update Hero Slider"}
            </Button>

            <Button variant="outline" asChild>
              <Link href="/vendor/heroslider">
                Cancel
              </Link>
            </Button>

          </div>
        </form>
      </Form>
    </section>
  );
};

export default EditHeroSlider;