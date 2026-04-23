// import { useEffect, useRef, useState } from "react";
// import { useGlobleContextDarklight } from "../../AllContext/context";
// import { HookIntergrateAPI } from "../../component/HookintagrateAPI/HookintegarteApi";
// import { alertError } from "../../HtmlHelper/Alert";
// import { AxiosApi } from "../../component/Axios/Axios";

// interface BranchFormData {
//     id?: number;
//     branchName: string;
//     logo: string;
//     status: string;
//     description: string;
// }

// interface BranchFormProps {
//     branchId?: number;
//     onClose: () => void;
// }

// const BranchForm = ({ branchId, onClose }: BranchFormProps) => {
//     const { darkLight } = useGlobleContextDarklight();
//     const { createData, updateData, GetDatabyID, loading } = HookIntergrateAPI<BranchFormData>();
//     const [isAnimating, setIsAnimating] = useState(false);
//     const hasInitialized = useRef(false);
//     const [logoPreview, setLogoPreview] = useState<string>("");
//     const [uploadingLogo, setUploadingLogo] = useState(false);

//     const [formData, setFormData] = useState<BranchFormData>({
//         branchName: "",
//         logo: "",
//         status: "Active",
//         description: "",
//     });

//     useEffect(() => {
//         if (hasInitialized.current) return;
//         hasInitialized.current = true;
//         setTimeout(() => setIsAnimating(true), 10);
//         if (branchId) loadBranchData();
//     }, [branchId]);

//     const loadBranchData = async () => {
//         if (!branchId) return;
//         const data: any = await GetDatabyID("Branch", branchId);
//         if (data) {
//             setFormData({
//                 id: data.id,
//                 branchName: data.branchName || "",
//                 logo: data.logo || "",
//                 status: data.status || "Active",
//                 description: data.description || "",
//             });
//             if (data.logo) setLogoPreview(data.logo);
//         }
//     };

//     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     // ✅ File upload — same as CategoryForm / ProductForm
//     const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//         try {
//             setUploadingLogo(true);
//             const file = e.target.files?.[0];
//             if (!file) return;
//             const fd = new FormData();
//             fd.append("file", file);
//             const res = await AxiosApi.post("FileStorage/upload", fd, {
//                 headers: { "Content-Type": "multipart/form-data" }
//             });
//             const url = res?.data?.url;
//             setLogoPreview(url);
//             setFormData(prev => ({ ...prev, logo: url }));
//         } catch (error) {
//             console.error("Upload error:", error);
//         } finally {
//             setTimeout(() => setUploadingLogo(false), 500);
//         }
//     };

//     const handleRemoveLogo = () => {
//         setLogoPreview("");
//         setFormData(prev => ({ ...prev, logo: "" }));
//     };

//     const handleClose = () => { setIsAnimating(false); setTimeout(() => onClose(), 300); };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!formData.branchName.trim()) { alertError("Branch name is required!"); return; }
//         const payload = {
//             branchName: formData.branchName,
//             logo: logoPreview || formData.logo,
//             status: formData.status,
//             description: formData.description,
//         };
//         if (branchId) {
//             await updateData("Branch", branchId, payload as any, () => setTimeout(() => handleClose(), 500));
//         } else {
//             await createData("Branch", payload as any, () => setTimeout(() => handleClose(), 500));
//         }
//     };

//     const dl = darkLight;
//     const isActive = formData.status === "Active";

//     const inputClass = `w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${dl
//         ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:bg-gray-700 focus:border-blue-500"
//         : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-blue-50/30"}`;
//     const labelClass = `block mb-1.5 text-sm font-semibold ${dl ? "text-gray-200" : "text-gray-700"}`;

//     return (
//         <>
//             <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"}`} />
//             <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 mt-15 pointer-events-none transition-all duration-300 ${isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
//                 <div className={`rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden pointer-events-auto transform transition-all duration-300
//                     ${dl ? "bg-gray-800" : "bg-white"} ${isAnimating ? "translate-y-0" : "translate-y-4"}`}
//                     style={{ maxHeight: "calc(100vh - 80px)" }}>

