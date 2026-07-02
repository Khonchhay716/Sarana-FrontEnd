import { useEffect, useState } from "react";
import { ApiResponse, AxiosApi } from "../../component/Axios/Axios";
import { alertError } from "../../HtmlHelper/Alert";
import { Clock, CreditCard, Loader2, Package, Shield, ShoppingCart, User, X } from "lucide-react";


interface OrderDetail {
    id: number;
    orderNo: string;
    customerId: number | null;
    customerName: string;
    createBy: {
        id: number;
        name: string;
    }
    status: string;
    paymentMethod: string;
    subTotal: number;
    discountAmount: number;
    totalAmount: number;
    pointEarned: number;
    pointUsed: number;
    note: string;
    createdDate: string;
    items: OrderDetailItem[];
}

interface OrderDetailItem {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    imageUrl: string | null;
    discountAmount: number;
    discountName: string | null;
    globalDiscountAmount: number;
    globalDiscountName: string | null;
    lineTotal: number;
    serialNumbers: string[] | null;
    warrantyDays: number | null;
    warrantyStartDate: string | null;
    warrantyEndDate: string | null;
    hasWarranty: boolean;
    isWarrantyActive: boolean;
    remainingWarrantyDays: number | null;
    warrantyStatus: string;
}

const OrderDetailModal = ({ orderId, darkLight, onClose }: { orderId: number; darkLight: boolean; onClose: () => void }) => {
    const dl = darkLight;
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        let active = true;
        setLoading(true);
        AxiosApi.get<ApiResponse<OrderDetail>>(`Orders/${orderId}`)
            .then(res => { if (active) setOrder(res.data.data); })
            .catch(err => alertError(err?.response?.data?.message || 'Failed to load order detail.'))
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; document.body.style.overflow = ''; };
    }, [orderId]);


    const getStatusStyle = (name: string) => ({
        Completed: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
        Processing: 'bg-blue-100 text-blue-700 border border-blue-200',
        Pending: 'bg-amber-100 text-amber-700 border border-amber-200',
        Cancelled: 'bg-red-100 text-red-700 border border-red-200',
        Refunded: 'bg-purple-100 text-purple-700 border border-purple-200',
    } as Record<string, string>)[name] ?? 'bg-gray-100 text-gray-600 border border-gray-200';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 mt-15">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full max-w-3xl max-h-[87vh] overflow-y-auto custom-scrollbar rounded-xl shadow-2xl
                ${dl ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-100'}`}
                style={{ paddingRight: '6px', scrollbarWidth: 'thin', scrollbarColor: '#9ca3af transparent' }}>

                {/* Header */}
                <div className={`sticky top-0 z-10 flex items-center justify-between px-6 py-2 border-b ${dl ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${dl ? 'bg-indigo-900' : 'bg-indigo-50'}`}>
                            <ShoppingCart className={`w-5 h-5 ${dl ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        </div>
                        <div>
                            <h2 className={`font-bold text-lg font-mono ${dl ? 'text-indigo-300' : 'text-indigo-600'}`}>
                                {order?.orderNo ?? '...'}
                            </h2>
                            {order && (
                                <p className="text-xs flex items-center gap-1 text-gray-400">
                                    <Clock className="w-3 h-3" />
                                    {new Date(order.createdDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            )}
                        </div>
                        {!loading && order && (
                            <span className={`inline-flex items-center gap-1.5 px-3 -mt-3 py-0.5 rounded-full text-xs font-semibold ${getStatusStyle(order.status)}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                                {order.status}
                            </span>
                        )}
                    </div>
                    <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${dl ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className={`w-8 h-8 animate-spin ${dl ? 'text-indigo-400' : 'text-indigo-500'}`} />
                    </div>
                )}

                {!loading && order && (
                    <div className="p-6 space-y-5">

                        {/* Info grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: <User className="w-4 h-4" />, label: 'Customer', value: order.customerName ?? 'Walk-in' },
                                { icon: <CreditCard className="w-4 h-4" />, label: 'Payment Method', value: order.paymentMethod ?? 'N/A' },
                                { icon: <User className="w-4 h-4" />, label: 'Staff', value: `${order?.createBy?.name ?? "N/A"}` },
                                { icon: <Package className="w-4 h-4" />, label: 'Items', value: `${order.items.length}` },
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

                        {/* Points */}
                        {(order.pointEarned > 0 || order.pointUsed > 0) && (
                            <div className={`rounded-xl px-4 py-3 flex items-center gap-6 ${dl ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                                <span className="text-2xl">⭐</span>
                                {order.pointEarned > 0 && (
                                    <div>
                                        <p className="text-xs text-gray-400">Earned Points</p>
                                        <p className={`text-sm font-bold ${dl ? 'text-amber-300' : 'text-amber-700'}`}>+{order.pointEarned} pts</p>
                                    </div>
                                )}
                                {order.pointUsed > 0 && (
                                    <div>
                                        <p className="text-xs text-gray-400">Points Used</p>
                                        <p className={`text-sm font-bold ${dl ? 'text-orange-300' : 'text-orange-700'}`}>{order.pointUsed} pts</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Items */}
                        <div>
                            <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${dl ? 'text-gray-200' : 'text-gray-700'}`}>
                                <Package className="w-4 h-4" /> Order Items ({order.items.length})
                            </h3>
                            <div className="space-y-2">
                                {order.items.map(item => {
                                    const isSerial = !!(item.serialNumbers && item.serialNumbers.length > 0);
                                    const totalLineDiscount = (item.discountAmount || 0) + (item.globalDiscountAmount || 0);
                                    return (
                                        <div key={item.id} className={`rounded-xl border overflow-hidden ${dl ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                                            <div className="flex items-center gap-3 p-3">
                                                {item.imageUrl
                                                    ? <img src={item.imageUrl} alt={item.productName}
                                                        onError={e => { (e.target as HTMLImageElement).src = 'https://yokohama-soei-fc.com/wpdata/wp-content/uploads/2022/03/noimage.png'; }}
                                                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-gray-200" />
                                                    : <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-xl font-bold ${dl ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>
                                                        {item.productName?.charAt(0)}
                                                    </div>
                                                }
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className={`font-semibold text-sm truncate ${dl ? 'text-white' : 'text-gray-800'}`}>{item.productName}</p>
                                                        {isSerial && (
                                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${dl ? 'bg-violet-900/60 text-violet-300' : 'bg-violet-100 text-violet-700'}`}>
                                                                S/N
                                                            </span>
                                                        )}
                                                        {(item.discountName || item.globalDiscountName) && (
                                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${dl ? 'bg-rose-900/60 text-rose-300' : 'bg-rose-100 text-rose-700'}`}>
                                                                {item.discountName ?? item.globalDiscountName}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-gray-400">
                                                        <span>Qty: <b>{item.quantity}</b></span>
                                                        <span>Unit: <b>${item.unitPrice.toFixed(2)}</b></span>
                                                        {totalLineDiscount > 0 && (
                                                            <span className="text-rose-500">-${totalLineDiscount.toFixed(2)}</span>
                                                        )}
                                                        {isSerial && (
                                                            <span className={`font-mono ${dl ? 'text-violet-400' : 'text-violet-600'}`}>
                                                                {item.serialNumbers!.join(', ')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className={`font-bold text-sm ${dl ? 'text-white' : 'text-gray-800'}`}>${item.lineTotal.toFixed(2)}</p>
                                                </div>
                                            </div>
                                            {item.hasWarranty && (
                                                <div className={`flex items-center gap-3 px-3 py-2 border-t text-xs flex-wrap ${dl ? 'border-gray-700 bg-violet-900/20' : 'border-violet-100 bg-violet-50'}`}>
                                                    <Shield className={`w-3.5 h-3.5 shrink-0 ${dl ? 'text-violet-400' : 'text-violet-500'}`} />
                                                    <span className={`font-semibold ${dl ? 'text-violet-300' : 'text-violet-700'}`}>
                                                        Warranty {item.warrantyDays} day{item.warrantyDays !== 1 ? 's' : ''}
                                                    </span>
                                                    <span className="text-gray-400">·</span>
                                                    <span className="text-gray-400">
                                                        {item.warrantyStartDate ? new Date(item.warrantyStartDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                                    </span>
                                                    <span className="text-gray-400">→</span>
                                                    <span className={`font-semibold ${dl ? 'text-violet-300' : 'text-violet-700'}`}>
                                                        {item.warrantyEndDate ? new Date(item.warrantyEndDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                                    </span>
                                                    <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold
                                                        ${item.isWarrantyActive
                                                            ? (dl ? 'bg-emerald-900/60 text-emerald-300' : 'bg-emerald-100 text-emerald-700')
                                                            : (dl ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500')}`}>
                                                        {item.warrantyStatus}
                                                        {item.isWarrantyActive && item.remainingWarrantyDays != null ? ` (${item.remainingWarrantyDays}d left)` : ''}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Summary */}
                        <div className={`rounded-xl p-4 space-y-2 ${dl ? 'bg-gray-800' : 'bg-gray-50'}`}>
                            <h3 className={`text-sm font-bold mb-3 ${dl ? 'text-gray-200' : 'text-gray-700'}`}>Summary</h3>
                            <div className="flex justify-between text-sm"><span className="text-gray-400">Subtotal</span><span>${order.subTotal.toFixed(2)}</span></div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Discount</span>
                                <span className={order.discountAmount > 0 ? 'text-rose-500' : ''}>
                                    {order.discountAmount > 0 ? `-$${order.discountAmount.toFixed(2)}` : '$0.00'}
                                </span>
                            </div>
                            <div className={`pt-2 mt-2 border-t flex justify-between font-bold text-sm ${dl ? 'border-gray-700' : 'border-gray-200'}`}>
                                <span>Total</span>
                                <span className={dl ? 'text-indigo-300' : 'text-indigo-600'}>${order.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Notes */}
                        {order.note && (
                            <div className={`rounded-xl px-4 py-3 ${dl ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                <p className="text-xs text-gray-400 mb-1">Notes</p>
                                <p className={`text-sm ${dl ? 'text-gray-300' : 'text-gray-600'}`}>{order.note}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};


export default OrderDetailModal;