// import { useCallback, useEffect, useRef, useState } from "react";
// import { useGlobleContextDarklight, useRefreshTable } from "../../AllContext/context";
// import XSelectSearch, { SingleValue } from "../../component/XSelectSearch/Xselectsearch";
// import { alertError } from "../../HtmlHelper/Alert";
// import { AxiosApi } from "../../component/Axios/Axios";

// interface SerialNumberInfo {
//     id: number; productId: number; serialNo: string;
//     status: string; price: number; costPrice: number; createdDate?: string;
// }
// interface StockMovementInfo {
//     id: number; type: string; quantity: number; price: number;
//     costPrice: number; notes?: string; movementDate: string;
// }

// interface ProductSummary {
//     productId: number;
//     isSerialNumber: boolean;
//     currentStock: number;
//     totalStock: number;
//     sold: number;
//     // serialized
//     totalCostIn: number;
//     totalCost: number;
//     // non-serialized
//     totalBatchesIn: number;
//     totalBatchesOut: number;
//     totalStockIn: number;
//     totalStockOut: number;
//     totalCostOut: number;
// }

// export interface StockFormProduct {
//     id: number; name: string; sku?: string; price: number;
//     costPrice?: number; stock: number; isSerialNumber: boolean;
//     imageProduct?: string;[key: string]: any;
// }

// interface StockFormProps {
//     initialProduct?: StockFormProduct;
//     onClose: () => void;
//     onSuccess: () => void;
// }

// type SerialAddMode = "single" | "bulk" | "csv";
// type SerialFilter = "all" | "available" | "sold" | "new";
// type StockMode = "add" | "remove";

// const PAGE_SIZE = 10;

// const StockForm = ({ initialProduct, onClose, onSuccess }: StockFormProps) => {
//     const { darkLight } = useGlobleContextDarklight();
//     const [isAnimating, setIsAnimating] = useState(false);
//     const hasInitialized = useRef(false);
//     const singleInputRef = useRef<HTMLInputElement>(null);
//     const csvInputRef = useRef<HTMLInputElement>(null);
//     const [saving, setSaving] = useState(false);

//     const [selectedProduct, setSelectedProduct] = useState<SingleValue | null>(null);
//     const [productBase, setProductBase] = useState<StockFormProduct | null>(null);
//     const [loadingProduct, setLoadingProduct] = useState(false);

//     const [summary, setSummary] = useState<ProductSummary | null>(null);
//     const [summaryLoading, setSummaryLoading] = useState(false);

//     const [existingSerials, setExistingSerials] = useState<SerialNumberInfo[]>([]);
//     const [serialTotalCount, setSerialTotalCount] = useState(0);
//     const [serialLoading, setSerialLoading] = useState(false);

//     const [serialsToAdd, setSerialsToAdd] = useState<string[]>([]);
//     const [serialIdsToRemove, setSerialIdsToRemove] = useState<number[]>([]);
//     const serialEditsRef = useRef<Map<number, string>>(new Map());
//     const [editedSerialIds, setEditedSerialIds] = useState<Set<number>>(new Set());

//     const [serialAddMode, setSerialAddMode] = useState<SerialAddMode>("single");
//     const [newSerialInput, setNewSerialInput] = useState("");
//     const [bulkInput, setBulkInput] = useState("");
//     const [bulkError, setBulkError] = useState("");
//     const [serialFilter, setSerialFilter] = useState<SerialFilter>("all");
//     const [serialSearch, setSerialSearch] = useState("");
//     const [serialPage, setSerialPage] = useState(1);

//     const [selectedExistingIds, setSelectedExistingIds] = useState<Set<number>>(new Set());
//     const [selectedPendingIds, setSelectedPendingIds] = useState<Set<string>>(new Set());

//     const [stockMovements, setStockMovements] = useState<StockMovementInfo[]>([]);
//     const [movementTotalCount, setMovementTotalCount] = useState(0);
//     const [movementPage, setMovementPage] = useState(1);
//     const [movementLoading, setMovementLoading] = useState(false);

//     const [stockToAdd, setStockToAdd] = useState(0);
//     const [stockToRemove, setStockToRemove] = useState(0);
//     const [stockNotes, setStockNotes] = useState("");
//     const [stockMode, setStockMode] = useState<StockMode>("add");
//     const {setRefreshTables} = useRefreshTable();

//     // ONE call replaces two count calls
//     const loadSummary = useCallback(async (pid: number) => {
//         setSummaryLoading(true);
//         try {
//             const res = await AxiosApi.get(`Product/${pid}/summary`);
//             const data: ProductSummary = res?.data?.data ?? res?.data;
//             setSummary(data);
//         } catch (err) { console.error(err); }
//         finally { setSummaryLoading(false); }
//     }, []);

//     const loadSerialNumbers = useCallback(async (
//         pid: number, page: number, filter: SerialFilter, search: string,
//     ) => {
//         if (filter === "new") return;
//         setSerialLoading(true);
//         try {
//             const statusParam = filter === "available" ? "&status=Available" : filter === "sold" ? "&status=Sold" : "";
//             const searchParam = search.trim() ? `&search=${encodeURIComponent(search.trim())}` : "";
//             const res = await AxiosApi.get(`SerialNumber?productId=${pid}&page=${page}&pageSize=${PAGE_SIZE}${statusParam}${searchParam}`);
//             const items: SerialNumberInfo[] = res?.data?.data ?? [];
//             const total: number = res?.data?.totalCount ?? items.length;
//             setExistingSerials(items);
//             setSerialTotalCount(total);
//             items.forEach(s => { if (!serialEditsRef.current.has(s.id)) serialEditsRef.current.set(s.id, s.serialNo); });
//         } catch (err) { console.error(err); }
//         finally { setSerialLoading(false); }
//     }, []);

//     const loadStockMovements = useCallback(async (pid: number, page: number) => {
//         setMovementLoading(true);
//         try {
//             const res = await AxiosApi.get(`StockMovement?productId=${pid}&page=${page}&pageSize=${PAGE_SIZE}`);
//             const items: StockMovementInfo[] = res?.data?.data ?? [];
//             const total: number = res?.data?.totalCount ?? items.length;
//             setStockMovements(items);
//             setMovementTotalCount(total);
//         } catch (err) { console.error(err); }
//         finally { setMovementLoading(false); }
//     }, []);

//     const initProductData = useCallback(async (product: StockFormProduct) => {
//         await loadSummary(product.id);
//         if (product.isSerialNumber) {
//             await loadSerialNumbers(product.id, 1, "all", "");
//         } else {
//             await loadStockMovements(product.id, 1);
//         }
//     }, [loadSummary, loadSerialNumbers, loadStockMovements]);

//     useEffect(() => {
//         if (hasInitialized.current) return;
//         hasInitialized.current = true;
//         setTimeout(() => setIsAnimating(true), 10);
//         if (initialProduct) {
//             setProductBase(initialProduct);
//             setSelectedProduct({ id: initialProduct.id, name: initialProduct.name, value: initialProduct.id, data: initialProduct });
//             initProductData(initialProduct);
//         }
//     }, []);

//     const handleProductChange = async (value: SingleValue | null) => {
//         setSelectedProduct(value);
//         resetAllState();
//         if (!value) return;
//         setLoadingProduct(true);
//         try {
//             const res = await AxiosApi.get(`Product/${Number(value.id)}`);
//             const data: StockFormProduct = res?.data?.data ?? res?.data ?? res;
//             if (data) { setProductBase(data); await initProductData(data); }
//         } catch (err) { console.error(err); }
//         finally { setLoadingProduct(false); }
//     };

//     const resetAllState = () => {
//         setExistingSerials([]); setSerialTotalCount(0);
//         setSerialsToAdd([]); setSerialIdsToRemove([]);
//         serialEditsRef.current.clear(); setEditedSerialIds(new Set());
//         setSelectedExistingIds(new Set()); setSelectedPendingIds(new Set());
//         setStockMovements([]); setMovementTotalCount(0); setMovementPage(1);
//         setStockToAdd(0); setStockToRemove(0); setStockNotes(""); setStockMode("add");
//         setSerialAddMode("single"); setSerialFilter("available");
//         setSerialSearch(""); setSerialPage(1);
//         setBulkInput(""); setBulkError(""); setProductBase(null); setSummary(null);
//     };

//     const handleFilterChange = (f: SerialFilter) => {
//         setSerialFilter(f); setSerialPage(1); setSerialSearch(""); setSelectedExistingIds(new Set());
//         if (productBase && f !== "new") loadSerialNumbers(productBase.id, 1, f, "");
//     };
//     const handleSearchChange = (v: string) => {
//         setSerialSearch(v); setSerialPage(1);
//         if (productBase && serialFilter !== "new") loadSerialNumbers(productBase.id, 1, serialFilter, v);
//     };
//     const handleSerialPageChange = (page: number) => {
//         setSerialPage(page); setSelectedExistingIds(new Set());
//         if (productBase) loadSerialNumbers(productBase.id, page, serialFilter, serialSearch);
//     };
//     const handleMovementPageChange = (page: number) => {
//         setMovementPage(page);
//         if (productBase) loadStockMovements(productBase.id, page);
//     };

//     const handleAddSerial = () => {
//         const t = newSerialInput.trim(); if (!t) return;
//         if (serialsToAdd.includes(t)) { alertError("Already in pending list!"); return; }
//         setSerialsToAdd(prev => [...prev, t]); setNewSerialInput(""); singleInputRef.current?.focus();
//     };
//     const handleBulkAdd = () => {
//         setBulkError("");
//         const lines = bulkInput.split(/[\n,;]+/).map(l => l.trim()).filter(Boolean);
//         if (!lines.length) { setBulkError("No serial numbers found."); return; }
//         const pendingSet = new Set(serialsToAdd);
//         const toAdd: string[] = []; const dupes: string[] = [];
//         lines.forEach(sn => (pendingSet.has(sn) || toAdd.includes(sn) ? dupes : toAdd).push(sn));
//         if (toAdd.length) setSerialsToAdd(prev => [...prev, ...toAdd]);
//         setBulkInput("");
//         setBulkError(dupes.length
//             ? `Added ${toAdd.length}. Skipped ${dupes.length} duplicate(s): ${dupes.slice(0, 3).join(", ")}${dupes.length > 3 ? "…" : ""}`
//             : `Added ${toAdd.length} serial numbers.`);
//     };
//     const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0]; if (!file) return;
//         const reader = new FileReader();
//         reader.onload = ev => {
//             const text = ev.target?.result as string;
//             const rows = text.split(/\r?\n/).map(r => r.split(",")[0].replace(/"/g, "").trim()).filter(Boolean);
//             const lines = rows[0] && !/^[A-Z0-9\-_]+$/i.test(rows[0]) ? rows.slice(1) : rows;
//             const pendingSet = new Set(serialsToAdd);
//             const toAdd = lines.filter(sn => !pendingSet.has(sn));
//             const dupeCount = lines.length - toAdd.length;
//             if (toAdd.length) setSerialsToAdd(prev => [...prev, ...toAdd]);
//             setBulkError(dupeCount ? `Imported ${toAdd.length}. Skipped ${dupeCount} duplicate(s).` : `Imported ${toAdd.length} serial numbers.`);
//         };
//         reader.readAsText(file); e.target.value = "";
//     };

