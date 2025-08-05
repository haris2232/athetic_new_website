const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://34.18.0.53:5000/api';

export interface Product {
  _id: string;
  id?: string;
  name?: string;
  title: string;
  price?: string;
  basePrice: number;
  originalPrice?: string;
  image?: string;
  images: string[];
  category: string;
  subCategory?: string;
  description?: string;
  fullDescription?: string;
  isOnSale?: boolean;
  colors?: Array<{
    name: string;
    hex?: string;
    image?: string;
  }>;
  sizes?: string[];
  sizeOptions?: string[];
  variants?: any[];
  defaultVariant?: string;
  rating?: number;
  reviewRating?: number;
  reviewCount?: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  size?: string;
  color?: string;
  sku?: string;
  quantity: number;
  price: number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface Order {
  orderNumber: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: string;
  paymentStatus: string;
  isFreeShipping: boolean;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  carouselImage?: string;
  showInCarousel?: boolean;
  carouselOrder?: number;
  isActive: boolean;
  createdAt: string;
}

export interface Bundle {
  _id: string;
  name: string;
  description?: string;
  products: Product[];
  originalPrice: number;
  bundlePrice: number;
  bundleType: '4-products' | '6-products';
  category: 'men' | 'women';
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API request failed for ${url}:`, error);
      throw error;
    }
  }

  // Get all products
  async getProducts(): Promise<Product[]> {
    try {
      console.log('🔍 Fetching products from API...')
      const response: ApiResponse<Product[]> = await this.request('/public/products/public/all');
      console.log('📦 API Response:', response);
      
      // If API returns empty data or no success, throw error to use fallback
      if (!response.success || !response.data || response.data.length === 0) {
        console.log('⚠️ No products from API, returning empty array')
        return [];
      }
      
      console.log(`✅ Found ${response.data.length} products from API`)
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      // Return empty array if API fails
      return [];
    }
  }

  // Get product by ID
  async getProduct(id: string): Promise<Product | null> {
    try {
      const response: ApiResponse<Product> = await this.request(`/public/products/public/${id}`);
      
      if (!response.success || !response.data) {
        throw new Error('Product not found in API');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  // Get products by category
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const response: ApiResponse<Product[]> = await this.request(`/public/products/public/all?category=${encodeURIComponent(category)}`);
      
      if (!response.success || !response.data || response.data.length === 0) {
        throw new Error('No products available from API');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  }

  // Search products
  async searchProducts(query: string): Promise<Product[]> {
    try {
      const response: ApiResponse<Product[]> = await this.request(`/public/products/public/all?search=${encodeURIComponent(query)}`);
      
      if (!response.success || !response.data || response.data.length === 0) {
        throw new Error('No products available from API');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  // Create order
  async createOrder(customer: CustomerInfo, items: OrderItem[], notes?: string): Promise<Order> {
    try {
      const response: ApiResponse<Order> = await this.request('/orders/public/create', {
        method: 'POST',
        body: JSON.stringify({ customer, items, notes }),
      });
      
      if (!response.success || !response.data) {
        throw new Error('Failed to create order');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Get carousel categories
  async getCarouselCategories(): Promise<Category[]> {
    try {
      const response = await this.request<{ data: Category[] }>('/categories/public/carousel');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching carousel categories:', error);
      return [];
    }
  }

  // Get all categories
  async getCategories(): Promise<Category[]> {
    try {
      const response = await this.request<{ data: Category[] }>('/categories');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Get bundles
  async getBundles(category?: string): Promise<Bundle[]> {
    try {
      const endpoint = category ? `/bundles/public/active/${category}` : '/bundles/public/active';
      const response = await this.request<{ data: Bundle[] }>(endpoint);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching bundles:', error);
      return [];
    }
  }

  // Calculate bundle discount
  async calculateBundleDiscount(cartItems: any[]): Promise<any> {
    try {
      const response = await this.request<{ data: any }>('/bundles/public/calculate-discount', {
        method: 'POST',
        body: JSON.stringify({ cartItems }),
      });
      return response.data;
    } catch (error) {
      console.error('Error calculating bundle discount:', error);
      return null;
    }
  }
}

// Create API service instance
export const apiService = new ApiService(API_BASE_URL);

// Legacy functions for backward compatibility
export async function getAllProducts(): Promise<Product[]> {
  return apiService.getProducts();
}

export async function getProductById(id: string): Promise<Product | null> {
  return apiService.getProduct(id);
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  return apiService.getProductsByCategory(category);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await apiService.getProducts();
  return products.slice(0, 4);
}

export async function getSaleProducts(): Promise<Product[]> {
  const products = await apiService.getProducts();
  return products.filter(product => product.isOnSale);
}

export async function getRelatedProducts(currentProductId: string, category: string): Promise<Product[]> {
  const products = await apiService.getProductsByCategory(category);
  return products.filter(product => product.id !== currentProductId).slice(0, 4);
}

// Order functions
export async function createOrder(customer: CustomerInfo, items: OrderItem[], notes?: string): Promise<Order> {
  return apiService.createOrder(customer, items, notes);
}

// Category functions
export async function getCarouselCategories(): Promise<Category[]> {
  return apiService.getCarouselCategories();
}

export async function getCategories(): Promise<Category[]> {
  return apiService.getCategories();
}

// Bundle functions
export async function getBundles(category?: string): Promise<Bundle[]> {
  return apiService.getBundles(category);
}

export async function calculateBundleDiscount(cartItems: any[]): Promise<any> {
  return apiService.calculateBundleDiscount(cartItems);
} 