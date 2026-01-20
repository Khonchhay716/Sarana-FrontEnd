import React, { useEffect, useState, useRef } from 'react';
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
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    axios.get(`https://localhost:7095/api/Orders/10`).then((res) => {
      setOrder(res.data);
    });
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;

    const printContents = printRef.current.innerHTML;
    const newWindow = window.open('', '_blank', 'width=700,height=900');
    if (!newWindow) return;

    newWindow.document.write(`
      <html>
        <head>
          <title>Print Invoice</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 10mm;
              color: black;
              background: white !important;
            }
            .invoice-container {
              max-width: 480px;
              margin: 0 auto;
              padding: 15px;
              border: none !important;
              box-shadow: none !important;
              background: none !important;
              color: black !important;
            }
            h1 {
              font-size: 1.75rem;
              margin-bottom: 0.5rem;
              font-weight: bold;
            }
            p, div {
              font-size: 13px;
              margin: 0.2rem 0;
              color: black !important;
            }
            .grid {
              display: grid;
              gap: 6px;
            }
            .grid-cols-2 {
              grid-template-columns: repeat(2, 1fr);
            }
            .grid-cols-4 {
              grid-template-columns: repeat(4, 1fr);
            }
            .text-right {
              text-align: right;
            }
            .text-center {
              text-align: center;
            }
            .font-bold {
              font-weight: 700;
            }
            .font-semibold {
              font-weight: 600;
            }
            .border-b {
              border-bottom: 1px solid #000;
            }
            * {
              background: none !important;
              box-shadow: none !important;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            ${printContents}
          </div>
        </body>
      </html>
    `);

    newWindow.document.close();
    newWindow.focus();

    setTimeout(() => {
      newWindow.print();
      newWindow.close();
    }, 500);
  };

  if (!order) return <p className="text-center mt-10">Loading invoice...</p>;

  return (
    <>
      <div className="text-right mb-4 print:hidden">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Print (Save as PDF)
        </button>
      </div>

      <div
        ref={printRef}
        className={`max-w-2xl mx-auto p-6 shadow-md rounded-md ${darkLight ? 'bg-gray-900 text-white' : 'bg-white text-black'
          }`}
      >
        {/* Invoice content */}
        <h1 className="text-3xl font-bold mb-2">Invoice #{order.orderId}</h1>
        <p className="mb-4">Date: {new Date(order.timestamp).toLocaleDateString()}</p>

        <div className="grid grid-cols-2 gap-8 mb-6 text-sm">
          <div>
            <p className="font-bold mb-1">Billed to:</p>
            <p>Studio Shodwe</p>
            <p>123 Anywhere St., Any City</p>
          </div>
          <div>
            <p className="font-bold mb-1">From:</p>
            <p>Olivia Wilson</p>
            <p>123 Anywhere St., Any City</p>
          </div>
        </div>

        <div className="w-full border-t border-b border-gray-300 mb-4 text-sm">
          <div className="grid grid-cols-4 font-semibold py-2 border-b border-gray-300">
            <div className="col-span-1">Item</div>
            <div className="text-center">Qty</div>
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
              <div className="text-right">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="text-right font-bold text-base mb-4">
          Total: ${order.totalAmount.toFixed(2)}
        </div>

        <p className="text-sm mb-1">
          <strong>Payment method:</strong> Cash
        </p>
        <p className="text-sm">
          <strong>Note:</strong> Thank you for choosing us!
        </p>
      </div>
    </>
  );
};

export default InvoicePage;
