import { useGlobleContextDarklight } from '../AllContext/context';
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    BiDesktop, BiCart, BiDollarCircle, BiCreditCard, BiStore,
    BiCalendar, BiChevronDown, BiX, BiRefresh,
    BiUser, BiBuilding, BiCategory,
    BiXCircle, BiQrScan, BiCoinStack, BiBox,
} from "react-icons/bi";
import { AxiosApi } from "../component/Axios/Axios";
import { toLocalDate, parseLocalDateString, toLocalDayStart } from "../utils/dateRange";

type FilterOption = "today" | "thisWeek" | "thisMonth" | "lastMonth" | "thisYear" | "custom" | "none";
interface DateRange { from: string; to: string; }

interface SalesSummary {
    totalSold: number;
    totalOrders: number;
    saleByCashTotal: number;
    saleByQRTotal: number;
    saleByPointTotal: number;
}

interface StockSummary {
    grandTotalPrice: number;
    totalQuantity: number;
    totalSerialPrice: number;
    totalSerialQty: number;
    totalNonSerialPrice: number;
    totalNonSerialQty: number;
}

interface DashboardSummary {
    salesSummary: SalesSummary;
    stockSummary: StockSummary;
    totalSuppliers: number;
    totalCustomers: number;
    totalStaff: number;
    totalCategories: number;
}

const FILTER_OPTIONS: { label: string; value: FilterOption }[] = [
    { label: "Today", value: "today" },
    { label: "This Week", value: "thisWeek" },
    { label: "This Month", value: "thisMonth" },
    { label: "Last Month", value: "lastMonth" },
    { label: "This Year", value: "thisYear" },
    { label: "Custom", value: "custom" },
];

