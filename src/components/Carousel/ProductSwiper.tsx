"use client";

import React, { useState } from "react";
import Image from "next/image";

import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs, Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";

import styles from "./ProductSwiper.module.css";

type props = {
  images: string[];
};

export default function ProductSwiper({ images }: props) {
  const [mainSwiper, setMainSwiper] = useState<SwiperType | null>(null);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className={styles.carouselWrapper}>
      <Swiper
        onSwiper={setMainSwiper}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        loop={false}
        spaceBetween={10}
        navigation={true}
        thumbs={{
          swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
        }}
        modules={[Navigation, Thumbs]}
        className={styles.mainSwiper}
      >
        {images.map((img, index) => (
          <SwiperSlide key={index}>
            <div className={styles.slideInner}>
              <Image
                src={`${img}`}
                alt={`Product view ${index + 1}`}
                fill
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 600px"
                className={styles.productImage}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Synchronized Navigation Thumbnails Strip */}
      <Swiper
        onSwiper={setThumbsSwiper}
        loop={false}
        spaceBetween={12}
        slidesPerView={3}
        watchSlidesProgress={true}
        modules={[Thumbs]}
        className={styles.thumbsSwiper}
      >
        {images.map((img, index) => {
          // Compute state comparison locally for absolute reliability
          const isActive = index === activeIndex;
          const containerClassName = `${styles.thumbSlideInner} ${
            isActive ? styles.thumbSlideInnerActive : ""
          }`;

          return (
            <SwiperSlide key={index}>
              <div
                className={containerClassName}
                role="button"
                tabIndex={0}
                aria-label={`Switch to product view ${index + 1}`}
                onClick={() => {
                  mainSwiper?.slideTo(index);
                  setActiveIndex(index);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    mainSwiper?.slideTo(index);
                    setActiveIndex(index);
                  }
                }}
              >
                <Image
                  src={`${img}`}
                  alt={`Thumbnail selector ${index + 1}`}
                  fill
                  sizes="160px"
                  className={styles.productImage}
                />
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
