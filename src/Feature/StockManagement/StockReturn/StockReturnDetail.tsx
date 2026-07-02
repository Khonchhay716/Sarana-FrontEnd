import { useEffect, useState } from "react";
import { useGlobleContextDarklight } from "../../../AllContext/context";
import { AxiosApi } from "../../../component/Axios/Axios";
import { alertError } from "../../../HtmlHelper/Alert";

const STATUS_LABEL: Record<string, { label: string; dark: string; light: string }> = {
    "Completed": { label: "Completed", dark: "bg-emerald-900/40 text-emerald-300", light: "bg-emerald-100 text-emerald-700" },
    "Cancelled": { label: "Cancelled", dark: "bg-red-900/40 text-red-300", light: "bg-red-100 text-red-700" },
};

const StockReturnDetail = ({ id, onClose }: { id: number; onClose: () => void }) => {
    const { darkLight } = useGlobleContextDarklight();
    const [isAnimating, setIsAnimating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const abortController = new AbortController();
        const fetchDetail = async () => {
            try {
                const res = await AxiosApi.get(`stock/returns/${id}`, { signal: abortController.signal });
                setData(res?.data?.data ?? res?.data);
            } catch (err: any) {
                if (!abortController.signal.aborted) { alertError("Failed to load return details."); onClose(); }
            } finally { setLoading(false); }
        };
        fetchDetail();
        setTimeout(() => setIsAnimating(true), 10);
        return () => { abortController.abort(); };
    }, [id]);

    const handleClose = () => { setIsAnimating(false); setTimeout(() => onClose(), 300); };
    const statusInfo = STATUS_LABEL[data?.status];
    const dl = darkLight;

    return (
        <>
            <div className={`fixed top-[65px] inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"}`} />
            <div className={`fixed top-[65px] inset-0 z-40 flex items-center justify-center p-4 pointer-events-none transition-all duration-300 ${isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                <div className={`rounded-2xl shadow-2xl w-full max-w-2xl max-h-full flex flex-col overflow-hidden pointer-events-auto transform transition-all duration-300 ${dl ? "bg-gray-800" : "bg-white"} ${isAnimating ? "translate-y-0" : "translate-y-4"}`}>
                    
                    <div className={`px-6 py-4 border-b flex justify-between items-center flex-shrink-0 ${dl ? "border-gray-700" : "border-gray-200"}`}>
                        <div className="flex items-center gap-3">
                            <h2 className={`text-lg font-bold ${dl ? "text-white" : "text-gray-900"}`}>Return Details</h2>
                            {statusInfo && <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusInfo[dl ? "dark" : "light"]}`}>{statusInfo.label}</span>}
                        </div>
                        <button onClick={handleClose} className={`w-8 h-8 rounded-full flex items-center justify-center text-xl ${dl ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"}`}>×</button>
                    </div>

                    <div className="overflow-y-auto flex-1 p-6 custom-scrollbar" style={{ scrollbarWidth: "thin" }}>
                        {loading ? <div className="flex justify-center py-10 text-gray-400">Loading...</div> : data ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className={`text-xs font-semibold ${dl ? "text-gray-500" : "text-gray-400"}`}>Return No</p>
                                        <p className="text-sm font-mono font-bold text-blue-400">{data.returnNo}</p>
                                    </div>
                                    <div>
                                        <p className={`text-xs font-semibold ${dl ? "text-gray-500" : "text-gray-400"}`}>Supplier</p>
                                        <p className={`text-sm font-bold ${dl ? "text-gray-200" : "text-gray-800"}`}>{data.supplierName}</p>
                                    </div>
                                    <div>
                                        <p className={`text-xs font-semibold ${dl ? "text-gray-500" : "text-gray-400"}`}>Total Amount</p>
                                        <p className={`text-lg font-bold ${dl ? "text-emerald-300" : "text-emerald-700"}`}>$ {data.totalAmount?.toFixed(2) ?? "0.00"}</p>
                                    </div>
                                    {data.note && (
                                        <div>
                                            <p className={`text-xs font-semibold ${dl ? "text-gray-500" : "text-gray-400"}`}>Note</p>
                                            <p className={`text-sm ${dl ? "text-gray-300" : "text-gray-700"}`}>{data.note}</p>
                                        </div>
                                    )}
                                </div>

                                <div className={`border-t ${dl ? "border-gray-700" : "border-gray-200"} pt-4`}>
                                    <h3 className={`font-bold mb-3 ${dl ? "text-white" : "text-gray-900"}`}>Returned Items</h3>
                                    <div className={`overflow-x-auto rounded-xl border ${dl ? "border-gray-600" : "border-gray-200"}`}>
                                        <table className="w-full text-sm text-left">
                                            <thead className={`text-xs uppercase ${dl ? "bg-gray-700/50 text-gray-400" : "bg-gray-50 text-gray-500"}`}>
                                                <tr>
                                                    <th className="px-4 py-3">Product</th>
                                                    <th className="px-4 py-3 text-center">Qty</th>
                                                    <th className="px-4 py-3 text-right">Price</th>
                                                    <th className="px-4 py-3 text-right">Total</th>
                                                    <th className="px-4 py-3 text-center">Reason</th>
                                                </tr>
                                            </thead>
                                            <tbody className={`divide-y ${dl ? "divide-gray-700" : "divide-gray-100"}`}>
                                                {data.items?.map((item: any) => (
                                                    <tr key={item.id} className={`${dl ? "hover:bg-gray-700/30" : "hover:bg-gray-50"}`}>
                                                        <td className="px-4 py-3">
                                                            <p className={`font-semibold ${dl ? "text-gray-200" : "text-gray-800"}`}>{item.productName}</p>
                                                            {item.productCode && <p className="text-xs text-gray-500 font-mono">{item.productCode}</p>}
                                                        </td>
                                                        <td className="px-4 py-3 text-center font-medium">{item.quantity}</td>
                                                        <td className="px-4 py-3 text-right text-gray-400">$ {item.unitPrice?.toFixed(2)}</td>
                                                        <td className="px-4 py-3 text-right font-bold">$ {item.totalPrice?.toFixed(2)}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className={`px-2 py-1 rounded text-xs ${dl ? "bg-gray-600 text-gray-200" : "bg-gray-100 text-gray-600"}`}>{item.reason}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {data.items?.some((i: any) => i.serialNumbers?.length > 0) && (
                                    <div className="space-y-3">
                                        <h4 className={`text-xs font-bold uppercase ${dl ? "text-gray-400" : "text-gray-500"}`}>Serial Numbers Returned</h4>
                                        {data.items.map((item: any) => item.serialNumbers?.length > 0 && (
                                            <div key={item.id} className={`p-3 rounded-xl ${dl ? "bg-gray-700/40" : "bg-gray-50"}`}>
                                                <p className={`text-xs font-bold mb-2 ${dl ? "text-gray-300" : "text-gray-700"}`}>{item.productName}</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {item.serialNumbers.map((sn: string) => (
                                                        <span key={sn} className="text-xs font-mono px-2 py-1 bg-red-500/10 text-red-400 rounded border border-red-500/20">{sn}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className={`pt-4 mt-2 border-t text-xs flex justify-between items-center ${dl ? "border-gray-700 text-gray-500" : "border-gray-100 text-gray-400"}`}>
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

export default StockReturnDetail;