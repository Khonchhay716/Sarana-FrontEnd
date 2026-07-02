// import { useState, useEffect, useCallback, useRef } from "react";
// import { useGlobleContextDarklight } from "../../AllContext/context";
// import { AxiosApi } from "../../component/Axios/Axios";
// import { alertError } from "../../HtmlHelper/Alert";
// import alertify from "alertifyjs";
// import XSelectSearch, { MultiValue as SerialMultiValue } from "../../component/XSelectSearch/Xselectsearch";

// interface Product {
//   id: number;
//   code: string;
//   name: string;
//   imageUrl: string;
//   unit: string;
//   salePrice: number;
//   stockQuantity: number;
//   inStock: boolean;
//   categoryId: number | null;
//   categoryName: string | null;
//   productType?: string;
//   description?: string;
//   taxRate?: number;
//   taxAmount?: number;
// }

// interface ProductsPageResponse {
//   data: Product[];
//   totalCount: number;
//   page: number;
//   pageSize: number;
//   totalPages: number;
//   hasPrevious: boolean;
//   hasNext: boolean;
// }

// interface SerialNumberItem { id: number; productId: number; serialNo: string; status: string; }
// interface SelectedSerial { id: number | string; serialNo: string; data?: SerialNumberItem | null; }
// interface CartItem extends Product {
//   qty: number;
//   serialNumbers?: SelectedSerial[];
//   warrantyMonths?: number;
//   warrantyStart?: string;
//   warrantyEnd?: string;
// }

// interface OrderSummaryItem {
//   id: number;
//   productId: number;
//   productName: string;
//   quantity: number;
//   unitPrice: number;
//   imageUrl?: string | null;
//   discountAmount: number;
//   discountName?: string | null;
//   globalDiscountAmount: number;
//   globalDiscountName?: string | null;
//   lineTotal: number;
//   serialNumbers?: string[];
// }
// interface OrderSummaryResponse {
//   customerId: number | null;
//   customerName: string;
//   customerAvailablePoint: number | null;
//   paymentMethod: string;
//   subTotal: number;
//   discountAmount: number;
//   totalAmount: number;
//   pointEarned: number;
//   warnings: string[];
//   items: OrderSummaryItem[];
// }

// interface CustomerInfo { id: number; name: string; totalPoint: number; }
// interface PointSetupInfo { pointsPerRedemption: number; isActive: boolean; }

// interface PlaceOrderItemPayload {
//   productId: number;
//   quantity: number;
//   serialNumbers?: string[];
//   warrantyStartDate?: string | null; // ✅ NEW: ISO datetime, only set when item has a warranty
//   warrantyEndDate?: string | null;   // ✅ NEW
// }
// interface PlaceOrderPayload {
//   customerId?: number;
//   paymentMethod: number;
//   note?: string;
//   items: PlaceOrderItemPayload[];
// }

// interface SerialNumberModalProps {
//   product: Product; dark: boolean;
//   existingSerials?: SelectedSerial[];
//   existingWarrantyMonths?: number; existingWarrantyStart?: string;
//   onConfirm: (p: Product, s: SelectedSerial[], wm: number, ws: string, we: string) => void;
//   onClose: () => void;
// }
// interface CartRowProps {
//   item: CartItem; onInc: () => void; onDec: () => void; onRemove: () => void;
//   dark: boolean; rowBg: string; textPrimary: string; textMuted: string;
// }
// interface ProductRowProps {
//   product: Product; cartItem: CartItem | undefined; onAdd: (p: Product) => void;
//   dark: boolean; productBg: string; borderColor: string;
//   textPrimary: string; textSub: string; textMuted: string; imgFallback: string;
// }

// interface ReceiptData {
//   transId: string;
//   customerName: string;
//   items: CartItem[];
//   subtotal: number;
//   totalTax: number;
//   totalAmount: number;
//   paymentMethod: number;
//   cashGiven?: number;
//   change?: number;
//   discount?: number;
// }

// const PAYMENT_METHODS = [
//   { value: 1, label: "Cash", icon: "💵" },
//   { value: 2, label: "Bank QR", icon: "📲" },
//   { value: 3, label: "Point", icon: "⭐" },
// ];

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// const isSerialized = (p: Product) => p.productType === "Serialized";
// const PLACEHOLDER_LIGHT = "https://placehold.co/300x300/e2e8f0/94a3b8?text=No+Image";
// const PLACEHOLDER_DARK = "https://placehold.co/300x300/1e293b/475569?text=No+Image";
// const WARRANTY_OPTIONS = [
//   { label: "None", months: 0 }, { label: "1 mo", months: 1 },
//   { label: "3 mo", months: 3 }, { label: "6 mo", months: 6 },
//   { label: "1 yr", months: 12 }, { label: "2 yr", months: 24 },
// ];
// const todayISO = () => new Date().toISOString().split("T")[0];
// const addMonths = (dateStr: string, months: number) => {
//   if (!months || !dateStr) return "";
//   const d = new Date(dateStr); d.setMonth(d.getMonth() + months);
//   return d.toISOString().split("T")[0];
// };
// const formatDate = (iso: string) =>
//   iso ? new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";
// // ✅ NEW: backend expects full ISO datetimes for warrantyStartDate/warrantyEndDate
// // (e.g. "2026-06-28T12:57:39.516Z"), not the plain "YYYY-MM-DD" we keep in cart state.
// const toIsoOrNull = (dateStr?: string): string | null => (dateStr ? new Date(dateStr).toISOString() : null);

// function Spinner({ size = "md" }: { size?: "sm" | "md" }) {
//   const s = size === "sm" ? "w-4 h-4" : "w-5 h-5";
//   return (
//     <svg className={`animate-spin ${s}`} viewBox="0 0 24 24" fill="none">
//       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//     </svg>
//   );
// }

// // ─── Realistic SVG Barcode Generator ──────────────────────────────────────────
// function BarcodeSVG({ value, height = 50 }: { value: string; height?: number }) {
//   const rects: React.ReactNode[] = [];
//   let x = 0;
//   const addBar = (w: number) => { rects.push(<rect key={x} x={x} y={0} width={w} height={height} fill="#000" />); x += w; };
//   const addSpace = (w: number) => { x += w; };
//   addBar(2); addSpace(1); addBar(1); addSpace(1); addBar(1); addSpace(1);
//   for (let i = 0; i < value.length; i++) {
//     const c = value.charCodeAt(i);
//     addBar((c % 3) + 1); addSpace(1); addBar(((c >> 1) % 2) + 1); addSpace(1); addBar(((c >> 2) % 3) + 1); addSpace(2);
//   }
//   addBar(2); addSpace(1); addBar(1); addSpace(1); addBar(2);
//   return (<svg viewBox={`0 0 ${x} ${height}`} width="100%" height={height} preserveAspectRatio="none" style={{ display: 'block' }}>{rects}</svg>);
// }

// // ─── Receipt Modal ────────────────────────────────────────────────────────────
// function ReceiptModal({ data, onClose }: { data: ReceiptData; onClose: () => void }) {
//   const printRef = useRef<HTMLDivElement>(null);
//   const thermalCSS = `
//     @page { size: 80mm auto; margin: 0; }
//     * { margin: 0; padding: 0; box-sizing: border-box; }
//     body { font-family: 'Courier New', Courier, monospace; width: 80mm; padding: 4mm 3mm; font-size: 11px; line-height: 1.5; color: #000; }
//     .center { text-align: center; } .right { text-align: right; } .bold { font-weight: 700; }
//     .title { font-size: 18px; font-weight: 900; letter-spacing: 3px; }
//     .subtitle { font-size: 8px; letter-spacing: 1.5px; }
//     .divider { border-top: 1px dashed #000; margin: 5px 0; }
//     .divider-double { border-top: 2px solid #000; margin: 5px 0; }
//     table { width: 100%; border-collapse: collapse; }
//     th { font-size: 10px; text-align: left; padding: 2px 0; border-bottom: 1px solid #000; }
//     th.right { text-align: right; } th.qty { text-align: center; width: 24px; }
//     td { font-size: 11px; padding: 2px 0; vertical-align: top; }
//     td.right { text-align: right; } td.qty { text-align: center; }
//     .serial { font-size: 8px; color: #555; }
//     .total-label { font-size: 15px; font-weight: 900; } .total-value { font-size: 15px; font-weight: 900; text-align: right; }
//     .paid { display: inline-block; border: 2px solid #000; padding: 1px 8px; font-weight: 900; font-size: 13px; letter-spacing: 3px; }
//     .footer { font-size: 9px; } .trans-id { font-size: 8px; margin-top: 2px; }
//   `;
//   const handlePrint = () => {
//     const el = printRef.current; if (!el) return;
//     const win = window.open("", "_blank", "width=320,height=600"); if (!win) return;
//     win.document.write(`<html><head><title>Receipt ${data.transId}</title><style>${thermalCSS}</style></head><body>${el.innerHTML}</body></html>`);
//     win.document.close(); win.focus(); setTimeout(() => { win.print(); win.close(); }, 300);
//   };
//   const methodLabel = data.paymentMethod === 1 ? "Cash" : data.paymentMethod === 2 ? "Bank QR" : "Points";
//   const now = new Date();
//   const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
//   const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
//   const barcodeValue = data.transId.replace("#", "");

//   return (
//     <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm mt-15">
//       <div className="bg-white rounded-xl shadow-2xl w-full max-w-[420px] flex flex-col overflow-hidden" style={{ maxHeight: "87vh" }}>
//         <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
//           <div className="px-8 pt-7 pb-2 text-black">
//             <div className="flex flex-col items-center mb-3">
//               <div className="flex items-center gap-2.5 mb-3">
//                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0">
//                   <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" /></svg>
//                 </div>
//                 <div>
//                   <p className="font-black text-blue-900 text-base leading-tight">SOKHA SK</p>
//                   <p className="text-[10px] text-slate-400 leading-tight tracking-wider">SECURITY & TECH SOLUTIONS</p>
//                 </div>
//               </div>
//               <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-2 shadow-md shadow-emerald-200">
//                 <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
//               </div>
//               <h2 className="text-lg font-black text-emerald-600 tracking-tight">Transaction Successful!</h2>
//             </div>
//             <div className="flex justify-between text-xs text-slate-500 mb-1">
//               <span>Date: <b className="text-slate-700">{dateStr}</b></span>
//               <span>Time: <b className="text-slate-700">{timeStr}</b></span>
//             </div>
//             <div className="flex justify-between text-xs text-slate-500 mb-4">
//               <span>Trans: <b className="text-slate-700">{data.transId}</b></span>
//               <span>Customer: <b className="text-slate-700">{data.customerName}</b></span>
//             </div>
//             <div className="border-t border-dashed border-slate-300 mb-4" />
//             <table className="w-full text-xs mb-4">
//               <thead><tr className="border-b border-slate-300">
//                 <th className="text-left py-2 font-bold text-slate-600 pr-3">Item</th>
//                 <th className="text-center py-2 font-bold text-slate-600 w-10">Qty</th>
//                 <th className="text-right py-2 font-bold text-slate-600 w-20">Price</th>
//                 <th className="text-right py-2 font-bold text-slate-600 w-20">Total</th>
//               </tr></thead>
//               <tbody>
//                 {data.items.map(item => (
//                   <tr key={item.id} className="border-b border-slate-100">
//                     <td className="py-2 text-slate-700 font-medium pr-3">
//                       <p className="truncate max-w-[160px]">{item.name}</p>
//                       {isSerialized(item) && item.serialNumbers && item.serialNumbers.length > 0 && (
//                         <p className="text-[9px] font-mono text-slate-400 truncate mt-0.5">S/N: {item.serialNumbers.map(s => s.serialNo).join(", ")}</p>
//                       )}
//                     </td>
//                     <td className="py-2 text-center text-slate-600">{item.qty}</td>
//                     <td className="py-2 text-right text-slate-600">${Number(item.salePrice).toFixed(2)}</td>
//                     <td className="py-2 text-right font-semibold text-slate-700">${(item.salePrice * item.qty).toFixed(2)}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//             <div className="border-t border-dashed border-slate-300 mb-4" />
//             <div className="space-y-1.5 text-xs mb-4">
//               <div className="flex justify-between text-slate-500"><span>Sub-total</span><span className="text-slate-700">${data.subtotal.toFixed(2)}</span></div>
//               <div className="flex justify-between text-slate-500"><span>Tax ({data.items[0]?.taxRate ?? 0}%)</span><span className="text-slate-700">${data.totalTax.toFixed(2)}</span></div>
//               {(data.discount ?? 0) > 0 && (<div className="flex justify-between text-emerald-600 font-semibold"><span>Discount</span><span>-${data.discount!.toFixed(2)}</span></div>)}
//               <div className="flex justify-between font-black text-base pt-3 border-t-2 border-slate-800 mt-2">
//                 <span className="text-slate-900">TOTAL</span><span className="text-blue-600">${data.totalAmount.toFixed(2)}</span>
//               </div>
//             </div>
//             <div className="border-t border-dashed border-slate-300 mb-4" />
//             <div className="text-xs space-y-1.5 mb-4">
//               <div className="flex justify-between text-slate-600"><span>Payment Method</span><span className="font-semibold">{methodLabel}</span></div>
//               {data.paymentMethod === 1 && data.cashGiven != null && (<>
//                 <div className="flex justify-between text-slate-600"><span>Cash Given</span><span className="font-semibold">${data.cashGiven.toFixed(2)}</span></div>
//                 <div className="flex justify-between font-bold text-emerald-600"><span>Change</span><span>${(data.change ?? 0).toFixed(2)}</span></div>
//               </>)}
//               {data.paymentMethod === 3 && (<div className="flex justify-between text-amber-600 font-semibold"><span>Points Redeemed</span><span>✓ Applied</span></div>)}
//             </div>
//             <div className="border-t-2 border-slate-800 mb-5" />
//             <div className="flex justify-center mb-5">
//               <span className="inline-block border-[3px] border-emerald-500 text-emerald-600 font-black text-sm tracking-[5px] px-4 py-1 rotate-[-6deg]">PAID</span>
//             </div>
//             <div className="w-full max-w-[240px] mx-auto mb-3">
//               <BarcodeSVG value={barcodeValue} height={44} />
//               <p className="text-center text-[10px] text-slate-500 mt-1.5 font-mono tracking-widest">{data.transId}</p>
//             </div>
//             <div className="text-center text-[11px] text-slate-400 space-y-0.5 mt-3">
//               <p className="font-semibold text-slate-500">THANK YOU FOR YOUR PURCHASE!</p>
//               <p>www.sokhask.com</p>
//             </div>
//           </div>
//         </div>
//         <div ref={printRef} style={{ position: "absolute", left: "-9999px", top: 0 }}>
//           <div className="center" style={{ marginBottom: "2px" }}><div className="title">SOKHA SK</div><div className="subtitle">SECURITY & TECH SOLUTIONS</div><div style={{ fontSize: "9px" }}>www.sokhask.com</div></div>
//           <div className="divider-double" />
//           <table><tbody><tr><td>Date: {dateStr}</td><td className="right">Time: {timeStr}</td></tr><tr><td>Trans: {data.transId}</td><td className="right">Customer: {data.customerName}</td></tr></tbody></table>
//           <div className="divider" />
//           <table><thead><tr><th>Item</th><th className="qty">Qty</th><th className="right">Price</th><th className="right">Total</th></tr></thead><tbody>
//             {data.items.map(item => (<tr key={item.id}><td>{item.name}{isSerialized(item) && item.serialNumbers && item.serialNumbers.length > 0 && (<div className="serial">S/N: {item.serialNumbers.map(s => s.serialNo).join(", ")}</div>)}</td><td className="qty">{item.qty}</td><td className="right">${Number(item.salePrice).toFixed(2)}</td><td className="right bold">${(item.salePrice * item.qty).toFixed(2)}</td></tr>))}
//           </tbody></table>
//           <div className="divider" />
//           <table><tbody><tr><td>Sub-total</td><td className="right">${data.subtotal.toFixed(2)}</td></tr><tr><td>Tax ({data.items[0]?.taxRate ?? 0}%)</td><td className="right">${data.totalTax.toFixed(2)}</td></tr>{(data.discount ?? 0) > 0 && (<tr><td>Discount</td><td className="right">-${data.discount!.toFixed(2)}</td></tr>)}</tbody></table>
//           <div className="divider-double" /><table><tbody><tr><td className="total-label">TOTAL</td><td className="total-value">${data.totalAmount.toFixed(2)}</td></tr></tbody></table>
//           <div className="divider" />
//           <table><tbody><tr><td>Payment Method</td><td className="right bold">{methodLabel.toUpperCase()}</td></tr>{data.paymentMethod === 1 && data.cashGiven != null && (<><tr><td>Cash Given</td><td className="right">${data.cashGiven.toFixed(2)}</td></tr><tr><td className="bold">Change</td><td className="right bold">${(data.change ?? 0).toFixed(2)}</td></tr></>)}{data.paymentMethod === 3 && (<tr><td>Points Redeemed</td><td className="right">Applied</td></tr>)}</tbody></table>
//           <div className="divider" /><div className="center" style={{ padding: "3px 0" }}><span className="paid">PAID</span></div>
//           <div style={{ width: '100%', marginTop: '4px' }}><BarcodeSVG value={barcodeValue} height={50} /><div className="center trans-id">{data.transId}</div></div>
//           <div className="divider" /><div className="center footer"><div className="bold">THANK YOU FOR YOUR PURCHASE!</div><div>Please come again</div></div><div className="divider-double" />
//         </div>
//         <div className="px-6 py-1 pb-2 space-y-1 border-t border-slate-100 shrink-0 bg-white">
//           <button onClick={handlePrint} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all active:scale-95 shadow-md">
//             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
//             Print Receipt
//           </button>
//           <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-black bg-emerald-500 text-white hover:bg-emerald-600 transition-all active:scale-95 shadow-md">🛒 New Sale</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Payment Modal ────────────────────────────────────────────────────────────
// interface PaymentModalProps {
//   dark: boolean; cart: CartItem[]; subtotal: number; totalTax: number; autoDiscount: number;
//   customer: CustomerInfo | null; customerPointLoading: boolean; pointSetup: PointSetupInfo | null;
//   onConfirm: (paymentMethod: number, discount: number, notes: string, pointsUsed: number, cashGiven: number, finalTotal: number) => void;
//   onClose: () => void; placing: boolean; orderError: string | null;
// }

