"use client";
import React from "react";
import styles from "./Blog.module.css";
import Image from "next/image";
import first from "@/src/assets/images/Blog1.png";
import second from "@/src/assets/images/Blog2.png";
import third from "@/src/assets/images/Blog3.png";
import forth from "@/src/assets/images/Blog4.png";

function Blog() {
  return (
    <div className={styles.section}>
      <h2 className={styles.titleSection}>Latest Blogs</h2>
      <div className={styles.container}>
        <div className={styles.wrapperBox}>
          <button className={styles.button}>Fitness</button>
          <span className={styles.title}>
            Affordable Gym Wear That Looks and Feels Premium
          </span>
          <Image src={first} alt="first blog" className={styles.imgBlog} />
          <div className={styles.filter}></div>
        </div>
        <div className={styles.wrapperBox}>
          <button className={styles.button}>The Daily Impress</button>
          <span className={styles.title}>
            Quick, impactful, effortlessly chic everyday fashion.
          </span>
          <Image src={third} alt="second blog" className={styles.imgBlog} />
          <div className={styles.filter}></div>
        </div>
        <div className={styles.wrapperBox}>
          <button className={styles.button}>Cleaning</button>
          <span className={styles.title}>
            How to Clean Muddy Running Shoes Without Ruining Them
          </span>
          <Image src={second} alt="third blog" className={styles.imgBlog} />
          <div className={styles.filter}></div>
        </div>
        <div className={styles.wrapperBox}>
          <button className={styles.button}>The Fashion Blotter</button>
          <span className={styles.title}>
            Absorbing the latest runaway and streetwear trends.
          </span>
          <Image src={forth} alt="forth blog" className={styles.imgBlog} />
          <div className={styles.filter}></div>
        </div>
      </div>
    </div>
  );
}

export default Blog;
