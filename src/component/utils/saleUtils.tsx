// src/utils/salesUtils.ts

import { MenuItem } from './data'; // Import MenuItem from the new data.ts file
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// TypeScript Interfaces
export interface CartItem extends MenuItem {
  qty: number;
}

export interface SaleRecord {
  orderId: string;
  timestamp: string; // ISO string format for date
  totalAmount: number;
  salerId: number;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
  }[];
}

export interface SalesMetrics {
  totalRevenue: number;
  numberOfOrders: number;
  averageOrderValue: number;
}

export interface DailySalesData {
  labels: string[]; // Dates
  data: number[]; // Revenue for each date
}

export interface TopProduct {
  name: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

// Utility Functions (localStorage & Sales Calculations)
const SALES_KEY = 'coffee_sales_data';

export const getSalesData = (): SaleRecord[] => {
  try {
    const data = localStorage.getItem(SALES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to parse sales data from localStorage:', error);
    return [];
  }
};

export const saveSalesData = (sales: SaleRecord[]): void => {
  try {
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  } catch (error) {
    console.error('Failed to save sales data to localStorage:', error);
  }
};

export const addSaleRecord = (newRecord: SaleRecord): void => {
  const currentSales = getSalesData();
  const updatedSales = [...currentSales, newRecord];
  saveSalesData(updatedSales);
};

export const calculateSalesMetrics = (sales: SaleRecord[]): SalesMetrics => {
  let totalRevenue = 0;
  const numberOfOrders = sales.length;

  sales.forEach(sale => {
    totalRevenue += sale.totalAmount;
  });

  const averageOrderValue = numberOfOrders > 0 ? totalRevenue / numberOfOrders : 0;

  return {
    totalRevenue,
    numberOfOrders,
    averageOrderValue,
  };
};

export const getDailySalesData = (sales: SaleRecord[]): DailySalesData => {
  const dailyRevenueMap = new Map<string, number>();

  sales.forEach(sale => {
    const date = new Date(sale.timestamp).toISOString().split('T')[0]; // YYYY-MM-DD
    dailyRevenueMap.set(date, (dailyRevenueMap.get(date) || 0) + sale.totalAmount);
  });

  const sortedDates = Array.from(dailyRevenueMap.keys()).sort();
  const labels = sortedDates;
  const data = sortedDates.map(date => dailyRevenueMap.get(date) || 0);

  return { labels, data };
};

export const getTopProductsData = (sales: SaleRecord[], limit: number = 5): TopProduct[] => {
  const productStats = new Map<string, { quantity: number; revenue: number }>();

  sales.forEach(sale => {
    sale.items.forEach(item => {
      const { productName, quantity, price } = item;
      const current = productStats.get(productName) || { quantity: 0, revenue: 0 };
      productStats.set(productName, {
        quantity: current.quantity + quantity,
        revenue: current.revenue + (quantity * price),
      });
    });
  });

  const sortedProducts: TopProduct[] = Array.from(productStats.entries())
    .map(([name, stats]) => ({
      name,
      totalQuantitySold: stats.quantity,
      totalRevenue: stats.revenue,
    }))
    .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold) // Sort by quantity sold
    .slice(0, limit);

  return sortedProducts;
};