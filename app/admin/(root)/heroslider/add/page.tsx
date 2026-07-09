import AddHerosliderForm from "@/lib/forms/admin/heroSlider/addheroslider";
import { ShoppingCart } from "lucide-react";
import React from "react";

const AddHerosliderPage = () => {
  return (
    <div className="p-2 space-y-6">
      <div className="flex items-center gap-2">
        <ShoppingCart className="text-brand" size={30} />
        <h1 className="h1">Add Hero Slider</h1>
      </div>
      <div className="p-2 bg-white border rounded-md">
        <AddHerosliderForm />
      </div>
    </div>
  );
};

export default AddHerosliderPage;
