// import type { TableColumnsType } from 'antd';
// import { useState, useEffect, useRef } from 'react';
// import { BiArchive, BiDollarCircle, BiChevronDown, BiCalendar, BiBarChartAlt2, BiTag, BiBox, BiX } from 'react-icons/bi';
// import XDataTable from '../../component/XDataTable/XDataTable';
// import StockForm, { StockFormProduct } from './StockForm';
// import { useGlobleContextDarklight } from '../../AllContext/context';
// import { AxiosApi } from '../../component/Axios/Axios';
// import "../../component/XDataTable/XdataTable.css";

// interface Category { id: number; name: string; }
// interface SerialNumber {
//     id: number; productId: number; serialNo: string;
//     status: string; price: number; costPrice: number; createdAt?: string;
// }
// interface StockMovement {
//     id: number; productId: number; type: string; quantity: number;
//     price: number; costPrice: number; notes?: string; movementDate: string;
// }
// interface StockItem {
//     id: number; name: string; sku: string; imageProduct: string;
//     category: Category; price: number; costPrice: number; stock: number;
//     isSerialNumber: boolean; serialNumbers: SerialNumber[]; stockMovements: StockMovement[];
// }

// interface StockSummaryResponse {
//     totalStockSerial: number;
//     totalStockMovement: number;
//     totalStockAll: number;
//     totalCostSerial: number;
//     totalCostMovement: number;
//     totalCostAll: number;
// }

// // ✅ Added "lastMonth" + "none" for cleared state
// type FilterOption = "today" | "thisWeek" | "thisMonth" | "lastMonth" | "thisYear" | "custom" | "none";

// const FILTER_OPTIONS: { label: string; value: FilterOption }[] = [
//     { label: "Today", value: "today" },
//     { label: "This Week", value: "thisWeek" },
//     { label: "This Month", value: "thisMonth" },
//     { label: "Last Month", value: "lastMonth" },
//     { label: "This Year", value: "thisYear" },
//     { label: "Custom", value: "custom" },
// ];

// const toLocalDate = (d: Date) => {
//     const y = d.getFullYear();
//     const m = String(d.getMonth() + 1).padStart(2, "0");
//     const day = String(d.getDate()).padStart(2, "0");
//     return `${y}-${m}-${day}`;
// };

// const getRange = (option: FilterOption): { from: string; to: string } => {
//     const now = new Date();
//     switch (option) {
//         case "today":
//             return { from: toLocalDate(now), to: toLocalDate(now) };
//         case "thisWeek": {
//             const dow = now.getDay();
//             const mon = new Date(now); mon.setDate(now.getDate() - ((dow + 6) % 7));
//             const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
//             return { from: toLocalDate(mon), to: toLocalDate(sun) };
//         }
//         case "thisMonth":
//             return {
//                 from: toLocalDate(new Date(now.getFullYear(), now.getMonth(), 1)),
//                 to: toLocalDate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
//             };
//         // ✅ Last month: first day → last day of previous month
//         case "lastMonth":
//             return {
//                 from: toLocalDate(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
//                 to: toLocalDate(new Date(now.getFullYear(), now.getMonth(), 0)),
//             };
//         case "thisYear":
//             return {
//                 from: toLocalDate(new Date(now.getFullYear(), 0, 1)),
//                 to: toLocalDate(new Date(now.getFullYear(), 11, 31)),
//             };
//         default:
//             return { from: "", to: "" };
//     }
// };

// const fmt$ = (n: number) =>
//     `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// /* ─────────────────────────────────────────────────────────────────────────── */

// const FilterDropdown = ({ selected, onSelect, onClear, darkLight }: {
//     selected: FilterOption;
//     onSelect: (v: FilterOption) => void;
//     onClear: () => void;
//     darkLight: boolean;
// }) => {
//     const [open, setOpen] = useState(false);
//     const ref = useRef<HTMLDivElement>(null);

//     useEffect(() => {
//         const h = (e: MouseEvent) => {
//             if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
//         };
//         document.addEventListener("mousedown", h);
//         return () => document.removeEventListener("mousedown", h);
//     }, []);

