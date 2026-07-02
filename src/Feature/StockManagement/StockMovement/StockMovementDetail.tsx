import { useEffect, useState } from "react";
import { useGlobleContextDarklight } from "../../../AllContext/context";
import { AxiosApi } from "../../../component/Axios/Axios";
import { alertError } from "../../../HtmlHelper/Alert";

const TYPE_LABEL: Record<string, { label: string; icon: string; dark: string; light: string }> = {
    "In": { label: "Stock In", icon: "📥", dark: "bg-emerald-900/40 text-emerald-300", light: "bg-emerald-100 text-emerald-700" },
    "Out": { label: "Stock Out", icon: "📤", dark: "bg-red-900/40 text-red-300", light: "bg-red-100 text-red-700" },
    "Adjustment": { label: "Adjustment", icon: "⚙️", dark: "bg-amber-900/40 text-amber-300", light: "bg-amber-100 text-amber-700" },
    "ReturnOut": { label: "Return Out", icon: "🚚", dark: "bg-purple-900/40 text-purple-300", light: "bg-purple-100 text-purple-700" },
    "ReturnIn": { label: "Return In", icon: "🔄", dark: "bg-blue-900/40 text-blue-300", light: "bg-blue-100 text-blue-700" },
};

const InfoItem = ({ label, value, darkLight }: { label: string; value: string; darkLight: boolean }) => (
    <div>
        <p className={`text-xs font-semibold mb-1 ${darkLight ? "text-gray-500" : "text-gray-400"}`}>{label}</p>
        <p className={`text-sm font-medium ${darkLight ? "text-gray-200" : "text-gray-800"}`}>{value || "N/A"}</p>
    </div>
);

