import { useState } from "react";
import { AiOutlineBarChart } from "react-icons/ai";
import { useGlobleContextDarklight } from "../../../AllContext/context";
import XSelectSearch, { SingleValue } from "../../../component/XSelectSearch/Xselectsearch";
import { alertError } from "../../../HtmlHelper/Alert";
import { AxiosApi } from "../../../component/Axios/Axios";
import { parseLocalDateString, toLocalDayStart, toLocalDayEnd } from "../../../utils/dateRange";

interface StockInSummaryResult {
    grandTotalPrice: number;
    totalQuantity: number;
    stockInCount: number;
    stockOutCount: number;
    adjustmentCount: number;
    returnOutCount: number;
    returnInCount: number;
    totalSerialPrice: number;
    totalSerialQty: number;
    totalNonSerialPrice: number;
    totalNonSerialQty: number;
}

const StockInSummaryButton = () => {
    const { darkLight } = useGlobleContextDarklight();
    const dl = darkLight;

    const [showModal, setShowModal] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<StockInSummaryResult | null>(null);

    const [selectedProduct, setSelectedProduct] = useState<SingleValue | null>(null);
    const [selectedSupplier, setSelectedSupplier] = useState<SingleValue | null>(null);
    const [selectedUser, setSelectedUser] = useState<SingleValue | null>(null);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const inputClass = `w-full px-3 py-2 rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${dl
        ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:bg-gray-700 focus:border-blue-500"
        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-blue-50/30"}`;
    const labelClass = `block mb-1 text-xs font-semibold ${dl ? "text-gray-300" : "text-gray-600"}`;

    const fetchSummary = async (overrideParams?: Record<string, any>) => {
        setLoading(true);
        try {
            const params = overrideParams ?? {
                ProductId: selectedProduct?.id,
                SupplierId: selectedSupplier?.id,
                CreatedBy: selectedUser?.id,
                From: fromDate ? toLocalDayStart(parseLocalDateString(fromDate)) : undefined,
                To: toDate ? toLocalDayEnd(parseLocalDateString(toDate)) : undefined,
            };
            const res = await AxiosApi("stock/in/summary", { params });
            setResult(res.data); // or setResult(res) — confirm this per my earlier note
        } catch (error) {
            console.error("Error fetching stock in summary:", error);
            alertError("Failed to load summary!");
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 300);
        }
    };

    const handleOpen = () => {
        setShowModal(true);
        setTimeout(() => setIsAnimating(true), 10);
        fetchSummary();
    };

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => { setShowModal(false); setResult(null); }, 300);
    };

    const handleApplyFilter = () => fetchSummary();

    const handleResetFilter = () => {
        setSelectedProduct(null);
        setSelectedSupplier(null);
        setSelectedUser(null);
        setFromDate("");
        setToDate("");
        fetchSummary({});
    };

    const money = (v?: number) => `$${(v ?? 0).toFixed(2)}`;

    return (
        <>
            <button onClick={handleOpen}
                className="bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white px-3 sm:px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5">
                <AiOutlineBarChart className="w-4 h-4" /> Stock Summary
            </button>

            {showModal && (
                <>
                    <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"}`}
                        onClick={handleClose} />
                    <div className={`fixed mt-15 inset-0 flex items-center justify-center z-50 p-4 pointer-events-none transition-all duration-300 ${isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                        <div className={`rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden pointer-events-auto transform transition-all duration-300
                            ${dl ? "bg-gray-800" : "bg-white"} ${isAnimating ? "translate-y-0" : "translate-y-4"}`}
                            style={{ maxHeight: "calc(100vh - 80px)" }}
                            onClick={e => e.stopPropagation()}>

                            {/* Header */}
                            <div className={`px-6 py-1 border-b flex-shrink-0 flex justify-between items-start ${dl ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                                <div>
                                    <h2 className={`text-lg sm:text-2xl font-bold flex items-center gap-2 ${dl ? "text-white" : "text-gray-900"}`}>
                                        <AiOutlineBarChart className="text-indigo-500" /> Stock In Summary
                                    </h2>
                                    <p className={`text-xs sm:text-sm mt-0.5 ${dl ? "text-gray-400" : "text-gray-500"}`}>
                                        Overview of stock movements by filter
                                    </p>
                                </div>
                                <button onClick={handleClose}
                                    className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xl transition-all
                                    ${dl ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}>
                                    ×
                                </button>
                            </div>

                            <div className="overflow-y-auto flex-1 px-6 py-2">

                                {/* Filters */}
                                <div className={`rounded-xl border p-4 mb-5 ${dl ? "border-gray-700 bg-gray-700/20" : "border-gray-200 bg-gray-50"}`}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                        <div>
                                            <label className={labelClass}>Product</label>
                                            <XSelectSearch
                                                value={selectedProduct}
                                                onChange={setSelectedProduct}
                                                placeholder="All products..."
                                                selectOption={{ apiEndpoint: "Products", id: "id", name: "name" }}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Supplier</label>
                                            <XSelectSearch
                                                value={selectedSupplier}
                                                onChange={setSelectedSupplier}
                                                placeholder="All suppliers..."
                                                selectOption={{ apiEndpoint: "Suppliers/lookup", id: "id", name: "name" }}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>From</label>
                                            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>To</label>
                                            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className={inputClass} />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-3">
                                        <button onClick={handleResetFilter}
                                            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${dl ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                                            Reset
                                        </button>
                                        <button onClick={handleApplyFilter}
                                            className="px-5 py-2 rounded-lg text-xs font-medium bg-indigo-500 hover:bg-indigo-600 text-white transition-all">
                                            Apply Filter
                                        </button>
                                    </div>
                                </div>

                                {/* Loading */}
                                {loading && (
                                    <div className="flex justify-center py-10">
                                        <svg className="animate-spin h-8 w-8 text-indigo-500" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    </div>
                                )}

                                {/* Result */}
                                {!loading && result && (
                                    <div className="space-y-5">

                                        {/* Grand total highlight */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className={`rounded-xl p-4 ${dl ? "bg-emerald-900/20 border border-emerald-700/40" : "bg-emerald-50 border border-emerald-200"}`}>
                                                <p className={`text-xs font-semibold mb-1 ${dl ? "text-emerald-300" : "text-emerald-700"}`}>Grand Total Price</p>
                                                <p className={`text-2xl font-bold ${dl ? "text-emerald-200" : "text-emerald-700"}`}>{money(result.grandTotalPrice)}</p>
                                            </div>
                                            <div className={`rounded-xl p-4 ${dl ? "bg-blue-900/20 border border-blue-700/40" : "bg-blue-50 border border-blue-200"}`}>
                                                <p className={`text-xs font-semibold mb-1 ${dl ? "text-blue-300" : "text-blue-700"}`}>Total Quantity</p>
                                                <p className={`text-2xl font-bold ${dl ? "text-blue-200" : "text-blue-700"}`}>{result.totalQuantity}</p>
                                            </div>
                                        </div>

                                        {/* Movement counts */}
                                        <div>
                                            <p className={`text-xs font-bold uppercase mb-2 ${dl ? "text-gray-400" : "text-gray-500"}`}>Movement Counts</p>
                                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                                {[
                                                    { label: "Stock In", value: result.stockInCount, color: "emerald" },
                                                    { label: "Stock Out", value: result.stockOutCount, color: "red" },
                                                    { label: "Adjustment", value: result.adjustmentCount, color: "amber" },
                                                    { label: "Return Out", value: result.returnOutCount, color: "purple" },
                                                    { label: "Return In", value: result.returnInCount, color: "sky" },
                                                ].map(item => (
                                                    <div key={item.label} className={`rounded-lg p-3 text-center ${dl ? "bg-gray-700/40" : "bg-gray-100"}`}>
                                                        <p className={`text-lg font-bold ${dl ? "text-gray-100" : "text-gray-800"}`}>{item.value}</p>
                                                        <p className={`text-[11px] mt-0.5 ${dl ? "text-gray-400" : "text-gray-500"}`}>{item.label}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Serial vs Non-Serial breakdown */}
                                        <div>
                                            <p className={`text-xs font-bold uppercase mb-2 ${dl ? "text-gray-400" : "text-gray-500"}`}>By Product Type</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className={`rounded-xl p-4 border-2 ${dl ? "border-blue-700/40 bg-blue-900/10" : "border-blue-200 bg-blue-50"}`}>
                                                    <p className={`text-sm font-bold mb-2 ${dl ? "text-blue-300" : "text-blue-700"}`}>🔢 Serialized</p>
                                                    <div className="flex justify-between text-sm">
                                                        <span className={dl ? "text-gray-400" : "text-gray-500"}>Qty</span>
                                                        <span className={`font-semibold ${dl ? "text-gray-100" : "text-gray-800"}`}>{result.totalSerialQty}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm mt-1">
                                                        <span className={dl ? "text-gray-400" : "text-gray-500"}>Price</span>
                                                        <span className={`font-semibold ${dl ? "text-gray-100" : "text-gray-800"}`}>{money(result.totalSerialPrice)}</span>
                                                    </div>
                                                </div>
                                                <div className={`rounded-xl p-4 border-2 ${dl ? "border-purple-700/40 bg-purple-900/10" : "border-purple-200 bg-purple-50"}`}>
                                                    <p className={`text-sm font-bold mb-2 ${dl ? "text-purple-300" : "text-purple-700"}`}>📦 Non-Serialized</p>
                                                    <div className="flex justify-between text-sm">
                                                        <span className={dl ? "text-gray-400" : "text-gray-500"}>Qty</span>
                                                        <span className={`font-semibold ${dl ? "text-gray-100" : "text-gray-800"}`}>{result.totalNonSerialQty}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm mt-1">
                                                        <span className={dl ? "text-gray-400" : "text-gray-500"}>Price</span>
                                                        <span className={`font-semibold ${dl ? "text-gray-100" : "text-gray-800"}`}>{money(result.totalNonSerialPrice)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!loading && !result && (
                                    <p className={`text-center text-sm py-10 ${dl ? "text-gray-500" : "text-gray-400"}`}>No data</p>
                                )}
                            </div>

                            {/* Footer */}
                            <div className={`px-6 py-3 border-t flex-shrink-0 flex justify-end ${dl ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
                                <button onClick={handleClose}
                                    className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${dl ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default StockInSummaryButton;