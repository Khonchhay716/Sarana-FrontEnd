import { useEffect, useRef, useState } from "react";
import { useGlobleContextDarklight } from "../../../AllContext/context";
import { alertError } from "../../../HtmlHelper/Alert";
import { AxiosApi } from "../../../component/Axios/Axios";
import XSelectSearch, { SingleValue } from "../../../component/XSelectSearch/Xselectsearch";
import alertify from "alertifyjs";

// Must match POS.Domain.Enums.ReturnReason
enum ReturnReason {
    Defective = 0,
    Expired = 1,
    WrongItem = 2,
    Other = 3,
}

const REASON_OPTIONS = [
    { value: ReturnReason.Defective, label: "Defective" },
    { value: ReturnReason.Expired, label: "Expired" },
    { value: ReturnReason.WrongItem, label: "Wrong Item" },
    { value: ReturnReason.Other, label: "Other" },
];

interface ReturnItem {
    tempId: string;
    productId: number | null;
    productName: string;
    productType?: string;
    costPrice: number;
    quantity: string;
    reason: number;
    note: string;
    serialNumbers: string[];
    newSerial: string;
}

const StockReturnForm = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
    const { darkLight } = useGlobleContextDarklight();
    const [isAnimating, setIsAnimating] = useState(false);
    const [saving, setSaving] = useState(false);

    const [selectedSupplier, setSelectedSupplier] = useState<SingleValue | null>(null);
    const [note, setNote] = useState("");
    const [items, setItems] = useState<ReturnItem[]>([{ tempId: crypto.randomUUID(), productId: null, productName: "", quantity: "", reason: ReturnReason.Defective, note: "", serialNumbers: [], newSerial: "", costPrice: 0 }]);
    const serialRefs = useRef<Record<string, HTMLInputElement | null>>({});

    useEffect(() => { setTimeout(() => setIsAnimating(true), 10); }, []);

    const handleClose = () => { setIsAnimating(false); setTimeout(() => onClose(), 300); };

    const handleAddRow = () => {
        setItems(prev => [...prev, { tempId: crypto.randomUUID(), productId: null, productName: "", quantity: "", reason: ReturnReason.Defective, note: "", serialNumbers: [], newSerial: "", costPrice: 0 }]);
    };

    const handleRemoveRow = (tempId: string) => {
        if (items.length <= 1) return alertError("Must have at least one item.");
        setItems(prev => prev.filter(i => i.tempId !== tempId));
    };

    const handleProductChange = async (value: SingleValue | null, tempId: string) => {
        const updatedItems = items.map(item => {
            if (item.tempId === tempId) {
                return { ...item, productId: value ? Number(value.id) : null, productName: value?.name || "", productType: undefined, quantity: "", serialNumbers: [], costPrice: 0 };
            }
            return item;
        });
        setItems(updatedItems);

        if (value) {
            try {
                const res = await AxiosApi.get(`Products/${value.id}`);
                const prod = res?.data?.data ?? res?.data;
                setItems(prev => prev.map(i => i.tempId === tempId ? { ...i, productType: prod.productType, costPrice: prod.costPrice || 0 } : i));
            } catch (err) { console.error(err); }
        }
    };

    const handleAddSerial = (tempId: string) => {
        setItems(prev => prev.map(item => {
            if (item.tempId === tempId) {
                const sn = item.newSerial.trim();
                if (!sn || item.serialNumbers.includes(sn)) return item;
                return { ...item, serialNumbers: [...item.serialNumbers, sn], newSerial: "" };
            }
            return item;
        }));
        setTimeout(() => serialRefs.current[tempId]?.focus(), 50);
    };

    const handleRemoveSerial = (tempId: string, sn: string) => {
        setItems(prev => prev.map(item => item.tempId === tempId ? { ...item, serialNumbers: item.serialNumbers.filter(s => s !== sn) } : item));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSupplier) return alertError("Please select a supplier.");

        for (const item of items) {
            if (!item.productId) return alertError(`Please select a product for all rows.`);
            const isSerial = item.productType === "Serialized";
            if (isSerial && item.serialNumbers.length === 0) return alertError(`Please add serial numbers for ${item.productName}.`);
            if (!isSerial && (!item.quantity || Number(item.quantity) <= 0)) return alertError(`Please enter valid quantity for ${item.productName}.`);
        }

        const payload = {
            supplierId: Number(selectedSupplier.id),
            note: note,
            items: items.map(item => ({
                productId: item.productId,
                quantity: item.productType === "Serialized" ? null : Number(item.quantity),
                reason: item.reason,
                note: item.note,
                serialNumbers: item.productType === "Serialized" ? item.serialNumbers : null
            }))
        };

        setSaving(true);
        try {
            await AxiosApi.post("stock/returns", payload);
            alertify.success("Stock return created successfully");
            onSuccess();
            handleClose();
        } catch (err: any) {
            alertError(err?.response?.data?.message || "Failed to create return.");
        } finally {
            setSaving(false);
        }
    };

    const dl = darkLight;
    const inputClass = `w-full px-3 py-2 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${dl ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:bg-gray-700 focus:border-purple-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:bg-purple-50/30"}`;

    return (
        <>
            <div className={`fixed top-[65px] inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"}`} />
            <div className={`fixed top-[65px] inset-0 z-40 flex items-center justify-center p-4 pointer-events-none transition-all duration-300 ${isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                <div className={`rounded-2xl shadow-2xl w-full max-w-4xl max-h-full flex flex-col overflow-hidden pointer-events-auto transform transition-all duration-300 ${dl ? "bg-gray-800" : "bg-white"} ${isAnimating ? "translate-y-0" : "translate-y-4"}`}>

                    <div className={`px-6 py-4 border-b flex justify-between items-center flex-shrink-0 ${dl ? "border-gray-700" : "border-gray-200"}`}>
                        <h2 className={`text-xl font-bold ${dl ? "text-white" : "text-gray-900"}`}>🚚 New Stock Return</h2>
                        <button onClick={handleClose} className={`w-9 h-9 rounded-full flex items-center justify-center text-xl transition-all ${dl ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"}`}>×</button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                        <div className="overflow-y-auto flex-1 p-6 space-y-6 custom-scrollbar" style={{ scrollbarWidth: "thin" }}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className={`block mb-1.5 text-sm font-semibold ${dl ? "text-gray-200" : "text-gray-700"}`}>Supplier <span className="text-red-500">*</span></label>
                                    <XSelectSearch value={selectedSupplier} onChange={setSelectedSupplier} placeholder="Select supplier" selectOption={{ apiEndpoint: "/Suppliers", id: "id", name: "name", value: "id", pageSize: 20, searchParam: "Search" }} isSearchable={true} />
                                </div>
                                <div>
                                    <label className={`block mb-1.5 text-sm font-semibold ${dl ? "text-gray-200" : "text-gray-700"}`}>Note</label>
                                    <input type="text" value={note} onChange={e => setNote(e.target.value)} className={inputClass} placeholder="Optional note" />
                                </div>
                            </div>

                            <div className={`border-t ${dl ? "border-gray-700" : "border-gray-200"} pt-4`}>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className={`font-bold ${dl ? "text-white" : "text-gray-900"}`}>Return Items</h3>
                                    <button type="button" onClick={handleAddRow} className="text-sm font-semibold text-purple-400 hover:text-purple-300">+ Add Item</button>
                                </div>

                                <div className="space-y-4">
                                    {items.map((item, index) => (
                                        <div key={item.tempId} className={`p-4 rounded-xl border ${dl ? "bg-gray-700/30 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <span className={`text-xs font-bold ${dl ? "text-gray-400" : "text-gray-500"}`}>ITEM {index + 1}</span>
                                                {items.length > 1 && (
                                                    <button type="button" onClick={() => handleRemoveRow(item.tempId)} className="text-red-400 hover:text-red-300 text-sm font-bold">✕ Remove</button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                                                <div className="md:col-span-2">
                                                    <XSelectSearch
                                                        value={item.productId ? { id: item.productId, name: item.productName, value: item.productId, data: null } : null}
                                                        onChange={(val) => handleProductChange(val, item.tempId)}
                                                        placeholder="Select product"
                                                        selectOption={{ apiEndpoint: "/Products", id: "id", name: "name", value: "id", pageSize: 20, searchParam: "Search" }}
                                                        isSearchable={true}
                                                    />
                                                </div>
                                                <div>
                                                    <select value={item.reason} onChange={e => setItems(prev => prev.map(i => i.tempId === item.tempId ? { ...i, reason: Number(e.target.value) } : i))} className={inputClass}>
                                                        {REASON_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                                    </select>
                                                </div>

                                                {item.productType === "Serialized" ? (
                                                    <div className="flex items-center justify-center px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
                                                        <span className="text-sm font-bold text-blue-400">{item.serialNumbers.length} Serials</span>
                                                    </div>
                                                ) : (
                                                    <input type="number" min="1" value={item.quantity} onChange={e => setItems(prev => prev.map(i => i.tempId === item.tempId ? { ...i, quantity: e.target.value } : i))} className={inputClass} placeholder="Quantity" />
                                                )}
                                            </div>

                                            {item.productType === "Serialized" && (
                                                <div className="space-y-2">
                                                    <div className="flex gap-2">
                                                        <input
                                                            ref={el => { serialRefs.current[item.tempId] = el; }}
                                                            type="text"
                                                            value={item.newSerial}
                                                            onChange={e => setItems(prev => prev.map(i => i.tempId === item.tempId ? { ...i, newSerial: e.target.value } : i))}
                                                            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddSerial(item.tempId))}
                                                            className={inputClass}
                                                            placeholder="Scan or type serial..."
                                                        />
                                                        <button type="button" onClick={() => handleAddSerial(item.tempId)} className="px-4 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600">Add</button>
                                                    </div>
                                                    <div className={`flex flex-wrap gap-1.5 min-h-[30px] p-2 rounded border border-dashed ${dl ? "border-gray-600" : "border-gray-300"}`}>
                                                        {item.serialNumbers.map(sn => (
                                                            <span key={sn} className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full bg-purple-900/30 text-purple-300 text-xs font-mono">
                                                                {sn}
                                                                <button type="button" onClick={() => handleRemoveSerial(item.tempId, sn)} className="w-4 h-4 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-[9px]">✕</button>
                                                            </span>
                                                        ))}
                                                        {item.serialNumbers.length === 0 && <span className="text-xs italic text-gray-500">No serials added</span>}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={`px-6 py-4 border-t flex justify-end gap-3 flex-shrink-0 ${dl ? "bg-gray-800/80 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                            <button type="button" onClick={handleClose} disabled={saving} className={`px-5 py-2.5 rounded-xl font-semibold text-sm ${dl ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"}`}>Cancel</button>
                            <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-purple-600 hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center gap-2">
                                {saving && <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
                                Submit Return
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default StockReturnForm;