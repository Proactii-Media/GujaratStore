import mongoose, { Schema, models } from "mongoose";

const heroSliderSchema = new mongoose.Schema(
    {
        imageId: { type: String, required: true },
        title: { type: String, required: true, trim: true },
        boldtitle: { type: String, required: true, trim: true },
        gujratititle: { type: String, required: true, trim: true },
        isApproved: { type: Boolean, default: true }
    },
    { timestamps: true }
);

const HeroSlider = models.HeroSlider || mongoose.model("HeroSlider", heroSliderSchema);
export default HeroSlider;
