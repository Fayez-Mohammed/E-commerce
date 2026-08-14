// ================= Product & Catalog Types =================
export interface ProductOverview {
  id: number;
  name: string;
  price: number;
  priceAfterDiscount: number;
  totalPeopleRating?: number;
  averageRatingPeople?: number;
  categoryAr?: string;
  categoryEn?: string;
  categoryValue: string;
  imageUrl: string | null;
  isInWishList?: boolean;
  pageNumber?: number;
}

export interface ColorDto {
  colorId: number;
  colorName: string;
}

export interface ProductVariantDto {
  id: number;
  type: string;
  size: string;
  price: number;
  priceBeforeDiscount: number;
}

export interface ProductImageDto {
  path: string;
}

export interface ProductDetail {
  id: number;
  name: string;
  sku: string;
  price: number;
  averageRate: number;
  priceAfterDiscount: number;
  isInWishList: boolean;
  colors: ColorDto[];
  shortDescription: string;
  descriptions: string[];
  cateogryValue: string;
  category: string;
  images: ProductImageDto[];
  variants: ProductVariantDto[];
  pageNumber?: number;
}

export interface PagedResult<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  categoryName: string;
}

export interface QueryParameters {
  search?: string;
  order?: 'price_asc' | 'price_desc' | 'rating_asc' | 'rating_desc' | 'latest_asc' | 'latest_desc' | string;
  category?: string;
  page?: number;
  pageSize?: number;
  id?: number;
  LanguageCode?: 'ar' | 'en' | string;
  Ids?: number[];
}

// ================= Category Types =================
export interface CategoryItem {
  category: string;
  categoryValue: string;
  categoryImage: string;
}

export interface DashboardCategory {
  id: number;
  nameAR: string;
  nameEN: string;
  categoryValue: string;
  imageUrl: string;
}

// ================= Offer Types =================
export interface OfferItem {
  id: number;
  name: string;
  description: string;
  categoryAR?: string;
  categoryEN?: string;
  categoryValue?: string;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
}

export interface DashboardOffer {
  id: number;
  titleAR?: string;
  titleEN?: string;
  descriptionAR?: string;
  descriptionEN?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isRunning: boolean;
  categoryAR?: string;
  categoryEN?: string;
  categoryValue?: string;
  imageUrl?: string;
}

// ================= Cart Types =================
export interface CartItem {
  productId: number;
  variantId: number;
  productName: string;
  type: string;
  size: string;
  color: string;
  colorId: number;
  englishColor: string;
  unitPrice: number;
  originalPrice: number;
  quantity: number;
  imageUrl: string;
}

export interface OrderSummary {
  totalOriginalPrice: number;
  totalDiscount: number;
  totalPrice: number;
  totalProductsCount: number;
  count: number;
}

export interface CartResponse {
  items: CartItem[];
  summary: OrderSummary;
}

export interface GetCartDto {
  shoppingCart?: {
    items: CartItem[];
    userId?: string;
  };
}

export interface UpdateQuantityDto {
  productId: number;
  varianceId: number;
  quantity: number;
  colorId: number;
}

// ================= Order Types =================
export interface CreateOrderDto {
  fullName: string;
  address: string;
  phoneNumber: string;
  note?: string;
}

export interface OrderDashboardDto {
  id: number;
  customerName?: string;
  customerEmail?: string;
  phoneNumber?: string;
  address?: string;
  orderDate?: string;
  itemsCount: number;
  totalPrice: number;
  status?: 'Pending' | 'Confirmed' | 'Canceled' | string;
  note?: string;
}

export interface OrderItemDetail {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  color?: string | null;
  size?: string | null;
  type?: string | null;
  imageUrl?: string[] | string | null;
  variantId?: number;
}

export interface OrderFullDetail extends OrderDashboardDto {
  items?: OrderItemDetail[];
  orderDetailsList?: OrderItemDetail[];
  statusArabic?: string;
}

// ================= Auth & User Types =================
export interface UserInfo {
  name: string;
  email: string;
  phoneNumber: string;
  role: string[];
}

export interface LoginResponse {
  email: string;
  token: string;
}

export interface CustomerReturnDto {
  rowNum: number;
  id: string;
  createdAt: string;
  userName: string;
  name?: string;
  email: string;
  phoneNumber: string;
  status: string;
  isBlocked?: boolean;
}

export type CustomerDto = CustomerReturnDto;

// ================= Review Types =================
export interface SingleReview {
  id: number;
  comment: string;
  rating?: number;
  rate?: number;
  userName: string;
  email?: string;
  phoneNumber?: string;
  productId?: number;
  productName?: string;
  reviewDate?: string;
  isUserCanDelete?: boolean;
  createdAt?: string;
}

export type ReviewItem = SingleReview;
export type AdminReviewDto = SingleReview;

export interface ReviewResponse {
  productId: number;
  averageRating: number;
  totalReviews: number;
  singleReviews: SingleReview[];
}

export interface CreateReviewDto {
  productId: number;
  comment: string;
  rating: number;
}

// ================= Dashboard Summary =================
export interface DashboardSummary {
  totalProducts: number;
  totalCategories: number;
  totalOffers: number;
  totalUsers: number;
  totalOrders: number;
  totalSales: number;
}

// ================= Contact Form =================
export interface ContactFormDto {
  name: string;
  email: string;
  address?: string;
  phoneNumber: string;
  message: string;
  date?: string;
}