// function PaymentModal({ dark, cart, subtotal, totalTax, autoDiscount, customer, customerPointLoading, pointSetup, onConfirm, onClose, placing, orderError }: PaymentModalProps) {
//   const [paymentMethod, setPaymentMethod] = useState<number>(1);
//   const [manualDiscount, setManualDiscount] = useState<string>("");
//   const [notes, setNotes] = useState<string>("");
//   const [cashGiven, setCashGiven] = useState<string>("");
//   const [showSummary, setShowSummary] = useState(false);

//   const maxDiscount = subtotal + totalTax;
//   const manualDiscountAmt = Math.min(parseFloat(manualDiscount) || 0, maxDiscount);
//   const totalDiscountAmt = Math.min(autoDiscount + manualDiscountAmt, maxDiscount);
//   const baseTotal = subtotal + totalTax - totalDiscountAmt;
//   const redemptionRate = pointSetup?.pointsPerRedemption ?? 0;
//   const pointsNeeded = redemptionRate > 0 ? Math.ceil(baseTotal * redemptionRate) : 0;
//   const customerPoints = customer?.totalPoint ?? 0;
//   const canPayByPoint = customer != null && !customerPointLoading && redemptionRate > 0 && customerPoints >= pointsNeeded && pointsNeeded > 0;
//   const pointsUsed = paymentMethod === 3 ? pointsNeeded : 0;
//   const pointDiscount = paymentMethod === 3 && redemptionRate > 0 ? pointsUsed / redemptionRate : 0;
//   const total = Math.max(0, baseTotal - pointDiscount);
//   const cashGivenNum = parseFloat(cashGiven) || 0;
//   const change = paymentMethod === 1 ? Math.max(0, cashGivenNum - total) : 0;
//   const totalQty = cart.reduce((s, i) => s + i.qty, 0);
//   const cashIsValid = paymentMethod !== 1 || cashGivenNum >= total;
//   const canConfirm = !placing && cashIsValid;

//   useEffect(() => { if (paymentMethod === 3 && !canPayByPoint) setPaymentMethod(1); }, [canPayByPoint, paymentMethod]);

//   const dl = dark;
//   const border = dl ? "border-slate-700" : "border-slate-200";
//   const txt = dl ? "text-slate-100" : "text-slate-900";
//   const txtSub = dl ? "text-slate-400" : "text-slate-500";
//   const txtMuted = dl ? "text-slate-500" : "text-slate-400";
//   const modal = dl ? "bg-[#1e293b]" : "bg-white";
//   const overlay = dl ? "bg-black/75" : "bg-black/55";
//   const sectionBg = dl ? "bg-slate-800/60" : "bg-slate-50";
//   const divider = dl ? "border-slate-700" : "border-slate-200";
//   const inputCls = `w-full px-3 py-2 rounded-xl border text-sm outline-none transition-colors ${dl ? "bg-slate-800 border-slate-600 text-slate-100 focus:border-blue-500 placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-400 placeholder-slate-400"}`;

//   const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const raw = e.target.value;
//     if (raw === "" || raw === ".") { setManualDiscount(raw); return; }
//     const parsed = parseFloat(raw);
//     if (isNaN(parsed)) { setManualDiscount(""); return; }
//     setManualDiscount(parsed > maxDiscount ? maxDiscount.toFixed(2) : raw);
//   };

//   const SummaryContent = () => (
//     <>
//       <div className={`px-4 py-1.5 border-b ${border}`}><p className={`text-[11px] font-bold uppercase tracking-wide ${txtMuted}`}>Order Summary</p></div>
//       <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2" style={{ scrollbarWidth: "thin" }}>
//         {cart.map(item => (
//           <div key={item.id} className={`rounded-xl px-3 py-2.5 border ${border} ${sectionBg}`}>
//             <div className="flex items-start justify-between gap-2">
//               <div className="flex-1 min-w-0">
//                 <p className={`text-sm font-semibold ${txt} truncate`}>{item.name}</p>
//                 {isSerialized(item) && item.serialNumbers && item.serialNumbers.length > 0 && (
//                   <p className={`text-[10px] font-mono ${txtMuted} truncate mt-0.5`}>{item.serialNumbers.map(s => s.serialNo).join(", ")}</p>
//                 )}
//                 {(item.taxRate ?? 0) > 0 && (<p className="text-[10px] text-amber-400 font-semibold mt-0.5">Tax {item.taxRate}% · +${((item.taxAmount ?? 0) * item.qty).toFixed(2)}</p>)}
//               </div>
//               <div className="flex items-center gap-2 shrink-0">
//                 <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-bold ${dl ? "bg-slate-700 text-slate-300" : "bg-slate-200 text-slate-600"}`}>×{item.qty}</span>
//                 <span className="text-sm font-bold text-sky-500 w-16 text-right">${(item.salePrice * item.qty).toFixed(2)}</span>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//       <div className={`border-t ${border} px-4 py-4 space-y-2.5 shrink-0`}>
//         <div className="flex justify-between text-sm"><span className={txtSub}>Subtotal</span><span className={dl ? "text-slate-300" : "text-slate-700"}>${subtotal.toFixed(2)}</span></div>
//         <div className="flex justify-between text-sm"><span className={txtSub}>Tax</span><span className={dl ? "text-slate-300" : "text-slate-700"}>${totalTax.toFixed(2)}</span></div>
//         {autoDiscount > 0 && (<div className="flex justify-between text-sm"><span className="text-emerald-400 flex items-center gap-1">Auto Discount <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15">Applied</span></span><span className="text-emerald-400 font-medium">-${autoDiscount.toFixed(2)}</span></div>)}
//         {manualDiscountAmt > 0 && (<div className="flex justify-between text-sm"><span className={txtSub}>Manual Discount</span><span className="text-red-400">-${manualDiscountAmt.toFixed(2)}</span></div>)}
//         {paymentMethod === 3 && pointDiscount > 0 && (<div className="flex justify-between text-sm"><span className="text-amber-400 flex items-center gap-1.5">⭐ Point Payment <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">{pointsUsed} pts</span></span><span className="text-amber-400 font-medium">-${pointDiscount.toFixed(2)}</span></div>)}
//         <div className={`flex justify-between items-center pt-3 border-t border-dashed ${dl ? "border-slate-600" : "border-slate-300"}`}>
//           <span className={`font-bold text-sm ${txt}`}>Total Payable</span><span className="font-extrabold text-2xl text-blue-500">${total.toFixed(2)}</span>
//         </div>
//         {paymentMethod === 1 && cashGivenNum > 0 && (<div className={`flex justify-between items-center pt-2 border-t ${divider}`}><span className={`text-sm font-semibold ${txtSub}`}>Change</span><span className={`font-bold text-lg ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}>${change.toFixed(2)}</span></div>)}
//       </div>
//     </>
//   );

//   return (
//     <div className={`fixed inset-0 z-50 flex mt-16 items-center justify-center ${overlay} backdrop-blur-sm p-2 sm:p-4`} onClick={e => { if (e.target === e.currentTarget && !placing) onClose(); }}>
//       <div className={`${modal} rounded-2xl border ${border} w-full shadow-2xl flex flex-col overflow-hidden`} style={{ maxWidth: "860px", height: "calc(100vh - 74px)", maxHeight: "760px" }}>
//         <div className={`flex items-center gap-3 px-4 sm:px-5 py-2 border-b ${border} shrink-0`}>
//           <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0">
//             <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
//           </div>
//           <div className="flex-1 min-w-0">
//             <h2 className={`font-bold text-sm sm:text-base ${txt}`}>Confirm Payment</h2>
//             <p className={`text-xs ${txtMuted} truncate flex items-center gap-1.5`}>
//               {totalQty} item{totalQty !== 1 ? "s" : ""} · {cart.length} product{cart.length !== 1 ? "s" : ""}
//               {customer && (
//                 <span className="ml-1 text-amber-400 font-semibold flex items-center gap-1">
//                   · ⭐ {customerPointLoading ? <Spinner size="sm" /> : `${customer.totalPoint} pts`}
//                 </span>
//               )}
//             </p>
//           </div>
//           <button onClick={() => setShowSummary(v => !v)} className={`sm:hidden px-2 py-1 rounded-lg text-xs font-semibold border ${dl ? "border-slate-600 text-slate-300" : "border-slate-200 text-slate-600"}`}>{showSummary ? "Payment" : "Summary"}</button>
//           <button onClick={onClose} disabled={placing} className={`w-8 h-8 rounded-lg flex items-center justify-center ${dl ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}>
//             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
//           </button>
//         </div>
//         <div className="flex flex-1 min-h-0 overflow-hidden">
//           <div className={`flex-col border-r ${border} sm:flex sm:w-[300px] md:w-[340px] sm:shrink-0 min-h-0 ${showSummary ? "flex w-full" : "hidden sm:flex"}`}><SummaryContent /></div>
//           <div className={`flex-1 flex-col overflow-hidden sm:flex min-h-0 ${showSummary ? "hidden sm:flex" : "flex"}`}>
//             <div className="flex-1 min-h-0 px-4 sm:px-5 py-4 space-y-4 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
//               <div>
//                 <label className={`block text-xs font-bold uppercase tracking-wide ${txtSub} mb-2`}>Payment Method</label>
//                 <div className="grid grid-cols-3 gap-2">
//                   {PAYMENT_METHODS.map(pm => {
//                     const active = paymentMethod === pm.value;
//                     const disabled = pm.value === 3 && !canPayByPoint;
//                     return (
//                       <button key={pm.value} onClick={() => !disabled && setPaymentMethod(pm.value)} disabled={disabled}
//                         className={`flex flex-col items-center gap-1 px-2 sm:px-3 py-3 rounded-xl border-2 transition-all ${disabled ? (dl ? "border-slate-700 bg-slate-800/30 opacity-40 cursor-not-allowed" : "border-slate-200 bg-slate-50 opacity-40 cursor-not-allowed") : active ? "border-blue-500 bg-blue-500/10 shadow-sm" : (dl ? "border-slate-700 bg-slate-800/60 hover:border-slate-600" : "border-slate-200 bg-slate-50 hover:border-slate-300")}`}>
//                         <span className="text-xl sm:text-2xl leading-none">{pm.icon}</span>
//                         <span className={`text-xs font-semibold ${active ? (dl ? "text-blue-400" : "text-blue-600") : txt}`}>{pm.label}</span>
//                         {pm.value === 3 && (
//                           <span className={`text-[10px] text-center leading-tight ${canPayByPoint ? "text-amber-400" : txtMuted}`}>
//                             {customerPointLoading ? "Loading…" : canPayByPoint ? `${pointsNeeded} pts` : customer ? "Not enough" : "No customer"}
//                           </span>
//                         )}
//                         {active && (<span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center"><svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></span>)}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//               {paymentMethod === 1 && (
//                 <div>
//                   <label className={`block text-xs font-bold uppercase tracking-wide ${txtSub} mb-1.5`}>Cash Given{cashGiven !== "" && !cashIsValid && (<span className="ml-2 normal-case text-red-400 font-semibold text-[11px]">⚠ Need at least ${total.toFixed(2)}</span>)}</label>
//                   <div className="relative mb-2.5">
//                     <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold ${txtMuted}`}>$</span>
//                     <input type="number" min="0" step="0.01" placeholder="0.00" value={cashGiven} onChange={e => setCashGiven(e.target.value)}
//                       className={`${inputCls} pl-7 ${cashGiven !== "" && !cashIsValid ? "border-red-500 focus:border-red-500" : cashGivenNum >= total && cashGivenNum > 0 ? "border-emerald-500 focus:border-emerald-500" : ""}`} />
//                   </div>
//                   <div className="grid grid-cols-3 gap-2">
//                     {[50, 100, 500, 1000, 2000, 5000].map(amount => (
//                       <button key={amount} onClick={() => setCashGiven(String(amount))}
//                         className={`py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 border-2 ${cashGiven === String(amount) ? "border-blue-500 bg-blue-500/15 text-blue-400" : (dl ? "border-slate-600 bg-slate-700 text-slate-200 hover:border-blue-500/50" : "border-slate-200 bg-slate-100 text-slate-700 hover:border-blue-400/50")}`}>
//                         ${amount}
//                       </button>
//                     ))}
//                   </div>
//                   {cashGivenNum >= total && cashGivenNum > 0 && (
//                     <div className={`mt-2.5 flex justify-between items-center px-3 py-2 rounded-xl ${dl ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-emerald-50 border border-emerald-200"}`}>
//                       <span className={`text-sm font-semibold ${dl ? "text-emerald-300" : "text-emerald-700"}`}>Change</span>
//                       <span className={`text-lg font-extrabold ${dl ? "text-emerald-300" : "text-emerald-600"}`}>${change.toFixed(2)}</span>
//                     </div>
//                   )}
//                 </div>
//               )}
//               {paymentMethod === 2 && (
//                 <div className="flex flex-col items-center gap-3">
//                   <label className={`self-start block text-xs font-bold uppercase tracking-wide ${txtSub}`}>Scan to Pay</label>
//                   <div className={`w-full rounded-2xl border-2 ${dl ? "border-slate-600 bg-slate-800/60" : "border-slate-200 bg-slate-50"} flex flex-col items-center py-4 gap-3`}>
//                     <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QR" className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl" style={{ background: "white", padding: "8px" }} />
//                     <p className={`text-xs ${txtMuted}`}>Scan with your banking app to pay</p>
//                   </div>
//                 </div>
//               )}
//               {paymentMethod === 3 && canPayByPoint && (
//                 <div className={`rounded-xl px-4 py-4 border ${dl ? "bg-amber-500/10 border-amber-500/30" : "bg-amber-50 border-amber-200"}`}>
//                   <div className="flex items-center gap-3 mb-3"><span className="text-3xl">⭐</span><div><p className={`text-sm font-bold ${dl ? "text-amber-300" : "text-amber-700"}`}>{customer!.name}</p>
//                     <p className={`text-xs ${dl ? "text-amber-400/70" : "text-amber-600/70"}`}>Available: {customer!.totalPoint} points</p>
//                   </div>
//                   </div>
//                   <div className={`rounded-lg px-3 py-2.5 space-y-1.5 ${dl ? "bg-slate-900/40" : "bg-white/70"}`}>
//                     <div className="flex justify-between text-sm"><span className={txtSub}>Points to deduct</span><span className={`font-bold ${dl ? "text-amber-300" : "text-amber-700"}`}>{pointsNeeded} pts</span></div>
//                     <div className="flex justify-between text-sm"><span className={txtSub}>Discount value</span><span className="font-bold text-emerald-400">${pointDiscount.toFixed(2)}</span></div>
//                     <div className="flex justify-between text-sm"><span className={txtSub}>Remaining points after</span><span className={`font-bold ${dl ? "text-slate-300" : "text-slate-700"}`}>{customer!.totalPoint - pointsNeeded} pts</span></div>
//                     <div className={`pt-2 mt-1 border-t ${dl ? "border-slate-700" : "border-amber-200"} flex justify-between text-sm`}><span className={`font-bold ${txt}`}>Total to pay</span><span className="font-extrabold text-blue-500">${total.toFixed(2)}</span></div>
//                   </div>
//                   <p className={`text-[11px] mt-2 text-center ${dl ? "text-amber-500" : "text-amber-600"}`}>Points will be deducted automatically on confirm</p>
//                 </div>
//               )}
//               <div>
//                 <label className={`block text-xs font-bold uppercase tracking-wide ${txtSub} mb-1.5`}>Additional Discount ($)<span className={`ml-2 normal-case font-normal text-[11px] ${txtMuted}`}>max ${maxDiscount.toFixed(2)}</span></label>
//                 <div className="relative"><span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold ${txtMuted}`}>$</span><input type="number" min="0" step="0.01" placeholder="0.00" max={maxDiscount} value={manualDiscount} onChange={handleDiscountChange} className={`${inputCls} pl-7`} /></div>
//               </div>
//               <div>
//                 <label className={`block text-xs font-bold uppercase tracking-wide ${txtSub} mb-1.5`}>Notes (optional)</label>
//                 <textarea rows={3} placeholder="Add a note for this order…" value={notes} onChange={e => setNotes(e.target.value)} className={`${inputCls} resize-none`} />
//               </div>
//               {orderError && (<div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">⚠️ {orderError}</div>)}
//             </div>
//             <div className={`flex items-center gap-3 px-4 sm:px-5 py-3 border-t ${border} shrink-0`}>
//               <button onClick={onClose} disabled={placing} className={`flex-1 py-2.5 sm:py-3 rounded-xl text-sm font-semibold border ${dl ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>Cancel</button>
//               <button onClick={() => onConfirm(paymentMethod, manualDiscountAmt, notes, pointsUsed, cashGivenNum, total)} disabled={!canConfirm}
//                 className={`flex-[2] py-2.5 sm:py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${!canConfirm ? (dl ? "bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-slate-200 text-slate-400 cursor-not-allowed") : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg active:scale-95"}`}>
//                 {placing ? (<><Spinner size="sm" /><span>Processing…</span></>) : (<><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg><span>Confirm · ${total.toFixed(2)}</span></>)}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Near Discount Hint Banner ───────────────────────────────────────────────
// function NearDiscountHintBanner({ message, dark }: { message: string; dark: boolean }) {
//   return (
//     <div className={`rounded-xl border px-3 py-2.5 flex items-start gap-2.5 ${dark ? "bg-amber-500/8 border-amber-500/25" : "bg-amber-50 border-amber-200"}`}>
//       <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${dark ? "bg-amber-500/20" : "bg-amber-100"}`}>
//         <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M17 17h.01M7 17l10-10M9.5 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5zm5 5a2.5 2.5 0 110 5 2.5 2.5 0 010-5z" /></svg>
//       </div>
//       <p className={`text-xs font-semibold flex-1 ${dark ? "text-amber-200" : "text-amber-800"}`}>{message}</p>
//     </div>
//   );
// }

