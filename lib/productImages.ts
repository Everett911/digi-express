import { del, put } from "@vercel/blob";

// Product photos live in Vercel Blob: files written to public/ at runtime are
// not served by production builds and are lost on serverless hosts.

export function isImageFile(file: File) {
  return file.size > 0 && file.type.startsWith("image/");
}

export async function saveProductImage(file: File) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-80);
  const blob = await put(`products/${safeName}`, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type,
  });
  return blob.url;
}

// Older products use paths like "/products/x.png" that ship with the repo in
// public/; only Blob URLs are ours to delete.
export async function deleteProductImages(paths: string[]) {
  const blobUrls = paths.filter((p) => p.startsWith("https://"));
  if (blobUrls.length === 0) return;
  try {
    await del(blobUrls);
  } catch (error) {
    console.warn("Could not delete product images:", blobUrls, error);
  }
}
