import mongoose, { Schema, models } from "mongoose";

const testimonialSchema = new Schema(
  {

    imageId: { type: String, required: true },
    author : {type: String, required: true, trim: true},
position : { type: String, required: true, trim: true },
quote  : { type: String, required: true, trim: true },
productType : { type: String, required: true, trim: true },
rating : { type: Number, required: true, min: 1, max: 5 },
isApproved: { type: Boolean, default: true }


  },
  { timestamps: true }
);

const Testimonial = models.Testimonial || mongoose.model("Testimonial", testimonialSchema);
export default Testimonial;