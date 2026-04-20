import type { Product } from '../data/products';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const API_ORIGIN = API_BASE_URL.startsWith('http') ? new URL(API_BASE_URL).origin : window.location.origin;

type RequestOptions = RequestInit & {
  skipJsonHeader?: boolean;
};

function resolveAssetUrl(path: string) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  if (path.startsWith('/uploads')) {
    return `${API_ORIGIN}${path}`;
  }
  return path;
}

export { resolveAssetUrl };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!options.skipJsonHeader && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || 'Request failed');
  }
  return payload as T;
}

function normalizeProduct(product: any): Product {
  const sizeStock = product.sizeStock || {};
  const sizes = Array.isArray(product.sizes) ? product.sizes : Object.keys(sizeStock);
  const stock = typeof product.stock === 'number'
    ? product.stock
    : sizes.reduce((sum: number, size: string) => sum + Number(sizeStock[size] || 0), 0);

  // Resolve all images in the gallery
  const rawImages: string[] = Array.isArray(product.images) && product.images.length
    ? product.images
    : [product.image].filter(Boolean);
  const images = rawImages.map(resolveAssetUrl);

  return {
    id: String(product.id),
    name: product.name,
    price: Number(product.price),
    discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
    sku: product.sku || '',
    tags: Array.isArray(product.tags) ? product.tags : [],
    category: product.category,
    image: images[0] || '',
    images,
    description: product.description,
    sizes,
    sizeStock,
    stock,
    isNewArrival: Boolean(product.isNewArrival),
    isBestSeller: Boolean(product.isBestSeller),
    isOnOffer: Boolean(product.isOnOffer),
    isCarousel: Boolean(product.isCarousel),
    // Product details
    washCare: product.washCare || '',
    sleeve: product.sleeve || '',
    pattern: product.pattern || '',
    packageContents: product.packageContents || '',
    netQuantity: product.netQuantity ? Number(product.netQuantity) : undefined,
    material: product.material || '',
    fitType: product.fitType || '',
    shippingInfo: product.shippingInfo || '',
    returnPolicy: product.returnPolicy || '',
    // Social proof
    socialProofCount: product.socialProofCount ? Number(product.socialProofCount) : 855,
    socialProof24hrs: product.socialProof24hrs ? Number(product.socialProof24hrs) : 9,
    isTrending: Boolean(product.isTrending),
    // Stats
    statsCustomers: product.statsCustomers || '3M+',
    statsOrders: product.statsOrders || '2L+',
    statsStores: product.statsStores || '5+',
  };
}

export async function fetchProducts(params?: Record<string, string>) {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
  const response = await request<{ items: any[] }>(`/products${queryString}`);
  return response.items.map(normalizeProduct);
}

export async function fetchProductById(id: string) {
  const product = await request<any>(`/products/${id}`);
  return normalizeProduct(product);
}

export async function fetchOfferProducts() {
  const response = await request<{ items: any[] }>('/products?isOnOffer=true');
  return response.items.map(normalizeProduct);
}

export async function fetchCarouselProducts() {
  const response = await request<{ items: any[] }>('/products/carousel');
  return response.items.map(normalizeProduct);
}

export async function adminToggleCarousel(productId: string, isCarousel: boolean) {
  return request<{ message: string }>(`/products/${productId}/carousel`, {
    method: 'PATCH',
    headers: { ...authHeaders() },
    body: JSON.stringify({ isCarousel }),
  });
}

// ── Carousel Items (new table-based) ──────────────────────────────────────

export interface CarouselItem {
  id: number;
  type: 'product' | 'image' | 'video';
  productId: string | null;
  mediaUrl: string | null;
  title: string;
  subtitle: string;
  image: string;
  linkUrl: string;
  sortOrder: number;
}

export async function fetchCarouselItems(): Promise<CarouselItem[]> {
  const resp = await request<{ items: CarouselItem[] }>('/carousel');
  return resp.items.map(item => ({
    ...item,
    image: item.image ? resolveAssetUrl(item.image) : '',
    mediaUrl: item.mediaUrl ? resolveAssetUrl(item.mediaUrl) : null,
  }));
}

