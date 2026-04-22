import { useEffect, useRef, useState } from "react";
import { useGlobleContextDarklight } from "../../AllContext/context";
import { HookIntergrateAPI } from "../../component/HookintagrateAPI/HookintegarteApi";
import { TbSettings } from "react-icons/tb";

interface PointSetupFormData {
    pointValue: number;
    minOrderAmount: number;
    maxPointPerOrder: number | null;
    pointsPerRedemption: number;
    isActive: boolean;
}

const PointSetupPage = () => {
    const { darkLight: dl } = useGlobleContextDarklight();
    const { updateData, GetDataAll, loading } = HookIntergrateAPI<PointSetupFormData>();
    const hasInitialized = useRef(false);

    const [formData, setFormData] = useState<PointSetupFormData>({
        pointValue: 0,
        minOrderAmount: 0,
        maxPointPerOrder: null,
        pointsPerRedemption: 0,
        isActive: false,
    });

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;
        loadData();
    }, []);

    const loadData = async () => {
        const res: any = await GetDataAll("PointSetup");
        if (res) {
            setFormData({
                pointValue: res?.data?.pointValue ?? 0,
                minOrderAmount: res?.data?.minOrderAmount ?? 0,
                maxPointPerOrder: res?.data?.maxPointPerOrder ?? null,
                pointsPerRedemption: res?.data?.pointsPerRedemption ?? 0,
                isActive: res?.data?.isActive ?? false,
            });
        }
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value === "" ? 0 : parseFloat(value) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateData("PointSetup", "" as any, formData as any, () => loadData());
    };

    const inputClass = `w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${dl ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:bg-gray-700 focus:border-blue-500"
        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-blue-50/30"
        }`;
    const labelClass = `block mb-1.5 text-sm font-semibold ${dl ? "text-gray-200" : "text-gray-700"}`;
    const hintClass = `text-xs mt-1 ${dl ? "text-gray-500" : "text-gray-400"}`;

    return (
        <div>
            {/* ===== Header ===== */}
            <div className="flex items-center gap-2 my-2 mb-6 min-w-0">
                <TbSettings
                    className={`w-7 h-7 sm:w-9 sm:h-9 drop-shadow-lg flex-shrink-0
            ${dl ? "text-purple-400" : "text-purple-600"}`}
                    style={{ animation: "spin 4s linear infinite" }}
                />
                <div className="min-w-0">
                    <h3 className={`font-bold text-base sm:text-2xl truncate ${dl ? "text-white" : "text-gray-900"}`}>
                        POINT SETUP
                    </h3>
                    <p className={`text-xs sm:text-sm truncate ${dl ? "text-gray-400" : "text-gray-500"}`}>
                        Configure point earning and redemption rules
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">

                    {/* ===== Status Banner ===== */}
                    <div className={`rounded-xl px-6 py-4 flex items-center justify-between border transition-all duration-300 ${formData.isActive
                        ? dl ? "bg-teal-900/30 border-teal-600/40" : "bg-teal-50 border-teal-300"
                        : dl ? "bg-gray-700/30 border-gray-600" : "bg-gray-50 border-gray-200"
                        }`}>
                        <div>
                            <p className={`text-sm font-semibold ${formData.isActive
                                ? dl ? "text-teal-300" : "text-teal-700"
                                : dl ? "text-gray-400" : "text-gray-500"
                                }`}>
                                Point System — {formData.isActive ? "Active" : "Inactive"}
                            </p>
                            <p className={`text-xs mt-0.5 ${dl ? "text-gray-500" : "text-gray-400"}`}>
                                {formData.isActive
                                    ? "Customers are earning and redeeming points"
                                    : "Point system is disabled — no points will be given"}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${formData.isActive
                                ? "bg-teal-500/20 text-teal-400 border border-teal-500/40"
                                : dl ? "bg-gray-600/40 text-gray-400 border border-gray-600"
                                    : "bg-gray-200 text-gray-500 border border-gray-300"
                                }`}>
                                {formData.isActive ? "ON" : "OFF"}
                            </span>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                                className={`relative w-9 h-5 rounded-full transition-all duration-300 flex-shrink-0 shadow-inner ${formData.isActive ? "bg-teal-500" : dl ? "bg-gray-600" : "bg-gray-300"
                                    }`}>
                                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${formData.isActive ? "left-4" : "left-0.5"
                                    }`} />
                            </button>
                        </div>
                    </div>

                    {/* ===== Earning Rules ===== */}
                    <div className={`rounded-xl p-5 pb-10 border ${dl ? "border-blue-500/30 bg-blue-500/5" : "border-blue-200 bg-blue-50/50"}`}>
                        <p className={`text-xs font-bold uppercase tracking-widest mb-5 ${dl ? "text-blue-400" : "text-blue-600"}`}>
                            Earning Rules
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

                            {/* PointValue */}
                            <div>
                                <label className={labelClass}>
                                    Point Value
                                    <span className={`ml-2 text-xs font-normal ${dl ? "text-gray-400" : "text-gray-500"}`}>
                                        (spend $1 = ? point)
                                    </span>
                                </label>
                                <input
                                    type="number" name="pointValue" min={0} step="0.01"
                                    value={formData.pointValue}
                                    onChange={handleNumberChange}
                                    className={inputClass}
                                    placeholder="e.g. 1"
                                />
                            </div>

                            {/* MinOrderAmount */}
                            <div>
                                <label className={labelClass}>
                                    Min Order Amount ($)
                                    <span className={`ml-2 text-xs font-normal ${dl ? "text-gray-400" : "text-gray-500"}`}>
                                        (min spend to earn)
                                    </span>
                                </label>
                                <input
                                    type="number" name="minOrderAmount" min={0} step="0.01"
                                    value={formData.minOrderAmount}
                                    onChange={handleNumberChange}
                                    className={inputClass}
                                    placeholder="e.g. 10"
                                />
                            </div>

                            {/* MaxPointPerOrder */}
                            <div>
                                <label className={labelClass}>
                                    Max Point Per Order
                                </label>
                                <input
                                    type="number" name="maxPointPerOrder" min={1} step="1"
                                    value={formData.maxPointPerOrder ?? ""}
                                    onChange={e => setFormData(prev => ({
                                        ...prev,
                                        maxPointPerOrder: e.target.value === "" ? null : parseInt(e.target.value)
                                    }))}
                                    className={inputClass}
                                    placeholder="No set limit of max point"
                                />
                            </div>

                        </div>
                    </div>

                    {/* ===== Redemption Rules ===== */}
                    <div className={`rounded-xl p-5 border ${dl ? "border-purple-500/30 bg-purple-500/5" : "border-purple-200 bg-purple-50/50"}`}>
                        <p className={`text-xs font-bold uppercase tracking-widest mb-5 ${dl ? "text-purple-400" : "text-purple-600"}`}>
                            Redemption Rules
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-1 gap-5">

                            {/* PointsPerRedemption */}
                            <div>
                                <label className={labelClass}>
                                    Points Per Redemption
                                    <span className={`ml-2 text-xs font-normal ${dl ? "text-gray-400" : "text-gray-500"}`}>
                                        (? points = $1 discount)
                                    </span>
                                </label>
                                <input
                                    type="number" name="pointsPerRedemption" min={0} step="1"
                                    value={formData.pointsPerRedemption}
                                    onChange={handleNumberChange}
                                    className={inputClass}
                                    placeholder="e.g. 100"
                                />
                                <p className={hintClass}>{formData.pointsPerRedemption} points = $1 discount</p>
                            </div>

                        </div>
                    </div>

                    {/* ===== Save Button ===== */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-10 py-2.5 rounded-lg font-medium transition-all shadow-lg ${loading ? "bg-blue-400 cursor-not-allowed"
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
                            ) : "Save Changes"}
                        </button>
                    </div>

                </div>
            </form>
        </div>
    );
};

export default PointSetupPage;