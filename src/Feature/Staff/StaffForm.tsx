// import { useEffect, useRef, useState } from "react";
// import { useGlobleContextDarklight } from "../../AllContext/context";
// import { HookIntergrateAPI } from "../../component/HookintagrateAPI/HookintegarteApi";
// import { alertError } from "../../HtmlHelper/Alert";
// import { AxiosApi } from "../../component/Axios/Axios";

// interface StaffFormData {
//     id?: number;
//     firstName: string;
//     lastName: string;
//     imageProfile: string;
//     phoneNumber: string;
//     position: string;
//     salary: number | string;
//     status: boolean;
// }

// interface StaffFormProps {
//     staffId?: number;
//     onClose: () => void;
// }

// const StaffForm = ({ staffId, onClose }: StaffFormProps) => {
//     const { darkLight } = useGlobleContextDarklight();
//     const { createData, updateData, GetDatabyID, loading } = HookIntergrateAPI<StaffFormData>();
//     const [isAnimating, setIsAnimating] = useState(false);
//     const hasInitialized = useRef(false);
//     const [imagePreview, setImagePreview] = useState<string>("");
//     const [uploadingImage, setUploadingImage] = useState(false);

//     const [formData, setFormData] = useState<StaffFormData>({
//         firstName: "",
//         lastName: "",
//         imageProfile: "",
//         phoneNumber: "",
//         position: "",
//         salary: "",
//         status: true,
//     });

//     const dl = darkLight;
//     const inputClass = `w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
//         dl
//             ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:bg-gray-700 focus:border-blue-500"
//             : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-blue-50/30"
//     }`;
//     const labelClass = `block mb-1.5 text-sm font-semibold ${dl ? "text-gray-200" : "text-gray-700"}`;

//     useEffect(() => {
//         if (hasInitialized.current) return;
//         hasInitialized.current = true;
//         setTimeout(() => setIsAnimating(true), 10);
//         if (staffId) loadStaffData();
//     }, [staffId]);

//     const loadStaffData = async () => {
//         if (!staffId) return;
//         const data: any = await GetDatabyID("Staff", staffId);
//         if (data) {
//             setFormData({
//                 id: data.id,
//                 firstName: data.firstName || "",
//                 lastName: data.lastName || "",
//                 imageProfile: data.imageProfile || "",
//                 phoneNumber: data.phoneNumber || "",
//                 position: data.position || "",
//                 salary: data.salary ?? "",
//                 status: data.status ?? true,
//             });
//             if (data.imageProfile) setImagePreview(data.imageProfile);
//         }
//     };

//     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     const handleInputChangeImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
//         try {
//             setUploadingImage(true);
//             const file = e.target.files?.[0];
//             if (!file) return;
//             const fd = new FormData();
//             fd.append("file", file);
//             const res = await AxiosApi.post("FileStorage/upload", fd, {
//                 headers: { "Content-Type": "multipart/form-data" },
//             });
//             const url = res?.data?.url;
//             setImagePreview(url);
//             setFormData(prev => ({ ...prev, imageProfile: url }));
//         } catch (error) {
//             console.error("Upload error:", error);
//         } finally {
//             setTimeout(() => setUploadingImage(false), 500);
//         }
//     };

//     const handleRemoveImage = () => {
//         setImagePreview("");
//         setFormData(prev => ({ ...prev, imageProfile: "" }));
//     };

//     const handleClose = () => {
//         setIsAnimating(false);
//         setTimeout(() => onClose(), 300);
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!formData.firstName.trim()) { alertError("First name is required!"); return; }
//         if (!formData.lastName.trim()) { alertError("Last name is required!"); return; }
//         if (!formData.phoneNumber.trim()) { alertError("Phone number is required!"); return; }
//         if (!formData.position.trim()) { alertError("Position is required!"); return; }

//         const payload = {
//             firstName: formData.firstName,
//             lastName: formData.lastName,
//             imageProfile: imagePreview || formData.imageProfile,
//             phoneNumber: formData.phoneNumber,
//             position: formData.position,
//             salary: formData.salary === "" ? 0 : Number(formData.salary),
//             status: formData.status,
//         };

//         if (staffId) {
//             await updateData("Staff", staffId, payload as any, () => setTimeout(() => handleClose(), 500));
//         } else {
//             await createData("Staff", payload as any, () => setTimeout(() => handleClose(), 500));
//         }
//     };

//     return (
//         <>
//             <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"}`} />
//             <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 mt-15 pointer-events-none transition-all duration-300 ${isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
//                 <div
//                     className={`rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden pointer-events-auto transform transition-all duration-300
//                     ${dl ? "bg-gray-800" : "bg-white"} ${isAnimating ? "translate-y-0" : "translate-y-4"}`}
//                     style={{ maxHeight: "calc(100vh - 80px)" }}
//                 >
//                     {/* Header */}
//                     <div className={`px-6 py-4 border-b flex-shrink-0 ${dl ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
//                         <div className="flex justify-between items-start">
//                             <div>
//                                 <h2 className={`text-2xl font-bold ${dl ? "text-white" : "text-gray-900"}`}>
//                                     {staffId ? "Edit Staff" : "Add New Staff"}
//                                 </h2>
//                                 <p className={`text-sm mt-1 ${dl ? "text-gray-400" : "text-gray-500"}`}>
//                                     {staffId ? "Update staff information" : "Fill in the details to create a new staff member"}
//                                 </p>
//                             </div>
//                             <button
//                                 onClick={handleClose}
//                                 className={`w-8 h-8 rounded-full flex items-center justify-center text-xl transition-all ${dl ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}
//                             >
//                                 ×
//                             </button>
//                         </div>
//                     </div>

//                     <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
//                         <div
//                             className="overflow-y-auto flex-1 px-6 py-5 custom-scrollbar"
//                             style={{ scrollbarWidth: "thin", scrollbarColor: dl ? "#4a5568 transparent" : "#cbd5e0 transparent" }}
//                         >
//                             <style>{`.custom-scrollbar::-webkit-scrollbar{width:6px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:transparent;border-radius:3px}.custom-scrollbar:hover::-webkit-scrollbar-thumb{background:${dl ? "#4a5568" : "#cbd5e0"}}`}</style>

//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

//                                 {/* Profile Image */}
//                                 <div className="md:col-span-2">
//                                     <label className={labelClass}>Profile Image</label>
//                                     <div className="flex items-start gap-4">
//                                         <div className="relative mt-2 flex-shrink-0">
//                                             <img
//                                                 src={imagePreview || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8MmaS1S0FTclHTMMLicf-O0tOGth44cBGt03HQ4jh3phLijQ_k17nFf4eyrqyxHHkgQwLSzwIViOoi81phleVJoBLZbanBf5QRODj9g&s=10"}
//                                                 alt="Preview"
//                                                 className="w-20 h-20 object-cover rounded-full border-2"
//                                             />
//                                             {imagePreview && (
//                                                 <button
//                                                     type="button"
//                                                     onClick={handleRemoveImage}
//                                                     className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg text-xs"
//                                                 >
//                                                     ✕
//                                                 </button>
//                                             )}
//                                             {uploadingImage && (
//                                                 <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
//                                                     <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
//                                                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                                                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                                                     </svg>
//                                                 </div>
//                                             )}
//                                         </div>
//                                         <div className="flex flex-col gap-2 mt-2 flex-1">
//                                             <span className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}>JPEG, PNG, GIF, WEBP • Max 12 MB</span>
//                                             <input
//                                                 type="file"
//                                                 name="imageProfile"
//                                                 onChange={handleInputChangeImage}
//                                                 className={inputClass}
//                                                 accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
//                                                 disabled={uploadingImage}
//                                             />
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* First Name */}
//                                 <div>
//                                     <label className={labelClass}>First Name <span className="text-red-500">*</span></label>
//                                     <input
//                                         type="text"
//                                         name="firstName"
//                                         value={formData.firstName}
//                                         onChange={handleInputChange}
//                                         className={inputClass}
//                                         placeholder="Enter first name"
//                                     />
//                                 </div>

//                                 {/* Last Name */}
//                                 <div>
//                                     <label className={labelClass}>Last Name <span className="text-red-500">*</span></label>
//                                     <input
//                                         type="text"
//                                         name="lastName"
//                                         value={formData.lastName}
//                                         onChange={handleInputChange}
//                                         className={inputClass}
//                                         placeholder="Enter last name"
//                                     />
//                                 </div>

//                                 {/* Phone Number */}
//                                 <div>
//                                     <label className={labelClass}>Phone Number <span className="text-red-500">*</span></label>
//                                     <input
//                                         type="text"
//                                         name="phoneNumber"
//                                         value={formData.phoneNumber}
//                                         onChange={handleInputChange}
//                                         className={inputClass}
//                                         placeholder="Enter phone number"
//                                     />
//                                 </div>