// // ─── Serial Number Modal ─────────────────────────────────────────────────────
// function SerialNumberModal({ product, dark, existingSerials, existingWarrantyMonths, existingWarrantyStart, onConfirm, onClose }: SerialNumberModalProps) {
//   const initialValue: SerialMultiValue = (existingSerials ?? []).map(s => ({
//     id: s.id, name: s.serialNo, value: null, data: (s.data as any) ?? null,
//   }));
//   const [selected, setSelected] = useState<SerialMultiValue>(initialValue);
//   const [warrantyMonths, setWarrantyMonths] = useState(existingWarrantyMonths ?? 0);
//   const [warrantyStart, setWarrantyStart] = useState(existingWarrantyStart ?? todayISO());
//   const dl = dark;
//   const border = dl ? "border-slate-700" : "border-slate-200";
//   const txt = dl ? "text-slate-100" : "text-slate-900";
//   const txtSub = dl ? "text-slate-400" : "text-slate-500";

//   const handleConfirm = () => {
//     if (selected.length === 0) { alertError("Select at least one serial number"); return; }
//     const mapped: SelectedSerial[] = selected.map(s => ({ id: s.id, serialNo: s.name, data: (s.data as SerialNumberItem | null) ?? null }));
//     onConfirm(product, mapped, warrantyMonths, warrantyStart, addMonths(warrantyStart, warrantyMonths));
//   };

//   return (
//     <div className={`fixed inset-0 z-50 flex items-center justify-center ${dl ? "bg-black/75" : "bg-black/55"} backdrop-blur-sm p-4`} onClick={onClose}>
//       <div className={`${dl ? "bg-[#1e293b]" : "bg-white"} rounded-2xl border ${border} w-full max-w-lg shadow-2xl flex flex-col overflow-hidden`} onClick={e => e.stopPropagation()}>
//         <div className={`px-5 py-3 border-b ${border} flex items-start justify-between gap-3 shrink-0`}>
//           <div className="min-w-0">
//             <h3 className={`font-bold ${txt}`}>Select Serial Numbers</h3>
//             <p className={`text-xs ${txtSub}`}>{product.name} · {selected.length} selected</p>
//             {product.description && (<p className={`text-[11px] mt-1 line-clamp-2 ${txtSub}`}>{product.description}</p>)}
//           </div>
//           <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${dl ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}>✕</button>
//         </div>

//         <div className="px-5 py-4 space-y-4">
//           <div>
//             <label className={`text-xs font-semibold ${txtSub} block mb-1.5`}>Serial Numbers</label>
//             <XSelectSearch
//               multiple
//               value={selected}
//               onChange={setSelected}
//               placeholder="Search and select serial numbers..."
//               loadingMessage="Loading serials..."
//               noOptionsMessage="No available serial numbers"
//               selectOption={{
//                 apiEndpoint: `stock/available?ProductId=${product.id}`,
//                 id: "id",
//                 name: "serialNo",
//                 fetchAll: false,
//               }}
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-2">
//             <div>
//               <label className={`text-xs font-semibold ${txtSub} block mb-1`}>Warranty Start</label>
//               <input type="date" value={warrantyStart} onChange={e => setWarrantyStart(e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${dl ? "bg-slate-800 border-slate-600 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-900"}`} />
//             </div>
//             <div>
//               <label className={`text-xs font-semibold ${txtSub} block mb-1`}>Duration</label>
//               <select value={warrantyMonths} onChange={e => setWarrantyMonths(Number(e.target.value))} className={`w-full px-3 py-2 rounded-lg border text-sm ${dl ? "bg-slate-800 border-slate-600 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-900"}`}>
//                 {WARRANTY_OPTIONS.map(o => <option key={o.months} value={o.months}>{o.label}</option>)}
//               </select>
//             </div>
//           </div>

//           {selected.length > 0 && (
//             <div className={`rounded-xl border ${border} p-3 max-h-40 overflow-y-auto space-y-1.5`}>
//               {selected.map(s => (
//                 <div key={s.id} className="flex items-center justify-between">
//                   <span className={`font-mono text-sm font-semibold ${txt}`}>{s.name}</span>
//                   <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${dl ? "bg-slate-700 text-slate-300" : "bg-slate-200 text-slate-600"}`}>
//                     {(s.data as SerialNumberItem | null)?.status ?? "Available"}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         <div className={`px-5 py-3 border-t ${border} flex justify-end gap-2 shrink-0`}>
//           <button onClick={onClose} className={`px-4 py-2 rounded-xl text-sm font-semibold border ${dl ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>Cancel</button>
//           <button onClick={handleConfirm} disabled={selected.length === 0}
//             className={`px-5 py-2 rounded-xl text-sm font-bold ${selected.length === 0 ? "bg-slate-700 text-slate-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"}`}>
//             Add {selected.length} to Cart
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // API
// const fetchProducts = async (params: { search: string; categoryId: string; page: number }): Promise<ProductsPageResponse> => {
//   const p: any = { Page: params.page, PageSize: 20 };
//   if (params.search) p.Search = params.search;
//   if (params.categoryId !== "0") p.CategoryId = params.categoryId;
//   const res = await AxiosApi.get("Products/Sale-POS", { params: p });
//   return res.data ?? { data: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0, hasPrevious: false, hasNext: false };
// };

// const fetchOrderSummary = async (cart: CartItem[], customerId: number | undefined, paymentMethod: number): Promise<OrderSummaryResponse | null> => {
//   if (cart.length === 0) return null;
//   const payload = {
//     customerId: customerId ?? 0, paymentMethod,
//     items: cart.map(item => ({
//       productId: item.id,
//       quantity: item.qty,
//       serialNumbers: isSerialized(item) && item.serialNumbers?.length ? item.serialNumbers.map(s => s.serialNo) : [],
//       warrantyStartDate: item.warrantyMonths ? toIsoOrNull(item.warrantyStart) : null,
//       warrantyEndDate: item.warrantyMonths ? toIsoOrNull(item.warrantyEnd) : null,
//     })),
//   };
//   const res = await AxiosApi.post("orders/summary", payload);
//   return res.data?.data ?? null;
// };

// const fetchPointSetup = async (): Promise<PointSetupInfo | null> => {
//   try {
//     const res = await AxiosApi.get("PointSetup/lookup");
//     const d = res.data?.data; return d ? { pointsPerRedemption: d.pointsPerRedemption ?? 0, isActive: d.isActive ?? false } : null;
//   } catch { return null; }
// };

// // ✅ NEW: fetches the customer's live totalPoint from its own detail endpoint.
// // The Customer/lookup endpoint (used by the XSelectSearch dropdown) only returns
// // lightweight search results and cannot be trusted for an up-to-date point balance,
// // so we call this separately right after a customer is selected.
// const fetchCustomerDetail = async (id: number): Promise<CustomerInfo | null> => {
//   try {
//     const res = await AxiosApi.get(`Customer/${id}`);
//     const d = res.data?.data ?? res.data;
//     if (!d) return null;
//     return { id: d.id ?? id, name: d.fullName ?? d.name ?? "", totalPoint: d.totalPoint ?? 0 };
//   } catch (e) {
//     console.error(e);
//     return null;
//   }
// };

// // ─── Main Component ──────────────────────────────────────────────────────────
// export default function PosShop() {
//   const { darkLight } = useGlobleContextDarklight();
//   const dark = darkLight;
//   const [selectedCategory, setSelectedCategory] = useState<{ id: number; name: string } | null>(null);
//   const activeCategoryId = selectedCategory ? String(selectedCategory.id) : "0";

//   const [search, setSearch] = useState("");
//   const [debouncedSearch, setDebouncedSearch] = useState("");
//   const [barcodeInput, setBarcodeInput] = useState("");
//   const [scanningBarcode, setScanningBarcode] = useState(false);

//   // Pagination / infinite-scroll state for the product list
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loadingProducts, setLoadingProducts] = useState(false);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [page, setPage] = useState(1);
//   const [hasNext, setHasNext] = useState(false);
//   const productGridRef = useRef<HTMLDivElement>(null);

//   const [cart, setCart] = useState<CartItem[]>([]);
//   const [serialModal, setSerialModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
//   const [paymentModal, setPaymentModal] = useState(false);
//   const [placingOrder, setPlacingOrder] = useState(false);
//   const [orderError, setOrderError] = useState<string | null>(null);
//   const [summaryData, setSummaryData] = useState<OrderSummaryResponse | null>(null);
//   const summaryDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   // Customer + points
//   const [selectedCustomer, setSelectedCustomer] = useState<CustomerInfo | null>(null);
//   const [customerPointLoading, setCustomerPointLoading] = useState(false);
//   const [pointSetup, setPointSetup] = useState<PointSetupInfo | null>(null);

//   const [mobileView, setMobileView] = useState<"products" | "cart">("products");
//   const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
//   const [refreshKey, setRefreshKey] = useState<any>(null);

//   useEffect(() => {
//     fetchPointSetup().then(d => setPointSetup(d));
//   }, []);

//   useEffect(() => { const t = setTimeout(() => setDebouncedSearch(search), 400); return () => clearTimeout(t); }, [search]);

//   // Load page 1 whenever the category/search filters change
//   useEffect(() => {
//     let cancelled = false;
//     const load = async () => {
//       setLoadingProducts(true);
//       setPage(1);
//       try {
//         const res = await fetchProducts({ search: debouncedSearch, categoryId: activeCategoryId, page: 1 });
//         if (!cancelled) {
//           setProducts(res.data);
//           setHasNext(res.hasNext);
//           productGridRef.current?.scrollTo({ top: 0 });
//         }
//       } catch (e) {
//         console.error(e);
//         if (!cancelled) { setProducts([]); setHasNext(false); }
//       } finally {
//         if (!cancelled) setLoadingProducts(false);
//       }
//     };
//     load();
//     return () => { cancelled = true; };
//   }, [activeCategoryId, debouncedSearch, refreshKey]);

//   // ✅ FIXED: auto-fetch the customer's live totalPoint the moment a customer is selected.
//   // Runs on selectedCustomer?.id only (not on the whole object) so it doesn't
//   // re-trigger itself when we patch totalPoint back onto selectedCustomer below.
//   useEffect(() => {
//     if (!selectedCustomer?.id) return;
//     let cancelled = false;
//     setCustomerPointLoading(true);
//     fetchCustomerDetail(selectedCustomer.id)
//       .then(detail => {
//         if (cancelled || !detail) return;
//         setSelectedCustomer(prev => (prev && prev.id === detail.id ? { ...prev, totalPoint: detail.totalPoint } : prev));
//       })
//       .finally(() => { if (!cancelled) setCustomerPointLoading(false); });
//     return () => { cancelled = true; };
//   }, [selectedCustomer?.id]);

//   // Fetch next page and append
//   const loadMoreProducts = useCallback(async () => {
//     if (loadingMore || loadingProducts || !hasNext) return;
//     setLoadingMore(true);
//     try {
//       const nextPage = page + 1;
//       const res = await fetchProducts({ search: debouncedSearch, categoryId: activeCategoryId, page: nextPage });
//       setProducts(prev => [...prev, ...res.data]);
//       setHasNext(res.hasNext);
//       setPage(nextPage);
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setLoadingMore(false);
//     }
//   }, [loadingMore, loadingProducts, hasNext, page, debouncedSearch, activeCategoryId]);

//   const handleProductScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
//     const el = e.currentTarget;
//     if (el.scrollHeight - el.scrollTop - el.clientHeight < 200) {
//       loadMoreProducts();
//     }
//   }, [loadMoreProducts]);

