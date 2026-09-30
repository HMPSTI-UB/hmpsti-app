"use client";

import { useState } from "react";
import Image from "next/image";
import { Monitor, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  projectImageUrl: string | null;
  bannerImageUrl: string | null;
  title: string;
}

export function ImageGallery({ projectImageUrl, bannerImageUrl, title }: ImageGalleryProps) {
  const defaultImage = "https://res.cloudinary.com/dz1irxeio/image/upload/v1740669299/assets/hmpsti/hmpsti_logo_wb_yvtt4t.png";
  
  const images = [
    { id: "project", src: projectImageUrl || defaultImage, label: "Foto Alat" },
    { id: "banner", src: bannerImageUrl || defaultImage, label: "Poster" },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
      <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Monitor className="w-4 h-4 text-blue-400" />
          {activeImage.label}
        </h3>
      </div>
      
      {/* Main Large Image */}
      <div 
        className={cn(
          "relative w-full bg-black/40 flex items-center justify-center p-4 group transition-all duration-500",
          activeImage.id === "banner" 
            ? "aspect-[3/4] sm:aspect-[4/5] md:aspect-[4/3] lg:aspect-[16/9]" 
            : "aspect-video md:aspect-[4/3] lg:aspect-[16/9]"
        )}
      >
        <Image
          src={activeImage.src}
          alt={`${activeImage.label} ${title}`}
          fill
          unoptimized={true}
          className="object-contain"
        />
        
        {/* Navigation Buttons */}
        <button 
          onClick={handlePrev}
          className="absolute left-4 p-2 bg-black/50 hover:bg-black/80 border border-white/20 rounded-full text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={handleNext}
          className="absolute right-4 p-2 bg-black/50 hover:bg-black/80 border border-white/20 rounded-full text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="p-4 flex gap-4 overflow-x-auto border-t border-white/10 bg-black/20">
        {images.map((img, idx) => (
          <button
            key={img.id}
            onClick={() => setActiveIndex(idx)}
            className={cn(
              "relative w-24 aspect-square flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all",
              activeIndex === idx 
                ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                : "border-white/10 hover:border-white/30 opacity-70 hover:opacity-100"
            )}
            title={img.label}
          >
            <Image
              src={img.src}
              alt={img.label}
              fill
              unoptimized={true}
              className="object-cover"
            />
            {/* Small Label Overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm text-[10px] text-white font-medium py-1 text-center">
              {img.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