//     const handleMarkRemove = (id: number) => {
//         setSerialIdsToRemove(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
//         setSelectedExistingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
//     };
//     const handleUpdateSerial = (id: number, value: string) => {
//         const original = existingSerials.find(s => s.id === id)?.serialNo ?? serialEditsRef.current.get(id) ?? "";
//         serialEditsRef.current.set(id, value);
//         setEditedSerialIds(prev => { const n = new Set(prev); if (value !== original) n.add(id); else n.delete(id); return n; });
//     };
//     const getEditValue = (sn: SerialNumberInfo) =>
//         serialEditsRef.current.has(sn.id) ? serialEditsRef.current.get(sn.id)! : sn.serialNo;
//     const handleRemovePending = (s: string) => {
//         setSerialsToAdd(prev => prev.filter(x => x !== s));
//         setSelectedPendingIds(prev => { const n = new Set(prev); n.delete(s); return n; });
//     };
//     const toggleSelectExisting = (id: number, status: string) => {
//         if (status === "Sold") return;
//         setSelectedExistingIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
//     };
//     const toggleSelectPending = (sn: string) => {
//         setSelectedPendingIds(prev => { const n = new Set(prev); n.has(sn) ? n.delete(sn) : n.add(sn); return n; });
//     };
//     const handleBulkRemoveSelected = () => {
//         if (selectedExistingIds.size > 0) { setSerialIdsToRemove(prev => [...new Set([...prev, ...selectedExistingIds])]); setSelectedExistingIds(new Set()); }
//         if (selectedPendingIds.size > 0) { setSerialsToAdd(prev => prev.filter(sn => !selectedPendingIds.has(sn))); setSelectedPendingIds(new Set()); }
//     };
//     const totalSelected = selectedExistingIds.size + selectedPendingIds.size;
//     const countAvailable = summary?.currentStock ?? 0;
//     const countSold = summary?.sold ?? 0;
//     const countNew = serialsToAdd.length;

//     const totalExistingPages = Math.max(1, Math.ceil(serialTotalCount / PAGE_SIZE));
//     const totalMovementPages = Math.max(1, Math.ceil(movementTotalCount / PAGE_SIZE));

//     const afterStock = countAvailable
//         - serialIdsToRemove.filter(id => existingSerials.find(s => s.id === id)?.status === "Available").length
//         + countNew;
//     const afterStockNonSerial = (productBase?.stock ?? 0) + stockToAdd - stockToRemove;

//     const hasChanges = productBase?.isSerialNumber
//         ? (serialsToAdd.length > 0 || serialIdsToRemove.length > 0 || editedSerialIds.size > 0)
//         : (stockToAdd > 0 || stockToRemove > 0);

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!productBase) { alertError("Please select a product!"); return; }
//         if (!hasChanges) { alertError("No changes to save!"); return; }
//         if (!productBase.isSerialNumber && stockToRemove > productBase.stock) {
//             alertError(`Cannot remove ${stockToRemove}. Only ${productBase.stock} in stock!`); return;
//         }
//         setSaving(true);
//         try {
//             if (productBase.isSerialNumber) {
//                 for (const sn of serialsToAdd)
//                     await AxiosApi.post("SerialNumber", { productId: productBase.id, serialNo: sn, price: productBase.price, costPrice: productBase.costPrice ?? 0 });
//                 for (const id of serialIdsToRemove)
//                     await AxiosApi.delete(`SerialNumber/${id}`);
//                 for (const id of editedSerialIds) {
//                     const newVal = serialEditsRef.current.get(id);
//                     const existing = existingSerials.find(s => s.id === id);
//                     if (newVal !== undefined)
//                         await AxiosApi.put(`SerialNumber/${id}`, { serialNo: newVal, price: existing?.price ?? productBase.price, costPrice: existing?.costPrice ?? productBase.costPrice ?? 0 });
//                 }
//             } else {
//                 if (stockToAdd > 0)
//                     await AxiosApi.post("StockMovement", { productId: productBase.id, type: "StockIn", quantity: stockToAdd, price: productBase.price, costPrice: productBase.costPrice ?? 0, notes: stockNotes || null });
//                 if (stockToRemove > 0)
//                     await AxiosApi.post("StockMovement", { productId: productBase.id, type: "StockOut", quantity: stockToRemove, price: productBase.price, costPrice: productBase.costPrice ?? 0, notes: stockNotes || null });
//             }
//             setTimeout(() => handleClose(), 500);
//             onSuccess();
//             setRefreshTables(new Date());
//         } catch (err) { console.error(err); alertError("Failed to save changes. Please try again."); }
//         finally { setSaving(false); }
//     };

//     const handleClose = () => { setIsAnimating(false); setTimeout(() => onClose(), 300); };
//     const handleModeSwitch = (mode: StockMode) => { setStockMode(mode); setStockToAdd(0); setStockToRemove(0); setStockNotes(""); };

//     const buildPageNumbers = (current: number, total: number): (number | "…")[] => {
//         const nums = Array.from({ length: total }, (_, i) => i + 1)
//             .filter(p => p === 1 || p === total || Math.abs(p - current) <= 1);
//         return nums.reduce<(number | "…")[]>((acc, p, i, arr) => {
//             if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…");
//             acc.push(p); return acc;
//         }, []);
//     };

//     const dl = darkLight;
//     const inputClass = `w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${dl ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:bg-gray-700 focus:border-blue-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-blue-50/30"}`;
//     const inputRemoveClass = `w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 ${dl ? "bg-gray-700/50 border-red-600 text-gray-100 placeholder-gray-400 focus:bg-gray-700 focus:border-red-500" : "bg-white border-red-300 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:bg-red-50/30"}`;
//     const labelClass = `block mb-1.5 text-sm font-semibold ${dl ? "text-gray-200" : "text-gray-700"}`;
//     const statusColor = (s: string) => s === "Available" ? "bg-green-100 text-green-700" : s === "Sold" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600";
//     const filterTabClass = (active: boolean, color?: string) => {
//         if (active) {
//             if (color === "green") return dl ? "bg-green-900/40 border-green-600 text-green-300" : "bg-green-100 border-green-400 text-green-700";
//             if (color === "red") return dl ? "bg-red-900/40 border-red-600 text-red-300" : "bg-red-100 border-red-400 text-red-700";
//             if (color === "blue") return dl ? "bg-blue-900/40 border-blue-600 text-blue-300" : "bg-blue-100 border-blue-400 text-blue-700";
//             return dl ? "bg-gray-600 border-gray-500 text-white" : "bg-gray-200 border-gray-400 text-gray-800";
//         }
//         return dl ? "bg-transparent border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300"
//             : "bg-transparent border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700";
//     };
//     const addModeTabClass = (active: boolean) =>
//         active ? (dl ? "bg-blue-900/40 border-blue-600 text-blue-300" : "bg-blue-50 border-blue-400 text-blue-700")
//             : (dl ? "border-gray-600 text-gray-400 hover:text-gray-300" : "border-gray-300 text-gray-500 hover:text-gray-700");
//     const pageBtnClass = (active: boolean) =>
//         `min-w-[24px] h-6 px-1 rounded text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed ${active ? "bg-blue-500 text-white" : dl ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-200 text-gray-600"}`;

//     const PaginationBar = ({ page, totalPages, totalCount, loading: isLoading, onPageChange }: {
//         page: number; totalPages: number; totalCount: number; loading: boolean; onPageChange: (p: number) => void;
//     }) => {
//         const nums = buildPageNumbers(page, totalPages);
//         const start = (page - 1) * PAGE_SIZE + 1;
//         const end = Math.min(page * PAGE_SIZE, totalCount);
//         return (
//             <div className={`flex items-center gap-2 px-3 py-2 text-xs flex-wrap ${dl ? "text-gray-400" : "text-gray-500"}`}>
//                 {isLoading && <Spinner size={3.5} />}
//                 <span className="flex-1 whitespace-nowrap">{start}–{end} of {totalCount}</span>
//                 {totalPages > 1 && (
//                     <div className="flex items-center gap-1 flex-shrink-0">
//                         <button type="button" disabled={page === 1 || isLoading} onClick={() => onPageChange(1)} className={pageBtnClass(false)}>«</button>
//                         <button type="button" disabled={page === 1 || isLoading} onClick={() => onPageChange(page - 1)} className={pageBtnClass(false)}>‹</button>
//                         {nums.map((p, i) => p === "…"
//                             ? <span key={`el-${i}`} className={`px-1 ${dl ? "text-gray-500" : "text-gray-400"}`}>…</span>
//                             : <button key={p} type="button" disabled={isLoading} onClick={() => onPageChange(p as number)} className={pageBtnClass(page === p)}>{p}</button>
//                         )}
//                         <button type="button" disabled={page === totalPages || isLoading} onClick={() => onPageChange(page + 1)} className={pageBtnClass(false)}>›</button>
//                         <button type="button" disabled={page === totalPages || isLoading} onClick={() => onPageChange(totalPages)} className={pageBtnClass(false)}>»</button>
//                     </div>
//                 )}
//             </div>
//         );
//     };

//     const filteredPending = serialSearch.trim()
//         ? serialsToAdd.filter(s => s.toLowerCase().includes(serialSearch.toLowerCase()))
//         : serialsToAdd;
//     const showPending = serialFilter === "all" || serialFilter === "new";
//     const showExisting = serialFilter !== "new";
//     const isStandalone = !initialProduct;

//     const Spinner = ({ size = 5 }: { size?: number }) => (
//         <svg className={`animate-spin h-${size} w-${size} text-blue-500`} viewBox="0 0 24 24">
//             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//         </svg>
//     );

//     return (
//         <>
//             <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"}`} />
//             <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 mt-15 pointer-events-none transition-all duration-300 ${isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
//                 <div className={`rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden pointer-events-auto transform transition-all duration-300 ${dl ? "bg-gray-800" : "bg-white"} ${isAnimating ? "translate-y-0" : "translate-y-4"}`}
//                     style={{ maxHeight: "calc(100vh - 80px)" }}>

//                     {/* HEADER */}
//                     <div className={`px-6 py-4 border-b flex-shrink-0 ${dl ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
//                         <div className="flex justify-between items-start">
//                             <div>
//                                 {productBase ? (
//                                     <div className="flex items-center gap-3">
//                                         {productBase.imageProduct && (
//                                             <img src={productBase.imageProduct} alt={productBase.name}
//                                                 className="w-10 h-10 rounded-xl object-cover ring-2 ring-gray-200 dark:ring-gray-600 flex-shrink-0" />
//                                         )}
//                                         <div>
//                                             <h2 className={`text-xl font-bold leading-tight ${dl ? "text-white" : "text-gray-900"}`}>{productBase.name}</h2>
//                                             {productBase.sku && <p className="text-xs font-mono text-gray-400 tracking-wider uppercase">{productBase.sku}</p>}
//                                         </div>
//                                     </div>
//                                 ) : (
//                                     <h2 className={`text-2xl font-bold ${dl ? "text-white" : "text-gray-900"}`}>Manage Stock</h2>
//                                 )}
//                             </div>
//                             <button onClick={handleClose}
//                                 className={`w-8 h-8 rounded-full flex items-center justify-center text-xl transition-all flex-shrink-0 ml-2 ${dl ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}>×</button>
//                         </div>

//                         {/* ✅ Stats from summary API */}
//                         {productBase && !loadingProduct && (
//                             <div className="flex gap-2 mt-3">
//                                 {summaryLoading ? (
//                                     <div className="flex items-center gap-2 py-1"><Spinner size={4} /><span className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}>Loading stats…</span></div>
//                                 ) : productBase.isSerialNumber ? (
//                                     <>
//                                         <StatCard label="Current Stock" value={summary?.currentStock ?? 0} dl={dl} />
//                                         <StatCard label="Total Stock" value={summary?.totalStock ?? 0} dl={dl} />
//                                         <StatCard label="Sold" value={summary?.sold ?? 0} dl={dl} color="red" />
//                                         <StatCard label="Total Cost" value={`$${summary?.totalCost?.toFixed(2)}`} dl={dl} color="orange" />
//                                     </>
//                                 ) : (
//                                     <>
//                                         <StatCard label="Current Stock" value={summary?.currentStock ?? 0} dl={dl} />
//                                         <StatCard label="Total Stock" value={summary?.totalStock ?? 0} dl={dl} color="green" />
//                                         <StatCard label="Sold" value={summary?.sold ?? 0} dl={dl} color="red" />
//                                         <StatCard label="Total Cost" value={`$${summary?.totalCost?.toFixed(2)}`} dl={dl} color="orange" />
//                                         {/* <StatCard label="Batches" value={(summary?.totalBatchesIn ?? 0)} dl={dl} color="purple" /> */}
//                                     </>
//                                 )}
//                             </div>
//                         )}
//                     </div>

