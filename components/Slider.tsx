"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow } from "swiper/modules";
import { Star, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { getPublicTestimonials } from "@/lib/actions/admin/testimonial.actions";
import "swiper/css";
import "swiper/css/pagination";

import image from "next/image";

// Type definition for testimonial from your actions
interface Testimonial {
  _id: string;
  author: string;
  position?: string;
  rating: number;
  quote: string;
  productType: string;
  imageId?: string;
  isApproved: boolean;
  createdAt?: string;
}


const TestimonialSlider = () => {
  // State to store testimonials from database
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch testimonials from database
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const result = await getPublicTestimonials();
        if (result.success && result.data) {
          setTestimonials(result.data);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <section className="relative min-h-[600px] bg-white py-20 px-4 bg-[url('/bg/bg5.jpg')] bg-no-repeat bg-cover">
        <div className="dynamic-container mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-100 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading testimonials...</p>
        </div>
      </section>
    );
  }

  // Show message if no testimonials
  if (testimonials.length === 0) {
    return (
      <section className="relative min-h-[600px] bg-white py-20 px-4 bg-[url('/bg/bg5.jpg')] bg-no-repeat bg-cover">
        <div className="dynamic-container mx-auto text-center">
          <p className="text-gray-600">No testimonials yet. Be the first to share your experience!</p>
        </div>
      </section>
    );
  }


  // Helper function to construct image URL from GridFS ID
const getImageUrl = (imageId: string) => `/api/files/${imageId}`;
  return (
    <section className="relative min-h-[600px] bg-white py-20 px-4 bg-[url('/bg/bg5.jpg')] bg-no-repeat bg-cover">
      {/* Background animations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-peach/10 to-white" />
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 6 + 3,
              height: Math.random() * 6 + 3,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: i % 2 === 0 ? "#FA7275" : "#efbbac",
              opacity: 0.1,
            }}
            animate={{
              y: [0, 40, 0],
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="dynamic-container mx-auto max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Badge
            className="mb-4 bg-gradient-to-r from-brand-100 to-peach2 text-white border-none"
            variant="outline"
          >
            Customer Reviews 
          </Badge>
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-brand-300 via-brand-100 to-brand-300 bg-clip-text text-transparent">
            What Our Customers Say 
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Experience the artistry of Gujarat through the eyes of our cherished
            customers
          </p>
        </motion.div>

        <Swiper
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView="auto"
          loop={true}
          coverflowEffect={{
            rotate: 5,
            stretch: 0,
            depth: 100,
            modifier: 2,
            slideShadows: false,
          }}
          modules={[Autoplay, EffectCoverflow]}
          className="testimonial-swiper"
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
        >
          {/* Dynamically render testimonials from database */}
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={testimonial._id || index} className="w-96">
              <Card className="bg-white shadow-lg border border-peach/20 overflow-hidden transform transition-all hover:scale-102 hover:shadow-xl">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <Avatar className="w-16 h-16 border-2 border-brand-100">
                      {/* FIXED: Changed from item.coverImag to testimonial.imageId */}
                      <AvatarImage
                        src={testimonial.imageId ? getImageUrl(testimonial.imageId) : "/default-avatar.png"}
                        alt={testimonial.author || "Customer"}
                        className="object-cover object-top"
                        loading="lazy"
                        onError={(e) => {
                          console.error("Failed to load image for testimonial:", testimonial.imageId);
                          e.currentTarget.src = "/default-avatar.png";
                        }}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-brand-100 to-peach2 text-white text-xl">
                        {testimonial.author?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-800 mb-1">
                        {testimonial.author}
                      </h4>
                      <p className="text-brand-100 text-sm">
                        {testimonial.position || "Verified Customer"}
                      </p>
                      <div className="flex gap-1 mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={`${
                              i < testimonial.rating
                                ? "text-brand-100 fill-brand-100"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <MessageCircle
                      className="absolute -left-2 sm:-left-5 -top-2 text-peach opacity-20"
                      size={40}
                    />
                    <div 
                      dangerouslySetInnerHTML={{ __html: testimonial.quote }}
                      className="text-gray-600 text-lg leading-relaxed pl-6 testimonial-quote"
                    />
                  </div>

                  <Badge
                    variant="outline"
                    className="mt-6 bg-gradient-to-r from-brand-100/10 to-peach2/10 hover:from-brand-100/20 hover:to-peach2/20 transition-colors border-brand-100/20 text-brand-300"
                  >
                    {testimonial.productType || "Traditional Product"}
                  </Badge>
                </CardContent>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .testimonial-swiper {
          padding: 3rem 0;
        }

        .swiper-slide {
          width: 400px;
          opacity: 0.6;
          transition: all 0.4s ease;
        }

        .swiper-slide-active {
          opacity: 1;
        }

        .swiper-slide-prev,
        .swiper-slide-next {
          opacity: 0.8;
        }
        
        .testimonial-quote {
          word-wrap: break-word;
          word-break: break-word;
          overflow-wrap: break-word;
          white-space: normal;
          max-width: 100%;
        }
        
        .testimonial-quote p {
          margin: 0;
          display: inline;
          word-break: break-word;
        }
      `}</style>
    </section>
  );
};

export default TestimonialSlider;