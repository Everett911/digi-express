"use client";

import styles from "./ProductForm.module.css";
import { Activity, ChangeEvent, useActionState, useState } from "react";
import { formatCurrency } from "@/src/utils/formatters";
import { Button } from "@radix-ui/themes";
import { addProduct, updateProduct } from "../../_actions/products";
import { useFormStatus } from "react-dom";
import Form from "next/form";

import Image from "next/image";
import type { Product } from "@prisma/client";
import { MAX_PRODUCT_IMAGES } from "@/src/schemas/products";

type ImageSlot = {
  key: string;
  existing: string | null;
  preview: string | null;
};

function newSlot(existing: string | null): ImageSlot {
  return { key: crypto.randomUUID(), existing, preview: null };
}

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

  // One slot per photo: the saved image (if any) and a preview of a newly
  // picked file. Keys stay stable so file inputs keep their files when a
  // slot above them is removed.
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>(() =>
    product?.image?.length
      ? product.image.map((existing) => newSlot(existing))
      : [newSlot(null)],
  );

  const addColorField = () => setColors([...(colors || []), ""]);
  const addSizeField = () => setSizes([...(sizes || []), ""]);
  const addKeywordField = () => setKeywords([...(keywords || []), ""]);

  const addImageField = () => {
    if (imageSlots.length < MAX_PRODUCT_IMAGES) {
      setImageSlots([...imageSlots, newSlot(null)]);
    }
  };

  const removeImageField = (key: string) => {
    const slot = imageSlots.find((s) => s.key === key);
    if (slot?.preview) URL.revokeObjectURL(slot.preview);
    setImageSlots(imageSlots.filter((s) => s.key !== key));
  };

  const handleImageChange = (
    key: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    setImageSlots(
      imageSlots.map((slot) => {
        if (slot.key !== key) return slot;
        if (slot.preview) URL.revokeObjectURL(slot.preview);
        return { ...slot, preview: file ? URL.createObjectURL(file) : null };
      }),
    );
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
          <span className={styles.label}>
            Images ({imageSlots.length} of {MAX_PRODUCT_IMAGES})
          </span>
          <p className={styles.helpText}>
            The first image is the one shown in product lists. Add photos from
            different angles, close-ups of details, or the product in use.
          </p>
          {imageSlots.map((slot, index) => {
            const shown = slot.preview ?? slot.existing;
            return (
              <div key={slot.key} className={styles.inputGroup}>
                <label htmlFor={`image-${slot.key}`}>
                  Image #{index + 1}
                  {index === 0 && " (main image)"}
                </label>
                {slot.existing && (
                  <input
                    type="hidden"
                    name={`keepImage_${index}`}
                    value={slot.existing}
                  />
                )}
                <input
                  id={`image-${slot.key}`}
                  type="file"
                  accept="image/*"
                  name={`image_${index}`}
                  className={styles.input}
                  onChange={(e) => handleImageChange(slot.key, e)}
                  required={product == null || !slot.existing}
                />

                {shown && (
                  <Image
                    src={shown}
                    height="200"
                    width="200"
                    alt={`Product image ${index + 1}`}
                    className={styles.imagePreview}
                    unoptimized={shown.startsWith("blob:")}
                  />
                )}
                {slot.preview && slot.existing && (
                  <span className={styles.helpText}>
                    This photo replaces the current one when you save.
                  </span>
                )}

                {imageSlots.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(slot.key)}
                    className={styles.removeButton}
                  >
                    Remove image #{index + 1}
                  </button>
                )}
              </div>
            );
          })}

          {imageSlots.length < MAX_PRODUCT_IMAGES && (
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
