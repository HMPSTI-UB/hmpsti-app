"use server"

import { db } from "@/db"
import { merch_categories, merch_products, merch_product_sizes, merch_product_variants, merch_product_images } from "@/db/schema"
import { eq, inArray, desc } from "drizzle-orm"
import { PublicProduct, PublicProductSize, PublicProductVariant } from "../types"
import { formatPriceRange } from "../utils"

export async function getPublicCategories() {
  return await db.select().from(merch_categories).orderBy(desc(merch_categories.id));
}

export async function getPublicProducts(): Promise<PublicProduct[]> {
  const productsRows = await db
    .select({
      id: merch_products.id,
      categoryId: merch_products.categoryId,
      categoryName: merch_categories.name,
      categorySlug: merch_categories.slug,
      name: merch_products.name,
      description: merch_products.description,
      price: merch_products.price,
      hasSizes: merch_products.hasSizes,
      hasVariants: merch_products.hasVariants,
      stock: merch_products.stock,
      availabilityType: merch_products.availabilityType,
    })
    .from(merch_products)
    .leftJoin(merch_categories, eq(merch_products.categoryId, merch_categories.id))
    .orderBy(desc(merch_products.createdAt));

  const productIds = productsRows.map((p) => p.id);

  let allImages: { productId: number; imageUrl: string }[] = [];
  if (productIds.length > 0) {
    allImages = await db
      .select({ productId: merch_product_images.productId, imageUrl: merch_product_images.imageUrl })
      .from(merch_product_images)
      .where(inArray(merch_product_images.productId, productIds))
      .orderBy(merch_product_images.displayOrder);
  }

  let allSizes: { productId: number; id: number; sizeName: string; stock: number | null }[] = [];
  if (productIds.length > 0) {
    allSizes = await db
      .select({
        productId: merch_product_sizes.productId,
        id: merch_product_sizes.id,
        sizeName: merch_product_sizes.sizeName,
        stock: merch_product_sizes.stock,
      })
      .from(merch_product_sizes)
      .where(inArray(merch_product_sizes.productId, productIds));
  }

  let allVariants: { productId: number; id: number; name: string; price: number | null; stock: number; imageUrl: string | null }[] = [];
  if (productIds.length > 0) {
    allVariants = await db
      .select({
        productId: merch_product_variants.productId,
        id: merch_product_variants.id,
        name: merch_product_variants.name,
        price: merch_product_variants.price,
        stock: merch_product_variants.stock,
        imageUrl: merch_product_variants.imageUrl,
      })
      .from(merch_product_variants)
      .where(inArray(merch_product_variants.productId, productIds));
  }

  return productsRows.map((p) => {
    const variants: PublicProductVariant[] = allVariants
      .filter((v) => v.productId === p.id)
      .map((v) => ({ id: v.id, name: v.name, price: v.price, stock: v.stock, imageUrl: v.imageUrl }));
    const range = p.hasVariants ? formatPriceRange(p.price, variants) : null;
    return {
      ...p,
      images: allImages.filter((img) => img.productId === p.id).map((img) => img.imageUrl),
      sizes: allSizes.filter((s) => s.productId === p.id).map((s) => ({
        id: s.id,
        sizeName: s.sizeName,
        stock: s.stock,
      })),
      variants,
      priceFrom: range?.from ?? null,
      priceTo: range?.to ?? null,
    };
  });
}

export async function getPublicProductById(id: number): Promise<PublicProduct | null> {
  const [productRow] = await db
    .select({
      id: merch_products.id,
      categoryId: merch_products.categoryId,
      categoryName: merch_categories.name,
      categorySlug: merch_categories.slug,
      name: merch_products.name,
      description: merch_products.description,
      price: merch_products.price,
      hasSizes: merch_products.hasSizes,
      hasVariants: merch_products.hasVariants,
      stock: merch_products.stock,
      availabilityType: merch_products.availabilityType,
    })
    .from(merch_products)
    .leftJoin(merch_categories, eq(merch_products.categoryId, merch_categories.id))
    .where(eq(merch_products.id, id))
    .limit(1);

  if (!productRow) return null;

  const images = await db
    .select({ imageUrl: merch_product_images.imageUrl })
    .from(merch_product_images)
    .where(eq(merch_product_images.productId, id))
    .orderBy(merch_product_images.displayOrder);

  const sizes = await db
    .select({
      id: merch_product_sizes.id,
      sizeName: merch_product_sizes.sizeName,
      stock: merch_product_sizes.stock,
    })
    .from(merch_product_sizes)
    .where(eq(merch_product_sizes.productId, id));

  const variants = await db
    .select({
      id: merch_product_variants.id,
      name: merch_product_variants.name,
      price: merch_product_variants.price,
      stock: merch_product_variants.stock,
      imageUrl: merch_product_variants.imageUrl,
    })
    .from(merch_product_variants)
    .where(eq(merch_product_variants.productId, id));

  const publicVariants: PublicProductVariant[] = variants.map((v) => ({
    id: v.id,
    name: v.name,
    price: v.price,
    stock: v.stock,
    imageUrl: v.imageUrl,
  }));
  const range = productRow.hasVariants ? formatPriceRange(productRow.price, publicVariants) : null;

  return {
    ...productRow,
    images: images.map((img) => img.imageUrl),
    sizes: sizes.map((s) => ({
      id: s.id,
      sizeName: s.sizeName,
      stock: s.stock,
    })),
    variants: publicVariants,
    priceFrom: range?.from ?? null,
    priceTo: range?.to ?? null,
  };
}

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadPublicImage(formData: FormData): Promise<{ secure_url: string }> {
  const file = formData.get('file') as File;
  if (!file) throw new Error("No file provided");

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<{ secure_url: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'assets/hmpsti/merch/payment_proofs' },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Failed to upload image"));
        } else {
          resolve({ secure_url: result.secure_url });
        }
      }
    );
    
    uploadStream.end(buffer);
  });
}
