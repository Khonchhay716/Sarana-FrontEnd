// src/component/Pages/DashboardCoffee.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, LineChart, Loader2, XCircle } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { useGlobleContextDarklight } from '../../AllContext/context'; // Import dark/light context
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// --- IMPORTANT: UI-related interfaces. Data structures should ideally come from a shared types file.
interface SalesMetrics {
  totalRevenue: number;
  numberOfOrders: number;
  averageOrderValue: number;
}

interface DailySalesData {
  labels: string[]; // Dates (e.g., 'Mon', 'Tue', '2023-01-01')
  data: number[]; // Revenue for each date
}

interface TopProduct {
  name: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

// SaleRecord interface definition - crucial for API response and data processing
interface SaleRecord {
  orderId: string;
  timestamp: string; // ISO string format for date
  totalAmount: number;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
  }[];
}


// --- Utility Functions (These would typically be in src/utils/salesUtils.ts) ---
// Since we're fetching from an API, these will process the API response.

const calculateSalesMetrics = (sales: SaleRecord[]): SalesMetrics => {
  let totalRevenue = 0;
  const numberOfOrders = sales.length; // Each SaleRecord is considered an order

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

const getDailySalesData = (sales: SaleRecord[]): DailySalesData => {
  const dailyRevenueMap = new Map<string, number>();

  sales.forEach(sale => {
    // Extract date in YYYY-MM-DD format
    const date = new Date(sale.timestamp).toISOString().split('T')[0];
    dailyRevenueMap.set(date, (dailyRevenueMap.get(date) || 0) + sale.totalAmount);
  });

  // Sort dates to ensure the chart displays chronologically
  const sortedDates = Array.from(dailyRevenueMap.keys()).sort();
  const labels = sortedDates;
  const data = sortedDates.map(date => dailyRevenueMap.get(date) || 0);

  return { labels, data };
};

const getTopProductsData = (sales: SaleRecord[], limit: number = 5): TopProduct[] => {
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

  // Convert map to array, sort by quantity, and take top 'limit'
  const sortedProducts: TopProduct[] = Array.from(productStats.entries())
    .map(([name, stats]) => ({
      name,
      totalQuantitySold: stats.quantity,
      totalRevenue: stats.revenue,
    }))
    .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold) // Sort by quantity sold descending
    .slice(0, limit);

  return sortedProducts;
};


// Register Chart.js components globally.
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// --- Reusable UI Component: MetricCard ---
interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, description }) => {
  const { darkLight } = useGlobleContextDarklight(); // Use darkLight context here

  return (
    <div className={`p-6 rounded-lg shadow-md flex-1 text-center
      ${darkLight ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <h3 className={`text-lg font-semibold mb-2 ${darkLight ? 'text-gray-200' : 'text-gray-700'}`}>{title}</h3>
      <p className="text-4xl font-bold text-indigo-600 mb-2">{value}</p>
      {description && <p className={`text-sm ${darkLight ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>}
    </div>
  );
};

// --- Reusable UI Component: SalesTrendChart ---
interface SalesTrendChartProps {
  data: DailySalesData;
  title: string;
}

const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ data, title }) => {
  const { darkLight } = useGlobleContextDarklight(); // Use darkLight context here

  // Adjust chart colors based on theme
  const chartTextColor = darkLight ? 'rgb(209, 213, 219)' : 'rgb(55, 65, 81)'; // gray-300 vs gray-700
  const gridLineColor = darkLight ? 'rgba(107, 114, 128, 0.3)' : 'rgba(209, 213, 219, 0.3)'; // gray-500 vs gray-300

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Daily Revenue ($)',
        data: data.data,
        borderColor: 'rgb(79, 70, 229)', // indigo-600 (remains constant for good contrast)
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
            color: chartTextColor, // Dynamic legend text color
        }
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 18,
          weight: 'bold' as 'normal' | 'bold' | 'lighter' | 'bolder' | number,
        },
        color: chartTextColor, // Dynamic title text color
      },
      tooltip: {
        backgroundColor: darkLight ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
        bodyColor: darkLight ? '#000' : '#fff',
        titleColor: darkLight ? '#000' : '#fff',
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
          color: chartTextColor, // Dynamic x-axis title color
        },
        ticks: {
          color: chartTextColor, // Dynamic x-axis tick color
        },
        grid: {
            color: gridLineColor, // Dynamic grid line color
        }
      },
      y: {
        title: {
          display: true,
          text: 'Revenue ($)',
          color: chartTextColor, // Dynamic y-axis title color
        },
        ticks: {
          color: chartTextColor, // Dynamic y-axis tick color
        },
        grid: {
            color: gridLineColor, // Dynamic grid line color
        }
      },
    },
  };

  return (
    <div className={`p-6 rounded-lg shadow-md flex-1
      ${darkLight ? 'bg-gray-800' : 'bg-white'}`}> {/* Background changes based on darkLight */}
      <Line data={chartData} options={options} />
    </div>
  );
};

