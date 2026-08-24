"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { formatCurrency } from "@/src/utils/formatters";

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

  image: z
    .array(z.instanceof(File))
    .optional()
    .transform((files) => files?.filter((file) => file.size > 0) ?? []),
});

export async function addProduct(prevState: unknown, formData: FormData) {
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
    data.image.map(async (imageFile) => {
      const filename = `${crypto.randomUUID()}-${imageFile.name}`;
      const relativePath = `/products/${filename}`;
      const absolutePath = path.join("public", relativePath);

      const buffer = Buffer.from(await imageFile.arrayBuffer());
      await fs.writeFile(absolutePath, buffer);

      return relativePath;
    }),
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

  revalidatePath("/");
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function toggleProductAvailability(
  id: string,
  isAvailableForPurchase: boolean,
) {
  await prisma.product.update({
    where: { id },
    data: { isAvailableForPurchase },
  });
  revalidatePath("/");
  revalidatePath("/products");
}

export async function deleteProduct(id: string) {
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
  revalidatePath("/");
  revalidatePath("/products");
}

export async function updateProduct(
  id: string,
  prevState: unknown,
  formData: FormData,
) {
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
    image: extractFormArray("image"),
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

  let imagePaths: string[] = Array.isArray(product.image) ? product.image : [];

  if (data.image && data.image.length > 0) {
    await fs.mkdir("public/products", { recursive: true });
    const filesArray = Array.isArray(data.image) ? data.image : [data.image];

    if (product.image) {
      const oldImages = Array.isArray(product.image)
        ? product.image
        : [product.image];
      for (const oldImagePath of oldImages) {
        if (oldImagePath) {
          const absoluteOldPath = path.join("public", oldImagePath);
          try {
            await fs.access(absoluteOldPath);
            await fs.unlink(absoluteOldPath);
          } catch (error) {
            console.warn(
              `Could not delete old image: ${absoluteOldPath}`,
              error,
            );
          }
        }
      }
    }

    const uploadedPaths = await Promise.all(
      filesArray.map(async (imageFile) => {
        if (!(imageFile instanceof File) || imageFile.size === 0) return "";
        const filename = `${crypto.randomUUID()}-${imageFile.name}`;
        const relativePath = `/products/${filename}`;
        const absolutePath = path.join("public", relativePath);

        const buffer = Buffer.from(await imageFile.arrayBuffer());
        await fs.writeFile(absolutePath, buffer);
        return relativePath;
      }),
    );

    imagePaths = uploadedPaths.filter(Boolean);
  }

  try {
    await prisma.product.update({
      where: { id },
      data: {
        isAvailableForPurchase: false,
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

  revalidatePath("/");
  revalidatePath("/products");
  redirect("/admin/products");
}
