import { useEffect, useState } from "react";
import { AxiosApi } from "../../component/Axios/Axios";
import { alertError } from "../../HtmlHelper/Alert";
import { Banknote, BarChart3, DollarSign, Loader2, QrCode, ShoppingCart, Star, X } from "lucide-react";
import XSelectSearch, { SingleValue } from "../../component/XSelectSearch/Xselectsearch";
import { toLocalDate, parseLocalDateString, toLocalDayStart } from "../../utils/dateRange";

interface SalesSummary {
    totalSold: number;
    totalOrders: number;
    saleByCashTotal: number;
    saleByQRTotal: number;
    saleByPointTotal: number;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

const DATE_PRESETS = [
    { label: 'Today', getValue: () => { const d = new Date(); return { from: toLocalDate(d), to: toLocalDate(d) }; } },
    { label: 'This Week', getValue: () => { const now = new Date(); const mon = new Date(now); mon.setDate(now.getDate() - now.getDay() + 1); return { from: toLocalDate(mon), to: toLocalDate(now) }; } },
    { label: 'This Month', getValue: () => { const now = new Date(); const first = new Date(now.getFullYear(), now.getMonth(), 1); return { from: toLocalDate(first), to: toLocalDate(now) }; } },
    { label: 'Last Month', getValue: () => { const now = new Date(); const first = new Date(now.getFullYear(), now.getMonth() - 1, 1); const last = new Date(now.getFullYear(), now.getMonth(), 0); return { from: toLocalDate(first), to: toLocalDate(last) }; } },
    { label: 'This Year', getValue: () => { const now = new Date(); const first = new Date(now.getFullYear(), 0, 1); return { from: toLocalDate(first), to: toLocalDate(now) }; } },
];

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

const SalesSummaryModal = ({ darkLight, onClose }: { darkLight: boolean; onClose: () => void }) => {
    const dl = darkLight;
    const [animating, setAnimating] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<SingleValue | null>(null);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState<SalesSummary | null>(null);

    useEffect(() => {
        setTimeout(() => setAnimating(true), 10);
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const handleClose = () => { setAnimating(false); setTimeout(onClose, 250); };

    const fetchSummary = () => {
        const params: Record<string, string> = {};
        if (selectedStaff?.id) params['StaffId'] = String(selectedStaff.id);
        if (fromDate) params['StartDate'] = toLocalDayStart(parseLocalDateString(fromDate));
        if (toDate) params['EndDate'] = toLocalDayStart(parseLocalDateString(toDate));

        setLoading(true);
        AxiosApi.get<ApiResponse<SalesSummary>>('Orders/sales-summary', { params })
            .then(res => setSummary(res.data.data))
            .catch(err => alertError(err?.response?.data?.message || 'Failed to load sales summary.'))
            .finally(() => setTimeout(() => {
                setLoading(false)
            }, 300));
    };

    // Load an initial summary (no filters) when the popup opens
    useEffect(() => { fetchSummary(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const activeCount = [selectedStaff, fromDate || toDate].filter(Boolean).length;

    const summaryCards = summary ? [
        { icon: <DollarSign className="w-4 h-4" />, label: 'Total Sold', value: `$${summary.totalSold.toFixed(2)}` },
        { icon: <ShoppingCart className="w-4 h-4" />, label: 'Total Orders', value: `${summary.totalOrders}` },
        { icon: <Banknote className="w-4 h-4" />, label: 'Cash Sales', value: `$${summary.saleByCashTotal.toFixed(2)}` },
        { icon: <QrCode className="w-4 h-4" />, label: 'QR Sales', value: `$${summary.saleByQRTotal.toFixed(2)}` },
        { icon: <Star className="w-4 h-4" />, label: 'Point Sales', value: `$${summary.saleByPointTotal.toFixed(2)}` },
    ] : [];

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

                    <div className={`flex items-center justify-between px-5 py-2 border-b ${dl ? 'border-gray-700' : 'border-gray-100'}`}>
                        <div className="flex items-center gap-2">
                            <BarChart3 className={`w-5 h-5 ${dl ? 'text-indigo-400' : 'text-indigo-600'}`} />
                            <h3 className={`font-bold text-lg ${dl ? 'text-white' : 'text-gray-900'}`}>Sales Summary</h3>
                            {activeCount > 0 && (
                                <span className="bg-indigo-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{activeCount}</span>
                            )}
                        </div>
                        <button onClick={handleClose} className={`p-2 rounded-xl transition-colors ${dl ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="px-5 py-2 space-y-5 max-h-[65vh] overflow-y-auto">
                        <div className="space-y-0.5">
                            <label className={`text-xs font-semibold ${dl ? 'text-gray-400' : 'text-gray-500'}`}>Staff</label>
                            <XSelectSearch
                                value={selectedStaff}
                                onChange={v => setSelectedStaff(v as SingleValue | null)}
                                placeholder="Search staff..."
                                selectOption={{ apiEndpoint: 'Person', id: 'id', name: 'username', searchParam: 'Search' }}
                            />
                        </div>

                        <DateFilter
                            darkLight={dl}
                            fromDate={fromDate}
                            toDate={toDate}
                            onChange={(from, to) => { setFromDate(from); setToDate(to); }}
                        />

                        {loading && (
                            <div className="flex items-center justify-center py-2">
                                <Loader2 className={`w-8 h-8 animate-spin ${dl ? 'text-indigo-400' : 'text-indigo-500'}`} />
                            </div>
                        )}

                        {!loading && summary && (
                            <div className="grid grid-cols-2 gap-3">
                                {summaryCards.map(c => (
                                    <div key={c.label} className={`flex items-center gap-3 p-3 rounded-xl ${dl ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                        <div className={`p-1.5 rounded-lg shadow-sm ${dl ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-500'}`}>{c.icon}</div>
                                        <div>
                                            <p className="text-xs text-gray-400">{c.label}</p>
                                            <p className={`text-sm font-semibold ${dl ? 'text-gray-200' : 'text-gray-700'}`}>{c.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={`flex gap-3 px-5 py-2 border-t ${dl ? 'border-gray-700' : 'border-gray-100'}`}>
                        <button
                            onClick={() => { setSelectedStaff(null); setFromDate(''); setToDate(''); }}
                            className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all border
                                ${activeCount > 0
                                    ? 'border-red-300 text-red-500 hover:bg-red-50'
                                    : dl ? 'border-gray-600 text-gray-400' : 'border-gray-200 text-gray-400'
                                }`}
                        >
                            Clear
                        </button>
                        <button
                            onClick={fetchSummary}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white transition-all disabled:opacity-60"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
                            {loading ? 'Loading...' : 'Get Summary'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};



export default SalesSummaryModal;