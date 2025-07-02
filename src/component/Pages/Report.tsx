// src/pages/ReportPage.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';

type OrderSummary = {
  timestamp: string;
  totalAmount: number;
};

const ReportPage: React.FC = () => {
  const [data, setData] = useState<OrderSummary[]>([]);

  useEffect(() => {
    axios.get(`https://localhost:7213/api/Orders/filter?range=lastmonth`).then((res) => {
      setData(res.data);
    });
  }, []);

  const totalRevenue = data.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="max-w-3xl mx-auto p-5">
      <h1 className="text-3xl font-bold mb-4">Monthly Sales Report</h1>

      <table className="min-w-full border text-left">
        <thead>
          <tr>
            <th className="border px-4 py-2">Date</th>
            <th className="border px-4 py-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.map((order, i) => (
            <tr key={i}>
              <td className="border px-4 py-2">{new Date(order.timestamp).toLocaleDateString()}</td>
              <td className="border px-4 py-2">${order.totalAmount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-bold">
            <td className="border px-4 py-2">Total</td>
            <td className="border px-4 py-2">${totalRevenue.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default ReportPage;