const StockMovementDetail = ({ id, onClose }: { id: number; onClose: () => void }) => {
    const { darkLight } = useGlobleContextDarklight();
    const [isAnimating, setIsAnimating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const abortController = new AbortController();

        const fetchDetail = async () => {
            try {
                const res = await AxiosApi.get(`stock/${id}`, {
                    signal: abortController.signal
                });
                setData(res?.data?.data ?? res?.data);
            } catch (err: any) {
                if (!abortController.signal.aborted) {
                    alertError("Failed to load movement details.");
                    onClose();
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchDetail();
        setTimeout(() => setIsAnimating(true), 10);

        return () => { abortController.abort(); };
    }, [id]);

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => onClose(), 300);
    };

    const typeInfo = TYPE_LABEL[data?.type];

    return (
        <>
            <div className={`fixed top-[65px] inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"}`} />
            <div className={`fixed top-[65px] left-0 right-0 bottom-0 z-40 flex items-center justify-center py-8 sm:py-1 pointer-events-none transition-all duration-300 ${isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                <div className={`rounded-2xl shadow-2xl w-full max-w-lg max-h-full flex flex-col overflow-hidden pointer-events-auto transform transition-all duration-300 ${darkLight ? "bg-gray-800" : "bg-white"} ${isAnimating ? "translate-y-0" : "translate-y-4"}`}>

                    <div className={`px-6 py-4 border-b flex justify-between items-center flex-shrink-0 ${darkLight ? "border-gray-700" : "border-gray-200"}`}>
                        <h2 className={`text-lg font-bold ${darkLight ? "text-white" : "text-gray-900"}`}>Movement Detail</h2>
                        <button onClick={handleClose} className={`w-8 h-8 rounded-full flex items-center justify-center text-xl transition-colors ${darkLight ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"}`}>×</button>
                    </div>

                    <div className="overflow-y-auto flex-1 p-6 custom-scrollbar" style={{ scrollbarWidth: "thin", scrollbarColor: darkLight ? "#4a5568 transparent" : "#cbd5e0 transparent" }}>
                        {loading ? (
                            <div className="flex justify-center py-10 text-gray-400">Loading...</div>
                        ) : data ? (
                            <div className="space-y-6">
                                
                                {/* Product Info */}
                                <div className={`flex items-center gap-3 pb-4 border-b border-dashed ${darkLight ? 'border-gray-600' : 'border-gray-200'}`}>
                                    {data.imageProduct && <img src={data.imageProduct} className="w-12 h-12 rounded-xl object-cover ring-2 ring-gray-200 dark:ring-gray-600" />}
                                    <div className="min-w-0 flex-1">
                                        <p className={`font-bold text-base truncate ${darkLight ? "text-white" : "text-gray-900"}`}>{data.productName}</p>
                                        {data.productSKU && <p className="text-xs text-gray-400 font-mono mt-0.5">{data.productSKU}</p>}
                                    </div>
                                    {typeInfo && (
                                        <span className={`flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${typeInfo[darkLight ? "dark" : "light"]}`}>
                                            {typeInfo.icon} {typeInfo.label}
                                        </span>
                                    )}
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    {data.typeAdjustment && (
                                        <InfoItem label="Adj. Type" value={data.typeAdjustment} darkLight={darkLight} />
                                    )}
                                    <InfoItem label="Moved Qty" value={String(data.quantity)} darkLight={darkLight} />
                                    <InfoItem label="Unit Price" value={`$ ${data.unitPrice?.toFixed(2) ?? '0.00'}`} darkLight={darkLight} />
                                    <InfoItem label="Total Value" value={`$ ${data.totalPrice?.toFixed(2) ?? '0.00'}`} darkLight={darkLight} />
                                    
                                    {data.supplierName && (
                                        <InfoItem label="Supplier" value={data.supplierName} darkLight={darkLight} />
                                    )}
                                    {data.reference && (
                                        <InfoItem label="Reference" value={data.reference} darkLight={darkLight} />
                                    )}

                                    <div className={`col-span-2 pt-3 mt-2 border-t ${darkLight ? "border-gray-700" : "border-gray-100"}`}>
                                        <p className={`text-xs font-semibold mb-3 uppercase tracking-wider ${darkLight ? "text-gray-500" : "text-gray-400"}`}>Stock Impact</p>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 text-center p-2 rounded-lg bg-gray-500/10">
                                                <p className={`text-xs ${darkLight ? "text-gray-500" : "text-gray-400"}`}>Before</p>
                                                <p className={`text-lg font-bold ${darkLight ? "text-gray-300" : "text-gray-700"}`}>{data.quantityBefore ?? 0}</p>
                                            </div>
                                            <div className={`text-2xl font-bold ${data.type === "In" || data.type === "ReturnIn" ? "text-emerald-500" : "text-red-500"}`}>
                                                {data.type === "In" || data.type === "ReturnIn" ? "→" : "←"}
                                            </div>
                                            <div className="flex-1 text-center p-2 rounded-lg bg-gray-500/10">
                                                <p className={`text-xs ${darkLight ? "text-gray-500" : "text-gray-400"}`}>After</p>
                                                <p className={`text-lg font-bold ${darkLight ? "text-gray-300" : "text-gray-700"}`}>{data.quantityAfter ?? 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Note */}
                                {data.note && (
                                    <div className={`p-3 rounded-xl ${darkLight ? "bg-gray-700/40" : "bg-gray-50"}`}>
                                        <p className={`text-xs font-semibold mb-1 ${darkLight ? "text-gray-400" : "text-gray-500"}`}>Note</p>
                                        <p className={`text-sm whitespace-pre-wrap ${darkLight ? "text-gray-200" : "text-gray-800"}`}>{data.note}</p>
                                    </div>
                                )}

                                {/* Serial Numbers */}
                                {data.serialNumbers && data.serialNumbers.length > 0 && (
                                    <div className={`p-3 rounded-xl ${darkLight ? "bg-gray-700/40" : "bg-gray-50"}`}>
                                        <p className={`text-xs font-semibold mb-2 ${darkLight ? "text-gray-400" : "text-gray-500"}`}>Serial Numbers ({data.serialNumbers.length})</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {data.serialNumbers.map((sn: string) => (
                                                <span key={sn} className={`text-xs font-mono px-2 py-1 rounded-md ${darkLight ? "bg-gray-600 text-gray-200" : "bg-gray-200 text-gray-700"}`}>{sn}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Footer Meta */}
                                <div className={`pt-4 mt-2 border-t text-xs flex justify-between items-center ${darkLight ? "border-gray-700 text-gray-500" : "border-gray-100 text-gray-400"}`}>
                                    <span>By: {data.createdBy?.name ?? "System"}</span>
                                    <span>{data.createdDate ? new Date(data.createdDate).toLocaleString() : "N/A"}</span>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </>
    );
};

export default StockMovementDetail;