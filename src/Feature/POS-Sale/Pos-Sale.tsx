// import { useState, useEffect, useCallback, useRef } from "react";
// import { useGlobleContextDarklight } from "../../AllContext/context";
// import { AxiosApi } from "../../component/Axios/Axios";
// import XSelectSearch, { MultiValue } from "../../component/XSelectSearch/Xselectsearch";
// import { alertError } from "../../HtmlHelper/Alert";
// import alertify from "alertifyjs";

// // ─── Types ────────────────────────────────────────────────────────────────────
// interface TypeNamebase { id: number; name: string; }
// interface Category {
//   id: number;
//   name: string;
//   description?: string;
//   image?: string;
//   isActive?: boolean;
// }
// interface Product {
//   id: number;
//   name: string;
//   description?: string;
//   sku?: string;
//   barcode?: string;
//   price: number;
//   costPrice?: number;
//   taxRate?: number;
//   taxAmount?: number;
//   stock?: number;
//   imageProduct?: string;
//   ram?: string;
//   storage?: string;
//   categoryId?: number;
//   branchId?: number;
//   isSerialNumber?: boolean;
//   minStock?: number;
//   category?: TypeNamebase;
//   branch?: TypeNamebase;
// }

// interface SerialNumberItem {
//   id: number;
//   productId: number;
//   serialNo: string;
//   status: string;
//   price?: number;
//   costPrice?: number;
//   createdDate?: string;
// }

// interface SelectedSerial {
//   id: number | string;
//   serialNo: string;
//   data?: SerialNumberItem | null;
// }

// interface CartItem extends Product {
//   qty: number;
//   serialNumbers?: SelectedSerial[];
//   warrantyMonths?: number;
//   warrantyStart?: string;
//   warrantyEnd?: string;
// }

// // ─── NEW: Order Summary Types ─────────────────────────────────────────────────
// interface NearDiscountHint {
//   message: string;
//   amountNeeded: number;
//   discountName: string;
//   applicableProducts: string[];
// }

// interface OrderSummaryResponse {
//   subTotal: number;
//   totalTax: number;
//   totalDiscount: number;
//   totalPayable: number;
//   nearDiscountHints: NearDiscountHint[];
// }

// interface ProductRowProps {
//   product: Product;
//   cartItem: CartItem | undefined;
//   onAdd: (p: Product) => void;
//   dark: boolean;
//   productBg: string;
//   borderColor: string;
//   textPrimary: string;
//   textSub: string;
//   textMuted: string;
//   imgFallback: string;
// }
// interface PaginatedResponse<T> {
//   data: T[];
//   totalCount: number;
//   page: number;
//   pageSize: number;
//   totalPages: number;
//   hasPrevious: boolean;
//   hasNext: boolean;
// }
// interface CartRowProps {
//   item: CartItem;
//   onInc: () => void;
//   onDec: () => void;
//   onRemove: () => void;
//   dark: boolean;
//   rowBg: string;
//   textPrimary: string;
//   textMuted: string;
// }

// interface PlaceOrderItemPayload {
//   productId: number;
//   serialNumberIds?: number[];
//   quantity?: number;
//   unitPrice: number;
//   notes?: string;
//   warrantyMonths?: number;
// }
// interface PlaceOrderPayload {
//   customerId?: number;
//   staffId?: number;
//   status?: number;
//   paymentStatus?: number;
//   discountAmount?: number;
//   saleType: number;
//   paymentMethod?: number;
//   notes?: string;
//   items: PlaceOrderItemPayload[];
// }

// interface SerialNumberModalProps {
//   product: Product;
//   dark: boolean;
//   existingSerials?: SelectedSerial[];
//   existingWarrantyMonths?: number;
//   existingWarrantyStart?: string;
//   onConfirm: (
//     product: Product,
//     serials: SelectedSerial[],
//     warrantyMonths: number,
//     warrantyStart: string,
//     warrantyEnd: string
//   ) => void;
//   onClose: () => void;
// }

// const PAYMENT_METHODS = [
//   { value: 1, label: "Cash", icon: "💵", color: "emerald" },
//   { value: 2, label: "Bank QR", icon: "📲", color: "blue" },
// ];
// interface PaymentModalProps {
//   dark: boolean;
//   cart: CartItem[];
//   subtotal: number;
//   totalTax: number;
//   autoDiscount: number;       // NEW: from summary API
//   onConfirm: (paymentMethod: number, discount: number, notes: string) => void;
//   onClose: () => void;
//   placing: boolean;
//   orderError: string | null;
// }

// function PaymentModal({
//   dark, cart, subtotal, totalTax, autoDiscount,
//   onConfirm, onClose, placing, orderError,
// }: PaymentModalProps) {
//   const [paymentMethod, setPaymentMethod] = useState<number>(1);
//   const [manualDiscount, setManualDiscount] = useState<string>("");
//   const [notes, setNotes] = useState<string>("");
//   const [cashGiven, setCashGiven] = useState<string>("");

//   const manualDiscountAmt = Math.min(parseFloat(manualDiscount) || 0, subtotal + totalTax);
//   const totalDiscountAmt = Math.min(autoDiscount + manualDiscountAmt, subtotal + totalTax);
//   const total = subtotal + totalTax - totalDiscountAmt;
//   const cashGivenNum = parseFloat(cashGiven) || 0;
//   const change = paymentMethod === 1 ? Math.max(0, cashGivenNum - total) : 0;
//   const totalQty = cart.reduce((s, i) => s + i.qty, 0);

//   const overlay = dark ? "bg-black/75" : "bg-black/55";
//   const modal = dark ? "bg-[#1e293b]" : "bg-white";
//   const border = dark ? "border-slate-700" : "border-slate-200";
//   const txt = dark ? "text-slate-100" : "text-slate-900";
//   const txtSub = dark ? "text-slate-400" : "text-slate-500";
//   const txtMuted = dark ? "text-slate-500" : "text-slate-400";
//   const inputCls = `w-full px-3 py-2 rounded-xl border text-sm outline-none transition-colors ${dark
//     ? "bg-slate-800 border-slate-600 text-slate-100 focus:border-blue-500 placeholder-slate-500"
//     : "bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-400 placeholder-slate-400"
//     }`;
//   const sectionBg = dark ? "bg-slate-800/60" : "bg-slate-50";
//   const divider = dark ? "border-slate-700" : "border-slate-200";

//   return (
//     <div
//       className={`fixed inset-0 z-50 flex mt-16 items-center justify-center ${overlay} backdrop-blur-sm p-4`}
//       onClick={e => { if (e.target === e.currentTarget && !placing) onClose(); }}
//     >
//       <div
//         className={`${modal} rounded-2xl border ${border} w-full shadow-2xl flex flex-col overflow-hidden`}
//         style={{ maxWidth: "860px", height: "calc(100vh - 74px)", maxHeight: "760px" }}
//       >
//         {/* ── Header ── */}
//         <div className={`flex items-center gap-3 px-5 py-2 border-b ${border} shrink-0`}>
//           <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/30 shrink-0">
//             <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                 d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
//             </svg>
//           </div>
//           <div className="flex-1">
//             <h2 className={`font-bold text-base ${txt}`}>Confirm Payment</h2>
//             <p className={`text-xs ${txtMuted}`}>
//               {totalQty} item{totalQty !== 1 ? "s" : ""} · {cart.length} product{cart.length !== 1 ? "s" : ""}
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             disabled={placing}
//             className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${dark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-500"
//               }`}
//           >
//             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>

//         {/* ── 2-Column Body ── */}
//         <div className="flex flex-1 overflow-hidden">

//           {/* LEFT: Order items + totals */}
//           <div className={`flex flex-col w-[340px] shrink-0 border-r ${border}`}>
//             {/* Order items — scrollable only if truly many items */}
//             <div className={`px-4 py-1.5 border-b ${border}`}>
//               <p className={`text-[11px] font-bold uppercase tracking-wide ${txtMuted}`}>Order Summary</p>
//             </div>
//             <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2" style={{ scrollbarWidth: "thin" }}>
//               {cart.map(item => (
//                 <div key={item.id} className={`rounded-xl px-3 py-2.5 border ${border} ${sectionBg}`}>
//                   <div className="flex items-start justify-between gap-2">
//                     <div className="flex-1 min-w-0">
//                       <p className={`text-sm font-semibold ${txt} truncate`}>{item.name}</p>
//                       {item.isSerialNumber && item.serialNumbers && item.serialNumbers.length > 0 && (
//                         <p className={`text-[10px] font-mono ${txtMuted} truncate mt-0.5`}>
//                           {item.serialNumbers.map(s => s.serialNo).join(", ")}
//                         </p>
//                       )}
//                       {(item.taxRate ?? 0) > 0 && (
//                         <p className="text-[10px] text-amber-400 font-semibold mt-0.5">
//                           Tax {item.taxRate}% · +${((item.taxAmount ?? 0) * item.qty).toFixed(2)}
//                         </p>
//                       )}
//                     </div>
//                     <div className="flex items-center gap-2 shrink-0">
//                       <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-bold ${dark ? "bg-slate-700 text-slate-300" : "bg-slate-200 text-slate-600"
//                         }`}>×{item.qty}</span>
//                       <span className="text-sm font-bold text-sky-500 w-16 text-right">
//                         ${(item.price * item.qty).toFixed(2)}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Totals */}
//             <div className={`border-t ${border} px-4 py-4 space-y-2.5 shrink-0`}>
//               <div className="flex justify-between text-sm items-center">
//                 <span className={txtSub}>Subtotal</span>
//                 <span className={`font-medium ${dark ? "text-slate-300" : "text-slate-700"}`}>${subtotal.toFixed(2)}</span>
//               </div>
//               <div className="flex justify-between text-sm items-center">
//                 <span className={`${txtSub} flex items-center gap-1.5`}>
//                   Tax
//                   {totalTax > 0 && (
//                     <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400">
//                       {cart.find(i => (i.taxRate ?? 0) > 0)?.taxRate ?? 0}%
//                     </span>
//                   )}
//                 </span>
//                 <span className={`font-medium ${dark ? "text-slate-300" : "text-slate-700"}`}>${totalTax.toFixed(2)}</span>
//               </div>
//               {autoDiscount > 0 && (
//                 <div className="flex justify-between text-sm items-center">
//                   <span className="flex items-center gap-1.5 text-emerald-400">
//                     <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                         d="M7 7h.01M17 17h.01M7 17l10-10M9.5 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5zm5 5a2.5 2.5 0 110 5 2.5 2.5 0 010-5z" />
//                     </svg>
//                     Auto Discount
//                     <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400">Applied</span>
//                   </span>
//                   <span className="font-medium text-emerald-400">-${autoDiscount.toFixed(2)}</span>
//                 </div>
//               )}
//               <div className="flex justify-between text-sm items-center">
//                 <span className={txtSub}>Manual Discount</span>
//                 <span className={`font-medium ${manualDiscountAmt > 0 ? "text-red-400" : dark ? "text-slate-300" : "text-slate-700"}`}>
//                   {manualDiscountAmt > 0 ? `-$${manualDiscountAmt.toFixed(2)}` : "$0.00"}
//                 </span>
//               </div>
//               <div className={`flex justify-between items-center pt-3 border-t border-dashed ${dark ? "border-slate-600" : "border-slate-300"}`}>
//                 <span className={`font-bold text-sm ${txt}`}>Total Payable</span>
//                 <span className="font-extrabold text-2xl text-blue-500">${total.toFixed(2)}</span>
//               </div>
//               {paymentMethod === 1 && cashGivenNum > 0 && (
//                 <div className={`flex justify-between items-center pt-2 border-t ${divider}`}>
//                   <span className={`text-sm font-semibold ${txtSub}`}>Change</span>
//                   <span className={`font-bold text-lg ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
//                     ${change.toFixed(2)}
//                   </span>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* RIGHT: Payment inputs */}
//           <div className="flex-1 flex flex-col overflow-hidden">
//             <div className="flex-1 px-5 py-4 space-y-4 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>

//               {/* Payment method */}
//               <div>
//                 <label className={`block text-xs font-bold uppercase tracking-wide ${txtSub} mb-2`}>
//                   Payment Method
//                 </label>
//                 <div className="grid grid-cols-2 gap-2">
//                   {PAYMENT_METHODS.map(pm => {
//                     const active = paymentMethod === pm.value;
//                     return (
//                       <button
//                         key={pm.value}
//                         onClick={() => setPaymentMethod(pm.value)}
//                         className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border-2 transition-all text-left ${active
//                           ? "border-blue-500 bg-blue-500/10 shadow-sm shadow-blue-500/20"
//                           : dark
//                             ? "border-slate-700 bg-slate-800/60 hover:border-slate-600"
//                             : "border-slate-200 bg-slate-50 hover:border-slate-300"
//                           }`}
//                       >
//                         <span className="text-xl leading-none">{pm.icon}</span>
//                         <span className={`text-sm font-semibold ${active ? (dark ? "text-blue-400" : "text-blue-600") : txt}`}>
//                           {pm.label}
//                         </span>
//                         {active && (
//                           <span className="ml-auto w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
//                             <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                             </svg>
//                           </span>
//                         )}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>

