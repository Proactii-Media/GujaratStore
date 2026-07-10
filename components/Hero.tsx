"use client";
import Image from "next/image";
// import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { homeImageCircles } from "@/constants";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { getPublicHerosliders } from "@/lib/actions/admin/heroSlider.actions";



// Slide data type
interface Slide {
  _id: string;
  imageId: string;
  title: string;
  boldtitle: string;
  gujratititle: string;
  isApproved: boolean;
  createdAt?: string;
}

// Hero Component
const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setLoading(true);
        const response = await getPublicHerosliders({ page: 1, limit: 10 });

        if (response.success && response.data) {
          setSlides(response.data);
        } else {
          setError(response.error || "Failed to load slides");
        }
      } catch (err) {
        console.error("Error fetching hero sliders:", err);
        setError("Failed to load hero sliders");
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 1 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const circleVariants = {
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  // FIXED: Changed to crossfade animation to prevent white space
  const slideVariants = {
    enter: {
      opacity: 0,
      scale: 1,
    },
    center: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      opacity: 0,
      scale: 1,
    },
  };

  // Auto-play functionality
  useEffect(() => {
   
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, slides.length]); 

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[450px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  // Error state
  if (error || slides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[450px]">
        <p className="text-red-500">{error || "No slides available"}</p>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  // Helper function to construct image URL from GridFS ID
  const getImageUrl = (imageId: string) => `/api/files/${imageId}`;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col items-center"
    >
      {/* Hero Background Section with Slider */}
      <div className="relative min-h-[180px] w-full sm:min-h-[220px] md:min-h-[240px] overflow-hidden" >
        <div className="relative h-[450px] w-full">
         <AnimatePresence initial={false}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                // FIXED: Using only opacity transition for smooth crossfade
                opacity: { duration: 0.5, ease: "easeInOut" },
              }}
              className="absolute inset-0"
            >
           
              <div

                    

                className="absolute inset-0 bg-cover bg-center bg-no-repeat h-[450px] w-full"
                style={{ backgroundImage: `url('${getImageUrl(currentSlide.imageId)}')` }}
              />

              {/* Overlay - FIXED: Changed from black/5 to black/20 for better visibility */}
              <div className="absolute inset-0 bg-black/20 h-[450px] w-full" />

              {/* Content */}
              <div 
              className="relative text-white z-10 flex flex-col items-center justify-center sm:items-start sm:justify-start h-full p-4 sm:p-6 md:p-16 text-center sm:text-left sm:mt-0 md:mt-10 lg:mt-0">
                <motion.p
                  variants={itemVariants}
                  className="text-5xl sm:text-base md:text-5xl font-extralight sm:mt-0 md:mt-16 lg:mt-16"
                >
                  {currentSlide.title}{" "}
                  <motion.strong
                    whileHover={{ scale: 1.05 }}
                    className="!font-bold font-playfair"
                  >
                    {currentSlide.boldtitle
                      .replace(/<[^>]*>/g, "")
                      .replace(/&nbsp;/g, " ")}
                  </motion.strong>
                </motion.p>
                <motion.h2
                  variants={itemVariants}
                className="mt-5 text-[44px] sm:text-[75px] font-semibold"
                  
                >
                  {currentSlide.gujratititle}
                </motion.h2>
                <motion.div variants={itemVariants}>
                  <Button
                    className="w-36 bg-brand hover:bg-white px-4 py-2 mt-4 text-white hover:text-brand rounded"
                    asChild
                  >
                    {/* <Link prefetch href={currentSlide.ctaLink}>
                      {currentSlide.ctaText}
                    </Link> */}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <button style={{ display: "none" }}
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-300 backdrop-blur-sm"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button style={{ display: "none" }}
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-300 backdrop-blur-sm"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                    ? "bg-white w-6"
                    : "bg-white/50 w-2 hover:bg-white/75"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Section with Line and Images */}
      <div className="relative flex flex-col items-center justify-center py-16 sm:py-20">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="hidden sm:block absolute rounded-full md:w-[700px] md:h-3 lg:w-[800px] lg:h-3 xl:w-[1171px] xl:h-[18px] bg-brand z-0"
        />
        <div className="flex flex-col sm:flex-row sm:space-x-16 z-10 space-y-8 sm:space-y-0">
          {homeImageCircles.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover="hover"
              className="flex flex-col items-center"
            >
              <motion.div
                variants={circleVariants}
                className="rounded-full md:mt-3 bg-white p-2 hover:bg-brand transition-colors duration-150"
              >

               

               <Link href={item.url}>
                <Image 
                
                  src={item.src}
                  alt={item.alt}
                  width={500}
                  height={500}
                  className="rounded-full object-cover object-top size-44 md:size-24 lg:size-40 xl:size-52"
                />
                </Link>
              </motion.div>
              <motion.p
                variants={itemVariants}
                className="mt-2 text-center text-lg font-semibold"
              >
                {item.label}
              </motion.p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Hero;