import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Navigation, Pagination, Autoplay } from "swiper/modules";
import Link from "next/link";
import Image from "next/image";

import Spring from "@/assets/images/Spring.png";
import Summer from "@/assets/images/Summer.png";
import Winter from "@/assets/images/Winter.png";
import Autumn from "@/assets/images/Autumn.png";
import SpringMobile from "@/assets/images/Spring-mobile.png";
import SummerMobile from "@/assets/images/Summer-mobile.png";
import WinterMobile from "@/assets/images/Winter-mobile.png";
import AutumnMobile from "@/assets/images/Autumn-mobile.png";

import style from "./Carousel.module.css";

// Import Swiper styles in your component or global CSS
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

function Carousel() {
  const slidesData = [
    {
      desktop: Spring,
      mobile: SpringMobile,
      alt: "Spring Season",
      title: "Fresh Arrivals, Freshly Discounted",
      text: "New season. Newer styles",
    },
    {
      desktop: Summer,
      mobile: SummerMobile,
      alt: "Summer Season",
      title: "Splash Into Our Summer Collection",
      text: "Hot weather. Cooler prices.",
    },
    {
      desktop: Autumn,
      mobile: AutumnMobile,
      alt: "Autumn Season",
      title: "Embrace the Autumn Shift",
      text: "Fall in love with these prices.",
    },
    {
      desktop: Winter,
      mobile: WinterMobile,
      alt: "Winter Season",
      title: "Melting Down Prices On Winter Essentials",
      text: "Cold days, bold looks",
    },
  ];

  return (
    <Swiper
      modules={[EffectFade, Navigation, Pagination, Autoplay]}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 3000, disableOnInteraction: false }}
      effect="fade"
      fadeEffect={{ crossFade: true }}
      className={style["swiper-carousel"]}
      loop={true}
    >
      {slidesData.map((slide, index) => (
        <SwiperSlide className={style["swiper-slide"]} key={index}>
          {/* Desktop Image Wrapper */}
          <div className={style["desktop-image"]}>
            <Image
              className={style["carousel-image"]}
              src={slide.desktop}
              alt={slide.alt}
              priority={index === 0}
            />
            <span className={style.title}>{slide.title}</span>
            <span className={style.text}>{slide.text}</span>
            <Link href="/product" className="header-link">
              <button className={style["swiper-button"]}>Shop Now</button>
            </Link>
          </div>

          {/* Mobile Image Wrapper */}
          <div className={style["mobile-image"]}>
            <Image
              className={style["carousel-image"]}
              src={slide.mobile}
              alt={slide.alt}
              priority={index === 0}
            />
            <span className={style.title}>{slide.title}</span>
            <span className={style.text}>{slide.text}</span>
            <Link href="/product" className="header-link">
              <button className={style["swiper-button"]}>Shop Now</button>
            </Link>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default Carousel;
