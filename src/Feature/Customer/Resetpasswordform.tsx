import { useEffect, useRef, useState } from "react";
import { useGlobleContextDarklight } from "../../AllContext/context";
import { alertError } from "../../HtmlHelper/Alert";
import { AxiosApi } from "../../component/Axios/Axios";
import alertify from "alertifyjs";

interface ResetPasswordFormProps {
    userId: number;
    username: string;
    customerName: string;
    onClose: () => void;
}

const ResetPasswordForm = ({ userId, username, customerName, onClose }: ResetPasswordFormProps) => {
    const { darkLight } = useGlobleContextDarklight();
    const [isAnimating, setIsAnimating] = useState(false);
    const hasInitialized = useRef(false);
    const [loading, setLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: "",
    });

    const dl = darkLight;
    const inputClass = `w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
        dl
            ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:bg-gray-700 focus:border-orange-500"
            : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:bg-orange-50/30"
    }`;
    const labelClass = `block mb-1.5 text-sm font-semibold ${dl ? "text-gray-200" : "text-gray-700"}`;

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;
        setTimeout(() => setIsAnimating(true), 10);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => onClose(), 300);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.newPassword) { alertError("New password is required!"); return; }
        if (formData.newPassword.length < 6) { alertError("Password must be at least 6 characters!"); return; }
        if (!formData.confirmPassword) { alertError("Please confirm the new password!"); return; }
        if (formData.newPassword !== formData.confirmPassword) { alertError("Passwords do not match!"); return; }

        try {
            setLoading(true);
            await AxiosApi.put(`Person/${userId}/reset-password-admin`, {
                userId: userId,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword,
            });
            alertify.success("Password reset successfully!");
            setTimeout(() => handleClose(), 500);
        } catch (error: any) {
            const msg = error?.response?.data?.message || "Failed to reset password. Please try again.";
            alertError(msg);
        } finally {
            setLoading(false);
        }
    };

    const passwordStrength = (pwd: string) => {
        if (!pwd) return null;
        if (pwd.length < 6) return { level: "Weak", color: "text-red-500", bar: "w-1/4 bg-red-500" };
        if (pwd.length < 8) return { level: "Fair", color: "text-yellow-500", bar: "w-2/4 bg-yellow-500" };
        if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { level: "Good", color: "text-blue-500", bar: "w-3/4 bg-blue-500" };
        return { level: "Strong", color: "text-green-500", bar: "w-full bg-green-500" };
    };

    const strength = passwordStrength(formData.newPassword);

    return (
        <>
            <div className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"}`} />
            <div className={`fixed inset-0 flex items-center justify-center z-[60] p-4 pointer-events-none transition-all duration-300 ${isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                <div
                    className={`rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden pointer-events-auto transform transition-all duration-300
                    ${dl ? "bg-gray-800" : "bg-white"} ${isAnimating ? "translate-y-0" : "translate-y-4"}`}
                >
                    {/* Header */}
                    <div className={`px-6 py-4 border-b flex-shrink-0 ${dl ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                        <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${dl ? "bg-orange-900/30" : "bg-orange-100"}`}>
                                    <span className="text-lg">🔑</span>
                                </div>
                                <div>
                                    <h2 className={`text-xl font-bold ${dl ? "text-white" : "text-gray-900"}`}>
                                        Reset Password
                                    </h2>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dl ? "bg-orange-900/40 text-orange-300" : "bg-orange-100 text-orange-700"}`}>
                                            @{username}
                                        </span>
                                        <span className={`text-xs ${dl ? "text-gray-500" : "text-gray-400"}`}>
                                            {customerName}
                                        </span>
                                    </div>
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

                    <form onSubmit={handleSubmit} className="flex flex-col">
                        <div className="px-6 py-5">
                            <div className="flex flex-col gap-4">

                                {/* Warning banner */}
                                <div className={`rounded-xl p-3 flex items-start gap-2 text-xs ${dl ? "bg-orange-900/20 border border-orange-700/40 text-orange-300" : "bg-orange-50 border border-orange-200 text-orange-700"}`}>
                                    <span className="text-base mt-0.5">⚠️</span>
                                    <p>The user will need to use the new password to log in after this reset.</p>
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className={labelClass}>New Password <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleInputChange}
                                            className={`${inputClass} pr-10`}
                                            placeholder="Enter new password"
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(v => !v)}
                                            className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${dl ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-600"}`}
                                        >
                                            {showNewPassword ? "🙈" : "👁️"}
                                        </button>
                                    </div>
                                    {/* Password Strength Bar */}
                                    {strength && (
                                        <div className="mt-2">
                                            <div className={`w-full h-1.5 rounded-full ${dl ? "bg-gray-700" : "bg-gray-200"}`}>
                                                <div className={`h-1.5 rounded-full transition-all duration-300 ${strength.bar}`} />
                                            </div>
                                            <p className={`text-xs mt-1 font-medium ${strength.color}`}>
                                                Password Strength: {strength.level}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm New Password */}
                                <div>
                                    <label className={labelClass}>Confirm New Password <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className={`${inputClass} pr-10 ${
                                                formData.confirmPassword && formData.newPassword !== formData.confirmPassword
                                                    ? "border-red-400 focus:border-red-500"
                                                    : formData.confirmPassword && formData.newPassword === formData.confirmPassword
                                                    ? "border-green-400 focus:border-green-500"
                                                    : ""
                                            }`}
                                            placeholder="Re-enter new password"
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(v => !v)}
                                            className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${dl ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-600"}`}
                                        >
                                            {showConfirmPassword ? "🙈" : "👁️"}
                                        </button>
                                    </div>
                                    {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                                        <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                                    )}
                                    {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                                        <p className="text-green-500 text-xs mt-1">✓ Passwords match</p>
                                    )}
                                </div>

                            </div>
                        </div>

                        {/* Footer */}
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
                                        loading ? "bg-orange-400 cursor-not-allowed" : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                                    } text-white disabled:opacity-50`}
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Resetting...
                                        </span>
                                    ) : "Reset Password"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default ResetPasswordForm;