//     const isFiltered = selected !== "none";
//     const label = FILTER_OPTIONS.find(f => f.value === selected)?.label ?? "All Time";

//     return (
//         <div ref={ref} className="relative flex items-center gap-2">
//             <button
//                 type="button"
//                 onClick={() => setOpen(o => !o)}
//                 className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all min-w-[150px] ${darkLight
//                     ? "bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600"
//                     : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
//                     }`}>
//                 <BiCalendar className="text-base flex-shrink-0" />
//                 <span className="flex-1 text-left">{isFiltered ? label : "All Time"}</span>
//                 <BiChevronDown className={`text-base transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
//             </button>

//             {open && (
//                 <div className={`absolute top-full mt-1 right-0 z-50 rounded-xl border shadow-lg py-1 min-w-[170px] ${darkLight ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
//                     }`}>
//                     {FILTER_OPTIONS.map(opt => (
//                         <button
//                             key={opt.value}
//                             type="button"
//                             onClick={() => { onSelect(opt.value); setOpen(false); }}
//                             className={`w-full text-left px-4 py-2 text-sm transition-all flex items-center gap-2 ${selected === opt.value
//                                 ? darkLight
//                                     ? "bg-emerald-900/40 text-emerald-300 font-semibold"
//                                     : "bg-emerald-50 text-emerald-700 font-semibold"
//                                 : darkLight
//                                     ? "text-gray-300 hover:bg-gray-700"
//                                     : "text-gray-700 hover:bg-gray-50"
//                                 }`}>
//                             <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${selected === opt.value
//                                 ? darkLight ? "bg-emerald-400" : "bg-emerald-500"
//                                 : "opacity-0"
//                                 }`} />
//                             {opt.label}
//                         </button>
//                     ))}

//                     {/* Divider + clear inside dropdown */}
//                     {isFiltered && (
//                         <>
//                             <div className={`mx-3 my-1 border-t ${darkLight ? "border-gray-700" : "border-gray-100"}`} />
//                             <button
//                                 type="button"
//                                 onClick={() => { onClear(); setOpen(false); }}
//                                 className={`w-full text-left px-4 py-2 text-sm font-semibold transition-all flex items-center gap-2 ${darkLight
//                                     ? "text-red-400 hover:bg-red-900/20"
//                                     : "text-red-500 hover:bg-red-50"
//                                     }`}>
//                                 <BiX className="text-base" />
//                                 Clear Filter
//                             </button>
//                         </>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// };

// /* ─────────────────────────────────────────────────────────────────────────── */

// const StockList = () => {
//     const { darkLight } = useGlobleContextDarklight();

//     const [showModal, setShowModal] = useState(false);
//     const [selectedProduct, setSelectedProduct] = useState<StockFormProduct | undefined>(undefined);

//     const [filterOption, setFilterOption] = useState<FilterOption>("thisMonth");
//     const [fromDate, setFromDate] = useState(getRange("thisMonth").from);
//     const [toDate, setToDate] = useState(getRange("thisMonth").to);

//     const [loadingSummary, setLoadingSummary] = useState(false);
//     const [summary, setSummary] = useState<StockSummaryResponse>({
//         totalStockSerial: 0, totalStockMovement: 0, totalStockAll: 0,
//         totalCostSerial: 0, totalCostMovement: 0, totalCostAll: 0,
//     });

//     useEffect(() => {
//         if (filterOption === "none") {
//             setFromDate(""); setToDate("");
//         } else if (filterOption !== "custom") {
//             const { from, to } = getRange(filterOption);
//             setFromDate(from); setToDate(to);
//         }
//     }, [filterOption]);

//     useEffect(() => { fetchSummary(fromDate, toDate); }, [fromDate, toDate]);

