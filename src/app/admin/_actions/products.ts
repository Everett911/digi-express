"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import { notFound, redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { formatCurrency } from "@/src/utils/formatters";
import { MAX_PRODUCT_IMAGES } from "@/src/schemas/products";
import { assertAdmin } from "../_lib/auth";

const fileSchema = z.instanceof(File, { message: "Required" });

const addSchema = z.object({
  name: z.string().min(1),
  priceCents: z.number().int().positive(),
  description: z.string().min(1),
  brand: z.string().min(1),
  image: z
    .array(fileSchema)
    .nonempty({ message: "At least one image is required" })
    .refine((arr) => arr.every((file) => file.size > 0), {
      message: "Images cannot be empty files",
    }),
  color: z.array(z.string().min(1)).default([]),
  size: z.array(z.string().min(1)).default([]),
  keywords: z.array(z.string().min(1)).default([]),
});
const editSchema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.string().min(1, "Brand is required"),
  description: z.string().min(1, "Description is required"),
  priceCents: z.number().int().positive(),
  color: z.array(z.string()),
  size: z.array(z.string()),
  keywords: z.array(z.string()),
});

// Number of numbered fields ("image_0", "image_1", ...) in the form.
function countSlots(formData: FormData, prefix: string) {
  let count = 0;
  while (formData.has(`${prefix}_${count}`)) count++;
  return count;
}

async function saveProductImage(file: File) {
  const filename = `${crypto.randomUUID()}-${file.name}`;
  const relativePath = `/products/${filename}`;
  await fs.writeFile(
    path.join("public", relativePath),
    Buffer.from(await file.arrayBuffer()),
  );
  return relativePath;
}

// Pages and the cached product lists/search results that read from them.
function revalidateProducts() {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin", "layout");
  updateTag("products");
  updateTag("products-newest");
}

export async function addProduct(prevState: unknown, formData: FormData) {
  await assertAdmin();

  const extractFormArray = (prefix: string) => {
    const items = [];
    let index = 0;
    while (formData.has(`${prefix}_${index}`)) {
      const value = formData.get(`${prefix}_${index}`);
      if (value) items.push(value);
      index++;
    }
    return items;
  };

  const rawPrice = Number(formData.get("price")) || 0;

  const parsedData = {
    brand: formData.get("brand"),
    name: formData.get("name"),
    description: formData.get("description"),
    priceCents: rawPrice,
    image: extractFormArray("image"),
    color: extractFormArray("color"),
    size: extractFormArray("size"),
    keywords: extractFormArray("keyword"),
  };

  const result = addSchema.safeParse(parsedData);

  if (!result.success) {
    return z.flattenError(result.error);
  }

  const data = result.data;

  await fs.mkdir("public/products", { recursive: true });

  const imagePaths = await Promise.all(
    data.image.slice(0, MAX_PRODUCT_IMAGES).map(saveProductImage),
  );

  try {
    await prisma.product.create({
      data: {
        isAvailableForPurchase: false,
        name: data.name,
        priceCents: data.priceCents,
        brand: data.brand,
        description: data.description,
        color: data.color,
        size: data.size,
        keywords: data.keywords,
        image: imagePaths,
      },
    });
  } catch (err) {
    console.error("prisma.product.create error:", err);
    return { error: (err as Error).message ?? String(err) };
  }

  revalidateProducts();
  redirect("/admin/products");
}

export async function toggleProductAvailability(
  id: string,
  isAvailableForPurchase: boolean,
) {
  await assertAdmin();

  await prisma.product.update({
    where: { id },
    data: { isAvailableForPurchase },
  });
  revalidateProducts();
}

export async function deleteProduct(id: string) {
  await assertAdmin();

  // Order items reference products with onDelete: Restrict.
  const orderItemCount = await prisma.orderItem.count({
    where: { productId: id },
  });
  if (orderItemCount > 0) {
    return { error: "Products that have been ordered can't be deleted." };
  }

  const product = await prisma.product.delete({ where: { id } });
  if (product == null) return notFound();

  const imagePaths = Array.isArray(product.image)
    ? product.image
    : [product.image];

  await Promise.all(
    imagePaths.map(async (imagePath) => {
      const absolutePath = path.join("public", imagePath);
      try {
        await fs.unlink(absolutePath);
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
      }
    }),
  );
  revalidateProducts();
}

export async function updateProduct(
  id: string,
  prevState: unknown,
  formData: FormData,
) {
  await assertAdmin();

  const extractFormArray = (prefix: string) => {
    const items = [];
    let index = 0;
    while (formData.has(`${prefix}_${index}`)) {
      const value = formData.get(`${prefix}_${index}`);

      if (value instanceof File) {
        if (value.size > 0) items.push(value);
      } else if (value) {
        items.push(value);
      }
      index++;
    }
    return items;
  };

  const rawPrice = Number(formData.get("price")) || 0;

  const parsedData = {
    name: formData.get("name"),
    description: formData.get("description"),
    brand: formData.get("brand"),
    priceCents: rawPrice,
    color: extractFormArray("color"),
    size: extractFormArray("size"),
    keywords: extractFormArray("keyword"),
  };

  const result = editSchema.safeParse(parsedData);

  if (!result.success) {
    return result.error.flatten(); // Fixed typo: flattenError -> flatten
  }

  const data = result.data;
  const product = await prisma.product.findUnique({ where: { id } });
  if (product == null) return notFound();

  // Each image slot either keeps its current photo, replaces it with a new
  // upload, or is removed. Only paths that belong to this product are kept.
  const currentImages = Array.isArray(product.image) ? product.image : [];
  const slotCount = Math.min(
    MAX_PRODUCT_IMAGES,
    Math.max(countSlots(formData, "image"), countSlots(formData, "keepImage")),
  );

  await fs.mkdir("public/products", { recursive: true });
  const imagePaths: string[] = [];
  for (let index = 0; index < slotCount; index++) {
    const upload = formData.get(`image_${index}`);
    const keep = formData.get(`keepImage_${index}`);

    if (upload instanceof File && upload.size > 0) {
      imagePaths.push(await saveProductImage(upload));
    } else if (typeof keep === "string" && currentImages.includes(keep)) {
      imagePaths.push(keep);
    }
  }

  if (imagePaths.length === 0) {
    return {
      formErrors: [],
      fieldErrors: { image: ["At least one image is required"] },
    };
  }

  // Delete files for photos that were replaced or removed.
  await Promise.all(
    currentImages
      .filter((oldPath) => oldPath && !imagePaths.includes(oldPath))
      .map(async (oldPath) => {
        const absoluteOldPath = path.join("public", oldPath);
        try {
          await fs.unlink(absoluteOldPath);
        } catch (error) {
          console.warn(`Could not delete old image: ${absoluteOldPath}`, error);
        }
      }),
  );

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        brand: data.brand,
        priceCents: data.priceCents,
        description: data.description,
        color: data.color,
        size: data.size,
        keywords: data.keywords,
        image: imagePaths,
      },
    });
  } catch (err) {
    console.error("prisma.product.update error:", err);
    return { error: (err as Error).message ?? String(err) };
  }

  revalidateProducts();
  redirect("/admin/products");
}