// --- Reusable UI Component: TopProductsTable ---
interface TopProductsTableProps {
  products: TopProduct[];
  title: string;
}

const TopProductsTable: React.FC<TopProductsTableProps> = ({ products, title }) => {
    const { darkLight } = useGlobleContextDarklight(); // Use darkLight context here

  return (
    <div className={`p-6 rounded-lg shadow-md flex-1
      ${darkLight ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}> {/* Background and text color change */}
      <h3 className={`text-xl font-semibold mb-4 ${darkLight ? 'text-gray-200' : 'text-gray-700'}`}>{title}</h3>
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y
          ${darkLight ? 'divide-gray-700' : 'divide-gray-200'}`}>
          <thead className={`${darkLight ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <tr>
              <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider
                ${darkLight ? 'text-gray-300' : 'text-gray-500'}`}>
                Product
              </th>
              <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider
                ${darkLight ? 'text-gray-300' : 'text-gray-500'}`}>
                Qty Sold
              </th>
              <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider
                ${darkLight ? 'text-gray-300' : 'text-gray-500'}`}>
                Revenue
              </th>
            </tr>
          </thead>
          <tbody className={`${darkLight ? 'bg-gray-800' : 'bg-white'} divide-y
            ${darkLight ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {products.length === 0 ? (
              <tr>
                <td colSpan={3} className={`px-6 py-4 whitespace-nowrap text-sm text-center
                  ${darkLight ? 'text-gray-400' : 'text-gray-500'}`}>
                  No products data available.
                </td>
              </tr>
            ) : (
              products.map((product, index) => (
                <tr key={index}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium
                    ${darkLight ? 'text-white' : 'text-gray-900'}`}>
                    {product.name}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm
                    ${darkLight ? 'text-gray-300' : 'text-gray-500'}`}>
                    {product.totalQuantitySold}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm
                    ${darkLight ? 'text-gray-300' : 'text-gray-500'}`}>
                    ${product.totalRevenue.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Main Sales Dashboard Component (Data Fetched from API) ---
interface DashboardCoffeeProps {} // No props needed for this component anymore

const API_ENDPOINT = '/api/sales'; // Placeholder API endpoint

const DashboardCoffee: React.FC<DashboardCoffeeProps> = () => {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [metrics, setMetrics] = useState<SalesMetrics>({ totalRevenue: 0, numberOfOrders: 0, averageOrderValue: 0 });
  const [dailySales, setDailySales] = useState<DailySalesData>({ labels: [], data: [] });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { darkLight } = useGlobleContextDarklight(); // Use darkLight context here

  // Mock API response data for demonstration
  const mockApiResponse: SaleRecord[] = [
    {
      orderId: 'sale-001',
      timestamp: '2025-06-10T09:00:00Z',
      totalAmount: 7.50,
      items: [
        { productId: '101', productName: 'Espresso', price: 2.50, quantity: 1 },
        { productId: '201', productName: 'Croissant', price: 2.50, quantity: 2 },
      ],
    },
    {
      orderId: 'sale-002',
      timestamp: '2025-06-10T10:15:00Z',
      totalAmount: 11.25,
      items: [
        { productId: '102', productName: 'Cappuccino', price: 3.00, quantity: 2 },
        { productId: '103', productName: 'Latte', price: 3.50, quantity: 1 },
        { productId: '202', productName: 'Blueberry Muffin', price: 3.00, quantity: 1 },
      ],
    },
    {
      orderId: 'sale-003',
      timestamp: '2025-06-11T11:00:00Z',
      totalAmount: 12.00,
      items: [
        { productId: '104', productName: 'Mocha', price: 4.00, quantity: 3 },
      ],
    },
    {
      orderId: 'sale-004',
      timestamp: '2025-06-11T13:30:00Z',
      totalAmount: 9.75,
      items: [
        { productId: '101', productName: 'Espresso', price: 2.50, quantity: 2 },
        { productId: '105', productName: 'Americano', price: 2.75, quantity: 1 },
        { productId: '201', productName: 'Croissant', price: 2.50, quantity: 1 },
      ],
    },
    {
      orderId: 'sale-005',
      timestamp: '2025-06-12T09:45:00Z',
      totalAmount: 18.00,
      items: [
        { productId: '107', productName: 'Cold Brew', price: 4.50, quantity: 4 },
      ],
    },
    {
      orderId: 'sale-006',
      timestamp: '2025-06-12T16:00:00Z',
      totalAmount: 7.00,
      items: [
        { productId: '103', productName: 'Latte', price: 3.50, quantity: 2 },
      ],
    },
    {
      orderId: 'sale-007',
      timestamp: '2025-06-13T10:00:00Z',
      totalAmount: 5.00,
      items: [
        { productId: '203', productName: 'Chocolate Chip Cookie', price: 2.00, quantity: 2 },
        { productId: '101', productName: 'Espresso', price: 2.50, quantity: 1 },
      ],
    },
     {
      orderId: 'sale-008',
      timestamp: '2025-06-14T08:30:00Z',
      totalAmount: 10.00,
      items: [
        { productId: '102', productName: 'Cappuccino', price: 3.00, quantity: 1 },
        { productId: '108', productName: 'Iced Latte', price: 4.00, quantity: 1 },
        { productId: '201', productName: 'Croissant', price: 2.50, quantity: 1 },
      ],
    },
    {
      orderId: 'sale-009',
      timestamp: '2025-06-14T12:00:00Z',
      totalAmount: 14.50,
      items: [
        { productId: '107', productName: 'Cold Brew', price: 4.50, quantity: 2 },
        { productId: '109', productName: 'Flat White', price: 3.75, quantity: 1 },
        { productId: '103', productName: 'Latte', price: 3.50, quantity: 1 },
      ],
    },
    {
      orderId: 'sale-010',
      timestamp: '2025-06-15T11:00:00Z',
      totalAmount: 6.00,
      items: [
        { productId: '110', productName: 'Turkish Coffee', price: 3.00, quantity: 2 },
      ],
    },
  ];

  // Function to simulate fetching data from an API
  const fetchSalesData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate network delay and API response
      await new Promise(resolve => setTimeout(resolve, 1500));
      const data: SaleRecord[] = mockApiResponse; // Use mock data

      setSales(data);
      setMetrics(calculateSalesMetrics(data));
      setDailySales(getDailySalesData(data));
      setTopProducts(getTopProductsData(data, 5));
    } catch (err) {
      console.error("Failed to fetch sales data:", err);
      setError("Failed to load sales data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  return (
    // Main container: Background changes based on darkLight.
    <div className={`w-full h-full p-4 text-white
      ${darkLight ? 'from-gray-900 to-gray-950' : 'from-gray-700 to-gray-900'}`}> {/* Adjusted for full width/height */}
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-4xl font-extrabold flex items-center gap-3 ${darkLight?"text-white":"text-blue-700"}`}>
          <BarChart className="text-teal-400" size={36} /> Sales Dashboard
        </h1>
        {/* Removed the "Go to POS" button */}
      </div>

      {isLoading ? (
        <div className={`text-center p-8 rounded-lg shadow-lg flex flex-col items-center justify-center
          ${darkLight ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
          <Loader2 className="animate-spin text-indigo-400 mb-4" size={48} />
          <p className="text-xl">Loading data...</p>
        </div>
      ) : error ? (
        <div className={`text-center p-8 rounded-lg shadow-lg flex flex-col items-center justify-center
          ${darkLight ? 'bg-red-900/30 border-red-800 text-red-300' : 'bg-red-800/20 border-red-700 text-red-700'}`}>
          <XCircle className="text-red-400 mb-4" size={48} />
          <p className="text-xl mb-2">{error}</p>
          <button
            onClick={fetchSalesData}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      ) : sales.length === 0 ? (
        <div className={`text-center p-8 rounded-lg shadow-lg
          ${darkLight ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
          <p className="text-xl mb-4">No sales data available yet from the API.</p>
          <p className="text-md">Check API source or ensure sales data exists.</p>
        </div>
      ) : (
        <>
          {/* Metrics Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <MetricCard
              title="Total Revenue"
              value={`$${metrics.totalRevenue.toFixed(2)}`}
              description="Overall sales generated"
            />
            <MetricCard
              title="Total Orders"
              value={metrics.numberOfOrders}
              description="Number of transactions"
            />
            <MetricCard
              title="Avg. Order Value"
              value={`$${metrics.averageOrderValue.toFixed(2)}`}
              description="Average spend per order"
            />
          </div>

          {/* Charts and Tables Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SalesTrendChart data={dailySales} title="Daily Sales Trend" />
            </div>
            <div className="lg:col-span-1">
              <TopProductsTable products={topProducts} title="Top 5 Selling Products" />
            </div>
          </div>

          <footer className={`text-center text-sm mt-12
            ${darkLight ? 'text-gray-400' : 'text-gray-500'}`}>
            Dashboard data fetched from simulated API.
          </footer>
        </>
      )}
    </div>
  );
};

export default DashboardCoffee;