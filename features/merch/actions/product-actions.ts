"use server"

import { db } from "@/db"
import { merch_categories, merch_products, merch_product_sizes, merch_product_images } from "@/db/schema"
import { eq, count, ilike, and, desc, sql, inArray } from "drizzle-orm"
import { requireUser, revalidateAll } from "./_guards"
import { ProductFormData, ProductQueryParams } from "../types"
import { deleteImageFromCloudinary } from "./upload-actions"

function calculateAvailability(
  hasSizes: boolean,
  stock: number | null,
  forcePreorder?: boolean
) {
  if (hasSizes) {
    return "preorder";
  }
  if (forcePreorder) {
    return "preorder";
  }
  if (stock !== null && stock > 0) {
    return "ready";
  }
  return "out_of_stock";
}

export async function getAdminProducts({
  page = 1,
  pageSize = 10,
  search = "",
  categoryId,
  availability,
}: ProductQueryParams = {}) {
  await requireUser();

  const conditions = [];

  if (search) {
    conditions.push(ilike(merch_products.name, `%${search}%`));
  }
  if (categoryId) {
    conditions.push(eq(merch_products.categoryId, categoryId));
  }
  if (availability) {
    conditions.push(eq(merch_products.availabilityType, availability));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const baseQuery = db
    .select({
      id: merch_products.id,
      categoryId: merch_products.categoryId,
      categoryName: merch_categories.name,
      name: merch_products.name,
      price: merch_products.price,
      hasSizes: merch_products.hasSizes,
      stock: merch_products.stock,
      availabilityType: merch_products.availabilityType,
      createdAt: merch_products.createdAt,
    })
    .from(merch_products)
    .leftJoin(merch_categories, eq(merch_products.categoryId, merch_categories.id))
    .where(where)
    .orderBy(desc(merch_products.createdAt));

  const countQuery = db
    .select({ total: count(merch_products.id) })
    .from(merch_products)
    .where(where);

  let rawProducts;
  let total;

  if (pageSize === "ALL") {
    const [productsRes, [{ total: totalRes }]] = await Promise.all([
      baseQuery,
      countQuery,
    ]);
    rawProducts = productsRes;
    total = totalRes;
  } else {
    const offset = (page - 1) * pageSize;
    const [productsRes, [{ total: totalRes }]] = await Promise.all([
      baseQuery.limit(pageSize).offset(offset),
      countQuery,
    ]);
    rawProducts = productsRes;
    total = totalRes;
  }

  const productIds = rawProducts.map((p) => p.id);
  let allImages: { productId: number; imageUrl: string }[] = [];

  if (productIds.length > 0) {
    allImages = await db
      .select({ productId: merch_product_images.productId, imageUrl: merch_product_images.imageUrl })
      .from(merch_product_images)
      .where(inArray(merch_product_images.productId, productIds))
      .orderBy(merch_product_images.displayOrder);
  }

  const products = rawProducts.map((p) => {
    return {
      ...p,
      images: allImages.filter((img) => img.productId === p.id).map((img) => img.imageUrl),
    };
  });

  return { products, total };
}

export async function getProductSizes(productId: number) {
  await requireUser();
  const sizes = await db
    .select({
      sizeName: merch_product_sizes.sizeName,
      stock: merch_product_sizes.stock,
    })
    .from(merch_product_sizes)
    .where(eq(merch_product_sizes.productId, productId));
  
  return sizes;
}

export async function createProduct(data: ProductFormData) {
  await requireUser();

  if (!data.images || data.images.length < 2 || data.images.length > 4) {
    return { error: "Produk harus memiliki antara 2 hingga 4 gambar." };
  }

  if (data.hasSizes) {
    if (!data.sizes || data.sizes.length === 0) {
      return { error: "Produk dengan ukuran harus memiliki minimal 1 varian ukuran." };
    }
    const sizeNames = data.sizes.map((s) => s.sizeName.toLowerCase());
    const uniqueSizeNames = new Set(sizeNames);
    if (uniqueSizeNames.size !== sizeNames.length) {
      return { error: "Terdapat nama ukuran yang duplikat. Nama ukuran harus unik." };
    }
  }

  let insertedProductId: number | null = null;

  try {
    const availabilityType = calculateAvailability(data.hasSizes, data.stock, data.forcePreorder);
    const finalStock = data.hasSizes ? null : (data.stock ?? 0);

    const [product] = await db.insert(merch_products).values({
      categoryId: data.categoryId,
      name: data.name,
      description: data.description,
      price: data.price,
      hasSizes: data.hasSizes,
      stock: finalStock,
      availabilityType,
    }).returning({ id: merch_products.id });

    insertedProductId = product.id;

    const imageValues = data.images.map((url, index) => ({
      productId: product.id,
      imageUrl: url,
      displayOrder: index + 1,
    }));

    await db.insert(merch_product_images).values(imageValues);

    if (data.hasSizes && data.sizes) {
      const sizeValues = data.sizes.map((s) => ({
        productId: product.id,
        sizeName: s.sizeName,
        stock: s.stock === "" ? 0 : s.stock,
      }));
      await db.insert(merch_product_sizes).values(sizeValues);
    }
  } catch (err) {
    if (insertedProductId) {
      // Rollback: Cloudinary -> Database
      for (const url of data.images) {
        try {
          await deleteImageFromCloudinary(url);
        } catch (cloudinaryErr) {
          console.error("Gagal menghapus gambar saat rollback:", cloudinaryErr);
        }
      }
      try {
        await db.delete(merch_products).where(eq(merch_products.id, insertedProductId));
      } catch (rollbackErr) {
        return { error: "Gagal menyimpan data DAN gagal membatalkan produk. Terdapat produk sisa (orphan), mohon cek manual." };
      }
      return { error: "Gagal menyimpan ukuran atau gambar. Produk berhasil dibatalkan." };
    }
    return { error: "Terjadi kesalahan saat menambahkan produk." };
  }

  revalidateAll();
}

export async function updateProduct(id: number, data: ProductFormData) {
  await requireUser();

  if (!data.images || data.images.length < 2 || data.images.length > 4) {
    return { error: "Produk harus memiliki antara 2 hingga 4 gambar." };
  }

  if (data.hasSizes) {
    if (!data.sizes || data.sizes.length === 0) {
      return { error: "Produk dengan ukuran harus memiliki minimal 1 varian ukuran." };
    }
    const sizeNames = data.sizes.map((s) => s.sizeName.toLowerCase());
    const uniqueSizeNames = new Set(sizeNames);
    if (uniqueSizeNames.size !== sizeNames.length) {
      return { error: "Terdapat nama ukuran yang duplikat. Nama ukuran harus unik." };
    }
  }

  try {
    const availabilityType = calculateAvailability(data.hasSizes, data.stock, data.forcePreorder);
    const finalStock = data.hasSizes ? null : (data.stock ?? 0);

    const oldImages = await db.select({ imageUrl: merch_product_images.imageUrl }).from(merch_product_images).where(eq(merch_product_images.productId, id));
    
    // Find images that were deleted from UI and remove them from Cloudinary
    const newImageSet = new Set(data.images);
    const imagesToDelete = oldImages.map(img => img.imageUrl).filter(url => !newImageSet.has(url));

    for (const url of imagesToDelete) {
      await deleteImageFromCloudinary(url).catch(console.error); // Catch individually to not block the DB update if Cloudinary fails, or we can throw. Let's catch so it doesn't block update.
    }

    const updateOp = db.update(merch_products)
      .set({
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        price: data.price,
        hasSizes: data.hasSizes,
        stock: finalStock,
        availabilityType,
        updatedAt: sql`now()`,
      })
      .where(eq(merch_products.id, id));

    const imageValues = data.images.map((url, index) => ({
      productId: id,
      imageUrl: url,
      displayOrder: index + 1,
    }));

    const deleteOldImagesOp = db.delete(merch_product_images).where(eq(merch_product_images.productId, id));
    const insertNewImagesOp = db.insert(merch_product_images).values(imageValues);

    const deleteSizesOp = db.delete(merch_product_sizes).where(eq(merch_product_sizes.productId, id));
    
    if (!data.hasSizes) {
      await db.batch([updateOp, deleteOldImagesOp, insertNewImagesOp, deleteSizesOp]);
    } else {
      const sizeValues = (data.sizes || []).map((s) => ({
        productId: id,
        sizeName: s.sizeName,
        stock: s.stock === "" ? 0 : s.stock,
      }));
      const insertNewSizesOp = db.insert(merch_product_sizes).values(sizeValues);
      
      await db.batch([updateOp, deleteOldImagesOp, insertNewImagesOp, deleteSizesOp, insertNewSizesOp]);
    }
  } catch (err) {
    return { error: "Terjadi kesalahan saat memperbarui produk." };
  }

  revalidateAll();
}

export async function deleteProduct(id: number) {
  await requireUser();

  try {
    const productImages = await db.select({ imageUrl: merch_product_images.imageUrl })
      .from(merch_product_images)
      .where(eq(merch_product_images.productId, id));

    if (productImages.length === 0) {
      // Just in case it's an orphan product
      const productRows = await db.select({ id: merch_products.id }).from(merch_products).where(eq(merch_products.id, id)).limit(1);
      if (productRows.length === 0) return { error: "Produk tidak ditemukan." };
    }

    for (const img of productImages) {
      await deleteImageFromCloudinary(img.imageUrl);
    }

    await db.delete(merch_products).where(eq(merch_products.id, id));
  } catch {
    return { error: "Gagal menghapus produk atau gambar terkait dari Cloudinary." };
  }

  revalidateAll();
}
