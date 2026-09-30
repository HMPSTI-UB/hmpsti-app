export function calculateAvailability(
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

export function variantPrice(variant: { price: number | null } | undefined, mainPrice: number): number {
  if (variant && variant.price != null) return variant.price;
  return mainPrice;
}

export function formatPriceRange(
  mainPrice: number,
  variants: { price: number | null }[]
): { from: number; to: number } | null {
  if (!variants || variants.length === 0) return null;
  const prices = variants.map((v) => variantPrice(v, mainPrice));
  const from = Math.min(...prices);
  const to = Math.max(...prices);
  return { from, to };
}