"use client";
import React, { useState } from "react";
import Image from "next/image";
import { newCollection } from "@/constants";
import { Button } from "./ui/button";
// import Link from "next/link";
import { flavoursOfGujarat } from "@/constants";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";


const isImageItem = (item: ImageItem | ContentItem): item is ImageItem => {
  return "src" in item && "label" in item;
};

;

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




const CollectionItem: React.FC<CollectionItemProps> = ({
  item,
  isImageType,
  index,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: index * 0.2,
        ease: "easeOut",
      },
    },
  };

  if (isImageType && isImageItem(item)) {
    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={itemVariants}
        className="relative w-full h-80 group cursor-pointer overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          className="h-full"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <Image
            src={item.src}
            alt={item.label}
            className="w-full h-full object-cover"
            width={400}
            height={320}
          />
        </motion.div>
        <motion.div
          className="absolute inset-0 bg-black/50 flex flex-col items-center justify-end pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.h3
            className="text-white text-3xl font-bold mb-4 font-playfair"
            animate={{
              y: isHovered ? -64 : 0,
              transition: { duration: 0.3 },
            }}
          >
            {item.label}
          </motion.h3>
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{
              y: isHovered ? 0 : 100,
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <Button
              className="text-white px-6 py-2 rounded bg-brand hover:bg-white hover:text-brand"
              asChild
            >
              {/* <Link prefetch href="/shop">
                Buy Now
              </Link> */}
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  if (!isImageType && !isImageItem(item)) {
    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={itemVariants}
        className="w-full h-80 bg-[url('/bg/bg3.jpg')] flex flex-col items-center justify-center p-8 text-center"
      >
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-medium mb-4 font-poppins"
        >
          {item.title}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-poppins font-semibold mb-6"
        >
          {item.description}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
        >
          <Button
            className="border border-brand text-brand px-6 py-2 rounded hover:bg-brand hover:text-white transition-colors"
            variant="outline"
            asChild
          >
            {/* <Link prefetch href="/shop">
              Buy Now
            </Link> */}
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  return null;
};

const NewCollection: React.FC = () => {



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








  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const headerVariants = {
    hidden: {
      opacity: 0,
      y: -30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const gridItems: { image: ImageItem; content: ContentItem }[] = [];

  for (let i = 0; i < newCollection.length - 1; i += 2) {
    const imageItem = newCollection[i] as ImageItem;
    const contentItem = newCollection[i + 1] as ContentItem;

    if (imageItem && contentItem) {
      gridItems.push({
        image: imageItem,
        content: contentItem,
      });
    }
  }

  return (
    <section>
      <div className="dynamic-container mx-auto px-4 py-16">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={headerVariants}
          className="flex flex-col items-center mb-12"
        >
          <motion.div
            className="flex items-center gap-3 mb-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-8 h-px bg-black" />
            <h2 className="text-lg">એકદમ ફ્રેશ</h2>
            <div className="w-8 h-px bg-black" />
          </motion.div>
          <motion.div
            className="flex items-center gap-2"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Image
              src="/decoration.svg"
              alt="decoration"
              width={24}
              height={24}
            />
            <h1 className="text-2xl font-bold">NEW COLLECTION</h1>
            <Image
              src="/decoration.svg"
              alt="decoration"
              width={24}
              height={24}
            />
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 ">
          {gridItems.map((pair, index) => (
            <React.Fragment key={index}>
              <CollectionItem
                item={pair.image}
                isImageType={true}
                index={index * 2}
              />
              <CollectionItem
                item={pair.content}
                isImageType={false}
                index={index * 2 + 1}
              />
              {index === gridItems.length - 1 &&
                newCollection[newCollection.length - 1] && (
                  <CollectionItem
                    item={newCollection[newCollection.length - 1] as ImageItem}
                    isImageType={true}
                    index={newCollection.length - 1}
                  />
                )}
            </React.Fragment>
          ))}
        </div>


 {/* Flavours Section */}
        <motion.div 
          ref={flavoursRef}
          variants={containerVariants}
          initial="hidden"
          animate={flavoursInView ? "visible" : "hidden"}
          className="flex-center flex-col  dynamic-container mx-auto px-4 py-16"
        >
          <div className="flex items-center gap-3 mb-4 ">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "2rem" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-px bg-black"
            />
            <h2 className="text-lg">સ્વાદ આખા ગુજરાતનો</h2>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "2rem" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-px bg-black"
            />
          </div>
          <div className="flex items-center gap-2 mb-12">
            <Image
              src="/decoration.svg"
              alt="decoration"
              width={24}
              height={24}
            />
            <h1 className="text-2xl font-bold">FLAVOURS OF GUJARAT</h1>
            <Image
              src="/decoration.svg"
              alt="decoration"
              width={24}
              height={24}
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-8 w-full">
            <motion.div
              variants={itemVariants}
              className="relative w-full lg:w-[340px] h-[300px] lg:h-[528px]"
              whileHover={{ scale: 1.02 }}
            >
              <Image
                src="/food/puri.jpg"
                alt="puri"
                height={500}
                width={500}
                className="h-full w-full lg:w-[259px] object-cover"
              />
              <motion.div
                className="absolute inset-0 bg-brand/30 flex flex-col justify-center items-center text-white"
                whileHover={{ backgroundColor: "#C93326" }}
              >
                <p className="font-bold text-2xl lg:-ml-16">“સ્વાદ આખા</p>
                <p className="text-4xl lg:text-6xl font-bold">
                  ગુજરાત <span className="text-xl lg:text-2xl">નો”</span>
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    className="mt-4 text-brand border-brand w-44 hover:bg-brand hover:text-white"
                    asChild
                  >
                    <Link prefetch href="/">  
                      Explore
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-10 w-full">
              {flavoursOfGujarat.map((item, index) => (
                <motion.div
                  key={index}
                  
                  variants={itemVariants}
                  className="relative w-full mx-auto"
                  whileHover={{ y: -10 }}
                >
                  
                  <Image
                  
                  
                    src={item.src}
                    alt={item.label}
                    height={500}
                    width={500}
                    className="object-cover w-full sm:w-[259px] h-[220px]"
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 lg:left-6 bg-brand text-white w-full lg:w-[215px] h-[45px] flex-center py-2 px-4"
                    whileHover={{ height: "50px" }}
                  >
                    <Link prefetch href="/"> 
                    <p className="text-center font-medium text-sm">
                      {item.label}
                    </p>
                    </Link>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>



        









      </div>
      
    </section>
  );
};


export default NewCollection;
