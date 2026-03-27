import { useEffect, useRef, useState } from "react";
import { useGlobleContextDarklight } from "../../AllContext/context";
import XSelectSearch, { MultiValue } from "../../component/XSelectSearch/Xselectsearch";
import { HookIntergrateAPI } from "../../component/HookintagrateAPI/HookintegarteApi";
import { alertError } from "../../HtmlHelper/Alert";
import { AxiosApi } from "../../component/Axios/Axios";
interface UserFormData {
    id?: number;
    username: string;
    imageProfile: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    isActive: boolean;
    roleIds: number[];
}

interface UserFormProps {
    userId?: number;
    onClose: () => void;
}

const UserForm = ({ userId, onClose }: UserFormProps) => {
    const { darkLight } = useGlobleContextDarklight();
    const { createData, updateData, GetDatabyID, loading } = HookIntergrateAPI<UserFormData>();
    const [isAnimating, setIsAnimating] = useState(false);
    const hasInitialized = useRef(false);

    const [imagePreview, setImagePreview] = useState<string>("");
    const [uploadingImage, setUploadingImage] = useState(false);

    const handleInputChangeImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alertError("Only image files (JPEG, PNG, GIF, WEBP) are allowed!");
            e.target.value = ""; // Reset input
            return;
        }
        const maxSize = 12 * 1024 * 1024; // 12 MB
        if (file.size > maxSize) {
            alertError("Image size must be less than 12 MB!");
            e.target.value = ""; // Reset input
            return;
        }

        try {
            setUploadingImage(true);
            const formData = new FormData();
            formData.append("file", file);

            const res = await AxiosApi.post("FileStorage/upload", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res?.data) {
                setImagePreview(res.data.url);
                setFormData(prev => ({
                    ...prev,
                    imageProfile: res.data.url
                }));
            }

            return res.data;

        } catch (error) {
            console.error("Upload failed:", error);
            alertError("Failed to upload image. Please try again.");
            e.target.value = ""; // Reset input
        } finally {
            setTimeout(() => {
                setUploadingImage(false);
            }, 200);
        }
    };

    const [formData, setFormData] = useState<UserFormData>({
        username: "",
        imageProfile: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        isActive: true,
        roleIds: [],
    });

    const [selectedRoles, setSelectedRoles] = useState<MultiValue>([]);

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;
        setTimeout(() => setIsAnimating(true), 10);
        if (userId) {
            loadUserData();
        }
    }, [userId]);

    const loadUserData = async () => {
        if (!userId) return;
        const data: any = await GetDatabyID("Person", userId);
        if (data) {
            setFormData({
                id: data.id,
                username: data.username || "",
                imageProfile: data.imageProfile || "",
                email: data.email || "",
                password: "",
                firstName: data.firstName || "",
                lastName: data.lastName || "",
                phoneNumber: data.phoneNumber || "",
                isActive: data.isActive ?? true,
                roleIds: data.roles?.map((r: any) => r.id) || [],
            });

            if (data.imageProfile) {
                setImagePreview(data.imageProfile);
            }
            if (data.roles && Array.isArray(data.roles)) {
                const roles = data.roles.map((r: any) => ({
                    id: r.id,
                    name: r.name,
                    value: r.id,
                    data: r,
                }));
                setSelectedRoles(roles);
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleRoleChange = (value: MultiValue) => {
        setSelectedRoles(value);
        setFormData((prev) => ({
            ...prev,
            roleIds: value.map((role) => Number(role.id)),
        }));
    };

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handleRemoveImage = () => {
        setImagePreview("");
        setFormData(prev => ({ ...prev, imageProfile: "" }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.username.trim()) {
            alertError("Username is required!");
            return;
        }
        if (!formData.email.trim()) {
            alertError("Email is required!");
            return;
        }
        if (!formData.firstName.trim()) {
            alertError("First Name is required!");
            return;
        }
        if (!formData.lastName.trim()) {
            alertError("Last Name is required!");
            return;
        }
        if (!formData.phoneNumber.trim()) {
            alertError("Phone Number is required!");
            return;
        }

        // Password required only if creating a new user
        if (!userId && !formData.password.trim()) {
            alertError("Password is required!");
            return;
        }

        // Role selection validation
        if (!formData.roleIds || formData.roleIds.length === 0) {
            alertError("At least one role must be selected!");
            return;
        }

        if (userId) {
            await updateData("Person", userId, formData, () => {
                setTimeout(() => {
                    handleClose();
                }, 500);
            });
        } else {
            await createData("Person", formData, () => {
                setTimeout(() => {
                   handleClose(); 
                }, 500);
            });
        }
    };

    const inputClass = `w-full px-4 py-2.5 rounded-lg border transition-all duration-200 overflow-hidden ${darkLight
        ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:bg-gray-700 focus:border-blue-500"
        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-blue-50/30"
        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`;

    const labelClass = `block mb-1.5 text-sm font-semibold ${darkLight ? "text-gray-200" : "text-gray-700"
        }`;

    return (
        <>
            {/* Backdrop with fade animation */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'
                    }`}
            />

            {/* Modal with scale and fade animation */}
            <div
                className={`fixed inset-0 flex items-center justify-center z-50 p-4 mt-15 pointer-events-none transition-all duration-300 ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}
            >
                <div
                    className={`rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden pointer-events-auto transform transition-all duration-300 ${darkLight ? "bg-gray-800" : "bg-white"
                        } ${isAnimating ? 'translate-y-0' : 'translate-y-4'}`}
                    style={{ maxHeight: 'calc(100vh - 80px)' }}
                >
                    {/* Header - Fixed */}
                    <div
                        className={`px-6 py-1 border-b flex-shrink-0 ${darkLight
                            ? "bg-gray-800 border-gray-700"
                            : "bg-white border-gray-200"
                            }`}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h2
                                    className={`text-2xl font-bold ${darkLight ? "text-white" : "text-gray-900"
                                        }`}
                                >
                                    {userId ? "Edit User" : "Add New User"}
                                </h2>
                                <p className={`text-sm mt-1 ${darkLight ? "text-gray-400" : "text-gray-500"}`}>
                                    {userId ? "Update user information" : "Fill in the details to create a new user"}
                                </p>
                            </div>
                            <button
                                onClick={handleClose}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xl transition-all ${darkLight
                                    ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                        {/* Modal Body - Scrollable */}
                        <div
                            className="overflow-y-auto flex-1 px-6 py-5 custom-scrollbar"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: darkLight ? '#4a5568 transparent' : '#cbd5e0 transparent',
                            }}
                        >
                            <style>{`
                                .custom-scrollbar::-webkit-scrollbar {
                                    width: 6px;
                                }
                                .custom-scrollbar::-webkit-scrollbar-track {
                                    background: transparent;
                                }
                                .custom-scrollbar::-webkit-scrollbar-thumb {
                                    background: transparent;
                                    border-radius: 3px;
                                    transition: background 0.2s;
                                }
                                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                                    background: ${darkLight ? '#4a5568' : '#cbd5e0'};
                                }
                                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                    background: ${darkLight ? '#718096' : '#a0aec0'};
                                }
                            `}</style>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                {/* Image Profile */}
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Image Profile</label>
                                    <div className="flex items-start gap-4">
                                        <div className="relative mt-2">
                                            <img
                                                src={imagePreview || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                                                alt="Preview"
                                                className="w-25 h-25 object-cover rounded-lg border"
                                            />
                                            {imagePreview && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg"
                                                    aria-label="Remove image"
                                                >
                                                    ✕
                                                </button>
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

                                        {/* File Input */}
                                        <div className="flex flex-col gap-2 justify-end mt-2">
                                            <label className={`text-xs ${darkLight ? "text-gray-400" : "text-gray-500"}`}>
                                                Only images allowed (JPEG, PNG, GIF, WEBP) • Max size: 12 MB
                                            </label>
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

                                {/* Username */}
                                <div>
                                    <label className={labelClass}>
                                        Username <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="Enter username"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className={labelClass}>
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="Enter email address"
                                    />
                                </div>

                                {/* First Name */}
                                <div>
                                    <label className={labelClass}>
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="Enter first name"
                                    />
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label className={labelClass}>
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="Enter last name"
                                    />
                                </div>

                                {/* Phone Number */}
                                <div className="md:col-span-2">
                                    <label className={labelClass}>
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="Enter phone number"
                                    />
                                </div>

                                {/* Password */}
                                {!userId && (
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>
                                            Password {!userId && <span className="text-red-500">*</span>}
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className={inputClass}
                                            placeholder={userId ? "Leave blank to keep current password" : "Enter password"}
                                        />
                                        {userId && (
                                            <p className={`text-xs mt-1 ${darkLight ? "text-gray-400" : "text-gray-500"}`}>
                                                Leave blank if you don't want to change the password
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Roles */}
                                <div className="md:col-span-2">
                                    <label className={labelClass}>
                                        Roles <span className="text-red-500">*</span>
                                    </label>
                                    <XSelectSearch
                                        value={selectedRoles}
                                        onChange={handleRoleChange}
                                        multiple={true}
                                        placeholder="Select roles"
                                        selectOption={{
                                            apiEndpoint: "/Roles",
                                            id: "id",
                                            name: "name",
                                            value: "id",
                                            pageSize: 20,
                                            searchParam: "Search",
                                        }}
                                        isSearchable={true}
                                    />
                                </div>

                                {/* Is Active */}
                                <div className="md:col-span-2 flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                    />
                                    <label htmlFor="isActive" className={`font-medium cursor-pointer ${darkLight ? "text-gray-200" : "text-gray-700"}`}>
                                        Active User
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Footer - Fixed */}
                        <div className={`px-6 py-2 border-t flex-shrink-0 ${darkLight ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className={`px-6 py-2.5 rounded-lg font-medium transition-all ${darkLight
                                        ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || uploadingImage}
                                    className={`px-8 py-2.5 rounded-lg font-medium transition-all shadow-lg ${loading || uploadingImage
                                        ? "bg-blue-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl"
                                        } text-white disabled:opacity-50`}
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Saving...
                                        </span>
                                    ) : (
                                        userId ? "Update User" : "Create User"
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

export default UserForm;