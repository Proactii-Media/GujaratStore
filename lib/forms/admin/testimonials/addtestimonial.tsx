"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { testimonialSchema } from "@/lib/validations";
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
import * as z from "zod";
import Image from "next/image";
import { createTestimonial } from "@/lib/actions/admin/testimonial.actions";

//* Dynamically import React Quill (it won't run server-side)
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "quill/dist/quill.snow.css";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";


type TestimonialFormData = z.infer<typeof testimonialSchema>;

const AddTestimonialsForm = () => {
  // * useStates
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postImage, setPostImage] = useState("");
  const [imageId, setImageId] = useState("");

  // * hooks
  const router = useRouter();
  const form = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
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
      }
    }
  };
  // * form submission
const handleSubmit = async (data: TestimonialFormData) => {
  setIsSubmitting(true);
  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
  formData.append(key, String(value ?? ""));
    });

    formData.set("imageId", imageId);

    const result = await createTestimonial(formData);

      if (result.success) {
        form.reset({
          imageId: "",
        author: "",
        position: "",
        quote: "",
        productType: "",
        rating: 1,
          isApproved:true
        });
        setPostImage("");
        setImageId("");
        router.push("/admin/testimonials"); // Redirect after success
        toast({
          title: "Success",
          description: "Testimonial added successfully.",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to add Testimonial.",
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Author" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid mt-4grid-cols-2 sm:grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Position" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quote</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Quote" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               </div>


                 <div className="grid mt-4 grid-cols-2 sm:grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="productType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Type</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Product Type" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        {...field}
                        placeholder="Rating"
                      />
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

              



            <div className="flex flex-row mt-2 gap-2">
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

export default AddTestimonialsForm;
