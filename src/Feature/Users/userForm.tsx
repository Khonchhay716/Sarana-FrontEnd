import { useEffect, useRef, useState } from "react";
import { useGlobleContextDarklight } from "../../AllContext/context";
import XSelectSearch, { MultiValue } from "../../component/XSelectSearch/Xselectsearch";
import { HookIntergrateAPI } from "../../component/HookintagrateAPI/HookintegarteApi";
import { alertError } from "../../HtmlHelper/Alert";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserFormData {
    username: string;
    email: string;
    password: string;
    isActive: boolean;
    roleIds: number[];
    staffId: null;
    customerId: null;
}

interface UserFormProps {
    userId?: number;   // undefined = create | number = edit
    onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const UserForm = ({ userId, onClose }: UserFormProps) => {
    const { darkLight } = useGlobleContextDarklight();
    const { createData, updateData, GetDatabyID, loading } = HookIntergrateAPI<any>();
    const [isAnimating, setIsAnimating] = useState(false);
    const hasInitialized = useRef(false);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState<MultiValue>([]);

    const isEditMode = !!userId;

    const [formData, setFormData] = useState<UserFormData>({
        username: "",
        email: "",
        password: "",
        isActive: true,
        roleIds: [],
        staffId: null,
        customerId: null,
    });

    const dl = darkLight;

    const inputClass = `w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
        dl
            ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:bg-gray-700 focus:border-blue-500"
            : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-blue-50/30"
    }`;
    const labelClass = `block mb-1.5 text-sm font-semibold ${dl ? "text-gray-200" : "text-gray-700"}`;

    // ── Init ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;
        setTimeout(() => setIsAnimating(true), 10);
        if (isEditMode && userId) loadUserData();
    }, []);

    const loadUserData = async () => {
        if (!userId) return;
        const data: any = await GetDatabyID("Person", userId);
        if (data) {
            setFormData(prev => ({
                ...prev,
                username: data.username || "",
                email: data.email || "",
                isActive: data.isActive ?? true,
                roleIds: data.roles?.map((r: any) => r.id) ?? [],
                // staffId and customerId intentionally left null — not editable here
            }));
            if (data.roles && Array.isArray(data.roles)) {
                setSelectedRoles(
                    data.roles.map((r: any) => ({
                        id: r.id,
                        name: r.name || String(r.id),
                        value: r.id,
                        data: r,
                    }))
                );
            }
        }
    };

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (values: MultiValue) => {
        setSelectedRoles(values);
        setFormData(prev => ({ ...prev, roleIds: values.map(v => Number(v.id)) }));
    };

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => onClose(), 300);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // ── Validation ────────────────────────────────────────────────────────
        if (!formData.username.trim())                             { alertError("Username is required!");            return; }
        if (!formData.email.trim())                               { alertError("Email is required!");               return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))  { alertError("Invalid email format!");            return; }
        if (!isEditMode && !formData.password)                    { alertError("Password is required!");            return; }
        if (!isEditMode && formData.password.length < 6)          { alertError("Password must be ≥ 6 characters!"); return; }
        if (formData.roleIds.length === 0)                        { alertError("At least one role is required!");   return; }

        if (isEditMode && userId) {
            // ── Edit payload: no password, no staffId/customerId changes ──────
            const payload = {
                username:    formData.username,
                email:       formData.email,
                isActive:    formData.isActive,
                roleIds:     formData.roleIds,
                staffId:     null,
                customerId:  null,
            };
            await updateData("Person", userId, payload as any, () => setTimeout(handleClose, 500));
        } else {
            // ── Create payload: includes password, staffId/customerId = null ──
            const payload = {
                username:    formData.username,
                email:       formData.email,
                password:    formData.password,
                isActive:    formData.isActive,
                roleIds:     formData.roleIds,
                staffId:     null,
                customerId:  null,
            };
            await createData("Person", payload as any, () => setTimeout(handleClose, 500));
        }
    };

    // ── Password strength ─────────────────────────────────────────────────────
    const passwordStrength = (pwd: string) => {
        if (!pwd) return null;
        if (pwd.length < 6) return { level: "Weak",   color: "text-red-500",    bar: "w-1/4 bg-red-500"    };
        if (pwd.length < 8) return { level: "Fair",   color: "text-yellow-500", bar: "w-2/4 bg-yellow-500" };
        if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd))
                            return { level: "Good",   color: "text-blue-500",   bar: "w-3/4 bg-blue-500"   };
        return              { level: "Strong", color: "text-green-500",  bar: "w-full bg-green-500"  };
    };
    const strength = passwordStrength(formData.password);

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <>
            <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"}`} />
            <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none transition-all duration-300 ${isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                <div
                    className={`rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden pointer-events-auto transform transition-all duration-300
                    ${dl ? "bg-gray-800" : "bg-white"} ${isAnimating ? "translate-y-0" : "translate-y-4"}`}
                    style={{ maxHeight: "calc(100vh - 80px)" }}
                >
                    {/* ── Header ──────────────────────────────────────────────── */}
                    <div className={`px-6 py-4 border-b flex-shrink-0 ${dl ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                        <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${dl ? "bg-sky-900/30" : "bg-sky-100"}`}>
                                    <span className="text-lg">👤</span>
                                </div>
                                <div>
                                    <h2 className={`text-xl font-bold ${dl ? "text-white" : "text-gray-900"}`}>
                                        {isEditMode ? "Edit User" : "Add New User"}
                                    </h2>
                                    <p className={`text-xs mt-0.5 ${dl ? "text-gray-400" : "text-gray-500"}`}>
                                        {isEditMode ? "Update account credentials & roles" : "Create a standalone user account"}
                                    </p>
                                </div>
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
                        {/* ── Body ────────────────────────────────────────────── */}
                        <div
                            className="overflow-y-auto flex-1 px-6 py-5 custom-scrollbar"
                            style={{ scrollbarWidth: "thin", scrollbarColor: dl ? "#4a5568 transparent" : "#cbd5e0 transparent" }}
                        >
                            <style>{`.custom-scrollbar::-webkit-scrollbar{width:6px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:transparent;border-radius:3px}.custom-scrollbar:hover::-webkit-scrollbar-thumb{background:${dl ? "#4a5568" : "#cbd5e0"}}`}</style>

                            <div className="flex flex-col gap-4">

                                {/* Username */}
                                <div>
                                    <label className={labelClass}>Username <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="Enter username"
                                        autoComplete="off"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className={labelClass}>Email <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="Enter email address"
                                        autoComplete="off"
                                    />
                                </div>

                                {/* Roles */}
                                <div>
                                    <label className={labelClass}>Roles <span className="text-red-500">*</span></label>
                                    <XSelectSearch
                                        multiple={true}
                                        value={selectedRoles}
                                        onChange={handleRoleChange}
                                        placeholder="Select roles..."
                                        selectOption={{
                                            apiEndpoint: "Roles",
                                            id: "id",
                                            name: "name",
                                            value: "id",
                                            pageSize: 50,
                                            searchParam: "Search",
                                        }}
                                        bgColor={dl ? "#374151" : "#ffffff"}
                                    />
                                </div>

                                {/* Password — create mode only */}
                                {!isEditMode && (
                                    <div>
                                        <label className={labelClass}>Password <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className={`${inputClass} pr-10`}
                                                placeholder="Enter password"
                                                autoComplete="new-password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(v => !v)}
                                                className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${dl ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-600"}`}
                                            >
                                                {showPassword ? "🙈" : "👁️"}
                                            </button>
                                        </div>
                                        {strength && (
                                            <div className="mt-2">
                                                <div className={`w-full h-1.5 rounded-full ${dl ? "bg-gray-700" : "bg-gray-200"}`}>
                                                    <div className={`h-1.5 rounded-full transition-all duration-300 ${strength.bar}`} />
                                                </div>
                                                <p className={`text-xs mt-1 font-medium ${strength.color}`}>
                                                    Strength: {strength.level}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* isActive toggle */}
                                <div className={`rounded-xl border-2 transition-all p-4 ${
                                    formData.isActive
                                        ? dl ? "border-green-600 bg-green-900/10" : "border-green-400 bg-green-50"
                                        : dl ? "border-gray-600 bg-gray-700/20"   : "border-gray-200 bg-gray-50"
                                }`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{formData.isActive ? "✅" : "⛔"}</span>
                                            <p className={`text-sm font-bold ${formData.isActive
                                                ? dl ? "text-green-300" : "text-green-700"
                                                : dl ? "text-gray-300"  : "text-gray-700"}`}>
                                                {formData.isActive ? "Active" : "Inactive"}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                                            className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${formData.isActive ? "bg-green-500" : dl ? "bg-gray-600" : "bg-gray-300"}`}
                                        >
                                            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${formData.isActive ? "left-5" : "left-0.5"}`} />
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* ── Footer ──────────────────────────────────────────── */}
                        <div className={`px-6 py-3 border-t flex-shrink-0 ${dl ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className={`px-6 py-2.5 rounded-lg font-medium transition-all ${dl ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-8 py-2.5 rounded-lg font-medium transition-all shadow-lg ${
                                        loading ? "bg-sky-400 cursor-not-allowed" : "bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700"
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
                                    ) : isEditMode ? "Update User" : "Create User"}
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