export async function adminAddProductToCarousel(productId: string, sortOrder = 0) {
  return request<{ message: string }>('/carousel/product', {
    method: 'POST',
    headers: { ...authHeaders() },
    body: JSON.stringify({ productId, sortOrder }),
  });
}

export async function adminAddImageToCarousel(file: File, title: string, subtitle: string, linkUrl: string) {
  const form = new FormData();
  form.append('image', file);
  form.append('title', title);
  form.append('subtitle', subtitle);
  form.append('linkUrl', linkUrl);
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/carousel/image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(err.message || 'Upload failed');
  }
  return res.json();
}

export async function adminAddVideoToCarousel(file: File, title: string, subtitle: string, linkUrl: string) {
  const form = new FormData();
  form.append('video', file);
  form.append('title', title);
  form.append('subtitle', subtitle);
  form.append('linkUrl', linkUrl);
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/carousel/video`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(err.message || 'Upload failed');
  }
  return res.json();
}

export async function adminDeleteCarouselItem(id: number) {
  return request<{ message: string }>(`/carousel/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
}

export async function adminReorderCarousel(order: { id: number; sortOrder: number }[]) {
  return request<{ message: string }>('/carousel/reorder', {
    method: 'POST',
    headers: { ...authHeaders() },
    body: JSON.stringify({ order }),
  });
}

interface PaymentIntentPayload {
  amount: number;
  paymentMethod: 'upi' | 'card' | 'netbanking';
  customerEmail?: string;
}

export interface PaymentIntentResponse {
  provider: 'demo' | 'razorpay';
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
  keyId?: string;
}

