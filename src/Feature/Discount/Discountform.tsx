import { useEffect, useRef, useState } from "react";
import { useGlobleContextDarklight } from "../../AllContext/context";
import XSelectSearch, { SingleValue } from "../../component/XSelectSearch/Xselectsearch";
import { HookIntergrateAPI } from "../../component/HookintagrateAPI/HookintegarteApi";
import { alertError } from "../../HtmlHelper/Alert";

interface DiscountFormData {
    id?: number;
    name: string;
    description: string;
    type: string;
    value: number;
    minOrderAmount: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    productIds: number[];
}

interface DiscountFormProps {
    discountId?: number;
    onClose: () => void;
}

const DISCOUNT_TYPES = [
    { value: "Percentage", label: "Percentage (%)",  icon: "%", color: "text-blue-600" },
    { value: "FixedAmount", label: "Fixed Amount ($)", icon: "$", color: "text-green-600" },
];

const DiscountForm = ({ discountId, onClose }: DiscountFormProps) => {
    const { darkLight } = useGlobleContextDarklight();
    const { createData, updateData, GetDatabyID, loading } = HookIntergrateAPI<DiscountFormData>();
    const [isAnimating, setIsAnimating] = useState(false);
    const hasInitialized = useRef(false);
    const [isGlobal, setIsGlobal] = useState(true);
    const [selectedProducts, setSelectedProducts] = useState<SingleValue[]>([]);

    const [formData, setFormData] = useState<DiscountFormData>({
        name: "", description: "", type: "Percentage",
        value: 0, minOrderAmount: 0,
        startDate: "", endDate: "",
        isActive: true, productIds: [],
    });

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;
        setTimeout(() => setIsAnimating(true), 10);
        if (discountId) loadData();
    }, [discountId]);

    const loadData = async () => {
        if (!discountId) return;
        const data: any = await GetDatabyID("Discount", discountId);
        if (data) {
            setFormData({
                id: data.id,
                name: data.name || "",
                description: data.description || "",
                type: data.type || "Percentage",
                value: data.value ?? 0,
                minOrderAmount: data.minOrderAmount ?? 0,
                startDate: data.startDate ? data.startDate.substring(0, 10) : "",
                endDate: data.endDate ? data.endDate.substring(0, 10) : "",
                isActive: data.isActive ?? true,
                productIds: data.products?.map((p: any) => p.productId) ?? [],
            });
            setIsGlobal(data.isGlobal ?? true);
            if (data.products?.length > 0) {
                setSelectedProducts(data.products.map((p: any) => ({
                    id: p.productId, name: p.productName,
                    value: p.productId, data: p,
                })));
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === "number" ? parseFloat(value) || 0 : value }));
    };

    const handleProductChange = (values: SingleValue | SingleValue[] | null) => {
        const arr = Array.isArray(values) ? values : values ? [values] : [];
        setSelectedProducts(arr);
        setFormData(prev => ({ ...prev, productIds: arr.map(v => Number(v.id)) }));
    };

    const handleClose = () => { setIsAnimating(false); setTimeout(() => onClose(), 300); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) { alertError("Discount name is required!"); return; }
        if (formData.value <= 0) { alertError("Value must be greater than 0!"); return; }
        if (formData.type === "Percentage" && formData.value > 100) { alertError("Percentage cannot exceed 100!"); return; }
        if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
            alertError("End date must be after start date!"); return;
        }
        if (!isGlobal && formData.productIds.length === 0) {
            alertError("Please select at least one product!"); return;
        }
        const payload = {
            name: formData.name,
            description: formData.description,
            type: formData.type,
            value: formData.value,
            minOrderAmount: formData.minOrderAmount || null,
            startDate: formData.startDate || null,
            endDate: formData.endDate || null,
            isActive: formData.isActive,
            productIds: isGlobal ? [] : formData.productIds,
        };
        if (discountId) {
            await updateData("Discount", discountId, payload as any, () => setTimeout(() => handleClose(), 500));
        } else {
            await createData("Discount", payload as any, () => setTimeout(() => handleClose(), 500));
        }
    };

    const dl = darkLight;
    const isActive = formData.isActive;
    const selectedType = DISCOUNT_TYPES.find(t => t.value === formData.type);

    const inputClass = `w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${dl
        ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:bg-gray-700 focus:border-blue-500"
        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-blue-50/30"}`;
    const labelClass = `block mb-1.5 text-sm font-semibold ${dl ? "text-gray-200" : "text-gray-700"}`;

    return (
        <>
            <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"}`} />
            <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 mt-15 pointer-events-none transition-all duration-300 ${isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                <div className={`rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden pointer-events-auto transform transition-all duration-300
                    ${dl ? "bg-gray-800" : "bg-white"} ${isAnimating ? "translate-y-0" : "translate-y-4"}`}
                    style={{ maxHeight: "calc(100vh - 80px)" }}>

                    {/* Header */}
                    <div className={`px-6 py-4 border-b flex-shrink-0 ${dl ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className={`text-2xl font-bold ${dl ? "text-white" : "text-gray-900"}`}>
                                    {discountId ? "Edit Discount" : "Add New Discount"}
                                </h2>
                                <p className={`text-sm mt-1 ${dl ? "text-gray-400" : "text-gray-500"}`}>
                                    {discountId ? "Update discount information" : "Fill in the details to create a new discount"}
                                </p>
                            </div>
                            <button onClick={handleClose}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xl transition-all ${dl ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}>
                                ×
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                        <div className="overflow-y-auto flex-1 px-6 py-5 custom-scrollbar"
                            style={{ scrollbarWidth: "thin", scrollbarColor: dl ? "#4a5568 transparent" : "#cbd5e0 transparent" }}>
                            <style>{`.custom-scrollbar::-webkit-scrollbar{width:6px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:transparent;border-radius:3px}.custom-scrollbar:hover::-webkit-scrollbar-thumb{background:${dl ? "#4a5568" : "#cbd5e0"}}`}</style>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                {/* Name */}
                                <div className="md:col-span-1">
                                    <label className={labelClass}>Discount Name <span className="text-red-500">*</span></label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                                        className={inputClass} placeholder="e.g. Summer Sale, Weekend Promo" />
                                </div>
                                <div>
                                    <label className={labelClass}>Discount Type <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        {/* prefix icon */}
                                        <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold pointer-events-none ${selectedType?.color}`}>
                                            {selectedType?.icon}
                                        </span>
                                        <select
                                            name="type"
                                            value={formData.type}
                                            onChange={handleInputChange}
                                            className={`${inputClass} pl-8 pr-10 appearance-none cursor-pointer`}>
                                            {DISCOUNT_TYPES.map(t => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                        {/* chevron */}
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg className={`w-4 h-4 ${dl ? "text-gray-400" : "text-gray-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>

                                {/* Value */}
                                <div>
                                    <label className={labelClass}>
                                        Value <span className="text-red-500">*</span>
                                        <span className={`ml-1 text-xs font-normal ${dl ? "text-gray-400" : "text-gray-500"}`}>
                                            {formData.type === "Percentage" ? "(max 100%)" : "($)"}
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm pointer-events-none ${selectedType?.color}`}>
                                            {selectedType?.icon}
                                        </span>
                                        <input type="number" name="value" value={formData.value} onChange={handleInputChange}
                                            className={`${inputClass} pl-8`} placeholder="0"
                                            min={0} max={formData.type === "Percentage" ? 100 : undefined} step="0.01" />
                                    </div>
                                </div>

                                {/* Min Order Amount */}
                                <div>
                                    <label className={labelClass}>Min Order Amount
                                        <span className={`ml-1 text-xs font-normal ${dl ? "text-gray-400" : "text-gray-500"}`}>(optional)</span>
                                    </label>
                                    <div className="relative">
                                        <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm pointer-events-none ${dl ? "text-gray-400" : "text-gray-500"}`}>$</span>
                                        <input type="number" name="minOrderAmount" value={formData.minOrderAmount} onChange={handleInputChange}
                                            className={`${inputClass} pl-8`} placeholder="0.00" min={0} step="0.01" />
                                    </div>
                                </div>

                                {/* Start Date */}
                                <div>
                                    <label className={labelClass}>Start Date
                                        <span className={`ml-1 text-xs font-normal ${dl ? "text-gray-400" : "text-gray-500"}`}>(optional)</span>
                                    </label>
                                    <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className={inputClass} />
                                </div>

                                {/* End Date */}
                                <div>
                                    <label className={labelClass}>End Date
                                        <span className={`ml-1 text-xs font-normal ${dl ? "text-gray-400" : "text-gray-500"}`}>(optional)</span>
                                    </label>
                                    <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className={inputClass} />
                                </div>

                                {/* Status */}
                                <div>
                                    <label className={labelClass}>Status</label>
                                    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 ${
                                        isActive
                                            ? dl ? "border-teal-600 bg-teal-900/20" : "border-teal-400 bg-teal-50"
                                            : dl ? "border-gray-600 bg-gray-700/20" : "border-gray-200 bg-gray-50"}`}>
                                        <div>
                                            <p className={`text-sm font-semibold ${isActive ? dl ? "text-teal-300" : "text-teal-700" : dl ? "text-gray-400" : "text-gray-500"}`}>
                                                {isActive ? "Active" : "Inactive"}
                                            </p>
                                            <p className={`text-xs ${dl ? "text-gray-500" : "text-gray-400"}`}>
                                                {isActive ? "Discount is available" : "Discount is disabled"}
                                            </p>
                                        </div>
                                        <button type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                                            className={`relative w-9 h-5 rounded-full transition-all duration-300 flex-shrink-0 focus:outline-none shadow-inner ${isActive ? "bg-teal-500" : dl ? "bg-gray-600" : "bg-gray-300"}`}>
                                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${isActive ? "left-4" : "left-0.5"}`} />
                                        </button>
                                    </div>
                                </div>

                                {/* Apply To */}
                                <div>
                                    <label className={labelClass}>Apply To</label>
                                    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 ${
                                        isGlobal
                                            ? dl ? "border-purple-600 bg-purple-900/20" : "border-purple-400 bg-purple-50"
                                            : dl ? "border-orange-600 bg-orange-900/20" : "border-orange-400 bg-orange-50"}`}>
                                        <div>
                                            <p className={`text-sm font-semibold ${isGlobal ? dl ? "text-purple-300" : "text-purple-700" : dl ? "text-orange-300" : "text-orange-700"}`}>
                                                {isGlobal ? "🌐 All Products" : "🎯 Specific Products"}
                                            </p>
                                            <p className={`text-xs ${dl ? "text-gray-500" : "text-gray-400"}`}>
                                                {isGlobal ? "Applies to every product" : "Select products below"}
                                            </p>
                                        </div>
                                        <button type="button"
                                            onClick={() => { setIsGlobal(v => !v); setSelectedProducts([]); setFormData(prev => ({ ...prev, productIds: [] })); }}
                                            className={`relative w-9 h-5 rounded-full transition-all duration-300 flex-shrink-0 focus:outline-none shadow-inner ${!isGlobal ? "bg-orange-500" : dl ? "bg-gray-600" : "bg-gray-300"}`}>
                                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${!isGlobal ? "left-4" : "left-0.5"}`} />
                                        </button>
                                    </div>
                                </div>

                                {/* Product selector */}
                                {!isGlobal && (
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>
                                            Select Products <span className="text-red-500">*</span>
                                            {selectedProducts.length > 0 && (
                                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${dl ? "bg-orange-900/30 text-orange-300" : "bg-orange-100 text-orange-700"}`}>
                                                    {selectedProducts.length} selected
                                                </span>
                                            )}
                                        </label>
                                        <XSelectSearch
                                            value={selectedProducts}
                                            onChange={handleProductChange}
                                            multiple={true}
                                            placeholder="Search and select products..."
                                            selectOption={{
                                                apiEndpoint: "Product",
                                                id: "id", name: "name", value: "id",
                                                pageSize: 20, searchParam: "Search",
                                            }}
                                            isSearchable={true}
                                        />
                                        {selectedProducts.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {selectedProducts.map(p => (
                                                    <span key={p.id}
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${dl ? "bg-orange-900/30 text-orange-300 border border-orange-700" : "bg-orange-50 text-orange-700 border border-orange-200"}`}>
                                                        {p.name}
                                                        <button type="button"
                                                            onClick={() => handleProductChange(selectedProducts.filter(x => x.id !== p.id))}
                                                            className="hover:text-red-500 transition-colors">×</button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleInputChange}
                                        className={`${inputClass} resize-none`} placeholder="Enter discount description" rows={3} />
                                </div>

                            </div>
                        </div>

                        {/* Footer */}
                        <div className={`px-6 py-3 border-t flex-shrink-0 ${dl ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={handleClose}
                                    className={`px-6 py-2.5 rounded-lg font-medium transition-all ${dl ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading}
                                    className={`px-8 py-2.5 rounded-lg font-medium transition-all shadow-lg ${loading
                                        ? "bg-blue-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                                    } text-white disabled:opacity-50`}>
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Saving...
                                        </span>
                                    ) : (discountId ? "Update Discount" : "Create Discount")}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default DiscountForm;