//                                 {/* Position */}
//                                 <div>
//                                     <label className={labelClass}>Position <span className="text-red-500">*</span></label>
//                                     <input
//                                         type="text"
//                                         name="position"
//                                         value={formData.position}
//                                         onChange={handleInputChange}
//                                         className={inputClass}
//                                         placeholder="e.g. Manager, Cashier"
//                                     />
//                                 </div>

//                                 {/* Salary */}
//                                 <div className="md:col-span-2">
//                                     <label className={labelClass}>Salary</label>
//                                     <div className="relative">
//                                         <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold ${dl ? "text-gray-400" : "text-gray-500"}`}>$</span>
//                                         <input
//                                             type="number"
//                                             name="salary"
//                                             value={formData.salary}
//                                             onChange={handleInputChange}
//                                             className={`${inputClass} pl-7`}
//                                             placeholder="0.00"
//                                             min="0"
//                                             step="0.01"
//                                         />
//                                     </div>
//                                 </div>

//                                 {/* Status */}
//                                 <div className="md:col-span-2">
//                                     <div className={`rounded-xl border-2 transition-all p-4 ${
//                                         formData.status
//                                             ? dl ? "border-green-600 bg-green-900/10" : "border-green-400 bg-green-50"
//                                             : dl ? "border-gray-600 bg-gray-700/20" : "border-gray-200 bg-gray-50"
//                                     }`}>
//                                         <div className="flex items-center justify-between">
//                                             <div className="flex items-center gap-3">
//                                                 <span className="text-xl">{formData.status ? "✅" : "⛔"}</span>
//                                                 <div>
//                                                     <p className={`text-sm font-bold ${formData.status ? dl ? "text-green-300" : "text-green-700" : dl ? "text-gray-300" : "text-gray-700"}`}>
//                                                         Staff Status
//                                                     </p>
//                                                     <p className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}>
//                                                         {formData.status ? "Staff member is currently active" : "Staff member is inactive"}
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                             <button
//                                                 type="button"
//                                                 onClick={() => setFormData(prev => ({ ...prev, status: !prev.status }))}
//                                                 className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${formData.status ? "bg-green-500" : dl ? "bg-gray-600" : "bg-gray-300"}`}
//                                             >
//                                                 <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${formData.status ? "left-5" : "left-0.5"}`} />
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </div>

//                             </div>
//                         </div>

//                         {/* Footer */}
//                         <div className={`px-6 py-3 border-t flex-shrink-0 ${dl ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
//                             <div className="flex justify-end gap-3">
//                                 <button
//                                     type="button"
//                                     onClick={handleClose}
//                                     className={`px-6 py-2.5 rounded-lg font-medium transition-all ${dl ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     disabled={loading || uploadingImage}
//                                     className={`px-8 py-2.5 rounded-lg font-medium transition-all shadow-lg ${
//                                         loading || uploadingImage
//                                             ? "bg-blue-400 cursor-not-allowed"
//                                             : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
//                                     } text-white disabled:opacity-50`}
//                                 >
//                                     {loading ? (
//                                         <span className="flex items-center gap-2">
//                                             <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
//                                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                                             </svg>
//                                             Saving...
//                                         </span>
//                                     ) : staffId ? "Update Staff" : "Create Staff"}
//                                 </button>
//                             </div>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default StaffForm;




import { useEffect, useRef, useState } from "react";
import { useGlobleContextDarklight } from "../../AllContext/context";
import { HookIntergrateAPI } from "../../component/HookintagrateAPI/HookintegarteApi";
import { alertError } from "../../HtmlHelper/Alert";
import { AxiosApi } from "../../component/Axios/Axios";
import XSelectSearch, { SingleValue } from "../../component/XSelectSearch/Xselectsearch";

interface StaffFormData {
    id?: number;
    firstName: string;
    lastName: string;
    imageProfile: string;
    phoneNumber: string;
    position: string;
    salary: number | string;
    status: boolean;
    supervisorId: number | null;
}

interface StaffFormProps {
    staffId?: number;
    onClose: () => void;
}