//               {/* Cash given — only for Cash */}
//               {paymentMethod === 1 && (
//                 <div>
//                   <label className={`block text-xs font-bold uppercase tracking-wide ${txtSub} mb-1.5`}>
//                     Cash Given
//                   </label>
//                   <div className="relative mb-2.5">
//                     <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold ${txtMuted}`}>$</span>
//                     <input
//                       type="number" min="0" step="0.01" placeholder="0.00"
//                       value={cashGiven} onChange={e => setCashGiven(e.target.value)}
//                       className={`${inputCls} pl-7`}
//                     />
//                   </div>
//                   <div className="grid grid-cols-3 gap-2">
//                     {[50, 100, 500, 1000, 2000, 5000].map(amount => {
//                       const isSelected = cashGiven === String(amount);
//                       return (
//                         <button
//                           key={amount}
//                           onClick={() => setCashGiven(String(amount))}
//                           className={`py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 border-2 ${isSelected
//                             ? "border-blue-500 bg-blue-500/15 text-blue-400 shadow-sm shadow-blue-500/20"
//                             : dark
//                               ? "border-slate-600 bg-slate-700 text-slate-200 hover:border-blue-500/50 hover:bg-slate-600"
//                               : "border-slate-200 bg-slate-100 text-slate-700 hover:border-blue-400/50 hover:bg-slate-200"
//                             }`}
//                         >
//                           ${amount}
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}

//               {/* Bank QR — only for Bank QR */}
//               {paymentMethod === 2 && (
//                 <div className="flex flex-col items-center gap-3">
//                   <label className={`self-start block text-xs font-bold uppercase tracking-wide ${txtSub}`}>
//                     Scan to Pay
//                   </label>
//                   <div className={`w-full rounded-2xl border-2 ${dark ? "border-slate-600 bg-slate-800/60" : "border-slate-200 bg-slate-50"} flex flex-col items-center justify-center py-2 gap-4`}>
//                     <img
//                       src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
//                       alt="Bank QR Code"
//                       className="w-35 h-35 rounded-xl border-1"
//                       style={{ background: "white", padding: "8px" }}
//                     />
//                     <div className="flex flex-col items-center gap-1">
//                       <p className={`text-xs ${txtMuted}`}>Scan with your banking app to pay</p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Manual Discount */}
//               <div>
//                 <label className={`block text-xs font-bold uppercase tracking-wide ${txtSub} mb-1.5`}>
//                   Additional Discount ($)
//                 </label>
//                 <div className="relative">
//                   <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold ${txtMuted}`}>$</span>
//                   <input
//                     type="number" min="0" step="0.01" placeholder="0.00"
//                     value={manualDiscount} onChange={e => setManualDiscount(e.target.value)}
//                     className={`${inputCls} pl-7`}
//                   />
//                 </div>
//               </div>

//               {/* Notes */}
//               <div>
//                 <label className={`block text-xs font-bold uppercase tracking-wide ${txtSub} mb-1.5`}>
//                   Notes (optional)
//                 </label>
//                 <textarea
//                   rows={3}
//                   placeholder="Add a note for this order…"
//                   value={notes}
//                   onChange={e => setNotes(e.target.value)}
//                   className={`${inputCls} resize-none`}
//                 />
//               </div>

//               {/* Error */}
//               {orderError && (
//                 <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs leading-snug">
//                   ⚠️ {orderError}
//                 </div>
//               )}
//             </div>

//             {/* Footer buttons */}
//             <div className={`flex items-center gap-3 px-5 py-3 border-t ${border} shrink-0`}>
//               <button
//                 onClick={onClose}
//                 disabled={placing}
//                 className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all ${dark
//                   ? "border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-40"
//                   : "border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
//                   }`}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => onConfirm(paymentMethod, manualDiscountAmt, notes)}
//                 disabled={placing}
//                 className={`flex-[2] py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${placing
//                   ? dark
//                     ? "bg-slate-800 text-slate-500 cursor-not-allowed"
//                     : "bg-slate-200 text-slate-400 cursor-not-allowed"
//                   : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:fromblue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 active:scale-95"
//                   }`}
//               >
//                 {placing ? (
//                   <><Spinner size="sm" /><span>Processing…</span></>
//                 ) : (
//                   <>
//                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
//                     </svg>
//                     <span>Confirm · ${total.toFixed(2)}</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// interface NearDiscountHintBannerProps {
//   hint: NearDiscountHint;
//   dark: boolean;
// }
// function NearDiscountHintBanner({ hint, dark }: NearDiscountHintBannerProps) {
//   const isProductSpecific = hint.applicableProducts.length > 0;

//   return (
//     <div
//       className={`rounded-xl border px-3 py-2.5 flex items-start gap-2.5 transition-all
//         ${dark
//           ? "bg-amber-500/8 border-amber-500/25"
//           : "bg-amber-50 border-amber-200"
//         }`}
//     >
//       {/* Icon */}
//       <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5
//         ${dark ? "bg-amber-500/20" : "bg-amber-100"}`}>
//         <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//             d="M7 7h.01M17 17h.01M7 17l10-10M9.5 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5zm5 5a2.5 2.5 0 110 5 2.5 2.5 0 010-5z" />
//         </svg>
//       </div>

//       {/* Text */}
//       <div className="flex-1 min-w-0">
//         {/* Discount name badge */}
//         <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
//           <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md
//             ${dark ? "bg-amber-500/20 text-amber-300" : "bg-amber-200 text-amber-700"}`}>
//             {hint.discountName}
//           </span>
//           {isProductSpecific && (
//             <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md
//               ${dark ? "bg-violet-500/20 text-violet-300" : "bg-violet-100 text-violet-600"}`}>
//               Selected Items Only
//             </span>
//           )}
//         </div>

//         {/* Message */}
//         <p className={`text-xs font-semibold leading-snug
//           ${dark ? "text-amber-200" : "text-amber-800"}`}>
//           {hint.message}
//         </p>

//         {/* Product list for product-specific */}
//         {isProductSpecific && hint.applicableProducts.length > 0 && (
//           <div className="flex flex-wrap gap-1 mt-1.5">
//             {hint.applicableProducts.map((name, i) => (
//               <span key={i}
//                 className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md
//                   ${dark ? "bg-slate-700 text-slate-300" : "bg-white border border-amber-200 text-slate-600"}`}>
//                 {name}
//               </span>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Amount badge */}
//       <div className={`shrink-0 text-right`}>
//         <p className={`text-xs font-extrabold ${dark ? "text-amber-300" : "text-amber-700"}`}>
//           +${hint.amountNeeded.toFixed(2)}
//         </p>
//         <p className={`text-[10px] ${dark ? "text-amber-500" : "text-amber-500"}`}>needed</p>
//       </div>
//     </div>
//   );
// }

// // ─── API Calls ────────────────────────────────────────────────────────────────
// const fetchCategories = async (
//   params: { page?: number; pageSize?: number; search?: string }
// ): Promise<PaginatedResponse<Category>> => {
//   const p: any = { Page: params.page ?? 1, PageSize: params.pageSize ?? 100 };
//   if (params.search) p.Search = params.search;
//   const res = await AxiosApi.get("Category", { params: p });
//   return res.data;
// };

// const fetchProducts = async (
//   params: { page?: number; pageSize?: number; search?: string; categoryId?: string }
// ): Promise<PaginatedResponse<Product>> => {
//   const p: any = { Page: params.page ?? 1, PageSize: params.pageSize ?? 20 };
//   if (params.search) p.Search = params.search;
//   if (params.categoryId && params.categoryId !== "0") p.CategoryId = params.categoryId;
//   const res = await AxiosApi.get("Product/Sale-POS", { params: p });
//   return res.data;
// };

// // NEW: Fetch order summary for discount calculation + near-miss hints
// const fetchOrderSummary = async (cart: CartItem[]): Promise<OrderSummaryResponse | null> => {
//   if (cart.length === 0) return null;
//   const payload = {
//     items: cart.flatMap(item => {
//       if (item.isSerialNumber && item.serialNumbers && item.serialNumbers.length > 0) {
//         // Serial number items: one entry per serial
//         return item.serialNumbers.map(() => ({
//           productId: item.id,
//           quantity: 1,
//           unitPrice: item.price,
//         }));
//       }
//       return [{
//         productId: item.id,
//         quantity: item.qty,
//         unitPrice: item.price,
//       }];
//     }),
//   };
//   const res = await AxiosApi.post("Order/summary", payload);
//   return res.data?.data ?? null;
// };

// // ─── Constants ────────────────────────────────────────────────────────────────
// const PLACEHOLDER_LIGHT = "https://placehold.co/300x300/e2e8f0/94a3b8?text=No+Image";
// const PLACEHOLDER_DARK = "https://placehold.co/300x300/1e293b/475569?text=No+Image";
// const PAGE_SIZE = 20;

// const WARRANTY_OPTIONS = [
//   { label: "No warranty", months: 0 },
//   { label: "1 month", months: 1 },
//   { label: "3 months", months: 3 },
//   { label: "6 months", months: 6 },
//   { label: "1 year", months: 12 },
//   { label: "2 years", months: 24 },
// ];

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// const todayISO = () => new Date().toISOString().split("T")[0];

// const addMonths = (dateStr: string, months: number): string => {
//   if (!months || !dateStr) return "";
//   const d = new Date(dateStr);
//   d.setMonth(d.getMonth() + months);
//   return d.toISOString().split("T")[0];
// };

// const formatDate = (iso: string) =>
//   iso ? new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";

// // ─── Main Component ───────────────────────────────────────────────────────────
// export default function PosShop() {
//   const { darkLight } = useGlobleContextDarklight();
//   const dark = darkLight;

//   const [categories, setCategories] = useState<Category[]>([]);
//   const [activeTab, setActiveTab] = useState<string>("0");

//   useEffect(() => {
//     fetchCategories({})
//       .then(res => setCategories(res?.data ?? []))
//       .catch(console.error);
//   }, []);

//   const [search, setSearch] = useState<string>("");
//   const [debouncedSearch, setDebouncedSearch] = useState<string>("");
//   const [products, setProducts] = useState<Product[]>([]);
//   const [page, setPage] = useState<number>(1);
//   const [hasMore, setHasMore] = useState<boolean>(true);
//   const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
//   const [loadingMore, setLoadingMore] = useState<boolean>(false);
//   const [callListProduct, setCallListProduct] = useState(false);

//   useEffect(() => {
//     const t = setTimeout(() => setDebouncedSearch(search), 400);
//     return () => clearTimeout(t);
//   }, [search]);

//   useEffect(() => {
//     setProducts([]);
//     setPage(1);
//     setHasMore(true);
//   }, [activeTab, debouncedSearch]);

//   useEffect(() => {
//     let cancelled = false;
//     const load = async () => {
//       if (page === 1) setLoadingProducts(true);
//       else setLoadingMore(true);
//       try {
//         const res = await fetchProducts({
//           page, pageSize: PAGE_SIZE,
//           search: debouncedSearch,
//           categoryId: activeTab,
//         });
//         if (!cancelled) {
//           const data = res?.data ?? [];
//           setProducts(prev => page === 1 ? data : [...prev, ...data]);
//           setHasMore(res.hasNext ?? data.length === PAGE_SIZE);
//         }
//       } catch (err) {
//         console.error(err);
//       } finally {
//         if (!cancelled) { setLoadingProducts(false); setLoadingMore(false); }
//       }
//     };
//     load();
//     return () => { cancelled = true; };
//   }, [page, activeTab, debouncedSearch, callListProduct]);

//   const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
//     const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
//     if (scrollHeight - scrollTop - clientHeight < 150 && hasMore && !loadingMore && !loadingProducts) {
//       setPage(p => p + 1);
//     }
//   }, [hasMore, loadingMore, loadingProducts]);

//   const [cart, setCart] = useState<CartItem[]>([]);
//   const [serialModal, setSerialModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
//   const [paymentModal, setPaymentModal] = useState<boolean>(false);
//   const [placingOrder, setPlacingOrder] = useState(false);
//   const [orderError, setOrderError] = useState<string | null>(null);

//   // ── NEW: Order Summary State ─────────────────────────────────────────────
//   const [summaryData, setSummaryData] = useState<OrderSummaryResponse | null>(null);
//   const [summaryLoading, setSummaryLoading] = useState(false);
//   const summaryDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   // Fetch summary whenever cart changes (debounced 500ms)
//   useEffect(() => {
//     if (summaryDebounceRef.current) clearTimeout(summaryDebounceRef.current);

//     if (cart.length === 0) {
//       setSummaryData(null);
//       return;
//     }

//     summaryDebounceRef.current = setTimeout(async () => {
//       setSummaryLoading(true);
//       try {
//         const data = await fetchOrderSummary(cart);
//         setSummaryData(data);
//       } catch (err) {
//         console.error("Summary fetch failed:", err);
//         setSummaryData(null);
//       } finally {
//         setSummaryLoading(false);
//       }
//     }, 500);

//     return () => {
//       if (summaryDebounceRef.current) clearTimeout(summaryDebounceRef.current);
//     };
//   }, [cart]);

//   const addToCart = useCallback((product: Product) => {
//     if (product.isSerialNumber) {
//       setSerialModal({ open: true, product });
//       return;
//     }
//     setCart(prev => {
//       const ex = prev.find(i => i.id === product.id);
//       if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
//       return [...prev, { ...product, qty: 1 }];
//     });
//   }, []);