//     const fetchSummary = async (from: string, to: string) => {
//         try {
//             setLoadingSummary(true);
//             const params = new URLSearchParams();
//             if (from) params.append("StartDate", from);
//             if (to) params.append("EndDate", to);
//             const res = await AxiosApi.get(`Product/stock-summary?${params.toString()}`);
//             const data: StockSummaryResponse = res?.data?.data ?? res?.data ?? res;
//             setSummary({
//                 totalStockSerial: data.totalStockSerial ?? 0,
//                 totalStockMovement: data.totalStockMovement ?? 0,
//                 totalStockAll: data.totalStockAll ?? 0,
//                 totalCostSerial: data.totalCostSerial ?? 0,
//                 totalCostMovement: data.totalCostMovement ?? 0,
//                 totalCostAll: data.totalCostAll ?? 0,
//             });
//         } catch (err) { console.error("Failed to fetch stock summary:", err); }
//         finally { setLoadingSummary(false); }
//     };

//     // Reset to all-time (no date params sent to API)
//     const handleClearFilter = () => setFilterOption("none");

//     const handleOpenManage = (row: StockItem) => {
//         setSelectedProduct({
//             id: row.id, name: row.name, sku: row.sku,
//             imageProduct: row.imageProduct, price: row.price,
//             costPrice: row.costPrice, stock: row.stock,
//             isSerialNumber: row.isSerialNumber,
//         });
//         setShowModal(true);
//     };

//     const handleCloseModal = () => {
//         setShowModal(false);
//         setSelectedProduct(undefined);
//     };
//     const handleSuccess = () => {
//         fetchSummary(fromDate, toDate);
//     };

//     const dl = darkLight;
//     const cardClass = `p-5 rounded-2xl border shadow-sm ${dl ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-100"}`;
//     const dateInputClass = `px-3 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all ${dl ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-700"}`;

//     const columns: TableColumnsType<StockItem> = [
//         {
//             title: "Product", key: "product",
//             render: (_, r) => (
//                 <div className="flex items-center gap-3">
//                     <img src={r.imageProduct || "https://yokohama-soei-fc.com/wpdata/wp-content/uploads/2022/03/noimage.png"}
//                         alt={r.name} className="w-11 h-11 rounded-xl object-cover ring-2 ring-gray-100 dark:ring-gray-700" />
//                     <div>
//                         <p className={`font-bold text-sm ${dl ? "text-white" : "text-gray-800"}`}>{r.name}</p>
//                         <span className="text-[10px] uppercase tracking-wider font-mono text-gray-500">{r.sku}</span>
//                     </div>
//                 </div>
//             ),
//         },
//         {
//             title: "Category", key: "category",
//             render: (_, r) => (
//                 <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg text-xs font-semibold">
//                     {r.category?.name || "Uncategorized"}
//                 </span>
//             ),
//         },
//         {
//             title: "Type", key: "type", align: "center",
//             render: (_, r) => (
//                 <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${r.isSerialNumber
//                     ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
//                     : "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"}`}>
//                     {r.isSerialNumber ? "Serialized" : "Non-Serialized"}
//                 </span>
//             ),
//         },
//         {
//             title: "Status", key: "stock", align: "center",
//             render: (_, r) => {
//                 const s = r.stock ?? 0;
//                 const style = s === 0
//                     ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
//                     : s <= 5
//                         ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 text-amber-400"
//                         : "bg-green-100 text-green-700 dark:bg-green-900/30 text-green-400";
//                 return <span className={`px-3 py-1 rounded-lg text-xs font-bold ${style}`}>{s} in stock</span>;
//             },
//         },
//         {
//             title: "Actions", key: "actions", align: "center",
//             render: (_, r) => (
//                 <button onClick={() => handleOpenManage(r)}
//                     className="px-4 py-1.5 bg-gray-900 hover:bg-black dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-all active:scale-95 shadow-sm">
//                     Manage Stock
//                 </button>
//             ),
//         },
//     ];

