import React, { useState, useEffect, useRef } from 'react';
import { Coffee, ShoppingCart, Trash2, BadgeCheck, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGlobleContextDarklight } from '../../AllContext/context';
import { HookIntergrateAPI } from '../../CustomHook/HookIntergrateAPI';
import useFetchDataApi from '../../CustomHook/FetchDataApi';
import { v4 as uuidv4 } from 'uuid';

export type MenuItem = {
  id: number;
  title: string;
  price: number;
  image: string;
};

export type CartItem = MenuItem & {
  qty: number;
};

export type SaleRecord = {
  orderId: string;
  salerId: number;
  timestamp: string;
  totalAmount: number;
  items: {
    productId: number;
    productName: string;
    price: number;
    quantity: number;
    productImage: string;
  }[];
};

export const addSaleRecord = (record: SaleRecord) => {
  const records = JSON.parse(localStorage.getItem('saleRecords') || '[]');
  records.push(record);
  localStorage.setItem('saleRecords', JSON.stringify(records));
};

type UserProfile = {
  id: number;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  profilePicture: string;
  createdAt: string;
  updatedAt: string;
  roleId: number;
};

const CoffeePOS: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [lastOrder, setLastOrder] = useState<SaleRecord | null>(null);
  const { darkLight } = useGlobleContextDarklight();
  const { createData } = HookIntergrateAPI();
  const { data: users } = useFetchDataApi("https://localhost:7095/api/User");
  const { data: coffeeMenu } = useFetchDataApi("https://localhost:7095/api/coffeemenu");
  const [admin, setAdmin] = useState<UserProfile | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const email = sessionStorage.getItem("email");
    if (users && email) {
      const foundUser = users.find((u: UserProfile) => u.email === email);
      setAdmin(foundUser || null);
    }
  }, [users]);

  const addToCart = (item: MenuItem) => {
    setIsPaid(false);
    const exists = cart.find(c => c.id === item.id);
    if (exists) {
      setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const getTotal = () => cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handleCheckout = () => {
    if (cart.length === 0 || !admin) return;
    setIsLoading(true);

    const newSale: SaleRecord = {
      orderId: uuidv4(),
      salerId: admin.id,
      timestamp: new Date().toISOString(),
      totalAmount: parseFloat(getTotal().toFixed(2)),
      items: cart.map(item => ({
        productId: item.id,
        productName: item.title,
        price: item.price,
        quantity: item.qty,
        productImage: item.image || "placeholder.png"
      })),
    };

    createData("https://localhost:7095/api/Orders", newSale, () => { });

    setTimeout(() => {
      addSaleRecord(newSale);
      setIsLoading(false);
      setIsPaid(true);
      setLastOrder(newSale);
      setCart([]);
    }, 1500);
  };

  const handlePrintInvoice = () => {
    if (!printRef.current) return;

    const printContents = printRef.current.innerHTML;
    const newWindow = window.open('', '_blank', 'width=500,height=900');
    if (!newWindow) return;

    newWindow.document.write(`
      <html>
        <head>
          <title>Print Invoice</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .invoice-container { max-width: 600px; margin: auto; }
            h2 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: center; }
            th { background-color: #f0f0f0; }
            .total { font-weight: bold; text-align: right; margin-top: 10px; }
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

  return (
    <div className={`flex-col flex h-screen w-full ${darkLight ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <div className="mb-4">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Coffee className="text-amber-700" size={36} /> Coffee POS System
        </h1>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className={`w-full md:w-1/3 p-4 rounded-2xl shadow-md overflow-y-auto h-[85%] ${darkLight ? "bg-gray-800" : "bg-white"}`}>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <ShoppingCart className="text-amber-600" /> Current Order
          </h2>

          {cart.length === 0 ? (
            <p className="text-center text-gray-400">No items in cart</p>
          ) : (
            <ul className="space-y-4">
              {cart.map(item => (
                <li key={item.id} className="flex justify-between items-center border-b pb-3">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.title} className="w-12 h-12 rounded-md object-cover" />
                    <div>
                      <p className="font-semibold text-lg">{item.title}</p>
                      <p className="text-sm text-gray-500">${item.price.toFixed(2)} x {item.qty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-amber-700">${(item.price * item.qty).toFixed(2)}</span>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex justify-between text-2xl font-bold">
            <span>Total:</span>
            <span className="text-amber-700">${getTotal().toFixed(2)}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isLoading || cart.length === 0}
            className={`mt-6 w-full py-3 rounded-xl flex items-center justify-center gap-2 transition
              ${cart.length === 0 || isLoading
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-green-600 hover:bg-green-700 text-white"}`}
          >
            {isLoading ? (
              <><Loader2 className="animate-spin" size={24} /> Processing...</>
            ) : (
              "Complete Sale"
            )}
          </button>

          {isPaid && lastOrder && (
            <>
              <div className="mt-6 p-4 bg-green-100 text-green-700 rounded-xl flex items-center gap-3">
                <BadgeCheck size={24} className="text-green-600" /> Payment successful!
              </div>
              <button
                onClick={handlePrintInvoice}
                disabled={!isPaid || !lastOrder}
                className={`mt-4 w-full py-3 rounded-xl font-semibold transition
                  ${!isPaid || !lastOrder
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"}`}
              >
                Print Invoice
              </button>
              <div ref={printRef} style={{ display: 'none' }}>
                <div style={{
                  maxWidth: '600px',
                  margin: 'auto',
                  fontFamily: 'Arial, sans-serif',
                  padding: '20px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '20px'
                  }}>
                    {/* <div><strong>YOUR<br />LOGO</strong></div> */}
                    <div style={{ width: '70px', height: '70px', overflow: 'hidden', borderRadius: '50%' }}>
                      <img style={{ width: '100%', height: '100%', objectFit: 'cover' }} src="https://marketplace.canva.com/EAGQJOtMpq8/2/0/1600w/canva-brown-modern-circle-coffee-shop-logo-TCp6UxDtpus.jpg" alt="logo" />
                    </div>

                    <div><strong>NO.</strong>00{lastOrder.items[lastOrder.items.length - 1].productId}</div>
                  </div>

                  <h2 style={{
                    // textAlign: 'center',
                    marginBottom: '10px'
                  }}>INVOICE</h2>

                  <p><strong>Date:</strong> {new Date(lastOrder.timestamp).toLocaleDateString()}</p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    margin: '20px 0'
                  }}>
                    <div>
                      <strong>Billed to:</strong><br />
                      Saler ID : {admin?.id} <br />
                      Saler Name : {admin?.name} <br />
                      Email: {admin?.email}
                    </div>
                    <div>
                      <strong>From:</strong><br />
                      Olivia Wilson<br />
                      123 Anywhere St.<br />
                      hello@reallygreatsite.com
                    </div>
                  </div>

                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    border: '1px solid #ccc'
                  }}>
                    <thead>
                      <tr style={{ background: '#f0f0f0' }}>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Item</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Qty</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Price</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lastOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.productName}</td>
                          <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>
                            {item.quantity}
                          </td>
                          <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>
                            ${item.price.toFixed(2)}
                          </td>
                          <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <p style={{
                    textAlign: 'right',
                    marginTop: '10px'
                  }}>
                    <strong>Total: </strong>${lastOrder.totalAmount.toFixed(2)}
                  </p>

                  <p style={{ marginTop: '10px' }}>
                    <strong>Payment method:</strong> Cash
                  </p>

                  <p>
                    <strong>Note:</strong> Thank you for choosing us!
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="w-full md:w-2/3 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {coffeeMenu?.map((item: MenuItem) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`rounded-xl shadow-lg p-4 flex flex-col items-center cursor-pointer transition-all group relative ${darkLight ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}
              >
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                  <button onClick={() => addToCart(item)} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-full flex items-center gap-2">
                    <ShoppingCart size={20} /> Add to Cart
                  </button>
                </div>
                <img src={item.image} alt={item.title} className="rounded-lg h-36 w-36 object-cover mb-3" />
                <h2 className="text-xl font-bold text-center">{item.title}</h2>
                <p className="text-lg mt-1 font-semibold">${item.price.toFixed(2)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoffeePOS;