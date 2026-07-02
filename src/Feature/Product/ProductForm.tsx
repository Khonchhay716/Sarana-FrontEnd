import { useEffect, useRef, useState } from "react";
import { useGlobleContextDarklight } from "../../AllContext/context";
import { HookIntergrateAPI } from "../../component/HookintagrateAPI/HookintegarteApi";
import { alertError } from "../../HtmlHelper/Alert";
import { useFileUpload } from "../../component/FileUpload/Usefileupload";
import ComponentPermission from "../../component/ProtextRoute/ComponentPermissions";
import XSelectSearch, { SingleValue } from "../../component/XSelectSearch/Xselectsearch";

const PRODUCT_TYPE = {
    Serialized: 0,
    NonSerialized: 1,
};

interface ProductFormData {
    id?: number;
    code: string;
    name: string;
    description: string;
    imageUrl: string;
    productType: number;
    unit: string;
    costPrice: number | string;
    salePrice: number | string;
    lowStockThreshold: number | "";
    categoryId: number | null;
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
    const [alertEnabled, setAlertEnabled] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<SingleValue | null>(null);

    const {
        preview: imagePreview,
        uploading: uploadingImage,
        selecting,
        hasNewFile,
        isRemoved,
        handleFileChange: handleInputChangeImage,
        handleRemove: handleRemoveImage,
        deleteImage,
        uploadFile,
        setExistingUrl,
    } = useFileUpload();

