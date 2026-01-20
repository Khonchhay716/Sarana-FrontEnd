import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useGlobleContextDarklight } from '../../AllContext/context';
import image from '../../assets/image.png';

type Item = {
  id: number;
  productName: string;
  price: number;
  quantity: number;
  productImage: string;
};

type Order = {
  id: number;
  orderId: string;
  salerName: string;
  timestamp: string;
  totalAmount: number;
  salerId: number;
  items: Item[];
};

const OrdersTable: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { darkLight } = useGlobleContextDarklight();

  const [filterRange, setFilterRange] = useState<'all' | 'today' | 'lastweek' | 'lastmonth' | 'lastyear' | 'custom'>('today');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [searchItem, setSearchItem] = useState('');

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();

      if (filterRange !== 'all') {
        params.append('range', filterRange);
      }

      if (filterRange === 'custom') {
        if (customFrom) params.append('from', customFrom);
        if (customTo) params.append('to', customTo);
      }

      const url = `https://localhost:7095/api/Orders/filter${params.toString() ? `?${params.toString()}` : ''
        }`;
      const response = await axios.get<Order[]>(url);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    if (filterRange === 'custom') {
      if (!customFrom || !customTo) {
        setOrders([]); // Clear list if custom dates incomplete
        return;
      }
    }
    fetchOrders();
  }, [filterRange, customFrom, customTo]);

  // Filter client-side search by item name inside orders
  const filteredOrders = orders.filter(
    (order) =>
      searchItem.trim() === '' ||
      order.items.some((item) =>
        item.productName.toLowerCase().includes(searchItem.toLowerCase())
      )
  );

  // Calculate total amount for all filtered orders
  const totalAmount = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  // Calculate total cups (sum of quantities) for all filtered orders
  const totalCups = filteredOrders.reduce(
    (sum, order) => sum + order.items.reduce((qSum, item) => qSum + item.quantity, 0),
    0
  );

  // Aggregate items from filtered orders for report
  const aggregateItems = () => {
    const itemMap: { [name: string]: { quantity: number; total: number } } = {};
    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (
          searchItem &&
          !item.productName.toLowerCase().includes(searchItem.toLowerCase())
        )
          return;
        if (!itemMap[item.productName]) {
          itemMap[item.productName] = { quantity: 0, total: 0 };
        }
        itemMap[item.productName].quantity += item.quantity;
        itemMap[item.productName].total += item.quantity * item.price;
      });
    });
    return Object.entries(itemMap).map(([name, data]) => ({
      productName: name,
      quantity: data.quantity,
      total: data.total,
    }));
  };


  // console.log(filteredOrders);

  // Print item summary report
  const handlePrintReport = () => {
    const itemSummary = aggregateItems();
    if (itemSummary.length === 0) {
      alert('No data to print');
      return;
    }

    /// report code 
    const html = `
      <html>
        <head>
          <title>Item Summary Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
            th { background: #f0f0f0; }
            .totals { margin-top: 20px; font-weight: bold; text-align: right; }
            .thank-you { margin-top: 30px; font-style: italic; text-align: center; color: #555; }
          </style>
        </head>
        <body>
          <h1>Item Summary Report (${filterRange == 'all' ? "Item All" : filterRange == 'today' ? "Today" : filterRange == "lastweek" ? "LastWeek" : filterRange == "lastmonth" ? "Last Month" : filterRange == "lastyear" ? "Last Year " : filterRange})</h1>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Total ($)</th>
              </tr>
            </thead>
            <tbody>
              ${itemSummary
        .map(
          (item) => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.quantity}</td>
                  <td>${item.total.toFixed(2)}</td>
                </tr>
              `
        )
        .join('')}
            </tbody>
          </table>
          <div class="totals">
            Total Cups: ${totalCups} &nbsp;&nbsp;&nbsp; Total Amount: $${totalAmount.toFixed(2)}
          </div>
          <div class="thank-you">Thank you for reviewing the report!</div>
        </body>
      </html>
    `;
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  // console.log("data filter show " , filteredOrders);

  return (
    <div
      className={`min-h-screen mb-20 ${darkLight ? 'bg-gray-900' : 'bg-gray-50'
        }`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between mb-5 px-4 sm:px-8">
        <h1
          className={`text-3xl font-bold ${darkLight ? 'text-white' : 'text-slate-800'
            }`}
        >
          Orders Summary
        </h1>

        <div className="flex flex-wrap items-center gap-4 mt-3 sm:mt-0">
          <select
            className={`px-3 py-2 border rounded-md focus:outline-none ${darkLight
              ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
              }`}
            value={filterRange}
            onChange={(e) => {
              setFilterRange(e.target.value as any);
              if (e.target.value !== 'custom') {
                setCustomFrom('');
                setCustomTo('');
              }
            }}
          >
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="lastweek">Last Week</option>
            <option value="lastmonth">Last Month</option>
            <option value="lastyear">Last Year</option>
            <option value="custom">Custom</option>
          </select>

          {filterRange === 'custom' && (
            <>
              <input
                type="date"
                className={`px-3 py-2 border rounded-md focus:outline-none ${darkLight
                  ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                  }`}
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                max={customTo || undefined}
              />
              <span
                className={`${darkLight ? 'text-gray-300' : 'text-gray-700'
                  } font-semibold`}
              >
                to
              </span>
              <input
                type="date"
                className={`px-3 py-2 border rounded-md focus:outline-none ${darkLight
                  ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                  }`}
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                min={customFrom || undefined}
              />
            </>
          )}

          <input
            type="text"
            placeholder="Search item..."
            value={searchItem}
            onChange={(e) => setSearchItem(e.target.value)}
            className={`px-3 py-2 border rounded-md w-64 focus:outline-none ${darkLight
              ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
              }`}
          />

          <button
            onClick={handlePrintReport}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Print Report
          </button>
        </div>
      </div>

      <div
        className={`overflow-x-auto shadow-md rounded-xl border mx-4 sm:mx-8 ${darkLight ? 'border-gray-700 bg-gray-800' : 'border-slate-200 bg-white'
          }`}
      >
        <table className="min-w-full text-sm text-left">
          <thead
            className={`uppercase text-xs tracking-wider ${darkLight
              ? 'bg-gray-700 text-gray-300'
              : 'bg-slate-100 text-slate-700'
              }`}
          >
            <tr>
              <th className="px-6 py-4 border-b border-gray-600">Order ID</th>
              <th className="px-6 py-4 border-b border-gray-600">Saler ID</th>
              <th className="px-6 py-4 border-b border-gray-600">Saler Name</th>
              <th className="px-6 py-4 border-b border-gray-600">Timestamp</th>
              <th className="px-6 py-4 border-b border-gray-600">Total Amount</th>
              <th className="px-6 py-4 border-b border-gray-600">Items</th>
            </tr>
          </thead>
          <tbody className={`${darkLight ? 'text-gray-300' : 'text-slate-700'}`}>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className={`${darkLight ? 'hover:bg-gray-700' : 'hover:bg-slate-50'
                    } transition`}
                >
                  <td className="px-6 py-4 border-b border-gray-600 font-medium">
                    000{order.id}
                  </td>
                  <td className="px-6 py-4 border-b border-gray-600">{order.salerId}</td>
                  <td className="px-6 py-4 border-b border-gray-600">{order.salerName}</td>
                  <td className="px-6 py-4 border-b border-gray-600 text-gray-400">
                    {new Date(order.timestamp).toLocaleString()}
                  </td>
                  <td
                    className={`px-6 py-4 border-b border-gray-600 font-semibold ${darkLight ? 'text-indigo-400' : 'text-indigo-600'
                      }`}
                  >
                    ${order.totalAmount}
                  </td>
                  <td className="px-6 py-4 border-b border-gray-600">
                    <ul className="list-disc ml-5 space-y-1 text-sm">
                      {order.items.map((item) => (
                        <li
                          key={item.id}
                          className={`flex items-center space-x-2 ${darkLight ? 'text-gray-300' : 'text-slate-600'
                            }`}
                        >
                          <img
                            src={item.productImage}
                            alt=""
                            className="w-5 h-5 rounded-full flex-shrink-0"
                          />
                          <span>{item.productName}</span>
                          <span className="text-[13px] mt-0.5 text-gray-400">
                            x{item.quantity}
                          </span>
                          <span className="font-semibold">${item.price}</span>
                          <span>Total : ${item.price * item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center p-4 text-gray-500">
                  No orders found for selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Totals under the table */}
        <div
          className={`px-6 py-4 font-semibold text-right space-x-10 ${darkLight ? 'text-indigo-400' : 'text-indigo-600'
            }`}
        >
          <span>Total Cups: {totalCups}</span>
          <span>Total Amount: ${totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrdersTable;