export async function createPaymentIntent(payload: PaymentIntentPayload) {
  return request<PaymentIntentResponse>('/payments/intent', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

interface ShippingPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface OrderPayload {
  paymentMethod: 'upi' | 'card' | 'netbanking';
  paymentProvider: string;
  paymentOrderId: string;
  paymentReference: string;
  paymentSignature?: string;
  couponCode?: string;
  items: Array<{ productId: number; quantity: number; size: string }>;
  shipping: ShippingPayload;
}

export async function createOrder(payload: OrderPayload) {
  return request<{ orderId: string }>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

async function loadRazorpaySdk() {
  if (window.Razorpay) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(intent: PaymentIntentResponse, shipping: ShippingPayload) {
  await loadRazorpaySdk();

  return new Promise<{ paymentId: string; signature: string }>((resolve, reject) => {
    const razorpay = new window.Razorpay({
      key: intent.keyId,
      amount: intent.amount,
      currency: intent.currency,
      name: 'INOUT Fashion',
      description: 'Clothing store checkout',
      order_id: intent.orderId,
      prefill: {
        name: `${shipping.firstName} ${shipping.lastName}`,
        email: shipping.email,
        contact: shipping.phone,
      },
      handler: (response: { razorpay_payment_id: string; razorpay_signature: string }) => {
        resolve({
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: () => reject(new Error('Payment was cancelled')),
      },
    });

    razorpay.on('payment.failed', (event: any) => {
      reject(new Error(event.error?.description || 'Payment failed'));
    });

    razorpay.open();
  });
}

// ── Auth helpers ───────────────────────────────────────────────────────────
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

export function getAuthToken() {
  if (!authToken) {
    authToken = localStorage.getItem('auth_token');
  }
  return authToken;
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Auth API ──────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

export async function loginUser(email: string, password: string) {
  return request<{ user: AuthUser; token: string }>('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}) {
  return request<{ user: AuthUser; token: string }>('/users/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ── Admin: Orders ─────────────────────────────────────────────────────────
export interface OrderSummary {
  id: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  shippingAmount: number;
  totalAmount: number;
  customerName: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  image: string;
  size: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderDetail extends OrderSummary {
  shipping: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
}

export async function fetchAllOrders() {
  return request<{ items: OrderSummary[] }>('/orders', {
    headers: authHeaders(),
  });
}

export async function fetchOrderById(id: string) {
  return request<OrderDetail>(`/orders/${id}`);
}

export async function updateOrderStatus(id: string, status: string) {
  return request<{ message: string; status: string }>(`/orders/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
}

export async function updatePaymentStatus(id: string, paymentStatus: string) {
  return request<{ message: string; paymentStatus: string }>(`/orders/${id}/payment-status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ paymentStatus }),
  });
}

export interface MyOrderSummary extends OrderSummary {
  items: OrderItem[];
}

export async function fetchMyOrders(email: string) {
  return request<{ items: MyOrderSummary[] }>(`/orders/my-orders?email=${encodeURIComponent(email)}`);
}

// ── Admin: Products ───────────────────────────────────────────────────────
export async function adminCreateProduct(formData: FormData) {
  return request<{ message: string; product: any }>('/products', {
    method: 'POST',
    headers: { ...authHeaders() },
    body: formData,
    skipJsonHeader: true,
  });
}

export async function adminUpdateProduct(id: string, formData: FormData) {
  return request<{ message: string; product: any }>(`/products/${id}`, {
    method: 'PUT',
    headers: { ...authHeaders() },
    body: formData,
    skipJsonHeader: true,
  });
}

export async function adminDeleteProduct(id: string) {
  return request<{ message: string }>(`/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

// ── Coupons ───────────────────────────────────────────────────────────────
export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export async function fetchCoupons() {
  return request<{ items: Coupon[] }>('/coupons', { headers: authHeaders() });
}

export async function adminCreateCoupon(data: Partial<Coupon>) {
  return request<{ message: string; coupon: Coupon }>('/coupons', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
}

export async function adminUpdateCoupon(id: string, data: Partial<Coupon>) {
  return request<{ message: string; coupon: Coupon }>(`/coupons/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
}

export async function adminDeleteCoupon(id: string) {
  return request<{ message: string }>(`/coupons/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

export async function validateCoupon(code: string, subtotal: number) {
  return request<{ valid: boolean; code: string; type: string; value: number; discount: number }>(
    '/coupons/validate',
    { method: 'POST', body: JSON.stringify({ code, subtotal }) },
  );
}

// ── Customers ─────────────────────────────────────────────────────────────
export interface CustomerSummary {
  userId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  firstOrderDate: string;
}

export async function fetchCustomers() {
  return request<{ items: CustomerSummary[] }>('/customers', { headers: authHeaders() });
}

export async function fetchCustomerOrders(email: string) {
  return request<{ items: { id: string; status: string; paymentStatus: string; totalAmount: number; createdAt: string }[] }>(
    `/customers/${encodeURIComponent(email)}/orders`,
    { headers: authHeaders() },
  );
}

// ── Analytics ─────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalDiscounts: number;
  totalProducts: number;
  inactiveProducts: number;
  totalStock: number;
  outOfStockSizes: number;
  lowStockSizes: number;
  totalCustomers: number;
}

export async function fetchDashboardStats() {
  return request<DashboardStats>('/analytics/stats', { headers: authHeaders() });
}

export async function fetchRevenueChart(days = 30) {
  return request<{ items: { date: string; orders: number; revenue: number }[] }>(
    `/analytics/revenue?days=${days}`,
    { headers: authHeaders() },
  );
}

export async function fetchBestSellers(limit = 10) {
  return request<{ items: { productId: string; productName: string; image: string; totalSold: number; totalRevenue: number; orderCount: number }[] }>(
    `/analytics/best-sellers?limit=${limit}`,
    { headers: authHeaders() },
  );
}

export async function fetchOrdersByStatus() {
  return request<Record<string, number>>('/analytics/orders-by-status', { headers: authHeaders() });
}

// ── Reviews ───────────────────────────────────────────────────────────────
export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export async function fetchReviews(params?: { productId?: string; approved?: string }) {
  const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
  return request<{ items: Review[] }>(`/reviews${qs}`, { headers: authHeaders() });
}

export async function approveReview(id: string) {
  return request<{ message: string }>(`/reviews/${id}/approve`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
}

export async function deleteReview(id: string) {
  return request<{ message: string }>(`/reviews/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

// ── Orders: Bulk ──────────────────────────────────────────────────────────
export async function bulkUpdateOrderStatus(orderIds: string[], status: string) {
  return request<{ message: string; affectedRows: number }>('/orders/bulk-status', {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ orderIds: orderIds.map(Number), status }),
  });
}

// ── Admin Settings: Mobile & Password ─────────────────────────────────────
export async function adminGetMobile() {
  return request<{ mobile: string | null }>('/users/admin/mobile', {
    headers: authHeaders(),
  });
}

export async function adminRegisterMobile(mobile: string) {
  return request<{ message: string }>('/users/admin/mobile', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ mobile }),
  });
}

export async function adminUpdateMobile(mobile: string, password: string) {
  return request<{ message: string }>('/users/admin/mobile', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ mobile, password }),
  });
}

export async function adminRequestOtp() {
  return request<{ message: string; devOtp?: string }>('/users/admin/request-otp', {
    method: 'POST',
    headers: authHeaders(),
  });
}

export async function adminChangePassword(otp: string, newPassword: string) {
  return request<{ message: string }>('/users/admin/change-password', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ otp, newPassword }),
  });
}

