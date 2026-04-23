import { useEffect, useRef, useState } from "react";
import { AxiosApi } from "../../component/Axios/Axios";
import { useGlobleContextDarklight } from "../../AllContext/context";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaEnvelope, FaKey, FaArrowLeft } from "react-icons/fa";
import { message, Modal } from "antd";
import { alertError } from "../../HtmlHelper/Alert";
import { useFileUpload } from "../../component/FileUpload/Usefileupload";

interface Role { id: number; name: string; description: string; }
interface StaffData { id: number; firstName: string; lastName: string; phoneNumber: string; position: string; salary: number; imageProfile: string; }
interface CustomerData { id: number; firstName: string; lastName: string; phoneNumber: string; totalPoint: number; imageProfile: string; }
interface UserData {
    id: number; username: string; email: string; isActive: boolean; type: string; createdDate: string;
    roles: Role[]; permissions: string[]; staff: StaffData | null; customer: CustomerData | null;
}

type PwStep = "reset" | "forgot_email" | "forgot_code" | "forgot_newpw";

// ─── OTP Input Component (6 boxes) ───
const OtpInput = ({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) => {
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
    const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

    const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, "").slice(-1);
        const next = [...digits];
        next[i] = val;
        onChange(next.join(""));
        if (val && i < 5) inputsRef.current[i + 1]?.focus();
    };

    const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (digits[i]) {
                const next = [...digits]; next[i] = ""; onChange(next.join(""));
            } else if (i > 0) {
                inputsRef.current[i - 1]?.focus();
                const next = [...digits]; next[i - 1] = ""; onChange(next.join(""));
            }
        }
        if (e.key === "ArrowLeft" && i > 0) inputsRef.current[i - 1]?.focus();
        if (e.key === "ArrowRight" && i < 5) inputsRef.current[i + 1]?.focus();
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        onChange(pasted.padEnd(6, "").slice(0, 6));
        const focusIdx = Math.min(pasted.length, 5);
        inputsRef.current[focusIdx]?.focus();
    };

    return (
        <div className="flex gap-2 justify-center">
            {digits.map((d, i) => (
                <input
                    key={i}
                    ref={el => { inputsRef.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    disabled={disabled}
                    onChange={e => handleChange(i, e)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    onFocus={e => e.target.select()}
                    className={`w-10 h-12 text-center text-lg font-bold rounded-xl border-2 transition-all duration-200 outline-none
                        ${d ? "border-sky-500 bg-sky-50 text-sky-700" : "border-gray-300 bg-white text-gray-900"}
                        focus:border-sky-500 focus:bg-sky-50 focus:ring-2 focus:ring-sky-200
                        disabled:opacity-50 disabled:cursor-not-allowed`}
                />
            ))}
        </div>
    );
};

const Profile = () => {
    const { darkLight } = useGlobleContextDarklight();
    const [user, setUser] = useState<UserData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const hasInitialized = useRef(false);

    const {
        preview: imagePreview, uploading: uploadingImage, selecting,
        hasNewFile, isRemoved,
        handleFileChange: handleImageChange, handleRemove: handleRemoveImage,
        deleteImage, uploadFile, setExistingUrl,
    } = useFileUpload();

    const [personForm, setPersonForm] = useState({ username: "", email: "", roleIds: [] as number[], isActive: true, staffId: null as number | null, customerId: null as number | null });
    const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", phoneNumber: "", imageProfile: "", position: "", salary: 0 });

    // Password Modal
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [pwStep, setPwStep] = useState<PwStep>("reset");

    // Step reset
    const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [pwError, setPwError] = useState("");

    // Step forgot_email
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotEmailLoading, setForgotEmailLoading] = useState(false);
    const [forgotEmailError, setForgotEmailError] = useState("");

    // Step forgot_code (6-digit OTP)
    const [forgotCode, setForgotCode] = useState("");
    const [forgotCodeLoading, setForgotCodeLoading] = useState(false);
    const [forgotCodeError, setForgotCodeError] = useState("");
    const [resendLoading, setResendLoading] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Step forgot_newpw
    const [forgotNewPw, setForgotNewPw] = useState("");
    const [forgotConfirmPw, setForgotConfirmPw] = useState("");
    const [showForgotNewPw, setShowForgotNewPw] = useState(false);
    const [showForgotConfirmPw, setShowForgotConfirmPw] = useState(false);
    const [forgotNewPwLoading, setForgotNewPwLoading] = useState(false);
    const [forgotNewPwError, setForgotNewPwError] = useState("");

    // Helper: get error message from API response
    const getApiError = (error: any, fallback: string) =>
        error?.response?.data?.error || error?.response?.data?.message || fallback;

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;
        const stored = localStorage.getItem("CurrentUserLibrary");
        if (stored) fetchUser(JSON.parse(stored)?.userId);
    }, []);

    const fetchUser = async (userId: number) => {
        try {
            setLoading(true);
            const res = await AxiosApi.get(`Person/${userId}`);
            const data: UserData = res?.data?.data;
            setUser(data);
            setPersonForm({ username: data.username, email: data.email, roleIds: data.roles?.map(r => r.id) || [], isActive: data.isActive, staffId: data.staff?.id || null, customerId: data.customer?.id || null });
            if (data.type === "Staff" && data.staff) {
                setProfileForm({ firstName: data.staff.firstName || "", lastName: data.staff.lastName || "", phoneNumber: data.staff.phoneNumber || "", imageProfile: data.staff.imageProfile || "", position: data.staff.position || "", salary: data.staff.salary || 0 });
                if (data.staff.imageProfile) setExistingUrl(data.staff.imageProfile);
            } else if (data.type === "Customer" && data.customer) {
                setProfileForm({ firstName: data.customer.firstName || "", lastName: data.customer.lastName || "", phoneNumber: data.customer.phoneNumber || "", imageProfile: data.customer.imageProfile || "", position: "", salary: 0 });
                if (data.customer.imageProfile) setExistingUrl(data.customer.imageProfile);
            }
        } catch (error) { console.error("Error fetching user:", error); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            setSaving(true);
            let imageUrl = profileForm.imageProfile;
            if (isRemoved) { await deleteImage(profileForm.imageProfile); imageUrl = ""; }
            else if (hasNewFile) {
                await deleteImage(profileForm.imageProfile);
                const uploadedUrl = await uploadFile();
                if (!uploadedUrl) { setSaving(false); return; }
                imageUrl = uploadedUrl;
            }
            await AxiosApi.put(`Person/${user.id}`, { username: personForm.username, email: personForm.email, isActive: personForm.isActive, roleIds: personForm.roleIds, staffId: personForm.staffId, customerId: personForm.customerId });
            if (user.type === "Staff" && user.staff?.id) {
                await AxiosApi.put(`Staff/${user.staff.id}`, { firstName: profileForm.firstName, lastName: profileForm.lastName, imageProfile: imageUrl, phoneNumber: profileForm.phoneNumber, position: profileForm.position, salary: profileForm.salary, status: true });
            } else if (user.type === "Customer" && user.customer?.id) {
                await AxiosApi.put(`Customer/${user.customer.id}`, { firstName: profileForm.firstName, lastName: profileForm.lastName, imageProfile: imageUrl, phoneNumber: profileForm.phoneNumber, status: true });
            }
            message.success("Profile updated successfully!");
            setIsEditing(false);
            const stored = localStorage.getItem("CurrentUserLibrary");
            if (stored) fetchUser(JSON.parse(stored)?.userId);
        } catch (error: any) {
            if (hasNewFile && imagePreview) await deleteImage(imagePreview);
            alertError(getApiError(error, "Failed to update profile."));
        } finally { setSaving(false); }
    };

    const handleCancel = () => {
        if (!user) return;
        setPersonForm({ username: user.username, email: user.email, roleIds: user.roles?.map(r => r.id) || [], isActive: user.isActive, staffId: user.staff?.id || null, customerId: user.customer?.id || null });
        if (user.type === "Staff" && user.staff) {
            setProfileForm({ firstName: user.staff.firstName || "", lastName: user.staff.lastName || "", phoneNumber: user.staff.phoneNumber || "", imageProfile: user.staff.imageProfile || "", position: user.staff.position || "", salary: user.staff.salary || 0 });
            setExistingUrl(user.staff.imageProfile || "");
        } else if (user.type === "Customer" && user.customer) {
            setProfileForm({ firstName: user.customer.firstName || "", lastName: user.customer.lastName || "", phoneNumber: user.customer.phoneNumber || "", imageProfile: user.customer.imageProfile || "", position: "", salary: 0 });
            setExistingUrl(user.customer.imageProfile || "");
        }
        setIsEditing(false);
    };

    const validateNewPassword = (pw: string): string => {
        if (!pw) return "New Password is required!";
        if (pw.length < 8) return "Password must be at least 8 characters!";
        if (!/[A-Z]/.test(pw)) return "Must contain at least one uppercase letter (A-Z)!";
        if (!/[a-z]/.test(pw)) return "Must contain at least one lowercase letter (a-z)!";
        if (!/[0-9]/.test(pw)) return "Must contain at least one number (0-9)!";
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) return "Must contain at least one special character (!@#$%...)!";
        return "";
    };

    const handleResetPassword = async () => {
        if (!user) return;
        setPwError("");
        if (!passwordForm.currentPassword) { setPwError("Current Password is required!"); return; }
        const err = validateNewPassword(passwordForm.newPassword);
        if (err) { setPwError(err); return; }
        if (!passwordForm.confirmPassword) { setPwError("Confirm Password is required!"); return; }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) { setPwError("New Password and Confirm Password do not match!"); return; }
        try {
            setSavingPassword(true);
            await AxiosApi.put(`Person/${user.id}/change-password`, { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword, confirmPassword: passwordForm.confirmPassword });
            message.success("Password updated successfully!");
            handleClosePasswordModal();
        } catch (error: any) {
            setPwError(getApiError(error, "Failed to update password."));
        } finally { setSavingPassword(false); }
    };

    // ─── Forgot: Send Email ─── validate email vs localStorage first
    const handleSendVerification = async () => {
        setForgotEmailError("");
        if (!forgotEmail.trim()) { setForgotEmailError("Email is required!"); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) { setForgotEmailError("Please enter a valid email address!"); return; }

        // ✅ Validate email matches localStorage
        try {
            const stored = localStorage.getItem("CurrentUserLibrary");
            if (stored) {
                const parsed = JSON.parse(stored);
                const storedEmail: string = parsed?.email || "";
                if (storedEmail && forgotEmail.toLowerCase().trim() !== storedEmail.toLowerCase().trim()) {
                    setForgotEmailError(`This email does not match your account email (${storedEmail})`);
                    return;
                }
            }
        } catch { /* ignore parse errors */ }

        try {
            setForgotEmailLoading(true);
            await AxiosApi.post("Mail/send-verification", { email: forgotEmail });
            message.success("Verification code sent!");
            setPwStep("forgot_code");
            startResendCountdown();
        } catch (error: any) {
            setForgotEmailError(getApiError(error, "Failed to send verification email."));
        } finally { setForgotEmailLoading(false); }
    };

    const handleVerifyCode = async () => {
        setForgotCodeError("");
        if (forgotCode.length < 6) { setForgotCodeError("Please enter the complete 6-digit code!"); return; }
        try {
            setForgotCodeLoading(true);
            await AxiosApi.post("Mail/verify-code", { email: forgotEmail, code: forgotCode });
            message.success("Code verified!");
            setPwStep("forgot_newpw");
        } catch (error: any) {
            setForgotCodeError(getApiError(error, "Invalid or expired code."));
            setForgotCode(""); // clear boxes on wrong code
        } finally { setForgotCodeLoading(false); }
    };

    const startResendCountdown = () => {
        setResendCountdown(60);
        if (countdownRef.current) clearInterval(countdownRef.current);
        countdownRef.current = setInterval(() => {
            setResendCountdown(v => { if (v <= 1) { clearInterval(countdownRef.current!); return 0; } return v - 1; });
        }, 1000);
    };

    const handleResendCode = async () => {
        try {
            setResendLoading(true);
            setForgotCodeError("");
            await AxiosApi.post("Mail/resend-verification", { email: forgotEmail });
            message.success("Code resent!");
            setForgotCode("");
            startResendCountdown();
        } catch (error: any) {
            setForgotCodeError(getApiError(error, "Failed to resend code."));
        } finally { setResendLoading(false); }
    };

    const handleUpdatePasswordByEmail = async () => {
        setForgotNewPwError("");
        const err = validateNewPassword(forgotNewPw);
        if (err) { setForgotNewPwError(err); return; }
        if (!forgotConfirmPw) { setForgotNewPwError("Confirm Password is required!"); return; }
        if (forgotNewPw !== forgotConfirmPw) { setForgotNewPwError("Passwords do not match!"); return; }
        try {
            setForgotNewPwLoading(true);
            await AxiosApi.put("Person/update-password-by-email", { email: forgotEmail, newPassword: forgotNewPw });
            message.success("Password updated successfully!");
            handleClosePasswordModal();
        } catch (error: any) {
            setForgotNewPwError(getApiError(error, "Failed to update password."));
        } finally { setForgotNewPwLoading(false); }
    };

    const handleClosePasswordModal = () => {
        setShowPasswordModal(false);
        setPwStep("reset");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setPwError("");
        setForgotEmail(""); setForgotEmailError("");
        setForgotCode(""); setForgotCodeError("");
        setForgotNewPw(""); setForgotConfirmPw(""); setForgotNewPwError("");
        setShowCurrentPw(false); setShowNewPw(false); setShowConfirmPw(false);
        setShowForgotNewPw(false); setShowForgotConfirmPw(false);
        if (countdownRef.current) clearInterval(countdownRef.current);
        setResendCountdown(0);
    };

    const dl = darkLight;

    const inputClass = `w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border transition-all duration-200 text-sm ${dl
        ? "bg-gray-700/50 border-gray-600 text-gray-100 focus:border-blue-500"
        : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:bg-blue-50/30"
    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60`;

    const labelClass = `block mb-1.5 text-xs sm:text-sm font-semibold ${dl ? "text-gray-200" : "text-gray-700"}`;
    const pwInput = `w-full px-4 py-2.5 rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 pr-12 bg-white border-gray-300 text-gray-900 focus:border-blue-500`;

    const ErrorBox = ({ msg }: { msg: string }) => !msg ? null : (
        <div className="flex items-start gap-2 mt-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
            <span className="text-red-500 text-sm mt-0.5 flex-shrink-0">⚠</span>
            <p className="text-red-600 text-xs leading-relaxed">{msg}</p>
        </div>
    );

    const Spinner = () => (
        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <svg className="animate-spin h-8 w-8 text-sky-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
        </div>
    );

    if (!user) return <div className="flex items-center justify-center min-h-[60vh] text-red-500 font-bold text-lg">User not found</div>;

    const isNoneType = user.type === "None";
    const isStaff = user.type === "Staff";

    return (
        <div className="p-3 sm:p-4 md:p-6">

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-6">
                <div className="flex items-center gap-2">
                    <FaUser className={`w-6 h-6 sm:w-8 sm:h-8 drop-shadow-lg ${dl ? "text-white" : "text-gray-800"}`} />
                    <h3 className={`font-bold text-lg sm:text-2xl ${dl ? "text-white" : "text-gray-900"}`}>MY PROFILE</h3>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button type="button" onClick={() => setShowPasswordModal(true)}
                        className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors">
                        <FaLock className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Reset Password</span>
                        <span className="sm:hidden">Password</span>
                    </button>
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)}
                            className="bg-sky-500 hover:bg-sky-600 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors">
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            <div className={`rounded-2xl shadow-xl ${dl ? "bg-gray-800" : "bg-white"}`}>
                <form onSubmit={handleSubmit}>
                    {/* Profile Banner */}
                    <div className={`p-4 sm:p-6 border-b ${dl ? "border-gray-700" : "border-gray-200"}`}>
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                            <div className="relative flex-shrink-0">
                                {!isNoneType ? (
                                    <>
                                        <img src={imagePreview || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8MmaS1S0FTclHTMMLicf-O0tOGth44cBGt03HQ4jh3phLijQ_k17nFf4eyrqyxHHkgQwLSzwIViOoi81phleVJoBLZbanBf5QRODj9g&s=10"}
                                            alt="Profile" className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-sky-500" />
                                        {isEditing && imagePreview && !isRemoved && (
                                            <button type="button" onClick={handleRemoveImage} className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg text-xs">✕</button>
                                        )}
                                        {selecting && (
                                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                                <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                            </div>
                                        )}
                                        {isEditing && !selecting && (
                                            <label className="absolute bottom-0 right-0 bg-sky-500 text-white rounded-full p-1.5 sm:p-2 cursor-pointer hover:bg-sky-600 shadow-md">
                                                <input type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" className="hidden" onChange={handleImageChange} disabled={selecting} />
                                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </label>
                                        )}
                                    </>
                                ) : (
                                    <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-sky-500 flex items-center justify-center text-white border-4 border-sky-500">
                                        <FaUser className="w-10 h-10 sm:w-12 sm:h-12" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 text-center sm:text-left min-w-0">
                                <h2 className={`text-xl sm:text-2xl font-bold truncate ${dl ? "text-white" : "text-gray-900"}`}>
                                    {isNoneType ? user.username : `${profileForm.firstName} ${profileForm.lastName}`}
                                </h2>
                                <p className={`text-xs sm:text-sm mt-0.5 ${dl ? "text-gray-400" : "text-gray-500"}`}>@{user.username}</p>
                                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3 justify-center sm:justify-start">
                                    <span className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium ${user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                        {user.isActive ? "Active" : "Inactive"}
                                    </span>
                                    {user.roles?.map(role => (
                                        <span key={role.id} className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-sky-100 text-sky-800 rounded-full text-xs font-medium">{role.name}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="p-4 sm:p-6">
                        <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${dl ? "text-white" : "text-gray-900"}`}>Personal Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                            <div>
                                <label className={labelClass}>Username</label>
                                <input type="text" value={personForm.username} onChange={e => setPersonForm(p => ({ ...p, username: e.target.value }))} disabled={!isEditing} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Email</label>
                                <input type="email" value={personForm.email} onChange={e => setPersonForm(p => ({ ...p, email: e.target.value }))} disabled={!isEditing} className={inputClass} />
                            </div>
                            {!isNoneType && (
                                <>
                                    <div>
                                        <label className={labelClass}>First Name</label>
                                        <input type="text" value={profileForm.firstName} onChange={e => setProfileForm(p => ({ ...p, firstName: e.target.value }))} disabled={!isEditing} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Last Name</label>
                                        <input type="text" value={profileForm.lastName} onChange={e => setProfileForm(p => ({ ...p, lastName: e.target.value }))} disabled={!isEditing} className={inputClass} />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>Phone Number</label>
                                        <input type="tel" value={profileForm.phoneNumber} onChange={e => setProfileForm(p => ({ ...p, phoneNumber: e.target.value }))} disabled={!isEditing} className={inputClass} />
                                    </div>
                                    {isStaff && (
                                        <div className="sm:col-span-2">
                                            <label className={labelClass}>Position</label>
                                            <input type="text" value={profileForm.position} onChange={e => setProfileForm(p => ({ ...p, position: e.target.value }))} disabled={!isEditing} className={inputClass} />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className={`p-4 sm:p-6 border-t ${isEditing ? '' : 'mb-6 sm:mb-10'} ${dl ? "border-gray-700" : "border-gray-200"}`}>
                        <div className="grid grid-cols-2 gap-3 sm:gap-5">
                            <div className={`p-3 sm:p-4 rounded-lg ${dl ? "bg-gray-700/50" : "bg-gray-50"}`}>
                                <span className="text-[10px] sm:text-xs font-bold uppercase block text-gray-500 mb-1">User ID</span>
                                <span className={`text-base sm:text-lg font-medium ${dl ? "text-white" : "text-gray-900"}`}>{user.id}</span>
                            </div>
                            <div className={`p-3 sm:p-4 rounded-lg ${dl ? "bg-gray-700/50" : "bg-gray-50"}`}>
                                <span className="text-[10px] sm:text-xs font-bold uppercase block text-gray-500 mb-1">Member Since</span>
                                <span className={`text-sm sm:text-lg font-medium ${dl ? "text-white" : "text-gray-900"}`}>{new Date(user.createdDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <div className={`px-4 sm:px-6 py-3 sm:py-4 border-t flex justify-end gap-2 sm:gap-3 mb-6 sm:mb-10 ${dl ? "border-gray-700" : "border-gray-200"}`}>
                            <button type="button" onClick={handleCancel} className="px-4 sm:px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium">Cancel</button>
                            <button type="submit" disabled={saving || uploadingImage} className="px-5 sm:px-8 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg shadow-lg text-sm font-medium disabled:opacity-60">
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* ═══ PASSWORD MODAL ═══ */}
            <Modal
                open={showPasswordModal}
                onCancel={handleClosePasswordModal}
                footer={null}
                centered
                maskClosable={false}
                width="90%"
                style={{ maxWidth: 460 }}
                title={
                    <div className="flex items-center gap-2 text-base sm:text-lg font-bold">
                        {pwStep !== "reset" && (
                            <button type="button" onClick={() => {
                                if (pwStep === "forgot_email") setPwStep("reset");
                                else if (pwStep === "forgot_code") { setPwStep("forgot_email"); setForgotCode(""); setForgotCodeError(""); }
                                else if (pwStep === "forgot_newpw") setPwStep("forgot_code");
                            }} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 mr-1">
                                <FaArrowLeft className="w-3 h-3 text-gray-500" />
                            </button>
                        )}
                        {pwStep === "reset" && <><FaLock className="text-orange-500" /><span>Reset Password</span></>}
                        {pwStep === "forgot_email" && <><FaEnvelope className="text-sky-500" /><span>Forgot Password</span></>}
                        {pwStep === "forgot_code" && <><FaKey className="text-sky-500" /><span>Verify Code</span></>}
                        {pwStep === "forgot_newpw" && <><FaLock className="text-green-500" /><span>Set New Password</span></>}
                    </div>
                }
            >
                {/* Step 0: Reset with current password */}
                {pwStep === "reset" && (
                    <div className="flex flex-col gap-3 pt-2">
                        {[
                            { label: "Current Password", key: "currentPassword" as const, show: showCurrentPw, toggle: () => setShowCurrentPw(v => !v) },
                            { label: "New Password", key: "newPassword" as const, show: showNewPw, toggle: () => setShowNewPw(v => !v) },
                            { label: "Confirm Password", key: "confirmPassword" as const, show: showConfirmPw, toggle: () => setShowConfirmPw(v => !v) },
                        ].map(({ label, key, show, toggle }) => (
                            <div key={key}>
                                <label className="block mb-1.5 text-xs sm:text-sm font-semibold text-gray-700">
                                    {label} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input type={show ? "text" : "password"} value={passwordForm[key]}
                                        onChange={e => { setPasswordForm(p => ({ ...p, [key]: e.target.value })); setPwError(""); }}
                                        placeholder={`Enter ${label.toLowerCase()}`} className={pwInput} />
                                    <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {show ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                        <ErrorBox msg={pwError} />
                        <div className="text-right -mt-1">
                            <button type="button" onClick={() => { setPwStep("forgot_email"); setPwError(""); }}
                                className="text-xs text-sky-500 hover:text-sky-600 hover:underline font-medium">
                                Forgot password?
                            </button>
                        </div>
                        <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
                            <button type="button" onClick={handleClosePasswordModal} className="px-4 sm:px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
                            <button type="button" onClick={handleResetPassword} disabled={savingPassword}
                                className="px-4 sm:px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium shadow disabled:opacity-50">
                                {savingPassword ? <span className="flex items-center gap-2"><Spinner />Saving...</span> : "Update Password"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 1: Enter Email */}
                {pwStep === "forgot_email" && (
                    <div className="flex flex-col gap-4 pt-2">
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-sky-50 border border-sky-200">
                            <FaEnvelope className="text-sky-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-sky-700">Enter your account email. We'll send a 6-digit verification code.</p>
                        </div>
                        <div>
                            <label className="block mb-1.5 text-xs sm:text-sm font-semibold text-gray-700">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <input type="email" value={forgotEmail}
                                onChange={e => { setForgotEmail(e.target.value); setForgotEmailError(""); }}
                                onKeyDown={e => e.key === "Enter" && handleSendVerification()}
                                placeholder="Enter your account email"
                                className={pwInput + " pr-4"} />
                            <ErrorBox msg={forgotEmailError} />
                        </div>
                        <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
                            <button type="button" onClick={handleClosePasswordModal} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
                            <button type="button" onClick={handleSendVerification} disabled={forgotEmailLoading}
                                className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium shadow disabled:opacity-50">
                                {forgotEmailLoading ? <span className="flex items-center gap-2"><Spinner />Sending...</span> : "Send Code"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Verify Code - 6 OTP Boxes */}
                {pwStep === "forgot_code" && (
                    <div className="flex flex-col gap-4 pt-2">
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
                            <FaKey className="text-green-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-green-700">
                                6-digit code sent to <span className="font-bold">{forgotEmail}</span>. Check your inbox.
                            </p>
                        </div>

                        {/* 6 OTP Boxes */}
                        <div>
                            <label className="block mb-3 text-xs sm:text-sm font-semibold text-gray-700 text-center">
                                Verification Code <span className="text-red-500">*</span>
                            </label>
                            <OtpInput
                                value={forgotCode}
                                onChange={(v) => { setForgotCode(v); setForgotCodeError(""); }}
                                disabled={forgotCodeLoading}
                            />
                            <ErrorBox msg={forgotCodeError} />
                        </div>

                        {/* Resend */}
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Didn't receive the code?</span>
                            {resendCountdown > 0 ? (
                                <span className="text-xs text-gray-400 font-medium">Resend in {resendCountdown}s</span>
                            ) : (
                                <button type="button" onClick={handleResendCode} disabled={resendLoading}
                                    className="text-xs text-sky-500 hover:text-sky-600 font-semibold hover:underline disabled:opacity-50">
                                    {resendLoading ? "Resending..." : "Resend Code"}
                                </button>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
                            <button type="button" onClick={handleClosePasswordModal} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
                            <button type="button" onClick={handleVerifyCode} disabled={forgotCodeLoading || forgotCode.length < 6}
                                className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium shadow disabled:opacity-50">
                                {forgotCodeLoading ? <span className="flex items-center gap-2"><Spinner />Verifying...</span> : "Verify Code"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Set New Password */}
                {pwStep === "forgot_newpw" && (
                    <div className="flex flex-col gap-3 pt-2">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
                            <span className="text-lg">✅</span>
                            <p className="text-xs text-green-700 font-medium">Email verified! Now set your new password.</p>
                        </div>
                        {[
                            { label: "New Password", val: forgotNewPw, setVal: setForgotNewPw, show: showForgotNewPw, toggle: () => setShowForgotNewPw(v => !v), ph: "Enter new password" },
                            { label: "Confirm Password", val: forgotConfirmPw, setVal: setForgotConfirmPw, show: showForgotConfirmPw, toggle: () => setShowForgotConfirmPw(v => !v), ph: "Re-enter new password" },
                        ].map(({ label, val, setVal, show, toggle, ph }) => (
                            <div key={label}>
                                <label className="block mb-1.5 text-xs sm:text-sm font-semibold text-gray-700">
                                    {label} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input type={show ? "text" : "password"} value={val}
                                        onChange={e => { setVal(e.target.value); setForgotNewPwError(""); }}
                                        placeholder={ph} className={pwInput} />
                                    <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {show ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                        <ErrorBox msg={forgotNewPwError} />
                        <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
                            <button type="button" onClick={handleClosePasswordModal} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
                            <button type="button" onClick={handleUpdatePasswordByEmail} disabled={forgotNewPwLoading}
                                className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium shadow disabled:opacity-50">
                                {forgotNewPwLoading ? <span className="flex items-center gap-2"><Spinner />Saving...</span> : "Update Password"}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Profile;