import { useEffect, useRef, useState } from "react";
import { useGlobleContextDarklight, useRefreshTable } from "../../../AllContext/context";
import { alertError } from "../../../HtmlHelper/Alert";
import { AxiosApi } from "../../../component/Axios/Axios";
import alertify from "alertifyjs";

// GET /api/orders/pending-items?orderNo=... — order lines still awaiting handout
// (both serialized and non-serialized)
interface PendingOrderItem {
    orderItemId: number;
    productId: number;
    productCode: string;
    productName: string;
    quantity: number;
    requiresSerial: boolean;
}

// GET /api/products/Scan-Serial?serialNo=... response
interface ProductScanInfo {
    productId: number;
    productName: string;
    isSerial: boolean;
    scannedSerialNumber: string | null;
    [key: string]: any;
}

// GET /api/products/Scan?code=... response — used to verify a scanned/entered code
// matches the locked non-serialized order line before confirming stock/out.
interface ProductCodeScanInfo {
    productId: number;
    productCode: string;
    productName: string;
    productType: string;
    isSerial: boolean;
    stockQuantity: number;
    [key: string]: any;
}

interface StockOutPanelProps {
    // When set, the order is looked up automatically on mount (e.g. opened from an Order List row).
    initialOrderNo?: string;
    onStockOutSuccess?: (item: PendingOrderItem, serials: string[]) => void;
    // Called once there's nothing left to hand out for the searched order (already done,
    // or non-serialized) — lets the caller navigate away instead of showing an empty form.
    onDone?: () => void;
}