// ── Homepage Content ──────────────────────────────────────────────────────
export type RawHomepageContent = Record<string, Record<string, string>>;

export async function fetchHomepageContent() {
  return request<RawHomepageContent>('/content');
}

export async function updateContentSection(section: string, data: Record<string, string>) {
  return request<{ success: boolean; updated: number }>(`/content/${section}`, {
    method: 'PUT',
    headers: { ...authHeaders() },
    body: JSON.stringify(data),
  });
}

export async function uploadContentImageFile(file: File): Promise<{ path: string }> {
  const formData = new FormData();
  formData.append('image', file);
  return request<{ path: string }>('/content/upload/image', {
    method: 'POST',
    headers: { ...authHeaders() },
    body: formData,
    skipJsonHeader: true,
  });
}

export async function deleteContentImageFile(filePath: string) {
  return request<{ success: boolean }>('/content/upload/image', {
    method: 'DELETE',
    headers: { ...authHeaders() },
    body: JSON.stringify({ path: filePath }),
  });
}

// ── Public Reviews ────────────────────────────────────────────────────────
export type PublicReview = {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  productName: string;
  createdAt: string;
};

export async function fetchFeaturedReviews(limit = 4): Promise<PublicReview[]> {
  const data = await request<{ items: PublicReview[] }>(`/reviews/public?limit=${limit}`);
  return data.items;
}

export async function adminUpdateReview(id: string, payload: { customerName?: string; rating?: number; comment?: string; productName?: string }) {
  return request<{ message: string }>(`/reviews/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function adminCreateReview(payload: { customerName: string; rating: number; comment: string; productName?: string }) {
  return request<{ message: string; reviewId: string }>('/reviews/admin', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

// ── Shoppable Videos ─────────────────────────────────────────────────────
export interface ShoppableVideo {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  overlayText: string;
  price: number | null;
  discountPrice: number | null;
  sizes: string[];
  productLink: string;
  likes: number;
  views: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export async function fetchVideos(): Promise<ShoppableVideo[]> {
  const data = await request<{ items: ShoppableVideo[] }>('/videos');
  return data.items;
}

export async function adminFetchVideos(): Promise<ShoppableVideo[]> {
  const data = await request<{ items: ShoppableVideo[] }>('/videos', {
    headers: authHeaders(),
  });
  return data.items;
}

export async function adminCreateVideo(payload: Partial<ShoppableVideo>) {
  return request<ShoppableVideo>('/videos', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function adminUpdateVideo(id: number, payload: Partial<ShoppableVideo>) {
  return request<ShoppableVideo>(`/videos/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function adminDeleteVideo(id: number) {
  return request<{ message: string }>(`/videos/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

export async function adminUploadVideo(file: File): Promise<{ url: string }> {
  const token = getAuthToken();
  const form = new FormData();
  form.append('video', file);
  const res = await fetch(`${API_BASE_URL}/videos/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(err.message || 'Upload failed');
  }
  return res.json();
}

export async function adminDownloadInstagramVideo(instagramUrl: string): Promise<{ url: string }> {
  return request<{ url: string }>('/videos/download-instagram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ url: instagramUrl }),
  });
}

export async function videoIncrementViews(id: number) {
  return request<{ ok: boolean }>(`/videos/${id}/view`, { method: 'POST' });
}