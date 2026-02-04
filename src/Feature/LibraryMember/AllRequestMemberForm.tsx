import { useEffect, useRef, useState } from "react";
import { useGlobleContextDarklight } from "../../AllContext/context";
import { HookIntergrateAPI } from "../../component/HookintagrateAPI/HookintegarteApi";
import { alertError } from "../../HtmlHelper/Alert";
import XSelectSearch, { SingleValue } from "../../component/XSelectSearch/Xselectsearch";

interface LibraryMemberFormData {
    id?: number;
    personId: number;
    membershipType: number;
    email: string;
    address: string;
    phoneNumber: string;
    isActive: boolean;
}

interface LibraryMemberFormProps {
    memberId?: number;
    onClose: () => void;
}

const AllRequestMemberForm = ({ memberId, onClose }: LibraryMemberFormProps) => {
    const { darkLight } = useGlobleContextDarklight();
    const { createData, updateData, GetDatabyID, loading } = HookIntergrateAPI<LibraryMemberFormData>();
    const [isAnimating, setIsAnimating] = useState(false);
    const hasInitialized = useRef(false);

    const [formData, setFormData] = useState<LibraryMemberFormData>({
        personId: 0,
        membershipType: 0,
        email: "",
        address: "",
        phoneNumber: "",
        isActive: true, // Default to active
    });

    const [selectedPerson, setSelectedPerson] = useState<SingleValue | any>(null);

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;
        setTimeout(() => setIsAnimating(true), 10);
        if (memberId) {
            loadMemberData();
        }
    }, [memberId]);

    const loadMemberData = async () => {
        if (!memberId) return;
        const data: any = await GetDatabyID("LibraryMember", memberId);
        if (data) {
            setFormData({
                id: data.id,
                personId: data.personId || 0,
                membershipType: data.membershipType || 0,
                email: data.email || "",
                address: data.address || "",
                phoneNumber: data.phoneNumber || "",
                isActive: data.isActive !== undefined ? data.isActive : true,
            });

            // Set selected person if exists
            if (data.person) {
                setSelectedPerson({
                    id: data?.person?.id,
                    name: data?.person?.name,
                    value: data?.person?.id,
                });
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "number" || name === "membershipType" ? Number(value) : value,
        }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    const handlePersonChange = (value: SingleValue | null) => {
        setSelectedPerson(value);
        setFormData((prev) => ({
            ...prev,
            personId: value ? Number(value.id) : 0,
        }));
    };

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.personId || formData.personId === 0) {
            alertError("Person is required!");
            return;
        }
        if (!formData.membershipType || formData.membershipType === 0) {
            alertError("Membership Type is required!");
            return;
        }
        if (!formData.email.trim()) {
            alertError("Email is required!");
            return;
        }
        if (!formData.address.trim()) {
            alertError("Address is required!");
            return;
        }
        if (!formData.phoneNumber.trim()) {
            alertError("Phone Number is required!");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alertError("Please enter a valid email address!");
            return;
        }

        if (memberId) {
            await updateData("LibraryMember", memberId, formData, () => {
                setTimeout(() => {
                    handleClose();
                }, 500);
            });
        } else {
            await createData("LibraryMember", formData, () => {
                setTimeout(() => {
                    handleClose();
                }, 500);
            });
        }
    };

    const inputClass = `w-full px-4 py-2.5 rounded-lg border transition-all duration-200 ${
        darkLight
            ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:bg-gray-700 focus:border-blue-500"
            : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-blue-50/30"
    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`;

    const labelClass = `block mb-1.5 text-sm font-semibold ${
        darkLight ? "text-gray-200" : "text-gray-700"
    }`;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
                    isAnimating ? 'opacity-100' : 'opacity-0'
                }`}
            />

            {/* Modal */}
            <div
                className={`fixed mt-15 inset-0 flex items-center justify-center z-50 p-4 pointer-events-none transition-all duration-300 ${
                    isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
            >
                <div
                    className={`rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden pointer-events-auto transform transition-all duration-300 ${
                        darkLight ? "bg-gray-800" : "bg-white"
                    } ${isAnimating ? 'translate-y-0' : 'translate-y-4'}`}
                    style={{ maxHeight: 'calc(100vh - 80px)' }}
                >
                    {/* Header */}
                    <div
                        className={`px-6 py-4 border-b flex-shrink-0 ${
                            darkLight
                                ? "bg-gray-800 border-gray-700"
                                : "bg-white border-gray-200"
                        }`}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h2
                                    className={`text-2xl font-bold ${
                                        darkLight ? "text-white" : "text-gray-900"
                                    }`}
                                >
                                    {memberId ? "Edit Library Member" : "Add New Library Member"}
                                </h2>
                                <p className={`text-sm mt-1 ${darkLight ? "text-gray-400" : "text-gray-500"}`}>
                                    {memberId ? "Update member information" : "Fill in the details to create a new member"}
                                </p>
                            </div>
                            <button
                                onClick={handleClose}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xl transition-all ${
                                    darkLight
                                        ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                        {/* Body - Scrollable */}
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
                                {/* Person (User) - XSelectSearch */}
                                <div className="md:col-span-2">
                                    <label className={labelClass}>
                                        Person (User) <span className="text-red-500">*</span>
                                    </label>
                                    <XSelectSearch
                                        value={selectedPerson}
                                        onChange={handlePersonChange}
                                        multiple={false}
                                        placeholder="Select person"
                                        selectOption={{
                                            apiEndpoint: "Users/lookup",
                                            id: "id",
                                            name: "username", // or use firstName + lastName if available
                                            value: "id",
                                            pageSize: 20,
                                            searchParam: "Search",
                                        }}
                                        isSearchable={true}
                                    />
                                </div>

                                {/* Membership Type - Dropdown as number */}
                                <div>
                                    <label className={labelClass}>
                                        Membership Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="membershipType"
                                        value={formData.membershipType}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                    >
                                        <option value={0}>Select membership type</option>
                                        <option value={1}>Basic</option>
                                        <option value={2}>Standard</option>
                                        <option value={3}>Premium</option>
                                    </select>
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

                                {/* Address */}
                                <div className="md:col-span-2">
                                    <label className={labelClass}>
                                        Address <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className={`${inputClass} min-h-[100px] resize-none`}
                                        placeholder="Enter full address"
                                    />
                                </div>

                                {/* IsActive - Toggle/Checkbox */}
                                <div className="md:col-span-2">
                                    <div className="flex items-center gap-3">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="isActive"
                                                checked={formData.isActive}
                                                onChange={handleCheckboxChange}
                                                className="sr-only peer"
                                            />
                                            <div className={`w-8 h-4 rounded-full peer transition-all duration-200 ${
                                                darkLight 
                                                    ? 'bg-gray-600 peer-checked:bg-blue-600' 
                                                    : 'bg-gray-300 peer-checked:bg-blue-500'
                                            } peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/20`}>
                                            </div>
                                            <div className="absolute left-[4px] top-[2px] bg-white w-3 h-3 rounded-full transition-all duration-200 peer-checked:translate-x-full">
                                            </div>
                                        </label>
                                        <span className={`text-sm font-semibold ${
                                            darkLight ? "text-gray-200" : "text-gray-700"
                                        }`}>
                                            {formData.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                    <p className={`text-xs mt-1 ${darkLight ? "text-gray-400" : "text-gray-500"}`}>
                                        Toggle to activate or deactivate this member
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div
                            className={`px-6 py-4 border-t flex-shrink-0 ${
                                darkLight ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
                            }`}
                        >
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                                        darkLight
                                            ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-8 py-2.5 rounded-lg font-medium transition-all shadow-lg ${
                                        loading
                                            ? "bg-blue-400 cursor-not-allowed"
                                            : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl"
                                    } text-white disabled:opacity-50`}
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                    fill="none"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            Saving...
                                        </span>
                                    ) : (
                                        memberId ? "Update Member" : "Create Member"
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

export default AllRequestMemberForm;