// Find an order by Order No, then confirm handout per line — serialized lines are
// confirmed by scanning each unit's serial; non-serialized lines are confirmed by
// scanning/entering the product code and submitting the (fixed) ordered quantity.
const StockOutPanel = ({ initialOrderNo, onStockOutSuccess, onDone }: StockOutPanelProps) => {
    const { darkLight } = useGlobleContextDarklight();
    const dl = darkLight;
    const { setRefreshTables } = useRefreshTable();

    const [orderNoInput, setOrderNoInput] = useState(initialOrderNo ?? "");
    const [orderLookupLoading, setOrderLookupLoading] = useState(false);
    const [orderLookupError, setOrderLookupError] = useState("");
    const [orderAlreadyDone, setOrderAlreadyDone] = useState(false);
    const [pendingItems, setPendingItems] = useState<PendingOrderItem[]>([]);
    const [selectedOrderItem, setSelectedOrderItem] = useState<PendingOrderItem | null>(null);

    const [serialNumbers, setSerialNumbers] = useState<string[]>([]);
    const [newSerialInput, setNewSerialInput] = useState("");
    const [validatingSerial, setValidatingSerial] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const scanInputRef = useRef<HTMLInputElement>(null);

    // Non-serialized confirm flow: scan/enter the product code to verify it matches
    // the locked line, then submit the (fixed) ordered quantity.
    const [codeInput, setCodeInput] = useState("");
    const [validatingCode, setValidatingCode] = useState(false);
    const [codeVerified, setCodeVerified] = useState(false);
    const codeInputRef = useRef<HTMLInputElement>(null);

    const handleOrderLookup = async (noOverride?: string) => {
        const no = (noOverride ?? orderNoInput).trim(); if (!no) return;
        setOrderLookupLoading(true); setOrderLookupError(""); setOrderAlreadyDone(false); setPendingItems([]);
        try {
            const res = await AxiosApi.get("orders/pending-items", { params: { orderNo: no } });
            const items: PendingOrderItem[] = res?.data?.data ?? [];
            if (items.length === 0) {
                // ✅ CHANGED: nothing left to hand out — hide the whole find-order form instead
                // of leaving it open with just an inline error.
                setOrderAlreadyDone(true);
                onDone?.();
            } else if (items.length === 1) {
                // Only one pending line — skip the extra selection click and go straight to scanning.
                handleSelectPendingItem(items[0]);
                return;
            } else {
                setPendingItems(items);
            }
        } catch (err: any) {
            setOrderLookupError(err?.response?.data?.message || "Order not found.");
        } finally {
            setOrderLookupLoading(false);
        }
    };

    useEffect(() => {
        if (initialOrderNo) handleOrderLookup(initialOrderNo);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSelectPendingItem = (item: PendingOrderItem) => {
        setSelectedOrderItem(item);
        setPendingItems([]);
        setSerialNumbers([]);
        setNewSerialInput("");
        setCodeInput("");
        setCodeVerified(false);
        setTimeout(() => (item.requiresSerial ? scanInputRef : codeInputRef).current?.focus(), 50);
    };

    const handleChangeOrderItem = () => {
        setSelectedOrderItem(null);
        setOrderNoInput(""); setOrderLookupError(""); setOrderAlreadyDone(false); setPendingItems([]);
        setSerialNumbers([]); setNewSerialInput("");
        setCodeInput(""); setCodeVerified(false);
    };

    const handleRemoveSerial = (sn: string) => {
        setSerialNumbers(prev => prev.filter(x => x !== sn));
    };

    // Submits the completed set of scanned serials for the locked order item, then
    // re-checks the same order for any remaining pending lines.
    const submitStockOut = async (item: PendingOrderItem, serials: string[]) => {
        setSubmitting(true);
        try {
            const payload = {
                productId: item.productId,
                quantity: item.quantity,
                reference: "",
                note: "",
                serialNumbers: serials,
                orderItemId: item.orderItemId,
            };
            await AxiosApi.post("stock/out", payload);
            alertify.success(`Stock out recorded for ${item.productName}`);
            setRefreshTables(new Date());
            onStockOutSuccess?.(item, serials);
            setSelectedOrderItem(null);
            setSerialNumbers([]);
            setNewSerialInput("");
            setCodeInput("");
            setCodeVerified(false);
            handleOrderLookup(orderNoInput);
        } catch (err: any) {
            alertError(err?.response?.data?.message || "Failed to save stock out.");
        } finally {
            setSubmitting(false);
        }
    };

    // Scanning a serial validates it via GET /api/products/Scan-Serial — confirms it belongs
    // to the locked order item's product and is Available — then auto-submits stock/out once
    // the scanned count reaches the required quantity.
    const handleScanSerial = async () => {
        const t = newSerialInput.trim(); if (!t || !selectedOrderItem) return;
        if (serialNumbers.includes(t)) { alertError("Already scanned!"); return; }
        setValidatingSerial(true);
        try {
            const res = await AxiosApi.get("Products/Scan-Serial", { params: { serialNo: t } });
            const scanned: ProductScanInfo | undefined = res?.data?.data;
            if (!scanned) { alertError(`Serial "${t}" not found or not available.`); return; }
            if (scanned.productId !== selectedOrderItem.productId) {
                alertError(`Serial "${t}" belongs to a different product (${scanned.productName}).`); return;
            }
            const resolved = scanned.scannedSerialNumber || t;
            if (serialNumbers.includes(resolved)) { alertError("Already scanned!"); return; }
            const updated = [...serialNumbers, resolved];
            setSerialNumbers(updated);
            setNewSerialInput("");
            if (updated.length >= selectedOrderItem.quantity) {
                await submitStockOut(selectedOrderItem, updated);
            } else {
                scanInputRef.current?.focus();
            }
        } catch (err: any) {
            alertError(err?.response?.data?.message || `Serial "${t}" not found or not available.`);
        } finally {
            setValidatingSerial(false);
        }
    };

    // Scanning/entering a code validates it via GET /api/products/Scan — confirms it
    // resolves to the same product as the locked order item. Quantity for a
    // non-serialized line is fixed to the ordered quantity, so once the code matches,
    // staff just confirms — no per-unit scanning needed.
    const handleScanCode = async () => {
        const t = codeInput.trim(); if (!t || !selectedOrderItem) return;
        setValidatingCode(true);
        try {
            const res = await AxiosApi.get("Products/Scan", { params: { Code: t } });
            const scanned: ProductCodeScanInfo | undefined = res?.data?.data;
            if (!scanned) { alertError(`Code "${t}" not found.`); return; }
            if (scanned.productId !== selectedOrderItem.productId) {
                alertError(`Code "${t}" belongs to a different product (${scanned.productName}).`); return;
            }
            setCodeVerified(true);
        } catch (err: any) {
            alertError(err?.response?.data?.message || `Code "${t}" not found.`);
        } finally {
            setValidatingCode(false);
        }
    };

    const labelClass = `block mb-1.5 text-sm font-semibold ${dl ? "text-gray-200" : "text-gray-700"}`;
    const inputClass = `w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 ${dl ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:bg-gray-700 focus:border-red-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:bg-red-50/30"}`;

    const Spinner = ({ size = 5 }: { size?: number }) => (
        <svg className="animate-spin" style={{ width: size * 4, height: size * 4 }} viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    );

    return (
        <>
            {!selectedOrderItem ? (
                orderAlreadyDone ? (
                    // ✅ CHANGED: nothing left to hand out for this order — hide the form
                    // entirely, no message, no button.
                    null
                ) : (
                    <div>
                        <label className={labelClass}>Order No</label>
                        <div className="flex gap-2">
                            <input type="text" value={orderNoInput} autoFocus
                                onChange={e => setOrderNoInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleOrderLookup())}
                                className={inputClass} placeholder="e.g. ORD-0000123" />
                            <button type="button" onClick={() => handleOrderLookup()} disabled={orderLookupLoading || !orderNoInput.trim()}
                                className={`px-4 rounded-lg font-semibold text-sm flex items-center justify-center flex-shrink-0 transition-all ${dl ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-800 text-white hover:bg-gray-900"} disabled:opacity-50`}>
                                {orderLookupLoading ? <Spinner size={4} /> : "Find"}
                            </button>
                        </div>
                        {orderLookupError && <p className="text-xs text-red-500 mt-1.5">{orderLookupError}</p>}
                        {pendingItems.length > 0 && (
                            <div className="mt-3 space-y-1.5">
                                {pendingItems.map(it => (
                                    <button key={it.orderItemId} type="button" onClick={() => handleSelectPendingItem(it)}
                                        className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all ${dl ? "border-gray-600 hover:border-red-500 hover:bg-red-900/10" : "border-gray-200 hover:border-red-400 hover:bg-red-50/50"}`}>
                                        <p className={`text-sm font-semibold ${dl ? "text-gray-100" : "text-gray-900"}`}>{it.productName} <span className="font-mono text-xs text-gray-400">{it.productCode}</span></p>
                                        <p className={`text-xs mt-0.5 ${dl ? "text-gray-400" : "text-gray-500"}`}>
                                            {it.requiresSerial ? `Needs ${it.quantity} serial(s)` : `Qty ${it.quantity} — scan code to confirm`}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )
            ) : (
                <div className="space-y-4">
                    <div className={`rounded-xl border p-3 flex items-center justify-between gap-3 ${dl ? "border-gray-600 bg-gray-700/30" : "border-gray-200 bg-gray-50"}`}>
                        <div className="min-w-0">
                            <p className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}>Order <span className="font-mono">{orderNoInput}</span></p>
                            <p className={`text-sm font-bold truncate ${dl ? "text-white" : "text-gray-900"}`}>{selectedOrderItem.productName} <span className="font-mono text-xs font-normal text-gray-400">{selectedOrderItem.productCode}</span></p>
                            <p className={`text-xs mt-0.5 ${dl ? "text-gray-400" : "text-gray-500"}`}>
                                {selectedOrderItem.requiresSerial ? (
                                    <span className={`px-2 py-0.5 rounded-full font-bold ${dl ? "bg-red-900/30 text-red-300" : "bg-red-100 text-red-700"}`}>{serialNumbers.length} / {selectedOrderItem.quantity} scanned</span>
                                ) : (
                                    <span className={`px-2 py-0.5 rounded-full font-bold ${codeVerified ? (dl ? "bg-emerald-900/30 text-emerald-300" : "bg-emerald-100 text-emerald-700") : (dl ? "bg-red-900/30 text-red-300" : "bg-red-100 text-red-700")}`}>
                                        {codeVerified ? "Code verified" : `Qty ${selectedOrderItem.quantity}`}
                                    </span>
                                )}
                            </p>
                        </div>
                        <button type="button" onClick={handleChangeOrderItem} disabled={submitting}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 transition-all disabled:opacity-50 ${dl ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"}`}>
                            Change
                        </button>
                    </div>

                    {selectedOrderItem.requiresSerial ? (
                        <>
                            <div>
                                <label className={labelClass}>Scan Serial Number</label>
                                <div className="flex gap-2">
                                    <input ref={scanInputRef} type="text" value={newSerialInput} autoFocus
                                        disabled={validatingSerial || submitting}
                                        onChange={e => setNewSerialInput(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleScanSerial())}
                                        className={`${inputClass} disabled:opacity-50`}
                                        placeholder="Scan serial number — Enter to submit" />
                                    <div className={`w-[46px] flex-shrink-0 flex items-center justify-center rounded-lg cursor-default select-none ${dl ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-400"}`}>
                                        {(validatingSerial || submitting) ? <Spinner size={4} /> : (
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
                                                <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
                                                <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
                                                <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
                                                <line x1="7" y1="12" x2="17" y2="12"></line>
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <p className={`text-xs mt-1.5 ${dl ? "text-gray-500" : "text-gray-400"}`}>Stock out is recorded automatically once the required quantity has been scanned.</p>
                            </div>

                            {serialNumbers.length > 0 && (
                                <div className={`flex gap-2 rounded-xl border-2 border-dashed p-3 ${dl ? "border-gray-600" : "border-gray-300"}`}>
                                    <div className={`rounded-xl border p-4 min-h-[60px] flex flex-wrap items-center gap-x-1.5 gap-y-2 w-full ${dl ? "border-gray-600" : "border-gray-200"}`}>
                                        {serialNumbers.map(sn => (
                                            <span key={sn} className={`inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-full ${dl ? "bg-red-900/30" : "bg-red-50"}`}>
                                                <span className={`text-sm font-mono ${dl ? "text-red-200" : "text-red-700"}`}>{sn}</span>
                                                <button type="button" onClick={() => handleRemoveSerial(sn)} disabled={submitting}
                                                    className="w-5 h-5 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] flex-shrink-0 transition-colors disabled:opacity-50">✕</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div>
                                <label className={labelClass}>Scan Product Code</label>
                                <div className="flex gap-2">
                                    <input ref={codeInputRef} type="text" value={codeInput} autoFocus
                                        disabled={validatingCode || submitting || codeVerified}
                                        onChange={e => setCodeInput(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleScanCode())}
                                        className={`${inputClass} disabled:opacity-50`}
                                        placeholder="Scan or type product code — Enter to verify" />
                                    <div className={`w-[46px] flex-shrink-0 flex items-center justify-center rounded-lg cursor-default select-none ${dl ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-400"}`}>
                                        {(validatingCode) ? <Spinner size={4} /> : (
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
                                                <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
                                                <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
                                                <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
                                                <line x1="7" y1="12" x2="17" y2="12"></line>
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <p className={`text-xs mt-1.5 ${dl ? "text-gray-500" : "text-gray-400"}`}>Verify the scanned code matches this product, then confirm to record the full ordered quantity.</p>
                            </div>

                            <div>
                                <label className={labelClass}>Quantity</label>
                                <input type="number" value={selectedOrderItem.quantity} disabled readOnly
                                    className={`${inputClass} opacity-70 cursor-not-allowed`} />
                            </div>

                            {codeVerified && (
                                <button type="button" onClick={() => submitStockOut(selectedOrderItem, [])} disabled={submitting}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 bg-red-600 text-white hover:bg-red-700">
                                    {submitting ? <Spinner size={4} /> : "Confirm Stock Out"}
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default StockOutPanel;
