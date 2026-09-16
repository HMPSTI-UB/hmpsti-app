"use server"

import { db } from "@/db"
import { merch_orders, merch_order_items, merch_products, merch_product_sizes } from "@/db/schema"
import { eq, inArray, desc } from "drizzle-orm"

type CheckoutItemPayload = {
  productId: number;
  sizeId?: number | null;
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

    let totalAmount = 0;
    const orderItemsToInsert = [];

    // 2. Validasi stok & rakit order items
    for (const item of payload.items) {
      const product = productsInDb.find(p => p.id === item.productId);
      if (!product) return { error: "Produk tidak ditemukan." };

      if (product.availabilityType === "out_of_stock") {
        return { error: `Produk ${product.name} saat ini sedang habis.` };
      }

      if (!product.hasSizes) {
        // Cek overselling dini
        const currentStock = product.stock || 0;
        if (item.quantity > currentStock) {
          return { error: `Stok produk ${product.name} tidak mencukupi. Sisa stok: ${currentStock}.` };
        }
      }

      let sizeNameSnapshot = null;
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

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;

      orderItemsToInsert.push({
        productId: product.id,
        productNameSnapshot: product.name,
        productPriceSnapshot: product.price,
        sizeId: item.sizeId || null,
        sizeNameSnapshot,
        quantity: item.quantity,
        subtotal,
      });
    }

    // 3. Generate Order Code unik global (ORD-YYYYMMDD-XXXX)
    const today = new Date();
    const dateStr = today.getFullYear().toString() + 
                    (today.getMonth() + 1).toString().padStart(2, '0') + 
                    today.getDate().toString().padStart(2, '0');
    
    // Ambil ID pesanan terakhir untuk nomor urut
    const latestOrder = await db.select({ id: merch_orders.id })
                                .from(merch_orders)
                                .orderBy(desc(merch_orders.id))
                                .limit(1);
    
    const nextSeq = latestOrder.length > 0 ? latestOrder[0].id + 1 : 1;
    const orderCode = `ORD-${dateStr}-${nextSeq.toString().padStart(4, '0')}`;

    // 4. Lakukan Insert (Neon HTTP Driver tidak support db.transaction secara utuh, kita insert manual.
    // Jika insert item gagal, rollback manual menghapus order).
    
    const [insertedOrder] = await db.insert(merch_orders).values({
      orderCode,
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
      // Rollback manual (hapus order jika items gagal)
      await db.delete(merch_orders).where(eq(merch_orders.id, insertedOrder.id));
      console.error("Gagal insert order items, order di-rollback", itemErr);
      return { error: "Gagal menyimpan rincian pesanan. Silakan coba lagi." };
    }

    return { success: true, orderCode };
  } catch (error: any) {
    console.error("Error creating order:", error);
    // Jika gagal constraint unique order_code
    if (error.code === '23505' && error.constraint === 'merch_orders_order_code_unique') {
      return { error: "Sistem sibuk (tabrakan nomor pesanan), silakan coba lagi sesaat lagi." };
    }
    return { error: "Terjadi kesalahan sistem saat membuat pesanan." };
  }
}