    const [formData, setFormData] = useState<ProductFormData>({
        code: "",
        name: "",
        description: "",
        imageUrl: "",
        productType: PRODUCT_TYPE.NonSerialized,
        unit: "",
        costPrice: "",
        salePrice: "",
        lowStockThreshold: "",
        categoryId: null,
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
        const data: any = await GetDatabyID("Products", productId);
        if (data) {
            setFormData({
                id: data.id,
                code: data.code || "",
                name: data.name || "",
                description: data.description || "",
                imageUrl: data.imageUrl || "",
                productType: data.productType ?? PRODUCT_TYPE.NonSerialized,
                unit: data.unit || "",
                // no input / 0 => show empty field
                costPrice: data.costPrice ? data.costPrice : "",
                salePrice: data.salePrice ? data.salePrice : "",
                lowStockThreshold: data.lowStockThreshold ? data.lowStockThreshold : "",
                categoryId: data.categoryId ?? null,
            });
            if ((data.lowStockThreshold ?? 0) > 0) setAlertEnabled(true);
            if (data.imageUrl) setExistingUrl(data.imageUrl);

            if (data.categoryId) {
                setSelectedCategory({
                    id: data.categoryId,
                    name: data.categoryName || "Unknown Category",
                    value: data.categoryId,
                    data: null
                });
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === "number") {
            // allow empty box, don't force 0 while typing
            setFormData(prev => ({
                ...prev,
                [name]: value === "" ? "" : parseFloat(value),
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCategoryChange = (val: SingleValue | null) => {
        setSelectedCategory(val);
        setFormData(prev => ({
            ...prev,
            categoryId: val ? (val.id as number) : null
        }));
    };

    const handleClose = () => { setIsAnimating(false); setTimeout(() => onClose(), 300); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) { alertError("Product name is required!"); return; }
        if (!formData.code.trim()) { alertError("Code is required!"); return; }
        if (formData.salePrice === "" || formData.salePrice === null) { alertError("Sale price is required!"); return; }
        if (formData.costPrice === "" || formData.costPrice === null) { alertError("Cost price is required!"); return; }
        if (Number(formData.salePrice) < 0) { alertError("Sale price cannot be negative!"); return; }
        if (Number(formData.costPrice) < 0) { alertError("Cost price cannot be negative!"); return; }
        if (alertEnabled && (formData.lowStockThreshold === "" || Number(formData.lowStockThreshold) <= 0)) {
            alertError("Low stock threshold must be greater than 0 when alert is enabled!"); return;
        }

        let imageUrl = formData.imageUrl;

        if (isRemoved) {
            await deleteImage(formData.imageUrl);
            imageUrl = "";
        } else if (hasNewFile) {
            await deleteImage(formData.imageUrl);
            const uploadedUrl = await uploadFile();
            if (!uploadedUrl) return;
            imageUrl = uploadedUrl;
        }

        const payload = {
            code: formData.code,
            name: formData.name,
            description: formData.description,
            imageUrl: imageUrl,
            productType: formData.productType,
            unit: formData.unit,
            costPrice: formData.costPrice === "" ? 0 : Number(formData.costPrice),
            salePrice: formData.salePrice === "" ? 0 : Number(formData.salePrice),
            lowStockThreshold: alertEnabled ? (formData.lowStockThreshold === "" ? 0 : Number(formData.lowStockThreshold)) : 0,
            categoryId: formData.categoryId,
        };

        if (productId) {
            await updateData("Products", productId, payload as any, () => setTimeout(() => handleClose(), 500), undefined,
                async () => {
                    if (hasNewFile && imageUrl) await deleteImage(imageUrl);
                }
            );
        } else {
            await createData("Products", payload as any, () => setTimeout(() => handleClose(), 500), false,
                async () => {
                    if (imageUrl) await deleteImage(imageUrl);
                }
            );
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
                    <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b flex-shrink-0 ${dl ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                        <div className="flex justify-between items-start gap-3">
                            <div className="min-w-0">
                                <h2 className={`text-base sm:text-2xl font-bold truncate ${dl ? "text-white" : "text-gray-900"}`}>
                                    {productId ? "Edit Product" : "Add New Product"}
                                </h2>
                                <p className={`text-xs sm:text-sm mt-0.5 truncate ${dl ? "text-gray-400" : "text-gray-500"}`}>
                                    {productId ? "Update product information" : "Fill in the details to create a new product"}
                                </p>
                            </div>
                            <button onClick={handleClose}
                                className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xl transition-all
                                ${dl ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}>
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
                                            {imagePreview && !isRemoved && (
                                                <button type="button" onClick={handleRemoveImage}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg text-xs">✕</button>
                                            )}
                                            {selecting && (
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
                                            <input type="file" onChange={handleInputChangeImage}
                                                className={inputClass} accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                                disabled={selecting} />
                                        </div>
                                    </div>
                                </div>

                                {/* Name */}
                                <div>
                                    <label className={labelClass}>Product Name <span className="text-red-500">*</span></label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                                        className={inputClass} placeholder="Enter product name" />
                                </div>

                                {/* Code */}
                                <div>
                                    <label className={labelClass}>Code <span className="text-red-500">*</span></label>
                                    <input type="text" name="code" value={formData.code} onChange={handleInputChange}
                                        className={inputClass} placeholder="Enter product code" />
                                </div>
                                <div>
                                    <label className={labelClass}>Category</label>
                                    <XSelectSearch
                                        value={selectedCategory}
                                        onChange={handleCategoryChange}
                                        placeholder="Select category..."
                                        selectOption={{
                                            apiEndpoint: "Category",
                                            id: "id",
                                            name: "name"
                                        }}
                                    />
                                </div>

                                {/* Unit */}
                                <div>
                                    <label className={labelClass}>Unit</label>
                                    <input type="text" name="unit" value={formData.unit} onChange={handleInputChange}
                                        className={inputClass} placeholder="e.g. pcs, box, kg" />
                                </div>

                                {/* Sale Price */}
                                <div>
                                    <label className={labelClass}>Sale Price ($) <span className="text-red-500">*</span></label>
                                    <input type="number" name="salePrice" value={formData.salePrice} onChange={handleInputChange}
                                        className={inputClass} placeholder="0.00" min={0} step="0.01" />
                                </div>

                                {/* Cost Price */}
                                <div>
                                    <label className={labelClass}>Cost Price ($) <span className="text-red-500">*</span></label>
                                    <input type="number" name="costPrice" value={formData.costPrice} onChange={handleInputChange}
                                        className={inputClass} placeholder="0.00" min={0} step="0.01" />
                                </div>

                                {/* Stock Tracking Type */}
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Stock Tracking Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, productType: PRODUCT_TYPE.NonSerialized }))}
                                            disabled={!!productId}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${formData.productType === PRODUCT_TYPE.NonSerialized
                                                ? "border-purple-500 bg-purple-50"
                                                : dl ? "border-gray-600 bg-gray-700/30" : "border-gray-200 bg-gray-50"
                                                } ${!!productId ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-purple-400"}`}>
                                            <div>
                                                <p className={`text-sm font-bold ${formData.productType === PRODUCT_TYPE.NonSerialized ? "text-purple-600" : dl ? "text-gray-300" : "text-gray-700"}`}>Non-Serialized</p>
                                                <p className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}>Track by quantity</p>
                                            </div>
                                            {formData.productType === PRODUCT_TYPE.NonSerialized && <span className="ml-auto w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">✓</span>}
                                        </button>
                                        <button type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, productType: PRODUCT_TYPE.Serialized }))}
                                            disabled={!!productId}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${formData.productType === PRODUCT_TYPE.Serialized
                                                ? "border-blue-500 bg-blue-50"
                                                : dl ? "border-gray-600 bg-gray-700/30" : "border-gray-200 bg-gray-50"
                                                } ${!!productId ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-blue-400"}`}>
                                            <div>
                                                <p className={`text-sm font-bold ${formData.productType === PRODUCT_TYPE.Serialized ? "text-blue-600" : dl ? "text-gray-300" : "text-gray-700"}`}>Serialized</p>
                                                <p className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}>Track by serial number</p>
                                            </div>
                                            {formData.productType === PRODUCT_TYPE.Serialized && <span className="ml-auto w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">✓</span>}
                                        </button>
                                    </div>
                                    {!!productId && (
                                        <p className={`text-xs mt-2 ${dl ? "text-gray-500" : "text-gray-400"}`}>
                                            Tracking type cannot be changed after product is created.
                                        </p>
                                    )}
                                </div>

                                {/* Low Stock Alert */}
                                <div className="md:col-span-2">
                                    <div className={`rounded-xl border-2 transition-all p-4 ${alertEnabled
                                        ? dl ? "border-amber-600 bg-amber-900/10" : "border-amber-400 bg-amber-50"
                                        : dl ? "border-gray-600 bg-gray-700/20" : "border-gray-200 bg-gray-50"}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
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
                                                onClick={() => { setAlertEnabled(v => !v); if (alertEnabled) setFormData(prev => ({ ...prev, lowStockThreshold: "" })); }}
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
                                                    <input type="number" name="lowStockThreshold" value={formData.lowStockThreshold} onChange={handleInputChange}
                                                        min={1} placeholder="e.g. 5"
                                                        className={`w-full px-4 py-2.5 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${dl
                                                            ? "bg-gray-700/50 border-amber-600 text-gray-100 focus:border-amber-500"
                                                            : "bg-white border-amber-400 text-gray-900 focus:border-amber-500 focus:bg-amber-50/30"}`} />
                                                </div>
                                                <div className={`flex-1 text-xs rounded-lg p-3 ${dl ? "bg-amber-900/20 text-amber-300" : "bg-amber-50 text-amber-700"}`}>
                                                    Warning badge appears when stock reaches <strong>{formData.lowStockThreshold || "?"}</strong> units or below.
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
                        <div className={`px-4 sm:px-6 py-3 border-t flex-shrink-0 ${dl ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
                            <div className="flex justify-end gap-2 sm:gap-3">
                                <button type="button" onClick={handleClose}
                                    className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-all
                                        ${dl ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                                    Cancel
                                </button>
                                <ComponentPermission scopes={[productId ? "product:update" : "product:create"]}>
                                    <button type="submit" disabled={loading || uploadingImage}
                                        className={`px-5 sm:px-8 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg
                                        ${loading || uploadingImage
                                                ? "bg-blue-400 cursor-not-allowed"
                                                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                                            } text-white disabled:opacity-50`}>
                                        {loading || uploadingImage ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                <span className="hidden sm:inline">Saving...</span>
                                                <span className="sm:hidden">...</span>
                                            </span>
                                        ) : (
                                            <>
                                                <span className="hidden sm:inline">{productId ? "Update Product" : "Create Product"}</span>
                                                <span className="sm:hidden">{productId ? "Update" : "Create"}</span>
                                            </>
                                        )}
                                    </button>
                                </ComponentPermission>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default ProductForm;