//     return (
//         <div className="space-y-6">
//             <div>
//                 <header className="flex items-center justify-between gap-4 flex-wrap mb-2">
//                     <div className="flex items-center gap-4">
//                         <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20 text-white">
//                             <BiArchive size={28} />
//                         </div>
//                         <div>
//                             <h1 className={`text-2xl font-black tracking-tight ${dl ? "text-white" : "text-gray-900"}`}>Inventory Control</h1>
//                             <p className="text-sm text-gray-500 font-medium">Manage your products and serial numbers</p>
//                         </div>
//                     </div>

//                     <div className="flex items-center gap-3">
//                         {filterOption === "custom" && (
//                             <div className="flex items-center gap-2">
//                                 <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className={dateInputClass} />
//                                 <span className="text-sm text-gray-400">→</span>
//                                 <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className={dateInputClass} />
//                             </div>
//                         )}
//                         <FilterDropdown
//                             selected={filterOption}
//                             onSelect={setFilterOption}
//                             onClear={handleClearFilter}
//                             darkLight={dl}
//                         />
//                     </div>
//                 </header>

//                 <div className={cardClass}>
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                         <MiniCard label="Total Stock" sublabel="all available" value={summary.totalStockAll.toLocaleString()} icon={<BiBarChartAlt2 />} loading={loadingSummary} color="blue" darkLight={dl} />
//                         <MiniCard label="Serial Stock" sublabel="available serials" value={summary.totalStockSerial.toLocaleString()} icon={<BiTag />} loading={loadingSummary} color="purple" darkLight={dl} />
//                         <MiniCard label="Non-Serial Stock" sublabel="available units" value={summary.totalStockMovement.toLocaleString()} icon={<BiBox />} loading={loadingSummary} color="teal" darkLight={dl} />
//                         <MiniCard label="Total Cost" sublabel="in period" value={fmt$(summary.totalCostAll)} icon={<BiDollarCircle />} loading={loadingSummary} color="orange" darkLight={dl} />
//                     </div>
//                 </div>
//             </div>

//             <XDataTable
//                 TableName="Stock list"
//                 columns={columns}
//                 apiUrl="Product"
//                 selection={false}
//                 hideAction={true}
//                 searchPlaceholder="Search product name or SKU..."
//             />

//             {showModal && (
//                 <StockForm initialProduct={selectedProduct} onClose={handleCloseModal} onSuccess={handleSuccess} />
//             )}
//         </div>
//     );
// };

// const MiniCard = ({ label, sublabel, value, icon, loading, color, darkLight }: {
//     label: string; sublabel: string; value: string;
//     icon: React.ReactNode; loading: boolean; color: string; darkLight: boolean;
// }) => {
//     const palette: Record<string, { wrap: string; icon: string; sub: string }> = {
//         orange: { wrap: darkLight ? "border-orange-900/40 bg-orange-900/10" : "border-orange-100 bg-orange-50/50", icon: darkLight ? "bg-orange-900/50 text-orange-400" : "bg-orange-100 text-orange-600", sub: darkLight ? "text-orange-500" : "text-orange-600" },
//         blue: { wrap: darkLight ? "border-blue-900/40 bg-blue-900/10" : "border-blue-100 bg-blue-50/50", icon: darkLight ? "bg-blue-900/50 text-blue-400" : "bg-blue-100 text-blue-600", sub: darkLight ? "text-blue-500" : "text-blue-600" },
//         purple: { wrap: darkLight ? "border-purple-900/40 bg-purple-900/10" : "border-purple-100 bg-purple-50/50", icon: darkLight ? "bg-purple-900/50 text-purple-400" : "bg-purple-100 text-purple-600", sub: darkLight ? "text-purple-500" : "text-purple-600" },
//         teal: { wrap: darkLight ? "border-teal-900/40 bg-teal-900/10" : "border-teal-100 bg-teal-50/50", icon: darkLight ? "bg-teal-900/50 text-teal-400" : "bg-teal-100 text-teal-600", sub: darkLight ? "text-teal-500" : "text-teal-600" },
//     };
//     const p = palette[color] ?? palette.blue;
//     return (
//         <div className={`flex items-center gap-3 rounded-xl px-3 py-3 border ${p.wrap}`}>
//             <div className={`p-2 rounded-lg text-lg flex-shrink-0 ${p.icon}`}>{icon}</div>
//             <div className="min-w-0">
//                 <p className={`text-[10px] font-bold uppercase tracking-wide truncate ${darkLight ? "text-gray-400" : "text-gray-500"}`}>{label}</p>
//                 <p className={`text-xl font-black leading-tight ${darkLight ? "text-white" : "text-gray-900"}`}>
//                     {loading ? <span className={`animate-pulse text-base ${darkLight ? "text-gray-600" : "text-gray-300"}`}>…</span> : value}
//                 </p>
//                 <p className={`text-[10px] truncate ${p.sub}`}>{sublabel}</p>
//             </div>
//         </div>
//     );
// };

