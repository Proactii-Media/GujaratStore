"use client";
import Image from "next/image";
import { Button } from "./ui/button";
import { Heart, ShoppingCart, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { flavoursOfGujarat } from "@/constants";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useOrganicProducts } from "@/hooks/useOrganicProducts";
import Loader from "./Loader";

const OrganicAndFlavours = () => {
  // * Custom hook for organic products
  const {
    products: organicProducts,
    loading,
    error,
    handleToggleCart,
    handleToggleWishlist,
  } = useOrganicProducts();

  // * Refs for different sections
  const [titleRef, titleInView] = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });
  const [organicRef, organicInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  const [flavoursRef, flavoursInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  // * Helper function to construct image URL from GridFS ID
  const getImageUrl = (imageId: string) => `/api/files/${imageId}`;

  // * Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  console.log(organicProducts);
console.log(organicProducts.length);

  return (
    <section className = "bg-red-50">
      <div className="dynamic-container mx-auto px-4 py-14">
        {/* Organic Section */}
        <motion.div
          ref={titleRef}
          initial="hidden"
          animate={titleInView ? "visible" : "hidden"}
          variants={titleVariants}
          className="flex-center flex-col mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "2rem" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-px bg-black"
            />
            <h2 className="text-lg">ઑર્ગનિક બકેટ</h2>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "2rem" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-px bg-black"
            />
          </div>
          <div className="flex items-center gap-2">
            <Image
              src="/decoration.svg"
              alt="decoration"
              width={24}
              height={24}
            />
            <h1 className="text-2xl font-bold text-center">
              ORGANIC : A BETTER CHOICE
            </h1>
            <Image
              src="/decoration.svg"
              alt="decoration"
              width={24}
              height={24}
            />
          </div>

          

          <motion.div

          
            ref={organicRef}
            variants={containerVariants}
            initial="hidden"
            animate={organicInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-16"
          >
            {loading ? (
              <div className="col-span-full flex justify-center items-center py-16">
                <Loader />
              </div>
            ) : error ? (
              <div className="col-span-full flex justify-center items-center py-16">
                <p className="text-red-500 text-center">
                  Failed to load organic products. Please try again later.
                </p>
              </div>
            ) : organicProducts.length === 0 ? (
              <div className="col-span-full flex justify-center items-center py-16">
                <p className="text-gray-500 text-center">
                  No organic products available at the moment.
                </p>
              </div>
            ) : (
              organicProducts.map((product) => (
                <motion.div
                  key={product._id}
                  variants={itemVariants}
                  whileHover={{ y: -10, transition: { duration: 0.3 } }}
                  className="flex flex-col items-center justify-between min-h-[420px]"
                >

                  {/* {`/${product.parentCategory.name.toLowerCase()}/${
                      product.slug
                    }`} */}
                  <Link
                    prefetch
                    href= {`/product/${product.slug}`}
                    className="flex flex-col items-center w-full flex-1"
                  >                    
                    <motion.div
                      className="mb-4 rounded-full overflow-hidden w-[250px] h-[250px]"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Image
                        src={getImageUrl(product.productCoverImage)}
                        alt={product.productName}
                        width={250}
                        height={250}
                        className="object-cover w-full h-full"
                      />
                    </motion.div>

                    <div className="text-center mb-4 px-2">
                      <h3 className="text-sm mb-2 leading-tight h-9 flex items-center justify-center hover:text-brand transition-colors line-clamp-2">
                        {product.productName}
                      </h3>
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <p className="font-bold text-lg">
                          ₹
                          {Math.floor(product.netPrice).toLocaleString("en-IN")}
                        </p>
                        {product.mrp > product.netPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{Math.floor(product.mrp).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="secondary"
                        className="shadow-md flex items-center gap-2"
                        onClick={(e) => handleToggleCart(e, product)}
                        disabled={
                          !product.productStatus || product.productQuantity <= 0
                        }
                      >
                        <div
                          className={cn(
                            product.inCart ? "bg-secondary/90" : "bg-brand",
                            "p-2 rounded -ml-3 transition-all duration-300"
                          )}
                        >
                          {product.inCart ? (
                            <Check className="size-5 text-green-500" />
                          ) : (
                            <ShoppingCart className="size-5 text-white" />
                          )}
                        </div>
                        {product.inCart ? "Remove" : "Add to cart"}
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="secondary"
                        className="shadow-md"
                        onClick={(e) => handleToggleWishlist(e, product)}
                      >
                        <Heart
                          className={cn(
                            "text-red-600",
                            product.wishlist && "fill-red-600"
                          )}
                        />
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </motion.div>

        

     
      </div>

        <motion.div
              className="relative min-h-[180px] w-full sm:min-h-[220px] md:min-h-[600px]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="absolute inset-0 bg-[url('/bg/bg4.jpg')] bg-cover bg-no-repeat" />
              <div className="absolute inset-0 bg-black/70" />
      
              <div className="relative text-white flex h-full flex-col items-center justify-center p-4 text-center sm:p-6 md:p-8">
                <motion.h1
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="h1 mb-2 text-2xl sm:text-3xl md:text-8xl mt-14 sm:mt-44 font-playfair"
                >
                  THE GUJARAT STORE
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-sm sm:text-base md:text-2xl font-bold sm:mt-8 mt-0 text-brand"
                >
                  ગુજરાત થી તમારા ઘર આંગણે.
                </motion.p>
              </div>
            </motion.div>
    </section>
  );
};

export default OrganicAndFlavours;
