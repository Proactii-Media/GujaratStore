"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormField,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { createHeroslider } from "@/lib/actions/admin/heroSlider.actions"; // You'll need to create this action

//* Dynamically import React Quill (if needed for rich text, though not needed for hero slider)
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "quill/dist/quill.snow.css";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

// Hero Slider Schema
const heroSliderSchema = z.object({
  imageId: z.string().min(1, "Image is required"),
  title: z.string().min(2, "Title must be at least 2 characters"),
  boldtitle: z.string().min(2, "Bold title must be at least 2 characters"),
  gujratititle: z.string().min(2, "Gujarati title must be at least 2 characters"),
  isApproved: z.boolean().default(true),
});

type HeroSliderFormData = z.infer<typeof heroSliderSchema>;

const AddHerosliderForm = () => {
  // * useStates
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postImage, setPostImage] = useState("");
  const [imageId, setImageId] = useState("");

  // * hooks
  const router = useRouter();
  const form = useForm<HeroSliderFormData>({
    resolver: zodResolver(heroSliderSchema),
    defaultValues: {
      title: "",
      boldtitle: "",
      gujratititle: "",
      isApproved: true,
      imageId: "",
    },
  });

  // * functions
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
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
          setImageId(data.fileId);
          onChange(data.fileId); // Update the form with the file ID
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive",
        });
      }
    }
  };

  // * form submission
  const handleSubmit = async (data: HeroSliderFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value ?? ""));
      });

      formData.set("imageId", imageId);

      const result = await createHeroslider(formData);

      if (result.success) {
        form.reset({
          title: "",
          boldtitle: "",
          gujratititle: "",
          isApproved: true,
          imageId: "",
        });
        setPostImage("");
        setImageId("");
        router.push("/admin/heroslider"); 
        toast({
          title: "Success",
          description: "Hero slider added successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add hero slider",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to add hero slider.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (


    <section className="sm:px-5 md:px-1 lg:px-2">
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className=" gap-2">
              <FormField
                control={form.control}
                name="imageId" // Changed from 'image' to 'imageId'
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".jpeg, .png, .jpg"
                        onChange={(e) => handleFileUpload(e, onChange)}
                        defaultValue={value}
                        {...field}
                      />
                    </FormControl>
                    {postImage && (
                      <Image
                        src={postImage}
                        alt="Preview"
                        height={200}
                        width={200}
                        style={{ maxWidth: "200px" }}
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>





            <div className="grid grid-cols-1 mt-4  gap-2">
              <FormField
                control={form.control}
                name="boldtitle"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Bold Title</FormLabel>
                    <FormControl>
                      {/* Use React Quill for rich text editing */}
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
            <div className="grid mt-4grid-cols-2 sm:grid-cols-2 gap-2 mt-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel> Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Title" />
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
                    <FormLabel> Gujarati Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Gujarati Title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>


            <div className="mt-4">
              <FormField
                control={form.control}
                name="isApproved"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Approved</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-row mt-4 gap-2">
              <Button
                type="submit"
                className="primary-btn "
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
              <Button variant="outline" asChild>
                <Link prefetch href="/admin/testimonials">
                  Cancel
                </Link>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
};

export default AddHerosliderForm;