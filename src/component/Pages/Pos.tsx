import React, { useState, useEffect, useRef } from 'react';
import { Coffee, ShoppingCart, Trash2, BadgeCheck, Loader2, UtensilsCrossed, LucideList } from 'lucide-react';
import { motion} from 'framer-motion';
// import { MenuItem } from '../utils/data';
import { CartItem, SaleRecord, addSaleRecord } from '../utils/saleUtils';
import { v4 as uuidv4 } from 'uuid';
import { useGlobleContextDarklight } from '../../AllContext/context';
import { HookIntergrateAPI } from '../../CustomHook/HookIntergrateAPI';
import useFetchDataApi from '../../CustomHook/FetchDataApi';
import { Wine, CakeSlice} from 'lucide-react';
import { GlassWater } from 'lucide-react';
import { useRefreshTable } from '../../AllContext/context';
// import { LucideList } from 'lucide-react';

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
interface MenuItem {
  id: number;
  title: string;
  price: number;
  image: string; // This will now hold the imported image path
}
const Pos: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [lastOrder, setLastOrder] = useState<SaleRecord | null>(null);
  const { darkLight } = useGlobleContextDarklight();
  const { createData } = HookIntergrateAPI();
  const [typeId, setTypeId] = useState<number | null>(0);
  const { setRefreshTables } = useRefreshTable();

  const { data: CoffeeMenu } = useFetchDataApi(`https://localhost:7095/api/CoffeeMenu/filter?typeId=${typeId}`);
  const { data } = useFetchDataApi("https://localhost:7095/api/User");
  const [imformationuserAdmin, setImformationuserAdmin] = useState<UserProfile | null>(null);

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const email = sessionStorage.getItem("email");
    if (data && email) {
      const foundUser = data.find((item: UserProfile) => item.email === email);
      setImformationuserAdmin(foundUser || null);
    }
  }, [data]);

  const addToCart = (item: MenuItem) => {
    console.log("item ==>> ", item);
    setIsPaid(false);
    const exists = cart.find(c => c.id === item.id);
    if (exists) {
      console.log("exist ==> ", cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { ...item, qty: 1 }]); // if manu
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const getTotal = () => cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handleCheckout = () => {
    if (cart.length === 0 || !imformationuserAdmin) return;
    setIsLoading(true);

    const newSale: SaleRecord = {
      orderId: uuidv4(),
      salerId: imformationuserAdmin.id,
      salerName: imformationuserAdmin.name,
      timestamp: new Date().toISOString(),
      totalAmount: parseFloat(getTotal().toFixed(2)),
      items: cart.map(item => ({
        productId: item.id.toString(), // Convert number to string here
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
    if (!printRef.current || !lastOrder) return;

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
    <div className={`flex-col flex h-screen transition-colors duration-500 w-full pb-20 ${darkLight ? "bg-gradient-to-tr from-gray-900 to-gray-800 text-white" : "bg-gradient-to-tr from-gray-100 to-white text-gray-900"}`}>
      {/* Header */}
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Coffee className="text-amber-700" size={36} /> Coffee POS System
        </h1>
        <div className="menu_filter flex flex-wrap gap-3 my-4">
          <button
            onClick={() => { setTypeId(0); setRefreshTables(new Date()) }}
            className="w-[110px] h-[45px] bg-gray-600 hover:bg-gray-700 text-white cursor-pointer rounded-2xl font-bold flex items-center justify-center gap-2 transition"
          >
            <LucideList size={18} />
            ទាំងអស់
          </button>
          <button
            onClick={() => { setTypeId(1); setRefreshTables(new Date()) }}
            className="w-[110px] h-[45px] bg-amber-600 hover:bg-amber-700 text-white cursor-pointer rounded-2xl font-bold flex items-center justify-center gap-2 transition"
          >
            <Coffee size={18} />
            កាហ្វេ
          </button>
          <button
            onClick={() => { setTypeId(2); setRefreshTables(new Date()) }}
            className="w-[110px] h-[45px] bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold flex cursor-pointer items-center justify-center gap-2 transition"
          >
            <UtensilsCrossed size={18} />
            បាយ
          </button>

          <button
            onClick={() => { setTypeId(3); setRefreshTables(new Date()) }}
            className="w-[110px] h-[45px] bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center cursor-pointer justify-center gap-2 transition"
          >
            <GlassWater size={18} />
            ភេសជ្ជៈ
          </button>
          <button
            onClick={() => { setTypeId(4); setRefreshTables(new Date()) }}
            className="w-[110px] h-[45px] bg-purple-600 hover:bg-purple-700n text-white rounded-2xl font-bold flex cursor-pointer items-center justify-center gap-2 transition"
          >
            <Wine size={18} />
            ស្រា
          </button>
          <button
            onClick={() => { setTypeId(5); setRefreshTables(new Date()) }}
            className="w-[110px] h-[45px] bg-pink-600 hover:bg-pink-700 text-white rounded-2xl font-bold flex cursor-pointer items-center justify-center gap-2 transition"
          >
            <CakeSlice size={18} />
            នំ
          </button>
        </div>

      </div>

      {/* Main Content */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Cart Section */}
        <div className={`w-full md:w-1/3 lg:w-2/6 p-4 rounded-2xl shadow-md transition-colors duration-300 overflow-y-auto h-[85%] scrollbar-hide ${darkLight ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <ShoppingCart className="text-amber-600" /> Current Order
          </h2>

          {cart.length === 0 ? (
            <p className="text-center py-4 text-gray-400">No items in cart. Add some coffee!</p>
          ) : (
            <ul className="space-y-4">
              {cart.map(item => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="flex justify-between items-center border-b border-gray-300 pb-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-12 h-12 rounded-md object-cover"
                    />
                    <div>
                      <p className="font-semibold text-lg">{item.title}</p>
                      <p className="text-sm text-gray-500">
                        ${item.price.toFixed(2)} x {item.qty}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-amber-700">
                      ${(item.price * item.qty).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}

          <div className="mt-6 pt-4 border-t-2 border-gray-200 flex justify-between text-2xl font-bold">
            <span>Total:</span>
            <span className="text-amber-700">${getTotal().toFixed(2)}</span>
          </div>

          <div className="mt-6">
            <button
              onClick={handleCheckout}
              disabled={isLoading || cart.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl text-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={24} /> Processing...
                </>
              ) : (
                "Complete Sale"
              )}
            </button>
          </div>

          {isPaid && lastOrder && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-green-100 border border-green-400 rounded-xl flex items-center gap-3 text-green-700 font-medium"
              >
                <BadgeCheck size={24} className="text-green-600" /> Payment successful!
              </motion.div>

              <button
                onClick={handlePrintInvoice}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition"
              >
                Print Invoice
              </button>

              {/* Hidden invoice content for printing */}
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
                    <div style={{ width: '70px', height: '70px', overflow: 'hidden', borderRadius: '50%' }}>
                      <img style={{ width: '100%', height: '100%', objectFit: 'cover' }} src="https://marketplace.canva.com/EAGQJOtMpq8/2/0/1600w/canva-brown-modern-circle-coffee-shop-logo-TCp6UxDtpus.jpg" alt="logo" />
                    </div>
                    <div><strong>NO.</strong>00{lastOrder.items[lastOrder.items.length - 1].productId}</div>
                  </div>

                  <h2 style={{ marginBottom: '10px' }}>INVOICE</h2>

                  <p><strong>Date:</strong> {new Date(lastOrder.timestamp).toLocaleDateString()}</p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    margin: '20px 0'
                  }}>
                    <div>
                      <strong>Billed to:</strong><br />
                      Saler ID : {imformationuserAdmin?.id} <br />
                      Saler Name : {imformationuserAdmin?.name} <br />
                      Email: {imformationuserAdmin?.email}
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

                  <p style={{ textAlign: 'right', marginTop: '10px' }}>
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

        {/* Menu Section */}
        <div className="w-full md:w-2/3 lg:w-3/4 overflow-y-auto pr-2 scrollbar-hide">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {CoffeeMenu.map((item: MenuItem) => (
              <motion.div
                key={item.id}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)"
                }}
                whileTap={{ scale: 0.98 }}
                className={`rounded-xl shadow-lg p-4 flex flex-col items-center cursor-pointer transition-all duration-200 group relative overflow-hidden ${darkLight ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl z-10 flex items-end justify-center pb-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-full text-lg font-semibold transform translate-y-full group-hover:translate-y-0 transition-all duration-300 delay-100 flex items-center gap-2"
                  >
                    <ShoppingCart size={20} /> Add to Cart
                  </button>
                </div>
                <img
                  src={item.image}
                  alt={item.title}
                  className="rounded-lg h-36 w-36 object-cover mb-3 transition-transform duration-300 group-hover:scale-105"
                />
                <h2 className="text-xl font-bold text-center">{item.title}</h2>
                <p className="text-lg mt-1 font-semibold">${item.price.toFixed(2)}</p>
              </motion.div>
            ))}
            <div className='mb-10'></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pos;