//   const handleSerialConfirm = useCallback((
//     product: Product,
//     serials: SelectedSerial[],
//     warrantyMonths: number,
//     warrantyStart: string,
//     warrantyEnd: string
//   ) => {
//     if (serials.length === 0) return;
//     setCart(prev => {
//       const ex = prev.find(i => i.id === product.id);
//       if (ex) {
//         const existingIds = new Set((ex.serialNumbers ?? []).map(s => s.id));
//         const merged = [...(ex.serialNumbers ?? []), ...serials.filter(s => !existingIds.has(s.id))];
//         return prev.map(i =>
//           i.id === product.id
//             ? { ...i, qty: merged.length, serialNumbers: merged, warrantyMonths, warrantyStart, warrantyEnd }
//             : i
//         );
//       }
//       return [...prev, { ...product, qty: serials.length, serialNumbers: serials, warrantyMonths, warrantyStart, warrantyEnd }];
//     });
//     setSerialModal({ open: false, product: null });
//   }, []);

//   const changeQty = useCallback((id: number, delta: number) => {
//     setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
//   }, []);

//   const removeItem = useCallback((id: number) => {
//     setCart(prev => prev.filter(i => i.id !== id));
//   }, []);

//   const clearCart = () => {
//     setCart([]);
//     setSummaryData(null);
//   };

//   // Use summary API values when available, otherwise fall back to local calc
//   const subtotal = summaryData?.subTotal ?? cart.reduce((s, i) => s + i.price * i.qty, 0);
//   const totalTax = summaryData?.totalTax ?? cart.reduce((s, i) => s + (i.taxAmount ?? 0) * i.qty, 0);
//   const autoDiscount = summaryData?.totalDiscount ?? 0;
//   const totalPayable = summaryData?.totalPayable ?? (subtotal + totalTax - autoDiscount);
//   const totalQty = cart.reduce((s, i) => s + i.qty, 0);
//   const nearHints = summaryData?.nearDiscountHints ?? [];

//   const openPaymentModal = () => {
//     if (cart.length === 0) return;
//     setOrderError(null);
//     setPaymentModal(true);
//   };

//   const handlePlaceOrder = async (paymentMethod: number, manualDiscountAmount: number, notes: string) => {
//     if (cart.length === 0 || placingOrder) return;
//     setOrderError(null);
//     setPlacingOrder(true);

//     const payload: PlaceOrderPayload = {
//       customerId: 0,
//       saleType: 1,
//       paymentStatus: 2,
//       status: 3,
//       paymentMethod,
//       // Send manual discount only; server re-calculates auto discount
//       discountAmount: Number(manualDiscountAmount?.toFixed(2)) ?? 0.00,
//       notes: notes ?? "",
//       items: cart.map(item => {
//         if (item.isSerialNumber && item.serialNumbers && item.serialNumbers.length > 0) {
//           return {
//             productId: item.id,
//             serialNumberIds: item.serialNumbers.map(s => Number(s.id)),
//             unitPrice: item.price,
//             warrantyMonths: item.warrantyMonths && item.warrantyMonths > 0
//               ? item.warrantyMonths
//               : undefined,
//           } satisfies PlaceOrderItemPayload;
//         }
//         return {
//           productId: item.id,
//           quantity: item.qty,
//           unitPrice: item.price,
//         } satisfies PlaceOrderItemPayload;
//       }),
//     };

//     try {
//       const res = await AxiosApi.post("Order", payload);
//       if (res?.data?.data) {
//         alertify.success("payment success");
//         clearCart();
//         setPaymentModal(false);
//         setCallListProduct(!callListProduct);
//       }
//     } catch (err: any) {
//       const msg = err?.response?.data?.message || err?.response?.data?.errors?.join(", ") || "Failed to place order. Please try again.";
//       setOrderError(msg);
//       alertError(msg);
//       console.error("❌ Order failed:", err);
//     } finally {
//       setPlacingOrder(false);
//     }
//   };

//   const allTabs = [
//     { id: "0", name: "All", image: null as string | null },
//     ...categories.map(c => ({ id: String(c.id), name: c.name, image: c.image ?? null })),
//   ];

//   // ─── Theme ────────────────────────────────────────────────────────────────
//   const bg = dark ? "bg-[#0f172a]" : "bg-[#f1f5f9]";
//   const sidebarBg = dark ? "bg-[#1e293b]" : "bg-white";
//   const panelBg = dark ? "bg-[#1e293b]" : "bg-white";
//   const productBg = dark ? "bg-[#1e293b]" : "bg-white";
//   const borderColor = dark ? "border-slate-700/60" : "border-slate-200";
//   const textPrimary = dark ? "text-slate-100" : "text-slate-900";
//   const textSub = dark ? "text-slate-400" : "text-slate-500";
//   const textMuted = dark ? "text-slate-500" : "text-slate-400";
//   const inputBg = dark ? "bg-slate-800/80" : "bg-slate-100";
//   const rowBg = dark ? "bg-slate-800" : "bg-slate-50 border border-slate-200";
//   const scrollStyle = dark ? "#334155 transparent" : "#cbd5e0 transparent";
//   const imgFallback = dark ? PLACEHOLDER_DARK : PLACEHOLDER_LIGHT;

//   const existingCartItem = cart.find(i => i.id === serialModal.product?.id);

//   return (
//     <>
//       {serialModal.open && serialModal.product && (
//         <SerialNumberModal
//           product={serialModal.product}
//           dark={dark}
//           existingSerials={cart.find(i => i.id === serialModal.product!.id)?.serialNumbers}
//           existingWarrantyMonths={existingCartItem?.warrantyMonths ?? 0}
//           existingWarrantyStart={existingCartItem?.warrantyStart}
//           onConfirm={handleSerialConfirm}
//           onClose={() => setSerialModal({ open: false, product: null })}
//         />
//       )}

//       {paymentModal && (
//         <PaymentModal
//           dark={dark}
//           cart={cart}
//           subtotal={subtotal}
//           totalTax={totalTax}
//           autoDiscount={autoDiscount}
//           onConfirm={handlePlaceOrder}
//           onClose={() => { if (!placingOrder) { setPaymentModal(false); setOrderError(null); } }}
//           placing={placingOrder}
//           orderError={orderError}
//         />
//       )}

//       <div
//         className={`flex ${bg} ${textPrimary} overflow-hidden transition-colors duration-300`}
//         style={{ height: "calc(100vh - 80px)" }}
//       >
//         {/* ── Category sidebar ── */}
//         <div className={`w-[104px] shrink-0 flex flex-col overflow-hidden ${sidebarBg} border-r ${borderColor} transition-colors duration-300`}>
//           <div className="flex-1 overflow-y-auto py-2 px-2 flex flex-col gap-1.5" style={{ scrollbarWidth: "none" }}>
//             {allTabs.map(cat => {
//               const isActive = activeTab === cat.id;
//               return (
//                 <button key={cat.id} onClick={() => setActiveTab(cat.id)}
//                   className={`w-full flex flex-col items-center gap-1.5 p-1.5 rounded-xl transition-all duration-200
//                     ${isActive
//                       ? dark ? "bg-blue-600/20 ring-2 ring-blue-500/50" : "bg-blue-50 ring-2 ring-blue-400/50"
//                       : dark ? "hover:bg-slate-700/60" : "hover:bg-slate-100"
//                     }`}
//                 >
//                   <div className={`w-[68px] h-[68px] rounded-xl overflow-hidden shrink-0 flex items-center justify-center transition-all duration-200
//                     ${isActive
//                       ? "ring-2 ring-blue-500 shadow-lg shadow-blue-500/20"
//                       : dark ? "bg-slate-700/80 ring-1 ring-slate-600/50" : "bg-slate-100 ring-1 ring-slate-200"
//                     }`}
//                   >
//                     {cat.id === "0" ? (
//                       <svg className={`w-8 h-8 ${isActive ? "text-blue-400" : textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
//                           d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
//                       </svg>
//                     ) : cat.image ? (
//                       <img src={cat.image} alt={cat.name} className="w-full h-full object-cover"
//                         onError={e => { (e.target as HTMLImageElement).src = imgFallback; }} />
//                     ) : (
//                       <svg className={`w-7 h-7 ${isActive ? "text-blue-400" : textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3}
//                           d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
//                       </svg>
//                     )}
//                   </div>
//                   <span className={`text-[11px] font-semibold text-center leading-tight w-full truncate
//                     ${isActive ? (dark ? "text-blue-400" : "text-blue-600") : textSub}`}>
//                     {cat.name}
//                   </span>
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* ── Product list ── */}
//         <div className={`flex flex-col flex-1 overflow-hidden border-r ${borderColor} transition-colors duration-300`}>
//           <div className={`flex items-center gap-3 px-4 py-2 ${panelBg} border-b ${borderColor}`}>
//             <span className={`text-2xl font-black tracking-wider drop-shadow-sm ${dark ? "text-white" : "text-blue-900"}`}>
//               WELCOME SOKHA <span className="text-yellow-500">SK</span>
//             </span>
//             <div className={`ml-auto flex items-center gap-2 w-[250px] px-3 py-2 rounded-xl ${inputBg}`}>
//               <svg className={`w-4 h-4 ${textMuted} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
//               </svg>
//               <input
//                 className={`flex-1 bg-transparent text-sm ${textPrimary} placeholder-slate-400 outline-none`}
//                 placeholder="Search Product..."
//                 value={search}
//                 onChange={e => setSearch(e.target.value)}
//               />
//               {search && (
//                 <button className={`${textMuted} hover:text-red-400 transition-colors text-sm`} onClick={() => setSearch("")}>✕</button>
//               )}
//             </div>
//           </div>

//           <div
//             className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5"
//             style={{ scrollbarWidth: "thin", scrollbarColor: scrollStyle }}
//             onScroll={handleScroll}
//           >
//             {loadingProducts ? (
//               <div className="flex flex-col items-center justify-center h-full gap-3">
//                 <Spinner size="lg" />
//                 <p className={`${textMuted} text-sm`}>Loading products…</p>
//               </div>
//             ) : products.length === 0 ? (
//               <div className="flex flex-col items-center justify-center h-full gap-2">
//                 <span className="text-5xl">📦</span>
//                 <p className={`${textMuted} text-sm font-medium`}>No products found</p>
//               </div>
//             ) : (
//               <>
//                 {products.map(p => (
//                   <ProductRow
//                     key={p.id}
//                     product={p}
//                     cartItem={cart.find(i => i.id === p.id)}
//                     onAdd={addToCart}
//                     dark={dark}
//                     productBg={productBg}
//                     borderColor={borderColor}
//                     textPrimary={textPrimary}
//                     textSub={textSub}
//                     textMuted={textMuted}
//                     imgFallback={imgFallback}
//                   />
//                 ))}
//                 {loadingMore && (
//                   <div className={`flex items-center justify-center gap-3 py-5 mx-2 rounded-2xl ${dark ? "bg-slate-800/60" : "bg-slate-100/80"}`}>
//                     <Spinner size="sm" />
//                     <span className={`${textMuted} text-sm font-medium`}>Loading more products…</span>
//                   </div>
//                 )}
//                 {!hasMore && !loadingMore && products.length > 0 && (
//                   <div className="flex items-center justify-center gap-3 py-4">
//                     <div className={`h-px flex-1 ${dark ? "bg-slate-700" : "bg-slate-200"}`} />
//                     <span className={`${textMuted} text-xs font-medium px-2`}>No more products</span>
//                     <div className={`h-px flex-1 ${dark ? "bg-slate-700" : "bg-slate-200"}`} />
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </div>

//         {/* ── Order panel ── */}
//         <div className={`w-80 xl:w-96 flex flex-col overflow-hidden ${panelBg} shrink-0 transition-colors duration-300`}>
//           {/* Header */}
//           <div className={`flex items-center gap-2.5 px-4 py-3.5 border-b ${borderColor} shrink-0`}>
//             <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                 d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//             </svg>
//             <h2 className={`font-bold text-base flex-1 ${textPrimary}`}>Order Details</h2>
//             {totalQty > 0 && (
//               <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">{totalQty}</span>
//             )}
//             {/* Summary loading spinner */}
//             {summaryLoading && <Spinner size="sm" />}
//             {cart.length > 0 && (
//               <button onClick={clearCart} title="Clear cart" className={`${textMuted} hover:text-red-400 transition-colors ml-1`}>
//                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                     d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                 </svg>
//               </button>
//             )}
//           </div>

//           {/* Cart items */}
//           <div
//             className="flex-1 overflow-y-auto px-3 py-3 space-y-2"
//             style={{ scrollbarWidth: "thin", scrollbarColor: scrollStyle }}
//           >
//             {cart.length === 0 ? (
//               <div className="flex flex-col items-center justify-center h-full gap-3 pb-10">
//                 <div className={`w-16 h-16 rounded-full ${dark ? "bg-slate-800" : "bg-slate-100"} flex items-center justify-center`}>
//                   <svg className={`w-8 h-8 ${textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
//                       d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
//                   </svg>
//                 </div>
//                 <p className={`${textMuted} text-sm font-medium`}>No items selected</p>
//                 <p className={`${textMuted} text-xs text-center px-6`}>Click on a product to add it to the order</p>
//               </div>
//             ) : (
//               <>
//                 {cart.map(item => (
//                   <CartRow
//                     key={item.id}
//                     item={item}
//                     onInc={() => changeQty(item.id, 1)}
//                     onDec={() => changeQty(item.id, -1)}
//                     onRemove={() => removeItem(item.id)}
//                     dark={dark}
//                     rowBg={rowBg}
//                     textPrimary={textPrimary}
//                     textMuted={textMuted}
//                   />
//                 ))}