//                     {/* Header */}
//                     <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b flex-shrink-0 ${dl ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
//                         <div className="flex justify-between items-start gap-3">
//                             <div className="min-w-0">
//                                 <h2 className={`text-base sm:text-2xl font-bold truncate ${dl ? "text-white" : "text-gray-900"}`}>
//                                     {branchId ? "Edit Branch" : "Add New Branch"}
//                                 </h2>
//                                 <p className={`text-xs sm:text-sm mt-0.5 truncate ${dl ? "text-gray-400" : "text-gray-500"}`}>
//                                     {branchId ? "Update branch information" : "Fill in the details to create a new branch"}
//                                 </p>
//                             </div>
//                             <button onClick={handleClose}
//                                 className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xl transition-all
//                 ${dl ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}>
//                                 ×
//                             </button>
//                         </div>
//                     </div>

//                     <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
//                         <div className="overflow-y-auto flex-1 px-6 py-5 custom-scrollbar"
//                             style={{ scrollbarWidth: "thin", scrollbarColor: dl ? "#4a5568 transparent" : "#cbd5e0 transparent" }}>
//                             <style>{`.custom-scrollbar::-webkit-scrollbar{width:6px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:transparent;border-radius:3px}.custom-scrollbar:hover::-webkit-scrollbar-thumb{background:${dl ? "#4a5568" : "#cbd5e0"}}`}</style>

//                             <div className="flex flex-col gap-5">

//                                 {/* ✅ Logo — file upload (same as Category image) */}
//                                 <div>
//                                     <label className={labelClass}>Logo</label>
//                                     <div className="flex items-start gap-4">
//                                         <div className="relative mt-2 flex-shrink-0">
//                                             <img
//                                                 src={logoPreview || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8MmaS1S0FTclHTMMLicf-O0tOGth44cBGt03HQ4jh3phLijQ_k17nFf4eyrqyxHHkgQwLSzwIViOoi81phleVJoBLZbanBf5QRODj9g&s=10"}
//                                                 alt="Logo preview"
//                                                 className="w-20 h-20 object-cover rounded-xl border"
//                                             />
//                                             {logoPreview && (
//                                                 <button type="button" onClick={handleRemoveLogo}
//                                                     className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg text-xs">
//                                                     ✕
//                                                 </button>
//                                             )}
//                                             {uploadingLogo && (
//                                                 <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
//                                                     <svg className="animate-spin h-7 w-7 text-white" viewBox="0 0 24 24">
//                                                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                                                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                                                     </svg>
//                                                 </div>
//                                             )}
//                                         </div>
//                                         <div className="flex flex-col gap-2 mt-2 flex-1">
//                                             <label className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}>JPEG, PNG, GIF, WEBP • Max 12 MB</label>
//                                             <input type="file" onChange={handleLogoUpload}
//                                                 className={inputClass} accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
//                                                 disabled={uploadingLogo} />
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Branch Name */}
//                                 <div>
//                                     <label className={labelClass}>Branch Name <span className="text-red-500">*</span></label>
//                                     <input type="text" name="branchName" value={formData.branchName} onChange={handleInputChange}
//                                         className={inputClass} placeholder="Enter branch name" />
//                                 </div>

