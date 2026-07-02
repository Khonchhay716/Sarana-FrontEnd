import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useGlobleContextDarklight, useRefreshTable } from "../../../AllContext/context";
import { alertError } from "../../../HtmlHelper/Alert";
import { AxiosApi } from "../../../component/Axios/Axios";
import XSelectSearch, { SingleValue } from "../../../component/XSelectSearch/Xselectsearch";
import alertify from "alertifyjs";
import ComponentPermission from "../../../component/ProtextRoute/ComponentPermissions";

export interface StockFormProduct {
    id: number;
    name: string;
    sku?: string;
    productType?: string;
    imageProduct?: string;
    [key: string]: any;
}

interface StockInFormProps {
    initialProduct?: StockFormProduct;
    onClose: () => void;
    onSuccess: () => void;
}

type SerialAddMode = "single" | "csv";

const StockInForm = ({ initialProduct, onClose, onSuccess }: StockInFormProps) => {
    const { darkLight } = useGlobleContextDarklight();
    const dl = darkLight;
    const { setRefreshTables } = useRefreshTable();

    const [isAnimating, setIsAnimating] = useState(false);
    const hasInitialized = useRef(false);
    const [saving, setSaving] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState<SingleValue | null>(null);
    const [productBase, setProductBase] = useState<StockFormProduct | null>(null);
    const [loadingProduct, setLoadingProduct] = useState(false);

    const [selectedSupplier, setSelectedSupplier] = useState<SingleValue | null>(null);

    // FIX: Initialized as empty string so UI doesn't show 0, but API will receive 0 if empty
    const [quantity, setQuantity] = useState<string>("");
    const [reference, setReference] = useState("");
    const [note, setNote] = useState("");

    const [serialAddMode, setSerialAddMode] = useState<SerialAddMode>("single");
    const [serialNumbers, setSerialNumbers] = useState<string[]>([]);
    const [newSerialInput, setNewSerialInput] = useState("");
    const [bulkError, setBulkError] = useState("");
    const singleInputRef = useRef<HTMLInputElement>(null);
    const csvInputRef = useRef<HTMLInputElement>(null);

    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [csvRows, setCsvRows] = useState<string[][]>([]);
    const [csvColIndex, setCsvColIndex] = useState<number>(0);
    const [csvHasHeader, setCsvHasHeader] = useState(true);
    const [showColPicker, setShowColPicker] = useState(false);

    const isStandalone = !initialProduct;
    const isSerialProduct = productBase?.productType === "Serialized";

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;
        setTimeout(() => setIsAnimating(true), 10);
        if (initialProduct) {
            setProductBase(initialProduct);
            setSelectedProduct({ id: initialProduct.id, name: initialProduct.name, value: initialProduct.id, data: initialProduct });
        }
    }, []);


    const handleModeTabChange = (m: SerialAddMode) => {
        setSerialAddMode(m); setBulkError(""); setShowColPicker(false); setCsvHeaders([]); setCsvRows([]);
    };

    const handleAddSerial = () => {
        const t = newSerialInput.trim(); if (!t) return;
        if (serialNumbers.includes(t)) { alertError("Already added!"); return; }
        setSerialNumbers(prev => [...prev, t]); setNewSerialInput(""); singleInputRef.current?.focus();
    };

    const handleRemoveSerial = (sn: string) => {
        setSerialNumbers(prev => prev.filter(x => x !== sn));
    };

    const parseCSVLine = (line: string): string[] => {
        const result: string[] = []; let current = ""; let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (inQuotes) {
                if (ch === '"') { if (i + 1 < line.length && line[i + 1] === '"') { current += '"'; i++; } else inQuotes = false; }
                else current += ch;
            } else {
                if (ch === '"') inQuotes = true;
                else if (ch === ',') { result.push(current.trim()); current = ""; }
                else current += ch;
            }
        }
        result.push(current.trim()); return result;
    };

    const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        if (file.size > 5 * 1024 * 1024) { setBulkError("File is too large. Maximum size is 5 MB."); e.target.value = ""; return; }
        const reader = new FileReader();
        reader.onload = ev => {
            const text = ev.target?.result as string;
            const allRows = text.split(/\r?\n/).map(r => parseCSVLine(r)).filter(r => r.some(cell => cell !== ""));
            if (allRows.length === 0) { setBulkError("File is empty."); return; }
            const firstRow = allRows[0];
            const colCount = firstRow.length;
            if (colCount === 1) {
                setCsvHeaders(firstRow); setCsvRows(allRows); setCsvColIndex(0);
                const firstRowIsAllText = firstRow.every(cell => /^[A-Za-z\s_\-]+$/.test(cell) && cell.length > 0);
                const secondRowHasNumbers = allRows.length > 1 && allRows[1].some(cell => /\d/.test(cell));
                setCsvHasHeader(firstRowIsAllText && secondRowHasNumbers);
            } else {
                setCsvHeaders(firstRow); setCsvRows(allRows); setCsvColIndex(0); setCsvHasHeader(true);
            }
            setShowColPicker(true); setBulkError("");
        };
        reader.readAsText(file); e.target.value = "";
    };

    const applyCSVImport = (rows: string[][], colIndex: number) => {
        const existingSet = new Set(serialNumbers);
        const dataRows = csvHasHeader ? rows.slice(1) : rows;
        const lines = dataRows.map(r => (r[colIndex] ?? "").trim()).filter(Boolean);
        const toAdd: string[] = [];
        let dupe = 0;
        for (const sn of lines) {
            if (existingSet.has(sn) || toAdd.includes(sn)) dupe++;
            else { toAdd.push(sn); existingSet.add(sn); }
        }
        if (toAdd.length) { setSerialNumbers(prev => [...prev, ...toAdd]); }
        const parts: string[] = [];
        if (toAdd.length) parts.push(`Imported ${toAdd.length}`);
        if (dupe) parts.push(`skipped ${dupe} duplicate(s)`);
        setBulkError(parts.length > 0 ? parts.join(". ") + "." : "No new serial numbers to import.");
        setShowColPicker(false); setCsvHeaders([]); setCsvRows([]); setCsvColIndex(0); setCsvHasHeader(true);
    };

    const closeColPicker = () => { setShowColPicker(false); setCsvHeaders([]); setCsvRows([]); setCsvColIndex(0); setCsvHasHeader(true); setBulkError(""); };

    const resetEntryState = () => {
        setSerialNumbers([]); setQuantity(""); setReference(""); setNote("");
        setSerialAddMode("single"); setBulkError("");
        setShowColPicker(false); setCsvHeaders([]); setCsvRows([]);
        setSelectedSupplier(null);
    };

    const handleProductChange = async (value: SingleValue | null) => {
        setSelectedProduct(value); resetEntryState();
        if (!value) { setProductBase(null); return; }
        setLoadingProduct(true);
        try {
            const res = await AxiosApi.get(`Products/${Number(value.id)}`);
            const data: StockFormProduct = res?.data?.data ?? res?.data ?? res;
            setProductBase(data ?? null);
        } catch (err) { console.error(err); }
        finally { setLoadingProduct(false); }
    };

    const handleClose = () => { setIsAnimating(false); setTimeout(() => onClose(), 300); };

    // FIX: Calculate effective quantity. If empty in UI, push 0 to API.
    const effectiveQuantity = isSerialProduct ? serialNumbers.length : (quantity === "" ? 0 : Number(quantity));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productBase) { alertError("Please select a product!"); return; }
        if (!selectedSupplier) { alertError("Please select a supplier!"); return; }
        if (isSerialProduct) {
            if (serialNumbers.length === 0) { alertError("Please add at least one serial number!"); return; }
        } else {
            if (effectiveQuantity <= 0) { alertError("Quantity must be greater than 0!"); return; }
        }

        const payload: any = {
            productId: productBase.id,
            supplierId: Number(selectedSupplier.id),
            quantity: effectiveQuantity,
            reference: reference || "",
            note: note || "",
            serialNumbers: isSerialProduct ? serialNumbers : [],
        };

        setSaving(true);
        try {
            await AxiosApi.post("stock/in", payload);
            onSuccess();
            setRefreshTables(new Date());
            alertify.success("Add stock success");
            setTimeout(() => handleClose(), 400);
        } catch (err: any) {
            alertError(err?.response?.data?.message || "Failed to save stock in.");
        } finally {
            setSaving(false);
        }
    };

    const inputClass = `w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${dl ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:bg-gray-700 focus:border-blue-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-blue-50/30"}`;
    const labelClass = `block mb-1.5 text-sm font-semibold ${dl ? "text-gray-200" : "text-gray-700"}`;
    const addModeTabClass = (active: boolean) => active
        ? (dl ? "bg-blue-900/40 border-blue-600 text-blue-300" : "bg-blue-50 border-blue-400 text-blue-700")
        : (dl ? "border-gray-600 text-gray-400 hover:text-gray-300" : "border-gray-300 text-gray-500 hover:text-gray-700");

    const Spinner = ({ size = 5 }: { size?: number }) => (
        <svg className="animate-spin" style={{ width: size * 4, height: size * 4 }} viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    );

    return (
        <>
            <style>{`
                @keyframes bsSlideIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
                .bs-item  { animation:bsSlideIn .2s ease; }
            `}</style>
            <div className={`fixed top-[65px] inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"}`} />
            <div className={`fixed top-[65px] left-0 right-0 bottom-0 z-40 flex items-center justify-center py-8 sm:py-1 pointer-events-none transition-all duration-300 ${isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                <div className={`min-h-[90%] rounded-2xl shadow-2xl w-full max-w-3xl max-h-full flex flex-col overflow-hidden pointer-events-auto transform transition-all duration-300 ${dl ? "bg-gray-800" : "bg-white"} ${isAnimating ? "translate-y-0" : "translate-y-4"}`}>

                    {/* HEADER */}
                    <div className={`px-4 sm:px-6 py-3 border-b flex-shrink-0 flex justify-between items-center gap-3 ${dl ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                        <div className="min-w-0 flex-1">
                            {productBase ? (
                                <div className="flex items-center gap-3">
                                    {productBase.imageProduct && (
                                        <img src={productBase.imageProduct} alt={productBase.name} className="w-10 h-10 rounded-xl object-cover ring-2 ring-gray-200 dark:ring-gray-600 flex-shrink-0" />
                                    )}
                                    <div className="min-w-0">
                                        <h2 className={`text-lg font-bold leading-tight truncate ${dl ? "text-white" : "text-gray-900"}`}>{productBase.name}</h2>
                                        {productBase.sku && <p className="text-xs font-mono text-gray-400 tracking-wider uppercase truncate">{productBase.sku}</p>}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h2 className={`text-xl font-bold truncate ${dl ? "text-white" : "text-gray-900"}`}>➕ Stock In</h2>
                                    <p className={`text-xs sm:text-sm mt-0.5 ${dl ? "text-gray-400" : "text-gray-500"}`}>Receive new stock into inventory</p>
                                </div>
                            )}
                        </div>
                        <button onClick={handleClose} className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xl transition-all ${dl ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}>×</button>
                    </div>

                    {/* BODY & FORM */}
                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                        <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-5 custom-scrollbar"
                            style={{ scrollbarWidth: "thin", scrollbarColor: dl ? "#4a5568 transparent" : "#cbd5e0 transparent" }}>
                            <style>{`.custom-scrollbar::-webkit-scrollbar{width:6px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:transparent;border-radius:3px}.custom-scrollbar:hover::-webkit-scrollbar-thumb{background:${dl ? "#4a5568" : "#cbd5e0"}}`}</style>

                            <div className="space-y-5">
                                {/* Product + Supplier */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {isStandalone && (
                                        <div>
                                            <label className={labelClass}>Product <span className="text-red-500">*</span></label>
                                            <XSelectSearch value={selectedProduct} onChange={handleProductChange} multiple={false}
                                                placeholder="Select product"
                                                selectOption={{ apiEndpoint: "/Products", id: "id", name: "name", value: "id", pageSize: 20, searchParam: "Search" }}
                                                isSearchable={true} />
                                        </div>
                                    )}
                                    <div className={isStandalone ? "" : "md:col-span-2"}>
                                        <label className={labelClass}>Supplier <span className="text-red-500">*</span></label>
                                        <XSelectSearch value={selectedSupplier} onChange={setSelectedSupplier} multiple={false}
                                            placeholder="Select supplier"
                                            selectOption={{ apiEndpoint: "/Suppliers", id: "id", name: "name", value: "id", pageSize: 20, searchParam: "Search" }}
                                            isSearchable={true} />
                                    </div>
                                </div>

                                {loadingProduct && <div className="flex justify-center py-8"><Spinner size={6} /></div>}

                                {productBase && !loadingProduct && (
                                    <>
                                        {isSerialProduct ? (
                                            <div>
                                                <label className={labelClass}>
                                                    Serial Numbers <span className="text-red-500">*</span>
                                                    {serialNumbers.length > 0 && (
                                                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${dl ? "bg-emerald-900/30 text-emerald-300" : "bg-emerald-100 text-emerald-700"}`}>
                                                            {serialNumbers.length} added
                                                        </span>
                                                    )}
                                                </label>

                                                <div className={`flex gap-1 p-1 rounded-xl mb-3 ${dl ? "bg-gray-700/60" : "bg-gray-100"}`}>
                                                    {(["single", "csv"] as SerialAddMode[]).map(m => (
                                                        <button key={m} type="button" onClick={() => handleModeTabChange(m)}
                                                            className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${addModeTabClass(serialAddMode === m)}`}>
                                                            {m === "single" ? "🔍 Scan / Enter" : "📁 CSV"}
                                                        </button>
                                                    ))}
                                                </div>

                                                {serialAddMode === "single" && (
                                                    /* FIX: removed dashed border box around the scan/enter input */
                                                    <div className="flex gap-2 py-3">
                                                        <input ref={singleInputRef} type="text" value={newSerialInput} autoFocus
                                                            onChange={e => setNewSerialInput(e.target.value)}
                                                            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddSerial())}
                                                            className={inputClass} placeholder="Scan or type serial number — Enter to add" />
                                                        {/* FIX: scan icon is now a non-clickable visual indicator only — Enter key adds the serial */}
                                                        <div
                                                            title="Scan or press Enter to add"
                                                            className={`w-[46px] flex-shrink-0 flex items-center justify-center rounded-lg cursor-default select-none ${dl ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-400"}`}
                                                        >
                                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
                                                                <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
                                                                <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
                                                                <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
                                                                <line x1="7" y1="12" x2="17" y2="12"></line>
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}

                                                {serialAddMode === "csv" && (
                                                    <div className="space-y-3">
                                                        <div onClick={() => !showColPicker && csvInputRef.current?.click()}
                                                            className={`flex flex-col items-center justify-center gap-2 p-8 rounded-xl border-2 border-dashed transition-all ${showColPicker ? "opacity-40 cursor-not-allowed" : "cursor-pointer"} ${dl ? "border-gray-600 hover:border-blue-500 hover:bg-blue-900/10" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"}`}>
                                                            <span className="text-3xl">📁</span>
                                                            <p className={`text-sm font-medium ${dl ? "text-gray-300" : "text-gray-600"}`}>Click to upload CSV or TXT file</p>
                                                            <p className={`text-xs ${dl ? "text-gray-500" : "text-gray-400"}`}>{showColPicker ? "Select a column below first" : "Choose which column is the serial number"}</p>
                                                            <input ref={csvInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleCSVImport} />
                                                        </div>

                                                        {showColPicker && csvHeaders.length > 0 && (
                                                            <>
                                                                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" onClick={closeColPicker} />
                                                                <div className="fixed inset-0 flex items-center justify-center z-[70] p-4 pointer-events-none">
                                                                    <div className={`rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden ${dl ? "bg-gray-800 border border-gray-700" : "bg-white"}`} onClick={e => e.stopPropagation()}>
                                                                        <div className={`px-5 py-4 border-b flex items-center gap-3 ${dl ? "border-gray-700 bg-gray-800/80" : "border-gray-200 bg-gray-50"}`}>
                                                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${dl ? "bg-blue-900/40" : "bg-blue-100"}`}>
                                                                                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={dl ? "#93c5fd" : "#2563eb"} strokeWidth={2} strokeLinecap="round">
                                                                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                                                                                </svg>
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <h3 className={`text-sm font-bold ${dl ? "text-white" : "text-gray-900"}`}>Import CSV</h3>
                                                                                <p className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}>{csvRows.length - (csvHasHeader ? 1 : 0)} data rows found</p>
                                                                            </div>
                                                                            <button type="button" onClick={closeColPicker}
                                                                                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${dl ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700" : "text-gray-400 hover:text-gray-600 hover:bg-gray-200"}`}>×</button>
                                                                        </div>
                                                                        <div className={`px-5 py-3 border-b flex items-center gap-3 ${dl ? "border-gray-700" : "border-gray-200"}`}>
                                                                            <input type="checkbox" checked={csvHasHeader} onChange={e => setCsvHasHeader(e.target.checked)} className="w-4 h-4 rounded cursor-pointer accent-blue-500" />
                                                                            <div>
                                                                                <label className={`text-sm font-medium cursor-pointer ${dl ? "text-gray-200" : "text-gray-700"}`}>First row contains headers</label>
                                                                                <p className={`text-[11px] mt-0.5 ${dl ? "text-gray-500" : "text-gray-400"}`}>Uncheck if all rows are data</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className={`px-5 py-3 ${dl ? "" : "bg-gray-50/50"}`}>
                                                                            <p className={`text-sm font-semibold ${dl ? "text-blue-300" : "text-blue-700"}`}>Which column is the Serial Number?</p>
                                                                        </div>
                                                                        <div className="px-5 pb-3 space-y-2 max-h-[240px] overflow-y-auto">
                                                                            {csvHeaders.map((header, i) => {
                                                                                const dataStartRow = csvHasHeader ? 1 : 0;
                                                                                const samples = csvRows.slice(dataStartRow, dataStartRow + 3).map(r => (r[i] ?? "").trim()).filter(Boolean).join(", ");
                                                                                const isSelected = csvColIndex === i;
                                                                                return (
                                                                                    <button key={i} type="button" onClick={() => setCsvColIndex(i)}
                                                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${isSelected ? (dl ? "border-blue-500 bg-blue-900/30 ring-1 ring-blue-500/30" : "border-blue-500 bg-blue-50 ring-1 ring-blue-200") : (dl ? "border-gray-600 hover:border-gray-500 bg-gray-700/30" : "border-gray-200 hover:border-gray-300 bg-white")}`}>
                                                                                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${isSelected ? "border-blue-500" : (dl ? "border-gray-500" : "border-gray-400")}`}>
                                                                                            {isSelected && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                                                                        </div>
                                                                                        <div className="min-w-0 flex-1">
                                                                                            <p className={`text-sm font-semibold truncate ${isSelected ? (dl ? "text-blue-300" : "text-blue-700") : (dl ? "text-gray-200" : "text-gray-700")}`}>{header}</p>
                                                                                            {samples && <p className={`text-xs font-mono truncate mt-0.5 ${dl ? "text-gray-500" : "text-gray-400"}`}>e.g. {samples}</p>}
                                                                                        </div>
                                                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono flex-shrink-0 ${isSelected ? (dl ? "bg-blue-700 text-blue-200" : "bg-blue-100 text-blue-700") : (dl ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500")}`}>Col {i + 1}</span>
                                                                                    </button>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                        <div className={`px-5 py-4 border-t flex gap-2 ${dl ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}>
                                                                            <button type="button" onClick={() => applyCSVImport(csvRows, csvColIndex)} className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-colors">✓ Import "{csvHeaders[csvColIndex]}"</button>
                                                                            <button type="button" onClick={closeColPicker}
                                                                                className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-colors ${dl ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}>Cancel</button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                        {bulkError && !showColPicker && (
                                                            <p className={`text-xs text-center ${bulkError.startsWith("Imported") ? "text-blue-500" : "text-red-500"}`}>{bulkError}</p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* FIX: storage box for serial numbers is now always shown, with an empty-state message */}
                                                <div className={`mt-4 flex gap-2 rounded-xl border-2 border-dashed p-3 ${dl ? "border-gray-600" : "border-gray-300"}`}>
                                                    <div className={`rounded-xl border p-4 min-h-[60px] flex flex-wrap items-center gap-x-1.5 gap-y-2 w-full ${dl ? "border-gray-600" : "border-gray-200"}`}>
                                                        {serialNumbers.length > 0 ? (
                                                            serialNumbers.map((sn) => (
                                                                <span key={sn} className={`bs-item inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-full ${dl ? "bg-blue-900/30" : "bg-blue-50"}`}>
                                                                    <span className={`text-sm font-mono ${dl ? "text-blue-200" : "text-blue-700"}`}>{sn}</span>
                                                                    <button type="button" onClick={() => handleRemoveSerial(sn)}
                                                                        className="w-5 h-5 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] flex-shrink-0 transition-colors">✕</button>
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className={`text-sm italic ${dl ? "text-gray-500" : "text-gray-400"}`}>No serial number</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className={labelClass}>Quantity <span className="text-red-500">*</span></label>
                                                {/* FIX: Value is an empty string instead of 0 in the UI */}
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={quantity}
                                                    onChange={e => setQuantity(e.target.value === "" ? "" : String(Math.max(0, Number(e.target.value))))}
                                                    className={inputClass}
                                                    placeholder="Enter quantity"
                                                />
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Reference & Note fields are at the bottom here */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Reference <span className={`ml-1 text-xs font-normal ${dl ? "text-gray-400" : "text-gray-500"}`}>(optional)</span></label>
                                        <input type="text" value={reference} onChange={e => setReference(e.target.value)} className={inputClass} placeholder="e.g. PO-2026-001" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Note <span className={`ml-1 text-xs font-normal ${dl ? "text-gray-400" : "text-gray-500"}`}>(optional)</span></label>
                                        <input type="text" value={note} onChange={e => setNote(e.target.value)} className={inputClass} placeholder="e.g. Restock for Q3" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className={`px-4 sm:px-6 py-3 border-t flex-shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-3 ${dl ? "bg-gray-800/80 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={saving}
                                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${dl ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"} disabled:opacity-50`}
                            >
                                Cancel
                            </button>
                            <ComponentPermission scopes={["stockmovement:create"]}>
                                <button
                                    type="submit"
                                    disabled={saving || (!productBase || !selectedSupplier || effectiveQuantity <= 0)}
                                    className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all shadow-md ${saving ? "opacity-70 cursor-not-allowed bg-blue-500" : "bg-blue-600 hover:bg-blue-700 active:scale-95"} disabled:active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {saving ? (
                                        <>
                                            <Spinner size={4} />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                                <polyline points="17 21 17 13 7 13 7 21" />
                                                <polyline points="7 3 7 8 15 8" />
                                            </svg>
                                            Save Stock In
                                        </>
                                    )}
                                </button>
                            </ComponentPermission>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default StockInForm;