//                     {/* BODY */}
//                     <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
//                         <div className="overflow-y-auto flex-1 px-6 py-5 custom-scrollbar"
//                             style={{ scrollbarWidth: "thin", scrollbarColor: dl ? "#4a5568 transparent" : "#cbd5e0 transparent" }}>
//                             <style>{`.custom-scrollbar::-webkit-scrollbar{width:6px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:transparent;border-radius:3px}.custom-scrollbar:hover::-webkit-scrollbar-thumb{background:${dl ? "#4a5568" : "#cbd5e0"}}`}</style>
//                             <div className="space-y-4">

//                                 {isStandalone && (
//                                     <div>
//                                         <label className={labelClass}>Product <span className="text-red-500">*</span></label>
//                                         <XSelectSearch value={selectedProduct} onChange={handleProductChange} multiple={false}
//                                             placeholder="Select product to manage stock"
//                                             selectOption={{ apiEndpoint: "/Product", id: "id", name: "name", value: "id", pageSize: 20, searchParam: "Search" }}
//                                             isSearchable={true} />
//                                     </div>
//                                 )}

//                                 {loadingProduct && <div className="flex justify-center py-8"><Spinner size={8} /></div>}

//                                 {productBase && !loadingProduct && (
//                                     <>
//                                         {/* SERIALIZED */}
//                                         {productBase.isSerialNumber && (
//                                             <>
//                                                 <div>
//                                                     <label className={labelClass}>Add Serial Numbers</label>
//                                                     <div className={`flex gap-1 p-1 rounded-xl mb-3 ${dl ? "bg-gray-700/60" : "bg-gray-100"}`}>
//                                                         {(["single", "bulk", "csv"] as SerialAddMode[]).map(m => (
//                                                             <button key={m} type="button" onClick={() => { setSerialAddMode(m); setBulkError(""); }}
//                                                                 className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${addModeTabClass(serialAddMode === m)}`}>
//                                                                 {m === "single" ? "⌨ Single" : m === "bulk" ? "📋 Bulk Paste" : "📁 Import CSV"}
//                                                             </button>
//                                                         ))}
//                                                     </div>
//                                                     {serialAddMode === "single" && (
//                                                         <div className="flex gap-2">
//                                                             <input ref={singleInputRef} type="text" value={newSerialInput} autoFocus
//                                                                 onChange={e => setNewSerialInput(e.target.value)}
//                                                                 onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddSerial())}
//                                                                 className={inputClass} placeholder="Type or scan serial number — press Enter or Add" />
//                                                             <button type="button" onClick={handleAddSerial}
//                                                                 className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-colors whitespace-nowrap">+ Add</button>
//                                                         </div>
//                                                     )}
//                                                     {serialAddMode === "bulk" && (
//                                                         <div className="space-y-2">
//                                                             <textarea value={bulkInput} rows={5}
//                                                                 onChange={e => { setBulkInput(e.target.value); setBulkError(""); }}
//                                                                 className={`w-full px-4 py-3 rounded-lg border font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${dl ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500"}`}
//                                                                 placeholder={"Paste serial numbers — one per line, or comma/semicolon separated:\nSN-A001\nSN-B002"} />
//                                                             <div className="flex items-center justify-between gap-2">
//                                                                 {bulkError
//                                                                     ? <p className={`text-xs ${bulkError.startsWith("Added") ? "text-blue-500" : "text-red-500"}`}>{bulkError}</p>
//                                                                     : <p className={`text-xs ${dl ? "text-gray-500" : "text-gray-400"}`}>{bulkInput.split(/[\n,;]+/).filter(l => l.trim()).length} lines detected</p>}
//                                                                 <button type="button" onClick={handleBulkAdd} disabled={!bulkInput.trim()}
//                                                                     className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors whitespace-nowrap">Add All</button>
//                                                             </div>
//                                                         </div>
//                                                     )}
//                                                     {serialAddMode === "csv" && (
//                                                         <div className="space-y-2">
//                                                             <div onClick={() => csvInputRef.current?.click()}
//                                                                 className={`flex flex-col items-center justify-center gap-2 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ${dl ? "border-gray-600 hover:border-blue-500 hover:bg-blue-900/10" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"}`}>
//                                                                 <span className="text-3xl">📁</span>
//                                                                 <p className={`text-sm font-medium ${dl ? "text-gray-300" : "text-gray-600"}`}>Click to upload CSV or TXT file</p>
//                                                                 <p className={`text-xs ${dl ? "text-gray-500" : "text-gray-400"}`}>First column used — header row auto-skipped</p>
//                                                                 <input ref={csvInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleCSVImport} />
//                                                             </div>
//                                                             {bulkError && <p className={`text-xs text-center ${bulkError.startsWith("Imported") ? "text-blue-500" : "text-red-500"}`}>{bulkError}</p>}
//                                                         </div>
//                                                     )}
//                                                 </div>

//                                                 {(countAvailable + countSold > 0 || serialsToAdd.length > 0) ? (
//                                                     <div className={`rounded-xl border overflow-hidden ${dl ? "border-gray-600" : "border-gray-200"}`}>
//                                                         <div className={`px-3 py-2 border-b flex flex-wrap items-center gap-2 ${dl ? "border-gray-600 bg-gray-800/60" : "border-gray-200 bg-gray-50"}`}>
//                                                             <div className="flex gap-1 flex-wrap">
//                                                                 {([
//                                                                     { key: "all", label: `All (${countAvailable + countSold + countNew})`, color: undefined },
//                                                                     { key: "available", label: `Available (${countAvailable})`, color: "green" },
//                                                                     { key: "sold", label: `Sold (${countSold})`, color: "red" },
//                                                                     ...(countNew > 0 ? [{ key: "new", label: `New (${countNew})`, color: "blue" }] : []),
//                                                                 ] as { key: SerialFilter; label: string; color?: string }[]).map(tab => (
//                                                                     <button key={tab.key} type="button" onClick={() => handleFilterChange(tab.key)}
//                                                                         className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all ${filterTabClass(serialFilter === tab.key, tab.color)}`}>
//                                                                         {tab.label}
//                                                                     </button>
//                                                                 ))}
//                                                             </div>
//                                                             {serialFilter !== "new" && (
//                                                                 <input type="text" value={serialSearch} onChange={e => handleSearchChange(e.target.value)} placeholder="Search…"
//                                                                     className={`ml-auto text-xs px-2.5 py-1 rounded-lg border w-32 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${dl ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500" : "bg-white border-gray-300 text-gray-700"}`} />
//                                                             )}
//                                                         </div>

//                                                         {totalSelected > 0 && (
//                                                             <div className={`flex items-center gap-3 px-3 py-2 border-b ${dl ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"}`}>
//                                                                 <span className={`text-xs font-semibold ${dl ? "text-red-300" : "text-red-600"}`}>{totalSelected} selected</span>
//                                                                 <button type="button" onClick={handleBulkRemoveSelected} className="ml-auto px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors">Remove Selected</button>
//                                                                 <button type="button" onClick={() => { setSelectedExistingIds(new Set()); setSelectedPendingIds(new Set()); }}
//                                                                     className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${dl ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}>Clear</button>
//                                                             </div>
//                                                         )}

//                                                         {showPending && filteredPending.length > 0 && (
//                                                             <>
//                                                                 <div className={`flex items-center gap-2 px-3 py-1.5 border-b ${dl ? "border-gray-700 bg-green-900/10" : "border-gray-100 bg-green-50/50"}`}>
//                                                                     <input type="checkbox" className="w-3.5 h-3.5 rounded cursor-pointer accent-blue-500"
//                                                                         checked={filteredPending.length > 0 && filteredPending.every(sn => selectedPendingIds.has(sn))}
//                                                                         onChange={e => { if (e.target.checked) setSelectedPendingIds(new Set(filteredPending)); else setSelectedPendingIds(new Set()); }} />
//                                                                     <span className={`text-xs font-semibold ${dl ? "text-green-400" : "text-green-600"}`}>✦ {filteredPending.length} pending (unsaved)</span>
//                                                                 </div>
//                                                                 {filteredPending.map(sn => {
//                                                                     const isChecked = selectedPendingIds.has(sn);
//                                                                     return (
//                                                                         <div key={`p-${sn}`} className={`flex items-center gap-2 px-3 py-1.5 border-b transition-all ${dl ? "border-gray-700 bg-green-900/10" : "border-gray-100 bg-green-50/40"} ${isChecked ? (dl ? "bg-blue-900/20" : "bg-blue-50/50") : ""}`}>
//                                                                             <input type="checkbox" checked={isChecked} onChange={() => toggleSelectPending(sn)} className="w-3.5 h-3.5 rounded cursor-pointer accent-blue-500 flex-shrink-0" />
//                                                                             <span className={`flex-1 text-sm font-mono truncate px-2 ${dl ? "text-green-300" : "text-green-700"}`}>{sn}</span>
//                                                                             <span className="text-[10px] text-gray-400 font-mono whitespace-nowrap">Freeze @ ${productBase.price}</span>
//                                                                             <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium flex-shrink-0">New</span>
//                                                                             <button type="button" onClick={() => handleRemovePending(sn)} className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-colors">✕</button>
//                                                                         </div>
//                                                                     );
//                                                                 })}
//                                                             </>
//                                                         )}

//                                                         {showExisting && (
//                                                             <>
//                                                                 <div className={`flex items-center gap-2 px-3 py-1.5 border-b ${dl ? "border-gray-700 bg-gray-800/40" : "border-gray-100 bg-gray-50"}`}>
//                                                                     <input type="checkbox" className="w-3.5 h-3.5 rounded cursor-pointer accent-blue-500"
//                                                                         checked={existingSerials.filter(s => s.status !== "Sold").length > 0 && existingSerials.filter(s => s.status !== "Sold").every(s => selectedExistingIds.has(s.id))}
//                                                                         onChange={e => {
//                                                                             if (e.target.checked) setSelectedExistingIds(prev => new Set([...prev, ...existingSerials.filter(s => s.status !== "Sold").map(s => s.id)]));
//                                                                             else setSelectedExistingIds(prev => { const n = new Set(prev); existingSerials.forEach(s => n.delete(s.id)); return n; });
//                                                                         }} />
//                                                                     <span className={`text-xs ${dl ? "text-gray-500" : "text-gray-400"}`}>Select page</span>
//                                                                     <span className={`ml-auto text-xs ${dl ? "text-gray-500" : "text-gray-400"}`}>{serialTotalCount} total</span>
//                                                                 </div>
//                                                                 {serialLoading ? (
//                                                                     <div className="flex justify-center py-6"><Spinner size={5} /></div>
//                                                                 ) : existingSerials.length === 0 ? (
//                                                                     <div className="py-6 text-center"><p className={`text-sm ${dl ? "text-gray-500" : "text-gray-400"}`}>No serials match this filter</p></div>
//                                                                 ) : existingSerials.map(sn => {
//                                                                     const isRemoving = serialIdsToRemove.includes(sn.id);
//                                                                     const isChecked = selectedExistingIds.has(sn.id);
//                                                                     const isEdited = editedSerialIds.has(sn.id);
//                                                                     const editVal = getEditValue(sn);
//                                                                     return (
//                                                                         <div key={`e-${sn.id}`} className={`flex items-center gap-2 px-3 py-1.5 border-b last:border-0 transition-all ${dl ? "border-gray-700" : "border-gray-100"} ${isRemoving ? "opacity-40" : ""} ${isChecked && !isRemoving ? (dl ? "bg-blue-900/20" : "bg-blue-50/50") : ""}`}>
//                                                                             <input type="checkbox" checked={isChecked} disabled={sn.status === "Sold" || isRemoving}
//                                                                                 onChange={() => toggleSelectExisting(sn.id, sn.status)}
//                                                                                 className="w-3.5 h-3.5 rounded cursor-pointer accent-blue-500 disabled:cursor-not-allowed flex-shrink-0" />
//                                                                             <input type="text" value={editVal} disabled={isRemoving}
//                                                                                 onChange={e => handleUpdateSerial(sn.id, e.target.value)}
//                                                                                 className={`flex-1 text-sm font-mono px-2 py-1 rounded border focus:outline-none transition-all ${isEdited ? (dl ? "border-amber-500 bg-amber-900/20 text-amber-200" : "border-amber-400 bg-amber-50 text-amber-800") : (dl ? "bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500" : "bg-white border-gray-200 text-gray-700 focus:border-blue-500")} disabled:cursor-not-allowed`} />
//                                                                             {isEdited && <span className="text-[10px] text-amber-500 font-bold whitespace-nowrap">edited</span>}
//                                                                             <span className="text-[10px] text-gray-400 font-mono whitespace-nowrap">${sn.price}</span>
//                                                                             <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColor(sn.status)}`}>{sn.status}</span>
//                                                                             <button type="button" onClick={() => handleMarkRemove(sn.id)} disabled={sn.status === "Sold"}
//                                                                                 title={sn.status === "Sold" ? "Cannot remove sold item" : isRemoving ? "Undo" : "Remove"}
//                                                                                 className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-colors ${sn.status === "Sold" ? "bg-gray-200 text-gray-400 cursor-not-allowed" : isRemoving ? "bg-gray-400 hover:bg-gray-500 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}>
//                                                                                 {isRemoving ? "↩" : "✕"}
//                                                                             </button>
//                                                                         </div>
//                                                                     );
//                                                                 })}
//                                                             </>
//                                                         )}