//                 {/* ── Near Discount Hints ── */}
//                 {nearHints.length > 0 && (
//                   <div className="pt-1 space-y-2">
//                     {/* Section label */}
//                     <div className="flex items-center gap-2 px-1">
//                       <div className={`h-px flex-1 ${dark ? "bg-amber-500/20" : "bg-amber-200"}`} />
//                       <span className={`text-[10px] font-bold uppercase tracking-wide
//                         ${dark ? "text-amber-400" : "text-amber-600"}`}>
//                         💡 Unlock Discounts
//                       </span>
//                       <div className={`h-px flex-1 ${dark ? "bg-amber-500/20" : "bg-amber-200"}`} />
//                     </div>
//                     {nearHints.map((hint, idx) => (
//                       <NearDiscountHintBanner key={idx} hint={hint} dark={dark} />
//                     ))}
//                   </div>
//                 )}
//               </>
//             )}
//           </div>

//           {/* Totals footer */}
//           <div className={`border-t ${borderColor} px-4 py-3 space-y-2 shrink-0`}>
//             <div className="flex justify-between text-sm">
//               <span className={textSub}>Subtotal</span>
//               <span className={dark ? "text-slate-300" : "text-slate-600"}>${subtotal.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between text-sm">
//               <span className={textSub}>Tax</span>
//               <span className={dark ? "text-slate-300" : "text-slate-600"}>${totalTax.toFixed(2)}</span>
//             </div>
//             {/* Auto Discount — shown when API returns a discount */}
//             {autoDiscount > 0 ? (
//               <div className="flex justify-between text-sm items-center">
//                 <span className="flex items-center gap-1.5 text-emerald-400">
//                   <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                       d="M7 7h.01M17 17h.01M7 17l10-10M9.5 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5zm5 5a2.5 2.5 0 110 5 2.5 2.5 0 010-5z" />
//                   </svg>
//                   Discount
//                   <span className="text-[10px] font-bold px-1 py-0.5 rounded bg-emerald-500/15 text-emerald-400">Auto</span>
//                 </span>
//                 <span className="text-emerald-400 font-semibold">-${autoDiscount.toFixed(2)}</span>
//               </div>
//             ) : (
//               <div className="flex justify-between text-sm">
//                 <span className={textSub}>Discount</span>
//                 <span className={dark ? "text-slate-300" : "text-slate-600"}>$0.00</span>
//               </div>
//             )}
//             <div className={`flex justify-between items-center pt-2 border-t border-dashed ${dark ? "border-slate-700" : "border-slate-300"}`}>
//               <span className={`font-bold ${textPrimary}`}>Total Payable</span>
//               <span className="font-bold text-lg text-blue-500">${totalPayable.toFixed(2)}</span>
//             </div>
//           </div>

//           {/* Place order button */}
//           <div className="px-4 pb-5 shrink-0">
//             <button
//               disabled={cart.length === 0}
//               onClick={openPaymentModal}
//               className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-150 flex items-center justify-center gap-2 ${cart.length === 0
//                 ? dark ? "bg-slate-800 text-slate-600 cursor-not-allowed" : "bg-slate-200 text-slate-400 cursor-not-allowed"
//                 : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 active:scale-95"
//                 }`}
//             >
//               {cart.length === 0 ? (
//                 "No Items Selected"
//               ) : (
//                 <>
//                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                       d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
//                   </svg>
//                   {`Place Order · $${totalPayable.toFixed(2)}`}
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// // ─── Serial Number Modal ──────────────────────────────────────────────────────
// function SerialNumberModal({ product, dark, existingSerials = [], existingWarrantyMonths = 0, existingWarrantyStart, onConfirm, onClose }: SerialNumberModalProps) {
//   const [selectedSerials, setSelectedSerials] = useState<MultiValue>(
//     existingSerials.map(s => ({ id: s.id, name: s.serialNo, value: s.id, data: s.data ?? null }))
//   );
//   const [warrantyMonths, setWarrantyMonths] = useState<number>(existingWarrantyMonths);
//   const [warrantyInput, setWarrantyInput] = useState<string>(existingWarrantyMonths > 0 ? String(existingWarrantyMonths) : "");
//   const [warrantyStart, setWarrantyStart] = useState<string>(existingWarrantyStart ?? todayISO());

//   const warrantyEnd = warrantyMonths > 0 ? addMonths(warrantyStart, warrantyMonths) : "";

//   const overlay = dark ? "bg-black/70" : "bg-black/50";
//   const modal = dark ? "bg-[#1e293b]" : "bg-white";
//   const border = dark ? "border-slate-700" : "border-slate-200";
//   const txt = dark ? "text-slate-100" : "text-slate-900";
//   const txtSub = dark ? "text-slate-400" : "text-slate-500";
//   const txtMuted = dark ? "text-slate-500" : "text-slate-400";
//   const inputCls = `w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${dark
//     ? "bg-slate-800 border-slate-600 text-slate-100 focus:border-blue-500"
//     : "bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-400"
//     }`;
//   const chipBase = `px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer select-none`;

//   const handleConfirm = () => {
//     const serials: SelectedSerial[] = selectedSerials.map(s => ({
//       id: s.id,
//       serialNo: s.name,
//       data: s.data as SerialNumberItem | null,
//     }));
//     onConfirm(product, serials, warrantyMonths, warrantyStart, warrantyEnd);
//   };

//   const handleChipClick = (months: number) => {
//     setWarrantyMonths(months);
//     setWarrantyInput(months === 0 ? "" : String(months));
//   };

//   const handleWarrantyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const raw = e.target.value;
//     setWarrantyInput(raw);
//     const parsed = parseInt(raw, 10);
//     if (!isNaN(parsed) && parsed >= 0) {
//       setWarrantyMonths(parsed);
//     } else if (raw === "") {
//       setWarrantyMonths(0);
//     }
//   };

//   const serialEndpoint = `SerialNumber?ProductId=${product.id}&Status=Available`;

//   return (
//     <div
//       className={`fixed inset-0 z-50 flex items-center justify-center mt-15 ${overlay} backdrop-blur-sm`}
//       onClick={e => { if (e.target === e.currentTarget) onClose(); }}
//     >
//       <div
//         className={`${modal} rounded-2xl border ${border} w-full max-w-xl mx-4 shadow-2xl flex flex-col overflow-hidden`}
//         style={{ maxHeight: "90vh" }}
//       >
//         {/* ── Header ── */}
//         <div className={`flex items-start gap-3 px-5 py-4 border-b ${border} shrink-0`}>
//           <div className="flex-1 min-w-0">
//             <div className="flex items-center gap-2 mb-0.5">
//               <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-400">Serial Number</span>
//             </div>
//             <h3 className={`font-bold text-base ${txt} truncate`}>{product.name}</h3>
//             {product.sku && <p className={`text-xs font-mono ${txtMuted} mt-0.5`}>SKU: {product.sku}</p>}
//           </div>
//           <button onClick={onClose}
//             className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${dark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-500"} transition-colors`}>
//             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>

//         {/* ── Body ── */}
//         <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

//           {/* Serial Numbers */}
//           <div>
//             <label className={`block text-xs font-semibold ${txtSub} mb-2 uppercase tracking-wide`}>
//               Select Serial Numbers <span className="text-blue-400 normal-case font-normal">(multiple)</span>
//             </label>
//             <XSelectSearch
//               multiple={true}
//               value={selectedSerials}
//               onChange={(val) => setSelectedSerials(val as MultiValue)}
//               placeholder="Search or select serial numbers…"
//               selectOption={{
//                 id: "id",
//                 name: "serialNo",
//                 value: "id",
//                 apiEndpoint: serialEndpoint,
//                 pageSize: 50,
//                 searchParam: "Search",
//               }}
//               isSearchable={true}
//               clearable={true}
//               noOptionsMessage="No available serial numbers"
//             />
//           </div>

//           {/* Warranty Period — always visible */}
//           <div>
//             <label className={`block text-xs font-semibold ${txtSub} mb-2 uppercase tracking-wide`}>Warranty Period</label>

//             {/* Quick-pick chips */}
//             <div className="grid grid-cols-6 gap-2 mb-3">
//               {WARRANTY_OPTIONS.map(opt => {
//                 const active = warrantyMonths === opt.months;
//                 return (
//                   <button key={opt.months} onClick={() => handleChipClick(opt.months)}
//                     className={`${chipBase} w-full text-center ${active
//                       ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/30"
//                       : dark
//                         ? "bg-slate-800 border-slate-600 text-slate-300 hover:border-blue-500/60"
//                         : "bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-400/60"
//                       }`}>
//                     {opt.label}
//                   </button>
//                 );
//               })}
//             </div>

//             {/* Manual month input */}
//             <div className="flex items-center gap-2">
//               <div className="relative flex-1">
//                 <input
//                   type="number"
//                   min={0}
//                   value={warrantyInput}
//                   onChange={handleWarrantyInputChange}
//                   placeholder="Or type months (e.g. 18)"
//                   className={inputCls}
//                 />
//                 <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none ${txtMuted}`}>
//                   months
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Warranty Dates — always visible */}
//           <div>
//             <label className={`block text-xs font-semibold ${txtSub} mb-2 uppercase tracking-wide`}>Warranty Dates</label>
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <p className={`text-[11px] ${txtMuted} mb-1`}>Start date</p>
//                 <input
//                   type="date"
//                   value={warrantyStart}
//                   onChange={e => setWarrantyStart(e.target.value)}
//                   className={inputCls}
//                 />
//               </div>
//               <div>
//                 <p className={`text-[11px] ${txtMuted} mb-1`}>
//                   End date <span className="text-blue-400">(auto)</span>
//                 </p>
//                 <div className={`w-full px-3 py-2 rounded-lg border text-sm font-medium ${warrantyMonths > 0
//                   ? dark
//                     ? "bg-slate-900/60 border-slate-700 text-blue-400"
//                     : "bg-blue-50 border-blue-100 text-blue-600"
//                   : dark
//                     ? "bg-slate-900/40 border-slate-700 text-slate-600"
//                     : "bg-slate-50 border-slate-200 text-slate-400"
//                   }`}>
//                   {warrantyMonths > 0 ? formatDate(warrantyEnd) : "—"}
//                 </div>
//               </div>
//             </div>
//           </div>

//         </div>

//         {/* ── Footer ── */}
//         <div className={`flex items-center gap-3 px-5 py-4 border-t ${border} shrink-0`}>
//           <button onClick={onClose}
//             className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${dark
//               ? "border-slate-600 text-slate-300 hover:bg-slate-700"
//               : "border-slate-200 text-slate-600 hover:bg-slate-50"
//               }`}>
//             Cancel
//           </button>
//           <button onClick={handleConfirm} disabled={selectedSerials.length === 0}
//             className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedSerials.length === 0
//               ? dark ? "bg-slate-800 text-slate-600 cursor-not-allowed" : "bg-slate-100 text-slate-400 cursor-not-allowed"
//               : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/25 active:scale-95"
//               }`}>
//             {selectedSerials.length === 0
//               ? "Select serials"
//               : `Add ${selectedSerials.length} item${selectedSerials.length > 1 ? "s" : ""} · $${(product.price * selectedSerials.length).toFixed(2)}`
//             }
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Product Row ──────────────────────────────────────────────────────────────
// function ProductRow({
//   product, cartItem, onAdd, dark,
//   productBg, borderColor, textPrimary, textSub, textMuted, imgFallback,
// }: ProductRowProps) {
//   const outOfStock = (product.stock ?? 0) <= 0;
//   const productName = product.name || "—";
//   const productPrice = isNaN(Number(product.price)) ? 0 : Number(product.price);
//   const productStock = product.stock ?? 0;

//   return (
//     <div
//       onClick={() => !outOfStock && onAdd(product)}
//       style={{ minHeight: "110px" }}
//       className={`flex items-stretch rounded-2xl overflow-hidden border transition-all duration-200 select-none
//         ${outOfStock ? "cursor-not-allowed" : "cursor-pointer"}
//         ${productBg} ${borderColor}
//         ${cartItem
//           ? "ring-2 ring-blue-500 border-blue-500/40 shadow-md shadow-blue-500/10"
//           : dark
//             ? "hover:border-slate-600 hover:shadow-lg hover:shadow-black/20"
//             : "hover:border-slate-300 hover:shadow-md hover:shadow-black/5"
//         }
//         ${outOfStock ? "opacity-60" : ""}
//       `}
//     >
//       <div className={`relative w-[130px] shrink-0 ${dark ? "bg-slate-800" : "bg-slate-100"}`} style={{ minHeight: "110px" }}>
//         <img
//           src={product.imageProduct || imgFallback}
//           alt={productName}
//           className="w-full h-full object-cover"
//           style={{ minHeight: "110px", maxHeight: "130px" }}
//           onError={e => { (e.target as HTMLImageElement).src = imgFallback; }}
//         />
//         {cartItem && (
//           <span className="absolute top-2 left-2 bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md">
//             ×{cartItem.qty}
//           </span>
//         )}
//         {product.isSerialNumber && (
//           <span className={`absolute bottom-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${dark ? "bg-violet-900/80 text-violet-300" : "bg-violet-100 text-violet-700"
//             }`}>S/N</span>
//         )}
//         {outOfStock && (
//           <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
//             <span className="text-[11px] font-bold text-white bg-red-500/90 px-2 py-1 rounded-lg">Out of Stock</span>
//           </div>
//         )}
//       </div>

