import { useEffect, useRef, useState } from "react";
import { useGlobleContextDarklight } from "../../AllContext/context";
import { HookIntergrateAPI } from "../../component/HookintagrateAPI/HookintegarteApi";
import { alertError } from "../../HtmlHelper/Alert";

interface LeaveTypeFormData {
    id?: number;
    name: string;
    maxDaysPerYear: number;
    description: string;
    isActive: boolean;
}

interface LeaveTypeFormProps {
    leaveTypeId?: number;
    onClose: () => void;
}

const LeaveTypeForm = ({ leaveTypeId, onClose }: LeaveTypeFormProps) => {
    const { darkLight } = useGlobleContextDarklight();
    const { createData, updateData, GetDatabyID, loading } = HookIntergrateAPI<LeaveTypeFormData>();
    const [isAnimating, setIsAnimating] = useState(false);
    const hasInitialized = useRef(false);

    const [formData, setFormData] = useState<LeaveTypeFormData>({
        name: "",
        maxDaysPerYear: 0,
        description: "",
        isActive: true,
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
        if (leaveTypeId) loadLeaveTypeData();
    }, [leaveTypeId]);

    const loadLeaveTypeData = async () => {
        if (!leaveTypeId) return;
        const data: any = await GetDatabyID("LeaveType", leaveTypeId);
        if (data) {
            setFormData({
                id: data.id,
                name: data.name || "",
                maxDaysPerYear: data.maxDaysPerYear ?? 0,
                description: data.description || "",
                isActive: data.isActive ?? true,
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "number" ? parseInt(value) || 0 : value
        }));
    };

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => onClose(), 300);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) { alertError("Leave name is required!"); return; }
        if (formData.maxDaysPerYear <= 0) { alertError("Max days must be greater than 0!"); return; }

        const payload = {
            name: formData.name,
            maxDaysPerYear: formData.maxDaysPerYear,
            description: formData.description,
            isActive: formData.isActive,
        };

        if (leaveTypeId) {
            await updateData("LeaveType", leaveTypeId, payload as any, () => setTimeout(() => handleClose(), 500));
        } else {
            await createData("LeaveType", payload as any, () => setTimeout(() => handleClose(), 500));
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"}`} />

            {/* Modal wrapper */}
            <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 mt-15 pointer-events-none transition-all duration-300 ${isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                <div
                    className={`rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden pointer-events-auto transform transition-all duration-300
                        ${dl ? "bg-gray-800" : "bg-white"} ${isAnimating ? "translate-y-0" : "translate-y-4"}`}
                    style={{ maxHeight: "calc(100vh - 80px)" }}
                >
                    {/* ✅ Header — matches BranchForm */}
                    <div className={`px-6 py-4 border-b flex-shrink-0 ${dl ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className={`text-2xl font-bold ${dl ? "text-white" : "text-gray-900"}`}>
                                    {leaveTypeId ? "Edit Leave Type" : "Add Leave Type"}
                                </h2>
                                <p className={`text-sm mt-1 ${dl ? "text-gray-400" : "text-gray-500"}`}>
                                    {leaveTypeId ? "Update leave type information" : "Fill in the details to create a new leave type"}
                                </p>
                            </div>
                            <button
                                onClick={handleClose}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xl transition-all
                                    ${dl ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">

                        {/* ✅ Scrollable body — matches BranchForm */}
                        <div
                            className="overflow-y-auto flex-1 px-6 py-5 custom-scrollbar"
                            style={{ scrollbarWidth: "thin", scrollbarColor: dl ? "#4a5568 transparent" : "#cbd5e0 transparent" }}
                        >
                            <style>{`.custom-scrollbar::-webkit-scrollbar{width:6px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:transparent;border-radius:3px}.custom-scrollbar:hover::-webkit-scrollbar-thumb{background:${dl ? "#4a5568" : "#cbd5e0"}}`}</style>

                            <div className="flex flex-col gap-5">

                                {/* Leave Name */}
                                <div>
                                    <label className={labelClass}>Leave Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="e.g. Annual Leave"
                                    />
                                </div>

                                {/* Max Days Per Year */}
                                <div>
                                    <label className={labelClass}>Max Days Per Year <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        name="maxDaysPerYear"
                                        value={formData.maxDaysPerYear}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="0"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className={labelClass}>Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className={`${inputClass} resize-none`}
                                        rows={3}
                                        placeholder="Optional description..."
                                    />
                                </div>

                                {/* ✅ Status — fixed description text */}
                                <div>
                                    <label className={labelClass}>Status</label>
                                    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 ${
                                        formData.isActive
                                            ? dl ? "border-teal-600 bg-teal-900/20" : "border-teal-400 bg-teal-50"
                                            : dl ? "border-gray-600 bg-gray-700/20" : "border-gray-200 bg-gray-50"
                                    }`}>
                                        <div>
                                            <p className={`text-sm font-semibold transition-colors ${
                                                formData.isActive
                                                    ? dl ? "text-teal-300" : "text-teal-700"
                                                    : dl ? "text-gray-400" : "text-gray-500"
                                            }`}>
                                                {formData.isActive ? "Active" : "Inactive"}
                                            </p>
                                            <p className={`text-xs ${dl ? "text-gray-500" : "text-gray-400"}`}>
                                                {formData.isActive ? "Leave type is available" : "Leave type is disabled"}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                                            className={`relative w-9 h-5 rounded-full transition-all duration-300 flex-shrink-0 focus:outline-none shadow-inner ${
                                                formData.isActive ? "bg-teal-500" : dl ? "bg-gray-600" : "bg-gray-300"
                                            }`}
                                        >
                                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${
                                                formData.isActive ? "left-4" : "left-0.5"
                                            }`} />
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* ✅ Fixed footer — matches BranchForm */}
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
                                        loading
                                            ? "bg-blue-400 cursor-not-allowed"
                                            : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
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
                                    ) : (leaveTypeId ? "Update Leave Type" : "Save Leave Type")}
                                </button>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </>
    );
};

export default LeaveTypeForm;