//   // Order summary
//   useEffect(() => {
//     if (summaryDebounceRef.current) clearTimeout(summaryDebounceRef.current);
//     if (cart.length === 0) { setSummaryData(null); return; }
//     summaryDebounceRef.current = setTimeout(async () => {
//       try { const data = await fetchOrderSummary(cart, selectedCustomer?.id, 1); setSummaryData(data); } catch { setSummaryData(null); }
//     }, 500);
//     return () => { if (summaryDebounceRef.current) clearTimeout(summaryDebounceRef.current); };
//   }, [cart, selectedCustomer?.id]);

//   // Opens the serial-select popup if serialized, otherwise adds straight to cart
//   const addToCart = useCallback((product: Product) => {
//     if (isSerialized(product)) { setSerialModal({ open: true, product }); return; }
//     setCart(prev => {
//       const ex = prev.find(i => i.id === product.id);
//       if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
//       return [...prev, { ...product, qty: 1 }];
//     });
//   }, []);

//   const handleSerialConfirm = useCallback((product: Product, serials: SelectedSerial[], wm: number, ws: string, we: string) => {
//     setCart(prev => {
//       const ex = prev.find(i => i.id === product.id);
//       if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: serials.length, serialNumbers: serials, warrantyMonths: wm, warrantyStart: ws, warrantyEnd: we } : i);
//       return [...prev, { ...product, qty: serials.length, serialNumbers: serials, warrantyMonths: wm, warrantyStart: ws, warrantyEnd: we }];
//     });
//     setSerialModal({ open: false, product: null });
//   }, []);

//   const incrementQty = useCallback((item: CartItem) => {
//     if (isSerialized(item)) {
//       setSerialModal({ open: true, product: item });
//       return;
//     }
//     setCart(prev => prev.map(i => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i)));
//   }, []);

//   const decrementQty = useCallback((id: number) => {
//     setCart(prev => prev.map(i => {
//       if (i.id !== id) return i;
//       if (isSerialized(i) && i.serialNumbers && i.serialNumbers.length > 0) {
//         const newSerials = i.serialNumbers.slice(0, -1); // remove the last-added serial
//         return { ...i, qty: newSerials.length, serialNumbers: newSerials };
//       }
//       return { ...i, qty: Math.max(0, i.qty - 1) };
//     }).filter(i => i.qty > 0));
//   }, []);

//   const removeFromCart = useCallback((id: number) => {
//     setCart(prev => prev.filter(i => i.id !== id));
//   }, []);

//   const handleBarcodeKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key !== "Enter") return;
//     const code = barcodeInput.trim();
//     if (!code) return;
//     setScanningBarcode(true);
//     try {
//       const res = await fetchProducts({ search: code, categoryId: "0", page: 1 });
//       const exact = res.data.find(p => p.code?.toLowerCase() === code.toLowerCase()) ?? res.data[0];
//       if (exact) {
//         addToCart(exact);
//         alertify.success(`Added: ${exact.name}`);
//       } else {
//         alertError(`No product found for barcode "${code}"`);
//       }
//     } catch (err) {
//       console.error(err);
//       alertError("Failed to lookup barcode");
//     } finally {
//       setScanningBarcode(false);
//       setBarcodeInput("");
//     }
//   };

//   const subtotal = cart.reduce((s, i) => s + i.salePrice * i.qty, 0);
//   const totalTax = cart.reduce((s, i) => s + (i.taxAmount ?? 0) * i.qty, 0);
//   const autoDiscount = summaryData?.discountAmount ?? 0;
//   const totalAmount = summaryData?.totalAmount ?? (subtotal + totalTax);
//   const totalQty = cart.reduce((s, i) => s + i.qty, 0);

//   const handleConfirmPayment = async (paymentMethod: number, discount: number, notes: string, cashGiven: number, finalTotal: number) => {
//     setPlacingOrder(true); setOrderError(null);
//     try {
//       const payload: PlaceOrderPayload = {
//         customerId: selectedCustomer?.id, paymentMethod, note: notes,
//         items: cart.map(item => ({
//           productId: item.id, quantity: item.qty,
//           serialNumbers: isSerialized(item) && item.serialNumbers?.length ? item.serialNumbers.map(s => s.serialNo) : [],
//           warrantyStartDate: item.warrantyMonths ? toIsoOrNull(item.warrantyStart) : null,
//           warrantyEndDate: item.warrantyMonths ? toIsoOrNull(item.warrantyEnd) : null,
//         })),
//       };
//       const res = await AxiosApi.post("orders", payload);
//       const trans = res.data?.data;
//       setReceiptData({
//         transId: trans?.orderNo ?? trans?.id?.toString() ?? "#000",
//         customerName: selectedCustomer?.name ?? "Walk-in",
//         items: cart, subtotal, totalTax, totalAmount: finalTotal,
//         paymentMethod, cashGiven: paymentMethod === 1 ? cashGiven : undefined,
//         change: paymentMethod === 1 ? Math.max(0, cashGiven - finalTotal) : undefined,
//         discount: discount > 0 ? discount : undefined,
//       });
//       setPaymentModal(false);
//       setCart([]);
//       setSelectedCustomer(null);
//       setRefreshKey(new Date());
//       alertify.success("Order placed successfully!");
//     } catch (err: any) {
//       setOrderError(err?.response?.data?.message || err?.response?.data?.errors?.[0] || "Failed to place order");
//     } finally { setPlacingOrder(false); }
//   };

//   const handleNewSale = () => { setReceiptData(null); };

//   // ─── Styles ────────────────────────────────────────────────────────────────
//   const dl = dark;
//   const border = dl ? "border-slate-700" : "border-slate-200";
//   const txt = dl ? "text-slate-100" : "text-slate-900";
//   const txtSub = dl ? "text-slate-400" : "text-slate-500";
//   const txtMuted = dl ? "text-slate-500" : "text-slate-400";
//   const bgMain = dl ? "bg-[#0f172a]" : "bg-slate-100";
//   const bgCard = dl ? "bg-[#1e293b]" : "bg-white";
//   const imgFallback = dl ? PLACEHOLDER_DARK : PLACEHOLDER_LIGHT;

//   // ─── Render helpers ────────────────────────────────────────────────────────
//   const renderProduct = (product: Product) => {
//     const cartItem = cart.find(i => i.id === product.id);
//     const inCart = !!cartItem;
//     const productBg = dl ? "bg-slate-800/60 hover:bg-slate-800" : "bg-white hover:bg-slate-50";
//     const borderColor = inCart ? "border-blue-500" : (dl ? "border-slate-700" : "border-slate-200");

//     return (
//       <button key={product.id} onClick={() => addToCart(product)}
//         className={`relative flex gap-3 p-3 rounded-xl border-2 transition-all text-left w-full group ${productBg} ${borderColor} ${!product.inStock ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
//         disabled={!product.inStock}>
//         {inCart && (<div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg z-10">{cartItem.qty}</div>)}
//         <img src={product.imageUrl || imgFallback} alt={product.name} className="w-14 h-14 rounded-lg object-contain shrink-0 bg-slate-200" />
//         <div className="flex-1 min-w-0">
//           <p className={`text-sm font-semibold truncate ${txt}`}>{product.name}</p>
//           <p className={`text-[11px] font-mono truncate ${txtMuted}`}>{product.code || "—"}</p>
//           {product.categoryName && (<p className={`text-[10px] truncate mt-0.5 ${dl ? "text-indigo-400" : "text-indigo-500"}`}>{product.categoryName}</p>)}
//           {product.description && (<p className={`text-[10px] mt-1 line-clamp-2 ${txtMuted}`}>{product.description}</p>)}
//           <div className="flex items-center justify-between mt-1.5">
//             <span className="text-sm font-bold text-emerald-400">${product.salePrice.toFixed(2)}</span>
//             <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${product.stockQuantity === 0 ? "bg-red-500/15 text-red-400" : product.stockQuantity <= 5 ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"}`}>
//               {product.stockQuantity} {product.unit || "pcs"}
//             </span>
//           </div>
//         </div>
//       </button>
//     );
//   };

//   const renderCartItem = (item: CartItem) => {
//     const rowBg = dl ? "bg-slate-800/40" : "bg-slate-50";
//     return (
//       <div key={item.id} className={`rounded-xl p-3 border ${border} ${rowBg}`}>
//         <div className="flex items-start gap-3">
//           <img src={item.imageUrl || imgFallback} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0 bg-slate-200" />
//           <div className="flex-1 min-w-0">
//             <div className="flex items-start justify-between gap-2">
//               <div className="min-w-0">
//                 <p className={`text-sm font-semibold truncate ${txt}`}>{item.name}</p>
//                 <p className={`text-[11px] ${txtMuted}`}>${item.salePrice.toFixed(2)} × {item.qty}</p>
//                 {isSerialized(item) && item.serialNumbers && item.serialNumbers.length > 0 && (
//                   <p className={`text-[9px] font-mono ${txtMuted} truncate mt-0.5`}>S/N: {item.serialNumbers.map(s => s.serialNo).join(", ")}</p>
//                 )}
//               </div>
//               <button onClick={() => removeFromCart(item.id)} className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs ${dl ? "hover:bg-red-500/20 text-slate-500 hover:text-red-400" : "hover:bg-red-50 text-slate-400 hover:text-red-500"}`}>✕</button>
//             </div>
//             <div className="flex items-center justify-between mt-2">
//               <div className="flex items-center gap-1">
//                 <button onClick={() => decrementQty(item.id)} className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold border ${dl ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "border-slate-200 text-slate-600 hover:bg-slate-100"}`}>−</button>
//                 <span className={`w-8 text-center text-sm font-bold ${txt}`}>{item.qty}</span>
//                 <button onClick={() => incrementQty(item)} className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold border ${dl ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "border-slate-200 text-slate-600 hover:bg-slate-100"}`}>+</button>
//               </div>
//               <span className="text-sm font-bold text-sky-400">${(item.salePrice * item.qty).toFixed(2)}</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // ─── JSX ───────────────────────────────────────────────────────────────────
//   return (
//     <div className={`flex h-[calc(100vh-97px)] min-h-0 ${bgMain} overflow-hidden`}>
//       {/* ── Left: Products ── */}
//       <div className={`flex-1 flex flex-col min-w-0 min-h-0 ${mobileView === "cart" ? "hidden lg:flex" : "flex"}`}>

//         {/* Header row: 1) Category  2) Item search  3) Barcode scan */}
//         <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 px-4 py-1 border-b ${border} shrink-0`}>
//           {/* Category */}
//           <div>
//             <XSelectSearch
//               value={selectedCategory ? { id: selectedCategory.id, name: selectedCategory.name, value: selectedCategory.id, data: null } : null}
//               onChange={(val) => setSelectedCategory(val ? { id: val.id as number, name: val.name } : null)}
//               placeholder="All Categories"
//               noOptionsMessage="No categories found"
//               selectOption={{ apiEndpoint: "Category/lookup", id: "id", name: "name", fetchAll: false }}
//             />
//           </div>

//           {/* Item search */}
//           <div className="relative">
//             <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${txtMuted} pointer-events-none`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//             <input
//               type="text" placeholder="Search product..." value={search} onChange={e => setSearch(e.target.value)}
//               className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${dl ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-blue-500" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-400"}`}
//             />
//           </div>

//           {/* Barcode scan */}
//           <div className="relative">
//             <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${txtMuted} pointer-events-none`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7V5a2 2 0 012-2h2M3 17v2a2 2 0 002 2h2m10-16h2a2 2 0 012 2v2m-2 14h2a2 2 0 002-2v-2M7 12h.01M11 12h.01M15 12h.01M17 12h.01" />
//             </svg>
//             <input
//               type="text" placeholder="Scan barcode..." value={barcodeInput}
//               onChange={e => setBarcodeInput(e.target.value)} onKeyDown={handleBarcodeKeyDown}
//               className={`w-full pl-10 pr-9 py-2.5 rounded-xl border text-sm outline-none transition-all ${dl ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-emerald-500" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-400"}`}
//             />
//             {scanningBarcode && (<span className="absolute right-3 top-1/2 -translate-y-1/2"><Spinner size="sm" /></span>)}
//           </div>
//         </div>

//         {/* Product Grid — only this panel scrolls; onScroll drives infinite loading */}
//         <div
//           ref={productGridRef}
//           onScroll={handleProductScroll}
//           className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 pt-2 space-y-2"
//           style={{ scrollbarWidth: "thin" }}
//         >
//           {loadingProducts && (<div className="flex items-center justify-center py-12"><Spinner /></div>)}
//           {!loadingProducts && products.length === 0 && (<div className="flex flex-col items-center justify-center py-12 text-center"><span className="text-4xl mb-3">📦</span><p className={`text-sm ${txtSub}`}>No products found</p></div>)}
//           {!loadingProducts && products.map(renderProduct)}
//           {loadingMore && (<div className="flex items-center justify-center py-4"><Spinner size="sm" /></div>)}
//           {!loadingProducts && !loadingMore && !hasNext && products.length > 0 && (
//             <p className={`text-center text-[11px] py-2 ${txtMuted}`}>No more products</p>
//           )}
//         </div>

//         {/* Mobile cart toggle */}
//         <div className={`lg:hidden flex items-center justify-center py-2 border-t ${border} shrink-0 ${bgCard}`}>
//           <button onClick={() => setMobileView("cart")} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-500 text-white font-bold text-sm shadow-lg active:scale-95">
//             🛒 Cart ({totalQty}) · ${totalAmount.toFixed(2)}
//           </button>
//         </div>
//       </div>

//       {/* ── Right: Cart ── */}
//       <div className={`w-full lg:w-[380px] xl:w-[420px] flex flex-col min-h-0 border-l ${border} ${bgCard} ${mobileView === "products" ? "hidden lg:flex" : "flex"}`}>
//         {/* Cart Header */}
//         <div className={`px-4 py-3 border-b ${border} flex items-center justify-between shrink-0`}>
//           <div className="flex items-center gap-2">
//             <button onClick={() => setMobileView("products")} className={`lg:hidden w-8 h-8 rounded-lg flex items-center justify-center ${dl ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}>←</button>
//             <h2 className={`font-bold ${txt}`}>Cart</h2>
//             <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${totalQty > 0 ? "bg-blue-500/15 text-blue-400" : (dl ? "bg-slate-700 text-slate-500" : "bg-slate-200 text-slate-400")}`}>{totalQty} items</span>
//           </div>
//           {cart.length > 0 && (<button onClick={() => setCart([])} className={`text-xs font-semibold ${dl ? "text-red-400 hover:text-red-300" : "text-red-500 hover:text-red-600"}`}>Clear</button>)}
//         </div>

//         {/* Customer */}
//         <div className={`px-4 py-1 border-b ${border} shrink-0`}>
//           <XSelectSearch
//             value={selectedCustomer ? { id: selectedCustomer.id, name: selectedCustomer.name, value: selectedCustomer.id, data: null } : null}
//             onChange={(val) => {
//               setSelectedCustomer(val ? { id: val.id as number, name: val.name, totalPoint: 0 } : null);
//             }}
//             placeholder="Select customer (optional)..."
//             selectOption={{ apiEndpoint: "Customer/lookup", id: "id", name: "fullName", fetchAll: false }}
//           />
//         </div>

//         {/* Warnings */}
//         {summaryData?.warnings && summaryData.warnings.length > 0 && (
//           <div className="px-4 py-2 space-y-1.5 shrink-0">
//             {summaryData.warnings.map((w, i) => <NearDiscountHintBanner key={i} message={w} dark={dl} />)}
//           </div>
//         )}

//         {/* Cart Items */}
//         <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2" style={{ scrollbarWidth: "thin" }}>
//           {cart.length === 0 && (<div className="flex flex-col items-center justify-center py-12 text-center"><span className="text-4xl mb-3">🛒</span><p className={`text-sm ${txtSub}`}>Cart is empty</p></div>)}
//           {cart.map(renderCartItem)}
//         </div>

