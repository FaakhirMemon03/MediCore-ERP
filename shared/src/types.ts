export type UserRole = 'Owner' | 'Manager' | 'Cashier' | 'Accountant' | 'Admin';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  storeId?: string; // Null for system admin (MYMN SAAB)
  branchId?: string;
  createdAt: string;
}

export interface StoreProfile {
  id: string;
  name: string;
  ntn: string;
  strn: string;
  phone: string;
  address: string;
  logoUrl?: string;
  createdAt: string;
}

export interface Branch {
  id: string;
  storeId: string;
  name: string;
  address: string;
  phone: string;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  barcode: string;
  sku: string;
  category: string;
  brand: string;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  taxPercent: number;
  minStock: number;
}

export interface Batch {
  id: string;
  productId: string;
  batchNumber: string;
  expiryDate: string; // ISO Date String
  quantity: number;
  createdAt: string;
}

export interface License {
  storeId: string;
  plan: 'Basic' | 'Professional' | 'Enterprise';
  expiryDate: string; // ISO Date String
  status: 'Active' | 'Expired' | 'Suspended';
  lastCheckedAt: string;
}

export interface SaleItem {
  productId: string;
  batchId: string;
  quantity: number;
  salePrice: number;
  discount: number;
  taxAmount: number;
  total: number;
}

export interface Sale {
  id: string;
  storeId: string;
  branchId: string;
  cashierId: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  taxTotal: number;
  total: number;
  paymentMethod: 'Cash' | 'Card' | 'Credit';
  customerId?: string;
  createdAt: string;
}
