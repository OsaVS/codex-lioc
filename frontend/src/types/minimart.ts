export interface MinimartProduct {
  id: string;
  name: string;
  category: 'LUBRICANT' | 'ENGINE_OIL' | 'COOLANT' | 'BRAKE_FLUID' | 'CAR_CARE' | 'ACCESSORIES';
  currentStock: number;
  reorderLevel: number;
  supplier: string;
  expiryDate: string; // YYYY-MM-DD
  batchNumber: string;
  price: number;
}

export interface POSTransaction {
  id: string;
  productId: string;
  productName: string;
  type: 'SALE' | 'RETURN' | 'STOCK_UPDATE';
  quantity: number;
  timestamp: string;
}