const getRange = (option: FilterOption): DateRange => {
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

// ── Filter Dropdown ────────────────────────────────────────────────────────────
const FilterDropdown = ({
    selected, onSelect, onClear,
    fromDate, toDate, onFromChange, onToChange, darkLight,
}: {
    selected: FilterOption;
    onSelect: (v: FilterOption) => void;
    onClear: () => void;
    fromDate: string; toDate: string;
    onFromChange: (v: string) => void;
    onToChange: (v: string) => void;
    darkLight: boolean;
}) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const dl = darkLight;

    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const isFiltered = selected !== "none";
    const label = FILTER_OPTIONS.find(f => f.value === selected)?.label ?? "All Time";

    const dateInputCls = `px-2.5 py-1.5 rounded-lg border text-xs focus:ring-2 focus:ring-blue-500/20 outline-none transition-all w-full ${dl ? "bg-gray-700/80 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-700"}`;

    return (
        <div ref={ref} className="relative flex items-center gap-2">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all
                    bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 min-w-[110px] sm:min-w-[150px]">
                <BiCalendar className="text-sm sm:text-base flex-shrink-0" />
                <span className="flex-1 text-left truncate">{isFiltered ? label : "All Time"}</span>
                <BiChevronDown className={`text-sm sm:text-base transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className={`absolute top-full mt-2 right-0 z-50 rounded-2xl border shadow-2xl py-2 min-w-[200px] sm:min-w-[210px] ${dl ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                    <p className={`px-4 pb-1 text-[10px] font-bold uppercase tracking-widest ${dl ? "text-gray-500" : "text-gray-400"}`}>Period</p>
                    <div className="px-2">
                        {FILTER_OPTIONS.map(opt => (
                            <button key={opt.value} type="button"
                                onClick={() => { onSelect(opt.value); if (opt.value !== "custom") setOpen(false); }}
                                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all flex items-center gap-2.5 ${selected === opt.value
                                    ? dl ? "bg-blue-900/50 text-blue-300 font-semibold" : "bg-blue-50 text-blue-700 font-semibold"
                                    : dl ? "text-gray-300 hover:bg-gray-700/60" : "text-gray-700 hover:bg-gray-50"}`}>
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${selected === opt.value
                                    ? dl ? "bg-blue-400" : "bg-blue-500"
                                    : "bg-transparent border border-gray-400"}`} />
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {selected === "custom" && (
                        <div className={`mx-2 mt-2 p-3 rounded-xl border ${dl ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                            <p className={`text-[10px] font-bold uppercase tracking-widest mb-2.5 ${dl ? "text-gray-400" : "text-gray-500"}`}>Date Range</p>
                            <div className="flex flex-col gap-2">
                                <div>
                                    <label className={`text-[10px] mb-1 block ${dl ? "text-gray-400" : "text-gray-500"}`}>From</label>
                                    <input type="date" value={fromDate} onChange={e => onFromChange(e.target.value)} className={dateInputCls} />
                                </div>
                                <div>
                                    <label className={`text-[10px] mb-1 block ${dl ? "text-gray-400" : "text-gray-500"}`}>To</label>
                                    <input type="date" value={toDate} onChange={e => onToChange(e.target.value)} className={dateInputCls} />
                                </div>
                                {fromDate && toDate && (
                                    <button type="button" onClick={() => setOpen(false)}
                                        className="mt-1 w-full py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-all">
                                        Apply
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {isFiltered && (
                        <>
                            <div className={`mx-3 my-2 border-t ${dl ? "border-gray-700" : "border-gray-100"}`} />
                            <div className="px-2">
                                <button type="button" onClick={() => { onClear(); setOpen(false); }}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${dl ? "text-red-400 hover:bg-red-900/20" : "text-red-500 hover:bg-red-50"}`}>
                                    <BiX className="text-base" />
                                    Clear Filter
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

// ── Dashboard ──────────────────────────────────────────────────────────────────
const Dashboard = () => {
    const { darkLight } = useGlobleContextDarklight();
    const navigate = useNavigate();

    // Filter state
    const [filterOption, setFilterOption] = useState<FilterOption>("none");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    // API data state
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sync dates when filter changes
    useEffect(() => {
        if (filterOption === "none") { setFromDate(""); setToDate(""); }
        else if (filterOption !== "custom") {
            const { from, to } = getRange(filterOption);
            setFromDate(from); setToDate(to);
        }
    }, [filterOption]);

    // Fetch dashboard summary (single endpoint)
    const fetchSummary = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params: Record<string, string> = {};
            if (fromDate) params.FromDate = toLocalDayStart(parseLocalDateString(fromDate));
            if (toDate) params.ToDate = toLocalDayStart(parseLocalDateString(toDate));

            const res = await AxiosApi.get("dashboard/summary", { params });
            // ApiResponse<T> wrapper -> { success, message, data }
            const raw = res.data?.data ?? res.data;
            setSummary(raw);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Failed to load dashboard data");
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 100);

        }
    }, [fromDate, toDate]);

    // Fetch when dates change (debounce for custom input)
    useEffect(() => {
        if (filterOption === "custom" && (!fromDate || !toDate)) return;
        const timer = setTimeout(() => { fetchSummary(); }, 300);
        return () => clearTimeout(timer);
    }, [fromDate, toDate, fetchSummary, filterOption]);

    const handleClearFilter = () => setFilterOption("none");
    const dl = darkLight;

    // ── Sub-components ──────────────────────────────────────────────────────────
    const MetricCard = ({
        title, value, icon, gradient, textColor, description, prefix = "", isLoading, isError, onClick,
    }: {
        title: string; value?: number | string | null;
        icon: React.ReactNode; gradient: string; textColor: string;
        description: string; prefix?: string;
        isLoading?: boolean; isError?: boolean; onClick?: () => void;
    }) => (
        <div
            onClick={onClick}
            role={onClick ? "button" : undefined}
            className={`p-4 sm:p-5 rounded-2xl shadow-xl flex-1 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border ${onClick ? "cursor-pointer" : ""} ${dl
            ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-gray-500"
            : "bg-white border-gray-100 hover:border-gray-300"}`}>
            <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                    <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1.5 truncate ${dl ? "text-gray-400" : "text-gray-500"}`}>
                        {title}
                    </p>
                    {isLoading ? (
                        <AiOutlineLoading3Quarters className="animate-spin text-2xl text-gray-400 mt-1" />
                    ) : isError ? (
                        <span className="text-xs text-red-400">—</span>
                    ) : (
                        <h3 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${textColor}`}>
                            {prefix}{typeof value === "number" ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : (value ?? "—")}
                        </h3>
                    )}
                </div>
                <div className={`${gradient} p-2.5 sm:p-3 rounded-xl shadow-lg flex-shrink-0 ml-2`}>
                    <div className="text-lg sm:text-xl text-white">{icon}</div>
                </div>
            </div>
            <p className={`text-xs ${dl ? "text-gray-500" : "text-gray-400"}`}>{description}</p>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col gap-4 sm:gap-6 px-2 sm:px-4 pb-8">

            {/* ===== HEADER ===== */}
            <div className={`rounded-2xl px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-3 shadow-lg ${dl
                ? "bg-gradient-to-r from-gray-900 via-blue-950 to-gray-900 border border-blue-900"
                : "bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500"}`}>
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <div className="p-2 sm:p-3 bg-white/20 rounded-xl sm:rounded-2xl backdrop-blur-sm flex-shrink-0">
                        <BiDesktop className="w-6 h-6 sm:w-9 sm:h-9 text-white" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-base sm:text-2xl font-extrabold text-white tracking-tight truncate">
                            Sales Dashboard
                        </h1>
                        <p className="text-xs sm:text-sm text-blue-100 mt-0.5 truncate">
                            Computers & Accessories — Overview
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    {/* Refresh button */}
                    <button
                        type="button"
                        onClick={() => fetchSummary()}
                        disabled={loading}
                        className="p-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white transition-all disabled:opacity-50"
                        title="Refresh data">
                        <BiRefresh className={`text-lg ${loading ? "animate-spin" : ""}`} />
                    </button>
                    <div className="hidden sm:flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                        <BiStore className="text-white text-lg" />
                        <span className="text-sm text-white font-semibold">Store Admin</span>
                    </div>
                    <FilterDropdown
                        selected={filterOption}
                        onSelect={setFilterOption}
                        onClear={handleClearFilter}
                        fromDate={fromDate}
                        toDate={toDate}
                        onFromChange={setFromDate}
                        onToChange={setToDate}
                        darkLight={dl}
                    />
                </div>
            </div>

            {/* ===== ERROR BANNER ===== */}
            {error && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                    <BiXCircle className="text-lg flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* ===== SECTION: Sales Summary ===== */}
            <div>
                <p className={`text-xs font-bold uppercase tracking-widest mb-3 px-1 ${dl ? "text-gray-500" : "text-gray-400"}`}>
                    Sales Summary
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
                    <MetricCard
                        title="Total Orders"
                        value={summary?.salesSummary?.totalOrders}
                        icon={<BiCart />}
                        gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
                        textColor="text-emerald-500"
                        description="Completed orders"
                        isLoading={loading}
                        isError={!!error}
                        onClick={() => navigate("/order-list")}
                    />
                    <MetricCard
                        title="Total Sale Price"
                        prefix="$"
                        value={summary?.salesSummary?.totalSold}
                        icon={<BiDollarCircle />}
                        gradient="bg-gradient-to-br from-blue-500 to-blue-700"
                        textColor="text-blue-500"
                        description="Total sales revenue"
                        isLoading={loading}
                        isError={!!error}
                        onClick={() => navigate("/order-list")}
                    />

                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-4">
                    <MetricCard
                        title="Cash Sales"
                        prefix="$"
                        value={summary?.salesSummary?.saleByCashTotal}
                        icon={<BiCreditCard />}
                        gradient="bg-gradient-to-br from-teal-500 to-teal-700"
                        textColor="text-teal-500"
                        description="Paid by cash"
                        isLoading={loading}
                        isError={!!error}
                        onClick={() => navigate("/order-list")}
                    />
                    <MetricCard
                        title="QR Sales"
                        prefix="$"
                        value={summary?.salesSummary?.saleByQRTotal}
                        icon={<BiQrScan />}
                        gradient="bg-gradient-to-br from-pink-500 to-pink-700"
                        textColor="text-pink-500"
                        description="Paid by KHQR"
                        isLoading={loading}
                        isError={!!error}
                        onClick={() => navigate("/order-list")}
                    />
                    <MetricCard
                        title="Point Sales"
                        prefix="$"
                        value={summary?.salesSummary?.saleByPointTotal}
                        icon={<BiCoinStack />}
                        gradient="bg-gradient-to-br from-amber-500 to-amber-700"
                        textColor="text-amber-500"
                        description="Paid by points"
                        isLoading={loading}
                        isError={!!error}
                        onClick={() => navigate("/order-list")}
                    />
                </div>
            </div>

            {/* ===== SECTION: Stock Summary ===== */}
            <div>
                <p className={`text-xs font-bold uppercase tracking-widest mb-3 px-1 ${dl ? "text-gray-500" : "text-gray-400"}`}>
                    Stock In Summary
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
                    <MetricCard
                        title="Total Quantity"
                        value={summary?.stockSummary?.totalQuantity}
                        icon={<BiBox />}
                        gradient="bg-gradient-to-br from-sky-500 to-sky-700"
                        textColor="text-sky-500"
                        description="Net stock-in quantity"
                        isLoading={loading}
                        isError={!!error}
                        onClick={() => navigate("/product")}
                    />
                    <MetricCard
                        title="Grand Total Price"
                        prefix="$"
                        value={summary?.stockSummary?.grandTotalPrice}
                        icon={<BiDollarCircle />}
                        gradient="bg-gradient-to-br from-indigo-500 to-indigo-700"
                        textColor="text-indigo-500"
                        description="Net stock-in value"
                        isLoading={loading}
                        isError={!!error}
                        onClick={() => navigate("/product")}
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
                    <div
                        onClick={() => navigate("/product")}
                        className={`rounded-2xl p-4 sm:p-5 border-2 cursor-pointer transition-all hover:scale-[1.02] ${dl ? "border-blue-700/40 bg-blue-900/10" : "border-blue-200 bg-blue-50"}`}>
                        <p className={`text-sm font-bold mb-3 flex items-center gap-2 ${dl ? "text-blue-300" : "text-blue-700"}`}>
                            🔢 Serialized
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className={`text-[10px] uppercase font-bold ${dl ? "text-gray-500" : "text-gray-400"}`}>Qty</p>
                                {loading ? <AiOutlineLoading3Quarters className="animate-spin text-lg text-gray-400 mt-1" /> :
                                    <p className={`text-lg font-bold ${dl ? "text-gray-100" : "text-gray-800"}`}>{(summary?.stockSummary?.totalSerialQty ?? 0).toLocaleString()}</p>}
                            </div>
                            <div>
                                <p className={`text-[10px] uppercase font-bold ${dl ? "text-gray-500" : "text-gray-400"}`}>Price</p>
                                {loading ? <AiOutlineLoading3Quarters className="animate-spin text-lg text-gray-400 mt-1" /> :
                                    <p className={`text-lg font-bold ${dl ? "text-gray-100" : "text-gray-800"}`}>${(summary?.stockSummary?.totalSerialPrice ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>}
                            </div>
                        </div>
                    </div>
                    <div
                        onClick={() => navigate("/product")}
                        className={`rounded-2xl p-4 sm:p-5 border-2 cursor-pointer transition-all hover:scale-[1.02] ${dl ? "border-purple-700/40 bg-purple-900/10" : "border-purple-200 bg-purple-50"}`}>
                        <p className={`text-sm font-bold mb-3 flex items-center gap-2 ${dl ? "text-purple-300" : "text-purple-700"}`}>
                            📦 Non-Serialized
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className={`text-[10px] uppercase font-bold ${dl ? "text-gray-500" : "text-gray-400"}`}>Qty</p>
                                {loading ? <AiOutlineLoading3Quarters className="animate-spin text-lg text-gray-400 mt-1" /> :
                                    <p className={`text-lg font-bold ${dl ? "text-gray-100" : "text-gray-800"}`}>{(summary?.stockSummary?.totalNonSerialQty ?? 0).toLocaleString()}</p>}
                            </div>
                            <div>
                                <p className={`text-[10px] uppercase font-bold ${dl ? "text-gray-500" : "text-gray-400"}`}>Price</p>
                                {loading ? <AiOutlineLoading3Quarters className="animate-spin text-lg text-gray-400 mt-1" /> :
                                    <p className={`text-lg font-bold ${dl ? "text-gray-100" : "text-gray-800"}`}>${(summary?.stockSummary?.totalNonSerialPrice ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== SECTION: Store Info ===== */}
            <div>
                <p className={`text-xs font-bold uppercase tracking-widest mb-3 px-1 ${dl ? "text-gray-500" : "text-gray-400"}`}>
                    Store Info
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <MetricCard
                        title="Total Suppliers"
                        value={summary?.totalSuppliers}
                        icon={<BiBuilding />}
                        gradient="bg-gradient-to-br from-indigo-500 to-indigo-700"
                        textColor="text-indigo-500"
                        description="Registered suppliers"
                        isLoading={loading}
                        isError={!!error}
                        onClick={() => navigate("/supplier")}
                    />
                    <MetricCard
                        title="Total Customers"
                        value={summary?.totalCustomers}
                        icon={<BiUser />}
                        gradient="bg-gradient-to-br from-purple-500 to-purple-700"
                        textColor="text-purple-500"
                        description="Registered customers"
                        isLoading={loading}
                        isError={!!error}
                        onClick={() => navigate("/member")}
                    />
                    <MetricCard
                        title="Total Staff"
                        value={summary?.totalStaff}
                        icon={<BiUser />}
                        gradient="bg-gradient-to-br from-cyan-500 to-cyan-700"
                        textColor="text-cyan-500"
                        description="Active staff members"
                        isLoading={loading}
                        isError={!!error}
                        onClick={() => navigate("/staff")}
                    />
                    <MetricCard
                        title="Total Categories"
                        value={summary?.totalCategories}
                        icon={<BiCategory />}
                        gradient="bg-gradient-to-br from-yellow-500 to-yellow-700"
                        textColor="text-yellow-500"
                        description="Product categories"
                        isLoading={loading}
                        isError={!!error}
                        onClick={() => navigate("/category")}
                    />
                </div>
            </div>

        </div>
    );
};

export default Dashboard;