//                                                         <div className={`border-t ${dl ? "border-gray-700 bg-gray-800/40" : "border-gray-200 bg-gray-50"}`}>
//                                                             <div className="flex flex-wrap gap-x-3 gap-y-1 px-3 pt-2 text-xs">
//                                                                 {serialsToAdd.length > 0 && <span className="text-green-500">+{serialsToAdd.length} new</span>}
//                                                                 {serialIdsToRemove.length > 0 && <span className="text-red-500">−{serialIdsToRemove.length} removing</span>}
//                                                                 {editedSerialIds.size > 0 && <span className="text-amber-500">{editedSerialIds.size} edited</span>}
//                                                                 <span className={dl ? "text-gray-500" : "text-gray-400"}>After save: <strong className={dl ? "text-white" : "text-gray-700"}>{afterStock}</strong> available</span>
//                                                             </div>
//                                                             {showExisting && serialTotalCount > PAGE_SIZE && (
//                                                                 <PaginationBar page={serialPage} totalPages={totalExistingPages} totalCount={serialTotalCount} loading={serialLoading} onPageChange={handleSerialPageChange} />
//                                                             )}
//                                                             {(!showExisting || serialTotalCount <= PAGE_SIZE) && <div className="pb-2" />}
//                                                         </div>
//                                                     </div>
//                                                 ) : (
//                                                     <div className={`rounded-xl border-2 border-dashed p-8 text-center ${dl ? "border-gray-600" : "border-gray-300"}`}>
//                                                         <p className="text-2xl mb-2">📦</p>
//                                                         <p className={`font-medium ${dl ? "text-gray-300" : "text-gray-600"}`}>No serial numbers yet</p>
//                                                         <p className={`text-sm mt-1 ${dl ? "text-gray-500" : "text-gray-400"}`}>Use the input above to add serials</p>
//                                                     </div>
//                                                 )}
//                                             </>
//                                         )}

//                                         {/* NON-SERIALIZED */}
//                                         {!productBase.isSerialNumber && (
//                                             <>
//                                                 <div className={`flex gap-1 p-1 rounded-xl ${dl ? "bg-gray-700/60" : "bg-gray-100"}`}>
//                                                     <button type="button" onClick={() => handleModeSwitch("add")}
//                                                         className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${stockMode === "add" ? "bg-emerald-500 text-white shadow-md" : dl ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}>➕ Add Stock</button>
//                                                     <button type="button" onClick={() => handleModeSwitch("remove")}
//                                                         className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${stockMode === "remove" ? "bg-red-500 text-white shadow-md" : dl ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}>➖ Remove Stock</button>
//                                                 </div>
//                                                 {stockMode === "remove" && (
//                                                     <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${dl ? "bg-red-900/20 border border-red-700 text-red-300" : "bg-red-50 border border-red-200 text-red-600"}`}>
//                                                         <span>⚠️</span><span>Max removable: <strong>{productBase.stock}</strong> units</span>
//                                                     </div>
//                                                 )}
//                                                 <div className="grid grid-cols-2 gap-4">
//                                                     <div>
//                                                         <label className={labelClass}>{stockMode === "remove" ? "Quantity to Remove" : "Quantity to Add"} <span className="text-red-500">*</span></label>
//                                                         {stockMode === "add"
//                                                             ? <input type="number" min={0} value={stockToAdd} onChange={e => setStockToAdd(Math.max(0, Number(e.target.value)))} className={inputClass} placeholder="Enter quantity" />
//                                                             : <input type="number" min={0} max={productBase.stock} value={stockToRemove} onChange={e => setStockToRemove(Math.max(0, Math.min(productBase.stock, Number(e.target.value))))} className={inputRemoveClass} placeholder="Enter quantity" />}
//                                                     </div>
//                                                     <div>
//                                                         <label className={labelClass}>Notes</label>
//                                                         <input type="text" value={stockNotes} onChange={e => setStockNotes(e.target.value)} className={inputClass}
//                                                             placeholder={stockMode === "remove" ? "e.g. Damaged, Expired…" : "e.g. First batch, Restock…"} />
//                                                     </div>
//                                                 </div>
//                                                 {(stockToAdd > 0 || stockToRemove > 0) && (
//                                                     <div className={`rounded-lg px-4 py-3 ${stockMode === "remove" ? (dl ? "bg-red-900/20 border border-red-700" : "bg-red-50 border border-red-200") : (dl ? "bg-emerald-900/20 border border-emerald-700" : "bg-emerald-50 border border-emerald-200")}`}>
//                                                         <p className={`text-xs font-bold uppercase mb-2 ${stockMode === "remove" ? (dl ? "text-red-400" : "text-red-600") : (dl ? "text-emerald-400" : "text-emerald-600")}`}>
//                                                             {stockMode === "remove" ? "🔻 Stock Removal Preview" : "📌 Price Snapshot Preview"}
//                                                         </p>
//                                                         <div className="grid grid-cols-3 gap-3 text-center">
//                                                             <div><p className="text-xs text-gray-500">Qty</p><p className={`font-bold ${dl ? "text-white" : "text-gray-800"}`}>{stockMode === "remove" ? `-${stockToRemove}` : `+${stockToAdd}`}</p></div>
//                                                             <div><p className="text-xs text-gray-500">After Save</p><p className={`font-bold ${stockMode === "remove" ? (dl ? "text-red-300" : "text-red-600") : (dl ? "text-emerald-300" : "text-emerald-600")}`}>{afterStockNonSerial}</p></div>
//                                                             <div><p className="text-xs text-gray-500">{stockMode === "remove" ? "Type" : "Total Cost"}</p><p className={`font-bold ${stockMode === "remove" ? (dl ? "text-red-300" : "text-red-600") : (dl ? "text-emerald-300" : "text-emerald-600")}`}>{stockMode === "remove" ? "StockOut" : `$${((productBase.costPrice ?? 0) * stockToAdd).toFixed(2)}`}</p></div>
//                                                         </div>
//                                                     </div>
//                                                 )}
//                                                 {movementTotalCount > 0 && (
//                                                     <div>
//                                                         <label className={labelClass}>
//                                                             Stock Movement History
//                                                             <span className={`ml-2 text-xs font-normal ${dl ? "text-gray-400" : "text-gray-500"}`}>({movementTotalCount} total)</span>
//                                                         </label>
//                                                         <div className={`rounded-lg border overflow-hidden ${dl ? "border-gray-600" : "border-gray-200"}`}>
//                                                             {movementLoading ? (
//                                                                 <div className="flex justify-center py-5"><Spinner size={5} /></div>
//                                                             ) : stockMovements.map(sm => (
//                                                                 <div key={sm.id} className={`flex items-center gap-3 px-3 py-2 border-b last:border-0 ${dl ? "border-gray-700" : "border-gray-100"}`}>
//                                                                     <span className={`text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${sm.type === "StockIn" ? "bg-green-100 text-green-700" : sm.type === "StockOut" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>{sm.type}</span>
//                                                                     <span className={`text-sm font-bold ${dl ? "text-white" : "text-gray-800"}`}>{sm.type === "StockOut" ? "-" : "+"}×{sm.quantity}</span>
//                                                                     <span className="text-xs text-blue-500 font-mono">${sm.price}</span>
//                                                                     <span className="text-xs text-gray-400 font-mono">cost ${sm.costPrice}</span>
//                                                                     {sm.notes && <span className={`text-xs flex-1 truncate ${dl ? "text-gray-400" : "text-gray-500"}`}>{sm.notes}</span>}
//                                                                     <span className="text-[10px] text-gray-400 flex-shrink-0">{new Date(sm.movementDate).toLocaleDateString()}</span>
//                                                                 </div>
//                                                             ))}
//                                                             {movementTotalCount > PAGE_SIZE && (
//                                                                 <div className={`border-t ${dl ? "border-gray-700" : "border-gray-200"}`}>
//                                                                     <PaginationBar page={movementPage} totalPages={totalMovementPages} totalCount={movementTotalCount} loading={movementLoading} onPageChange={handleMovementPageChange} />
//                                                                 </div>
//                                                             )}
//                                                         </div>
//                                                     </div>
//                                                 )}
//                                             </>
//                                         )}
//                                     </>
//                                 )}

//                                 {!productBase && !loadingProduct && isStandalone && (
//                                     <div className={`rounded-xl border-2 border-dashed p-8 text-center ${dl ? "border-gray-600" : "border-gray-300"}`}>
//                                         <p className="text-2xl mb-2">🔍</p>
//                                         <p className={`font-medium ${dl ? "text-gray-300" : "text-gray-600"}`}>Select a product above</p>
//                                         <p className={`text-sm mt-1 ${dl ? "text-gray-500" : "text-gray-400"}`}>Stock details will appear here</p>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>

//                         {/* FOOTER */}
//                         <div className={`px-6 py-3 border-t flex-shrink-0 ${dl ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
//                             <div className="flex justify-end gap-3">
//                                 <button type="button" onClick={handleClose}
//                                     className={`px-6 py-2.5 rounded-lg font-medium transition-all ${dl ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>Cancel</button>
//                                 <button type="submit" disabled={saving || !productBase || !hasChanges}
//                                     className={`px-8 py-2.5 rounded-lg font-medium transition-all shadow-lg text-white disabled:opacity-60 ${saving ? "bg-blue-400 cursor-not-allowed" : (!productBase || !hasChanges) ? "bg-gray-300 cursor-not-allowed text-gray-500" : stockMode === "remove" && !productBase?.isSerialNumber ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700" : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"}`}>
//                                     {saving
//                                         ? <span className="flex items-center gap-2"><Spinner size={5} />Saving…</span>
//                                         : stockMode === "remove" && !productBase?.isSerialNumber ? "Remove Stock" : "Save Stock"}
//                                 </button>
//                             </div>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </>
//     );
// };

// const colorConfig: Record<string, { wrap: string; val: string }> = {
//     blue: { wrap: "bg-blue-900/30", val: "text-blue-300" },
//     red: { wrap: "bg-red-900/30", val: "text-red-300" },
//     green: { wrap: "bg-emerald-900/30", val: "text-emerald-300" },
//     orange: { wrap: "bg-orange-900/30", val: "text-orange-300" },
//     purple: { wrap: "bg-purple-900/30", val: "text-purple-300" },
// };
// const colorConfigLight: Record<string, { wrap: string; val: string }> = {
//     blue: { wrap: "bg-blue-50 border border-blue-200", val: "text-blue-600" },
//     red: { wrap: "bg-red-50 border border-red-200", val: "text-red-600" },
//     green: { wrap: "bg-emerald-50 border border-emerald-200", val: "text-emerald-600" },
//     orange: { wrap: "bg-orange-50 border border-orange-200", val: "text-orange-600" },
//     purple: { wrap: "bg-purple-50 border border-purple-200", val: "text-purple-600" },
// };