//       <div className="flex-1 px-4 py-3 flex flex-col justify-between min-w-0">
//         <div>
//           {product.category?.name && (
//             <p className={`text-[11px] font-medium ${textMuted} mb-0.5`}>{product.category.name}</p>
//           )}
//           <p className={`text-sm font-bold ${textPrimary} leading-snug line-clamp-2`}>{productName}</p>
//           {product.sku && (
//             <p className={`text-[11px] ${textMuted} mt-0.5 font-mono`}>{product.sku}</p>
//           )}
//         </div>
//         <div className="flex items-center justify-between mt-2 gap-2">
//           <div className="flex items-center gap-1.5 flex-wrap">
//             <span className="text-base font-extrabold text-sky-500">${productPrice.toFixed(2)}</span>
//             {(product.taxRate ?? 0) > 0 && (
//               <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400">
//                 +{product.taxRate}% tax
//               </span>
//             )}
//           </div>
//           <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${productStock > 0
//             ? dark ? "bg-emerald-900/50 text-emerald-400" : "bg-emerald-100 text-emerald-700"
//             : dark ? "bg-red-900/50 text-red-400" : "bg-red-100 text-red-600"
//             }`}>
//             {productStock > 0 ? productStock : "0"}
//           </span>
//         </div>
//       </div>

//       <div className={`w-8 shrink-0 flex items-center justify-center ${cartItem ? "text-blue-400" : dark ? "text-slate-700" : "text-slate-200"}`}>
//         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
//         </svg>
//       </div>
//     </div>
//   );
// }

// // ─── Cart Row ─────────────────────────────────────────────────────────────────
// function CartRow({ item, onInc, onDec, onRemove, dark, rowBg, textPrimary, textMuted }: CartRowProps) {
//   const btnBase = dark ? "bg-slate-700 hover:bg-slate-600 text-slate-200" : "bg-slate-200 hover:bg-slate-300 text-slate-700";

//   return (
//     <div className={`${rowBg} rounded-xl px-3 py-2.5 transition-colors duration-200`}>
//       <div className="flex items-center gap-3">
//         <div className="flex-1 min-w-0">
//           <p className={`text-sm font-semibold ${textPrimary} truncate`}>{item.name}</p>
//           <p className="text-xs font-bold text-sky-500 mt-0.5">
//             ${(item.price * item.qty).toFixed(2)}
//             <span className={`${textMuted} font-normal ml-1 text-[11px]`}>
//               (${Number(item.price).toFixed(2)} × {item.qty})
//             </span>
//           </p>
//         </div>
//         <div className="flex items-center gap-1 shrink-0">
//           {!item.isSerialNumber && (
//             <>
//               <button onClick={onDec}
//                 className={`w-7 h-7 rounded-lg ${btnBase} font-bold text-lg flex items-center justify-center transition-colors leading-none`}>−</button>
//               <span className={`w-7 text-center text-sm font-bold ${textPrimary} select-none`}>{item.qty}</span>
//               <button onClick={onInc}
//                 className={`w-7 h-7 rounded-lg ${dark
//                   ? "bg-slate-700 hover:bg-blue-600 text-slate-200"
//                   : "bg-slate-200 hover:bg-blue-500 hover:text-white text-slate-700"
//                   } font-bold text-lg flex items-center justify-center transition-colors leading-none`}>+</button>
//             </>
//           )}
//           {item.isSerialNumber && (
//             <span className={`text-xs font-bold px-2 py-1 rounded-lg ${dark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
//               ×{item.qty}
//             </span>
//           )}
//           <button onClick={onRemove}
//             className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ml-0.5 ${dark
//               ? "bg-slate-700 hover:bg-red-600 text-slate-400 hover:text-white"
//               : "bg-slate-200 hover:bg-red-500 text-slate-500 hover:text-white"
//               }`}>
//             <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>
//       </div>

//       {item.isSerialNumber && item.serialNumbers && item.serialNumbers.length > 0 && (
//         <div className={`mt-2 pt-2 border-t ${dark ? "border-slate-700" : "border-slate-200"}`}>
//           <div className="flex flex-wrap gap-1">
//             {item.serialNumbers.map(s => (
//               <span key={s.id} className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${dark ? "bg-violet-900/50 text-violet-300" : "bg-violet-50 text-violet-700"
//                 }`}>
//                 {s.serialNo}
//               </span>
//             ))}
//           </div>
//           {item.warrantyMonths && item.warrantyMonths > 0 ? (
//             <p className={`text-[10px] ${dark ? "text-slate-500" : "text-slate-400"} mt-1`}>
//               Warranty: {item.warrantyMonths}mo · {formatDate(item.warrantyStart!)} → {formatDate(item.warrantyEnd!)}
//             </p>
//           ) : <p className={`text-[10px] ${dark ? "text-slate-500" : "text-slate-400"} mt-1`}>
//             Warranty: 0 Month
//           </p>}
//         </div>
//       )}
//     </div>
//   );
// }

// // ─── Spinner ──────────────────────────────────────────────────────────────────
// function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
//   const cls = size === "sm" ? "w-5 h-5 border-2" : size === "lg" ? "w-9 h-9 border-[3px]" : "w-7 h-7 border-2";
//   return <div className={`${cls} rounded-full border-slate-300 border-t-blue-500 animate-spin`} />;
// }

import { useState, useEffect, useCallback, useRef } from "react";
import { useGlobleContextDarklight } from "../../AllContext/context";
import { AxiosApi } from "../../component/Axios/Axios";
import XSelectSearch, { MultiValue } from "../../component/XSelectSearch/Xselectsearch";
import { alertError } from "../../HtmlHelper/Alert";
import alertify from "alertifyjs";

// ─── Types ────────────────────────────────────────────────────────────────────
interface TypeNamebase { id: number; name: string; }
interface Category { id: number; name: string; image?: string; }
interface Product {
  id: number; name: string; sku?: string; price: number;
  taxRate?: number; taxAmount?: number; stock?: number;
  imageProduct?: string; isSerialNumber?: boolean;
  category?: TypeNamebase; branch?: TypeNamebase;
}
interface SerialNumberItem {
  id: number; productId: number; serialNo: string; status: string;
}
interface SelectedSerial { id: number | string; serialNo: string; data?: SerialNumberItem | null; }
interface CartItem extends Product {
  qty: number; serialNumbers?: SelectedSerial[];
  warrantyMonths?: number; warrantyStart?: string; warrantyEnd?: string;
}
interface NearDiscountHint {
  message: string; amountNeeded: number;
  discountName: string; applicableProducts: string[];
}
interface OrderSummaryResponse {
  subTotal: number; totalTax: number;
  totalDiscount: number; totalPayable: number;
  nearDiscountHints: NearDiscountHint[];
}
interface CustomerInfo { id: number; name: string; totalPoint: number; }

// ✅ PointSetup
interface PointSetupInfo {
  pointsPerRedemption: number;
  isActive: boolean;
}