// export default StockList;





import type { TableColumnsType } from 'antd';
import { useState, useEffect, useRef } from 'react';
import { BiArchive, BiDollarCircle, BiChevronDown, BiCalendar, BiBarChartAlt2, BiTag, BiBox, BiX } from 'react-icons/bi';
import XDataTable from '../../component/XDataTable/XDataTable';
import StockForm, { StockFormProduct } from './StockForm';
import { useGlobleContextDarklight } from '../../AllContext/context';
import { AxiosApi } from '../../component/Axios/Axios';
import "../../component/XDataTable/XdataTable.css";

interface Category { id: number; name: string; }
interface SerialNumber {
    id: number; productId: number; serialNo: string;
    status: string; price: number; costPrice: number; createdAt?: string;
}
interface StockMovement {
    id: number; productId: number; type: string; quantity: number;
    price: number; costPrice: number; notes?: string; movementDate: string;
}
interface StockItem {
    id: number; name: string; sku: string; imageProduct: string;
    category: Category; price: number; costPrice: number; stock: number;
    isSerialNumber: boolean; serialNumbers: SerialNumber[]; stockMovements: StockMovement[];
}

interface StockSummaryResponse {
    totalStockSerial: number;
    totalStockMovement: number;
    totalStockAll: number;
    totalCostSerial: number;
    totalCostMovement: number;
    totalCostAll: number;
}

type FilterOption = "today" | "thisWeek" | "thisMonth" | "lastMonth" | "thisYear" | "custom" | "none";

const FILTER_OPTIONS: { label: string; value: FilterOption }[] = [
    { label: "Today", value: "today" },
    { label: "This Week", value: "thisWeek" },
    { label: "This Month", value: "thisMonth" },
    { label: "Last Month", value: "lastMonth" },
    { label: "This Year", value: "thisYear" },
    { label: "Custom", value: "custom" },
];

const toLocalDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

