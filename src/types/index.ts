export type ProductStatus = 'SKLADEM' | 'PŘEDOBJEDNÁVKA' | 'VYPRODÁNO' | 'LIMITOVANÁ EDICE';

export interface ProductVariant {
  id: number;
  product_id: number;
  size: string;
  color: string;
  sku: string;
  stock: number;
  reserved_stock: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  category: string;
  price: number;
  sale_price: number | null;
  currency: string;
  sku: string;
  status: ProductStatus;
  is_featured: number;
  is_new_drop: number;
  release_date?: string | null;
  expected_shipping?: string | null;
  preorder_info?: string | null;
  description: string;
  material: string;
  grammage: string;
  fit: string;
  care_instructions: string;
  warranty: string;
  certificate_id?: string | null;
  primary_image: string;
  gallery: string[]; // parsed from JSON
  video_url?: string | null;
  model_3d_url?: string | null;
  variants?: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string; // unique combo of variantId or productId+size+color
  productId: number;
  variantId?: number;
  name: string;
  slug: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
  status: ProductStatus;
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  product_id: number;
  product_name: string;
  product_image: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  total: number;
}

export type OrderStatus = 'Přijato' | 'Zaplaceno' | 'Zpracovává se' | 'Odesláno' | 'Doručeno' | 'Stornováno' | 'Vráceno';
export type PaymentStatus = 'Čeká na platbu' | 'Zaplaceno' | 'Vráceno';

export interface Order {
  id: number;
  order_number: string;
  user_id?: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_street: string;
  shipping_city: string;
  shipping_zip: string;
  shipping_country: string;
  billing_street?: string | null;
  billing_city?: string | null;
  billing_zip?: string | null;
  billing_country?: string | null;
  delivery_method: string;
  delivery_pickup_point?: string | null;
  shipping_price: number;
  payment_method: string;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  carrier?: string | null;
  tracking_number?: string | null;
  tracking_link?: string | null;
  discount_code?: string | null;
  discount_amount: number;
  gift_card_code?: string | null;
  gift_card_amount: number;
  subtotal: number;
  total: number;
  internal_notes?: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface Review {
  id: number;
  product_id: number;
  customer_name: string;
  customer_email: string;
  rating: number;
  title: string;
  comment: string;
  photo_url?: string | null;
  verified_purchase: number;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  created_at: string;
}

export interface ReturnReclamation {
  id: number;
  type: 'RETURN' | 'RECLAMATION';
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  product_name: string;
  reason: string;
  description: string;
  photo_urls?: string[]; // parsed
  bank_account?: string | null;
  status: string;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DiscountCode {
  id: number;
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  min_order: number;
  max_uses?: number | null;
  times_used: number;
  expires_at?: string | null;
  is_active: number;
}

export interface GiftCard {
  id: number;
  code: string;
  initial_balance: number;
  current_balance: number;
  currency: string;
  recipient_email?: string | null;
  is_active: number;
  created_at: string;
}

export interface Appointment {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  type: string;
  date: string;
  time: string;
  notes?: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  created_at: string;
}

export interface CommunityPhoto {
  id: number;
  author_name: string;
  author_handle?: string | null;
  image_url: string;
  caption?: string | null;
  product_tagged?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}