// const StatCard = ({ label, value, dl, color }: {
//     label: string; value: number | string; dl: boolean; color?: string;
// }) => {
//     const cfg = color ? (dl ? colorConfig[color] : colorConfigLight[color]) : null;
//     const wrapClass = cfg?.wrap ?? (dl ? "bg-gray-700" : "bg-gray-50 border border-gray-200");
//     const valClass = cfg?.val ?? (dl ? "text-white" : "text-gray-800");
//     return (
//         <div className={`flex-1 rounded-lg px-3 py-2 text-center ${wrapClass}`}>
//             <p className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}>{label}</p>
//             <p className={`text-xl font-bold ${valClass}`}>{value}</p>
//         </div>
//     );
// };

// export default StockForm;






import { useCallback, useEffect, useRef, useState } from "react";
import { useGlobleContextDarklight, useRefreshTable } from "../../AllContext/context";
import XSelectSearch, { SingleValue } from "../../component/XSelectSearch/Xselectsearch";
import { alertError } from "../../HtmlHelper/Alert";
import { AxiosApi } from "../../component/Axios/Axios";

interface SerialNumberInfo {
    id: number; productId: number; serialNo: string;
    status: string; price: number; costPrice: number; createdDate?: string;
}
interface StockMovementInfo {
    id: number; type: string; quantity: number; price: number;
    costPrice: number; notes?: string; movementDate: string;
}
interface ProductSummary {
    productId: number; isSerialNumber: boolean;
    currentStock: number; totalStock: number; sold: number;
    totalCostIn: number; totalCost: number;
    totalBatchesIn: number; totalBatchesOut: number;
    totalStockIn: number; totalStockOut: number; totalCostOut: number;
}
export interface StockFormProduct {
    id: number; name: string; sku?: string; price: number;
    costPrice?: number; stock: number; isSerialNumber: boolean;
    imageProduct?: string;[key: string]: any;
}
interface StockFormProps {
    initialProduct?: StockFormProduct;
    onClose: () => void;
    onSuccess: () => void;
}

type SerialAddMode = "single" | "bulk" | "csv";
type SerialFilter = "all" | "available" | "sold" | "new";
type StockMode = "add" | "remove";

const PAGE_SIZE = 10;

