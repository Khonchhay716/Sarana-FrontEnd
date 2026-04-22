// import type { TableColumnsType } from 'antd';
// import XDataTable from '../../component/XDataTable/XDataTable';
// import "../../component/XDataTable/XdataTable.css";
// import { useState, useRef, useEffect } from 'react';
// import { useGlobleContextDarklight, useRefreshTable } from '../../AllContext/context';
// import { ShoppingCart, ChevronDown, X, Calendar, Filter, TrendingUp, Eye, Package, CreditCard, User, Clock, Hash, Shield, RotateCcw } from 'lucide-react';
// import XSelectSearch, { SingleValue } from '../../component/XSelectSearch/Xselectsearch';
// import { AxiosApi } from '../../component/Axios/Axios';
// import { alertError } from '../../HtmlHelper/Alert';
// import alertify from 'alertifyjs';

// // ==================== INTERFACES ====================
// interface SerialNo { id: number; name: string; }
// interface TypeNamebase { id: number; name: string; }
// interface OrderItem {
//     id: number; orderId: number; productId: number; productName: string;
//     imageProduct: string; serialNumberId: number | null; serialNo: SerialNo | null;
//     quantity: number; unitPrice: number; subTotal: number;
//     warrantyMonths: number | null; warrantyStartDate: string | null; warrantyEndDate: string | null;
// }
// interface Order {
//     id: number; orderNumber: string; orderDate: string;
//     customerId: number; customer: TypeNamebase | null;
//     staffId: number; staff: TypeNamebase | null;
//     subTotal: number; discountAmount: number; taxAmount: number; totalAmount: number;
//     earnedPoints: number; pointsUsed: number; cashReceived: number;
//     status: TypeNamebase; saleType: TypeNamebase; paymentStatus: TypeNamebase;
//     paymentMethod: TypeNamebase; notes: string; orderItems: OrderItem[];
// }

// // ==================== CONSTANTS ====================
// const STATUS_OPTIONS = [
//     { value: 1, label: 'Pending' }, { value: 2, label: 'Processing' },
//     { value: 3, label: 'Completed' }, { value: 4, label: 'Cancelled' }, { value: 5, label: 'Refunded' },
// ];
// const PAYMENT_STATUS_OPTIONS = [
//     { value: 1, label: 'Unpaid' }, { value: 2, label: 'Paid' }, { value: 3, label: 'Refunded' },
// ];
// const TYPE_PRODUCT = [
//     { value: 1, label: 'Serial' }, { value: 2, label: 'NoSerial' }
// ];
// const DATE_PRESETS = [
//     { label: 'Today', getValue: () => { const d = new Date(); return { from: fmt(d), to: fmt(d) }; } },
//     { label: 'This Week', getValue: () => { const now = new Date(); const mon = new Date(now); mon.setDate(now.getDate() - now.getDay() + 1); return { from: fmt(mon), to: fmt(now) }; } },
//     { label: 'This Month', getValue: () => { const now = new Date(); const first = new Date(now.getFullYear(), now.getMonth(), 1); return { from: fmt(first), to: fmt(now) }; } },
//     { label: 'Last Month', getValue: () => { const now = new Date(); const first = new Date(now.getFullYear(), now.getMonth() - 1, 1); const last = new Date(now.getFullYear(), now.getMonth(), 0); return { from: fmt(first), to: fmt(last) }; } },
//     { label: 'This Year', getValue: () => { const now = new Date(); const first = new Date(now.getFullYear(), 0, 1); return { from: fmt(first), to: fmt(now) }; } },
// ];
// function fmt(d: Date) { return d.toISOString().split('T')[0]; }

// // ==================== STATUS STYLES ====================
// const getStatusStyle = (name: string) => ({
//     Completed: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
//     Processing: 'bg-blue-100 text-blue-700 border border-blue-200',
//     Pending: 'bg-amber-100 text-amber-700 border border-amber-200',
//     Cancelled: 'bg-red-100 text-red-700 border border-red-200',
//     Refunded: 'bg-purple-100 text-purple-700 border border-purple-200',
// } as Record<string, string>)[name] ?? 'bg-gray-100 text-gray-600 border border-gray-200';

// const getPaymentStyle = (name: string) => ({
//     Paid: 'bg-teal-100 text-teal-700 border border-teal-200',
//     Unpaid: 'bg-rose-100 text-rose-700 border border-rose-200',
//     Partial: 'bg-orange-100 text-orange-700 border border-orange-200',
//     Refunded: 'bg-purple-100 text-purple-700 border border-purple-200',
// } as Record<string, string>)[name] ?? 'bg-gray-100 text-gray-600 border border-gray-200';

// // ==================== SELECT DROPDOWN ====================
// interface SelectOption { value: number; label: string; }
// const SelectDropdown = ({ placeholder, options, value, onChange, darkLight }: {
//     placeholder: string; options: SelectOption[]; value: number | null;
//     onChange: (v: number | null) => void; darkLight: boolean;
// }) => {
//     const [open, setOpen] = useState(false);
//     const ref = useRef<HTMLDivElement>(null);
//     const selected = options.find(o => o.value === value);
//     useEffect(() => {
//         const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
//         document.addEventListener('mousedown', h);
//         return () => document.removeEventListener('mousedown', h);
//     }, []);
//     return (
//         <div ref={ref} className="relative">
//             <button onClick={() => setOpen(!open)}
//                 className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all min-w-[140px] justify-between
//                     ${darkLight ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
//                 <span className={selected ? '' : 'text-gray-400'}>{selected?.label ?? placeholder}</span>
//                 <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
//             </button>
//             {open && (
//                 <div className={`absolute top-full mt-1 left-0 z-50 min-w-full rounded-xl shadow-xl border overflow-hidden
//                     ${darkLight ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
//                     <div onClick={() => { onChange(null); setOpen(false); }}
//                         className={`px-4 py-2.5 text-sm cursor-pointer text-gray-400 ${darkLight ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
//                         All
//                     </div>
//                     {options.map(opt => (
//                         <div key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }}
//                             className={`px-4 py-2.5 text-sm cursor-pointer font-medium
//                                 ${value === opt.value
//                                     ? (darkLight ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-50 text-indigo-600')
//                                     : (darkLight ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700')}`}>
//                             {opt.label}
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// };

