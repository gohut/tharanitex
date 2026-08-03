export interface Product {
  id: number;
  name: string;
  description: string | null;
  price_cents: number;
  image_key: string | null;
  stock: number;
  is_published: number; // 1 or 0
  created_at: string;
  updated_at: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price_cents: number;
  image_key?: string;
  stock?: number;
  is_published?: boolean | number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price_cents?: number;
  image_key?: string;
  stock?: number;
  is_published?: boolean | number;
}
