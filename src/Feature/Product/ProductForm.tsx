import { useEffect, useRef, useState } from "react";
import { useGlobleContextDarklight } from "../../AllContext/context";
import XSelectSearch, { SingleValue } from "../../component/XSelectSearch/Xselectsearch";
import { HookIntergrateAPI } from "../../component/HookintagrateAPI/HookintegarteApi";
import { alertError } from "../../HtmlHelper/Alert";
import { AxiosApi } from "../../component/Axios/Axios";

interface ProductFormData {
    id?: number;
    name: string;
    description: string;
    sku: string;
    barcode: string;
    price: number;
    costPrice: number;
    taxRate: number;
    categoryId: number | null;
    branchId: number | null;
    imageProduct: string;
    isSerialNumber: boolean;
    minStock: number;
    ram: string;
    storage: string;
}

interface ProductFormProps {
    productId?: number;
    onClose: () => void;
}

const ProductForm = ({ productId, onClose }: ProductFormProps) => {
    const { darkLight } = useGlobleContextDarklight();
    const { createData, updateData, GetDatabyID, loading } = HookIntergrateAPI<ProductFormData>();
    const [isAnimating, setIsAnimating] = useState(false);
    const hasInitialized = useRef(false);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [uploadingImage, setUploadingImage] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<SingleValue | null>(null);
    const [selectedBranch, setSelectedBranch] = useState<SingleValue | null>(null);
    const [alertEnabled, setAlertEnabled] = useState(false);

    const [formData, setFormData] = useState<ProductFormData>({
        name: "",
        description: "",
        sku: "",
        barcode: "",
        price: 0,
        costPrice: 0,
        taxRate: 0,
        categoryId: null,
        branchId: null,
        imageProduct: "",
        isSerialNumber: false,
        minStock: 0,
        ram: "",
        storage: "",
    });

    const dl = darkLight;
    const inputClass = `w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${dl
        ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:bg-gray-700 focus:border-blue-500"
        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-blue-50/30"}`;
    const labelClass = `block mb-1.5 text-sm font-semibold ${dl ? "text-gray-200" : "text-gray-700"}`;

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;
        setTimeout(() => setIsAnimating(true), 10);
        if (productId) loadProductData();
    }, [productId]);

    const loadProductData = async () => {
        if (!productId) return;
        const data: any = await GetDatabyID("Product", productId);
        if (data) {
            setFormData({
                id: data.id,
                name: data.name || "",
                description: data.description || "",
                sku: data.sku || "",
                barcode: data.barcode || "",
                price: data.price ?? 0,
                costPrice: data.costPrice ?? 0,
                taxRate: data.taxRate ?? 0,
                categoryId: data.categoryId ?? null,
                branchId: data.branchId ?? null,
                imageProduct: data.imageProduct || "",
                isSerialNumber: data.isSerialNumber ?? false,
                minStock: data.minStock ?? 0,
                ram: data.ram || "",           // ✅
                storage: data.storage || "",   // ✅
            });
            if ((data.minStock ?? 0) > 0) setAlertEnabled(true);
            if (data.imageProduct) setImagePreview(data.imageProduct);
            if (data.category)
                setSelectedCategory({ id: data.categoryId, name: data.category.name, value: data.categoryId, data: data.category });
            if (data.branch)
                setSelectedBranch({ id: data.branchId, name: data.branch.name, value: data.branchId, data: data.branch });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === "number" ? parseFloat(value) || 0 : value }));
    };

    const handleCategoryChange = (value: SingleValue | null) => {
        setSelectedCategory(value);
        setFormData(prev => ({ ...prev, categoryId: value ? Number(value.id) : null }));
    };

    const handleBranchChange = (value: SingleValue | null) => {
        setSelectedBranch(value);
        setFormData(prev => ({ ...prev, branchId: value ? Number(value.id) : null }));
    };

    const handleInputChangeImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploadingImage(true);
            const file = e.target.files?.[0];
            if (!file) return;
            const fd = new FormData();
            fd.append("file", file);
            const res = await AxiosApi.post("FileStorage/upload", fd, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            const url = res?.data?.url;
            setImagePreview(url);
            setFormData(prev => ({ ...prev, imageProduct: url }));
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setTimeout(() => setUploadingImage(false), 500);
        }
    };

    const handleRemoveImage = () => {
        setImagePreview("");
        setFormData(prev => ({ ...prev, imageProduct: "" }));
    };

    const handleClose = () => { setIsAnimating(false); setTimeout(() => onClose(), 300); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) { alertError("Product name is required!"); return; }
        if (!formData.sku.trim()) { alertError("SKU is required!"); return; }
        if (!formData.categoryId) { alertError("Category is required!"); return; }
        if (formData.price < 0) { alertError("Price cannot be negative!"); return; }
        if (alertEnabled && formData.minStock <= 0) {
            alertError("Low stock threshold must be greater than 0 when alert is enabled!"); return;
        }

        const payload = {
            name: formData.name,
            description: formData.description,
            sku: formData.sku,
            barcode: formData.barcode,
            price: formData.price,
            costPrice: formData.costPrice,
            taxRate: formData.taxRate,
            categoryId: formData.categoryId,
            branchId: formData.branchId,
            imageProduct: imagePreview,
            isSerialNumber: formData.isSerialNumber,
            minStock: alertEnabled ? formData.minStock : 0,
            ram: formData.isSerialNumber ? (formData.ram || null) : null,
            storage: formData.isSerialNumber ? (formData.storage || null) : null,
        };

        if (productId) {
            await updateData("Product", productId, payload as any, () => setTimeout(() => handleClose(), 500));
        } else {
            await createData("Product", payload as any, () => setTimeout(() => handleClose(), 500));
        }
    };

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
                                    {productId ? "Edit Product" : "Add New Product"}
                                </h2>
                                <p className={`text-sm mt-1 ${dl ? "text-gray-400" : "text-gray-500"}`}>
                                    {productId ? "Update product information" : "Fill in the details to create a new product"}
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

                                {/* Image */}
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Product Image</label>
                                    <div className="flex items-start gap-4">
                                        <div className="relative mt-2 flex-shrink-0">
                                            <img src={imagePreview || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8MmaS1S0FTclHTMMLicf-O0tOGth44cBGt03HQ4jh3phLijQ_k17nFf4eyrqyxHHkgQwLSzwIViOoi81phleVJoBLZbanBf5QRODj9g&s=10"}
                                                alt="Preview" className="w-24 h-24 object-cover rounded-lg border" />
                                            {imagePreview && (
                                                <button type="button" onClick={handleRemoveImage}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg text-xs">✕</button>
                                            )}
                                            {uploadingImage && (
                                                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                                    <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2 mt-2 flex-1">
                                            <span className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}>JPEG, PNG, GIF, WEBP • Max 12 MB</span>
                                            <input type="file" name="imageProduct" onChange={handleInputChangeImage}
                                                className={inputClass} accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                                disabled={uploadingImage} />
                                        </div>
                                    </div>
                                </div>

                                {/* Name */}
                                <div>
                                    <label className={labelClass}>Product Name <span className="text-red-500">*</span></label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                                        className={inputClass} placeholder="Enter product name" />
                                </div>

                                {/* SKU */}
                                <div>
                                    <label className={labelClass}>SKU <span className="text-red-500">*</span></label>
                                    <input type="text" name="sku" value={formData.sku} onChange={handleInputChange}
                                        className={inputClass} placeholder="Enter SKU" />
                                </div>

                                {/* Barcode */}
                                <div>
                                    <label className={labelClass}>Barcode</label>
                                    <input type="text" name="barcode" value={formData.barcode} onChange={handleInputChange}
                                        className={inputClass} placeholder="Enter barcode" />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className={labelClass}>Category <span className="text-red-500">*</span></label>
                                    <XSelectSearch value={selectedCategory} onChange={handleCategoryChange} multiple={false}
                                        placeholder="Select category"
                                        selectOption={{ apiEndpoint: "Category/lookup", id: "id", name: "name", value: "id", pageSize: 20, searchParam: "Search" }}
                                        isSearchable={true} />
                                </div>

                                {/* Branch */}
                                <div>
                                    <label className={labelClass}>Branch</label>
                                    <XSelectSearch value={selectedBranch} onChange={handleBranchChange} multiple={false}
                                        placeholder="Select branch (optional)"
                                        selectOption={{ apiEndpoint: "Branch/lookup", id: "id", name: "branchName", value: "id", pageSize: 20, searchParam: "Search" }} />
                                </div>

                                {/* Sale Price */}
                                <div>
                                    <label className={labelClass}>Sale Price ($) <span className="text-red-500">*</span></label>
                                    <input type="number" name="price" value={formData.price} onChange={handleInputChange}
                                        className={inputClass} placeholder="0.00" min={0} step="0.01" />
                                </div>

                                {/* Cost Price */}
                                <div>
                                    <label className={labelClass}>Cost Price ($)</label>
                                    <input type="number" name="costPrice" value={formData.costPrice} onChange={handleInputChange}
                                        className={inputClass} placeholder="0.00" min={0} step="0.01" />
                                </div>

                                {/* Tax Rate */}
                                <div>
                                    <label className={labelClass}>Tax Rate (%)</label>
                                    <input type="number" name="taxRate" value={formData.taxRate} onChange={handleInputChange}
                                        className={inputClass} placeholder="0" min={0} step="0.01" />
                                </div>

                                {/* Stock Tracking Type */}
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Stock Tracking Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, isSerialNumber: false, ram: "", storage: "" }))}
                                            disabled={!!productId}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${!formData.isSerialNumber
                                                ? "border-purple-500 bg-purple-50"
                                                : dl ? "border-gray-600 bg-gray-700/30" : "border-gray-200 bg-gray-50"
                                                } ${!!productId ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-purple-400"}`}>
                                            <div>
                                                <p className={`text-sm font-bold ${!formData.isSerialNumber ? "text-purple-600" : dl ? "text-gray-300" : "text-gray-700"}`}>Non-Serialized</p>
                                                <p className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}>Track by quantity</p>
                                            </div>
                                            {!formData.isSerialNumber && <span className="ml-auto w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">✓</span>}
                                        </button>
                                        <button type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, isSerialNumber: true }))}
                                            disabled={!!productId}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${formData.isSerialNumber
                                                ? "border-blue-500 bg-blue-50"
                                                : dl ? "border-gray-600 bg-gray-700/30" : "border-gray-200 bg-gray-50"
                                                } ${!!productId ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-blue-400"}`}>
                                            <div>
                                                <p className={`text-sm font-bold ${formData.isSerialNumber ? "text-blue-600" : dl ? "text-gray-300" : "text-gray-700"}`}>Serialized</p>
                                                <p className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}>Track by serial number</p>
                                            </div>
                                            {formData.isSerialNumber && <span className="ml-auto w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">✓</span>}
                                        </button>
                                    </div>
                                    {!!productId && (
                                        <p className={`text-xs mt-2 ${dl ? "text-gray-500" : "text-gray-400"}`}>
                                            Tracking type cannot be changed after product is created.
                                        </p>
                                    )}
                                </div>

                                {/* RAM + Storage — only show when Serialized */}
                                {formData.isSerialNumber && (
                                    <div className="md:col-span-2">
                                        <div className={`rounded-xl border-2 p-4 transition-all ${dl ? "border-blue-700 bg-blue-900/10" : "border-blue-200 bg-blue-50/50"}`}>
                                            <div className="grid grid-cols-2 gap-4">
                                                {/* RAM */}
                                                <div>
                                                    <label className={`block mb-1.5 text-sm font-semibold ${dl ? "text-blue-300" : "text-blue-700"}`}>
                                                        RAM
                                                        <span className={`ml-1 text-xs font-normal ${dl ? "text-gray-500" : "text-gray-400"}`}>(optional)</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="ram"
                                                        value={formData.ram}
                                                        onChange={handleInputChange}
                                                        className={inputClass}
                                                        placeholder="e.g. 8GB, 12GB, 16GB"
                                                    />
                                                </div>

                                                {/* Storage */}
                                                <div>
                                                    <label className={`block mb-1.5 text-sm font-semibold ${dl ? "text-blue-300" : "text-blue-700"}`}>
                                                        Storage
                                                        <span className={`ml-1 text-xs font-normal ${dl ? "text-gray-500" : "text-gray-400"}`}>(optional)</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="storage"
                                                        value={formData.storage}
                                                        onChange={handleInputChange}
                                                        className={inputClass}
                                                        placeholder="e.g. 128GB, 256GB, 1TB"
                                                    />
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                )}

                                {/* Low Stock Alert */}
                                <div className="md:col-span-2">
                                    <div className={`rounded-xl border-2 transition-all p-4 ${alertEnabled
                                        ? dl ? "border-amber-600 bg-amber-900/10" : "border-amber-400 bg-amber-50"
                                        : dl ? "border-gray-600 bg-gray-700/20" : "border-gray-200 bg-gray-50"}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">🔔</span>
                                                <div>
                                                    <p className={`text-sm font-bold ${alertEnabled ? dl ? "text-amber-300" : "text-amber-700" : dl ? "text-gray-300" : "text-gray-700"}`}>
                                                        Low Stock Alert
                                                    </p>
                                                    <p className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}>
                                                        Show warning badge when stock falls to or below the threshold
                                                    </p>
                                                </div>
                                            </div>
                                            <button type="button"
                                                onClick={() => { setAlertEnabled(v => !v); if (alertEnabled) setFormData(prev => ({ ...prev, minStock: 0 })); }}
                                                className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${alertEnabled ? "bg-amber-500" : dl ? "bg-gray-600" : "bg-gray-300"}`}>
                                                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${alertEnabled ? "left-5" : "left-0.5"}`} />
                                            </button>
                                        </div>
                                        {alertEnabled && (
                                            <div className="mt-4 flex items-center gap-3">
                                                <div className="flex-1">
                                                    <label className={`text-xs font-semibold mb-1 block ${dl ? "text-amber-300" : "text-amber-700"}`}>
                                                        Alert when stock ≤
                                                    </label>
                                                    <input type="number" name="minStock" value={formData.minStock} onChange={handleInputChange}
                                                        min={1} placeholder="e.g. 5"
                                                        className={`w-full px-4 py-2.5 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${dl
                                                            ? "bg-gray-700/50 border-amber-600 text-gray-100 focus:border-amber-500"
                                                            : "bg-white border-amber-400 text-gray-900 focus:border-amber-500 focus:bg-amber-50/30"}`} />
                                                </div>
                                                <div className={`flex-1 text-xs rounded-lg p-3 ${dl ? "bg-amber-900/20 text-amber-300" : "bg-amber-50 text-amber-700"}`}>
                                                    ⚠️ Warning badge appears when stock reaches <strong>{formData.minStock || "?"}</strong> units or below.
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleInputChange}
                                        className={`${inputClass} resize-none`} placeholder="Enter product description" rows={3} />
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
                                <button type="submit" disabled={loading || uploadingImage}
                                    className={`px-8 py-2.5 rounded-lg font-medium transition-all shadow-lg ${loading || uploadingImage
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
                                    ) : (productId ? "Update Product" : "Create Product")}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default ProductForm;