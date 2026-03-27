import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useGlobleContextDarklight } from '../AllContext/context';
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useState, useEffect, useRef } from "react";
import {
    BiDesktop, BiMouse, BiCart, BiDollarCircle,
    BiPackage, BiTrendingUp, BiCreditCard, BiStore,
    BiCalendar, BiChevronDown, BiX,
} from "react-icons/bi";
import { FaChartLine } from "react-icons/fa";

// ── Types ──────────────────────────────────────────────────────────────────────
type FilterOption = "today" | "thisWeek" | "thisMonth" | "lastMonth" | "thisYear" | "custom" | "none";

interface DateRange { from: string; to: string; }
interface FilterPayload { filter: FilterOption; label: string; from: string; to: string; }

const FILTER_OPTIONS: { label: string; value: FilterOption }[] = [
    { label: "Today",      value: "today"     },
    { label: "This Week",  value: "thisWeek"  },
    { label: "This Month", value: "thisMonth" },
    { label: "Last Month", value: "lastMonth" },
    { label: "This Year",  value: "thisYear"  },
    { label: "Custom",     value: "custom"    },
];

// ── Mock Static Data ───────────────────────────────────────────────────────────
const STATIC_MONTHLY_DATA = [
    { name: "Jan", revenue: 4500 },
    { name: "Feb", revenue: 5200 },
    { name: "Mar", revenue: 6100 },
    { name: "Apr", revenue: 5800 },
    { name: "May", revenue: 7200 },
    { name: "Jun", revenue: 8500 },
    { name: "Jul", revenue: 9100 },
    { name: "Aug", revenue: 8900 },
    { name: "Sep", revenue: 9500 },
    { name: "Oct", revenue: 10800 },
    { name: "Nov", revenue: 12500 },
    { name: "Dec", revenue: 15000 },
];

const STATIC_WEEKLY_DATA = [
    { name: "Mon", sales: 1200 },
    { name: "Tue", sales: 1900 },
    { name: "Wed", sales: 1700 },
    { name: "Thu", sales: 2100 },
    { name: "Fri", sales: 2500 },
    { name: "Sat", sales: 3200 },
    { name: "Sun", sales: 2800 },
];

const toLocalDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

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

