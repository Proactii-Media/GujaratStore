"use client";

import Editheroslider from "@/lib/forms/admin/heroSlider/editheroslider";
import { PencilLine } from "lucide-react";
import React from "react";

const EditHerosliderPage = () => {
  return (
    <div className="p-2 space-y-6">
      <div className="flex flex-row items-center mb-3 gap-2">
        <PencilLine className="text-brand" size={30} />
        <h1 className="h1">Edit Hero Slider</h1>
      </div>
      <div className="p-2 bg-white border rounded-md ">
        <Editheroslider />
      </div>
    </div>
  );
};

export default EditHerosliderPage;
