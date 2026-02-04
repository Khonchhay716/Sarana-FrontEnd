import { useEffect, useState } from "react";
import { AxiosApi } from "../../component/Axios/Axios";
import { useGlobleContextDarklight } from "../../AllContext/context";
import { FaUser, FaCamera } from "react-icons/fa";
import { message } from "antd";
import { alertError } from "../../HtmlHelper/Alert";

interface Role {
    id: number;
    name: string;
    description: string;
}

interface UserData {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    imageProfile: string;
    isActive: boolean;
    roles: Role[];
    permissions: string[];
    createdDate: string;
}

const Profile = () => {
    const { darkLight } = useGlobleContextDarklight();
    const [user, setUser] = useState<UserData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        imageProfile: "",
        roleIds: [] as number[],
        isActive: true
    });
    const [imagePreview, setImagePreview] = useState<string>("");

    useEffect(() => {
        const stored = localStorage.getItem("CurrentUserLibrary");
        if (stored) {
            const parsed = JSON.parse(stored);
            getCurrentUser(parsed?.userId);
        }
    }, []);

    const getCurrentUser = async (userid: number) => {
        try {
            setLoading(true);
            const res = await AxiosApi.get(`Users/${userid}`);
            const userData = res?.data?.data;
            setUser(userData);
            setFormData({
                username: userData.username,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                phoneNumber: userData.phoneNumber,
                imageProfile: userData.imageProfile,
                roleIds: userData.roles?.map((r: any) => r.id) || [],
                isActive: userData.isActive ?? true
            });
            setImagePreview(userData.imageProfile);
        } catch (error) {
            console.error("Error fetching user:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alertError("Only image files (JPEG, PNG, GIF, WEBP) are allowed!");
            e.target.value = ""; // Reset input
            return;
        }

        // Validate file size (12 MB max)
        const maxSize = 12 * 1024 * 1024; // 12 MB
        if (file.size > maxSize) {
            alertError("Image size must be less than 12 MB!");
            e.target.value = ""; // Reset input
            return;
        }

        try {
            setUploadingImage(true);
            
            // Create FormData to upload file
            const formData = new FormData();
            formData.append("file", file);

            // Upload to backend
            const res = await AxiosApi.post("FileStorage/upload", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Backend returns URL
            if (res?.data?.url) {
                setImagePreview(res.data.url);
                setFormData(prev => ({
                    ...prev,
                    imageProfile: res.data.url
                }));
                message.success("Image uploaded successfully!");
            }

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

    const handleRemoveImage = () => {
        setImagePreview("");
        setFormData(prev => ({ ...prev, imageProfile: "" }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            setSaving(true);
            const res = await AxiosApi.put(`Users/${user.id}`, formData);
            if (res?.data?.data) {
                setTimeout(() => {
                    setUser(res.data.data);
                    setIsEditing(false);
                    message.success("Update Profile successfully !!");
                }, 500);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alertError("Failed to update profile. Please try again.");
        } finally {
            setTimeout(() => {
                setSaving(false);
            }, 500);
        }
    };

    const handleCancel = () => {
        if (user) {
            setFormData({
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                imageProfile: user.imageProfile,
                roleIds: user.roles?.map((r: any) => r.id) || [],
                isActive: user.isActive ?? true
            });
            setImagePreview(user.imageProfile);
        }
        setIsEditing(false);
    };

    const inputClass = `w-full px-4 py-2.5 rounded-lg border transition-all duration-200 ${darkLight
        ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:bg-gray-700 focus:border-blue-500"
        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-blue-50/30"
        } focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60`;

    const labelClass = `block mb-1.5 text-sm font-semibold ${darkLight ? "text-gray-200" : "text-gray-700"}`;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl font-semibold">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-red-500 text-white px-6 py-4 rounded-lg text-xl">User not found</div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            {/* Header */}
            <div className='flex justify-between items-center mb-6'>
                <div className='flex items-center gap-3'>
                    <div className="relative">
                        <FaUser className="w-[40px] h-[40px] drop-shadow-lg" />
                    </div>
                    <h3 className={`font-bold text-2xl ${darkLight ? 'text-white' : 'text-gray-900'}`}>
                        MY PROFILE
                    </h3>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className='bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-md transition-colors'
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            {/* Profile Card */}
            <div className={`rounded-2xl shadow-xl ${darkLight ? 'bg-gray-800' : 'bg-white'}`}>
                <form onSubmit={handleSubmit}>
                    {/* Profile Image Section */}
                    <div className={`p-6 border-b ${darkLight ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="relative">
                                {imagePreview ? (
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt="Profile"
                                            className="w-32 h-32 rounded-full object-cover border-4 border-sky-500 shadow-lg"
                                        />
                                        {/* Loading overlay for image upload */}
                                        {uploadingImage && (
                                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                                <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                            </div>
                                        )}
                                        {/* Remove image button (only in edit mode) */}
                                        {isEditing && !uploadingImage && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                                                aria-label="Remove image"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-sky-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-sky-500 shadow-lg">
                                        {formData.firstName?.[0]}{formData.lastName?.[0]}
                                    </div>
                                )}
                                
                                {/* Camera button for upload (only in edit mode) */}
                                {isEditing && (
                                    <label
                                        htmlFor="image-upload"
                                        className={`absolute bottom-0 right-0 bg-sky-500 hover:bg-sky-600 text-white p-2 rounded-full shadow-lg transition-colors ${
                                            uploadingImage ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                                        }`}
                                    >
                                        <FaCamera className="w-4 h-4" />
                                        <input
                                            id="image-upload"
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                            onChange={handleImageChange}
                                            disabled={uploadingImage}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                            
                            <div className="flex-1 text-center md:text-left">
                                <h2 className={`text-2xl font-bold ${darkLight ? 'text-white' : 'text-gray-900'}`}>
                                    {formData.firstName} {formData.lastName}
                                </h2>
                                <p className={`text-sm mt-1 ${darkLight ? 'text-gray-400' : 'text-gray-500'}`}>
                                    @{formData.username}
                                </p>
                                {isEditing && (
                                    <p className={`text-xs mt-2 ${darkLight ? 'text-gray-400' : 'text-gray-500'}`}>
                                        📷 Click camera icon to upload image (JPEG, PNG, GIF, WEBP • Max 12MB)
                                    </p>
                                )}
                                <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${user.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {user.isActive ? "Active" : "Inactive"}
                                    </span>
                                    {user.roles.map((role) => (
                                        <span
                                            key={role.id}
                                            className="inline-block px-3 py-1 bg-sky-100 text-sky-800 rounded-full text-sm font-medium"
                                        >
                                            {role.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div className="p-6">
                        <h3 className={`text-lg font-bold mb-4 ${darkLight ? 'text-white' : 'text-gray-900'}`}>
                            Personal Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="firstName" className={labelClass}>
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    required
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label htmlFor="lastName" className={labelClass}>
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    required
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label htmlFor="username" className={labelClass}>
                                    Username <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    required
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className={labelClass}>
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    required
                                    className={inputClass}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="phoneNumber" className={labelClass}>
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Account Information */}
                    <div className={`p-6 border-t ${isEditing ? '' : 'mb-10'} ${darkLight ? 'border-gray-700' : 'border-gray-200'}`}>
                        <h3 className={`text-lg font-bold mb-4 ${darkLight ? 'text-white' : 'text-gray-900'}`}>
                            Account Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className={`p-4 rounded-lg ${darkLight ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                <span className={`text-sm font-semibold uppercase tracking-wide block mb-1 ${darkLight ? 'text-gray-400' : 'text-gray-600'}`}>
                                    User ID
                                </span>
                                <span className={`text-lg font-medium ${darkLight ? 'text-white' : 'text-gray-900'}`}>
                                    {user.id}
                                </span>
                            </div>
                            <div className={`p-4 rounded-lg ${darkLight ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                <span className={`text-sm font-semibold uppercase tracking-wide block mb-1 ${darkLight ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Member Since
                                </span>
                                <span className={`text-lg font-medium ${darkLight ? 'text-white' : 'text-gray-900'}`}>
                                    {new Date(user.createdDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className={`px-6 py-4 border-t mb-10 ${darkLight ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={saving || uploadingImage}
                                    className={`px-6 py-2.5 rounded-lg font-medium transition-all ${darkLight
                                        ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || uploadingImage}
                                    className={`px-8 py-2.5 rounded-lg font-medium transition-all shadow-lg ${saving || uploadingImage
                                        ? "bg-sky-400 cursor-not-allowed"
                                        : "bg-sky-500 hover:bg-sky-600 hover:shadow-xl"
                                        } text-white disabled:opacity-50`}
                                >
                                    {saving ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Saving...
                                        </span>
                                    ) : uploadingImage ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Uploading...
                                        </span>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Profile;