const FilterDropdown = ({
    selected, onSelect, onClear,
    fromDate, toDate, onFromChange, onToChange,
    darkLight,
}: {
    selected: FilterOption;
    onSelect: (v: FilterOption) => void;
    onClear: () => void;
    fromDate: string;
    toDate: string;
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

    const dateInputCls = `px-2.5 py-1.5 rounded-lg border text-xs focus:ring-2 focus:ring-blue-500/20 outline-none transition-all w-full ${
        dl ? "bg-gray-700/80 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-700"
    }`;

    return (
        <div ref={ref} className="relative flex items-center gap-2">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all min-w-[150px] ${
                    dl ? "bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600"
                       : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}>
                <BiCalendar className="text-base flex-shrink-0" />
                <span className="flex-1 text-left">{isFiltered ? label : "All Time"}</span>
                <BiChevronDown className={`text-base transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
            </button>

            {/* Panel */}
            {open && (
                <div className={`absolute top-full mt-2 right-0 z-50 rounded-2xl border shadow-2xl py-2 min-w-[210px] ${
                    dl ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                }`}>
                    <p className={`px-4 pb-1 text-[10px] font-bold uppercase tracking-widest ${dl ? "text-gray-500" : "text-gray-400"}`}>
                        Period
                    </p>

                    {/* Preset rows */}
                    <div className="px-2">
                        {FILTER_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    onSelect(opt.value);
                                    if (opt.value !== "custom") setOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all flex items-center gap-2.5 ${
                                    selected === opt.value
                                        ? dl ? "bg-blue-900/50 text-blue-300 font-semibold" : "bg-blue-50 text-blue-700 font-semibold"
                                        : dl ? "text-gray-300 hover:bg-gray-700/60"          : "text-gray-700 hover:bg-gray-50"
                                }`}>
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${
                                    selected === opt.value
                                        ? dl ? "bg-blue-400" : "bg-blue-500"
                                        : "bg-transparent border border-gray-400"
                                }`} />
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* Custom date pickers — shown inline when Custom is selected */}
                    {selected === "custom" && (
                        <div className={`mx-2 mt-2 p-3 rounded-xl border ${
                            dl ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"
                        }`}>
                            <p className={`text-[10px] font-bold uppercase tracking-widest mb-2.5 ${dl ? "text-gray-400" : "text-gray-500"}`}>
                                Date Range
                            </p>
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
                                    <button
                                        type="button"
                                        onClick={() => setOpen(false)}
                                        className="mt-1 w-full py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-all">
                                        Apply
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Clear at bottom */}
                    {isFiltered && (
                        <>
                            <div className={`mx-3 my-2 border-t ${dl ? "border-gray-700" : "border-gray-100"}`} />
                            <div className="px-2">
                                <button
                                    type="button"
                                    onClick={() => { onClear(); setOpen(false); }}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                                        dl ? "text-red-400 hover:bg-red-900/20" : "text-red-500 hover:bg-red-50"
                                    }`}>
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

    const [filterOption, setFilterOption] = useState<FilterOption>("thisMonth");
    const [fromDate, setFromDate] = useState(getRange("thisMonth").from);
    const [toDate, setToDate] = useState(getRange("thisMonth").to);

    // Sync dates when preset option changes
    useEffect(() => {
        if (filterOption === "none") {
            setFromDate(""); 
            setToDate("");
        } else if (filterOption !== "custom") {
            const { from, to } = getRange(filterOption);
            setFromDate(from); 
            setToDate(to);
        }
    }, [filterOption]);

    // Handle single source-of-truth log
    useEffect(() => {
        const label = FILTER_OPTIONS.find(f => f.value === filterOption)?.label ?? "All Time";
        const payload: FilterPayload = { filter: filterOption, label, from: fromDate, to: toDate };
        console.log("📅 Dashboard filter applied:", payload);
        // TODO: fetchDashboardData(fromDate, toDate)
    }, [filterOption, fromDate, toDate]);

    const handleClearFilter = () => setFilterOption("none");

    const dl = darkLight;

    const MetricCard = ({ title, value, icon, gradient, textColor, description, trend, prefix = "", isLoading }: {
        title: string; value?: number | string; icon: React.ReactNode;
        gradient: string; textColor: string; description: string;
        trend?: number | string; prefix?: string; isLoading?: boolean;
    }) => (
        <div className={`p-6 rounded-2xl shadow-xl flex-1 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl border ${
            dl ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-gray-500"
               : "bg-white border-gray-100 hover:border-gray-300"
        }`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${dl ? "text-gray-400" : "text-gray-500"}`}>{title}</p>
                    {isLoading
                        ? <AiOutlineLoading3Quarters className="animate-spin text-2xl text-gray-400" />
                        : <>
                            <h3 className={`text-3xl font-extrabold tracking-tight ${textColor}`}>
                                {prefix}{typeof value === "number" ? value.toLocaleString() : (value ?? "—")}
                            </h3>
                            {trend !== undefined && (
                                <p className={`text-xs font-semibold mt-1 flex items-center gap-1 ${
                                    typeof trend === "number" ? (trend >= 0 ? "text-emerald-500" : "text-red-500") : "text-emerald-500"
                                }`}>
                                    <FaChartLine />
                                    {typeof trend === "number" ? `${trend >= 0 ? "+" : ""}${trend.toFixed(1)}%` : trend}
                                </p>
                            )}
                        </>
                    }
                </div>
                <div className={`${gradient} p-3.5 rounded-xl shadow-lg flex-shrink-0`}>
                    <div className="text-2xl text-white">{icon}</div>
                </div>
            </div>
            <p className={`text-xs ${dl ? "text-gray-500" : "text-gray-400"}`}>{description}</p>
        </div>
    );

    const ChartCard = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
        <div className={`rounded-2xl shadow-xl p-6 border h-full ${dl ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700" : "bg-white border-gray-100"}`}>
            <h2 className={`text-lg font-bold mb-5 flex items-center gap-2 ${dl ? "text-white" : "text-gray-900"}`}>
                <span className="text-blue-500">{icon}</span>{title}
            </h2>
            <div className="h-[250px] w-full">
                {children}
            </div>
        </div>
    );

    const tooltipStyle = {
        backgroundColor: dl ? "#1f2937" : "#fff", borderColor: dl ? "#374151" : "#e5e7eb",
        borderRadius: "10px", color: dl ? "#f9fafb" : "#111827", fontSize: "12px",
    };

    return (
        <div className="flex-1 flex flex-col gap-6 px-4 pb-8">

            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className={`rounded-2xl px-6 py-5 flex items-center justify-between shadow-lg ${
                dl ? "bg-gradient-to-r from-gray-900 via-blue-950 to-gray-900 border border-blue-900"
                   : "bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500"
            }`}>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                        <BiDesktop className="w-9 h-9 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight">Sales Dashboard</h1>
                        <p className="text-sm text-blue-100 mt-0.5">Computers & Accessories — Overview</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
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

            {/* ── Metric Grid 1 ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <MetricCard title="Total Revenue" prefix="$" value={125430} trend={12.5} icon={<BiDollarCircle />} gradient="bg-gradient-to-br from-blue-500 to-blue-700" textColor="text-blue-500" description="Cumulative sales revenue" />
                <MetricCard title="Total Orders" value={1420} trend={8.2} icon={<BiCart />} gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" textColor="text-emerald-500" description="All completed orders" />
                <MetricCard title="Products Sold" value={3850} trend={24.1} icon={<BiMouse />} gradient="bg-gradient-to-br from-purple-500 to-purple-700" textColor="text-purple-500" description="Units sold this period" />
                <MetricCard title="Today's Sales" prefix="$" value={2450} trend={-3.2} icon={<BiTrendingUp />} gradient="bg-gradient-to-br from-orange-500 to-orange-700" textColor="text-orange-500" description="Revenue generated today" />
            </div>

            {/* ── Metric Grid 2 ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <MetricCard title="Total Products" value={452} icon={<BiDesktop />} gradient="bg-gradient-to-br from-cyan-500 to-cyan-700" textColor="text-cyan-500" description="Items in catalog" />
                <MetricCard title="Low Stock Items" value={12} icon={<BiPackage />} gradient="bg-gradient-to-br from-red-500 to-red-700" textColor="text-red-500" description="Products needing restock" />
                <MetricCard title="Total Inventory Cost" prefix="$" value={45800} icon={<BiCreditCard />} gradient="bg-gradient-to-br from-pink-500 to-pink-700" textColor="text-pink-500" description="Value of goods in stock" />
                <MetricCard title="Gross Profit" prefix="$" value={79630} trend={14.6} icon={<BiDollarCircle />} gradient="bg-gradient-to-br from-teal-500 to-teal-700" textColor="text-teal-500" description="Revenue minus cost" />
            </div>

            {/* ── Charts ─────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                    <ChartCard title="Monthly Revenue Flow" icon={<FaChartLine />}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={STATIC_MONTHLY_DATA} barSize={28}>
                                <defs>
                                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="100%" stopColor="#1d4ed8" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={dl ? "#374151" : "#f0f0f0"} vertical={false} />
                                <XAxis dataKey="name" stroke={dl ? "#6b7280" : "#9ca3af"} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis stroke={dl ? "#6b7280" : "#9ca3af"} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: dl ? "#ffffff08" : "#00000008" }} />
                                <Bar dataKey="revenue" fill="url(#blueGrad)" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                <div className="lg:col-span-1">
                    <ChartCard title="Weekly Sales Trend" icon={<BiTrendingUp />}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={STATIC_WEEKLY_DATA}>
                                <defs>
                                    <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={dl ? "#374151" : "#f0f0f0"} vertical={false} />
                                <XAxis dataKey="name" stroke={dl ? "#6b7280" : "#9ca3af"} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis stroke={dl ? "#6b7280" : "#9ca3af"} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2.5} fill="url(#emeraldGrad)" dot={{ r: 3, fill: "#10b981" }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;