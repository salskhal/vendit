export interface User {
  id: string;
  username: string;
  role: 'buyer' | 'seller';
  deposit: number;
}

export interface Product {
  id: string;
  productName: string;
  amountAvailable: number;
  cost: number;
  sellerId: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
  warning?: string;
}

export interface BuyResult {
  totalSpent: number;
  products: {
    productName: string;
    amount: number;
    costPerUnit: number;
  };
  change: number[];
}
