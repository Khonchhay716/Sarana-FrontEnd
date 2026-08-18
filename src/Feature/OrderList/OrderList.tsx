import type { TableColumnsType } from 'antd';
import XDataTable from '../../component/XDataTable/XDataTable';
import "../../component/XDataTable/XdataTable.css";
import { useState, useEffect } from 'react';
import { useGlobleContextDarklight } from '../../AllContext/context';
import {
    ShoppingCart, X, TrendingUp, Eye, Package,
    Clock, SlidersHorizontal,
    BarChart3
} from 'lucide-react';
import XSelectSearch, { SingleValue } from '../../component/XSelectSearch/Xselectsearch';
import ComponentPermission from '../../component/ProtextRoute/ComponentPermissions';
import OrderDetailModal from './OrderDetailModal';
import SalesSummaryModal from './showFilterSalesuumary';
import StockOutModal from '../StockManagement/StockOut/StockOutModal';
import { toLocalDate, parseLocalDateString, toLocalDayStart, toLocalDayEnd } from '../../utils/dateRange';

// ==================== INTERFACES (matched to real API) ====================

// ---- List response (GET /api/orders) ----
interface OrderListItem {
    id: number;
    orderNo: string;
    customerId: number | null;
    customerName: string;
    status: string;
    paymentMethod: string;
    subTotal: number;
    discountAmount: number;
    totalAmount: number;
    itemCount: number;
    note: string;
    createdDate: string;
    createBy: number;
    stockOutStatus: "Pending" | "Partial" | "Completed" | "NotApplicable";
}

// ---- Sales summary response (GET /api/orders/sales-summary) ----

// ==================== CONSTANTS ====================
const DATE_PRESETS = [
    { label: 'Today', getValue: () => { const d = new Date(); return { from: toLocalDate(d), to: toLocalDate(d) }; } },
    { label: 'This Week', getValue: () => { const now = new Date(); const mon = new Date(now); mon.setDate(now.getDate() - now.getDay() + 1); return { from: toLocalDate(mon), to: toLocalDate(now) }; } },
    { label: 'This Month', getValue: () => { const now = new Date(); const first = new Date(now.getFullYear(), now.getMonth(), 1); return { from: toLocalDate(first), to: toLocalDate(now) }; } },
    { label: 'Last Month', getValue: () => { const now = new Date(); const first = new Date(now.getFullYear(), now.getMonth() - 1, 1); const last = new Date(now.getFullYear(), now.getMonth(), 0); return { from: toLocalDate(first), to: toLocalDate(last) }; } },
    { label: 'This Year', getValue: () => { const now = new Date(); const first = new Date(now.getFullYear(), 0, 1); return { from: toLocalDate(first), to: toLocalDate(now) }; } },
];

// ==================== STYLES ====================
const getStatusStyle = (name: string) => ({
    Completed: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    Processing: 'bg-blue-100 text-blue-700 border border-blue-200',
    Pending: 'bg-amber-100 text-amber-700 border border-amber-200',
    Cancelled: 'bg-red-100 text-red-700 border border-red-200',
    Refunded: 'bg-purple-100 text-purple-700 border border-purple-200',
} as Record<string, string>)[name] ?? 'bg-gray-100 text-gray-600 border border-gray-200';