//                                 {/* Status toggle */}
//                                 <div>
//                                     <label className={labelClass}>Status</label>
//                                     <div className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 ${isActive
//                                         ? dl ? "border-teal-600 bg-teal-900/20" : "border-teal-400 bg-teal-50"
//                                         : dl ? "border-gray-600 bg-gray-700/20" : "border-gray-200 bg-gray-50"
//                                         }`}>
//                                         <div>
//                                             <p className={`text-sm font-semibold transition-colors ${isActive ? dl ? "text-teal-300" : "text-teal-700" : dl ? "text-gray-400" : "text-gray-500"
//                                                 }`}>
//                                                 {isActive ? "Active" : "Inactive"}
//                                             </p>
//                                             <p className={`text-xs ${dl ? "text-gray-500" : "text-gray-400"}`}>
//                                                 {isActive ? "Branch is operational" : "Branch is closed"}
//                                             </p>
//                                         </div>
//                                         <button
//                                             type="button"
//                                             onClick={() => setFormData(prev => ({ ...prev, status: isActive ? "Inactive" : "Active" }))}
//                                             className={`relative w-9 h-5 rounded-full transition-all duration-300 flex-shrink-0 focus:outline-none shadow-inner ${isActive ? "bg-teal-500" : dl ? "bg-gray-600" : "bg-gray-300"
//                                                 }`}>
//                                             <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${isActive ? "left-4" : "left-0.5"
//                                                 }`} />
//                                         </button>
//                                     </div>
//                                 </div>

//                                 {/* Description */}
//                                 <div>
//                                     <label className={labelClass}>Description</label>
//                                     <textarea name="description" value={formData.description} onChange={handleInputChange}
//                                         className={`${inputClass} resize-none`} placeholder="Enter branch description" rows={3} />
//                                 </div>

//                             </div>
//                         </div>

//                         {/* Footer */}
//                         <div className={`px-4 sm:px-6 py-3 border-t flex-shrink-0 ${dl ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
//                             <div className="flex justify-end gap-2 sm:gap-3">
//                                 <button type="button" onClick={handleClose}
//                                     className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-all
//                                         ${dl ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
//                                     Cancel
//                                 </button>
//                                 <button type="submit" disabled={loading || uploadingLogo}
//                                     className={`px-5 sm:px-8 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg
//                                         ${loading || uploadingLogo
//                                             ? "bg-blue-400 cursor-not-allowed"
//                                             : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
//                                         } text-white disabled:opacity-50`}>
//                                     {loading ? (
//                                         <span className="flex items-center gap-2">
//                                             <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
//                                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                                             </svg>
//                                             <span className="hidden sm:inline">Saving...</span>
//                                             <span className="sm:hidden">...</span>
//                                         </span>
//                                     ) : (
//                                         <>
//                                             <span className="hidden sm:inline">{branchId ? "Update Branch" : "Create Branch"}</span>
//                                             <span className="sm:hidden">{branchId ? "Update" : "Create"}</span>
//                                         </>
//                                     )}
//                                 </button>
//                             </div>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default BranchForm;

import { useEffect, useRef, useState } from "react";
import { useGlobleContextDarklight } from "../../AllContext/context";
import { HookIntergrateAPI } from "../../component/HookintagrateAPI/HookintegarteApi";
import { alertError } from "../../HtmlHelper/Alert";
import { useFileUpload } from "../../component/FileUpload/Usefileupload";
import { AxiosApi } from "../../component/Axios/Axios";

interface BranchFormData {
    id?: number;
    branchName: string;
    logo: string;
    status: string;
    description: string;
}

interface BranchFormProps {
    branchId?: number;
    onClose: () => void;
}

