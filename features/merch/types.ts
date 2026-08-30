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
  stock: number | null;
  forcePreorder?: boolean;
  sizes?: SizeFormData[];
};

export type SizeFormData = {
  sizeName: string;
  stock: number | "";
  _id?: string;
  _isCustom?: boolean;
};

export type PublicProductSize = {
  id: number;
  sizeName: string;
  stock: number | null;
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
  stock: number | null;
  availabilityType: "ready" | "out_of_stock" | "preorder";
  sizes: PublicProductSize[];
};
