import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Navigation, Pagination, Autoplay } from "swiper/modules";
import Link from "next/link";
import Spring from "@/assets/images/Spring.png";
import Summer from "@/assets/images/Summer.png";
import Winter from "@/assets/images/Winter.png";
import Autumn from "@/assets/images/Autumn.png";
import SpringMobile from "@/assets/images/Spring-mobile.png";
import SummerMobile from "@/assets/images/Summer-mobile.png";
import WinterMobile from "@/assets/images/Winter-mobile.png";
import AutumnMobile from "@/assets/images/Autumn-mobile.png";
import style from "./Carousel.module.css";
import Image from "next/image";

function Carousel() {
  return (
    <>
      <Swiper
        modules={[EffectFade, Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        effect={"fade"}
        fadeEffect={{ crossFade: true }}
        className={style["swiper-carousel"]}
        loop={true}
      >
        {images.map((image, index) => (
          <SwiperSlide className={style["swiper-slide"]} key={index}>
            <Image className={style["carousel-image"]} src={image} alt="" />
            <Link href="product" className="header-link">
              <button className={style["swiper-button"]}></button>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
      <Swiper
        modules={[EffectFade, Navigation, Pagination, Autoplay]}
        navigation={{
          nextEl: ".custom-swiper-button-next",
          prevEl: ".custom-swiper-button-prev",
        }}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        effect={"fade"}
        fadeEffect={{ crossFade: true }}
        className={style["swiper-carousel-mobile"]}
        loop={true}
      >
        {imgMobile.map((image, index) => (
          <SwiperSlide className={style["swiper-slide"]} key={index}>
            <Image className={style["carousel-image"]} src={image} alt="" />
            <Link href="product" className="header-link">
              <button className={style["swiper-button"]}></button>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}

export default Carousel;

const images = [Spring, Summer, Autumn, Winter];
const imgMobile = [SpringMobile, SummerMobile, AutumnMobile, WinterMobile];
