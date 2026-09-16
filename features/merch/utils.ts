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
