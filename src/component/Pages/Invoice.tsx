import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useGlobleContextDarklight } from '../../AllContext/context';

type Item = {
  id: number;
  productName: string;
  quantity: number;
  price: number;
};

type Order = {
  id: number;
  orderId: string;
  timestamp: string;
  salerId: number;
  totalAmount: number;
  items: Item[];
};

const InvoicePage = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const { darkLight } = useGlobleContextDarklight();

  useEffect(() => {
    axios.get(`https://localhost:7095/api/Orders/10`).then((res) => {
      setOrder(res.data);
    });
  }, []);

  if (!order)
    return (
      <p className={`text-center mt-10 ${darkLight ? 'text-white' : 'text-black'}`}>
        Loading invoice...
      </p>
    );

  return (
    <div
      className={`max-w-2xl mx-auto my-10 p-6 shadow-lg rounded-md border w-[500px] ${
        darkLight ? 'bg-gray-900 text-gray-100 border-gray-700' : 'bg-white text-black border-gray-300'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="font-semibold text-xs">YOUR<br />LOGO</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">NO. {order.orderId}</p>
        </div>
      </div>

      <h1 className="text-3xl font-black mb-2">INVOICE</h1>

      <p className="mb-6 text-sm">
        <strong>Date:</strong> {new Date(order.timestamp).toLocaleDateString()}
      </p>

      {/* Billing Details */}
      <div className="grid grid-cols-2 gap-8 mb-6 text-sm">
        <div>
          <p className="font-bold mb-1">Billed to:</p>
          <p>Studio Shodwe</p>
          <p>123 Anywhere St., Any City</p>
          <p>hello@reallygreatsite.com</p>
        </div>
        <div>
          <p className="font-bold mb-1">From:</p>
          <p>Olivia Wilson</p>
          <p>123 Anywhere St., Any City</p>
          <p>hello@reallygreatsite.com</p>
        </div>
      </div>

      {/* Item Table */}
      <div className="w-full border-t border-b border-gray-300 mb-4 text-sm">
        <div className="grid grid-cols-4 font-semibold py-2 border-b border-gray-300">
          <div className="col-span-1">Item</div>
          <div className="text-center">Quantity</div>
          <div className="text-center">Price</div>
          <div className="text-right">Amount</div>
        </div>
        {order.items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-4 py-2 border-b border-gray-100"
          >
            <div className="col-span-1">{item.productName}</div>
            <div className="text-center">{item.quantity}</div>
            <div className="text-center">${item.price.toFixed(2)}</div>
            <div className="text-right">${(item.price * item.quantity).toFixed(2)}</div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="text-right font-bold text-base mb-6">
        Total: ${order.totalAmount.toFixed(2)}
      </div>

      {/* Footer Info */}
      <p className="text-sm mb-1">
        <strong>Payment method:</strong> Cash
      </p>
      <p className="text-sm">
        <strong>Note:</strong> Thank you for choosing us!
      </p>
    </div>
  );
};

export default InvoicePage;
