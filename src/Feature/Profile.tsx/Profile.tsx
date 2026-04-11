import { useEffect, useRef, useState } from "react";
import { AxiosApi } from "../../component/Axios/Axios";
import { useGlobleContextDarklight } from "../../AllContext/context";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { message, Modal } from "antd";
import { alertError } from "../../HtmlHelper/Alert";

interface Role {
    id: number;
    name: string;
    description: string;
}

interface StaffData {
    id: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    position: string;
    salary: number;
    imageProfile: string;
}

interface CustomerData {
    id: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    totalPoint: number;
    imageProfile: string;
}

interface UserData {
    id: number;
    username: string;
    email: string;
    isActive: boolean;
    type: string;
    createdDate: string;
    roles: Role[];
    permissions: string[];
    staff: StaffData | null;
    customer: CustomerData | null;
}

const Profile = () => {
    const { darkLight } = useGlobleContextDarklight();
    const [user, setUser] = useState<UserData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState<string>("");
    const hasInitialized = useRef(false); // ✅ StrictMode guard

    const [personForm, setPersonForm] = useState({
        username: "",
        email: "",
        roleIds: [] as number[],
        isActive: true,
        staffId: null as number | null,
        customerId: null as number | null,
    });

    const [profileForm, setProfileForm] = useState({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        imageProfile: "",
        position: "",
        salary: 0,
    });

    // Reset Password State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    // ✅ StrictMode — call API only once
    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        const stored = localStorage.getItem("CurrentUserLibrary");
        if (stored) {
            const parsed = JSON.parse(stored);
            fetchUser(parsed?.userId);
        }
    }, []);

    const fetchUser = async (userId: number) => {
        try {
            setLoading(true);
            const res = await AxiosApi.get(`Person/${userId}`);
            const data: UserData = res?.data?.data;
            setUser(data);

            setPersonForm({
                username: data.username,
                email: data.email,
                roleIds: data.roles?.map((r) => r.id) || [],
                isActive: data.isActive,
                staffId: data.staff?.id || null,
                customerId: data.customer?.id || null,
            });

            if (data.type === "Staff" && data.staff) {
                setProfileForm({
                    firstName: data.staff.firstName || "",
                    lastName: data.staff.lastName || "",
                    phoneNumber: data.staff.phoneNumber || "",
                    imageProfile: data.staff.imageProfile || "",
                    position: data.staff.position || "",
                    salary: data.staff.salary || 0,
                });
                setImagePreview(data.staff.imageProfile || "");
            } else if (data.type === "Customer" && data.customer) {
                setProfileForm({
                    firstName: data.customer.firstName || "",
                    lastName: data.customer.lastName || "",
                    phoneNumber: data.customer.phoneNumber || "",
                    imageProfile: data.customer.imageProfile || "",
                    position: "",
                    salary: 0,
                });
                setImagePreview(data.customer.imageProfile || "");
            }
        } catch (error) {
            console.error("Error fetching user:", error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Upload image immediately when selected — same as BranchForm
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setUploadingImage(true);
            const fd = new FormData();
            fd.append("file", file);
            const res = await AxiosApi.post("FileStorage/upload", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const url = res?.data?.url;
            setImagePreview(url);
            setProfileForm(prev => ({ ...prev, imageProfile: url }));
        } catch (error) {
            console.error("Upload error:", error);
            alertError("Failed to upload image.");
        } finally {
            setTimeout(() => setUploadingImage(false), 500);
        }
    };

    const handleRemoveImage = () => {
        setImagePreview("");
        setProfileForm(prev => ({ ...prev, imageProfile: "" }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            setSaving(true);

            // Step 1 — Update Person
            await AxiosApi.put(`Person/${user.id}`, {
                username: personForm.username,
                email: personForm.email,
                isActive: personForm.isActive,
                roleIds: personForm.roleIds,
                staffId: personForm.staffId,
                customerId: personForm.customerId,
            });

            // Step 2 — Update Staff or Customer
            // Image already uploaded in handleImageChange, just use profileForm.imageProfile
            if (user.type === "Staff" && user.staff?.id) {
                await AxiosApi.put(`Staff/${user.staff.id}`, {
                    firstName: profileForm.firstName,
                    lastName: profileForm.lastName,
                    imageProfile: profileForm.imageProfile,
                    phoneNumber: profileForm.phoneNumber,
                    position: profileForm.position,
                    salary: profileForm.salary,
                    status: true,
                });
            } else if (user.type === "Customer" && user.customer?.id) {
                await AxiosApi.put(`Customer/${user.customer.id}`, {
                    firstName: profileForm.firstName,
                    lastName: profileForm.lastName,
                    imageProfile: profileForm.imageProfile,
                    phoneNumber: profileForm.phoneNumber,
                    status: true,
                });
            }

            message.success("Profile updated successfully!");
            setIsEditing(false);

            const stored = localStorage.getItem("CurrentUserLibrary");
            if (stored) fetchUser(JSON.parse(stored)?.userId);

        } catch (error) {
            console.error("Update failed:", error);
            alertError("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (!user) return;
        setPersonForm({
            username: user.username,
            email: user.email,
            roleIds: user.roles?.map((r) => r.id) || [],
            isActive: user.isActive,
            staffId: user.staff?.id || null,
            customerId: user.customer?.id || null,
        });
        if (user.type === "Staff" && user.staff) {
            setProfileForm({
                firstName: user.staff.firstName || "",
                lastName: user.staff.lastName || "",
                phoneNumber: user.staff.phoneNumber || "",
                imageProfile: user.staff.imageProfile || "",
                position: user.staff.position || "",
                salary: user.staff.salary || 0,
            });
            setImagePreview(user.staff.imageProfile || "");
        } else if (user.type === "Customer" && user.customer) {
            setProfileForm({
                firstName: user.customer.firstName || "",
                lastName: user.customer.lastName || "",
                phoneNumber: user.customer.phoneNumber || "",
                imageProfile: user.customer.imageProfile || "",
                position: "",
                salary: 0,
            });
            setImagePreview(user.customer.imageProfile || "");
        }
        setIsEditing(false);
    };

    const handleResetPassword = async () => {
        if (!user) return;

        if (!passwordForm.currentPassword) { alertError("Current Password is required!"); return; }
        if (!passwordForm.newPassword) { alertError("New Password is required!"); return; }
        if (passwordForm.newPassword.length < 8) { alertError("Password must be at least 8 characters!"); return; }
        if (!/[A-Z]/.test(passwordForm.newPassword)) { alertError("Password must contain at least one uppercase letter (A-Z)!"); return; }
        if (!/[a-z]/.test(passwordForm.newPassword)) { alertError("Password must contain at least one lowercase letter (a-z)!"); return; }
        if (!/[0-9]/.test(passwordForm.newPassword)) { alertError("Password must contain at least one number (0-9)!"); return; }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordForm.newPassword)) { alertError("Password must contain at least one special character (!@#$%...)!"); return; }
        if (!passwordForm.confirmPassword) { alertError("Confirm Password is required!"); return; }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) { alertError("New Password and Confirm Password do not match!"); return; }

        try {
            setSavingPassword(true);
            await AxiosApi.put(`Person/${user.id}/change-password`, {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
                confirmPassword: passwordForm.confirmPassword,
            });
            message.success("Password updated successfully!");
            handleClosePasswordModal();
        } catch (error: any) {
            alertError(error?.response?.data?.message || "Failed to update password.");
        } finally {
            setSavingPassword(false);
        }
    };

    const handleClosePasswordModal = () => {
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setShowCurrentPw(false);
        setShowNewPw(false);
        setShowConfirmPw(false);
    };

    const inputClass = `w-full px-4 py-2.5 rounded-lg border transition-all duration-200 ${
        darkLight
            ? "bg-gray-700/50 border-gray-600 text-gray-100 focus:border-blue-500"
            : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:bg-blue-50/30"
    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60`;

    const labelClass = `block mb-1.5 text-sm font-semibold ${darkLight ? "text-gray-200" : "text-gray-700"}`;

    const pwInputClass = `w-full px-4 py-2.5 rounded-lg border transition-all duration-200 ${
        darkLight
            ? "bg-gray-700/50 border-gray-600 text-gray-100 focus:border-blue-500"
            : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 pr-12`;

    if (loading) return <div className="flex items-center justify-center min-h-screen font-bold">Loading...</div>;
    if (!user) return <div className="flex items-center justify-center min-h-screen text-red-500 font-bold text-xl">User not found</div>;

    const isNoneType = user.type === "None";
    const isStaff = user.type === "Staff";

    return (
        <div className="p-4 md:p-6">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <FaUser className="w-[40px] h-[40px] drop-shadow-lg" />
                    <h3 className={`font-bold text-2xl ${darkLight ? "text-white" : "text-gray-900"}`}>MY PROFILE</h3>
                </div>
                <div className="flex gap-3">
                    <button type="button" onClick={() => setShowPasswordModal(true)}
                        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-md transition-colors">
                        <FaLock className="w-4 h-4" />
                        Reset Password
                    </button>
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)}
                            className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-md transition-colors">
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            <div className={`rounded-2xl shadow-xl ${darkLight ? "bg-gray-800" : "bg-white"}`}>
                <form onSubmit={handleSubmit}>

                    {/* Profile Banner */}
                    <div className={`p-6 border-b ${darkLight ? "border-gray-700" : "border-gray-200"}`}>
                        <div className="flex flex-col md:flex-row items-center gap-6">

                            {/* Avatar */}
                            <div className="relative mt-2 flex-shrink-0">
                                {!isNoneType ? (
                                    <>
                                        <img
                                            src={imagePreview || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8MmaS1S0FTclHTMMLicf-O0tOGth44cBGt03HQ4jh3phLijQ_k17nFf4eyrqyxHHkgQwLSzwIViOoi81phleVJoBLZbanBf5QRODj9g&s=10"}
                                            alt="Profile"
                                            className="w-32 h-32 rounded-full object-cover border-4 border-sky-500"
                                        />
                                        {/* Remove button */}
                                        {isEditing && imagePreview && (
                                            <button type="button" onClick={handleRemoveImage}
                                                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg text-xs">
                                                ✕
                                            </button>
                                        )}
                                        {/* Upload spinner */}
                                        {uploadingImage && (
                                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                                <svg className="animate-spin h-7 w-7 text-white" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                            </div>
                                        )}
                                        {/* Camera upload button */}
                                        {isEditing && !uploadingImage && (
                                            <label className="absolute bottom-0 right-0 bg-sky-500 text-white rounded-full p-2 cursor-pointer hover:bg-sky-600">
                                                <input type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                                    className="hidden" onChange={handleImageChange} disabled={uploadingImage} />
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </label>
                                        )}
                                    </>
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-sky-500 flex items-center justify-center text-white border-4 border-sky-500">
                                        <FaUser className="w-12 h-12" />
                                    </div>
                                )}
                            </div>

                            {/* Name & Roles */}
                            <div className="flex-1 text-center md:text-left">
                                <h2 className={`text-2xl font-bold ${darkLight ? "text-white" : "text-gray-900"}`}>
                                    {isNoneType ? user.username : `${profileForm.firstName} ${profileForm.lastName}`}
                                </h2>
                                <p className={`text-sm ${darkLight ? "text-gray-400" : "text-gray-500"}`}>@{user.username}</p>
                                <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                        {user.isActive ? "Active" : "Inactive"}
                                    </span>
                                    {user.roles?.map((role) => (
                                        <span key={role.id} className="px-3 py-1 bg-sky-100 text-sky-800 rounded-full text-sm font-medium">
                                            {role.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="p-6">
                        <h3 className={`text-lg font-bold mb-4 ${darkLight ? "text-white" : "text-gray-900"}`}>Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className={labelClass}>Username</label>
                                <input type="text" value={personForm.username}
                                    onChange={e => setPersonForm(p => ({ ...p, username: e.target.value }))}
                                    disabled={!isEditing} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Email</label>
                                <input type="email" value={personForm.email}
                                    onChange={e => setPersonForm(p => ({ ...p, email: e.target.value }))}
                                    disabled={!isEditing} className={inputClass} />
                            </div>
                            {!isNoneType && (
                                <>
                                    <div>
                                        <label className={labelClass}>First Name</label>
                                        <input type="text" value={profileForm.firstName}
                                            onChange={e => setProfileForm(p => ({ ...p, firstName: e.target.value }))}
                                            disabled={!isEditing} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Last Name</label>
                                        <input type="text" value={profileForm.lastName}
                                            onChange={e => setProfileForm(p => ({ ...p, lastName: e.target.value }))}
                                            disabled={!isEditing} className={inputClass} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Phone Number</label>
                                        <input type="tel" value={profileForm.phoneNumber}
                                            onChange={e => setProfileForm(p => ({ ...p, phoneNumber: e.target.value }))}
                                            disabled={!isEditing} className={inputClass} />
                                    </div>
                                    {isStaff && (
                                        <div className="md:col-span-2">
                                            <label className={labelClass}>Position</label>
                                            <input type="text" value={profileForm.position}
                                                onChange={e => setProfileForm(p => ({ ...p, position: e.target.value }))}
                                                disabled={!isEditing} className={inputClass} />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className={`p-6 border-t ${isEditing ? '' : 'mb-10'} ${darkLight ? "border-gray-700" : "border-gray-200"}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className={`p-4 rounded-lg ${darkLight ? "bg-gray-700/50" : "bg-gray-50"}`}>
                                <span className="text-xs font-bold uppercase block text-gray-500 mb-1">User ID</span>
                                <span className={`text-lg font-medium ${darkLight ? "text-white" : "text-gray-900"}`}>{user.id}</span>
                            </div>
                            <div className={`p-4 rounded-lg ${darkLight ? "bg-gray-700/50" : "bg-gray-50"}`}>
                                <span className="text-xs font-bold uppercase block text-gray-500 mb-1">Member Since</span>
                                <span className={`text-lg font-medium ${darkLight ? "text-white" : "text-gray-900"}`}>
                                    {new Date(user.createdDate).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className={`px-6 py-4 border-t flex justify-end gap-3 mb-10 ${darkLight ? "border-gray-700" : "border-gray-200"}`}>
                            <button type="button" onClick={handleCancel}
                                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg">
                                Cancel
                            </button>
                            <button type="submit" disabled={saving || uploadingImage}
                                className="px-8 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg shadow-lg disabled:opacity-60">
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* Reset Password Modal */}
            <Modal
                open={showPasswordModal}
                onCancel={handleClosePasswordModal}
                footer={null}
                centered
                title={
                    <div className="flex items-center gap-2 text-lg font-bold">
                        <FaLock className="text-orange-500" />
                        <span>Reset Password</span>
                    </div>
                }
            >
                <div className="flex flex-col gap-4 pt-2">
                    <div>
                        <label className="block mb-1.5 text-sm font-semibold text-gray-700">
                            Current Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input type={showCurrentPw ? "text" : "password"}
                                value={passwordForm.currentPassword}
                                onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                                placeholder="Enter current password" className={pwInputClass} />
                            <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showCurrentPw ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block mb-1.5 text-sm font-semibold text-gray-700">
                            New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input type={showNewPw ? "text" : "password"}
                                value={passwordForm.newPassword}
                                onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                                placeholder="Enter new password" className={pwInputClass} />
                            <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showNewPw ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block mb-1.5 text-sm font-semibold text-gray-700">
                            Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input type={showConfirmPw ? "text" : "password"}
                                value={passwordForm.confirmPassword}
                                onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                                placeholder="Re-enter new password" className={pwInputClass} />
                            <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showConfirmPw ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                        <button type="button" onClick={handleClosePasswordModal}
                            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium">
                            Cancel
                        </button>
                        <button type="button" onClick={handleResetPassword} disabled={savingPassword}
                            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium shadow disabled:opacity-50 disabled:cursor-not-allowed">
                            {savingPassword ? "Saving..." : "Update Password"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Profile;