//         {/* Cart Footer */}
//         <div className={`border-t ${border} px-4 py-1 space-y-3 shrink-0`}>
//           <div className="space-y-1.5 text-sm">
//             <div className="flex justify-between"><span className={txtSub}>Subtotal</span><span className={dl ? "text-slate-300" : "text-slate-700"}>${subtotal.toFixed(2)}</span></div>
//             <div className="flex justify-between text-emerald-400"><span>Discount</span><span>-${autoDiscount.toFixed(2)}</span></div>
//             <div className={`flex justify-between items-center pt-2 border-t border-dashed ${dl ? "border-slate-600" : "border-slate-300"}`}>
//               <span className={`font-bold ${txt}`}>Total</span>
//               <span className="font-extrabold text-xl text-blue-500">${totalAmount.toFixed(2)}</span>
//             </div>
//           </div>
//           <button onClick={() => setPaymentModal(true)} disabled={cart.length === 0}
//             className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${cart.length === 0 ? (dl ? "bg-slate-800 text-slate-600 cursor-not-allowed" : "bg-slate-200 text-slate-400 cursor-not-allowed") : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl active:scale-[0.98]"}`}>
//             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
//             Pay · ${totalAmount.toFixed(2)}
//           </button>
//         </div>
//       </div>

//       {/* ── Modals ── */}
//       {serialModal.open && serialModal.product && (
//         <SerialNumberModal product={serialModal.product} dark={dl}
//           existingSerials={cart.find(i => i.id === serialModal.product!.id)?.serialNumbers}
//           existingWarrantyMonths={cart.find(i => i.id === serialModal.product!.id)?.warrantyMonths}
//           existingWarrantyStart={cart.find(i => i.id === serialModal.product!.id)?.warrantyStart}
//           onConfirm={handleSerialConfirm} onClose={() => setSerialModal({ open: false, product: null })} />
//       )}

//       {paymentModal && (
//         <PaymentModal dark={dl} cart={cart} subtotal={subtotal} totalTax={totalTax} autoDiscount={autoDiscount}
//           customer={selectedCustomer} customerPointLoading={customerPointLoading} pointSetup={pointSetup}
//           onConfirm={handleConfirmPayment}
//           onClose={() => { setPaymentModal(false); setOrderError(null); }} placing={placingOrder} orderError={orderError} />
//       )}

//       {receiptData && <ReceiptModal data={receiptData} onClose={handleNewSale} />}
//     </div>
//   );
// }




import { useState, useEffect, useCallback, useRef } from "react";
import { useGlobleContextDarklight } from "../../AllContext/context";
import { AxiosApi } from "../../component/Axios/Axios";
import { alertError } from "../../HtmlHelper/Alert";
import alertify from "alertifyjs";
import XSelectSearch, { MultiValue as SerialMultiValue } from "../../component/XSelectSearch/Xselectsearch";

interface Product {
  id: number;
  code: string;
  name: string;
  imageUrl: string;
  unit: string;
  salePrice: number;
  stockQuantity: number;
  inStock: boolean;
  categoryId: number | null;
  categoryName: string | null;
  productType?: string;
  description?: string;
  taxRate?: number;
  taxAmount?: number;
}

