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
  image: string;
  hasSizes: boolean;
  stock: number | null;
  forcePreorder?: boolean;
};

export type SizeFormData = {
  sizeName: string;
  stock: number;
};