const BranchForm = ({ branchId, onClose }: BranchFormProps) => {
    const { darkLight } = useGlobleContextDarklight();
    const { createData, updateData, GetDatabyID, loading } = HookIntergrateAPI<BranchFormData>();
    const [isAnimating, setIsAnimating] = useState(false);
    const hasInitialized = useRef(false);

    const {
        preview: logoPreview,
        uploading: uploadingLogo,
        handleFileChange: handleLogoUpload,
        handleRemove: handleRemoveLogo,
        uploadFile,
        setExistingUrl,
        hasNewFile,
        isRemoved, // ✅ User ចុច ✕ លុបរូបភាព
    } = useFileUpload();

    const [formData, setFormData] = useState<BranchFormData>({
        branchName: "",
        logo: "",
        status: "Active",
        description: "",
    });

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;
        setTimeout(() => setIsAnimating(true), 10);
        if (branchId) loadBranchData();
    }, [branchId]);

    const loadBranchData = async () => {
        if (!branchId) return;
        const data: any = await GetDatabyID("Branch", branchId);
        if (data) {
            setFormData({
                id: data.id,
                branchName: data.branchName || "",
                logo: data.logo || "",
                status: data.status || "Active",
                description: data.description || "",
            });
            if (data.logo) setExistingUrl(data.logo);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => onClose(), 300);
    };

    // ✅ Helper: Delete រូបភាពចាស់ (non-blocking)
    const deleteOldImage = async (imageUrl: string) => {
        try {
            await AxiosApi.delete(`FileStorage/delete?fileUrl=${encodeURIComponent(imageUrl)}`);
        } catch (error) {
            console.error("Old image delete failed (non-blocking):", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.branchName.trim()) {
            alertError("Branch name is required!");
            return;
        }

        let logoUrl = formData.logo; // Default: URL ចាស់

        if (isRemoved) {
            // ✅ Case 1: User ចុច ✕ លុបរូបភាព
            // → Delete រូបចាស់ ហើយ ផ្ញើ logo: ""
            if (formData.logo) {
                await deleteOldImage(formData.logo);
            }
            logoUrl = ""; // ✅ ផ្ញើ "" ទៅ API

        } else if (hasNewFile) {
            // ✅ Case 2: User ជ្រើស File ថ្មី
            // → Delete រូបចាស់ ហើយ Upload រូបថ្មី
            if (branchId && formData.logo) {
                await deleteOldImage(formData.logo);
            }
            const uploadedUrl = await uploadFile();
            if (!uploadedUrl) return; // Upload Failed → Stop
            logoUrl = uploadedUrl;

        }
        // ✅ Case 3: User មិនផ្លាស់ប្ដូររូបភាព → logoUrl = formData.logo (URL ចាស់)

        const payload = {
            branchName: formData.branchName,
            logo: logoUrl,
            status: formData.status,
            description: formData.description,
        };

        if (branchId) {
            await updateData("Branch", branchId, payload as any, () =>
                setTimeout(() => handleClose(), 500)
            );
        } else {
            await createData("Branch", payload as any, () =>
                setTimeout(() => handleClose(), 500)
            );
        }
    };

    const dl = darkLight;
    const isActive = formData.status === "Active";

    const inputClass = `w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${dl
        ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:bg-gray-700 focus:border-blue-500"
        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-blue-50/30"}`;
    const labelClass = `block mb-1.5 text-sm font-semibold ${dl ? "text-gray-200" : "text-gray-700"}`;

    return (
        <>
            <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"}`} />
            <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 mt-15 pointer-events-none transition-all duration-300 ${isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                <div className={`rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden pointer-events-auto transform transition-all duration-300
                    ${dl ? "bg-gray-800" : "bg-white"} ${isAnimating ? "translate-y-0" : "translate-y-4"}`}
                    style={{ maxHeight: "calc(100vh - 80px)" }}>

                    {/* Header */}
                    <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b flex-shrink-0 ${dl ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                        <div className="flex justify-between items-start gap-3">
                            <div className="min-w-0">
                                <h2 className={`text-base sm:text-2xl font-bold truncate ${dl ? "text-white" : "text-gray-900"}`}>
                                    {branchId ? "Edit Branch" : "Add New Branch"}
                                </h2>
                                <p className={`text-xs sm:text-sm mt-0.5 truncate ${dl ? "text-gray-400" : "text-gray-500"}`}>
                                    {branchId ? "Update branch information" : "Fill in the details to create a new branch"}
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

                            <div className="flex flex-col gap-5">
                                {/* Logo Upload */}
                                <div>
                                    <label className={labelClass}>Logo</label>
                                    <div className="flex items-start gap-4">
                                        <div className="relative mt-2 flex-shrink-0">
                                            <img
                                                src={logoPreview || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8MmaS1S0FTclHTMMLicf-O0tOGth44cBGt03HQ4jh3phLijQ_k17nFf4eyrqyxHHkgQwLSzwIViOoi81phleVJoBLZbanBf5QRODj9g&s=10"}
                                                alt="Logo preview"
                                                className="w-20 h-20 object-cover rounded-xl border"
                                            />
                                            {/* ✅ បង្ហាញ ✕ button តែពេល មានរូបភាព ហើយ មិនទាន់លុប */}
                                            {logoPreview && !isRemoved && (
                                                <button type="button" onClick={handleRemoveLogo}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg text-xs">
                                                    ✕
                                                </button>
                                            )}
                                            {uploadingLogo && (
                                                <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                                                    <svg className="animate-spin h-7 w-7 text-white" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2 mt-2 flex-1">
                                            <label className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}>
                                                JPEG, PNG, GIF, WEBP • Max 12 MB
                                            </label>
                                            <input type="file" onChange={handleLogoUpload}
                                                className={inputClass}
                                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                                disabled={uploadingLogo} />
                                        </div>
                                    </div>
                                </div>

                                {/* Branch Name */}
                                <div>
                                    <label className={labelClass}>Branch Name <span className="text-red-500">*</span></label>
                                    <input type="text" name="branchName" value={formData.branchName}
                                        onChange={handleInputChange} className={inputClass} placeholder="Enter branch name" />
                                </div>

                                {/* Status Toggle */}
                                <div>
                                    <label className={labelClass}>Status</label>
                                    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 ${isActive
                                        ? dl ? "border-teal-600 bg-teal-900/20" : "border-teal-400 bg-teal-50"
                                        : dl ? "border-gray-600 bg-gray-700/20" : "border-gray-200 bg-gray-50"}`}>
                                        <div>
                                            <p className={`text-sm font-semibold transition-colors ${isActive
                                                ? dl ? "text-teal-300" : "text-teal-700"
                                                : dl ? "text-gray-400" : "text-gray-500"}`}>
                                                {isActive ? "Active" : "Inactive"}
                                            </p>
                                            <p className={`text-xs ${dl ? "text-gray-500" : "text-gray-400"}`}>
                                                {isActive ? "Branch is operational" : "Branch is closed"}
                                            </p>
                                        </div>
                                        <button type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, status: isActive ? "Inactive" : "Active" }))}
                                            className={`relative w-9 h-5 rounded-full transition-all duration-300 flex-shrink-0 focus:outline-none shadow-inner ${isActive ? "bg-teal-500" : dl ? "bg-gray-600" : "bg-gray-300"}`}>
                                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${isActive ? "left-4" : "left-0.5"}`} />
                                        </button>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className={labelClass}>Description</label>
                                    <textarea name="description" value={formData.description}
                                        onChange={handleInputChange} className={`${inputClass} resize-none`}
                                        placeholder="Enter branch description" rows={3} />
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
                                <button type="submit" disabled={loading || uploadingLogo}
                                    className={`px-5 sm:px-8 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg
                                        ${loading || uploadingLogo
                                            ? "bg-blue-400 cursor-not-allowed"
                                            : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                                        } text-white disabled:opacity-50`}>
                                    {loading || uploadingLogo ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span className="hidden sm:inline">{uploadingLogo ? "Uploading..." : "Saving..."}</span>
                                            <span className="sm:hidden">...</span>
                                        </span>
                                    ) : (
                                        <>
                                            <span className="hidden sm:inline">{branchId ? "Update Branch" : "Create Branch"}</span>
                                            <span className="sm:hidden">{branchId ? "Update" : "Create"}</span>
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

export default BranchForm;