interface ProductsPageResponse {
  data: Product[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// ✅ NEW: shape returned by GET /api/products/Scan (ProductScanInfo)
interface ProductScanInfo {
  productId: number;
  productCode: string | null;
  productName: string;
  imageUrl: string | null;
  productType: string;
  unit: string | null;
  salePrice: number;
  stockQuantity: number;
  isSerial: boolean;
  scannedSerialNumber: string | null;
  categoryId: number | null;
  categoryName: string | null;
}

interface SerialNumberItem { id: number; productId: number; serialNo: string; status: string; }
interface SelectedSerial { id: number | string; serialNo: string; data?: SerialNumberItem | null; }
interface CartItem extends Product {
  qty: number;
  serialNumbers?: SelectedSerial[];
  warrantyMonths?: number;
  warrantyStart?: string;
  warrantyEnd?: string;
}

interface OrderSummaryItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string | null;
  discountAmount: number;
  discountName?: string | null;
  globalDiscountAmount: number;
  globalDiscountName?: string | null;
  lineTotal: number;
  serialNumbers?: string[];
}
interface OrderSummaryResponse {
  customerId: number | null;
  customerName: string;
  customerAvailablePoint: number | null;
  paymentMethod: string;
  subTotal: number;
  discountAmount: number;
  totalAmount: number;
  pointEarned: number;
  warnings: string[];
  items: OrderSummaryItem[];
}

interface CustomerInfo { id: number; name: string; totalPoint: number; }
interface PointSetupInfo { pointsPerRedemption: number; isActive: boolean; }

interface PlaceOrderItemPayload {
  productId: number;
  quantity: number;
  serialNumbers?: string[];
  warrantyStartDate?: string | null; // ✅ NEW: ISO datetime, only set when item has a warranty
  warrantyEndDate?: string | null;   // ✅ NEW
}
interface PlaceOrderPayload {
  customerId?: number;
  paymentMethod: number;
  note?: string;
  items: PlaceOrderItemPayload[];
}

interface SerialNumberModalProps {
  product: Product; dark: boolean;
  existingSerials?: SelectedSerial[];
  existingWarrantyMonths?: number; existingWarrantyStart?: string;
  onConfirm: (p: Product, s: SelectedSerial[], wm: number, ws: string, we: string) => void;
  onClose: () => void;
}
interface CartRowProps {
  item: CartItem; onInc: () => void; onDec: () => void; onRemove: () => void;
  dark: boolean; rowBg: string; textPrimary: string; textMuted: string;
}
interface ProductRowProps {
  product: Product; cartItem: CartItem | undefined; onAdd: (p: Product) => void;
  dark: boolean; productBg: string; borderColor: string;
  textPrimary: string; textSub: string; textMuted: string; imgFallback: string;
}

interface ReceiptData {
  transId: string;
  customerName: string;
  items: CartItem[];
  subtotal: number;
  totalTax: number;
  totalAmount: number;
  paymentMethod: number;
  cashGiven?: number;
  change?: number;
  discount?: number;
}

const PAYMENT_METHODS = [
  { value: 1, label: "Cash", icon: "💵" },
  { value: 2, label: "Bank QR", icon: "📲" },
  { value: 3, label: "Point", icon: "⭐" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isSerialized = (p: Product) => p.productType === "Serialized";
const PLACEHOLDER_LIGHT = "https://placehold.co/300x300/e2e8f0/94a3b8?text=No+Image";
const PLACEHOLDER_DARK = "https://placehold.co/300x300/1e293b/475569?text=No+Image";
const WARRANTY_OPTIONS = [
  { label: "None", months: 0 }, { label: "1 mo", months: 1 },
  { label: "3 mo", months: 3 }, { label: "6 mo", months: 6 },
  { label: "1 yr", months: 12 }, { label: "2 yr", months: 24 },
];
const todayISO = () => new Date().toISOString().split("T")[0];
const addMonths = (dateStr: string, months: number) => {
  if (!months || !dateStr) return "";
  const d = new Date(dateStr); d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
};
const formatDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";
// ✅ NEW: backend expects full ISO datetimes for warrantyStartDate/warrantyEndDate
// (e.g. "2026-06-28T12:57:39.516Z"), not the plain "YYYY-MM-DD" we keep in cart state.
const toIsoOrNull = (dateStr?: string): string | null => (dateStr ? new Date(dateStr).toISOString() : null);

function Spinner({ size = "md" }: { size?: "sm" | "md" }) {
  const s = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  return (
    <svg className={`animate-spin ${s}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

// ─── Realistic SVG Barcode Generator ──────────────────────────────────────────
function BarcodeSVG({ value, height = 50 }: { value: string; height?: number }) {
  const rects: React.ReactNode[] = [];
  let x = 0;
  const addBar = (w: number) => { rects.push(<rect key={x} x={x} y={0} width={w} height={height} fill="#000" />); x += w; };
  const addSpace = (w: number) => { x += w; };
  addBar(2); addSpace(1); addBar(1); addSpace(1); addBar(1); addSpace(1);
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i);
    addBar((c % 3) + 1); addSpace(1); addBar(((c >> 1) % 2) + 1); addSpace(1); addBar(((c >> 2) % 3) + 1); addSpace(2);
  }
  addBar(2); addSpace(1); addBar(1); addSpace(1); addBar(2);
  return (<svg viewBox={`0 0 ${x} ${height}`} width="100%" height={height} preserveAspectRatio="none" style={{ display: 'block' }}>{rects}</svg>);
}

// ─── Receipt Modal ────────────────────────────────────────────────────────────
function ReceiptModal({ data, onClose }: { data: ReceiptData; onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);
  const thermalCSS = `
    @page { size: 80mm auto; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Courier New', Courier, monospace; width: 80mm; padding: 4mm 3mm; font-size: 11px; line-height: 1.5; color: #000; }
    .center { text-align: center; } .right { text-align: right; } .bold { font-weight: 700; }
    .title { font-size: 18px; font-weight: 900; letter-spacing: 3px; }
    .subtitle { font-size: 8px; letter-spacing: 1.5px; }
    .divider { border-top: 1px dashed #000; margin: 5px 0; }
    .divider-double { border-top: 2px solid #000; margin: 5px 0; }
    table { width: 100%; border-collapse: collapse; }
    th { font-size: 10px; text-align: left; padding: 2px 0; border-bottom: 1px solid #000; }
    th.right { text-align: right; } th.qty { text-align: center; width: 24px; }
    td { font-size: 11px; padding: 2px 0; vertical-align: top; }
    td.right { text-align: right; } td.qty { text-align: center; }
    .serial { font-size: 8px; color: #555; }
    .total-label { font-size: 15px; font-weight: 900; } .total-value { font-size: 15px; font-weight: 900; text-align: right; }
    .paid { display: inline-block; border: 2px solid #000; padding: 1px 8px; font-weight: 900; font-size: 13px; letter-spacing: 3px; }
    .footer { font-size: 9px; } .trans-id { font-size: 8px; margin-top: 2px; }
  `;
  const handlePrint = () => {
    const el = printRef.current; if (!el) return;
    const win = window.open("", "_blank", "width=320,height=600"); if (!win) return;
    win.document.write(`<html><head><title>Receipt ${data.transId}</title><style>${thermalCSS}</style></head><body>${el.innerHTML}</body></html>`);
    win.document.close(); win.focus(); setTimeout(() => { win.print(); win.close(); }, 300);
  };
  const methodLabel = data.paymentMethod === 1 ? "Cash" : data.paymentMethod === 2 ? "Bank QR" : "Points";
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const barcodeValue = data.transId.replace("#", "");

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm mt-15">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[420px] flex flex-col overflow-hidden" style={{ maxHeight: "87vh" }}>
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          <div className="px-8 pt-7 pb-2 text-black">
            <div className="flex flex-col items-center mb-3">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" /></svg>
                </div>
                <div>
                  <p className="font-black text-blue-900 text-base leading-tight">SOKHA SK</p>
                  <p className="text-[10px] text-slate-400 leading-tight tracking-wider">SECURITY & TECH SOLUTIONS</p>
                </div>
              </div>
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-2 shadow-md shadow-emerald-200">
                <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-lg font-black text-emerald-600 tracking-tight">Transaction Successful!</h2>
            </div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Date: <b className="text-slate-700">{dateStr}</b></span>
              <span>Time: <b className="text-slate-700">{timeStr}</b></span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 mb-4">
              <span>Trans: <b className="text-slate-700">{data.transId}</b></span>
              <span>Customer: <b className="text-slate-700">{data.customerName}</b></span>
            </div>
            <div className="border-t border-dashed border-slate-300 mb-4" />
            <table className="w-full text-xs mb-4">
              <thead><tr className="border-b border-slate-300">
                <th className="text-left py-2 font-bold text-slate-600 pr-3">Item</th>
                <th className="text-center py-2 font-bold text-slate-600 w-10">Qty</th>
                <th className="text-right py-2 font-bold text-slate-600 w-20">Price</th>
                <th className="text-right py-2 font-bold text-slate-600 w-20">Total</th>
              </tr></thead>
              <tbody>
                {data.items.map(item => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-2 text-slate-700 font-medium pr-3">
                      <p className="truncate max-w-[160px]">{item.name}</p>
                      {isSerialized(item) && item.serialNumbers && item.serialNumbers.length > 0 && (
                        <p className="text-[9px] font-mono text-slate-400 truncate mt-0.5">S/N: {item.serialNumbers.map(s => s.serialNo).join(", ")}</p>
                      )}
                    </td>
                    <td className="py-2 text-center text-slate-600">{item.qty}</td>
                    <td className="py-2 text-right text-slate-600">${Number(item.salePrice).toFixed(2)}</td>
                    <td className="py-2 text-right font-semibold text-slate-700">${(item.salePrice * item.qty).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-dashed border-slate-300 mb-4" />
            <div className="space-y-1.5 text-xs mb-4">
              <div className="flex justify-between text-slate-500"><span>Sub-total</span><span className="text-slate-700">${data.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-slate-500"><span>Tax ({data.items[0]?.taxRate ?? 0}%)</span><span className="text-slate-700">${data.totalTax.toFixed(2)}</span></div>
              {(data.discount ?? 0) > 0 && (<div className="flex justify-between text-emerald-600 font-semibold"><span>Discount</span><span>-${data.discount!.toFixed(2)}</span></div>)}
              <div className="flex justify-between font-black text-base pt-3 border-t-2 border-slate-800 mt-2">
                <span className="text-slate-900">TOTAL</span><span className="text-blue-600">${data.totalAmount.toFixed(2)}</span>
              </div>
            </div>
            <div className="border-t border-dashed border-slate-300 mb-4" />
            <div className="text-xs space-y-1.5 mb-4">
              <div className="flex justify-between text-slate-600"><span>Payment Method</span><span className="font-semibold">{methodLabel}</span></div>
              {data.paymentMethod === 1 && data.cashGiven != null && (<>
                <div className="flex justify-between text-slate-600"><span>Cash Given</span><span className="font-semibold">${data.cashGiven.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-emerald-600"><span>Change</span><span>${(data.change ?? 0).toFixed(2)}</span></div>
              </>)}
              {data.paymentMethod === 3 && (<div className="flex justify-between text-amber-600 font-semibold"><span>Points Redeemed</span><span>✓ Applied</span></div>)}
            </div>
            <div className="border-t-2 border-slate-800 mb-5" />
            <div className="flex justify-center mb-5">
              <span className="inline-block border-[3px] border-emerald-500 text-emerald-600 font-black text-sm tracking-[5px] px-4 py-1 rotate-[-6deg]">PAID</span>
            </div>
            <div className="w-full max-w-[240px] mx-auto mb-3">
              <BarcodeSVG value={barcodeValue} height={44} />
              <p className="text-center text-[10px] text-slate-500 mt-1.5 font-mono tracking-widest">{data.transId}</p>
            </div>
            <div className="text-center text-[11px] text-slate-400 space-y-0.5 mt-3">
              <p className="font-semibold text-slate-500">THANK YOU FOR YOUR PURCHASE!</p>
              <p>www.sokhask.com</p>
            </div>
          </div>
        </div>
        <div ref={printRef} style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <div className="center" style={{ marginBottom: "2px" }}><div className="title">SOKHA SK</div><div className="subtitle">SECURITY & TECH SOLUTIONS</div><div style={{ fontSize: "9px" }}>www.sokhask.com</div></div>
          <div className="divider-double" />
          <table><tbody><tr><td>Date: {dateStr}</td><td className="right">Time: {timeStr}</td></tr><tr><td>Trans: {data.transId}</td><td className="right">Customer: {data.customerName}</td></tr></tbody></table>
          <div className="divider" />
          <table><thead><tr><th>Item</th><th className="qty">Qty</th><th className="right">Price</th><th className="right">Total</th></tr></thead><tbody>
            {data.items.map(item => (<tr key={item.id}><td>{item.name}{isSerialized(item) && item.serialNumbers && item.serialNumbers.length > 0 && (<div className="serial">S/N: {item.serialNumbers.map(s => s.serialNo).join(", ")}</div>)}</td><td className="qty">{item.qty}</td><td className="right">${Number(item.salePrice).toFixed(2)}</td><td className="right bold">${(item.salePrice * item.qty).toFixed(2)}</td></tr>))}
          </tbody></table>
          <div className="divider" />
          <table><tbody><tr><td>Sub-total</td><td className="right">${data.subtotal.toFixed(2)}</td></tr><tr><td>Tax ({data.items[0]?.taxRate ?? 0}%)</td><td className="right">${data.totalTax.toFixed(2)}</td></tr>{(data.discount ?? 0) > 0 && (<tr><td>Discount</td><td className="right">-${data.discount!.toFixed(2)}</td></tr>)}</tbody></table>
          <div className="divider-double" /><table><tbody><tr><td className="total-label">TOTAL</td><td className="total-value">${data.totalAmount.toFixed(2)}</td></tr></tbody></table>
          <div className="divider" />
          <table><tbody><tr><td>Payment Method</td><td className="right bold">{methodLabel.toUpperCase()}</td></tr>{data.paymentMethod === 1 && data.cashGiven != null && (<><tr><td>Cash Given</td><td className="right">${data.cashGiven.toFixed(2)}</td></tr><tr><td className="bold">Change</td><td className="right bold">${(data.change ?? 0).toFixed(2)}</td></tr></>)}{data.paymentMethod === 3 && (<tr><td>Points Redeemed</td><td className="right">Applied</td></tr>)}</tbody></table>
          <div className="divider" /><div className="center" style={{ padding: "3px 0" }}><span className="paid">PAID</span></div>
          <div style={{ width: '100%', marginTop: '4px' }}><BarcodeSVG value={barcodeValue} height={50} /><div className="center trans-id">{data.transId}</div></div>
          <div className="divider" /><div className="center footer"><div className="bold">THANK YOU FOR YOUR PURCHASE!</div><div>Please come again</div></div><div className="divider-double" />
        </div>
        <div className="px-6 py-1 pb-2 space-y-1 border-t border-slate-100 shrink-0 bg-white">
          <button onClick={handlePrint} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all active:scale-95 shadow-md">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print Receipt
          </button>
          <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-black bg-emerald-500 text-white hover:bg-emerald-600 transition-all active:scale-95 shadow-md">🛒 New Sale</button>
        </div>
      </div>
    </div>
  );
}

// ─── Payment Modal ────────────────────────────────────────────────────────────
interface PaymentModalProps {
  dark: boolean; cart: CartItem[]; subtotal: number; totalTax: number; autoDiscount: number;
  customer: CustomerInfo | null; customerPointLoading: boolean; pointSetup: PointSetupInfo | null;
  onConfirm: (paymentMethod: number, discount: number, notes: string, pointsUsed: number, cashGiven: number, finalTotal: number) => void;
  onClose: () => void; placing: boolean; orderError: string | null;
}

function PaymentModal({ dark, cart, subtotal, totalTax, autoDiscount, customer, customerPointLoading, pointSetup, onConfirm, onClose, placing, orderError }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<number>(1);
  const [manualDiscount, setManualDiscount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [cashGiven, setCashGiven] = useState<string>("");
  const [showSummary, setShowSummary] = useState(false);

  const maxDiscount = subtotal + totalTax;
  const manualDiscountAmt = Math.min(parseFloat(manualDiscount) || 0, maxDiscount);
  const totalDiscountAmt = Math.min(autoDiscount + manualDiscountAmt, maxDiscount);
  const baseTotal = subtotal + totalTax - totalDiscountAmt;
  const redemptionRate = pointSetup?.pointsPerRedemption ?? 0;
  const pointsNeeded = redemptionRate > 0 ? Math.ceil(baseTotal * redemptionRate) : 0;
  const customerPoints = customer?.totalPoint ?? 0;
  const canPayByPoint = customer != null && !customerPointLoading && redemptionRate > 0 && customerPoints >= pointsNeeded && pointsNeeded > 0;
  const pointsUsed = paymentMethod === 3 ? pointsNeeded : 0;
  const pointDiscount = paymentMethod === 3 && redemptionRate > 0 ? pointsUsed / redemptionRate : 0;
  const total = Math.max(0, baseTotal - pointDiscount);
  const cashGivenNum = parseFloat(cashGiven) || 0;
  const change = paymentMethod === 1 ? Math.max(0, cashGivenNum - total) : 0;
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  const cashIsValid = paymentMethod !== 1 || cashGivenNum >= total;
  const canConfirm = !placing && cashIsValid;

  useEffect(() => { if (paymentMethod === 3 && !canPayByPoint) setPaymentMethod(1); }, [canPayByPoint, paymentMethod]);

  const dl = dark;
  const border = dl ? "border-slate-700" : "border-slate-200";
  const txt = dl ? "text-slate-100" : "text-slate-900";
  const txtSub = dl ? "text-slate-400" : "text-slate-500";
  const txtMuted = dl ? "text-slate-500" : "text-slate-400";
  const modal = dl ? "bg-[#1e293b]" : "bg-white";
  const overlay = dl ? "bg-black/75" : "bg-black/55";
  const sectionBg = dl ? "bg-slate-800/60" : "bg-slate-50";
  const divider = dl ? "border-slate-700" : "border-slate-200";
  const inputCls = `w-full px-3 py-2 rounded-xl border text-sm outline-none transition-colors ${dl ? "bg-slate-800 border-slate-600 text-slate-100 focus:border-blue-500 placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-400 placeholder-slate-400"}`;

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "" || raw === ".") { setManualDiscount(raw); return; }
    const parsed = parseFloat(raw);
    if (isNaN(parsed)) { setManualDiscount(""); return; }
    setManualDiscount(parsed > maxDiscount ? maxDiscount.toFixed(2) : raw);
  };

  const SummaryContent = () => (
    <>
      <div className={`px-4 py-1.5 border-b ${border}`}><p className={`text-[11px] font-bold uppercase tracking-wide ${txtMuted}`}>Order Summary</p></div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2" style={{ scrollbarWidth: "thin" }}>
        {cart.map(item => (
          <div key={item.id} className={`rounded-xl px-3 py-2.5 border ${border} ${sectionBg}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${txt} truncate`}>{item.name}</p>
                {isSerialized(item) && item.serialNumbers && item.serialNumbers.length > 0 && (
                  <p className={`text-[10px] font-mono ${txtMuted} truncate mt-0.5`}>{item.serialNumbers.map(s => s.serialNo).join(", ")}</p>
                )}
                {(item.taxRate ?? 0) > 0 && (<p className="text-[10px] text-amber-400 font-semibold mt-0.5">Tax {item.taxRate}% · +${((item.taxAmount ?? 0) * item.qty).toFixed(2)}</p>)}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-bold ${dl ? "bg-slate-700 text-slate-300" : "bg-slate-200 text-slate-600"}`}>×{item.qty}</span>
                <span className="text-sm font-bold text-sky-500 w-16 text-right">${(item.salePrice * item.qty).toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={`border-t ${border} px-4 py-4 space-y-2.5 shrink-0`}>
        <div className="flex justify-between text-sm"><span className={txtSub}>Subtotal</span><span className={dl ? "text-slate-300" : "text-slate-700"}>${subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between text-sm"><span className={txtSub}>Tax</span><span className={dl ? "text-slate-300" : "text-slate-700"}>${totalTax.toFixed(2)}</span></div>
        {autoDiscount > 0 && (<div className="flex justify-between text-sm"><span className="text-emerald-400 flex items-center gap-1">Auto Discount <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15">Applied</span></span><span className="text-emerald-400 font-medium">-${autoDiscount.toFixed(2)}</span></div>)}
        {manualDiscountAmt > 0 && (<div className="flex justify-between text-sm"><span className={txtSub}>Manual Discount</span><span className="text-red-400">-${manualDiscountAmt.toFixed(2)}</span></div>)}
        {paymentMethod === 3 && pointDiscount > 0 && (<div className="flex justify-between text-sm"><span className="text-amber-400 flex items-center gap-1.5">⭐ Point Payment <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">{pointsUsed} pts</span></span><span className="text-amber-400 font-medium">-${pointDiscount.toFixed(2)}</span></div>)}
        <div className={`flex justify-between items-center pt-3 border-t border-dashed ${dl ? "border-slate-600" : "border-slate-300"}`}>
          <span className={`font-bold text-sm ${txt}`}>Total Payable</span><span className="font-extrabold text-2xl text-blue-500">${total.toFixed(2)}</span>
        </div>
        {paymentMethod === 1 && cashGivenNum > 0 && (<div className={`flex justify-between items-center pt-2 border-t ${divider}`}><span className={`text-sm font-semibold ${txtSub}`}>Change</span><span className={`font-bold text-lg ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}>${change.toFixed(2)}</span></div>)}
      </div>
    </>
  );

  return (
    <div className={`fixed inset-0 z-50 flex mt-16 items-center justify-center ${overlay} backdrop-blur-sm p-2 sm:p-4`} onClick={e => { if (e.target === e.currentTarget && !placing) onClose(); }}>
      <div className={`${modal} rounded-2xl border ${border} w-full shadow-2xl flex flex-col overflow-hidden`} style={{ maxWidth: "860px", height: "calc(100vh - 74px)", maxHeight: "760px" }}>
        <div className={`flex items-center gap-3 px-4 sm:px-5 py-2 border-b ${border} shrink-0`}>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className={`font-bold text-sm sm:text-base ${txt}`}>Confirm Payment</h2>
            <p className={`text-xs ${txtMuted} truncate flex items-center gap-1.5`}>
              {totalQty} item{totalQty !== 1 ? "s" : ""} · {cart.length} product{cart.length !== 1 ? "s" : ""}
              {customer && (
                <span className="ml-1 text-amber-400 font-semibold flex items-center gap-1">
                  · ⭐ {customerPointLoading ? <Spinner size="sm" /> : `${customer.totalPoint} pts`}
                </span>
              )}
            </p>
          </div>
          <button onClick={() => setShowSummary(v => !v)} className={`sm:hidden px-2 py-1 rounded-lg text-xs font-semibold border ${dl ? "border-slate-600 text-slate-300" : "border-slate-200 text-slate-600"}`}>{showSummary ? "Payment" : "Summary"}</button>
          <button onClick={onClose} disabled={placing} className={`w-8 h-8 rounded-lg flex items-center justify-center ${dl ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <div className={`flex-col border-r ${border} sm:flex sm:w-[300px] md:w-[340px] sm:shrink-0 min-h-0 ${showSummary ? "flex w-full" : "hidden sm:flex"}`}><SummaryContent /></div>
          <div className={`flex-1 flex-col overflow-hidden sm:flex min-h-0 ${showSummary ? "hidden sm:flex" : "flex"}`}>
            <div className="flex-1 min-h-0 px-4 sm:px-5 py-4 space-y-4 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wide ${txtSub} mb-2`}>Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map(pm => {
                    const active = paymentMethod === pm.value;
                    const disabled = pm.value === 3 && !canPayByPoint;
                    return (
                      <button key={pm.value} onClick={() => !disabled && setPaymentMethod(pm.value)} disabled={disabled}
                        className={`flex flex-col items-center gap-1 px-2 sm:px-3 py-3 rounded-xl border-2 transition-all ${disabled ? (dl ? "border-slate-700 bg-slate-800/30 opacity-40 cursor-not-allowed" : "border-slate-200 bg-slate-50 opacity-40 cursor-not-allowed") : active ? "border-blue-500 bg-blue-500/10 shadow-sm" : (dl ? "border-slate-700 bg-slate-800/60 hover:border-slate-600" : "border-slate-200 bg-slate-50 hover:border-slate-300")}`}>
                        <span className="text-xl sm:text-2xl leading-none">{pm.icon}</span>
                        <span className={`text-xs font-semibold ${active ? (dl ? "text-blue-400" : "text-blue-600") : txt}`}>{pm.label}</span>
                        {pm.value === 3 && (
                          <span className={`text-[10px] text-center leading-tight ${canPayByPoint ? "text-amber-400" : txtMuted}`}>
                            {customerPointLoading ? "Loading…" : canPayByPoint ? `${pointsNeeded} pts` : customer ? "Not enough" : "No customer"}
                          </span>
                        )}
                        {active && (<span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center"><svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></span>)}
                      </button>
                    );
                  })}
                </div>
              </div>
              {paymentMethod === 1 && (
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wide ${txtSub} mb-1.5`}>Cash Given{cashGiven !== "" && !cashIsValid && (<span className="ml-2 normal-case text-red-400 font-semibold text-[11px]">⚠ Need at least ${total.toFixed(2)}</span>)}</label>
                  <div className="relative mb-2.5">
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold ${txtMuted}`}>$</span>
                    <input type="number" min="0" step="0.01" placeholder="0.00" value={cashGiven} onChange={e => setCashGiven(e.target.value)}
                      className={`${inputCls} pl-7 ${cashGiven !== "" && !cashIsValid ? "border-red-500 focus:border-red-500" : cashGivenNum >= total && cashGivenNum > 0 ? "border-emerald-500 focus:border-emerald-500" : ""}`} />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[50, 100, 500, 1000, 2000, 5000].map(amount => (
                      <button key={amount} onClick={() => setCashGiven(String(amount))}
                        className={`py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 border-2 ${cashGiven === String(amount) ? "border-blue-500 bg-blue-500/15 text-blue-400" : (dl ? "border-slate-600 bg-slate-700 text-slate-200 hover:border-blue-500/50" : "border-slate-200 bg-slate-100 text-slate-700 hover:border-blue-400/50")}`}>
                        ${amount}
                      </button>
                    ))}
                  </div>
                  {cashGivenNum >= total && cashGivenNum > 0 && (
                    <div className={`mt-2.5 flex justify-between items-center px-3 py-2 rounded-xl ${dl ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-emerald-50 border border-emerald-200"}`}>
                      <span className={`text-sm font-semibold ${dl ? "text-emerald-300" : "text-emerald-700"}`}>Change</span>
                      <span className={`text-lg font-extrabold ${dl ? "text-emerald-300" : "text-emerald-600"}`}>${change.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}
              {paymentMethod === 2 && (
                <div className="flex flex-col items-center gap-3">
                  <label className={`self-start block text-xs font-bold uppercase tracking-wide ${txtSub}`}>Scan to Pay</label>
                  <div className={`w-full rounded-2xl border-2 ${dl ? "border-slate-600 bg-slate-800/60" : "border-slate-200 bg-slate-50"} flex flex-col items-center py-4 gap-3`}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QR" className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl" style={{ background: "white", padding: "8px" }} />
                    <p className={`text-xs ${txtMuted}`}>Scan with your banking app to pay</p>
                  </div>
                </div>
              )}
              {paymentMethod === 3 && canPayByPoint && (
                <div className={`rounded-xl px-4 py-4 border ${dl ? "bg-amber-500/10 border-amber-500/30" : "bg-amber-50 border-amber-200"}`}>
                  <div className="flex items-center gap-3 mb-3"><span className="text-3xl">⭐</span><div><p className={`text-sm font-bold ${dl ? "text-amber-300" : "text-amber-700"}`}>{customer!.name}</p>
                    <p className={`text-xs ${dl ? "text-amber-400/70" : "text-amber-600/70"}`}>Available: {customer!.totalPoint} points</p>
                  </div>
                  </div>
                  <div className={`rounded-lg px-3 py-2.5 space-y-1.5 ${dl ? "bg-slate-900/40" : "bg-white/70"}`}>
                    <div className="flex justify-between text-sm"><span className={txtSub}>Points to deduct</span><span className={`font-bold ${dl ? "text-amber-300" : "text-amber-700"}`}>{pointsNeeded} pts</span></div>
                    <div className="flex justify-between text-sm"><span className={txtSub}>Discount value</span><span className="font-bold text-emerald-400">${pointDiscount.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm"><span className={txtSub}>Remaining points after</span><span className={`font-bold ${dl ? "text-slate-300" : "text-slate-700"}`}>{customer!.totalPoint - pointsNeeded} pts</span></div>
                    <div className={`pt-2 mt-1 border-t ${dl ? "border-slate-700" : "border-amber-200"} flex justify-between text-sm`}><span className={`font-bold ${txt}`}>Total to pay</span><span className="font-extrabold text-blue-500">${total.toFixed(2)}</span></div>
                  </div>
                  <p className={`text-[11px] mt-2 text-center ${dl ? "text-amber-500" : "text-amber-600"}`}>Points will be deducted automatically on confirm</p>
                </div>
              )}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wide ${txtSub} mb-1.5`}>Additional Discount ($)<span className={`ml-2 normal-case font-normal text-[11px] ${txtMuted}`}>max ${maxDiscount.toFixed(2)}</span></label>
                <div className="relative"><span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold ${txtMuted}`}>$</span><input type="number" min="0" step="0.01" placeholder="0.00" max={maxDiscount} value={manualDiscount} onChange={handleDiscountChange} className={`${inputCls} pl-7`} /></div>
              </div>
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wide ${txtSub} mb-1.5`}>Notes (optional)</label>
                <textarea rows={3} placeholder="Add a note for this order…" value={notes} onChange={e => setNotes(e.target.value)} className={`${inputCls} resize-none`} />
              </div>
              {orderError && (<div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">⚠️ {orderError}</div>)}
            </div>
            <div className={`flex items-center gap-3 px-4 sm:px-5 py-3 border-t ${border} shrink-0`}>
              <button onClick={onClose} disabled={placing} className={`flex-1 py-2.5 sm:py-3 rounded-xl text-sm font-semibold border ${dl ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>Cancel</button>
              <button onClick={() => onConfirm(paymentMethod, manualDiscountAmt, notes, pointsUsed, cashGivenNum, total)} disabled={!canConfirm}
                className={`flex-[2] py-2.5 sm:py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${!canConfirm ? (dl ? "bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-slate-200 text-slate-400 cursor-not-allowed") : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg active:scale-95"}`}>
                {placing ? (<><Spinner size="sm" /><span>Processing…</span></>) : (<><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg><span>Confirm · ${total.toFixed(2)}</span></>)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Near Discount Hint Banner ───────────────────────────────────────────────
function NearDiscountHintBanner({ message, dark }: { message: string; dark: boolean }) {
  return (
    <div className={`rounded-xl border px-3 py-2.5 flex items-start gap-2.5 ${dark ? "bg-amber-500/8 border-amber-500/25" : "bg-amber-50 border-amber-200"}`}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${dark ? "bg-amber-500/20" : "bg-amber-100"}`}>
        <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M17 17h.01M7 17l10-10M9.5 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5zm5 5a2.5 2.5 0 110 5 2.5 2.5 0 010-5z" /></svg>
      </div>
      <p className={`text-xs font-semibold flex-1 ${dark ? "text-amber-200" : "text-amber-800"}`}>{message}</p>
    </div>
  );
}

// ─── Serial Number Modal ─────────────────────────────────────────────────────
function SerialNumberModal({ product, dark, existingSerials, existingWarrantyMonths, existingWarrantyStart, onConfirm, onClose }: SerialNumberModalProps) {
  const initialValue: SerialMultiValue = (existingSerials ?? []).map(s => ({
    id: s.id, name: s.serialNo, value: null, data: (s.data as any) ?? null,
  }));
  const [selected, setSelected] = useState<SerialMultiValue>(initialValue);
  const [warrantyMonths, setWarrantyMonths] = useState(existingWarrantyMonths ?? 0);
  const [warrantyStart, setWarrantyStart] = useState(existingWarrantyStart ?? todayISO());
  const dl = dark;
  const border = dl ? "border-slate-700" : "border-slate-200";
  const txt = dl ? "text-slate-100" : "text-slate-900";
  const txtSub = dl ? "text-slate-400" : "text-slate-500";

  const handleConfirm = () => {
    if (selected.length === 0) { alertError("Select at least one serial number"); return; }
    const mapped: SelectedSerial[] = selected.map(s => ({ id: s.id, serialNo: s.name, data: (s.data as SerialNumberItem | null) ?? null }));
    onConfirm(product, mapped, warrantyMonths, warrantyStart, addMonths(warrantyStart, warrantyMonths));
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${dl ? "bg-black/75" : "bg-black/55"} backdrop-blur-sm p-4`} onClick={onClose}>
      <div className={`${dl ? "bg-[#1e293b]" : "bg-white"} rounded-2xl border ${border} w-full max-w-lg shadow-2xl flex flex-col overflow-hidden`} onClick={e => e.stopPropagation()}>
        <div className={`px-5 py-3 border-b ${border} flex items-start justify-between gap-3 shrink-0`}>
          <div className="min-w-0">
            <h3 className={`font-bold ${txt}`}>Select Serial Numbers</h3>
            <p className={`text-xs ${txtSub}`}>{product.name} · {selected.length} selected</p>
            {product.description && (<p className={`text-[11px] mt-1 line-clamp-2 ${txtSub}`}>{product.description}</p>)}
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${dl ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}>✕</button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div>
            <label className={`text-xs font-semibold ${txtSub} block mb-1.5`}>Serial Numbers</label>
            <XSelectSearch
              multiple
              value={selected}
              onChange={setSelected}
              placeholder="Search and select serial numbers..."
              loadingMessage="Loading serials..."
              noOptionsMessage="No available serial numbers"
              selectOption={{
                apiEndpoint: `stock/available?ProductId=${product.id}`,
                id: "id",
                name: "serialNo",
                fetchAll: false,
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`text-xs font-semibold ${txtSub} block mb-1`}>Warranty Start</label>
              <input type="date" value={warrantyStart} onChange={e => setWarrantyStart(e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${dl ? "bg-slate-800 border-slate-600 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-900"}`} />
            </div>
            <div>
              <label className={`text-xs font-semibold ${txtSub} block mb-1`}>Duration</label>
              <select value={warrantyMonths} onChange={e => setWarrantyMonths(Number(e.target.value))} className={`w-full px-3 py-2 rounded-lg border text-sm ${dl ? "bg-slate-800 border-slate-600 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-900"}`}>
                {WARRANTY_OPTIONS.map(o => <option key={o.months} value={o.months}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {selected.length > 0 && (
            <div className={`rounded-xl border ${border} p-3 max-h-40 overflow-y-auto space-y-1.5`}>
              {selected.map(s => (
                <div key={s.id} className="flex items-center justify-between">
                  <span className={`font-mono text-sm font-semibold ${txt}`}>{s.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${dl ? "bg-slate-700 text-slate-300" : "bg-slate-200 text-slate-600"}`}>
                    {(s.data as SerialNumberItem | null)?.status ?? "Available"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`px-5 py-3 border-t ${border} flex justify-end gap-2 shrink-0`}>
          <button onClick={onClose} className={`px-4 py-2 rounded-xl text-sm font-semibold border ${dl ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>Cancel</button>
          <button onClick={handleConfirm} disabled={selected.length === 0}
            className={`px-5 py-2 rounded-xl text-sm font-bold ${selected.length === 0 ? "bg-slate-700 text-slate-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"}`}>
            Add {selected.length} to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

// API
const fetchProducts = async (params: { search: string; categoryId: string; page: number }): Promise<ProductsPageResponse> => {
  const p: any = { Page: params.page, PageSize: 8 };
  if (params.search) p.Search = params.search;
  if (params.categoryId !== "0") p.CategoryId = params.categoryId;
  const res = await AxiosApi.get("Products/Sale-POS", { params: p });
  return res.data ?? { data: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0, hasPrevious: false, hasNext: false };
};

// ✅ NEW: hits GET /api/products/Scan?code=... which resolves either a Serial No
// (serialized products) or a Product Code (non-serialized products).
const scanProductCode = async (code: string): Promise<ProductScanInfo> => {
  const res = await AxiosApi.get("Products/Scan", { params: { Code: code } });
  return res.data?.data as ProductScanInfo;
};

const fetchOrderSummary = async (cart: CartItem[], customerId: number | undefined, paymentMethod: number): Promise<OrderSummaryResponse | null> => {
  if (cart.length === 0) return null;
  const payload = {
    customerId: customerId ?? 0, paymentMethod,
    items: cart.map(item => ({
      productId: item.id,
      quantity: item.qty,
      serialNumbers: isSerialized(item) && item.serialNumbers?.length ? item.serialNumbers.map(s => s.serialNo) : [],
      warrantyStartDate: item.warrantyMonths ? toIsoOrNull(item.warrantyStart) : null,
      warrantyEndDate: item.warrantyMonths ? toIsoOrNull(item.warrantyEnd) : null,
    })),
  };
  const res = await AxiosApi.post("orders/summary", payload);
  return res.data?.data ?? null;
};

const fetchPointSetup = async (): Promise<PointSetupInfo | null> => {
  try {
    const res = await AxiosApi.get("PointSetup/lookup");
    const d = res.data?.data; return d ? { pointsPerRedemption: d.pointsPerRedemption ?? 0, isActive: d.isActive ?? false } : null;
  } catch { return null; }
};

// ✅ NEW: fetches the customer's live totalPoint from its own detail endpoint.
// The Customer/lookup endpoint (used by the XSelectSearch dropdown) only returns
// lightweight search results and cannot be trusted for an up-to-date point balance,
// so we call this separately right after a customer is selected.
const fetchCustomerDetail = async (id: number): Promise<CustomerInfo | null> => {
  try {
    const res = await AxiosApi.get(`Customer/${id}`);
    const d = res.data?.data ?? res.data;
    if (!d) return null;
    return { id: d.id ?? id, name: d.fullName ?? d.name ?? "", totalPoint: d.totalPoint ?? 0 };
  } catch (e) {
    console.error(e);
    return null;
  }
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function PosShop() {
  const { darkLight } = useGlobleContextDarklight();
  const dark = darkLight;
  const [selectedCategory, setSelectedCategory] = useState<{ id: number; name: string } | null>(null);
  const activeCategoryId = selectedCategory ? String(selectedCategory.id) : "0";

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scanningBarcode, setScanningBarcode] = useState(false);

  // Pagination / infinite-scroll state for the product list
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const productGridRef = useRef<HTMLDivElement>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [serialModal, setSerialModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
  const [paymentModal, setPaymentModal] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<OrderSummaryResponse | null>(null);
  const summaryDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Customer + points
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerInfo | null>(null);
  const [customerPointLoading, setCustomerPointLoading] = useState(false);
  const [pointSetup, setPointSetup] = useState<PointSetupInfo | null>(null);

  const [mobileView, setMobileView] = useState<"products" | "cart">("products");
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [refreshKey, setRefreshKey] = useState<any>(null);

  useEffect(() => {
    fetchPointSetup().then(d => setPointSetup(d));
  }, []);

  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(search), 400); return () => clearTimeout(t); }, [search]);

  // Load page 1 whenever the category/search filters change
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadingProducts(true);
      setPage(1);
      try {
        const res = await fetchProducts({ search: debouncedSearch, categoryId: activeCategoryId, page: 1 });
        if (!cancelled) {
          setProducts(res.data);
          setHasNext(res.hasNext);
          productGridRef.current?.scrollTo({ top: 0 });
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) { setProducts([]); setHasNext(false); }
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [activeCategoryId, debouncedSearch, refreshKey]);

  // ✅ FIXED: auto-fetch the customer's live totalPoint the moment a customer is selected.
  // Runs on selectedCustomer?.id only (not on the whole object) so it doesn't
  // re-trigger itself when we patch totalPoint back onto selectedCustomer below.
  useEffect(() => {
    if (!selectedCustomer?.id) return;
    let cancelled = false;
    setCustomerPointLoading(true);
    fetchCustomerDetail(selectedCustomer.id)
      .then(detail => {
        if (cancelled || !detail) return;
        setSelectedCustomer(prev => (prev && prev.id === detail.id ? { ...prev, totalPoint: detail.totalPoint } : prev));
      })
      .finally(() => { if (!cancelled) setCustomerPointLoading(false); });
    return () => { cancelled = true; };
  }, [selectedCustomer?.id]);

  // Fetch next page and append
  const loadMoreProducts = useCallback(async () => {
    if (loadingMore || loadingProducts || !hasNext) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetchProducts({ search: debouncedSearch, categoryId: activeCategoryId, page: nextPage });
      setProducts(prev => [...prev, ...res.data]);
      setHasNext(res.hasNext);
      setPage(nextPage);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, loadingProducts, hasNext, page, debouncedSearch, activeCategoryId]);

  const handleProductScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 200) {
      loadMoreProducts();
    }
  }, [loadMoreProducts]);

  // Order summary
  useEffect(() => {
    if (summaryDebounceRef.current) clearTimeout(summaryDebounceRef.current);
    if (cart.length === 0) { setSummaryData(null); return; }
    summaryDebounceRef.current = setTimeout(async () => {
      try { const data = await fetchOrderSummary(cart, selectedCustomer?.id, 1); setSummaryData(data); } catch { setSummaryData(null); }
    }, 500);
    return () => { if (summaryDebounceRef.current) clearTimeout(summaryDebounceRef.current); };
  }, [cart, selectedCustomer?.id]);

  // Opens the serial-select popup if serialized, otherwise adds straight to cart —
  // now blocked once the qty already in cart reaches the product's stockQuantity.
  const addToCart = useCallback((product: Product) => {
    if (isSerialized(product)) { setSerialModal({ open: true, product }); return; }
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      const currentQty = ex?.qty ?? 0;
      if (currentQty + 1 > product.stockQuantity) {
        alertError(`Only ${product.stockQuantity} ${product.unit || "pcs"} of "${product.name}" in stock.`);
        return prev;
      }
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  }, []);

  const handleSerialConfirm = useCallback((product: Product, serials: SelectedSerial[], wm: number, ws: string, we: string) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: serials.length, serialNumbers: serials, warrantyMonths: wm, warrantyStart: ws, warrantyEnd: we } : i);
      return [...prev, { ...product, qty: serials.length, serialNumbers: serials, warrantyMonths: wm, warrantyStart: ws, warrantyEnd: we }];
    });
    setSerialModal({ open: false, product: null });
  }, []);

  const incrementQty = useCallback((item: CartItem) => {
    if (isSerialized(item)) {
      setSerialModal({ open: true, product: item });
      return;
    }
    if (item.qty + 1 > item.stockQuantity) {
      alertError(`Only ${item.stockQuantity} ${item.unit || "pcs"} of "${item.name}" in stock.`);
      return;
    }
    setCart(prev => prev.map(i => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i)));
  }, []);

  const decrementQty = useCallback((id: number) => {
    setCart(prev => prev.map(i => {
      if (i.id !== id) return i;
      if (isSerialized(i) && i.serialNumbers && i.serialNumbers.length > 0) {
        const newSerials = i.serialNumbers.slice(0, -1); // remove the last-added serial
        return { ...i, qty: newSerials.length, serialNumbers: newSerials };
      }
      return { ...i, qty: Math.max(0, i.qty - 1) };
    }).filter(i => i.qty > 0));
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCart(prev => prev.filter(i => i.id !== id));
  }, []);

  // ✅ NEW: adds a scanned unit to the cart.
  // - Serialized product: adds the exact scanned serial (rejects duplicate scans of the
  //   same serial already in the cart).
  // - Non-serialized product: behaves like clicking the card, but re-checks stock using
  //   the fresh stockQuantity returned by the scan API (in case it changed since the grid loaded).
  const addScannedToCart = useCallback((scanned: ProductScanInfo) => {
    const product: Product = {
      id: scanned.productId,
      code: scanned.productCode ?? "",
      name: scanned.productName,
      imageUrl: scanned.imageUrl ?? "",
      unit: scanned.unit ?? "",
      salePrice: scanned.salePrice,
      stockQuantity: scanned.stockQuantity,
      inStock: scanned.stockQuantity > 0,
      categoryId: scanned.categoryId,
      categoryName: scanned.categoryName,
      productType: scanned.productType,
    };

    if (scanned.isSerial) {
      if (!scanned.scannedSerialNumber) { alertError("Scanned serial number is missing from the response."); return; }
      let added = false;
      let duplicate = false;
      setCart(prev => {
        const ex = prev.find(i => i.id === product.id);
        const already = ex?.serialNumbers?.some(s => s.serialNo === scanned.scannedSerialNumber);
        if (already) { duplicate = true; return prev; }
        const newSerial: SelectedSerial = { id: scanned.scannedSerialNumber!, serialNo: scanned.scannedSerialNumber!, data: null };
        added = true;
        if (ex) {
          const updatedSerials = [...(ex.serialNumbers ?? []), newSerial];
          return prev.map(i => i.id === product.id ? { ...i, qty: updatedSerials.length, serialNumbers: updatedSerials, stockQuantity: product.stockQuantity } : i);
        }
        return [...prev, { ...product, qty: 1, serialNumbers: [newSerial] }];
      });
      if (duplicate) alertError(`Serial "${scanned.scannedSerialNumber}" is already in the cart.`);
      else if (added) {
        // alertify.success(`Added: ${product.name} (S/N ${scanned.scannedSerialNumber})`);
      }
      return;
    }

    let blocked = false;
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      const currentQty = ex?.qty ?? 0;
      if (currentQty + 1 > product.stockQuantity) { blocked = true; return prev; }
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1, stockQuantity: product.stockQuantity } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    if (blocked) alertError(`Only ${product.stockQuantity} ${product.unit || "pcs"} of "${product.name}" in stock.`);
    else {
      // alertify.success(`Added: ${product.name}`);
    }
  }, []);

  const handleBarcodeKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const code = barcodeInput.trim();
    if (!code) return;
    setScanningBarcode(true);
    try {
      const scanned = await scanProductCode(code);
      if (!scanned) { alertError(`No product or serial number found for "${code}"`); return; }
      addScannedToCart(scanned);
    } catch (err: any) {
      alertError(err?.response?.data?.message || `No product or serial number found for "${code}"`);
    } finally {
      setScanningBarcode(false);
      setBarcodeInput("");
    }
  };

  const subtotal = cart.reduce((s, i) => s + i.salePrice * i.qty, 0);
  const totalTax = cart.reduce((s, i) => s + (i.taxAmount ?? 0) * i.qty, 0);
  const autoDiscount = summaryData?.discountAmount ?? 0;
  const totalAmount = summaryData?.totalAmount ?? (subtotal + totalTax);
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);

  const handleConfirmPayment = async (paymentMethod: number, discount: number, notes: string, cashGiven: number, finalTotal: number) => {
    setPlacingOrder(true); setOrderError(null);
    try {
      const payload: PlaceOrderPayload = {
        customerId: selectedCustomer?.id, paymentMethod, note: notes,
        items: cart.map(item => ({
          productId: item.id, quantity: item.qty,
          serialNumbers: isSerialized(item) && item.serialNumbers?.length ? item.serialNumbers.map(s => s.serialNo) : [],
          warrantyStartDate: item.warrantyMonths ? toIsoOrNull(item.warrantyStart) : null,
          warrantyEndDate: item.warrantyMonths ? toIsoOrNull(item.warrantyEnd) : null,
        })),
      };
      const res = await AxiosApi.post("orders", payload);
      const trans = res.data?.data;
      setReceiptData({
        transId: trans?.orderNo ?? trans?.id?.toString() ?? "#000",
        customerName: selectedCustomer?.name ?? "Walk-in",
        items: cart, subtotal, totalTax, totalAmount: finalTotal,
        paymentMethod, cashGiven: paymentMethod === 1 ? cashGiven : undefined,
        change: paymentMethod === 1 ? Math.max(0, cashGiven - finalTotal) : undefined,
        discount: discount > 0 ? discount : undefined,
      });
      setPaymentModal(false);
      setCart([]);
      setSelectedCustomer(null);
      setRefreshKey(new Date());
      alertify.success("Order placed successfully!");
    } catch (err: any) {
      setOrderError(err?.response?.data?.message || err?.response?.data?.errors?.[0] || "Failed to place order");
    } finally { setPlacingOrder(false); }
  };

  const handleNewSale = () => { setReceiptData(null); };

  // ─── Styles ────────────────────────────────────────────────────────────────
  const dl = dark;
  const border = dl ? "border-slate-700" : "border-slate-200";
  const txt = dl ? "text-slate-100" : "text-slate-900";
  const txtSub = dl ? "text-slate-400" : "text-slate-500";
  const txtMuted = dl ? "text-slate-500" : "text-slate-400";
  const bgMain = dl ? "bg-[#0f172a]" : "bg-slate-100";
  const bgCard = dl ? "bg-[#1e293b]" : "bg-white";
  const imgFallback = dl ? PLACEHOLDER_DARK : PLACEHOLDER_LIGHT;

  // ─── Render helpers ────────────────────────────────────────────────────────
  const renderProduct = (product: Product) => {
    const cartItem = cart.find(i => i.id === product.id);
    const inCart = !!cartItem;
    // ✅ NEW: remaining stock shown/enforced in the UI = original stock - qty already in cart
    const remainingStock = Math.max(0, product.stockQuantity - (cartItem?.qty ?? 0));
    const soldOut = remainingStock <= 0;
    const productBg = dl ? "bg-slate-800/60 hover:bg-slate-800" : "bg-white hover:bg-slate-50";
    const borderColor = inCart ? "border-blue-500" : (dl ? "border-slate-700" : "border-slate-200");

    return (
      <button key={product.id} onClick={() => addToCart(product)}
        className={`relative flex gap-3 p-3 rounded-xl border-2 transition-all text-left w-full group ${productBg} ${borderColor} ${!product.inStock || soldOut ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        disabled={!product.inStock || soldOut}>
        {inCart && (<div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg z-10">{cartItem.qty}</div>)}
        <img src={product.imageUrl || imgFallback} alt={product.name} className="w-14 h-14 rounded-lg object-contain shrink-0 bg-slate-200" />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate ${txt}`}>{product.name}</p>
          <p className={`text-[11px] font-mono truncate ${txtMuted}`}>{product.code || "—"}</p>
          {product.categoryName && (<p className={`text-[10px] truncate mt-0.5 ${dl ? "text-indigo-400" : "text-indigo-500"}`}>{product.categoryName}</p>)}
          {product.description && (<p className={`text-[10px] mt-1 line-clamp-2 ${txtMuted}`}>{product.description}</p>)}
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-sm font-bold text-emerald-400">${product.salePrice.toFixed(2)}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${remainingStock === 0 ? "bg-red-500/15 text-red-400" : remainingStock <= 5 ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"}`}>
              {remainingStock} {product.unit || "pcs"}
            </span>
          </div>
        </div>
      </button>
    );
  };

  const renderCartItem = (item: CartItem) => {
    const rowBg = dl ? "bg-slate-800/40" : "bg-slate-50";
    return (
      <div key={item.id} className={`rounded-xl p-3 border ${border} ${rowBg}`}>
        <div className="flex items-start gap-3">
          <img src={item.imageUrl || imgFallback} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0 bg-slate-200" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className={`text-sm font-semibold truncate ${txt}`}>{item.name}</p>
                <p className={`text-[11px] ${txtMuted}`}>${item.salePrice.toFixed(2)} × {item.qty}</p>
                {isSerialized(item) && item.serialNumbers && item.serialNumbers.length > 0 && (
                  <p className={`text-[9px] font-mono ${txtMuted} truncate mt-0.5`}>S/N: {item.serialNumbers.map(s => s.serialNo).join(", ")}</p>
                )}
              </div>
              <button onClick={() => removeFromCart(item.id)} className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs ${dl ? "hover:bg-red-500/20 text-slate-500 hover:text-red-400" : "hover:bg-red-50 text-slate-400 hover:text-red-500"}`}>✕</button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1">
                <button onClick={() => decrementQty(item.id)} className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold border ${dl ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "border-slate-200 text-slate-600 hover:bg-slate-100"}`}>−</button>
                <span className={`w-8 text-center text-sm font-bold ${txt}`}>{item.qty}</span>
                <button onClick={() => incrementQty(item)} className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold border ${dl ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "border-slate-200 text-slate-600 hover:bg-slate-100"}`}>+</button>
              </div>
              <span className="text-sm font-bold text-sky-400">${(item.salePrice * item.qty).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── JSX ───────────────────────────────────────────────────────────────────
  return (
    <div className={`flex h-[calc(100vh-97px)] min-h-0 ${bgMain} overflow-hidden`}>
      {/* ── Left: Products ── */}
      <div className={`flex-1 flex flex-col min-w-0 min-h-0 ${mobileView === "cart" ? "hidden lg:flex" : "flex"}`}>

        {/* Header row: 1) Category  2) Item search  3) Barcode scan */}
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 px-4 py-1 border-b ${border} shrink-0`}>
          {/* Category */}
          <div>
            <XSelectSearch
              value={selectedCategory ? { id: selectedCategory.id, name: selectedCategory.name, value: selectedCategory.id, data: null } : null}
              onChange={(val) => setSelectedCategory(val ? { id: val.id as number, name: val.name } : null)}
              placeholder="All Categories"
              noOptionsMessage="No categories found"
              selectOption={{ apiEndpoint: "Category/lookup", id: "id", name: "name", fetchAll: false }}
            />
          </div>

          {/* Item search */}
          <div className="relative">
            <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${txtMuted} pointer-events-none`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text" placeholder="Search product..." value={search} onChange={e => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${dl ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-blue-500" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-400"}`}
            />
          </div>

          {/* Barcode scan */}
          <div className="relative">
            <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${txtMuted} pointer-events-none`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7V5a2 2 0 012-2h2M3 17v2a2 2 0 002 2h2m10-16h2a2 2 0 012 2v2m-2 14h2a2 2 0 002-2v-2M7 12h.01M11 12h.01M15 12h.01M17 12h.01" />
            </svg>
            <input
              type="text" placeholder="Scan serial or code..." value={barcodeInput}
              onChange={e => setBarcodeInput(e.target.value)} onKeyDown={handleBarcodeKeyDown}
              className={`w-full pl-10 pr-9 py-2.5 rounded-xl border text-sm outline-none transition-all ${dl ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-emerald-500" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-400"}`}
            />
            {scanningBarcode && (<span className="absolute right-3 top-1/2 -translate-y-1/2"><Spinner size="sm" /></span>)}
          </div>
        </div>

        {/* Product Grid — only this panel scrolls; onScroll drives infinite loading */}
        <div
          ref={productGridRef}
          onScroll={handleProductScroll}
          className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 pt-2 space-y-2"
          style={{ scrollbarWidth: "thin" }}
        >
          {loadingProducts && (<div className="flex items-center justify-center py-12"><Spinner /></div>)}
          {!loadingProducts && products.length === 0 && (<div className="flex flex-col items-center justify-center py-12 text-center"><span className="text-4xl mb-3">📦</span><p className={`text-sm ${txtSub}`}>No products found</p></div>)}
          {!loadingProducts && products.map(renderProduct)}
          {loadingMore && (<div className="flex items-center justify-center py-4"><Spinner size="sm" /></div>)}
          {!loadingProducts && !loadingMore && !hasNext && products.length > 0 && (
            <p className={`text-center text-[11px] py-2 ${txtMuted}`}>No more products</p>
          )}
        </div>

        {/* Mobile cart toggle */}
        <div className={`lg:hidden flex items-center justify-center py-2 border-t ${border} shrink-0 ${bgCard}`}>
          <button onClick={() => setMobileView("cart")} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-500 text-white font-bold text-sm shadow-lg active:scale-95">
            🛒 Cart ({totalQty}) · ${totalAmount.toFixed(2)}
          </button>
        </div>
      </div>

      {/* ── Right: Cart ── */}
      <div className={`w-full lg:w-[380px] xl:w-[420px] flex flex-col min-h-0 border-l ${border} ${bgCard} ${mobileView === "products" ? "hidden lg:flex" : "flex"}`}>
        {/* Cart Header */}
        <div className={`px-4 py-3 border-b ${border} flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileView("products")} className={`lg:hidden w-8 h-8 rounded-lg flex items-center justify-center ${dl ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}>←</button>
            <h2 className={`font-bold ${txt}`}>Cart</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${totalQty > 0 ? "bg-blue-500/15 text-blue-400" : (dl ? "bg-slate-700 text-slate-500" : "bg-slate-200 text-slate-400")}`}>{totalQty} items</span>
          </div>
          {cart.length > 0 && (<button onClick={() => setCart([])} className={`text-xs font-semibold ${dl ? "text-red-400 hover:text-red-300" : "text-red-500 hover:text-red-600"}`}>Clear</button>)}
        </div>

        {/* Customer */}
        <div className={`px-4 py-1 border-b ${border} shrink-0`}>
          <XSelectSearch
            value={selectedCustomer ? { id: selectedCustomer.id, name: selectedCustomer.name, value: selectedCustomer.id, data: null } : null}
            onChange={(val) => {
              setSelectedCustomer(val ? { id: val.id as number, name: val.name, totalPoint: 0 } : null);
            }}
            placeholder="Select customer (optional)..."
            selectOption={{ apiEndpoint: "Customer/lookup", id: "id", name: "fullName", fetchAll: false }}
          />
        </div>

        {/* Warnings */}
        {summaryData?.warnings && summaryData.warnings.length > 0 && (
          <div className="px-4 py-2 space-y-1.5 shrink-0">
            {summaryData.warnings.map((w, i) => <NearDiscountHintBanner key={i} message={w} dark={dl} />)}
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2" style={{ scrollbarWidth: "thin" }}>
          {cart.length === 0 && (<div className="flex flex-col items-center justify-center py-12 text-center"><span className="text-4xl mb-3">🛒</span><p className={`text-sm ${txtSub}`}>Cart is empty</p></div>)}
          {cart.map(renderCartItem)}
        </div>

        {/* Cart Footer */}
        <div className={`border-t ${border} px-4 py-1 space-y-3 shrink-0`}>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span className={txtSub}>Subtotal</span><span className={dl ? "text-slate-300" : "text-slate-700"}>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-emerald-400"><span>Discount</span><span>-${autoDiscount.toFixed(2)}</span></div>
            <div className={`flex justify-between items-center pt-2 border-t border-dashed ${dl ? "border-slate-600" : "border-slate-300"}`}>
              <span className={`font-bold ${txt}`}>Total</span>
              <span className="font-extrabold text-xl text-blue-500">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
          <button onClick={() => setPaymentModal(true)} disabled={cart.length === 0}
            className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${cart.length === 0 ? (dl ? "bg-slate-800 text-slate-600 cursor-not-allowed" : "bg-slate-200 text-slate-400 cursor-not-allowed") : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl active:scale-[0.98]"}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            Pay · ${totalAmount.toFixed(2)}
          </button>
        </div>
      </div>

      {/* ── Modals ── */}
      {serialModal.open && serialModal.product && (
        <SerialNumberModal product={serialModal.product} dark={dl}
          existingSerials={cart.find(i => i.id === serialModal.product!.id)?.serialNumbers}
          existingWarrantyMonths={cart.find(i => i.id === serialModal.product!.id)?.warrantyMonths}
          existingWarrantyStart={cart.find(i => i.id === serialModal.product!.id)?.warrantyStart}
          onConfirm={handleSerialConfirm} onClose={() => setSerialModal({ open: false, product: null })} />
      )}

      {paymentModal && (
        <PaymentModal dark={dl} cart={cart} subtotal={subtotal} totalTax={totalTax} autoDiscount={autoDiscount}
          customer={selectedCustomer} customerPointLoading={customerPointLoading} pointSetup={pointSetup}
          onConfirm={handleConfirmPayment}
          onClose={() => { setPaymentModal(false); setOrderError(null); }} placing={placingOrder} orderError={orderError} />
      )}

      {receiptData && <ReceiptModal data={receiptData} onClose={handleNewSale} />}
    </div>
  );
}