const getRange = (option: FilterOption): { from: string; to: string } => {
    const now = new Date();
    switch (option) {
        case "today":
            return { from: toLocalDate(now), to: toLocalDate(now) };
        case "thisWeek": {
            const dow = now.getDay();
            const mon = new Date(now); mon.setDate(now.getDate() - ((dow + 6) % 7));
            const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
            return { from: toLocalDate(mon), to: toLocalDate(sun) };
        }
        case "thisMonth":
            return {
                from: toLocalDate(new Date(now.getFullYear(), now.getMonth(), 1)),
                to: toLocalDate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
            };
        case "lastMonth":
            return {
                from: toLocalDate(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
                to: toLocalDate(new Date(now.getFullYear(), now.getMonth(), 0)),
            };
        case "thisYear":
            return {
                from: toLocalDate(new Date(now.getFullYear(), 0, 1)),
                to: toLocalDate(new Date(now.getFullYear(), 11, 31)),
            };
        default:
            return { from: "", to: "" };
    }
};

const fmt$ = (n: number) =>
    `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* ─────────────────────────────────────────────────────────────────────────── */

const FilterDropdown = ({ selected, onSelect, onClear, darkLight }: {
    selected: FilterOption;
    onSelect: (v: FilterOption) => void;
    onClear: () => void;
    darkLight: boolean;
}) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const isFiltered = selected !== "none";
    const label = FILTER_OPTIONS.find(f => f.value === selected)?.label ?? "All Time";

    return (
        <div ref={ref} className="relative flex items-center gap-2">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all min-w-[120px] sm:min-w-[150px] ${darkLight
                    ? "bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}>
                <BiCalendar className="text-sm sm:text-base flex-shrink-0" />
                <span className="flex-1 text-left">{isFiltered ? label : "All Time"}</span>
                <BiChevronDown className={`text-sm sm:text-base transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className={`absolute top-full mt-1 right-0 z-50 rounded-xl border shadow-lg py-1 min-w-[170px] ${darkLight
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                    }`}>
                    {FILTER_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => { onSelect(opt.value); setOpen(false); }}
                            className={`w-full text-left px-4 py-2 text-sm transition-all flex items-center gap-2 ${selected === opt.value
                                ? darkLight
                                    ? "bg-emerald-900/40 text-emerald-300 font-semibold"
                                    : "bg-emerald-50 text-emerald-700 font-semibold"
                                : darkLight
                                    ? "text-gray-300 hover:bg-gray-700"
                                    : "text-gray-700 hover:bg-gray-50"
                                }`}>
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${selected === opt.value
                                ? darkLight ? "bg-emerald-400" : "bg-emerald-500"
                                : "opacity-0"
                                }`} />
                            {opt.label}
                        </button>
                    ))}

                    {isFiltered && (
                        <>
                            <div className={`mx-3 my-1 border-t ${darkLight ? "border-gray-700" : "border-gray-100"}`} />
                            <button
                                type="button"
                                onClick={() => { onClear(); setOpen(false); }}
                                className={`w-full text-left px-4 py-2 text-sm font-semibold transition-all flex items-center gap-2 ${darkLight
                                    ? "text-red-400 hover:bg-red-900/20"
                                    : "text-red-500 hover:bg-red-50"
                                    }`}>
                                <BiX className="text-base" />
                                Clear Filter
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────── */

const StockList = () => {
    const { darkLight } = useGlobleContextDarklight();

    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<StockFormProduct | undefined>(undefined);

    const [filterOption, setFilterOption] = useState<FilterOption>("thisMonth");
    const [fromDate, setFromDate] = useState(getRange("thisMonth").from);
    const [toDate, setToDate] = useState(getRange("thisMonth").to);

    const [loadingSummary, setLoadingSummary] = useState(false);
    const [summary, setSummary] = useState<StockSummaryResponse>({
        totalStockSerial: 0, totalStockMovement: 0, totalStockAll: 0,
        totalCostSerial: 0, totalCostMovement: 0, totalCostAll: 0,
    });

    useEffect(() => {
        if (filterOption === "none") {
            setFromDate(""); setToDate("");
        } else if (filterOption !== "custom") {
            const { from, to } = getRange(filterOption);
            setFromDate(from); setToDate(to);
        }
    }, [filterOption]);

    useEffect(() => { fetchSummary(fromDate, toDate); }, [fromDate, toDate]);

    const fetchSummary = async (from: string, to: string) => {
        try {
            setLoadingSummary(true);
            const params = new URLSearchParams();
            if (from) params.append("StartDate", from);
            if (to) params.append("EndDate", to);
            const res = await AxiosApi.get(`Product/stock-summary?${params.toString()}`);
            const data: StockSummaryResponse = res?.data?.data ?? res?.data ?? res;
            setSummary({
                totalStockSerial: data.totalStockSerial ?? 0,
                totalStockMovement: data.totalStockMovement ?? 0,
                totalStockAll: data.totalStockAll ?? 0,
                totalCostSerial: data.totalCostSerial ?? 0,
                totalCostMovement: data.totalCostMovement ?? 0,
                totalCostAll: data.totalCostAll ?? 0,
            });
        } catch (err) { console.error("Failed to fetch stock summary:", err); }
        finally { setLoadingSummary(false); }
    };

    const handleClearFilter = () => setFilterOption("none");

    const handleOpenManage = (row: StockItem) => {
        setSelectedProduct({
            id: row.id, name: row.name, sku: row.sku,
            imageProduct: row.imageProduct, price: row.price,
            costPrice: row.costPrice, stock: row.stock,
            isSerialNumber: row.isSerialNumber,
        });
        setShowModal(true);
    };

    const handleCloseModal = () => { setShowModal(false); setSelectedProduct(undefined); };
    const handleSuccess = () => { fetchSummary(fromDate, toDate); };

    const dl = darkLight;
    const cardClass = `p-4 sm:p-5 rounded-2xl border shadow-sm ${dl ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-100"}`;
    const dateInputClass = `px-2 sm:px-3 py-2 rounded-xl border text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all ${dl ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-700"}`;

    const columns: TableColumnsType<StockItem> = [
        {
            title: "Product", key: "product",
            render: (_, r) => (
                <div className="flex items-center gap-3">
                    <img src={r.imageProduct || "https://yokohama-soei-fc.com/wpdata/wp-content/uploads/2022/03/noimage.png"}
                        alt={r.name} className="w-11 h-11 rounded-xl object-cover ring-2 ring-gray-100 dark:ring-gray-700" />
                    <div>
                        <p className={`font-bold text-sm ${dl ? "text-white" : "text-gray-800"}`}>{r.name}</p>
                        <span className="text-[10px] uppercase tracking-wider font-mono text-gray-500">{r.sku}</span>
                    </div>
                </div>
            ),
        },
        {
            title: "Category", key: "category",
            render: (_, r) => (
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg text-xs font-semibold">
                    {r.category?.name || "Uncategorized"}
                </span>
            ),
        },
        {
            title: "Type", key: "type", align: "center",
            render: (_, r) => (
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${r.isSerialNumber
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"}`}>
                    {r.isSerialNumber ? "Serialized" : "Non-Serialized"}
                </span>
            ),
        },
        {
            title: "Status", key: "stock", align: "center",
            render: (_, r) => {
                const s = r.stock ?? 0;
                const style = s === 0
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : s <= 5
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 text-amber-400"
                        : "bg-green-100 text-green-700 dark:bg-green-900/30 text-green-400";
                return <span className={`px-3 py-1 rounded-lg text-xs font-bold ${style}`}>{s} in stock</span>;
            },
        },
        {
            title: "Actions", key: "actions", align: "center",
            render: (_, r) => (
                <button onClick={() => handleOpenManage(r)}
                    className="px-4 py-1.5 bg-gray-900 hover:bg-black dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-all active:scale-95 shadow-sm">
                    Manage Stock
                </button>
            ),
        },
    ];

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                {/* ===== HEADER ===== */}
                <header className="flex items-center justify-between gap-2 mb-2">

                    {/* Left: Icon + Title */}
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="p-2 sm:p-3 bg-emerald-500 rounded-xl sm:rounded-2xl shadow-lg shadow-emerald-500/20 text-white flex-shrink-0">
                            <BiArchive className="text-lg sm:text-2xl" />
                        </div>
                        <div className="min-w-0">
                            <h1 className={`text-base sm:text-2xl font-black tracking-tight truncate ${dl ? "text-white" : "text-gray-900"}`}>
                                Inventory Control
                            </h1>
                            <p className={`text-xs truncate ${dl ? "text-gray-400" : "text-gray-500"}`}>
                                Manage your products and serial numbers
                            </p>
                        </div>
                    </div>

                    {/* Right: Date pickers + Filter */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {filterOption === "custom" && (
                            <div className="flex items-center gap-1.5">
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={e => setFromDate(e.target.value)}
                                    className={dateInputClass}
                                />
                                <span className={`text-xs ${dl ? "text-gray-500" : "text-gray-400"}`}>→</span>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={e => setToDate(e.target.value)}
                                    className={dateInputClass}
                                />
                            </div>
                        )}
                        <FilterDropdown
                            selected={filterOption}
                            onSelect={setFilterOption}
                            onClear={handleClearFilter}
                            darkLight={dl}
                        />
                    </div>
                </header>

                {/* ===== SUMMARY CARDS ===== */}
                <div className={cardClass}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                        <MiniCard label="Total Stock" sublabel="all available" value={summary.totalStockAll.toLocaleString()} icon={<BiBarChartAlt2 />} loading={loadingSummary} color="blue" darkLight={dl} />
                        <MiniCard label="Serial Stock" sublabel="available serials" value={summary.totalStockSerial.toLocaleString()} icon={<BiTag />} loading={loadingSummary} color="purple" darkLight={dl} />
                        <MiniCard label="Non-Serial" sublabel="available units" value={summary.totalStockMovement.toLocaleString()} icon={<BiBox />} loading={loadingSummary} color="teal" darkLight={dl} />
                        <MiniCard label="Total Cost" sublabel="in period" value={fmt$(summary.totalCostAll)} icon={<BiDollarCircle />} loading={loadingSummary} color="orange" darkLight={dl} />
                    </div>
                </div>
            </div>

            {/* ===== TABLE ===== */}
            <XDataTable
                TableName="Stock list"
                columns={columns}
                apiUrl="Product"
                selection={false}
                hideAction={true}
                searchPlaceholder="Search product name or SKU..."
            />

            {showModal && (
                <StockForm
                    initialProduct={selectedProduct}
                    onClose={handleCloseModal}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────── */

const MiniCard = ({ label, sublabel, value, icon, loading, color, darkLight }: {
    label: string; sublabel: string; value: string;
    icon: React.ReactNode; loading: boolean; color: string; darkLight: boolean;
}) => {
    const palette: Record<string, { wrap: string; icon: string; sub: string }> = {
        orange: { wrap: darkLight ? "border-orange-900/40 bg-orange-900/10" : "border-orange-100 bg-orange-50/50", icon: darkLight ? "bg-orange-900/50 text-orange-400" : "bg-orange-100 text-orange-600", sub: darkLight ? "text-orange-500" : "text-orange-600" },
        blue: { wrap: darkLight ? "border-blue-900/40 bg-blue-900/10" : "border-blue-100 bg-blue-50/50", icon: darkLight ? "bg-blue-900/50 text-blue-400" : "bg-blue-100 text-blue-600", sub: darkLight ? "text-blue-500" : "text-blue-600" },
        purple: { wrap: darkLight ? "border-purple-900/40 bg-purple-900/10" : "border-purple-100 bg-purple-50/50", icon: darkLight ? "bg-purple-900/50 text-purple-400" : "bg-purple-100 text-purple-600", sub: darkLight ? "text-purple-500" : "text-purple-600" },
        teal: { wrap: darkLight ? "border-teal-900/40 bg-teal-900/10" : "border-teal-100 bg-teal-50/50", icon: darkLight ? "bg-teal-900/50 text-teal-400" : "bg-teal-100 text-teal-600", sub: darkLight ? "text-teal-500" : "text-teal-600" },
    };
    const p = palette[color] ?? palette.blue;

    return (
        <div className={`flex items-center gap-2 sm:gap-3 rounded-xl px-2 sm:px-3 py-2 sm:py-3 border ${p.wrap}`}>
            <div className={`p-1.5 sm:p-2 rounded-lg text-base sm:text-lg flex-shrink-0 ${p.icon}`}>{icon}</div>
            <div className="min-w-0">
                <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wide truncate ${darkLight ? "text-gray-400" : "text-gray-500"}`}>
                    {label}
                </p>
                <p className={`text-base sm:text-xl font-black leading-tight ${darkLight ? "text-white" : "text-gray-900"}`}>
                    {loading
                        ? <span className={`animate-pulse text-sm sm:text-base ${darkLight ? "text-gray-600" : "text-gray-300"}`}>…</span>
                        : value
                    }
                </p>
                <p className={`text-[9px] sm:text-[10px] truncate ${p.sub}`}>{sublabel}</p>
            </div>
        </div>
    );
};

export default StockList;