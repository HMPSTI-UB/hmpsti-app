export type ProductQueryParams = {
  page?: number;
  pageSize?: number | "ALL";
  search?: string;
  categoryId?: number;
  availability?: "ready" | "out_of_stock" | "preorder";
};

export type CategoryFormData = {
  name: string;
  slug: string;
};

export type ProductFormData = {
  categoryId: number | null;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  hasSizes: boolean;
  hasVariants: boolean;
  stock: number | null;
  forcePreorder?: boolean;
  sizes?: SizeFormData[];
  variants?: VariantFormData[];
};

export type SizeFormData = {
  sizeName: string;
  stock: number | "";
  _id?: string;
  _isCustom?: boolean;
};

export type VariantFormData = {
  name: string;
  price: number | "";
  stock: number | "";
  imageUrl?: string;
  _id?: string;
  _isCustom?: boolean;
};

export type CategoryOption = {
  id: number;
  name: string;
  slug: string;
};

export type AdminProduct = {
  id: number;
  categoryId: number | null;
  categoryName: string | null;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  hasSizes: boolean;
  hasVariants: boolean;
  stock: number | null;
  availabilityType: "ready" | "out_of_stock" | "preorder";
  createdAt: Date;
  priceFrom?: number | null;
  priceTo?: number | null;
};

export type PublicProductSize = {
  id: number;
  sizeName: string;
  stock: number | null;
};

export type PublicProductVariant = {
  id: number;
  name: string;
  price: number | null;
  stock: number;
  imageUrl: string | null;
};

export type PublicProduct = {
  id: number;
  name: string;
  categoryId: number | null;
  categoryName: string | null;
  categorySlug: string | null;
  description: string | null;
  price: number;
  images: string[];
  hasSizes: boolean;
  hasVariants: boolean;
  stock: number | null;
  availabilityType: "ready" | "out_of_stock" | "preorder";
  sizes: PublicProductSize[];
  variants: PublicProductVariant[];
  priceFrom: number | null;
  priceTo: number | null;
};