interface PaginatedResponse<T> {
  data: T[]; totalCount: number; page: number;
  pageSize: number; totalPages: number;
  hasPrevious: boolean; hasNext: boolean;
}
interface PlaceOrderItemPayload {
  productId: number; serialNumberIds?: number[];
  quantity?: number; unitPrice: number;
  warrantyMonths?: number;
}
interface PlaceOrderPayload {
  customerId?: number; status?: number;
  paymentStatus?: number; discountAmount?: number;
  saleType: number; paymentMethod?: number;
  notes?: string; pointsUsed?: number;   // ✅
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

// ✅ 3 payment methods
const PAYMENT_METHODS = [
  { value: 1, label: "Cash",    icon: "💵" },
  { value: 2, label: "Bank QR", icon: "📲" },
  { value: 3, label: "Point",   icon: "⭐" },
];

// ─── Payment Modal ────────────────────────────────────────────────────────────
interface PaymentModalProps {
  dark: boolean; cart: CartItem[];
  subtotal: number; totalTax: number; autoDiscount: number;
  customer: CustomerInfo | null;
  pointSetup: PointSetupInfo | null;              // ✅
  onConfirm: (paymentMethod: number, discount: number, notes: string, pointsUsed: number) => void;
  onClose: () => void; placing: boolean; orderError: string | null;
}

function PaymentModal({
  dark, cart, subtotal, totalTax, autoDiscount,
  customer, pointSetup, onConfirm, onClose, placing, orderError,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<number>(1);
  const [manualDiscount, setManualDiscount] = useState<string>("");
  const [notes, setNotes]                   = useState<string>("");
  const [cashGiven, setCashGiven]           = useState<string>("");

  const manualDiscountAmt = Math.min(parseFloat(manualDiscount) || 0, subtotal + totalTax);
  const totalDiscountAmt  = Math.min(autoDiscount + manualDiscountAmt, subtotal + totalTax);
  const baseTotal         = subtotal + totalTax - totalDiscountAmt;

  // ✅ Auto-calculate points needed
  const redemptionRate    = pointSetup?.pointsPerRedemption ?? 0;
  const pointsNeeded      = redemptionRate > 0 ? Math.ceil(baseTotal * redemptionRate) : 0;
  const customerPoints    = customer?.totalPoint ?? 0;
  const canPayByPoint     = customer != null && redemptionRate > 0 && customerPoints >= pointsNeeded && pointsNeeded > 0;

  // ✅ When Pay by Point: auto-use exact points needed
  const pointsUsed        = paymentMethod === 3 ? pointsNeeded : 0;
  const pointDiscount     = paymentMethod === 3 && redemptionRate > 0
    ? pointsUsed / redemptionRate
    : 0;
  const total             = Math.max(0, baseTotal - pointDiscount);

  const cashGivenNum      = parseFloat(cashGiven) || 0;
  const change            = paymentMethod === 1 ? Math.max(0, cashGivenNum - total) : 0;
  const totalQty          = cart.reduce((s, i) => s + i.qty, 0);

  // Reset to Cash if Point no longer available
  useEffect(() => {
    if (paymentMethod === 3 && !canPayByPoint) setPaymentMethod(1);
  }, [canPayByPoint, paymentMethod]);

  const dl       = dark;
  const border   = dl ? "border-slate-700"  : "border-slate-200";
  const txt      = dl ? "text-slate-100"    : "text-slate-900";
  const txtSub   = dl ? "text-slate-400"    : "text-slate-500";
  const txtMuted = dl ? "text-slate-500"    : "text-slate-400";
  const modal    = dl ? "bg-[#1e293b]"      : "bg-white";
  const overlay  = dl ? "bg-black/75"       : "bg-black/55";
  const sectionBg = dl ? "bg-slate-800/60" : "bg-slate-50";
  const divider  = dl ? "border-slate-700"  : "border-slate-200";
  const inputCls = `w-full px-3 py-2 rounded-xl border text-sm outline-none transition-colors ${
    dl  ? "bg-slate-800 border-slate-600 text-slate-100 focus:border-blue-500 placeholder-slate-500"
        : "bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-400 placeholder-slate-400"
  }`;

  return (
    <div
      className={`fixed inset-0 z-50 flex mt-16 items-center justify-center ${overlay} backdrop-blur-sm p-4`}
      onClick={e => { if (e.target === e.currentTarget && !placing) onClose(); }}
    >
      <div
        className={`${modal} rounded-2xl border ${border} w-full shadow-2xl flex flex-col overflow-hidden`}
        style={{ maxWidth: "860px", height: "calc(100vh - 74px)", maxHeight: "760px" }}
      >
        {/* Header */}
        <div className={`flex items-center gap-3 px-5 py-2 border-b ${border} shrink-0`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className={`font-bold text-base ${txt}`}>Confirm Payment</h2>
            <p className={`text-xs ${txtMuted}`}>
              {totalQty} item{totalQty !== 1 ? "s" : ""} · {cart.length} product{cart.length !== 1 ? "s" : ""}
              {customer && <span className="ml-2 text-amber-400 font-semibold">· ⭐ {customer.totalPoint} pts</span>}
            </p>
          </div>
          <button onClick={onClose} disabled={placing}
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${dl ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* LEFT: Summary */}
          <div className={`flex flex-col w-[340px] shrink-0 border-r ${border}`}>
            <div className={`px-4 py-1.5 border-b ${border}`}>
              <p className={`text-[11px] font-bold uppercase tracking-wide ${txtMuted}`}>Order Summary</p>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2" style={{ scrollbarWidth: "thin" }}>
              {cart.map(item => (
                <div key={item.id} className={`rounded-xl px-3 py-2.5 border ${border} ${sectionBg}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${txt} truncate`}>{item.name}</p>
                      {item.isSerialNumber && item.serialNumbers && item.serialNumbers.length > 0 && (
                        <p className={`text-[10px] font-mono ${txtMuted} truncate mt-0.5`}>
                          {item.serialNumbers.map(s => s.serialNo).join(", ")}
                        </p>
                      )}
                      {(item.taxRate ?? 0) > 0 && (
                        <p className="text-[10px] text-amber-400 font-semibold mt-0.5">
                          Tax {item.taxRate}% · +${((item.taxAmount ?? 0) * item.qty).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-bold ${dl ? "bg-slate-700 text-slate-300" : "bg-slate-200 text-slate-600"}`}>
                        ×{item.qty}
                      </span>
                      <span className="text-sm font-bold text-sky-500 w-16 text-right">
                        ${(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className={`border-t ${border} px-4 py-4 space-y-2.5 shrink-0`}>
              <div className="flex justify-between text-sm">
                <span className={txtSub}>Subtotal</span>
                <span className={dl ? "text-slate-300" : "text-slate-700"}>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={txtSub}>Tax</span>
                <span className={dl ? "text-slate-300" : "text-slate-700"}>${totalTax.toFixed(2)}</span>
              </div>
              {autoDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-400 flex items-center gap-1">
                    Auto Discount
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15">Applied</span>
                  </span>
                  <span className="text-emerald-400 font-medium">-${autoDiscount.toFixed(2)}</span>
                </div>
              )}
              {manualDiscountAmt > 0 && (
                <div className="flex justify-between text-sm">
                  <span className={txtSub}>Manual Discount</span>
                  <span className="text-red-400">-${manualDiscountAmt.toFixed(2)}</span>
                </div>
              )}
              {/* ✅ Point discount row */}
              {paymentMethod === 3 && pointDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-amber-400 flex items-center gap-1.5">
                    ⭐ Point Payment
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">
                      {pointsUsed} pts
                    </span>
                  </span>
                  <span className="text-amber-400 font-medium">-${pointDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className={`flex justify-between items-center pt-3 border-t border-dashed ${dl ? "border-slate-600" : "border-slate-300"}`}>
                <span className={`font-bold text-sm ${txt}`}>Total Payable</span>
                <span className="font-extrabold text-2xl text-blue-500">${total.toFixed(2)}</span>
              </div>
              {paymentMethod === 1 && cashGivenNum > 0 && (
                <div className={`flex justify-between items-center pt-2 border-t ${divider}`}>
                  <span className={`text-sm font-semibold ${txtSub}`}>Change</span>
                  <span className={`font-bold text-lg ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    ${change.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Inputs */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 px-5 py-4 space-y-4 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>

              {/* Payment Method */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wide ${txtSub} mb-2`}>
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map(pm => {
                    const active   = paymentMethod === pm.value;
                    // ✅ Point disabled if customer has no enough points or no customer
                    const disabled = pm.value === 3 && !canPayByPoint;
                    return (
                      <button
                        key={pm.value}
                        onClick={() => !disabled && setPaymentMethod(pm.value)}
                        disabled={disabled}
                        className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl border-2 transition-all ${
                          disabled
                            ? dl  ? "border-slate-700 bg-slate-800/30 opacity-40 cursor-not-allowed"
                                  : "border-slate-200 bg-slate-50 opacity-40 cursor-not-allowed"
                            : active
                              ? "border-blue-500 bg-blue-500/10 shadow-sm"
                              : dl
                                ? "border-slate-700 bg-slate-800/60 hover:border-slate-600"
                                : "border-slate-200 bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-2xl leading-none">{pm.icon}</span>
                        <span className={`text-xs font-semibold ${active ? (dl ? "text-blue-400" : "text-blue-600") : txt}`}>
                          {pm.label}
                        </span>
                        {/* ✅ Show points needed info */}
                        {pm.value === 3 && (
                          <span className={`text-[10px] text-center leading-tight ${
                            canPayByPoint ? "text-amber-400" : txtMuted
                          }`}>
                            {canPayByPoint
                              ? `${pointsNeeded} pts`
                              : customer ? "Not enough pts" : "No customer"}
                          </span>
                        )}
                        {active && (
                          <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cash */}
              {paymentMethod === 1 && (
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wide ${txtSub} mb-1.5`}>Cash Given</label>
                  <div className="relative mb-2.5">
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold ${txtMuted}`}>$</span>
                    <input type="number" min="0" step="0.01" placeholder="0.00"
                      value={cashGiven} onChange={e => setCashGiven(e.target.value)}
                      className={`${inputCls} pl-7`} />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[50, 100, 500, 1000, 2000, 5000].map(amount => (
                      <button key={amount} onClick={() => setCashGiven(String(amount))}
                        className={`py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 border-2 ${
                          cashGiven === String(amount)
                            ? "border-blue-500 bg-blue-500/15 text-blue-400"
                            : dl
                              ? "border-slate-600 bg-slate-700 text-slate-200 hover:border-blue-500/50"
                              : "border-slate-200 bg-slate-100 text-slate-700 hover:border-blue-400/50"
                        }`}>
                        ${amount}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bank QR */}
              {paymentMethod === 2 && (
                <div className="flex flex-col items-center gap-3">
                  <label className={`self-start block text-xs font-bold uppercase tracking-wide ${txtSub}`}>Scan to Pay</label>
                  <div className={`w-full rounded-2xl border-2 ${dl ? "border-slate-600 bg-slate-800/60" : "border-slate-200 bg-slate-50"} flex flex-col items-center py-4 gap-3`}>
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
                      alt="QR" className="w-36 h-36 rounded-xl"
                      style={{ background: "white", padding: "8px" }}
                    />
                    <p className={`text-xs ${txtMuted}`}>Scan with your banking app to pay</p>
                  </div>
                </div>
              )}

              {/* ✅ Pay by Point — auto info, no input needed */}
              {paymentMethod === 3 && canPayByPoint && (
                <div className={`rounded-xl px-4 py-4 border ${dl ? "bg-amber-500/10 border-amber-500/30" : "bg-amber-50 border-amber-200"}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">⭐</span>
                    <div>
                      <p className={`text-sm font-bold ${dl ? "text-amber-300" : "text-amber-700"}`}>
                        {customer!.name}
                      </p>
                      <p className={`text-xs ${dl ? "text-amber-400/70" : "text-amber-600/70"}`}>
                        Available: {customer!.totalPoint} points
                      </p>
                    </div>
                  </div>
                  <div className={`rounded-lg px-3 py-2.5 space-y-1.5 ${dl ? "bg-slate-900/40" : "bg-white/70"}`}>
                    <div className="flex justify-between text-sm">
                      <span className={txtSub}>Points to deduct</span>
                      <span className={`font-bold ${dl ? "text-amber-300" : "text-amber-700"}`}>
                        {pointsNeeded} pts
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={txtSub}>Discount value</span>
                      <span className="font-bold text-emerald-400">${pointDiscount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={txtSub}>Remaining points after</span>
                      <span className={`font-bold ${dl ? "text-slate-300" : "text-slate-700"}`}>
                        {customer!.totalPoint - pointsNeeded} pts
                      </span>
                    </div>
                    <div className={`pt-2 mt-1 border-t ${dl ? "border-slate-700" : "border-amber-200"} flex justify-between text-sm`}>
                      <span className={`font-bold ${txt}`}>Total to pay</span>
                      <span className="font-extrabold text-blue-500">${total.toFixed(2)}</span>
                    </div>
                  </div>
                  <p className={`text-[11px] mt-2 text-center ${dl ? "text-amber-500" : "text-amber-600"}`}>
                    Points will be deducted automatically on confirm
                  </p>
                </div>
              )}

              {/* Manual Discount */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wide ${txtSub} mb-1.5`}>
                  Additional Discount ($)
                </label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold ${txtMuted}`}>$</span>
                  <input type="number" min="0" step="0.01" placeholder="0.00"
                    value={manualDiscount} onChange={e => setManualDiscount(e.target.value)}
                    className={`${inputCls} pl-7`} />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wide ${txtSub} mb-1.5`}>Notes (optional)</label>
                <textarea rows={3} placeholder="Add a note for this order…"
                  value={notes} onChange={e => setNotes(e.target.value)}
                  className={`${inputCls} resize-none`} />
              </div>

              {orderError && (
                <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                  ⚠️ {orderError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`flex items-center gap-3 px-5 py-3 border-t ${border} shrink-0`}>
              <button onClick={onClose} disabled={placing}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold border ${dl ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                Cancel
              </button>
              <button
                onClick={() => onConfirm(paymentMethod, manualDiscountAmt, notes, pointsUsed)}
                disabled={placing}
                className={`flex-[2] py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  placing
                    ? dl ? "bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg active:scale-95"
                }`}>
                {placing
                  ? <><Spinner size="sm" /><span>Processing…</span></>
                  : <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Confirm · ${total.toFixed(2)}</span>
                    </>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Near Discount Hint ───────────────────────────────────────────────────────
function NearDiscountHintBanner({ hint, dark }: { hint: NearDiscountHint; dark: boolean }) {
  return (
    <div className={`rounded-xl border px-3 py-2.5 flex items-start gap-2.5 ${dark ? "bg-amber-500/8 border-amber-500/25" : "bg-amber-50 border-amber-200"}`}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${dark ? "bg-amber-500/20" : "bg-amber-100"}`}>
        <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M17 17h.01M7 17l10-10M9.5 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5zm5 5a2.5 2.5 0 110 5 2.5 2.5 0 010-5z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${dark ? "bg-amber-500/20 text-amber-300" : "bg-amber-200 text-amber-700"}`}>
            {hint.discountName}
          </span>
        </div>
        <p className={`text-xs font-semibold ${dark ? "text-amber-200" : "text-amber-800"}`}>{hint.message}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className={`text-xs font-extrabold ${dark ? "text-amber-300" : "text-amber-700"}`}>+${hint.amountNeeded.toFixed(2)}</p>
        <p className="text-[10px] text-amber-500">needed</p>
      </div>
    </div>
  );
}

// ─── API ──────────────────────────────────────────────────────────────────────
const fetchCategories = async (): Promise<PaginatedResponse<Category>> => {
  const res = await AxiosApi.get("Category", { params: { Page: 1, PageSize: 100 } });
  return res.data;
};
const fetchProducts = async (params: { page: number; pageSize: number; search: string; categoryId: string }): Promise<PaginatedResponse<Product>> => {
  const p: any = { Page: params.page, PageSize: params.pageSize };
  if (params.search) p.Search = params.search;
  if (params.categoryId !== "0") p.CategoryId = params.categoryId;
  const res = await AxiosApi.get("Product/Sale-POS", { params: p });
  return res.data;
};
const fetchOrderSummary = async (cart: CartItem[]): Promise<OrderSummaryResponse | null> => {
  if (cart.length === 0) return null;
  const payload = {
    items: cart.flatMap(item =>
      item.isSerialNumber && item.serialNumbers?.length
        ? item.serialNumbers.map(() => ({ productId: item.id, quantity: 1, unitPrice: item.price }))
        : [{ productId: item.id, quantity: item.qty, unitPrice: item.price }]
    ),
  };
  const res = await AxiosApi.post("Order/summary", payload);
  return res.data?.data ?? null;
};

// ✅ Fetch PointSetup
const fetchPointSetup = async (): Promise<PointSetupInfo | null> => {
  try {
    const res = await AxiosApi.get("PointSetup");
    const d   = res.data?.data;
    return d ? { pointsPerRedemption: d.pointsPerRedemption ?? 0, isActive: d.isActive ?? false } : null;
  } catch { return null; }
};

// ─── Constants ────────────────────────────────────────────────────────────────
const PLACEHOLDER_LIGHT = "https://placehold.co/300x300/e2e8f0/94a3b8?text=No+Image";
const PLACEHOLDER_DARK  = "https://placehold.co/300x300/1e293b/475569?text=No+Image";
const PAGE_SIZE = 20;
const WARRANTY_OPTIONS = [
  { label: "No warranty", months: 0 }, { label: "1 month", months: 1 },
  { label: "3 months",    months: 3 }, { label: "6 months", months: 6 },
  { label: "1 year",     months: 12 }, { label: "2 years",  months: 24 },
];
const todayISO = () => new Date().toISOString().split("T")[0];
const addMonths = (dateStr: string, months: number) => {
  if (!months || !dateStr) return "";
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
};
const formatDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PosShop() {
  const { darkLight } = useGlobleContextDarklight();
  const dark = darkLight;

  const [categories, setCategories]           = useState<Category[]>([]);
  const [activeTab, setActiveTab]             = useState("0");
  const [search, setSearch]                   = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [products, setProducts]               = useState<Product[]>([]);
  const [page, setPage]                       = useState(1);
  const [hasMore, setHasMore]                 = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingMore, setLoadingMore]         = useState(false);
  const [callListProduct, setCallListProduct] = useState(false);
  const [cart, setCart]                       = useState<CartItem[]>([]);
  const [serialModal, setSerialModal]         = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
  const [paymentModal, setPaymentModal]       = useState(false);
  const [placingOrder, setPlacingOrder]       = useState(false);
  const [orderError, setOrderError]           = useState<string | null>(null);
  const [summaryData, setSummaryData]         = useState<OrderSummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading]   = useState(false);
  const summaryDebounceRef                    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerInfo | null>(null);

  // ✅ PointSetup state
  const [pointSetup, setPointSetup] = useState<PointSetupInfo | null>(null);

  useEffect(() => {
    fetchCategories().then(res => setCategories(res?.data ?? [])).catch(console.error);
    // ✅ Fetch point setup once
    fetchPointSetup().then(d => setPointSetup(d));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setProducts([]); setPage(1); setHasMore(true); }, [activeTab, debouncedSearch]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (page === 1) setLoadingProducts(true); else setLoadingMore(true);
      try {
        const res = await fetchProducts({ page, pageSize: PAGE_SIZE, search: debouncedSearch, categoryId: activeTab });
        if (!cancelled) {
          setProducts(prev => page === 1 ? res.data ?? [] : [...prev, ...(res.data ?? [])]);
          setHasMore(res.hasNext ?? false);
        }
      } catch (e) { console.error(e); }
      finally { if (!cancelled) { setLoadingProducts(false); setLoadingMore(false); } }
    };
    load();
    return () => { cancelled = true; };
  }, [page, activeTab, debouncedSearch, callListProduct]);

  useEffect(() => {
    if (summaryDebounceRef.current) clearTimeout(summaryDebounceRef.current);
    if (cart.length === 0) { setSummaryData(null); return; }
    summaryDebounceRef.current = setTimeout(async () => {
      setSummaryLoading(true);
      try { setSummaryData(await fetchOrderSummary(cart)); }
      catch { setSummaryData(null); }
      finally { setSummaryLoading(false); }
    }, 500);
    return () => { if (summaryDebounceRef.current) clearTimeout(summaryDebounceRef.current); };
  }, [cart]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 150 && hasMore && !loadingMore && !loadingProducts)
      setPage(p => p + 1);
  }, [hasMore, loadingMore, loadingProducts]);

  const addToCart = useCallback((product: Product) => {
    if (product.isSerialNumber) { setSerialModal({ open: true, product }); return; }
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  }, []);

  const handleSerialConfirm = useCallback((
    product: Product, serials: SelectedSerial[],
    warrantyMonths: number, warrantyStart: string, warrantyEnd: string
  ) => {
    if (serials.length === 0) return;
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) {
        const existingIds = new Set((ex.serialNumbers ?? []).map(s => s.id));
        const merged = [...(ex.serialNumbers ?? []), ...serials.filter(s => !existingIds.has(s.id))];
        return prev.map(i => i.id === product.id
          ? { ...i, qty: merged.length, serialNumbers: merged, warrantyMonths, warrantyStart, warrantyEnd } : i);
      }
      return [...prev, { ...product, qty: serials.length, serialNumbers: serials, warrantyMonths, warrantyStart, warrantyEnd }];
    });
    setSerialModal({ open: false, product: null });
  }, []);

  const changeQty  = useCallback((id: number, delta: number) =>
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)), []);
  const removeItem = useCallback((id: number) => setCart(prev => prev.filter(i => i.id !== id)), []);
  const clearCart  = () => { setCart([]); setSummaryData(null); };

  const subtotal     = summaryData?.subTotal     ?? cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalTax     = summaryData?.totalTax     ?? cart.reduce((s, i) => s + (i.taxAmount ?? 0) * i.qty, 0);
  const autoDiscount = summaryData?.totalDiscount ?? 0;
  const totalPayable = summaryData?.totalPayable  ?? (subtotal + totalTax - autoDiscount);
  const totalQty     = cart.reduce((s, i) => s + i.qty, 0);
  const nearHints    = summaryData?.nearDiscountHints ?? [];

  // ✅ handlePlaceOrder with pointsUsed
  const handlePlaceOrder = async (
    paymentMethod: number, manualDiscountAmount: number,
    notes: string, pointsUsed: number
  ) => {
    if (cart.length === 0 || placingOrder) return;
    setOrderError(null);
    setPlacingOrder(true);

    const payload: PlaceOrderPayload = {
      customerId:     selectedCustomer?.id,
      saleType:       1,
      paymentStatus:  2,
      status:         3,
      paymentMethod,
      discountAmount: Number(manualDiscountAmount.toFixed(2)),
      notes:          notes || "",
      pointsUsed:     pointsUsed > 0 ? pointsUsed : undefined,   // ✅
      items: cart.map(item =>
        item.isSerialNumber && item.serialNumbers?.length
          ? {
              productId:       item.id,
              serialNumberIds: item.serialNumbers.map(s => Number(s.id)),
              unitPrice:       item.price,
              warrantyMonths:  item.warrantyMonths && item.warrantyMonths > 0 ? item.warrantyMonths : undefined,
            } satisfies PlaceOrderItemPayload
          : { productId: item.id, quantity: item.qty, unitPrice: item.price } satisfies PlaceOrderItemPayload
      ),
    };

    try {
      const res = await AxiosApi.post("Order", payload);
      if (res?.data?.data) {
        alertify.success("Payment success");
        clearCart();
        setPaymentModal(false);
        setSelectedCustomer(null);
        setCallListProduct(p => !p);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to place order.";
      setOrderError(msg);
      alertError(msg);
    } finally { setPlacingOrder(false); }
  };

  const allTabs = [
    { id: "0", name: "All", image: null as string | null },
    ...categories.map(c => ({ id: String(c.id), name: c.name, image: c.image ?? null })),
  ];

  // ─── Theme ────────────────────────────────────────────────────────────────
  const bg          = dark ? "bg-[#0f172a]"        : "bg-[#f1f5f9]";
  const sidebarBg   = dark ? "bg-[#1e293b]"        : "bg-white";
  const panelBg     = dark ? "bg-[#1e293b]"        : "bg-white";
  const productBg   = dark ? "bg-[#1e293b]"        : "bg-white";
  const borderColor = dark ? "border-slate-700/60" : "border-slate-200";
  const textPrimary = dark ? "text-slate-100"      : "text-slate-900";
  const textSub     = dark ? "text-slate-400"      : "text-slate-500";
  const textMuted   = dark ? "text-slate-500"      : "text-slate-400";
  const inputBg     = dark ? "bg-slate-800/80"     : "bg-slate-100";
  const rowBg       = dark ? "bg-slate-800"        : "bg-slate-50 border border-slate-200";
  const scrollStyle = dark ? "#334155 transparent" : "#cbd5e0 transparent";
  const imgFallback = dark ? PLACEHOLDER_DARK      : PLACEHOLDER_LIGHT;

  return (
    <>
      {serialModal.open && serialModal.product && (
        <SerialNumberModal
          product={serialModal.product} dark={dark}
          existingSerials={cart.find(i => i.id === serialModal.product!.id)?.serialNumbers}
          existingWarrantyMonths={cart.find(i => i.id === serialModal.product!.id)?.warrantyMonths ?? 0}
          existingWarrantyStart={cart.find(i => i.id === serialModal.product!.id)?.warrantyStart}
          onConfirm={handleSerialConfirm}
          onClose={() => setSerialModal({ open: false, product: null })}
        />
      )}

      {paymentModal && (
        <PaymentModal
          dark={dark} cart={cart} subtotal={subtotal}
          totalTax={totalTax} autoDiscount={autoDiscount}
          customer={selectedCustomer}
          pointSetup={pointSetup}                           // ✅
          onConfirm={handlePlaceOrder}
          onClose={() => { if (!placingOrder) { setPaymentModal(false); setOrderError(null); } }}
          placing={placingOrder} orderError={orderError}
        />
      )}

      <div className={`flex ${bg} ${textPrimary} overflow-hidden`} style={{ height: "calc(100vh - 80px)" }}>

        {/* Category Sidebar */}
        <div className={`w-[104px] shrink-0 flex flex-col overflow-hidden ${sidebarBg} border-r ${borderColor}`}>
          <div className="flex-1 overflow-y-auto py-2 px-2 flex flex-col gap-1.5" style={{ scrollbarWidth: "none" }}>
            {allTabs.map(cat => {
              const isActive = activeTab === cat.id;
              return (
                <button key={cat.id} onClick={() => setActiveTab(cat.id)}
                  className={`w-full flex flex-col items-center gap-1.5 p-1.5 rounded-xl transition-all ${
                    isActive
                      ? dark ? "bg-blue-600/20 ring-2 ring-blue-500/50" : "bg-blue-50 ring-2 ring-blue-400/50"
                      : dark ? "hover:bg-slate-700/60" : "hover:bg-slate-100"
                  }`}>
                  <div className={`w-[68px] h-[68px] rounded-xl overflow-hidden flex items-center justify-center ${
                    isActive ? "ring-2 ring-blue-500 shadow-lg" : dark ? "bg-slate-700/80 ring-1 ring-slate-600/50" : "bg-slate-100 ring-1 ring-slate-200"
                  }`}>
                    {cat.id === "0"
                      ? <svg className={`w-8 h-8 ${isActive ? "text-blue-400" : textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      : cat.image
                        ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).src = imgFallback; }} />
                        : <svg className={`w-7 h-7 ${isActive ? "text-blue-400" : textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3}
                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                    }
                  </div>
                  <span className={`text-[11px] font-semibold text-center leading-tight w-full truncate ${
                    isActive ? (dark ? "text-blue-400" : "text-blue-600") : textSub
                  }`}>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product List */}
        <div className={`flex flex-col flex-1 overflow-hidden border-r ${borderColor}`}>
          <div className={`flex items-center gap-3 px-4 py-2 ${panelBg} border-b ${borderColor}`}>
            <span className={`text-2xl font-black tracking-wider ${dark ? "text-white" : "text-blue-900"}`}>
              WELCOME SOKHA <span className="text-yellow-500">SK</span>
            </span>
            <div className={`ml-auto flex items-center gap-2 w-[250px] px-3 py-2 rounded-xl ${inputBg}`}>
              <svg className={`w-4 h-4 ${textMuted} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                className={`flex-1 bg-transparent text-sm ${textPrimary} placeholder-slate-400 outline-none`}
                placeholder="Search Product..." value={search}
                onChange={e => setSearch(e.target.value)} />
              {search && <button className={`${textMuted} hover:text-red-400 text-sm`} onClick={() => setSearch("")}>✕</button>}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5"
            style={{ scrollbarWidth: "thin", scrollbarColor: scrollStyle }}
            onScroll={handleScroll}>
            {loadingProducts ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Spinner size="lg" /><p className={`${textMuted} text-sm`}>Loading products…</p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <span className="text-5xl">📦</span>
                <p className={`${textMuted} text-sm font-medium`}>No products found</p>
              </div>
            ) : (
              <>
                {products.map(p => (
                  <ProductRow key={p.id} product={p} cartItem={cart.find(i => i.id === p.id)}
                    onAdd={addToCart} dark={dark} productBg={productBg} borderColor={borderColor}
                    textPrimary={textPrimary} textSub={textSub} textMuted={textMuted} imgFallback={imgFallback} />
                ))}
                {loadingMore && (
                  <div className={`flex items-center justify-center gap-3 py-5 rounded-2xl ${dark ? "bg-slate-800/60" : "bg-slate-100/80"}`}>
                    <Spinner size="sm" />
                    <span className={`${textMuted} text-sm`}>Loading more…</span>
                  </div>
                )}
                {!hasMore && !loadingMore && products.length > 0 && (
                  <div className="flex items-center justify-center gap-3 py-4">
                    <div className={`h-px flex-1 ${dark ? "bg-slate-700" : "bg-slate-200"}`} />
                    <span className={`${textMuted} text-xs px-2`}>No more products</span>
                    <div className={`h-px flex-1 ${dark ? "bg-slate-700" : "bg-slate-200"}`} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Order Panel */}
        <div className={`w-80 xl:w-96 flex flex-col overflow-hidden ${panelBg} shrink-0`}>

          {/* Header */}
          <div className={`flex items-center gap-2.5 px-4 py-3.5 border-b ${borderColor} shrink-0`}>
            <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h2 className={`font-bold text-base flex-1 ${textPrimary}`}>Order Details</h2>
            {totalQty > 0 && <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">{totalQty}</span>}
            {summaryLoading && <Spinner size="sm" />}
            {cart.length > 0 && (
              <button onClick={clearCart} className={`${textMuted} hover:text-red-400 ml-1`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>

          {/* ✅ Customer Select */}
          <div className={`px-3 py-2.5 border-b ${borderColor} shrink-0`}>
            <p className={`text-[11px] font-bold uppercase tracking-wide ${textMuted} mb-1.5`}>Customer (optional)</p>
            <XSelectSearch
              multiple={false}
              value={selectedCustomer
                ? { id: selectedCustomer.id, name: selectedCustomer.name, value: selectedCustomer.id, data: null }
                : null}
              onChange={val => {
                if (!val) { setSelectedCustomer(null); return; }
                setSelectedCustomer({
                  id:         val.id as number,
                  name:       val.name,
                  totalPoint: (val.data as any)?.totalPoint ?? 0,
                });
              }}
              placeholder="Search customer..."
              selectOption={{ id: "id", name: "fullName", value: "id", apiEndpoint: "Customer/lookup", pageSize: 20, searchParam: "Search" }}
              isSearchable clearable
            />
            {selectedCustomer && (
              <div className={`mt-1.5 flex items-center gap-1.5 px-2 py-1 rounded-lg ${dark ? "bg-amber-500/10" : "bg-amber-50"}`}>
                <span className="text-amber-400">⭐</span>
                <span className={`text-xs font-semibold ${dark ? "text-amber-300" : "text-amber-700"}`}>
                  {selectedCustomer.totalPoint} points available
                </span>
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2" style={{ scrollbarWidth: "thin", scrollbarColor: scrollStyle }}>
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 pb-10">
                <div className={`w-16 h-16 rounded-full ${dark ? "bg-slate-800" : "bg-slate-100"} flex items-center justify-center`}>
                  <svg className={`w-8 h-8 ${textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className={`${textMuted} text-sm font-medium`}>No items selected</p>
                <p className={`${textMuted} text-xs text-center px-6`}>Click on a product to add it to the order</p>
              </div>
            ) : (
              <>
                {cart.map(item => (
                  <CartRow key={item.id} item={item}
                    onInc={() => changeQty(item.id, 1)} onDec={() => changeQty(item.id, -1)}
                    onRemove={() => removeItem(item.id)}
                    dark={dark} rowBg={rowBg} textPrimary={textPrimary} textMuted={textMuted} />
                ))}
                {nearHints.length > 0 && (
                  <div className="pt-1 space-y-2">
                    <div className="flex items-center gap-2 px-1">
                      <div className={`h-px flex-1 ${dark ? "bg-amber-500/20" : "bg-amber-200"}`} />
                      <span className={`text-[10px] font-bold uppercase ${dark ? "text-amber-400" : "text-amber-600"}`}>💡 Unlock Discounts</span>
                      <div className={`h-px flex-1 ${dark ? "bg-amber-500/20" : "bg-amber-200"}`} />
                    </div>
                    {nearHints.map((hint, idx) => <NearDiscountHintBanner key={idx} hint={hint} dark={dark} />)}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Totals */}
          <div className={`border-t ${borderColor} px-4 py-3 space-y-2 shrink-0`}>
            <div className="flex justify-between text-sm">
              <span className={textSub}>Subtotal</span>
              <span className={dark ? "text-slate-300" : "text-slate-600"}>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className={textSub}>Tax</span>
              <span className={dark ? "text-slate-300" : "text-slate-600"}>${totalTax.toFixed(2)}</span>
            </div>
            {autoDiscount > 0
              ? <div className="flex justify-between text-sm">
                  <span className="text-emerald-400 flex items-center gap-1">
                    Discount <span className="text-[10px] font-bold px-1 rounded bg-emerald-500/15">Auto</span>
                  </span>
                  <span className="text-emerald-400">-${autoDiscount.toFixed(2)}</span>
                </div>
              : <div className="flex justify-between text-sm">
                  <span className={textSub}>Discount</span>
                  <span className={dark ? "text-slate-300" : "text-slate-600"}>$0.00</span>
                </div>
            }
            <div className={`flex justify-between items-center pt-2 border-t border-dashed ${dark ? "border-slate-700" : "border-slate-300"}`}>
              <span className={`font-bold ${textPrimary}`}>Total Payable</span>
              <span className="font-bold text-lg text-blue-500">${totalPayable.toFixed(2)}</span>
            </div>
          </div>

          {/* Place Order */}
          <div className="px-4 pb-5 shrink-0">
            <button
              disabled={cart.length === 0}
              onClick={() => { if (cart.length > 0) { setOrderError(null); setPaymentModal(true); } }}
              className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${
                cart.length === 0
                  ? dark ? "bg-slate-800 text-slate-600 cursor-not-allowed" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg active:scale-95"
              }`}>
              {cart.length === 0 ? "No Items Selected" : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {`Place Order · $${totalPayable.toFixed(2)}`}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Serial Number Modal ──────────────────────────────────────────────────────
function SerialNumberModal({ product, dark, existingSerials = [], existingWarrantyMonths = 0, existingWarrantyStart, onConfirm, onClose }: SerialNumberModalProps) {
  const [selectedSerials, setSelectedSerials] = useState<MultiValue>(
    existingSerials.map(s => ({ id: s.id, name: s.serialNo, value: s.id, data: s.data ?? null }))
  );
  const [warrantyMonths, setWarrantyMonths] = useState(existingWarrantyMonths);
  const [warrantyInput, setWarrantyInput]   = useState(existingWarrantyMonths > 0 ? String(existingWarrantyMonths) : "");
  const [warrantyStart, setWarrantyStart]   = useState(existingWarrantyStart ?? todayISO());
  const warrantyEnd = warrantyMonths > 0 ? addMonths(warrantyStart, warrantyMonths) : "";

  const dl = dark;
  const border   = dl ? "border-slate-700" : "border-slate-200";
  const txt      = dl ? "text-slate-100"   : "text-slate-900";
  const txtSub   = dl ? "text-slate-400"   : "text-slate-500";
  const txtMuted = dl ? "text-slate-500"   : "text-slate-400";
  const inputCls = `w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${
    dl ? "bg-slate-800 border-slate-600 text-slate-100 focus:border-blue-500"
       : "bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-400"
  }`;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center mt-15 ${dl ? "bg-black/70" : "bg-black/50"} backdrop-blur-sm`}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`${dl ? "bg-[#1e293b]" : "bg-white"} rounded-2xl border ${border} w-full max-w-xl mx-4 shadow-2xl flex flex-col overflow-hidden`}
        style={{ maxHeight: "90vh" }}>
        <div className={`flex items-start gap-3 px-5 py-4 border-b ${border} shrink-0`}>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-400">Serial Number</span>
            <h3 className={`font-bold text-base ${txt} truncate mt-1`}>{product.name}</h3>
            {product.sku && <p className={`text-xs font-mono ${txtMuted} mt-0.5`}>SKU: {product.sku}</p>}
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center ${dl ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <div>
            <label className={`block text-xs font-semibold ${txtSub} mb-2 uppercase tracking-wide`}>
              Select Serial Numbers <span className="text-blue-400 normal-case font-normal">(multiple)</span>
            </label>
            <XSelectSearch multiple value={selectedSerials}
              onChange={val => setSelectedSerials(val as MultiValue)}
              placeholder="Search serial numbers…"
              selectOption={{ id: "id", name: "serialNo", value: "id", apiEndpoint: `SerialNumber?ProductId=${product.id}&Status=Available`, pageSize: 50, searchParam: "Search" }}
              isSearchable clearable noOptionsMessage="No available serial numbers" />
          </div>
          <div>
            <label className={`block text-xs font-semibold ${txtSub} mb-2 uppercase tracking-wide`}>Warranty Period</label>
            <div className="grid grid-cols-6 gap-2 mb-3">
              {WARRANTY_OPTIONS.map(opt => {
                const active = warrantyMonths === opt.months;
                return (
                  <button key={opt.months}
                    onClick={() => { setWarrantyMonths(opt.months); setWarrantyInput(opt.months === 0 ? "" : String(opt.months)); }}
                    className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      active
                        ? "bg-blue-600 border-blue-600 text-white"
                        : dl ? "bg-slate-800 border-slate-600 text-slate-300 hover:border-blue-500/60"
                             : "bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-400/60"
                    }`}>{opt.label}</button>
                );
              })}
            </div>
            <div className="relative">
              <input type="number" min={0} value={warrantyInput}
                onChange={e => {
                  setWarrantyInput(e.target.value);
                  const p = parseInt(e.target.value, 10);
                  setWarrantyMonths(!isNaN(p) && p >= 0 ? p : 0);
                }}
                placeholder="Or type months (e.g. 18)" className={inputCls} />
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none ${txtMuted}`}>months</span>
            </div>
          </div>
          <div>
            <label className={`block text-xs font-semibold ${txtSub} mb-2 uppercase tracking-wide`}>Warranty Dates</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className={`text-[11px] ${txtMuted} mb-1`}>Start date</p>
                <input type="date" value={warrantyStart} onChange={e => setWarrantyStart(e.target.value)} className={inputCls} />
              </div>
              <div>
                <p className={`text-[11px] ${txtMuted} mb-1`}>End date <span className="text-blue-400">(auto)</span></p>
                <div className={`w-full px-3 py-2 rounded-lg border text-sm font-medium ${
                  warrantyMonths > 0
                    ? dl ? "bg-slate-900/60 border-slate-700 text-blue-400" : "bg-blue-50 border-blue-100 text-blue-600"
                    : dl ? "bg-slate-900/40 border-slate-700 text-slate-600" : "bg-slate-50 border-slate-200 text-slate-400"
                }`}>{warrantyMonths > 0 ? formatDate(warrantyEnd) : "—"}</div>
              </div>
            </div>
          </div>
        </div>
        <div className={`flex items-center gap-3 px-5 py-4 border-t ${border} shrink-0`}>
          <button onClick={onClose}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border ${dl ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            Cancel
          </button>
          <button
            onClick={() => onConfirm(product, selectedSerials.map(s => ({ id: s.id, serialNo: s.name, data: s.data as SerialNumberItem | null })), warrantyMonths, warrantyStart, warrantyEnd)}
            disabled={selectedSerials.length === 0}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              selectedSerials.length === 0
                ? dl ? "bg-slate-800 text-slate-600 cursor-not-allowed" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md active:scale-95"
            }`}>
            {selectedSerials.length === 0
              ? "Select serials"
              : `Add ${selectedSerials.length} item${selectedSerials.length > 1 ? "s" : ""} · $${(product.price * selectedSerials.length).toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Product Row ──────────────────────────────────────────────────────────────
function ProductRow({ product, cartItem, onAdd, dark, productBg, borderColor, textPrimary, textMuted, imgFallback }: ProductRowProps) {
  const outOfStock   = (product.stock ?? 0) <= 0;
  const productPrice = isNaN(Number(product.price)) ? 0 : Number(product.price);

  return (
    <div onClick={() => !outOfStock && onAdd(product)} style={{ minHeight: "110px" }}
      className={`flex items-stretch rounded-2xl overflow-hidden border transition-all select-none
        ${outOfStock ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${productBg} ${borderColor}
        ${cartItem ? "ring-2 ring-blue-500 shadow-md shadow-blue-500/10" : dark ? "hover:border-slate-600 hover:shadow-lg" : "hover:border-slate-300 hover:shadow-md"}`}>
      <div className={`relative w-[130px] shrink-0 ${dark ? "bg-slate-800" : "bg-slate-100"}`} style={{ minHeight: "110px" }}>
        <img src={product.imageProduct || imgFallback} alt={product.name}
          className="w-full h-full object-cover" style={{ minHeight: "110px", maxHeight: "130px" }}
          onError={e => { (e.target as HTMLImageElement).src = imgFallback; }} />
        {cartItem && <span className="absolute top-2 left-2 bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">×{cartItem.qty}</span>}
        {product.isSerialNumber && (
          <span className={`absolute bottom-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${dark ? "bg-violet-900/80 text-violet-300" : "bg-violet-100 text-violet-700"}`}>S/N</span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-[11px] font-bold text-white bg-red-500/90 px-2 py-1 rounded-lg">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="flex-1 px-4 py-3 flex flex-col justify-between min-w-0">
        <div>
          {product.category?.name && <p className={`text-[11px] font-medium ${textMuted} mb-0.5`}>{product.category.name}</p>}
          <p className={`text-sm font-bold ${textPrimary} leading-snug line-clamp-2`}>{product.name}</p>
          {product.sku && <p className={`text-[11px] ${textMuted} mt-0.5 font-mono`}>{product.sku}</p>}
        </div>
        <div className="flex items-center justify-between mt-2 gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-extrabold text-sky-500">${productPrice.toFixed(2)}</span>
            {(product.taxRate ?? 0) > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400">+{product.taxRate}% tax</span>
            )}
          </div>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${
            (product.stock ?? 0) > 0
              ? dark ? "bg-emerald-900/50 text-emerald-400" : "bg-emerald-100 text-emerald-700"
              : dark ? "bg-red-900/50 text-red-400"         : "bg-red-100 text-red-600"
          }`}>{product.stock ?? 0}</span>
        </div>
      </div>
      <div className={`w-8 shrink-0 flex items-center justify-center ${cartItem ? "text-blue-400" : dark ? "text-slate-700" : "text-slate-200"}`}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

// ─── Cart Row ─────────────────────────────────────────────────────────────────
function CartRow({ item, onInc, onDec, onRemove, dark, rowBg, textPrimary, textMuted }: CartRowProps) {
  const btnBase = dark ? "bg-slate-700 hover:bg-slate-600 text-slate-200" : "bg-slate-200 hover:bg-slate-300 text-slate-700";
  return (
    <div className={`${rowBg} rounded-xl px-3 py-2.5`}>
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${textPrimary} truncate`}>{item.name}</p>
          <p className="text-xs font-bold text-sky-500 mt-0.5">
            ${(item.price * item.qty).toFixed(2)}
            <span className={`${textMuted} font-normal ml-1 text-[11px]`}>(${Number(item.price).toFixed(2)} × {item.qty})</span>
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!item.isSerialNumber && (
            <>
              <button onClick={onDec} className={`w-7 h-7 rounded-lg ${btnBase} font-bold text-lg flex items-center justify-center`}>−</button>
              <span className={`w-7 text-center text-sm font-bold ${textPrimary} select-none`}>{item.qty}</span>
              <button onClick={onInc} className={`w-7 h-7 rounded-lg ${dark ? "bg-slate-700 hover:bg-blue-600 text-slate-200" : "bg-slate-200 hover:bg-blue-500 hover:text-white text-slate-700"} font-bold text-lg flex items-center justify-center`}>+</button>
            </>
          )}
          {item.isSerialNumber && (
            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${dark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"}`}>×{item.qty}</span>
          )}
          <button onClick={onRemove}
            className={`w-7 h-7 rounded-lg flex items-center justify-center ml-0.5 ${dark ? "bg-slate-700 hover:bg-red-600 text-slate-400 hover:text-white" : "bg-slate-200 hover:bg-red-500 text-slate-500 hover:text-white"}`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      {item.isSerialNumber && item.serialNumbers && item.serialNumbers.length > 0 && (
        <div className={`mt-2 pt-2 border-t ${dark ? "border-slate-700" : "border-slate-200"}`}>
          <div className="flex flex-wrap gap-1">
            {item.serialNumbers.map(s => (
              <span key={s.id} className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${dark ? "bg-violet-900/50 text-violet-300" : "bg-violet-50 text-violet-700"}`}>
                {s.serialNo}
              </span>
            ))}
          </div>
          <p className={`text-[10px] ${dark ? "text-slate-500" : "text-slate-400"} mt-1`}>
            {item.warrantyMonths && item.warrantyMonths > 0
              ? `Warranty: ${item.warrantyMonths}mo · ${formatDate(item.warrantyStart!)} → ${formatDate(item.warrantyEnd!)}`
              : "Warranty: 0 Month"}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const cls = size === "sm" ? "w-5 h-5 border-2" : size === "lg" ? "w-9 h-9 border-[3px]" : "w-7 h-7 border-2";
  return <div className={`${cls} rounded-full border-slate-300 border-t-blue-500 animate-spin`} />;
}