// ==================== DATE FILTER ====================
const DateFilter = ({ darkLight, fromDate, toDate, onChange }: {
    darkLight: boolean; fromDate: string; toDate: string; onChange: (from: string, to: string) => void;
}) => {
    const [isCustom, setIsCustom] = useState(false);
    const activePreset = DATE_PRESETS.find(p => { const v = p.getValue(); return v.from === fromDate && v.to === toDate; });

    return (
        <div className="space-y-2">
            <label className={`text-xs font-semibold ${darkLight ? 'text-gray-400' : 'text-gray-500'}`}>Date Range</label>
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
        fromDate: string; toDate: string;
        selectedStaff: SingleValue | null; selectedCustomer: SingleValue | null;
    };
    onApply: (f: typeof filters) => void;
}) => {
    const dl = darkLight;
    const [draft, setDraft] = useState({ ...filters });
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        setTimeout(() => setAnimating(true), 10);
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const handleClose = () => { setAnimating(false); setTimeout(onClose, 250); };
    const handleApply = () => { onApply(draft); handleClose(); };
    const handleClear = () => {
        setDraft({ fromDate: '', toDate: '', selectedStaff: null, selectedCustomer: null });
    };

    const activeCount = [draft.selectedCustomer, draft.selectedStaff, draft.fromDate || draft.toDate].filter(Boolean).length;

    return (
        <>
            <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-250 ${animating ? 'opacity-100' : 'opacity-0'}`} onClick={handleClose} />
            <div className={`fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-50 p-0 md:p-4 pointer-events-none transition-all duration-250 mt-15 ${animating ? 'opacity-100' : 'opacity-0'}`}>
                <div
                    className={`w-full md:max-w-lg pointer-events-auto rounded-t-2xl md:rounded-2xl shadow-2xl transform transition-all duration-250
                        ${animating ? 'translate-y-0' : 'translate-y-full md:translate-y-4'}
                        ${dl ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex justify-center pt-3 md:hidden">
                        <div className={`w-10 h-1 rounded-full ${dl ? 'bg-gray-600' : 'bg-gray-300'}`} />
                    </div>

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

                    <div className="px-5 py-4 space-y-5 max-h-[65vh] overflow-y-auto">
                        <div className="space-y-1.5">
                            <label className={`text-xs font-semibold ${dl ? 'text-gray-400' : 'text-gray-500'}`}>Staff</label>
                            <XSelectSearch
                                value={draft.selectedStaff}
                                onChange={v => setDraft(p => ({ ...p, selectedStaff: v as SingleValue | null }))}
                                placeholder="Search staff..."
                                selectOption={{ apiEndpoint: 'Person', id: 'id', name: 'username', searchParam: 'Search' }}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className={`text-xs font-semibold ${dl ? 'text-gray-400' : 'text-gray-500'}`}>Customer</label>
                            <XSelectSearch
                                value={draft.selectedCustomer}
                                onChange={v => setDraft(p => ({ ...p, selectedCustomer: v as SingleValue | null }))}
                                placeholder="Search customer..."
                                selectOption={{ apiEndpoint: 'Customer', id: 'id', name: 'firstName + lastName', searchParam: 'Search' }}
                            />
                        </div>

                        <DateFilter
                            darkLight={dl}
                            fromDate={draft.fromDate}
                            toDate={draft.toDate}
                            onChange={(from, to) => setDraft(p => ({ ...p, fromDate: from, toDate: to }))}
                        />
                    </div>

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

// ==================== MAIN COMPONENT ====================
const OrderList = () => {
    const { darkLight } = useGlobleContextDarklight();

    const [showFilter, setShowFilter] = useState(false);
    const [showSalesSummary, setShowSalesSummary] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<SingleValue | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<SingleValue | null>(null);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [stockOutOrderNo, setStockOutOrderNo] = useState<string | null>(null);

    const extraParams: Record<string, string> = {};
    if (selectedCustomer?.id) extraParams['CustomerId'] = String(selectedCustomer.id);
    if (selectedStaff?.id) extraParams['StaffId'] = String(selectedStaff.id);
    if (fromDate) extraParams['FromDate'] = toLocalDayStart(parseLocalDateString(fromDate));
    if (toDate) extraParams['ToDate'] = toLocalDayEnd(parseLocalDateString(toDate));

    const activeFilterCount = [selectedCustomer, selectedStaff, fromDate || toDate].filter(Boolean).length;

    const handleApplyFilter = (f: {
        fromDate: string; toDate: string; selectedStaff: SingleValue | null; selectedCustomer: SingleValue | null;
    }) => {
        setFromDate(f.fromDate);
        setToDate(f.toDate);
        setSelectedStaff(f.selectedStaff);
        setSelectedCustomer(f.selectedCustomer);
    };

    const columns: TableColumnsType<OrderListItem> = [
        {
            title: 'Order', key: 'orderNo', width: 130,
            render: (_, record) => (
                <p className={`font-bold text-sm font-mono ${darkLight ? 'text-indigo-300' : 'text-indigo-600'}`}>{record.orderNo}</p>
            ),
        },
        {
            title: 'Date', key: 'createdDate', width: 150,
            render: (_, record) => (
                <p className={`text-xs flex items-center gap-1 ${darkLight ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Clock className="w-3 h-3" />
                    {new Date(record.createdDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
            ),
        },
        {
            title: 'Customer', key: 'customerName', width: 160, align: 'center',
            render: (_, record) => (
                <span className={`text-sm font-medium ${darkLight ? 'text-gray-200' : 'text-gray-700'}`}>
                    {record.customerName}
                </span>
            ),
        },
        {
            title: 'Items', key: 'itemCount', align: 'center', width: 90,
            render: (_, record) => (
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold ${darkLight ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                    {record.itemCount}
                </span>
            ),
        },
        {
            title: 'Subtotal', key: 'subTotal', align: 'center',
            render: (_, r) => <p className={`text-sm ${darkLight ? 'text-gray-300' : 'text-gray-600'}`}>${r.subTotal.toFixed(2)}</p>,
        },
        {
            title: 'Discount', key: 'discountAmount', align: 'center',
            render: (_, r) => (
                <p className={`text-sm ${r.discountAmount > 0 ? 'text-rose-500 font-semibold' : darkLight ? 'text-gray-500' : 'text-gray-400'}`}>
                    {r.discountAmount > 0 ? `-$${r.discountAmount.toFixed(2)}` : '$0.00'}
                </p>
            ),
        },
        {
            title: 'Total', key: 'totalAmount', align: 'center',
            render: (_, r) => <p className={`font-bold text-sm ${darkLight ? 'text-white' : 'text-gray-800'}`}>${r.totalAmount.toFixed(2)}</p>,
        },
        {
            title: 'Status', key: 'status', align: 'center',
            render: (_, r) => (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(r.status)}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />{r.status}
                </span>
            ),
        },
        {
            title: 'Pay-Type', key: 'paymentMethod', align: 'center',
            render: (_, r) => <span className={`text-xs ${darkLight ? 'text-gray-400' : 'text-gray-500'}`}>{r.paymentMethod}</span>,
        },
        {
            title: 'Action', key: 'action', align: 'center', width: 200,
            render: (_, record) => (
                <div className="flex gap-1.5 justify-end flex-nowrap whitespace-nowrap">
                    {record.stockOutStatus !== 'NotApplicable' && (
                        <button onClick={() => record.stockOutStatus !== 'Completed' && setStockOutOrderNo(record.orderNo)}
                            disabled={record.stockOutStatus === 'Completed'}
                            title={record.stockOutStatus === 'Completed' ? 'All items already handed out' : undefined}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                            ${record.stockOutStatus === 'Completed'
                                    ? (darkLight ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed')
                                    : (darkLight ? 'bg-red-900/40 text-red-300 hover:bg-red-900/60' : 'bg-red-50 text-red-600 hover:bg-red-100')}`}>
                            <Package className="w-3.5 h-3.5" /> {record.stockOutStatus === 'Completed' ? 'Handed Out' : 'Stock Out'}
                        </button>
                    )}
                    <ComponentPermission scopes={["order:view"]}>
                        <button onClick={() => setSelectedOrderId(record.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                            ${darkLight ? 'bg-indigo-900 text-indigo-300 hover:bg-indigo-800' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
                            <Eye className="w-3.5 h-3.5" /> View
                        </button>
                    </ComponentPermission>
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

                <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${darkLight ? 'bg-gray-700 text-gray-300' : 'bg-indigo-50 text-indigo-600'}`}>
                        <TrendingUp className="w-4 h-4" />
                        <span className="hidden sm:inline">Live</span>
                    </div>

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

                    <button
                        onClick={() => setShowSalesSummary(true)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border
                            ${darkLight ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                        <BarChart3 className="w-4 h-4" />
                        <span>View Detail of Sale</span>
                    </button>
                </div>
            </div>

            {/* ── Table ── */}
            <XDataTable
                TableName='Order List'
                columns={columns}
                apiUrl='Orders'
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
                    filters={{ fromDate, toDate, selectedStaff, selectedCustomer }}
                    onApply={handleApplyFilter}
                />
            )}

            {/* ── Sales Summary Modal ── */}
            {showSalesSummary && (
                <SalesSummaryModal
                    darkLight={darkLight}
                    onClose={() => setShowSalesSummary(false)}
                />
            )}

            {/* ── View Modal ── */}
            {selectedOrderId != null && (
                <OrderDetailModal orderId={selectedOrderId} darkLight={darkLight} onClose={() => setSelectedOrderId(null)} />
            )}

            {/* ── Stock Out Modal ── */}
            {stockOutOrderNo != null && (
                <StockOutModal orderNo={stockOutOrderNo} onClose={() => setStockOutOrderNo(null)} />
            )}
        </>
    );
};

export default OrderList;