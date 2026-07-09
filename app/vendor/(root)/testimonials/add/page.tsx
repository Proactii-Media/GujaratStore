import AddTestimonialsForm from "@/lib/forms/testimonial/addtestimonial";
import { ShoppingCart } from "lucide-react";
import React from "react";

const AddTestimonialsPage = () => {
  return (
    <div className="p-2 space-y-6">
      <div className="flex items-center gap-2">
        <ShoppingCart className="text-brand" size={30} />
        <h1 className="h1">Add Testimonials</h1>
      </div>
      <div className="p-2 bg-white border rounded-md">
        <AddTestimonialsForm />
      </div>
    </div>
  );
};

export default AddTestimonialsPage;