const StockForm = ({ initialProduct, onClose, onSuccess }: StockFormProps) => {
    const { darkLight } = useGlobleContextDarklight();
    const [isAnimating, setIsAnimating] = useState(false);
    const hasInitialized = useRef(false);
    const singleInputRef = useRef<HTMLInputElement>(null);
    const csvInputRef = useRef<HTMLInputElement>(null);
    const [saving, setSaving] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState<SingleValue | null>(null);
    const [productBase, setProductBase] = useState<StockFormProduct | null>(null);
    const [loadingProduct, setLoadingProduct] = useState(false);

    const [summary, setSummary] = useState<ProductSummary | null>(null);
    const [summaryLoading, setSummaryLoading] = useState(false);

    const [existingSerials, setExistingSerials] = useState<SerialNumberInfo[]>([]);
    const [serialTotalCount, setSerialTotalCount] = useState(0);
    const [serialLoading, setSerialLoading] = useState(false);

    const [serialsToAdd, setSerialsToAdd] = useState<string[]>([]);
    const [serialIdsToRemove, setSerialIdsToRemove] = useState<number[]>([]);
    const serialEditsRef = useRef<Map<number, string>>(new Map());
    const [editedSerialIds, setEditedSerialIds] = useState<Set<number>>(new Set());

    const [serialAddMode, setSerialAddMode] = useState<SerialAddMode>("single");
    const [newSerialInput, setNewSerialInput] = useState("");
    const [bulkInput, setBulkInput] = useState("");
    const [bulkError, setBulkError] = useState("");
    const [serialFilter, setSerialFilter] = useState<SerialFilter>("all");
    const [serialSearch, setSerialSearch] = useState("");
    const [serialPage, setSerialPage] = useState(1);

    const [selectedExistingIds, setSelectedExistingIds] = useState<Set<number>>(new Set());
    const [selectedPendingIds, setSelectedPendingIds] = useState<Set<string>>(new Set());

    const [stockMovements, setStockMovements] = useState<StockMovementInfo[]>([]);
    const [movementTotalCount, setMovementTotalCount] = useState(0);
    const [movementPage, setMovementPage] = useState(1);
    const [movementLoading, setMovementLoading] = useState(false);

    const [stockToAdd, setStockToAdd] = useState(0);
    const [stockToRemove, setStockToRemove] = useState(0);
    const [stockNotes, setStockNotes] = useState("");
    const [stockMode, setStockMode] = useState<StockMode>("add");
    const { setRefreshTables } = useRefreshTable();

    const loadSummary = useCallback(async (pid: number) => {
        setSummaryLoading(true);
        try {
            const res = await AxiosApi.get(`Product/${pid}/summary`);
            const data: ProductSummary = res?.data?.data ?? res?.data;
            setSummary(data);
        } catch (err) { console.error(err); }
        finally { setSummaryLoading(false); }
    }, []);

    const loadSerialNumbers = useCallback(async (
        pid: number, page: number, filter: SerialFilter, search: string,
    ) => {
        if (filter === "new") return;
        setSerialLoading(true);
        try {
            const statusParam = filter === "available" ? "&status=Available" : filter === "sold" ? "&status=Sold" : "";
            const searchParam = search.trim() ? `&search=${encodeURIComponent(search.trim())}` : "";
            const res = await AxiosApi.get(`SerialNumber?productId=${pid}&page=${page}&pageSize=${PAGE_SIZE}${statusParam}${searchParam}`);
            const items: SerialNumberInfo[] = res?.data?.data ?? [];
            const total: number = res?.data?.totalCount ?? items.length;
            setExistingSerials(items);
            setSerialTotalCount(total);
            items.forEach(s => { if (!serialEditsRef.current.has(s.id)) serialEditsRef.current.set(s.id, s.serialNo); });
        } catch (err) { console.error(err); }
        finally { setSerialLoading(false); }
    }, []);

    const loadStockMovements = useCallback(async (pid: number, page: number) => {
        setMovementLoading(true);
        try {
            const res = await AxiosApi.get(`StockMovement?productId=${pid}&page=${page}&pageSize=${PAGE_SIZE}`);
            const items: StockMovementInfo[] = res?.data?.data ?? [];
            const total: number = res?.data?.totalCount ?? items.length;
            setStockMovements(items);
            setMovementTotalCount(total);
        } catch (err) { console.error(err); }
        finally { setMovementLoading(false); }
    }, []);

    const initProductData = useCallback(async (product: StockFormProduct) => {
        await loadSummary(product.id);
        if (product.isSerialNumber) await loadSerialNumbers(product.id, 1, "all", "");
        else await loadStockMovements(product.id, 1);
    }, [loadSummary, loadSerialNumbers, loadStockMovements]);

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;
        setTimeout(() => setIsAnimating(true), 10);
        if (initialProduct) {
            setProductBase(initialProduct);
            setSelectedProduct({ id: initialProduct.id, name: initialProduct.name, value: initialProduct.id, data: initialProduct });
            initProductData(initialProduct);
        }
    }, []);

    const handleProductChange = async (value: SingleValue | null) => {
        setSelectedProduct(value);
        resetAllState();
        if (!value) return;
        setLoadingProduct(true);
        try {
            const res = await AxiosApi.get(`Product/${Number(value.id)}`);
            const data: StockFormProduct = res?.data?.data ?? res?.data ?? res;
            if (data) { setProductBase(data); await initProductData(data); }
        } catch (err) { console.error(err); }
        finally { setLoadingProduct(false); }
    };

    const resetAllState = () => {
        setExistingSerials([]); setSerialTotalCount(0);
        setSerialsToAdd([]); setSerialIdsToRemove([]);
        serialEditsRef.current.clear(); setEditedSerialIds(new Set());
        setSelectedExistingIds(new Set()); setSelectedPendingIds(new Set());
        setStockMovements([]); setMovementTotalCount(0); setMovementPage(1);
        setStockToAdd(0); setStockToRemove(0); setStockNotes(""); setStockMode("add");
        setSerialAddMode("single"); setSerialFilter("available");
        setSerialSearch(""); setSerialPage(1);
        setBulkInput(""); setBulkError(""); setProductBase(null); setSummary(null);
    };

    const handleFilterChange = (f: SerialFilter) => {
        setSerialFilter(f); setSerialPage(1); setSerialSearch(""); setSelectedExistingIds(new Set());
        if (productBase && f !== "new") loadSerialNumbers(productBase.id, 1, f, "");
    };
    const handleSearchChange = (v: string) => {
        setSerialSearch(v); setSerialPage(1);
        if (productBase && serialFilter !== "new") loadSerialNumbers(productBase.id, 1, serialFilter, v);
    };
    const handleSerialPageChange = (page: number) => {
        setSerialPage(page); setSelectedExistingIds(new Set());
        if (productBase) loadSerialNumbers(productBase.id, page, serialFilter, serialSearch);
    };
    const handleMovementPageChange = (page: number) => {
        setMovementPage(page);
        if (productBase) loadStockMovements(productBase.id, page);
    };

    const handleAddSerial = () => {
        const t = newSerialInput.trim(); if (!t) return;
        if (serialsToAdd.includes(t)) { alertError("Already in pending list!"); return; }
        setSerialsToAdd(prev => [...prev, t]); setNewSerialInput(""); singleInputRef.current?.focus();
    };
    const handleBulkAdd = () => {
        setBulkError("");
        const lines = bulkInput.split(/[\n,;]+/).map(l => l.trim()).filter(Boolean);
        if (!lines.length) { setBulkError("No serial numbers found."); return; }
        const pendingSet = new Set(serialsToAdd);
        const toAdd: string[] = []; const dupes: string[] = [];
        lines.forEach(sn => (pendingSet.has(sn) || toAdd.includes(sn) ? dupes : toAdd).push(sn));
        if (toAdd.length) setSerialsToAdd(prev => [...prev, ...toAdd]);
        setBulkInput("");
        setBulkError(dupes.length
            ? `Added ${toAdd.length}. Skipped ${dupes.length} duplicate(s): ${dupes.slice(0, 3).join(", ")}${dupes.length > 3 ? "…" : ""}`
            : `Added ${toAdd.length} serial numbers.`);
    };
    const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            const text = ev.target?.result as string;
            const rows = text.split(/\r?\n/).map(r => r.split(",")[0].replace(/"/g, "").trim()).filter(Boolean);
            const lines = rows[0] && !/^[A-Z0-9\-_]+$/i.test(rows[0]) ? rows.slice(1) : rows;
            const pendingSet = new Set(serialsToAdd);
            const toAdd = lines.filter(sn => !pendingSet.has(sn));
            const dupeCount = lines.length - toAdd.length;
            if (toAdd.length) setSerialsToAdd(prev => [...prev, ...toAdd]);
            setBulkError(dupeCount ? `Imported ${toAdd.length}. Skipped ${dupeCount} duplicate(s).` : `Imported ${toAdd.length} serial numbers.`);
        };
        reader.readAsText(file); e.target.value = "";
    };

    const handleMarkRemove = (id: number) => {
        setSerialIdsToRemove(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
        setSelectedExistingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    };
    const handleUpdateSerial = (id: number, value: string) => {
        const original = existingSerials.find(s => s.id === id)?.serialNo ?? serialEditsRef.current.get(id) ?? "";
        serialEditsRef.current.set(id, value);
        setEditedSerialIds(prev => { const n = new Set(prev); if (value !== original) n.add(id); else n.delete(id); return n; });
    };
    const getEditValue = (sn: SerialNumberInfo) =>
        serialEditsRef.current.has(sn.id) ? serialEditsRef.current.get(sn.id)! : sn.serialNo;
    const handleRemovePending = (s: string) => {
        setSerialsToAdd(prev => prev.filter(x => x !== s));
        setSelectedPendingIds(prev => { const n = new Set(prev); n.delete(s); return n; });
    };
    const toggleSelectExisting = (id: number, status: string) => {
        if (status === "Sold") return;
        setSelectedExistingIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    };
    const toggleSelectPending = (sn: string) => {
        setSelectedPendingIds(prev => { const n = new Set(prev); n.has(sn) ? n.delete(sn) : n.add(sn); return n; });
    };
    const handleBulkRemoveSelected = () => {
        if (selectedExistingIds.size > 0) { setSerialIdsToRemove(prev => [...new Set([...prev, ...selectedExistingIds])]); setSelectedExistingIds(new Set()); }
        if (selectedPendingIds.size > 0) { setSerialsToAdd(prev => prev.filter(sn => !selectedPendingIds.has(sn))); setSelectedPendingIds(new Set()); }
    };

    const totalSelected = selectedExistingIds.size + selectedPendingIds.size;
    const countAvailable = summary?.currentStock ?? 0;
    const countSold = summary?.sold ?? 0;
    const countNew = serialsToAdd.length;

    const totalExistingPages = Math.max(1, Math.ceil(serialTotalCount / PAGE_SIZE));
    const totalMovementPages = Math.max(1, Math.ceil(movementTotalCount / PAGE_SIZE));

    const afterStock = countAvailable
        - serialIdsToRemove.filter(id => existingSerials.find(s => s.id === id)?.status === "Available").length
        + countNew;
    const afterStockNonSerial = (productBase?.stock ?? 0) + stockToAdd - stockToRemove;

    const hasChanges = productBase?.isSerialNumber
        ? (serialsToAdd.length > 0 || serialIdsToRemove.length > 0 || editedSerialIds.size > 0)
        : (stockToAdd > 0 || stockToRemove > 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productBase) { alertError("Please select a product!"); return; }
        if (!hasChanges) { alertError("No changes to save!"); return; }
        if (!productBase.isSerialNumber && stockToRemove > productBase.stock) {
            alertError(`Cannot remove ${stockToRemove}. Only ${productBase.stock} in stock!`); return;
        }
        setSaving(true);
        try {
            if (productBase.isSerialNumber) {
                for (const sn of serialsToAdd)
                    await AxiosApi.post("SerialNumber", { productId: productBase.id, serialNo: sn, price: productBase.price, costPrice: productBase.costPrice ?? 0 });
                for (const id of serialIdsToRemove)
                    await AxiosApi.delete(`SerialNumber/${id}`);
                for (const id of editedSerialIds) {
                    const newVal = serialEditsRef.current.get(id);
                    const existing = existingSerials.find(s => s.id === id);
                    if (newVal !== undefined)
                        await AxiosApi.put(`SerialNumber/${id}`, { serialNo: newVal, price: existing?.price ?? productBase.price, costPrice: existing?.costPrice ?? productBase.costPrice ?? 0 });
                }
            } else {
                if (stockToAdd > 0)
                    await AxiosApi.post("StockMovement", { productId: productBase.id, type: "StockIn", quantity: stockToAdd, price: productBase.price, costPrice: productBase.costPrice ?? 0, notes: stockNotes || null });
                if (stockToRemove > 0)
                    await AxiosApi.post("StockMovement", { productId: productBase.id, type: "StockOut", quantity: stockToRemove, price: productBase.price, costPrice: productBase.costPrice ?? 0, notes: stockNotes || null });
            }
            setTimeout(() => handleClose(), 500);
            onSuccess();
            setRefreshTables(new Date());
        } catch (err) { console.error(err); alertError("Failed to save changes. Please try again."); }
        finally { setSaving(false); }
    };

    const handleClose = () => { setIsAnimating(false); setTimeout(() => onClose(), 300); };
    const handleModeSwitch = (mode: StockMode) => { setStockMode(mode); setStockToAdd(0); setStockToRemove(0); setStockNotes(""); };

    const buildPageNumbers = (current: number, total: number): (number | "…")[] => {
        const nums = Array.from({ length: total }, (_, i) => i + 1)
            .filter(p => p === 1 || p === total || Math.abs(p - current) <= 1);
        return nums.reduce<(number | "…")[]>((acc, p, i, arr) => {
            if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…");
            acc.push(p); return acc;
        }, []);
    };

    const dl = darkLight;
    const inputClass = `w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${dl
        ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:bg-gray-700 focus:border-blue-500"
        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-blue-50/30"}`;
    const inputRemoveClass = `w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 ${dl
        ? "bg-gray-700/50 border-red-600 text-gray-100 placeholder-gray-400 focus:bg-gray-700 focus:border-red-500"
        : "bg-white border-red-300 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:bg-red-50/30"}`;
    const labelClass = `block mb-1.5 text-sm font-semibold ${dl ? "text-gray-200" : "text-gray-700"}`;
    const statusColor = (s: string) => s === "Available" ? "bg-green-100 text-green-700" : s === "Sold" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600";

    const filterTabClass = (active: boolean, color?: string) => {
        if (active) {
            if (color === "green") return dl ? "bg-green-900/40 border-green-600 text-green-300" : "bg-green-100 border-green-400 text-green-700";
            if (color === "red") return dl ? "bg-red-900/40 border-red-600 text-red-300" : "bg-red-100 border-red-400 text-red-700";
            if (color === "blue") return dl ? "bg-blue-900/40 border-blue-600 text-blue-300" : "bg-blue-100 border-blue-400 text-blue-700";
            return dl ? "bg-gray-600 border-gray-500 text-white" : "bg-gray-200 border-gray-400 text-gray-800";
        }
        return dl ? "bg-transparent border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300"
            : "bg-transparent border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700";
    };
    const addModeTabClass = (active: boolean) =>
        active ? (dl ? "bg-blue-900/40 border-blue-600 text-blue-300" : "bg-blue-50 border-blue-400 text-blue-700")
            : (dl ? "border-gray-600 text-gray-400 hover:text-gray-300" : "border-gray-300 text-gray-500 hover:text-gray-700");
    const pageBtnClass = (active: boolean) =>
        `min-w-[24px] h-6 px-1 rounded text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed ${active
            ? "bg-blue-500 text-white"
            : dl ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-200 text-gray-600"}`;

    const Spinner = ({ size = 5 }: { size?: number }) => (
        <svg className={`animate-spin h-${size} w-${size} text-blue-500`} viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    );

    const PaginationBar = ({ page, totalPages, totalCount, loading: isLoading, onPageChange }: {
        page: number; totalPages: number; totalCount: number; loading: boolean; onPageChange: (p: number) => void;
    }) => {
        const nums = buildPageNumbers(page, totalPages);
        const start = (page - 1) * PAGE_SIZE + 1;
        const end = Math.min(page * PAGE_SIZE, totalCount);
        return (
            <div className={`flex items-center gap-2 px-3 py-2 text-xs flex-wrap ${dl ? "text-gray-400" : "text-gray-500"}`}>
                {isLoading && <Spinner size={3.5} />}
                <span className="flex-1 whitespace-nowrap">{start}–{end} of {totalCount}</span>
                {totalPages > 1 && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <button type="button" disabled={page === 1 || isLoading} onClick={() => onPageChange(1)} className={pageBtnClass(false)}>«</button>
                        <button type="button" disabled={page === 1 || isLoading} onClick={() => onPageChange(page - 1)} className={pageBtnClass(false)}>‹</button>
                        {nums.map((p, i) => p === "…"
                            ? <span key={`el-${i}`} className={`px-1 ${dl ? "text-gray-500" : "text-gray-400"}`}>…</span>
                            : <button key={p} type="button" disabled={isLoading} onClick={() => onPageChange(p as number)} className={pageBtnClass(page === p)}>{p}</button>
                        )}
                        <button type="button" disabled={page === totalPages || isLoading} onClick={() => onPageChange(page + 1)} className={pageBtnClass(false)}>›</button>
                        <button type="button" disabled={page === totalPages || isLoading} onClick={() => onPageChange(totalPages)} className={pageBtnClass(false)}>»</button>
                    </div>
                )}
            </div>
        );
    };

    const filteredPending = serialSearch.trim()
        ? serialsToAdd.filter(s => s.toLowerCase().includes(serialSearch.toLowerCase()))
        : serialsToAdd;
    const showPending = serialFilter === "all" || serialFilter === "new";
    const showExisting = serialFilter !== "new";
    const isStandalone = !initialProduct;

    return (
        <>
            <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"}`} />
            <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 mt-15 pointer-events-none transition-all duration-300 ${isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                <div className={`rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden pointer-events-auto transform transition-all duration-300
                    ${dl ? "bg-gray-800" : "bg-white"} ${isAnimating ? "translate-y-0" : "translate-y-4"}`}
                    style={{ maxHeight: "calc(100vh - 80px)" }}>

                    {/* ===== HEADER ===== */}
                    <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b flex-shrink-0 ${dl ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                        <div className="flex justify-between items-start gap-3">
                            <div className="min-w-0 flex-1">
                                {productBase ? (
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        {productBase.imageProduct && (
                                            <img src={productBase.imageProduct} alt={productBase.name}
                                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover ring-2 ring-gray-200 dark:ring-gray-600 flex-shrink-0" />
                                        )}
                                        <div className="min-w-0">
                                            <h2 className={`text-base sm:text-xl font-bold leading-tight truncate ${dl ? "text-white" : "text-gray-900"}`}>
                                                {productBase.name}
                                            </h2>
                                            {productBase.sku && (
                                                <p className="text-xs font-mono text-gray-400 tracking-wider uppercase truncate">
                                                    {productBase.sku}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <h2 className={`text-base sm:text-2xl font-bold truncate ${dl ? "text-white" : "text-gray-900"}`}>
                                        Manage Stock
                                    </h2>
                                )}
                            </div>
                            <button onClick={handleClose}
                                className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xl transition-all
                                    ${dl ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}>
                                ×
                            </button>
                        </div>

                        {/* Stats */}
                        {productBase && !loadingProduct && (
                            <div className="flex gap-1.5 sm:gap-2 mt-3 overflow-x-auto pb-1">
                                {summaryLoading ? (
                                    <div className="flex items-center gap-2 py-1">
                                        <Spinner size={4} />
                                        <span className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}>Loading stats…</span>
                                    </div>
                                ) : productBase.isSerialNumber ? (
                                    <>
                                        <StatCard label="Current Stock" shortLabel="Stock" value={summary?.currentStock ?? 0} dl={dl} />
                                        <StatCard label="Total Stock" shortLabel="Total" value={summary?.totalStock ?? 0} dl={dl} />
                                        <StatCard label="Sold" shortLabel="Sold" value={summary?.sold ?? 0} dl={dl} color="red" />
                                        <StatCard label="Total Cost" shortLabel="Cost" value={`$${summary?.totalCost?.toFixed(2)}`} dl={dl} color="orange" />
                                    </>
                                ) : (
                                    <>
                                        <StatCard label="Current Stock" shortLabel="Stock" value={summary?.currentStock ?? 0} dl={dl} />
                                        <StatCard label="Total Stock" shortLabel="Total" value={summary?.totalStock ?? 0} dl={dl} color="green" />
                                        <StatCard label="Sold" shortLabel="Sold" value={summary?.sold ?? 0} dl={dl} color="red" />
                                        <StatCard label="Total Cost" shortLabel="Cost" value={`$${summary?.totalCost?.toFixed(2)}`} dl={dl} color="orange" />
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ===== BODY ===== */}
                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                        <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-5 custom-scrollbar"
                            style={{ scrollbarWidth: "thin", scrollbarColor: dl ? "#4a5568 transparent" : "#cbd5e0 transparent" }}>
                            <style>{`.custom-scrollbar::-webkit-scrollbar{width:6px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:transparent;border-radius:3px}.custom-scrollbar:hover::-webkit-scrollbar-thumb{background:${dl ? "#4a5568" : "#cbd5e0"}}`}</style>
                            <div className="space-y-4">

                                {isStandalone && (
                                    <div>
                                        <label className={labelClass}>Product <span className="text-red-500">*</span></label>
                                        <XSelectSearch value={selectedProduct} onChange={handleProductChange} multiple={false}
                                            placeholder="Select product to manage stock"
                                            selectOption={{ apiEndpoint: "/Product", id: "id", name: "name", value: "id", pageSize: 20, searchParam: "Search" }}
                                            isSearchable={true} />
                                    </div>
                                )}

                                {loadingProduct && <div className="flex justify-center py-8"><Spinner size={8} /></div>}

                                {productBase && !loadingProduct && (
                                    <>
                                        {/* ── SERIALIZED ── */}
                                        {productBase.isSerialNumber && (
                                            <>
                                                <div>
                                                    <label className={labelClass}>Add Serial Numbers</label>
                                                    <div className={`flex gap-1 p-1 rounded-xl mb-3 ${dl ? "bg-gray-700/60" : "bg-gray-100"}`}>
                                                        {(["single", "bulk", "csv"] as SerialAddMode[]).map(m => (
                                                            <button key={m} type="button" onClick={() => { setSerialAddMode(m); setBulkError(""); }}
                                                                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${addModeTabClass(serialAddMode === m)}`}>
                                                                {m === "single" ? "⌨ Single" : m === "bulk" ? "📋 Bulk" : "📁 CSV"}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {serialAddMode === "single" && (
                                                        <div className="flex gap-2">
                                                            <input ref={singleInputRef} type="text" value={newSerialInput} autoFocus
                                                                onChange={e => setNewSerialInput(e.target.value)}
                                                                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddSerial())}
                                                                className={inputClass} placeholder="Type or scan serial — Enter to add" />
                                                            <button type="button" onClick={handleAddSerial}
                                                                className="px-3 sm:px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-colors whitespace-nowrap">
                                                                + Add
                                                            </button>
                                                        </div>
                                                    )}
                                                    {serialAddMode === "bulk" && (
                                                        <div className="space-y-2">
                                                            <textarea value={bulkInput} rows={5}
                                                                onChange={e => { setBulkInput(e.target.value); setBulkError(""); }}
                                                                className={`w-full px-4 py-3 rounded-lg border font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${dl ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500"}`}
                                                                placeholder={"Paste serial numbers — one per line, or comma/semicolon separated:\nSN-A001\nSN-B002"} />
                                                            <div className="flex items-center justify-between gap-2">
                                                                {bulkError
                                                                    ? <p className={`text-xs ${bulkError.startsWith("Added") ? "text-blue-500" : "text-red-500"}`}>{bulkError}</p>
                                                                    : <p className={`text-xs ${dl ? "text-gray-500" : "text-gray-400"}`}>{bulkInput.split(/[\n,;]+/).filter(l => l.trim()).length} lines detected</p>}
                                                                <button type="button" onClick={handleBulkAdd} disabled={!bulkInput.trim()}
                                                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors whitespace-nowrap">
                                                                    Add All
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {serialAddMode === "csv" && (
                                                        <div className="space-y-2">
                                                            <div onClick={() => csvInputRef.current?.click()}
                                                                className={`flex flex-col items-center justify-center gap-2 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ${dl ? "border-gray-600 hover:border-blue-500 hover:bg-blue-900/10" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"}`}>
                                                                <span className="text-3xl">📁</span>
                                                                <p className={`text-sm font-medium ${dl ? "text-gray-300" : "text-gray-600"}`}>Click to upload CSV or TXT file</p>
                                                                <p className={`text-xs ${dl ? "text-gray-500" : "text-gray-400"}`}>First column used — header row auto-skipped</p>
                                                                <input ref={csvInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleCSVImport} />
                                                            </div>
                                                            {bulkError && <p className={`text-xs text-center ${bulkError.startsWith("Imported") ? "text-blue-500" : "text-red-500"}`}>{bulkError}</p>}
                                                        </div>
                                                    )}
                                                </div>

                                                {(countAvailable + countSold > 0 || serialsToAdd.length > 0) ? (
                                                    <div className={`rounded-xl border overflow-hidden ${dl ? "border-gray-600" : "border-gray-200"}`}>
                                                        {/* Filter bar */}
                                                        <div className={`px-3 py-2 border-b flex flex-wrap items-center gap-2 ${dl ? "border-gray-600 bg-gray-800/60" : "border-gray-200 bg-gray-50"}`}>
                                                            <div className="flex gap-1 flex-wrap">
                                                                {([
                                                                    { key: "all", label: `All (${countAvailable + countSold + countNew})`, color: undefined },
                                                                    { key: "available", label: `Avail (${countAvailable})`, color: "green" },
                                                                    { key: "sold", label: `Sold (${countSold})`, color: "red" },
                                                                    ...(countNew > 0 ? [{ key: "new", label: `New (${countNew})`, color: "blue" }] : []),
                                                                ] as { key: SerialFilter; label: string; color?: string }[]).map(tab => (
                                                                    <button key={tab.key} type="button" onClick={() => handleFilterChange(tab.key)}
                                                                        className={`px-2 py-0.5 rounded-full text-xs font-medium border transition-all ${filterTabClass(serialFilter === tab.key, tab.color)}`}>
                                                                        {tab.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                            {serialFilter !== "new" && (
                                                                <input type="text" value={serialSearch} onChange={e => handleSearchChange(e.target.value)} placeholder="Search…"
                                                                    className={`ml-auto text-xs px-2.5 py-1 rounded-lg border w-24 sm:w-32 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${dl ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500" : "bg-white border-gray-300 text-gray-700"}`} />
                                                            )}
                                                        </div>

                                                        {/* Bulk action bar */}
                                                        {totalSelected > 0 && (
                                                            <div className={`flex items-center gap-3 px-3 py-2 border-b ${dl ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"}`}>
                                                                <span className={`text-xs font-semibold ${dl ? "text-red-300" : "text-red-600"}`}>{totalSelected} selected</span>
                                                                <button type="button" onClick={handleBulkRemoveSelected}
                                                                    className="ml-auto px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors">
                                                                    Remove Selected
                                                                </button>
                                                                <button type="button" onClick={() => { setSelectedExistingIds(new Set()); setSelectedPendingIds(new Set()); }}
                                                                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${dl ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}>
                                                                    Clear
                                                                </button>
                                                            </div>
                                                        )}

                                                        {/* Pending serials */}
                                                        {showPending && filteredPending.length > 0 && (
                                                            <>
                                                                <div className={`flex items-center gap-2 px-3 py-1.5 border-b ${dl ? "border-gray-700 bg-green-900/10" : "border-gray-100 bg-green-50/50"}`}>
                                                                    <input type="checkbox" className="w-3.5 h-3.5 rounded cursor-pointer accent-blue-500"
                                                                        checked={filteredPending.length > 0 && filteredPending.every(sn => selectedPendingIds.has(sn))}
                                                                        onChange={e => { if (e.target.checked) setSelectedPendingIds(new Set(filteredPending)); else setSelectedPendingIds(new Set()); }} />
                                                                    <span className={`text-xs font-semibold ${dl ? "text-green-400" : "text-green-600"}`}>✦ {filteredPending.length} pending (unsaved)</span>
                                                                </div>
                                                                {filteredPending.map(sn => {
                                                                    const isChecked = selectedPendingIds.has(sn);
                                                                    return (
                                                                        <div key={`p-${sn}`} className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 border-b transition-all
                                                                            ${dl ? "border-gray-700 bg-green-900/10" : "border-gray-100 bg-green-50/40"}
                                                                            ${isChecked ? (dl ? "bg-blue-900/20" : "bg-blue-50/50") : ""}`}>
                                                                            <input type="checkbox" checked={isChecked} onChange={() => toggleSelectPending(sn)}
                                                                                className="w-3.5 h-3.5 rounded cursor-pointer accent-blue-500 flex-shrink-0" />
                                                                            <span className={`flex-1 text-xs sm:text-sm font-mono truncate px-1 sm:px-2 ${dl ? "text-green-300" : "text-green-700"}`}>{sn}</span>
                                                                            <span className="hidden sm:inline text-[10px] text-gray-400 font-mono whitespace-nowrap">@ ${productBase.price}</span>
                                                                            <span className="text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium flex-shrink-0">New</span>
                                                                            <button type="button" onClick={() => handleRemovePending(sn)}
                                                                                className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-colors">✕</button>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </>
                                                        )}

                                                        {/* Existing serials */}
                                                        {showExisting && (
                                                            <>
                                                                <div className={`flex items-center gap-2 px-3 py-1.5 border-b ${dl ? "border-gray-700 bg-gray-800/40" : "border-gray-100 bg-gray-50"}`}>
                                                                    <input type="checkbox" className="w-3.5 h-3.5 rounded cursor-pointer accent-blue-500"
                                                                        checked={existingSerials.filter(s => s.status !== "Sold").length > 0 && existingSerials.filter(s => s.status !== "Sold").every(s => selectedExistingIds.has(s.id))}
                                                                        onChange={e => {
                                                                            if (e.target.checked) setSelectedExistingIds(prev => new Set([...prev, ...existingSerials.filter(s => s.status !== "Sold").map(s => s.id)]));
                                                                            else setSelectedExistingIds(prev => { const n = new Set(prev); existingSerials.forEach(s => n.delete(s.id)); return n; });
                                                                        }} />
                                                                    <span className={`text-xs ${dl ? "text-gray-500" : "text-gray-400"}`}>Select page</span>
                                                                    <span className={`ml-auto text-xs ${dl ? "text-gray-500" : "text-gray-400"}`}>{serialTotalCount} total</span>
                                                                </div>
                                                                {serialLoading ? (
                                                                    <div className="flex justify-center py-6"><Spinner size={5} /></div>
                                                                ) : existingSerials.length === 0 ? (
                                                                    <div className="py-6 text-center"><p className={`text-sm ${dl ? "text-gray-500" : "text-gray-400"}`}>No serials match this filter</p></div>
                                                                ) : existingSerials.map(sn => {
                                                                    const isRemoving = serialIdsToRemove.includes(sn.id);
                                                                    const isChecked = selectedExistingIds.has(sn.id);
                                                                    const isEdited = editedSerialIds.has(sn.id);
                                                                    const editVal = getEditValue(sn);
                                                                    return (
                                                                        <div key={`e-${sn.id}`} className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 border-b last:border-0 transition-all
                                                                            ${dl ? "border-gray-700" : "border-gray-100"}
                                                                            ${isRemoving ? "opacity-40" : ""}
                                                                            ${isChecked && !isRemoving ? (dl ? "bg-blue-900/20" : "bg-blue-50/50") : ""}`}>
                                                                            <input type="checkbox" checked={isChecked} disabled={sn.status === "Sold" || isRemoving}
                                                                                onChange={() => toggleSelectExisting(sn.id, sn.status)}
                                                                                className="w-3.5 h-3.5 rounded cursor-pointer accent-blue-500 disabled:cursor-not-allowed flex-shrink-0" />
                                                                            <input type="text" value={editVal} disabled={isRemoving}
                                                                                onChange={e => handleUpdateSerial(sn.id, e.target.value)}
                                                                                className={`flex-1 min-w-0 text-xs sm:text-sm font-mono px-1.5 sm:px-2 py-1 rounded border focus:outline-none transition-all
                                                                                    ${isEdited
                                                                                        ? (dl ? "border-amber-500 bg-amber-900/20 text-amber-200" : "border-amber-400 bg-amber-50 text-amber-800")
                                                                                        : (dl ? "bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500" : "bg-white border-gray-200 text-gray-700 focus:border-blue-500")
                                                                                    } disabled:cursor-not-allowed`} />
                                                                            {isEdited && <span className="hidden sm:inline text-[10px] text-amber-500 font-bold whitespace-nowrap">edited</span>}
                                                                            <span className="text-[10px] text-gray-400 font-mono whitespace-nowrap flex-shrink-0">${sn.price}</span>
                                                                            <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColor(sn.status)}`}>
                                                                                <span className="sm:hidden">{sn.status === "Available" ? "Avail" : sn.status}</span>
                                                                                <span className="hidden sm:inline">{sn.status}</span>
                                                                            </span>
                                                                            <button type="button" onClick={() => handleMarkRemove(sn.id)} disabled={sn.status === "Sold"}
                                                                                title={sn.status === "Sold" ? "Cannot remove sold item" : isRemoving ? "Undo" : "Remove"}
                                                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-colors
                                                                                    ${sn.status === "Sold" ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                                                        : isRemoving ? "bg-gray-400 hover:bg-gray-500 text-white"
                                                                                            : "bg-red-500 hover:bg-red-600 text-white"}`}>
                                                                                {isRemoving ? "↩" : "✕"}
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </>
                                                        )}

                                                        {/* Summary footer */}
                                                        <div className={`border-t ${dl ? "border-gray-700 bg-gray-800/40" : "border-gray-200 bg-gray-50"}`}>
                                                            <div className="flex flex-wrap gap-x-3 gap-y-1 px-3 pt-2 text-xs">
                                                                {serialsToAdd.length > 0 && <span className="text-green-500">+{serialsToAdd.length} new</span>}
                                                                {serialIdsToRemove.length > 0 && <span className="text-red-500">−{serialIdsToRemove.length} removing</span>}
                                                                {editedSerialIds.size > 0 && <span className="text-amber-500">{editedSerialIds.size} edited</span>}
                                                                <span className={dl ? "text-gray-500" : "text-gray-400"}>
                                                                    After save: <strong className={dl ? "text-white" : "text-gray-700"}>{afterStock}</strong> available
                                                                </span>
                                                            </div>
                                                            {showExisting && serialTotalCount > PAGE_SIZE && (
                                                                <PaginationBar page={serialPage} totalPages={totalExistingPages} totalCount={serialTotalCount} loading={serialLoading} onPageChange={handleSerialPageChange} />
                                                            )}
                                                            {(!showExisting || serialTotalCount <= PAGE_SIZE) && <div className="pb-2" />}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className={`rounded-xl border-2 border-dashed p-8 text-center ${dl ? "border-gray-600" : "border-gray-300"}`}>
                                                        <p className="text-2xl mb-2">📦</p>
                                                        <p className={`font-medium ${dl ? "text-gray-300" : "text-gray-600"}`}>No serial numbers yet</p>
                                                        <p className={`text-sm mt-1 ${dl ? "text-gray-500" : "text-gray-400"}`}>Use the input above to add serials</p>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {/* ── NON-SERIALIZED ── */}
                                        {!productBase.isSerialNumber && (
                                            <>
                                                <div className={`flex gap-1 p-1 rounded-xl ${dl ? "bg-gray-700/60" : "bg-gray-100"}`}>
                                                    <button type="button" onClick={() => handleModeSwitch("add")}
                                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${stockMode === "add" ? "bg-emerald-500 text-white shadow-md" : dl ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}>
                                                        ➕ Add Stock
                                                    </button>
                                                    <button type="button" onClick={() => handleModeSwitch("remove")}
                                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${stockMode === "remove" ? "bg-red-500 text-white shadow-md" : dl ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}>
                                                        ➖ Remove Stock
                                                    </button>
                                                </div>
                                                {stockMode === "remove" && (
                                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${dl ? "bg-red-900/20 border border-red-700 text-red-300" : "bg-red-50 border border-red-200 text-red-600"}`}>
                                                        <span>⚠️</span><span>Max removable: <strong>{productBase.stock}</strong> units</span>
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className={labelClass}>{stockMode === "remove" ? "Qty to Remove" : "Qty to Add"} <span className="text-red-500">*</span></label>
                                                        {stockMode === "add"
                                                            ? <input type="number" min={0} value={stockToAdd}
                                                                onChange={e => setStockToAdd(Math.max(0, Number(e.target.value)))}
                                                                className={inputClass} placeholder="Enter quantity" />
                                                            : <input type="number" min={0} max={productBase.stock} value={stockToRemove}
                                                                onChange={e => setStockToRemove(Math.max(0, Math.min(productBase.stock, Number(e.target.value))))}
                                                                className={inputRemoveClass} placeholder="Enter quantity" />}
                                                    </div>
                                                    <div>
                                                        <label className={labelClass}>Notes</label>
                                                        <input type="text" value={stockNotes} onChange={e => setStockNotes(e.target.value)}
                                                            className={inputClass}
                                                            placeholder={stockMode === "remove" ? "e.g. Damaged…" : "e.g. Restock…"} />
                                                    </div>
                                                </div>
                                                {(stockToAdd > 0 || stockToRemove > 0) && (
                                                    <div className={`rounded-lg px-4 py-3 ${stockMode === "remove"
                                                        ? (dl ? "bg-red-900/20 border border-red-700" : "bg-red-50 border border-red-200")
                                                        : (dl ? "bg-emerald-900/20 border border-emerald-700" : "bg-emerald-50 border border-emerald-200")}`}>
                                                        <p className={`text-xs font-bold uppercase mb-2 ${stockMode === "remove" ? (dl ? "text-red-400" : "text-red-600") : (dl ? "text-emerald-400" : "text-emerald-600")}`}>
                                                            {stockMode === "remove" ? "🔻 Stock Removal Preview" : "📌 Price Snapshot Preview"}
                                                        </p>
                                                        <div className="grid grid-cols-3 gap-3 text-center">
                                                            <div>
                                                                <p className="text-xs text-gray-500">Qty</p>
                                                                <p className={`font-bold ${dl ? "text-white" : "text-gray-800"}`}>{stockMode === "remove" ? `-${stockToRemove}` : `+${stockToAdd}`}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500">After Save</p>
                                                                <p className={`font-bold ${stockMode === "remove" ? (dl ? "text-red-300" : "text-red-600") : (dl ? "text-emerald-300" : "text-emerald-600")}`}>{afterStockNonSerial}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500">{stockMode === "remove" ? "Type" : "Total Cost"}</p>
                                                                <p className={`font-bold ${stockMode === "remove" ? (dl ? "text-red-300" : "text-red-600") : (dl ? "text-emerald-300" : "text-emerald-600")}`}>
                                                                    {stockMode === "remove" ? "StockOut" : `$${((productBase.costPrice ?? 0) * stockToAdd).toFixed(2)}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {movementTotalCount > 0 && (
                                                    <div>
                                                        <label className={labelClass}>
                                                            Stock Movement History
                                                            <span className={`ml-2 text-xs font-normal ${dl ? "text-gray-400" : "text-gray-500"}`}>({movementTotalCount} total)</span>
                                                        </label>
                                                        <div className={`rounded-lg border overflow-hidden ${dl ? "border-gray-600" : "border-gray-200"}`}>
                                                            {movementLoading ? (
                                                                <div className="flex justify-center py-5"><Spinner size={5} /></div>
                                                            ) : stockMovements.map(sm => (
                                                                <div key={sm.id} className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 border-b last:border-0 ${dl ? "border-gray-700" : "border-gray-100"}`}>
                                                                    <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${sm.type === "StockIn" ? "bg-green-100 text-green-700" : sm.type === "StockOut" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>{sm.type}</span>
                                                                    <span className={`text-xs sm:text-sm font-bold ${dl ? "text-white" : "text-gray-800"}`}>{sm.type === "StockOut" ? "-" : "+"}×{sm.quantity}</span>
                                                                    <span className="text-xs text-blue-500 font-mono">${sm.price}</span>
                                                                    <span className="hidden sm:inline text-xs text-gray-400 font-mono">cost ${sm.costPrice}</span>
                                                                    {sm.notes && <span className={`text-xs flex-1 truncate ${dl ? "text-gray-400" : "text-gray-500"}`}>{sm.notes}</span>}
                                                                    <span className="text-[10px] text-gray-400 flex-shrink-0">{new Date(sm.movementDate).toLocaleDateString()}</span>
                                                                </div>
                                                            ))}
                                                            {movementTotalCount > PAGE_SIZE && (
                                                                <div className={`border-t ${dl ? "border-gray-700" : "border-gray-200"}`}>
                                                                    <PaginationBar page={movementPage} totalPages={totalMovementPages} totalCount={movementTotalCount} loading={movementLoading} onPageChange={handleMovementPageChange} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}

                                {!productBase && !loadingProduct && isStandalone && (
                                    <div className={`rounded-xl border-2 border-dashed p-8 text-center ${dl ? "border-gray-600" : "border-gray-300"}`}>
                                        <p className="text-2xl mb-2">🔍</p>
                                        <p className={`font-medium ${dl ? "text-gray-300" : "text-gray-600"}`}>Select a product above</p>
                                        <p className={`text-sm mt-1 ${dl ? "text-gray-500" : "text-gray-400"}`}>Stock details will appear here</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ===== FOOTER ===== */}
                        <div className={`px-4 sm:px-6 py-3 border-t flex-shrink-0 ${dl ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
                            <div className="flex justify-end gap-2 sm:gap-3">
                                <button type="button" onClick={handleClose}
                                    className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-all
                                        ${dl ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving || !productBase || !hasChanges}
                                    className={`px-5 sm:px-8 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg text-white disabled:opacity-60
                                        ${saving
                                            ? "bg-blue-400 cursor-not-allowed"
                                            : (!productBase || !hasChanges)
                                                ? "bg-gray-300 cursor-not-allowed text-gray-500"
                                                : stockMode === "remove" && !productBase?.isSerialNumber
                                                    ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                                                    : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                                        }`}>
                                    {saving ? (
                                        <span className="flex items-center gap-2">
                                            <Spinner size={4} />
                                            <span className="hidden sm:inline">Saving…</span>
                                            <span className="sm:hidden">…</span>
                                        </span>
                                    ) : (
                                        <>
                                            <span className="hidden sm:inline">
                                                {stockMode === "remove" && !productBase?.isSerialNumber ? "Remove Stock" : "Save Stock"}
                                            </span>
                                            <span className="sm:hidden">
                                                {stockMode === "remove" && !productBase?.isSerialNumber ? "Remove" : "Save"}
                                            </span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

/* ─── Color configs ─────────────────────────────────────────────────────────── */
const colorConfig: Record<string, { wrap: string; val: string }> = {
    blue: { wrap: "bg-blue-900/30", val: "text-blue-300" },
    red: { wrap: "bg-red-900/30", val: "text-red-300" },
    green: { wrap: "bg-emerald-900/30", val: "text-emerald-300" },
    orange: { wrap: "bg-orange-900/30", val: "text-orange-300" },
    purple: { wrap: "bg-purple-900/30", val: "text-purple-300" },
};
const colorConfigLight: Record<string, { wrap: string; val: string }> = {
    blue: { wrap: "bg-blue-50 border border-blue-200", val: "text-blue-600" },
    red: { wrap: "bg-red-50 border border-red-200", val: "text-red-600" },
    green: { wrap: "bg-emerald-50 border border-emerald-200", val: "text-emerald-600" },
    orange: { wrap: "bg-orange-50 border border-orange-200", val: "text-orange-600" },
    purple: { wrap: "bg-purple-50 border border-purple-200", val: "text-purple-600" },
};

const StatCard = ({ label, shortLabel, value, dl, color }: {
    label: string; shortLabel?: string; value: number | string; dl: boolean; color?: string;
}) => {
    const cfg = color ? (dl ? colorConfig[color] : colorConfigLight[color]) : null;
    const wrapClass = cfg?.wrap ?? (dl ? "bg-gray-700" : "bg-gray-50 border border-gray-200");
    const valClass = cfg?.val ?? (dl ? "text-white" : "text-gray-800");

    // Shorten long currency values on mobile
    const formatValue = (v: number | string) => {
        if (typeof v === "string" && v.startsWith("$")) {
            const num = parseFloat(v.replace(/[$,]/g, ""));
            if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
            if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
        }
        return v;
    };

    return (
        <div className={`flex-1 rounded-lg px-2 sm:px-3 py-2 text-center min-w-0 flex-shrink-0 ${wrapClass}`}>
            <p className={`text-[10px] sm:text-xs truncate ${dl ? "text-gray-400" : "text-gray-500"}`}>
                <span className="sm:hidden">{shortLabel ?? label}</span>
                <span className="hidden sm:inline">{label}</span>
            </p>
            {/* Mobile: shortened value */}
            <p className={`text-sm font-bold sm:hidden truncate ${valClass}`}>
                {formatValue(value)}
            </p>
            {/* Desktop: full value */}
            <p className={`text-xl font-bold hidden sm:block ${valClass}`}>
                {value}
            </p>
        </div>
    );
};

export default StockForm;