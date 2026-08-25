"use client";

import styles from "./ProductForm.module.css";
import { Activity, ChangeEvent, useActionState, useState } from "react";
import { formatCurrency } from "@/src/utils/formatters";
import { Button } from "@radix-ui/themes";
import { addProduct, updateProduct } from "../../_actions/products";
import { useFormStatus } from "react-dom";
import Form from "next/form";

import Image from "next/image";
import type { Product } from "@/prisma/generated/client";

function ProductForm({ product }: { product?: Product | null }) {
  const [error, action] = useActionState(
    product == null ? addProduct : updateProduct.bind(null, product.id),
    null,
  );
  const [price, setPrice] = useState<number | undefined>(
    product?.priceCents !== undefined && product?.priceCents !== null
      ? Number(product.priceCents)
      : undefined,
  );
  const previewPrice = price !== undefined ? price / 100 : 0;
  const [colors, setColors] = useState<string[]>(product?.color ?? [""]);
  const [sizes, setSizes] = useState<string[]>(product?.size ?? [""]);
  const [keywords, setKeywords] = useState<string[]>(product?.keywords ?? [""]);

  const [images, setImages] = useState<string[]>(
    product?.image?.length ? product.image : [""],
  );

  const addColorField = () => setColors([...(colors || []), ""]);
  const addSizeField = () => setSizes([...(sizes || []), ""]);
  const addKeywordField = () => setKeywords([...(keywords || []), ""]);

  const addImageField = () => {
    if (images.length < 3) {
      setImages([...images, ""]);
    }
  };

  const handleImageChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files && files[0]) {
      const updatedImages = [...images];

      if (updatedImages[index].startsWith("blob:")) {
        URL.revokeObjectURL(updatedImages[index]);
      }

      updatedImages[index] = URL.createObjectURL(files[0]);
      setImages(updatedImages);
    }
  };

  return (
    <>
      <Form action={action} className={styles.form}>
        <div className={styles.formContainer}>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className={styles.input}
            required
            defaultValue={product?.name}
          />
          <Activity
            mode={
              error && "fieldErrors" in error && error.fieldErrors.name
                ? "visible"
                : "hidden"
            }
          >
            <span className={styles.errorMessage}>
              {error && "fieldErrors" in error && error.fieldErrors.name}
            </span>
          </Activity>
        </div>

        <div className={styles.formContainer}>
          <label htmlFor="price">Price ($)</label>
          <input
            type="number"
            id="price"
            name="price"
            step="0.01"
            required
            className={styles.input}
            onChange={(e) =>
              setPrice(e.target.value ? parseFloat(e.target.value) : undefined)
            }
            defaultValue={
              product?.priceCents !== undefined && product?.priceCents !== null
                ? product.priceCents
                : undefined
            }
          />
          <div className={styles.totalText}>
            Preview: {formatCurrency(previewPrice)}
          </div>
          <Activity
            mode={
              error && "fieldErrors" in error && error.fieldErrors.priceCents
                ? "visible"
                : "hidden"
            }
          >
            <span className={styles.errorMessage}>
              {error && "fieldErrors" in error && error.fieldErrors.priceCents}
            </span>
          </Activity>
        </div>
        <div className={styles.formContainer}>
          <label htmlFor="name">Brand</label>
          <input
            type="text"
            id="brand"
            name="brand"
            className={styles.input}
            required
            defaultValue={product?.brand}
          />
          <Activity
            mode={
              error && "fieldErrors" in error && error.fieldErrors.name
                ? "visible"
                : "hidden"
            }
          >
            <span className={styles.errorMessage}>
              {error && "fieldErrors" in error && error.fieldErrors.name}
            </span>
          </Activity>
        </div>
        <div className={styles.formContainer}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            className={styles.input}
            name="description"
            required
            defaultValue={product?.description ?? ""}
          />
          <Activity
            mode={
              error && "fieldErrors" in error && error.fieldErrors.description
                ? "visible"
                : "hidden"
            }
          >
            <span className={styles.errorMessage}>
              {error && "fieldErrors" in error && error.fieldErrors.description}
            </span>
          </Activity>
        </div>

        <div className={styles.formContainer}>
          <span className={styles.label}>Images</span>
          {images.map((_, index) => (
            <div key={index} className={styles.inputGroup}>
              <label htmlFor={`image-${index}`}>Image #{index + 1}</label>
              <input
                id={`image-${index}`}
                type="file"
                name={`image_${index}`}
                className={styles.input}
                onChange={(e) => handleImageChange(index, e)}
                required={product == null}
              />

              {product?.image?.[index] && (
                <Activity mode="visible">
                  <Image
                    src={product.image[index]}
                    height="200"
                    width="200"
                    alt={`Current product image ${index + 1}`}
                    className="object-cover rounded"
                  />
                </Activity>
              )}
            </div>
          ))}

          {images.length < 3 && (
            <button
              type="button"
              onClick={addImageField}
              className={styles.button}
            >
              + Add More Images
            </button>
          )}

          <Activity
            mode={
              error && "fieldErrors" in error && error.fieldErrors.image
                ? "visible"
                : "hidden"
            }
          >
            <span className={styles.errorMessage}>
              {error && "fieldErrors" in error && error.fieldErrors.image?.[0]}
            </span>
          </Activity>
        </div>

        <div className={styles.formContainer}>
          <label>Colors</label>
          {colors.map((_, index) => (
            <input
              key={index}
              type="text"
              name={`color_${index}`}
              className={styles.input}
              placeholder={`Color #${index + 1}`}
              required
              defaultValue={product?.color[index]}
            />
          ))}
          <button
            type="button"
            onClick={addColorField}
            className={styles.button}
          >
            + Add More Colors
          </button>
          <Activity
            mode={
              error && "fieldErrors" in error && error.fieldErrors.color
                ? "visible"
                : "hidden"
            }
          >
            <span className={styles.errorMessage}>
              {error && "fieldErrors" in error && error.fieldErrors.color}
            </span>
          </Activity>
        </div>

        <div className={styles.formContainer}>
          <label>Sizes</label>
          {sizes.map((_, index) => (
            <input
              key={index}
              type="text"
              name={`size_${index}`}
              className={styles.input}
              placeholder={`Size #${index + 1}`}
              required
              defaultValue={product?.size[index]}
            />
          ))}
          <button
            type="button"
            onClick={addSizeField}
            className={styles.button}
          >
            + Add More Sizes
          </button>
          <Activity
            mode={
              error && "fieldErrors" in error && error.fieldErrors.size
                ? "visible"
                : "hidden"
            }
          >
            <span className={styles.errorMessage}>
              {error && "fieldErrors" in error && error.fieldErrors.size}
            </span>
          </Activity>
        </div>

        <div className={styles.formContainer}>
          <label>Keywords</label>
          {keywords.map((_, index) => (
            <input
              key={index}
              type="text"
              name={`keyword_${index}`}
              className={styles.input}
              placeholder={`Keyword #${index + 1} for better searches`}
              required
              defaultValue={product?.keywords[index]}
            />
          ))}
          <button
            type="button"
            onClick={addKeywordField}
            className={styles.button}
          >
            + Add More Keywords
          </button>
          <Activity
            mode={
              error && "fieldErrors" in error && error.fieldErrors.keywords
                ? "visible"
                : "hidden"
            }
          >
            <span className={styles.errorMessage}>
              {error && "fieldErrors" in error && error.fieldErrors.keywords}
            </span>
          </Activity>
        </div>
        <SubmitButton />
      </Form>
    </>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className={styles.submitButton} disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </Button>
  );
}

export default ProductForm;