const StaffForm = ({ staffId, onClose }: StaffFormProps) => {
    const { darkLight } = useGlobleContextDarklight();
    const { createData, updateData, GetDatabyID, loading } = HookIntergrateAPI<StaffFormData>();
    const [isAnimating, setIsAnimating] = useState(false);
    const hasInitialized = useRef(false);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [uploadingImage, setUploadingImage] = useState(false);
    const [selectedSupervisor, setSelectedSupervisor] = useState<SingleValue | null>(null);

    const [formData, setFormData] = useState<StaffFormData>({
        firstName: "",
        lastName: "",
        imageProfile: "",
        phoneNumber: "",
        position: "",
        salary: "",
        status: true,
        supervisorId: null,
    });

    const dl = darkLight;
    const inputClass = `w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${dl
        ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:bg-gray-700 focus:border-blue-500"
        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-blue-50/30"
        }`;
    const labelClass = `block mb-1.5 text-sm font-semibold ${dl ? "text-gray-200" : "text-gray-700"}`;

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;
        setTimeout(() => setIsAnimating(true), 10);
        if (staffId) loadStaffData();
    }, [staffId]);

    const loadStaffData = async () => {
        if (!staffId) return;
        const data: any = await GetDatabyID("Staff", staffId);
        if (data) {
            setFormData({
                id: data.id,
                firstName: data.firstName || "",
                lastName: data.lastName || "",
                imageProfile: data.imageProfile || "",
                phoneNumber: data.phoneNumber || "",
                position: data.position || "",
                salary: data.salary ?? "",
                status: data.status ?? true,
                supervisorId: data.supervisorId ?? null,
            });
            if (data.imageProfile) setImagePreview(data.imageProfile);

            // Set supervisor select value
            if (data.supervisor) {
                setSelectedSupervisor({
                    id: data.supervisor.id,
                    name: data.supervisor.fullName,
                    value: data.supervisor.id,
                    data: data.supervisor,
                });
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleInputChangeImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploadingImage(true);
            const file = e.target.files?.[0];
            if (!file) return;
            const fd = new FormData();
            fd.append("file", file);
            const res = await AxiosApi.post("FileStorage/upload", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const url = res?.data?.url;
            setImagePreview(url);
            setFormData(prev => ({ ...prev, imageProfile: url }));
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setTimeout(() => setUploadingImage(false), 500);
        }
    };

    const handleRemoveImage = () => {
        setImagePreview("");
        setFormData(prev => ({ ...prev, imageProfile: "" }));
    };

    const handleSupervisorChange = (value: SingleValue | null) => {
        setSelectedSupervisor(value);
        setFormData(prev => ({ ...prev, supervisorId: value ? Number(value.id) : null }));
    };

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => onClose(), 300);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.firstName.trim()) { alertError("First name is required!"); return; }
        if (!formData.lastName.trim()) { alertError("Last name is required!"); return; }
        if (!formData.phoneNumber.trim()) { alertError("Phone number is required!"); return; }
        if (!formData.position.trim()) { alertError("Position is required!"); return; }

        const payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            imageProfile: imagePreview || formData.imageProfile,
            phoneNumber: formData.phoneNumber,
            position: formData.position,
            salary: formData.salary === "" ? 0 : Number(formData.salary),
            status: formData.status,
            supervisorId: formData.supervisorId,
        };

        if (staffId) {
            await updateData("Staff", staffId, payload as any, () => {setTimeout(() => handleClose(), 500)
                
            });
        } else {
            await createData("Staff", payload as any, () => setTimeout(() => handleClose(), 500));
        }
    };

    return (
        <>
            <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"}`} />
            <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 mt-15 pointer-events-none transition-all duration-300 ${isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                <div
                    className={`rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden pointer-events-auto transform transition-all duration-300
                    ${dl ? "bg-gray-800" : "bg-white"} ${isAnimating ? "translate-y-0" : "translate-y-4"}`}
                    style={{ maxHeight: "calc(100vh - 80px)" }}
                >
                    {/* Header */}
                    <div className={`px-6 py-4 border-b flex-shrink-0 ${dl ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className={`text-2xl font-bold ${dl ? "text-white" : "text-gray-900"}`}>
                                    {staffId ? "Edit Staff" : "Add New Staff"}
                                </h2>
                                <p className={`text-sm mt-1 ${dl ? "text-gray-400" : "text-gray-500"}`}>
                                    {staffId ? "Update staff information" : "Fill in the details to create a new staff member"}
                                </p>
                            </div>
                            <button
                                onClick={handleClose}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xl transition-all ${dl ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                        <div
                            className="overflow-y-auto flex-1 px-6 py-5 custom-scrollbar"
                            style={{ scrollbarWidth: "thin", scrollbarColor: dl ? "#4a5568 transparent" : "#cbd5e0 transparent" }}
                        >
                            <style>{`.custom-scrollbar::-webkit-scrollbar{width:6px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:transparent;border-radius:3px}.custom-scrollbar:hover::-webkit-scrollbar-thumb{background:${dl ? "#4a5568" : "#cbd5e0"}}`}</style>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                {/* Profile Image */}
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Profile Image</label>
                                    <div className="flex items-start gap-4">
                                        <div className="relative mt-2 flex-shrink-0">
                                            <img
                                                src={imagePreview || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8MmaS1S0FTclHTMMLicf-O0tOGth44cBGt03HQ4jh3phLijQ_k17nFf4eyrqyxHHkgQwLSzwIViOoi81phleVJoBLZbanBf5QRODj9g&s=10"}
                                                alt="Preview"
                                                className="w-20 h-20 object-cover rounded-full border-2"
                                            />
                                            {imagePreview && (
                                                <button type="button" onClick={handleRemoveImage}
                                                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg text-xs">
                                                    ✕
                                                </button>
                                            )}
                                            {uploadingImage && (
                                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                                    <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2 mt-2 flex-1">
                                            <span className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}>JPEG, PNG, GIF, WEBP • Max 12 MB</span>
                                            <input
                                                type="file"
                                                name="imageProfile"
                                                onChange={handleInputChangeImage}
                                                className={inputClass}
                                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                                disabled={uploadingImage}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* First Name */}
                                <div>
                                    <label className={labelClass}>First Name <span className="text-red-500">*</span></label>
                                    <input type="text" name="firstName" value={formData.firstName}
                                        onChange={handleInputChange} className={inputClass} placeholder="Enter first name" />
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label className={labelClass}>Last Name <span className="text-red-500">*</span></label>
                                    <input type="text" name="lastName" value={formData.lastName}
                                        onChange={handleInputChange} className={inputClass} placeholder="Enter last name" />
                                </div>

                                {/* Phone Number */}
                                <div>
                                    <label className={labelClass}>Phone Number <span className="text-red-500">*</span></label>
                                    <input type="text" name="phoneNumber" value={formData.phoneNumber}
                                        onChange={handleInputChange} className={inputClass} placeholder="Enter phone number" />
                                </div>

                                {/* Position */}
                                <div>
                                    <label className={labelClass}>Position <span className="text-red-500">*</span></label>
                                    <input type="text" name="position" value={formData.position}
                                        onChange={handleInputChange} className={inputClass} placeholder="e.g. Manager, Cashier" />
                                </div>

                                {/* Salary */}
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Salary</label>
                                    <div className="relative">
                                        <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold ${dl ? "text-gray-400" : "text-gray-500"}`}>$</span>
                                        <input type="number" name="salary" value={formData.salary}
                                            onChange={handleInputChange} className={`${inputClass} pl-7`}
                                            placeholder="0.00" min="0" step="0.01" />
                                    </div>
                                </div>

                                {/* Supervisor */}
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Supervisor</label>
                                    <XSelectSearch
                                        multiple={false}
                                        value={selectedSupervisor}
                                        onChange={handleSupervisorChange}
                                        placeholder="Select supervisor..."
                                        selectOption={{
                                            apiEndpoint: "Staff/lookup",
                                            id: "id",
                                            name: "fullName",
                                            value: "id",
                                        }}
                                        bgColor={dl ? "#374151" : "#ffffff"}
                                    />
                                </div>

                                {/* Status */}
                                <div className="md:col-span-2">
                                    <div className={`rounded-xl border-2 transition-all p-4 ${formData.status
                                        ? dl ? "border-green-600 bg-green-900/10" : "border-green-400 bg-green-50"
                                        : dl ? "border-gray-600 bg-gray-700/20" : "border-gray-200 bg-gray-50"
                                        }`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{formData.status ? "✅" : "⛔"}</span>
                                                <div>
                                                    <p className={`text-sm font-bold ${formData.status ? dl ? "text-green-300" : "text-green-700" : dl ? "text-gray-300" : "text-gray-700"}`}>
                                                        Staff Status
                                                    </p>
                                                    <p className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}>
                                                        {formData.status ? "Staff member is currently active" : "Staff member is inactive"}
                                                    </p>
                                                </div>
                                            </div>
                                            <button type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, status: !prev.status }))}
                                                className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${formData.status ? "bg-green-500" : dl ? "bg-gray-600" : "bg-gray-300"}`}>
                                                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${formData.status ? "left-5" : "left-0.5"}`} />
                                            </button>
                                        </div>
                                    </div>
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
                                    className={`px-8 py-2.5 rounded-lg font-medium transition-all shadow-lg ${loading || uploadingImage ? "bg-blue-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                                        } text-white disabled:opacity-50`}>
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Saving...
                                        </span>
                                    ) : staffId ? "Update Staff" : "Create Staff"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default StaffForm;