// // ==================== DATE FILTER ====================
// const DateFilter = ({ darkLight, fromDate, toDate, onChange }: {
//     darkLight: boolean; fromDate: string; toDate: string; onChange: (from: string, to: string) => void;
// }) => {
//     const [open, setOpen] = useState(false);
//     const [isCustom, setIsCustom] = useState(false);
//     const ref = useRef<HTMLDivElement>(null);
//     const activePreset = DATE_PRESETS.find(p => { const v = p.getValue(); return v.from === fromDate && v.to === toDate; });
//     const label = activePreset?.label ?? (fromDate || toDate ? 'Custom' : 'Date Range');
//     useEffect(() => {
//         const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
//         document.addEventListener('mousedown', h);
//         return () => document.removeEventListener('mousedown', h);
//     }, []);
//     return (
//         <div ref={ref} className="relative">
//             <button onClick={() => setOpen(!open)}
//                 className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all
//                     ${(fromDate || toDate)
//                         ? 'bg-indigo-500 border-indigo-500 text-white'
//                         : darkLight ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
//                 <Calendar className="w-4 h-4" /><span>{label}</span>
//                 <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
//             </button>
//             {open && (
//                 <div className={`absolute top-full mt-1 right-0 z-50 w-72 rounded-xl shadow-xl border p-3
//                     ${darkLight ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
//                     <p className="text-xs font-semibold uppercase tracking-wider mb-2 text-gray-400">Quick Select</p>
//                     <div className="grid grid-cols-2 gap-1.5 mb-3">
//                         {DATE_PRESETS.map(p => (
//                             <button key={p.label} onClick={() => { const v = p.getValue(); onChange(v.from, v.to); setIsCustom(false); setOpen(false); }}
//                                 className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-left
//                                     ${activePreset?.label === p.label
//                                         ? 'bg-indigo-500 text-white'
//                                         : darkLight ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
//                                 {p.label}
//                             </button>
//                         ))}
//                         <button onClick={() => setIsCustom(!isCustom)}
//                             className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-left
//                                 ${isCustom ? 'bg-indigo-500 text-white' : darkLight ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
//                             Custom
//                         </button>
//                     </div>
//                     {isCustom && (
//                         <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-600">
//                             {[
//                                 { lbl: 'From', val: fromDate, set: (v: string) => onChange(v, toDate) },
//                                 { lbl: 'To', val: toDate, set: (v: string) => onChange(fromDate, v) }
//                             ].map(({ lbl, val, set }) => (
//                                 <div key={lbl}>
//                                     <label className={`text-xs font-medium ${darkLight ? 'text-gray-400' : 'text-gray-500'}`}>{lbl}</label>
//                                     <input type="date" value={val} onChange={e => set(e.target.value)}
//                                         className={`w-full mt-1 px-3 py-1.5 rounded-lg text-sm border ${darkLight ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-700'}`} />
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                     {(fromDate || toDate) && (
//                         <button onClick={() => { onChange('', ''); setIsCustom(false); setOpen(false); }}
//                             className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors">
//                             <X className="w-3 h-3" /> Clear Filter
//                         </button>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// };

// // ==================== REFUND MODAL ====================
// const RefundModal = ({ order, darkLight, onClose, onSuccess }: {
//     order: Order; darkLight: boolean; onClose: () => void; onSuccess: () => void;
// }) => {
//     const [reason, setReason] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [animating, setAnimating] = useState(false);

//     useEffect(() => {
//         setTimeout(() => setAnimating(true), 10);
//         document.body.style.overflow = 'hidden';
//         return () => { document.body.style.overflow = ''; };
//     }, []);

//     const handleClose = () => {
//         setAnimating(false);
//         setTimeout(() => onClose(), 300);
//     };

//     const handleConfirm = async () => {
//         setLoading(true);
//         try {
//             await AxiosApi.post(`Order/${order.id}/refund`, { reason });
//             alertify.success('Order refunded successfully');
//             handleClose();
//             onSuccess();
//         } catch (err: any) {
//             alertError(err?.response?.data?.message || 'Refund failed.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const dl = darkLight;

//     return (
//         <>
//             <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${animating ? 'opacity-100' : 'opacity-0'}`}
//                 onClick={handleClose} />
//             <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none transition-all duration-300 ${animating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
//                 <div className={`rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto transform transition-all duration-300
//                     ${dl ? 'bg-gray-800' : 'bg-white'} ${animating ? 'translate-y-0' : 'translate-y-4'}`}
//                     onClick={e => e.stopPropagation()}>
//                     <div className="p-6">

//                         {/* Icon */}
//                         <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 mb-4">
//                             <RotateCcw className="h-8 w-8 text-orange-600" />
//                         </div>

//                         <h3 className={`text-xl font-bold mb-1 text-center ${dl ? 'text-white' : 'text-gray-900'}`}>
//                             Confirm Refund
//                         </h3>
//                         <p className={`text-sm text-center mb-4 ${dl ? 'text-gray-400' : 'text-gray-500'}`}>
//                             Order: <span className="font-semibold font-mono">{order.orderNumber}</span>
//                         </p>

//                         {/* Info */}
//                         <div className={`rounded-xl px-4 py-3 mb-4 space-y-2 ${dl ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
//                             <div className="flex justify-between text-sm">
//                                 <span className={dl ? 'text-gray-400' : 'text-gray-500'}>Amount</span>
//                                 <span className={`font-semibold ${dl ? 'text-white' : 'text-gray-900'}`}>
//                                     ${order.totalAmount?.toFixed(2)}
//                                 </span>
//                             </div>
//                             <div className="flex justify-between text-sm">
//                                 <span className={dl ? 'text-gray-400' : 'text-gray-500'}>Pay Type</span>
//                                 <span className={`font-semibold ${dl ? 'text-white' : 'text-gray-900'}`}>
//                                     {order.paymentMethod?.name}
//                                 </span>
//                             </div>
//                             {/* ✅ Show earned points to be deducted */}
//                             {order.earnedPoints > 0 && (
//                                 <div className="flex justify-between text-sm">
//                                     <span className={dl ? 'text-gray-400' : 'text-gray-500'}>Points to deduct</span>
//                                     <span className="font-semibold text-red-500">
//                                         -{order.earnedPoints} pts
//                                     </span>
//                                 </div>
//                             )}
//                             {/* ✅ Show points to be returned */}
//                             {order.pointsUsed > 0 && (
//                                 <div className="flex justify-between text-sm">
//                                     <span className={dl ? 'text-gray-400' : 'text-gray-500'}>Points to return</span>
//                                     <span className="font-semibold text-emerald-500">
//                                         +{order.pointsUsed} pts
//                                     </span>
//                                 </div>
//                             )}
//                         </div>

//                         {/* Reason */}
//                         <div className="mb-4">
//                             <label className={`block text-sm font-semibold mb-1.5 ${dl ? 'text-gray-300' : 'text-gray-700'}`}>
//                                 Reason (optional)
//                             </label>
//                             <textarea
//                                 rows={3}
//                                 placeholder="Enter refund reason..."
//                                 value={reason}
//                                 onChange={e => setReason(e.target.value)}
//                                 className={`w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none transition-colors ${dl ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-orange-500'
//                                         : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-orange-400'
//                                     }`}
//                             />
//                         </div>

//                         {/* Warning */}
//                         <div className="flex items-start gap-2 mb-5 px-3 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30">
//                             <svg className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                                     d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
//                             </svg>
//                             <p className="text-xs text-orange-400 leading-relaxed">
//                                 This will <strong>restore stock</strong>, <strong>reverse points</strong>, and mark order as <strong>Refunded</strong>. This action cannot be undone.
//                             </p>
//                         </div>

//                         {/* Buttons */}
//                         <div className="flex gap-3">
//                             <button onClick={handleClose} disabled={loading}
//                                 className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all ${dl ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                                     }`}>
//                                 Cancel
//                             </button>
//                             <button onClick={handleConfirm} disabled={loading}
//                                 className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${loading ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 active:scale-95'
//                                     } text-white`}>
//                                 {loading ? (
//                                     <>
//                                         <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
//                                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
//                                         </svg>
//                                         Processing...
//                                     </>
//                                 ) : (
//                                     <><RotateCcw className="w-4 h-4" /> Confirm Refund</>
//                                 )}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// // ==================== ORDER DETAIL MODAL ====================
// const OrderDetailModal = ({ order, darkLight, onClose }: { order: Order; darkLight: boolean; onClose: () => void }) => {
//     useEffect(() => {
//         document.body.style.overflow = 'hidden';
//         return () => { document.body.style.overflow = ''; };
//     }, []);

//     const dl = darkLight;

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 mt-15">
//             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
//             <div className={`relative w-full max-w-3xl max-h-[87vh] overflow-y-auto custom-scrollbar rounded-xl shadow-2xl
//                 ${dl ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-100'}`}
//                 style={{ paddingRight: '6px', scrollbarWidth: 'thin', scrollbarColor: '#9ca3af transparent' }}>

//                 {/* Header */}
//                 <div className={`sticky top-0 z-10 flex items-center justify-between px-6 py-2 border-b ${dl ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
//                     <div className="flex items-center gap-3">
//                         <div className={`p-2 rounded-xl ${dl ? 'bg-indigo-900' : 'bg-indigo-50'}`}>
//                             <ShoppingCart className={`w-5 h-5 ${dl ? 'text-indigo-400' : 'text-indigo-600'}`} />
//                         </div>
//                         <div>
//                             <h2 className={`font-bold text-lg font-mono ${dl ? 'text-indigo-300' : 'text-indigo-600'}`}>{order.orderNumber}</h2>
//                             <p className="text-xs flex items-center gap-1 text-gray-400">
//                                 <Clock className="w-3 h-3" />
//                                 {new Date(order.orderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
//                             </p>
//                         </div>
//                     </div>
//                     <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${dl ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
//                         <X className="w-5 h-5" />
//                     </button>
//                 </div>

//                 <div className="p-6 space-y-5">
//                     {/* Status badges */}
//                     <div className="flex flex-wrap gap-2">
//                         <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusStyle(order.status?.name)}`}>
//                             <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
//                             {order.status?.name}
//                         </span>
//                         <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getPaymentStyle(order.paymentStatus?.name)}`}>
//                             {order.paymentStatus?.name}
//                         </span>
//                         <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${dl ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
//                             {order.saleType?.name}
//                         </span>
//                     </div>

//                     {/* Info grid */}
//                     <div className="grid grid-cols-2 gap-3">
//                         {[
//                             { icon: <User className="w-4 h-4" />, label: 'Staff', value: order.staff?.name ?? 'N/A' },
//                             { icon: <User className="w-4 h-4" />, label: 'Customer', value: order.customer?.name ?? 'Walk-in' },
//                             { icon: <CreditCard className="w-4 h-4" />, label: 'Payment Method', value: order.paymentMethod?.name ?? 'N/A' },
//                             { icon: <Hash className="w-4 h-4" />, label: 'Order ID', value: `#${order.id}` },
//                         ].map(info => (
//                             <div key={info.label} className={`flex items-center gap-3 p-3 rounded-xl ${dl ? 'bg-gray-800' : 'bg-gray-50'}`}>
//                                 <div className={`p-1.5 rounded-lg shadow-sm ${dl ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-500'}`}>{info.icon}</div>
//                                 <div>
//                                     <p className="text-xs text-gray-400">{info.label}</p>
//                                     <p className={`text-sm font-semibold ${dl ? 'text-gray-200' : 'text-gray-700'}`}>{info.value}</p>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>

//                     {/* ✅ Point info — show if customer */}
//                     {(order.earnedPoints > 0 || order.pointsUsed > 0) && (
//                         <div className={`rounded-xl px-4 py-3 flex items-center gap-6 ${dl ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
//                             <span className="text-2xl">⭐</span>
//                             {order.earnedPoints > 0 && (
//                                 <div>
//                                     <p className="text-xs text-gray-400">Earned Points</p>
//                                     <p className={`text-sm font-bold ${dl ? 'text-amber-300' : 'text-amber-700'}`}>+{order.earnedPoints} pts</p>
//                                 </div>
//                             )}
//                             {order.pointsUsed > 0 && (
//                                 <div>
//                                     <p className="text-xs text-gray-400">Points Used</p>
//                                     <p className={`text-sm font-bold ${dl ? 'text-orange-300' : 'text-orange-700'}`}>{order.pointsUsed} pts</p>
//                                 </div>
//                             )}
//                         </div>
//                     )}

//                     {/* Order Items */}
//                     <div>
//                         <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${dl ? 'text-gray-200' : 'text-gray-700'}`}>
//                             <Package className="w-4 h-4" /> Order Items ({order.orderItems?.length ?? 0})
//                         </h3>
//                         <div className="space-y-2">
//                             {order.orderItems?.map(item => {
//                                 const isSerial = !!item.serialNumberId;
//                                 return (
//                                     <div key={item.id} className={`rounded-xl border overflow-hidden ${dl ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
//                                         <div className="flex items-center gap-3 p-3">
//                                             {item.imageProduct
//                                                 ? <img src={item.imageProduct} alt={item.productName}
//                                                     onError={e => { (e.target as HTMLImageElement).src = 'https://yokohama-soei-fc.com/wpdata/wp-content/uploads/2022/03/noimage.png'; }}
//                                                     className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-gray-200" />
//                                                 : <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-xl font-bold ${dl ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>
//                                                     {item.productName?.charAt(0)}
//                                                 </div>
//                                             }
//                                             <div className="flex-1 min-w-0">
//                                                 <div className="flex items-center gap-2 flex-wrap">
//                                                     <p className={`font-semibold text-sm truncate ${dl ? 'text-white' : 'text-gray-800'}`}>{item.productName}</p>
//                                                     {isSerial && (
//                                                         <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${dl ? 'bg-violet-900/60 text-violet-300' : 'bg-violet-100 text-violet-700'}`}>
//                                                             S/N
//                                                         </span>
//                                                     )}
//                                                 </div>
//                                                 <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-gray-400">
//                                                     <span>Qty: <b>{item.quantity}</b></span>
//                                                     <span>Unit: <b>${item.unitPrice.toFixed(2)}</b></span>
//                                                     {isSerial && item.serialNo && (
//                                                         <span className={`font-mono ${dl ? 'text-violet-400' : 'text-violet-600'}`}>{item.serialNo.name}</span>
//                                                     )}
//                                                 </div>
//                                             </div>
//                                             <div className="text-right flex-shrink-0">
//                                                 <p className={`font-bold text-sm ${dl ? 'text-white' : 'text-gray-800'}`}>${item.subTotal.toFixed(2)}</p>
//                                             </div>
//                                         </div>
//                                         {isSerial && item.warrantyMonths && item.warrantyMonths > 0 && (
//                                             <div className={`flex items-center gap-3 px-3 py-2 border-t text-xs ${dl ? 'border-gray-700 bg-violet-900/20' : 'border-violet-100 bg-violet-50'}`}>
//                                                 <Shield className={`w-3.5 h-3.5 shrink-0 ${dl ? 'text-violet-400' : 'text-violet-500'}`} />
//                                                 <span className={`font-semibold ${dl ? 'text-violet-300' : 'text-violet-700'}`}>
//                                                     Warranty {item.warrantyMonths} month{item.warrantyMonths > 1 ? 's' : ''}
//                                                 </span>
//                                                 <span className="text-gray-400">·</span>
//                                                 <span className="text-gray-400">
//                                                     {new Date(item.warrantyStartDate!).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
//                                                 </span>
//                                                 <span className="text-gray-400">→</span>
//                                                 <span className={`font-semibold ${dl ? 'text-violet-300' : 'text-violet-700'}`}>
//                                                     {new Date(item.warrantyEndDate!).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
//                                                 </span>
//                                             </div>
//                                         )}
//                                     </div>
//                                 );
//                             })}
//                         </div>
//                     </div>

//                     {/* Summary */}
//                     <div className={`rounded-xl p-4 space-y-2 ${dl ? 'bg-gray-800' : 'bg-gray-50'}`}>
//                         <h3 className={`text-sm font-bold mb-3 ${dl ? 'text-gray-200' : 'text-gray-700'}`}>Summary</h3>
//                         <div className="flex justify-between text-sm"><span className="text-gray-400">Subtotal</span><span>${order.subTotal.toFixed(2)}</span></div>
//                         <div className="flex justify-between text-sm"><span className="text-gray-400">Tax</span><span>${order.taxAmount.toFixed(2)}</span></div>
//                         <div className="flex justify-between text-sm">
//                             <span className="text-gray-400">Discount</span>
//                             <span className={order.discountAmount > 0 ? 'text-rose-500' : ''}>
//                                 {order.discountAmount > 0 ? `-$${order.discountAmount.toFixed(2)}` : '$0.00'}
//                             </span>
//                         </div>
//                         <div className={`pt-2 mt-2 border-t flex justify-between font-bold text-sm ${dl ? 'border-gray-700' : 'border-gray-200'}`}>
//                             <span>Total</span>
//                             <span className={dl ? 'text-indigo-300' : 'text-indigo-600'}>${order.totalAmount.toFixed(2)}</span>
//                         </div>
//                         {/* ✅ Cash Received */}
//                         <div className={`pt-2 flex justify-between text-sm ${dl ? 'text-gray-400' : 'text-gray-500'}`}>
//                             <span>Cash Received</span>
//                             <span className="font-semibold text-emerald-500">${order.cashReceived.toFixed(2)}</span>
//                         </div>
//                     </div>

//                     {/* Notes */}
//                     {order.notes && (
//                         <div className={`rounded-xl px-4 py-3 ${dl ? 'bg-gray-800' : 'bg-gray-50'}`}>
//                             <p className="text-xs text-gray-400 mb-1">Notes</p>
//                             <p className={`text-sm ${dl ? 'text-gray-300' : 'text-gray-600'}`}>{order.notes}</p>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// // ==================== MAIN COMPONENT ====================
// const OrderList = () => {
//     const { darkLight } = useGlobleContextDarklight();
//     const { setRefreshTables } = useRefreshTable();
//     const [selectedStaff, setSelectedStaff] = useState<SingleValue | null>(null);
//     const [selectedCustomer, setSelectedCustomer] = useState<SingleValue | null>(null);
//     const [status, setStatus] = useState<number | null>(null);
//     const [paymentStatus, setPaymentStatus] = useState<number | null>(null);
//     const [typeProduct, setTypeProduct] = useState<number | null>(null);
//     const [fromDate, setFromDate] = useState('');
//     const [toDate, setToDate] = useState('');
//     const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

//     // ✅ Refund state
//     const [refundOrder, setRefundOrder] = useState<Order | null>(null);

//     const extraParams: Record<string, string> = {};
//     if (selectedCustomer?.id) extraParams['CustomerId'] = String(selectedCustomer.id);
//     if (selectedStaff?.id) extraParams['StaffId'] = String(selectedStaff.id);
//     if (status) extraParams['Status'] = String(status);
//     if (paymentStatus) extraParams['PaymentStatus'] = String(paymentStatus);
//     if (typeProduct) extraParams['TypeProduct'] = String(typeProduct);
//     if (fromDate) extraParams['FromDate'] = fromDate;
//     if (toDate) extraParams['ToDate'] = toDate;

//     const activeFilterCount = [selectedCustomer, selectedStaff, status, paymentStatus, typeProduct, fromDate || toDate].filter(Boolean).length;

//     const clearAllFilters = () => {
//         setSelectedCustomer(null); setSelectedStaff(null);
//         setStatus(null); setPaymentStatus(null); setTypeProduct(null);
//         setFromDate(''); setToDate('');
//     };

//     const columns: TableColumnsType<Order> = [
//         {
//             title: 'Order', key: 'orderNumber', width: 210,
//             render: (_, record) => (
//                 <p className={`font-bold text-sm font-mono ${darkLight ? 'text-indigo-300' : 'text-indigo-600'}`}>
//                     {record.orderNumber}
//                 </p>
//             ),
//         },
//         {
//             title: 'Date', key: 'orderDate', width: 150,
//             render: (_, record) => (
//                 <p className={`text-xs flex items-center gap-1 ${darkLight ? 'text-gray-400' : 'text-gray-500'}`}>
//                     <Clock className="w-3 h-3" />
//                     {new Date(record.orderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
//                 </p>
//             ),
//         },
//         {
//             title: 'Staff', key: 'staff', width: 150, align: 'center',
//             render: (_, record) => (
//                 <span className={`text-sm font-medium ${darkLight ? 'text-gray-200' : 'text-gray-700'}`}>
//                     {record.staff?.name ?? 'N/A'}
//                 </span>
//             ),
//         },
//         {
//             title: 'Items', key: 'items', align: 'center', width: 120,
//             render: (_, record) => (
//                 <div className="flex ms-7">
//                     {record.orderItems?.slice(0, 1).map((item, i) => (
//                         item.imageProduct
//                             ? <img key={i} src={item.imageProduct} alt={item.productName}
//                                 onError={e => { (e.target as HTMLImageElement).src = 'https://yokohama-soei-fc.com/wpdata/wp-content/uploads/2022/03/noimage.png'; }}
//                                 className="w-8 h-8 rounded-lg object-cover border border-gray-200" />
//                             : <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${darkLight ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>
//                                 {item.productName?.charAt(0)}
//                             </div>
//                     ))}
//                     {record.orderItems?.length > 1 && (
//                         <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${darkLight ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>
//                             +{record.orderItems.length - 1}
//                         </span>
//                     )}
//                 </div>
//             ),
//         },
//         {
//             title: 'Amount', key: 'amount', align: 'center',
//             render: (_, record) => (
//                 <p className={`font-bold text-sm ${darkLight ? 'text-white' : 'text-gray-800'}`}>
//                     ${record?.cashReceived?.toFixed(2)}
//                 </p>
//             ),
//         },
//         {
//             title: 'Pay Point', key: 'pointsUsed', align: 'center',
//             render: (_, record) => (
//                 <p className={`font-bold text-sm ${record.pointsUsed > 0 ? 'text-amber-500' : darkLight ? 'text-gray-400' : 'text-gray-400'}`}>
//                     {record.pointsUsed > 0 ? `${record.pointsUsed} pts` : 'N/A'}
//                 </p>
//             ),
//         },
//         {
//             title: 'EarnedPoints', key: 'earnedPoints', align: 'center',
//             render: (_, record) => (
//                 <p className={`font-bold text-sm ${record.earnedPoints > 0 ? 'text-emerald-500' : darkLight ? 'text-gray-400' : 'text-gray-400'}`}>
//                     {record.earnedPoints > 0 ? `+${record.earnedPoints} pts` : 'N/A'}
//                 </p>
//             ),
//         },
//         {
//             title: 'Status', key: 'status', align: 'center',
//             render: (_, record) => (
//                 <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(record.status?.name)}`}>
//                     <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
//                     {record.status?.name}
//                 </span>
//             ),
//         },
//         {
//             title: 'Pay-Status', key: 'paymentStatus', align: 'center',
//             render: (_, record) => (
//                 <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getPaymentStyle(record.paymentStatus?.name)}`}>
//                     {record.paymentStatus?.name}
//                 </span>
//             ),
//         },
//         {
//             title: 'Pay-Type', key: 'paymentMethod', align: 'center',
//             render: (_, record) => (
//                 <span className={`text-xs ${darkLight ? 'text-gray-400' : 'text-gray-500'}`}>
//                     {record.paymentMethod?.name}
//                 </span>
//             ),
//         },
//         {
//             title: 'Sale Type', key: 'saleType', align: 'center',
//             render: (_, record) => (
//                 <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${darkLight ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
//                     {record.saleType?.name}
//                 </span>
//             ),
//         },
//         {
//             title: 'Action', key: 'action', align: 'center', width: 140,
//             render: (_, record) => (
//                 <div className="flex gap-1.5 justify-end">
//                     {record.paymentStatus?.id === 2 && (
//                         <button onClick={() => setRefundOrder(record)}
//                             className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
//                                 ${darkLight ? 'bg-orange-900/50 text-orange-300 hover:bg-orange-900' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}>
//                             <RotateCcw className="w-3.5 h-3.5" /> Refund
//                         </button>
//                     )}
//                     {/* View button */}
//                     <button onClick={() => setSelectedOrder(record)}
//                         className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
//                             ${darkLight ? 'bg-indigo-900 text-indigo-300 hover:bg-indigo-800' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
//                         <Eye className="w-3.5 h-3.5" /> View
//                     </button>
//                 </div>
//             ),
//         },
//     ];

//     return (
//         <>
//             {/* Header */}
//             <div className="flex justify-between items-center mt-1 mb-2">
//                 <div className="flex items-center gap-3">
//                     <div className={`p-2.5 rounded-xl ${darkLight ? 'bg-indigo-900' : 'bg-indigo-50'}`}>
//                         <ShoppingCart className={`w-6 h-6 ${darkLight ? 'text-indigo-400' : 'text-indigo-600'}`} />
//                     </div>
//                     <div>
//                         <h3 className={`font-bold text-2xl ${darkLight ? 'text-white' : 'text-gray-900'}`}>ORDER MANAGEMENT</h3>
//                         <p className={`text-xs ${darkLight ? 'text-gray-400' : 'text-gray-400'}`}>Track and manage all orders</p>
//                     </div>
//                 </div>
//                 <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${darkLight ? 'bg-gray-700 text-gray-300' : 'bg-indigo-50 text-indigo-600'}`}>
//                     <TrendingUp className="w-4 h-4" /> Live
//                 </div>
//             </div>

//             {/* Filter Bar */}
//             <div className={`rounded-2xl border p-2 mb-1 shadow-sm ${darkLight ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
//                 <div className="flex items-center gap-2 flex-wrap">
//                     <div className="flex items-center gap-2">
//                         <Filter className={`w-4 h-4 ${darkLight ? 'text-gray-400' : 'text-gray-400'}`} />
//                         <span className={`text-sm font-semibold ${darkLight ? 'text-gray-300' : 'text-gray-600'}`}>Filters</span>
//                         {activeFilterCount > 0 && (
//                             <span className="bg-indigo-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
//                         )}
//                     </div>
//                     <div className={`w-px h-5 mx-1 ${darkLight ? 'bg-gray-600' : 'bg-gray-200'}`} />

//                     <SelectDropdown placeholder="Status" options={STATUS_OPTIONS} value={status} onChange={setStatus} darkLight={darkLight} />
//                     <SelectDropdown placeholder="Payment" options={PAYMENT_STATUS_OPTIONS} value={paymentStatus} onChange={setPaymentStatus} darkLight={darkLight} />
//                     <SelectDropdown placeholder="Type Product" options={TYPE_PRODUCT} value={typeProduct} onChange={setTypeProduct} darkLight={darkLight} />

//                     <div className="w-50">
//                         <XSelectSearch
//                             value={selectedStaff}
//                             onChange={v => setSelectedStaff(v as SingleValue | null)}
//                             placeholder="Staff..."
//                             selectOption={{ apiEndpoint: 'Person', id: 'id', name: 'username', searchParam: 'Search' }}
//                         />
//                     </div>

//                     <div className="w-45">
//                         <XSelectSearch
//                             value={selectedCustomer}
//                             onChange={v => setSelectedCustomer(v as SingleValue | null)}
//                             placeholder="Customer..."
//                             selectOption={{ apiEndpoint: 'Customer', id: 'id', name: 'firstName + lastName', searchParam: 'Search' }}
//                         />
//                     </div>

//                     <DateFilter darkLight={darkLight} fromDate={fromDate} toDate={toDate}
//                         onChange={(from, to) => { setFromDate(from); setToDate(to); }} />

//                     {activeFilterCount > 0 && (
//                         <button onClick={clearAllFilters}
//                             className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors border border-red-200">
//                             <X className="w-3 h-3" /> Clear All
//                         </button>
//                     )}
//                 </div>
//             </div>

//             {/* Table */}
//             <XDataTable
//                 TableName='Order List'
//                 columns={columns}
//                 apiUrl='Order'
//                 selection={false}
//                 hideAction={true}
//                 searchPlaceholder="Search by order number..."
//                 extraParams={extraParams}
//             />

//             {/* View Modal */}
//             {selectedOrder && (
//                 <OrderDetailModal
//                     order={selectedOrder}
//                     darkLight={darkLight}
//                     onClose={() => setSelectedOrder(null)}
//                 />
//             )}

//             {/* ✅ Refund Modal */}
//             {refundOrder && (
//                 <RefundModal
//                     order={refundOrder}
//                     darkLight={darkLight}
//                     onClose={() => setRefundOrder(null)}
//                     onSuccess={() => {
//                         setRefundOrder(null);
//                         setRefreshTables(new Date());
//                     }}
//                 />
//             )}
//         </>
//     );
// };

// export default OrderList;




import type { TableColumnsType } from 'antd';
import XDataTable from '../../component/XDataTable/XDataTable';
import "../../component/XDataTable/XdataTable.css";
import { useState, useRef, useEffect } from 'react';
import { useGlobleContextDarklight, useRefreshTable } from '../../AllContext/context';
import { ShoppingCart, ChevronDown, X, TrendingUp, Eye, Package, CreditCard, User, Clock, Hash, Shield, RotateCcw, SlidersHorizontal } from 'lucide-react';
import XSelectSearch, { SingleValue } from '../../component/XSelectSearch/Xselectsearch';
import { AxiosApi } from '../../component/Axios/Axios';
import { alertError } from '../../HtmlHelper/Alert';
import alertify from 'alertifyjs';

// ==================== INTERFACES ====================
interface SerialNo { id: number; name: string; }
interface TypeNamebase { id: number; name: string; }
interface OrderItem {
    id: number; orderId: number; productId: number; productName: string;
    imageProduct: string; serialNumberId: number | null; serialNo: SerialNo | null;
    quantity: number; unitPrice: number; subTotal: number;
    warrantyMonths: number | null; warrantyStartDate: string | null; warrantyEndDate: string | null;
}
interface Order {
    id: number; orderNumber: string; orderDate: string;
    customerId: number; customer: TypeNamebase | null;
    staffId: number; staff: TypeNamebase | null;
    subTotal: number; discountAmount: number; taxAmount: number; totalAmount: number;
    earnedPoints: number; pointsUsed: number; cashReceived: number;
    status: TypeNamebase; saleType: TypeNamebase; paymentStatus: TypeNamebase;
    paymentMethod: TypeNamebase; notes: string; orderItems: OrderItem[];
}

// ==================== CONSTANTS ====================
const STATUS_OPTIONS = [
    { value: 1, label: 'Pending' }, { value: 2, label: 'Processing' },
    { value: 3, label: 'Completed' }, { value: 4, label: 'Cancelled' }, { value: 5, label: 'Refunded' },
];
const PAYMENT_STATUS_OPTIONS = [
    { value: 1, label: 'Unpaid' }, { value: 2, label: 'Paid' }, { value: 3, label: 'Refunded' },
];
const TYPE_PRODUCT = [
    { value: 1, label: 'Serial' }, { value: 2, label: 'NoSerial' }
];
const DATE_PRESETS = [
    { label: 'Today', getValue: () => { const d = new Date(); return { from: fmt(d), to: fmt(d) }; } },
    { label: 'This Week', getValue: () => { const now = new Date(); const mon = new Date(now); mon.setDate(now.getDate() - now.getDay() + 1); return { from: fmt(mon), to: fmt(now) }; } },
    { label: 'This Month', getValue: () => { const now = new Date(); const first = new Date(now.getFullYear(), now.getMonth(), 1); return { from: fmt(first), to: fmt(now) }; } },
    { label: 'Last Month', getValue: () => { const now = new Date(); const first = new Date(now.getFullYear(), now.getMonth() - 1, 1); const last = new Date(now.getFullYear(), now.getMonth(), 0); return { from: fmt(first), to: fmt(last) }; } },
    { label: 'This Year', getValue: () => { const now = new Date(); const first = new Date(now.getFullYear(), 0, 1); return { from: fmt(first), to: fmt(now) }; } },
];
function fmt(d: Date) { return d.toISOString().split('T')[0]; }

// ==================== STATUS STYLES ====================
const getStatusStyle = (name: string) => ({
    Completed: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    Processing: 'bg-blue-100 text-blue-700 border border-blue-200',
    Pending: 'bg-amber-100 text-amber-700 border border-amber-200',
    Cancelled: 'bg-red-100 text-red-700 border border-red-200',
    Refunded: 'bg-purple-100 text-purple-700 border border-purple-200',
} as Record<string, string>)[name] ?? 'bg-gray-100 text-gray-600 border border-gray-200';

const getPaymentStyle = (name: string) => ({
    Paid: 'bg-teal-100 text-teal-700 border border-teal-200',
    Unpaid: 'bg-rose-100 text-rose-700 border border-rose-200',
    Partial: 'bg-orange-100 text-orange-700 border border-orange-200',
    Refunded: 'bg-purple-100 text-purple-700 border border-purple-200',
} as Record<string, string>)[name] ?? 'bg-gray-100 text-gray-600 border border-gray-200';

// ==================== SELECT DROPDOWN ====================
interface SelectOption { value: number; label: string; }
const SelectDropdown = ({ placeholder, options, value, onChange, darkLight }: {
    placeholder: string; options: SelectOption[]; value: number | null;
    onChange: (v: number | null) => void; darkLight: boolean;
}) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const selected = options.find(o => o.value === value);
    useEffect(() => {
        const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);
    return (
        <div ref={ref} className="relative w-full">
            <button onClick={() => setOpen(!open)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all w-full justify-between
                    ${darkLight ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                <span className={selected ? '' : 'text-gray-400'}>{selected?.label ?? placeholder}</span>
                <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className={`absolute top-full mt-1 left-0 z-50 min-w-full rounded-xl shadow-xl border overflow-hidden
                    ${darkLight ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div onClick={() => { onChange(null); setOpen(false); }}
                        className={`px-4 py-2.5 text-sm cursor-pointer text-gray-400 ${darkLight ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                        All
                    </div>
                    {options.map(opt => (
                        <div key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }}
                            className={`px-4 py-2.5 text-sm cursor-pointer font-medium
                                ${value === opt.value
                                    ? (darkLight ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-50 text-indigo-600')
                                    : (darkLight ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-50 text-gray-700')}`}>
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ==================== DATE FILTER ====================
const DateFilter = ({ darkLight, fromDate, toDate, onChange }: {
    darkLight: boolean; fromDate: string; toDate: string; onChange: (from: string, to: string) => void;
}) => {
    const [isCustom, setIsCustom] = useState(false);
    const activePreset = DATE_PRESETS.find(p => { const v = p.getValue(); return v.from === fromDate && v.to === toDate; });

    return (
        <div className="space-y-2">
            <label className={`text-xs font-semibold ${darkLight ? 'text-gray-400' : 'text-gray-500'}`}>Date Range</label>
            {/* Quick presets */}
            <div className="grid grid-cols-3 gap-1.5">
                {DATE_PRESETS.map(p => (
                    <button key={p.label} onClick={() => { const v = p.getValue(); onChange(v.from, v.to); setIsCustom(false); }}
                        className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all text-center
                            ${activePreset?.label === p.label
                                ? 'bg-indigo-500 text-white'
                                : darkLight ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                        {p.label}
                    </button>
                ))}
                <button onClick={() => setIsCustom(!isCustom)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all text-center
                        ${isCustom ? 'bg-indigo-500 text-white' : darkLight ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                    Custom
                </button>
            </div>
            {/* Custom date inputs */}
            {isCustom && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                    {[
                        { lbl: 'From', val: fromDate, set: (v: string) => onChange(v, toDate) },
                        { lbl: 'To', val: toDate, set: (v: string) => onChange(fromDate, v) }
                    ].map(({ lbl, val, set }) => (
                        <div key={lbl}>
                            <label className={`text-xs font-medium ${darkLight ? 'text-gray-400' : 'text-gray-500'}`}>{lbl}</label>
                            <input type="date" value={val} onChange={e => set(e.target.value)}
                                className={`w-full mt-1 px-3 py-1.5 rounded-lg text-sm border ${darkLight ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-700'}`} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ==================== FILTER MODAL ====================
const FilterModal = ({ darkLight, onClose, filters, onApply }: {
    darkLight: boolean;
    onClose: () => void;
    filters: {
        status: number | null; paymentStatus: number | null; typeProduct: number | null;
        fromDate: string; toDate: string;
        selectedStaff: SingleValue | null; selectedCustomer: SingleValue | null;
    };
    onApply: (f: typeof filters) => void;
}) => {
    const dl = darkLight;
    // Local draft state — only applied when user clicks Apply
    const [draft, setDraft] = useState({ ...filters });
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        setTimeout(() => setAnimating(true), 10);
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const handleClose = () => {
        setAnimating(false);
        setTimeout(onClose, 250);
    };

    const handleApply = () => {
        onApply(draft);
        handleClose();
    };

    const handleClear = () => {
        setDraft({ status: null, paymentStatus: null, typeProduct: null, fromDate: '', toDate: '', selectedStaff: null, selectedCustomer: null });
    };

    const activeCount = [draft.selectedCustomer, draft.selectedStaff, draft.status, draft.paymentStatus, draft.typeProduct, draft.fromDate || draft.toDate].filter(Boolean).length;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-250 ${animating ? 'opacity-100' : 'opacity-0'}`}
                onClick={handleClose}
            />

            {/* Drawer — slides up from bottom on mobile, centered modal on desktop */}
            <div className={`fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-50 p-0 md:p-4 pointer-events-none transition-all duration-250 ${animating ? 'opacity-100' : 'opacity-0'}`}>
                <div
                    className={`w-full md:max-w-lg pointer-events-auto rounded-t-2xl md:rounded-2xl shadow-2xl transform transition-all duration-250
                        ${animating ? 'translate-y-0' : 'translate-y-full md:translate-y-4'}
                        ${dl ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Handle bar (mobile) */}
                    <div className="flex justify-center pt-3 md:hidden">
                        <div className={`w-10 h-1 rounded-full ${dl ? 'bg-gray-600' : 'bg-gray-300'}`} />
                    </div>

                    {/* Header */}
                    <div className={`flex items-center justify-between px-5 py-4 border-b ${dl ? 'border-gray-700' : 'border-gray-100'}`}>
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className={`w-5 h-5 ${dl ? 'text-indigo-400' : 'text-indigo-600'}`} />
                            <h3 className={`font-bold text-lg ${dl ? 'text-white' : 'text-gray-900'}`}>Filters</h3>
                            {activeCount > 0 && (
                                <span className="bg-indigo-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{activeCount}</span>
                            )}
                        </div>
                        <button onClick={handleClose} className={`p-2 rounded-xl transition-colors ${dl ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-5 py-4 space-y-5 max-h-[65vh] overflow-y-auto">

                        {/* Status + Payment Status */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className={`text-xs font-semibold ${dl ? 'text-gray-400' : 'text-gray-500'}`}>Order Status</label>
                                <SelectDropdown placeholder="All" options={STATUS_OPTIONS} value={draft.status} onChange={v => setDraft(p => ({ ...p, status: v }))} darkLight={dl} />
                            </div>
                            <div className="space-y-1.5">
                                <label className={`text-xs font-semibold ${dl ? 'text-gray-400' : 'text-gray-500'}`}>Payment Status</label>
                                <SelectDropdown placeholder="All" options={PAYMENT_STATUS_OPTIONS} value={draft.paymentStatus} onChange={v => setDraft(p => ({ ...p, paymentStatus: v }))} darkLight={dl} />
                            </div>
                        </div>

                        {/* Type Product */}
                        <div className="space-y-1.5">
                            <label className={`text-xs font-semibold ${dl ? 'text-gray-400' : 'text-gray-500'}`}>Product Type</label>
                            <SelectDropdown placeholder="All Types" options={TYPE_PRODUCT} value={draft.typeProduct} onChange={v => setDraft(p => ({ ...p, typeProduct: v }))} darkLight={dl} />
                        </div>

                        {/* Staff */}
                        <div className="space-y-1.5">
                            <label className={`text-xs font-semibold ${dl ? 'text-gray-400' : 'text-gray-500'}`}>Staff</label>
                            <XSelectSearch
                                value={draft.selectedStaff}
                                onChange={v => setDraft(p => ({ ...p, selectedStaff: v as SingleValue | null }))}
                                placeholder="Search staff..."
                                selectOption={{ apiEndpoint: 'Person', id: 'id', name: 'username', searchParam: 'Search' }}
                            />
                        </div>

                        {/* Customer */}
                        <div className="space-y-1.5">
                            <label className={`text-xs font-semibold ${dl ? 'text-gray-400' : 'text-gray-500'}`}>Customer</label>
                            <XSelectSearch
                                value={draft.selectedCustomer}
                                onChange={v => setDraft(p => ({ ...p, selectedCustomer: v as SingleValue | null }))}
                                placeholder="Search customer..."
                                selectOption={{ apiEndpoint: 'Customer', id: 'id', name: 'firstName + lastName', searchParam: 'Search' }}
                            />
                        </div>

                        {/* Date */}
                        <DateFilter
                            darkLight={dl}
                            fromDate={draft.fromDate}
                            toDate={draft.toDate}
                            onChange={(from, to) => setDraft(p => ({ ...p, fromDate: from, toDate: to }))}
                        />
                    </div>

                    {/* Footer */}
                    <div className={`flex gap-3 px-5 py-4 border-t ${dl ? 'border-gray-700' : 'border-gray-100'}`}>
                        <button
                            onClick={handleClear}
                            className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all border
                                ${activeCount > 0
                                    ? 'border-red-300 text-red-500 hover:bg-red-50'
                                    : dl ? 'border-gray-600 text-gray-400' : 'border-gray-200 text-gray-400'
                                }`}
                        >
                            Clear All
                        </button>
                        <button
                            onClick={handleApply}
                            className="flex-1 py-2.5 rounded-xl font-medium text-sm bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white transition-all"
                        >
                            Apply {activeCount > 0 && `(${activeCount})`}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

// ==================== REFUND MODAL ====================
const RefundModal = ({ order, darkLight, onClose, onSuccess }: {
    order: Order; darkLight: boolean; onClose: () => void; onSuccess: () => void;
}) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        setTimeout(() => setAnimating(true), 10);
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const handleClose = () => { setAnimating(false); setTimeout(onClose, 300); };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await AxiosApi.post(`Order/${order.id}/refund`, { reason });
            alertify.success('Order refunded successfully');
            handleClose();
            onSuccess();
        } catch (err: any) {
            alertError(err?.response?.data?.message || 'Refund failed.');
        } finally { setLoading(false); }
    };

    const dl = darkLight;

    return (
        <>
            <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${animating ? 'opacity-100' : 'opacity-0'}`} onClick={handleClose} />
            <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none transition-all duration-300 ${animating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <div className={`rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto ${dl ? 'bg-gray-800' : 'bg-white'} ${animating ? 'translate-y-0' : 'translate-y-4'}`} onClick={e => e.stopPropagation()}>
                    <div className="p-6">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 mb-4">
                            <RotateCcw className="h-8 w-8 text-orange-600" />
                        </div>
                        <h3 className={`text-xl font-bold mb-1 text-center ${dl ? 'text-white' : 'text-gray-900'}`}>Confirm Refund</h3>
                        <p className={`text-sm text-center mb-4 ${dl ? 'text-gray-400' : 'text-gray-500'}`}>
                            Order: <span className="font-semibold font-mono">{order.orderNumber}</span>
                        </p>
                        <div className={`rounded-xl px-4 py-3 mb-4 space-y-2 ${dl ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className="flex justify-between text-sm">
                                <span className={dl ? 'text-gray-400' : 'text-gray-500'}>Amount</span>
                                <span className={`font-semibold ${dl ? 'text-white' : 'text-gray-900'}`}>${order.totalAmount?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className={dl ? 'text-gray-400' : 'text-gray-500'}>Pay Type</span>
                                <span className={`font-semibold ${dl ? 'text-white' : 'text-gray-900'}`}>{order.paymentMethod?.name}</span>
                            </div>
                            {order.earnedPoints > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className={dl ? 'text-gray-400' : 'text-gray-500'}>Points to deduct</span>
                                    <span className="font-semibold text-red-500">-{order.earnedPoints} pts</span>
                                </div>
                            )}
                            {order.pointsUsed > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className={dl ? 'text-gray-400' : 'text-gray-500'}>Points to return</span>
                                    <span className="font-semibold text-emerald-500">+{order.pointsUsed} pts</span>
                                </div>
                            )}
                        </div>
                        <div className="mb-4">
                            <label className={`block text-sm font-semibold mb-1.5 ${dl ? 'text-gray-300' : 'text-gray-700'}`}>Reason (optional)</label>
                            <textarea rows={3} placeholder="Enter refund reason..." value={reason} onChange={e => setReason(e.target.value)}
                                className={`w-full px-3 py-2 rounded-xl border text-sm outline-none resize-none transition-colors
                                    ${dl ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-orange-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-orange-400'}`} />
                        </div>
                        <div className="flex items-start gap-2 mb-5 px-3 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30">
                            <svg className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                            <p className="text-xs text-orange-400 leading-relaxed">
                                This will <strong>restore stock</strong>, <strong>reverse points</strong>, and mark order as <strong>Refunded</strong>. This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleClose} disabled={loading}
                                className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all ${dl ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                Cancel
                            </button>
                            <button onClick={handleConfirm} disabled={loading}
                                className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${loading ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 active:scale-95'} text-white`}>
                                {loading ? (<><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Processing...</>) : (<><RotateCcw className="w-4 h-4" /> Confirm Refund</>)}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// ==================== ORDER DETAIL MODAL ====================
const OrderDetailModal = ({ order, darkLight, onClose }: { order: Order; darkLight: boolean; onClose: () => void }) => {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);
    const dl = darkLight;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 mt-15">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full max-w-3xl max-h-[87vh] overflow-y-auto custom-scrollbar rounded-xl shadow-2xl
                ${dl ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-100'}`}
                style={{ paddingRight: '6px', scrollbarWidth: 'thin', scrollbarColor: '#9ca3af transparent' }}>
                <div className={`sticky top-0 z-10 flex items-center justify-between px-6 py-2 border-b ${dl ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${dl ? 'bg-indigo-900' : 'bg-indigo-50'}`}>
                            <ShoppingCart className={`w-5 h-5 ${dl ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        </div>
                        <div>
                            <h2 className={`font-bold text-lg font-mono ${dl ? 'text-indigo-300' : 'text-indigo-600'}`}>{order.orderNumber}</h2>
                            <p className="text-xs flex items-center gap-1 text-gray-400">
                                <Clock className="w-3 h-3" />
                                {new Date(order.orderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${dl ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-5">
                    <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusStyle(order.status?.name)}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />{order.status?.name}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getPaymentStyle(order.paymentStatus?.name)}`}>{order.paymentStatus?.name}</span>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${dl ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>{order.saleType?.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { icon: <User className="w-4 h-4" />, label: 'Staff', value: order.staff?.name ?? 'N/A' },
                            { icon: <User className="w-4 h-4" />, label: 'Customer', value: order.customer?.name ?? 'Walk-in' },
                            { icon: <CreditCard className="w-4 h-4" />, label: 'Payment Method', value: order.paymentMethod?.name ?? 'N/A' },
                            { icon: <Hash className="w-4 h-4" />, label: 'Order ID', value: `#${order.id}` },
                        ].map(info => (
                            <div key={info.label} className={`flex items-center gap-3 p-3 rounded-xl ${dl ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                <div className={`p-1.5 rounded-lg shadow-sm ${dl ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-500'}`}>{info.icon}</div>
                                <div>
                                    <p className="text-xs text-gray-400">{info.label}</p>
                                    <p className={`text-sm font-semibold ${dl ? 'text-gray-200' : 'text-gray-700'}`}>{info.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {(order.earnedPoints > 0 || order.pointsUsed > 0) && (
                        <div className={`rounded-xl px-4 py-3 flex items-center gap-6 ${dl ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                            <span className="text-2xl">⭐</span>
                            {order.earnedPoints > 0 && <div><p className="text-xs text-gray-400">Earned Points</p><p className={`text-sm font-bold ${dl ? 'text-amber-300' : 'text-amber-700'}`}>+{order.earnedPoints} pts</p></div>}
                            {order.pointsUsed > 0 && <div><p className="text-xs text-gray-400">Points Used</p><p className={`text-sm font-bold ${dl ? 'text-orange-300' : 'text-orange-700'}`}>{order.pointsUsed} pts</p></div>}
                        </div>
                    )}
                    <div>
                        <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${dl ? 'text-gray-200' : 'text-gray-700'}`}>
                            <Package className="w-4 h-4" /> Order Items ({order.orderItems?.length ?? 0})
                        </h3>
                        <div className="space-y-2">
                            {order.orderItems?.map(item => {
                                const isSerial = !!item.serialNumberId;
                                return (
                                    <div key={item.id} className={`rounded-xl border overflow-hidden ${dl ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                                        <div className="flex items-center gap-3 p-3">
                                            {item.imageProduct
                                                ? <img src={item.imageProduct} alt={item.productName} onError={e => { (e.target as HTMLImageElement).src = 'https://yokohama-soei-fc.com/wpdata/wp-content/uploads/2022/03/noimage.png'; }} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-gray-200" />
                                                : <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-xl font-bold ${dl ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>{item.productName?.charAt(0)}</div>
                                            }
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className={`font-semibold text-sm truncate ${dl ? 'text-white' : 'text-gray-800'}`}>{item.productName}</p>
                                                    {isSerial && <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${dl ? 'bg-violet-900/60 text-violet-300' : 'bg-violet-100 text-violet-700'}`}>S/N</span>}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-gray-400">
                                                    <span>Qty: <b>{item.quantity}</b></span>
                                                    <span>Unit: <b>${item.unitPrice.toFixed(2)}</b></span>
                                                    {isSerial && item.serialNo && <span className={`font-mono ${dl ? 'text-violet-400' : 'text-violet-600'}`}>{item.serialNo.name}</span>}
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className={`font-bold text-sm ${dl ? 'text-white' : 'text-gray-800'}`}>${item.subTotal.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        {isSerial && item.warrantyMonths && item.warrantyMonths > 0 && (
                                            <div className={`flex items-center gap-3 px-3 py-2 border-t text-xs ${dl ? 'border-gray-700 bg-violet-900/20' : 'border-violet-100 bg-violet-50'}`}>
                                                <Shield className={`w-3.5 h-3.5 shrink-0 ${dl ? 'text-violet-400' : 'text-violet-500'}`} />
                                                <span className={`font-semibold ${dl ? 'text-violet-300' : 'text-violet-700'}`}>Warranty {item.warrantyMonths} month{item.warrantyMonths > 1 ? 's' : ''}</span>
                                                <span className="text-gray-400">·</span>
                                                <span className="text-gray-400">{new Date(item.warrantyStartDate!).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                <span className="text-gray-400">→</span>
                                                <span className={`font-semibold ${dl ? 'text-violet-300' : 'text-violet-700'}`}>{new Date(item.warrantyEndDate!).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className={`rounded-xl p-4 space-y-2 ${dl ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <h3 className={`text-sm font-bold mb-3 ${dl ? 'text-gray-200' : 'text-gray-700'}`}>Summary</h3>
                        <div className="flex justify-between text-sm"><span className="text-gray-400">Subtotal</span><span>${order.subTotal.toFixed(2)}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-400">Tax</span><span>${order.taxAmount.toFixed(2)}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-400">Discount</span><span className={order.discountAmount > 0 ? 'text-rose-500' : ''}>{order.discountAmount > 0 ? `-$${order.discountAmount.toFixed(2)}` : '$0.00'}</span></div>
                        <div className={`pt-2 mt-2 border-t flex justify-between font-bold text-sm ${dl ? 'border-gray-700' : 'border-gray-200'}`}>
                            <span>Total</span><span className={dl ? 'text-indigo-300' : 'text-indigo-600'}>${order.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className={`pt-2 flex justify-between text-sm ${dl ? 'text-gray-400' : 'text-gray-500'}`}>
                            <span>Cash Received</span><span className="font-semibold text-emerald-500">${order.cashReceived.toFixed(2)}</span>
                        </div>
                    </div>
                    {order.notes && (
                        <div className={`rounded-xl px-4 py-3 ${dl ? 'bg-gray-800' : 'bg-gray-50'}`}>
                            <p className="text-xs text-gray-400 mb-1">Notes</p>
                            <p className={`text-sm ${dl ? 'text-gray-300' : 'text-gray-600'}`}>{order.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ==================== MAIN COMPONENT ====================
const OrderList = () => {
    const { darkLight } = useGlobleContextDarklight();
    const { setRefreshTables } = useRefreshTable();

    const [showFilter, setShowFilter] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<SingleValue | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<SingleValue | null>(null);
    const [status, setStatus] = useState<number | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<number | null>(null);
    const [typeProduct, setTypeProduct] = useState<number | null>(null);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [refundOrder, setRefundOrder] = useState<Order | null>(null);

    const extraParams: Record<string, string> = {};
    if (selectedCustomer?.id) extraParams['CustomerId'] = String(selectedCustomer.id);
    if (selectedStaff?.id) extraParams['StaffId'] = String(selectedStaff.id);
    if (status) extraParams['Status'] = String(status);
    if (paymentStatus) extraParams['PaymentStatus'] = String(paymentStatus);
    if (typeProduct) extraParams['TypeProduct'] = String(typeProduct);
    if (fromDate) extraParams['FromDate'] = fromDate;
    if (toDate) extraParams['ToDate'] = toDate;

    const activeFilterCount = [selectedCustomer, selectedStaff, status, paymentStatus, typeProduct, fromDate || toDate].filter(Boolean).length;

    const handleApplyFilter = (f: {
        status: number | null; paymentStatus: number | null; typeProduct: number | null;
        fromDate: string; toDate: string; selectedStaff: SingleValue | null; selectedCustomer: SingleValue | null;
    }) => {
        setStatus(f.status);
        setPaymentStatus(f.paymentStatus);
        setTypeProduct(f.typeProduct);
        setFromDate(f.fromDate);
        setToDate(f.toDate);
        setSelectedStaff(f.selectedStaff);
        setSelectedCustomer(f.selectedCustomer);
    };

    const columns: TableColumnsType<Order> = [
        {
            title: 'Order', key: 'orderNumber', width: 210,
            render: (_, record) => (
                <p className={`font-bold text-sm font-mono ${darkLight ? 'text-indigo-300' : 'text-indigo-600'}`}>{record.orderNumber}</p>
            ),
        },
        {
            title: 'Date', key: 'orderDate', width: 150,
            render: (_, record) => (
                <p className={`text-xs flex items-center gap-1 ${darkLight ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Clock className="w-3 h-3" />
                    {new Date(record.orderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
            ),
        },
        {
            title: 'Staff', key: 'staff', width: 150, align: 'center',
            render: (_, record) => <span className={`text-sm font-medium ${darkLight ? 'text-gray-200' : 'text-gray-700'}`}>{record.staff?.name ?? 'N/A'}</span>,
        },
        {
            title: 'Items', key: 'items', align: 'center', width: 120,
            render: (_, record) => (
                <div className="flex ms-7">
                    {record.orderItems?.slice(0, 1).map((item, i) => (
                        item.imageProduct
                            ? <img key={i} src={item.imageProduct} alt={item.productName} onError={e => { (e.target as HTMLImageElement).src = 'https://yokohama-soei-fc.com/wpdata/wp-content/uploads/2022/03/noimage.png'; }} className="w-8 h-8 rounded-lg object-cover border border-gray-200" />
                            : <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${darkLight ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>{item.productName?.charAt(0)}</div>
                    ))}
                    {record.orderItems?.length > 1 && (
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${darkLight ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>+{record.orderItems.length - 1}</span>
                    )}
                </div>
            ),
        },
        { title: 'Amount', key: 'amount', align: 'center', render: (_, r) => <p className={`font-bold text-sm ${darkLight ? 'text-white' : 'text-gray-800'}`}>${r?.cashReceived?.toFixed(2)}</p> },
        { title: 'Pay Point', key: 'pointsUsed', align: 'center', render: (_, r) => <p className={`font-bold text-sm ${r.pointsUsed > 0 ? 'text-amber-500' : darkLight ? 'text-gray-400' : 'text-gray-400'}`}>{r.pointsUsed > 0 ? `${r.pointsUsed} pts` : 'N/A'}</p> },
        { title: 'EarnedPoints', key: 'earnedPoints', align: 'center', render: (_, r) => <p className={`font-bold text-sm ${r.earnedPoints > 0 ? 'text-emerald-500' : darkLight ? 'text-gray-400' : 'text-gray-400'}`}>{r.earnedPoints > 0 ? `+${r.earnedPoints} pts` : 'N/A'}</p> },
        { title: 'Status', key: 'status', align: 'center', render: (_, r) => <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(r.status?.name)}`}><span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />{r.status?.name}</span> },
        { title: 'Pay-Status', key: 'paymentStatus', align: 'center', render: (_, r) => <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getPaymentStyle(r.paymentStatus?.name)}`}>{r.paymentStatus?.name}</span> },
        { title: 'Pay-Type', key: 'paymentMethod', align: 'center', render: (_, r) => <span className={`text-xs ${darkLight ? 'text-gray-400' : 'text-gray-500'}`}>{r.paymentMethod?.name}</span> },
        { title: 'Sale Type', key: 'saleType', align: 'center', render: (_, r) => <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${darkLight ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>{r.saleType?.name}</span> },
        {
            title: 'Action', key: 'action', align: 'center', width: 140,
            render: (_, record) => (
                <div className="flex gap-1.5 justify-end">
                    {record.paymentStatus?.id === 2 && (
                        <button onClick={() => setRefundOrder(record)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                                ${darkLight ? 'bg-orange-900/50 text-orange-300 hover:bg-orange-900' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}>
                            <RotateCcw className="w-3.5 h-3.5" /> Refund
                        </button>
                    )}
                    <button onClick={() => setSelectedOrder(record)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                            ${darkLight ? 'bg-indigo-900 text-indigo-300 hover:bg-indigo-800' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
                        <Eye className="w-3.5 h-3.5" /> View
                    </button>
                </div>
            ),
        },
    ];

    return (
        <>
            {/* ── Header ── */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-1 mb-3">
                <div className="flex items-center gap-1">
                    <div className={`p-2.5 rounded-xl ${darkLight ? 'bg-indigo-900' : 'bg-indigo-50'}`}>
                        <ShoppingCart className={`w-5 h-5 sm:w-6 sm:h-6 ${darkLight ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    </div>
                    <div>
                        <h3 className={`font-bold text-sm sm:text-2xl ${darkLight ? 'text-white' : 'text-gray-900'}`}>ORDER MANAGEMENT</h3>
                        <p className="text-xs text-gray-400">Track and manage all orders</p>
                    </div>
                </div>

                {/* ✅ Live + Filter buttons */}
                <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${darkLight ? 'bg-gray-700 text-gray-300' : 'bg-indigo-50 text-indigo-600'}`}>
                        <TrendingUp className="w-4 h-4" />
                        <span className="hidden sm:inline">Live</span>
                    </div>

                    {/* ✅ Filter button */}
                    <button
                        onClick={() => setShowFilter(true)}
                        className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border
                            ${activeFilterCount > 0
                                ? 'bg-indigo-500 border-indigo-500 text-white'
                                : darkLight ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span>Filter</span>
                        {activeFilterCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* ── Table ── */}
            <XDataTable
                TableName='Order List'
                columns={columns}
                apiUrl='Order'
                selection={false}
                hideAction={true}
                searchPlaceholder="Search by order number..."
                extraParams={extraParams}
            />

            {/* ── Filter Modal ── */}
            {showFilter && (
                <FilterModal
                    darkLight={darkLight}
                    onClose={() => setShowFilter(false)}
                    filters={{ status, paymentStatus, typeProduct, fromDate, toDate, selectedStaff, selectedCustomer }}
                    onApply={handleApplyFilter}
                />
            )}

            {/* ── View Modal ── */}
            {selectedOrder && <OrderDetailModal order={selectedOrder} darkLight={darkLight} onClose={() => setSelectedOrder(null)} />}

            {/* ── Refund Modal ── */}
            {refundOrder && (
                <RefundModal
                    order={refundOrder}
                    darkLight={darkLight}
                    onClose={() => setRefundOrder(null)}
                    onSuccess={() => { setRefundOrder(null); setRefreshTables(new Date()); }}
                />
            )}
        </>
    );
};

export default OrderList;