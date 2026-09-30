"use server"

import { db } from "@/db"
import { merch_orders, merch_order_items, merch_products, merch_product_sizes, merch_product_variants } from "@/db/schema"
import { eq, inArray, desc } from "drizzle-orm"
import { requireUser } from "./_guards"

type CheckoutItemPayload = {
  productId: number;
  sizeId?: number | null;
  variantId?: number | null;
  quantity: number;
};

type CheckoutPayload = {
  buyerName: string;
  buyerContact: string;
  buyerAddress: string;
  buyerNote?: string;
  items: CheckoutItemPayload[];
  paymentProofUrl: string;
};

export async function createOrder(payload: CheckoutPayload) {
  try {
    const user = await requireUser().catch(() => null);
    if (!user) {
      return { error: "Silakan login terlebih dahulu untuk melakukan checkout." };
    }

    if (!payload.items || payload.items.length === 0) {
      return { error: "Keranjang belanja kosong." };
    }

    if (!payload.buyerName || !payload.buyerContact || !payload.buyerAddress || !payload.paymentProofUrl) {
      return { error: "Data pembeli dan bukti pembayaran wajib diisi lengkap." };
    }

    const productIds = payload.items.map(item => item.productId);

    // 1. Fetch data produk langsung dari DB untuk validasi harga dan stok
    const productsInDb = await db.select({
      id: merch_products.id,
      name: merch_products.name,
      price: merch_products.price,
      hasSizes: merch_products.hasSizes,
      hasVariants: merch_products.hasVariants,
      stock: merch_products.stock,
      availabilityType: merch_products.availabilityType,
    }).from(merch_products).where(inArray(merch_products.id, productIds));

    if (productsInDb.length !== new Set(productIds).size) {
      return { error: "Beberapa produk tidak ditemukan di database." };
    }

    // Fetch ukuran jika ada item yang memiliki sizeId
    const sizeIds = payload.items.filter(i => i.sizeId).map(i => i.sizeId as number);
    let sizesInDb: { id: number, sizeName: string, productId: number }[] = [];
    if (sizeIds.length > 0) {
      sizesInDb = await db.select({
        id: merch_product_sizes.id,
        sizeName: merch_product_sizes.sizeName,
        productId: merch_product_sizes.productId,
      }).from(merch_product_sizes).where(inArray(merch_product_sizes.id, sizeIds));
    }

    // Fetch varian jika ada item yang memiliki variantId
    const variantIds = payload.items.filter(i => i.variantId).map(i => i.variantId as number);
    let variantsInDb: { id: number, name: string, productId: number, price: number | null, stock: number }[] = [];
    if (variantIds.length > 0) {
      variantsInDb = await db.select({
        id: merch_product_variants.id,
        name: merch_product_variants.name,
        productId: merch_product_variants.productId,
        price: merch_product_variants.price,
        stock: merch_product_variants.stock,
      }).from(merch_product_variants).where(inArray(merch_product_variants.id, variantIds));
    }

    let totalAmount = 0;
    const orderItemsToInsert = [];

    // 2. Validasi stok & rakit order items
    for (const item of payload.items) {
      const product = productsInDb.find(p => p.id === item.productId);
      if (!product) return { error: "Produk tidak ditemukan." };

      if (product.availabilityType === "out_of_stock") {
        return { error: `Produk ${product.name} saat ini sedang habis.` };
      }

      let sizeNameSnapshot = null;
      let variantNameSnapshot = null;
      let unitPrice = product.price;

      if (product.hasSizes) {
        if (!item.sizeId) {
          return { error: `Produk ${product.name} membutuhkan pilihan ukuran.` };
        }
        const size = sizesInDb.find(s => s.id === item.sizeId);
        if (!size || size.productId !== product.id) {
          return { error: `Ukuran tidak valid untuk produk ${product.name}.` };
        }
        sizeNameSnapshot = size.sizeName;
      }

      if (product.hasVariants) {
        if (!item.variantId) {
          return { error: `Produk ${product.name} membutuhkan pilihan varian.` };
        }
        const variant = variantsInDb.find(v => v.id === item.variantId);
        if (!variant || variant.productId !== product.id) {
          return { error: `Varian tidak valid untuk produk ${product.name}.` };
        }
        if (item.quantity > variant.stock) {
          return { error: `Stok varian ${variant.name} (${variant.stock}) tidak mencukupi untuk memenuhi pesanan ini (diminta ${item.quantity}).` };
        }
        unitPrice = variant.price ?? product.price;
        variantNameSnapshot = variant.name;
      }

      if (!product.hasSizes && !product.hasVariants) {
        const currentStock = product.stock || 0;
        if (item.quantity > currentStock) {
          return { error: `Stok produk ${product.name} tidak mencukupi. Sisa stok: ${currentStock}.` };
        }
      }

      const subtotal = unitPrice * item.quantity;
      totalAmount += subtotal;

      orderItemsToInsert.push({
        productId: product.id,
        productNameSnapshot: product.name,
        productPriceSnapshot: unitPrice,
        sizeId: item.sizeId || null,
        sizeNameSnapshot,
        variantId: item.variantId || null,
        variantNameSnapshot,
        quantity: item.quantity,
        subtotal,
      });
    }

    // 3. Generate Order Code unik global (ORD-YYYYMMDD-XXXX)
    const today = new Date();
    const dateStr = today.getFullYear().toString() +
                    (today.getMonth() + 1).toString().padStart(2, '0') +
                    today.getDate().toString().padStart(2, '0');

    const latestOrder = await db.select({ id: merch_orders.id })
                                .from(merch_orders)
                                .orderBy(desc(merch_orders.id))
                                .limit(1);

    const nextSeq = latestOrder.length > 0 ? latestOrder[0].id + 1 : 1;
    const orderCode = `ORD-${dateStr}-${nextSeq.toString().padStart(4, '0')}`;

    const [insertedOrder] = await db.insert(merch_orders).values({
      orderCode,
      userId: user.id,
      buyerName: payload.buyerName,
      buyerContact: payload.buyerContact,
      buyerAddress: payload.buyerAddress,
      buyerNote: payload.buyerNote || null,
      totalAmount,
      paymentProofUrl: payload.paymentProofUrl,
      status: "MENUNGGU_VERIFIKASI",
    }).returning({ id: merch_orders.id });

    try {
      const itemsWithOrderId = orderItemsToInsert.map(item => ({
        ...item,
        orderId: insertedOrder.id,
      }));

      await db.insert(merch_order_items).values(itemsWithOrderId);
    } catch (itemErr) {
      await db.delete(merch_orders).where(eq(merch_orders.id, insertedOrder.id));
      console.error("Gagal insert order items, order di-rollback", itemErr);
      return { error: "Gagal menyimpan rincian pesanan. Silakan coba lagi." };
    }

    return { success: true, orderCode };
  } catch (error: any) {
    console.error("Error creating order:", error);
    if (error.code === '23505' && error.constraint === 'merch_orders_order_code_unique') {
      return { error: "Sistem sibuk (tabrakan nomor pesanan), silakan coba lagi sesaat lagi." };
    }
    return { error: "Terjadi kesalahan sistem saat membuat pesanan." };
  }
}