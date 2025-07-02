import React, { useState } from "react";
import { HookIntergrateAPI } from "../../../CustomHook/HookIntergrateAPI";
import useFetchDataApi from "../../../CustomHook/FetchDataApi";
import alertify from "alertifyjs";
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();

    const { createData } = HookIntergrateAPI();
    const { data } = useFetchDataApi("https://localhost:7095/api/User");
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        passwordHash: "",
        passwordSalt: "",
        roleId: 1,
        profilePicture: "", // now stores base64 image
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData((prev) => ({
                ...prev,
                profilePicture: reader.result as string, // base64 image
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.passwordHash.length < 7 || formData.passwordSalt.length < 7) {
            alert("Password and Confirm Password must have atleast 8 character !!");
        } else if (formData.passwordHash !== formData.passwordSalt) {
            alert("Password and confirm Password not match !!");
        } else {
            if (data.length == 0) {
                createData("https://localhost:7095/api/User", formData, () => {
                    navigate("/");
                });
            } else {
                const userExists = data.find((item: { email?: string }) => item.email === formData.email);
                if (userExists) {
                    alertify.error("Email has created ready !!");
                } else {
                    console.log("Form Data:", formData); // you can remove this log
                    createData("https://localhost:7095/api/User", formData, () => {
                        navigate("/");
                    });
                }
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
            <form
                onSubmit={handleSubmit}
                className="bg-gradient-to-br from-gray-800 to-gray-900 p-10 rounded-3xl shadow-2xl w-full max-w-lg space-y-6"
            >
                <h2 className="text-3xl font-extrabold text-center text-green-400">
                    📝 Register Account
                </h2>

                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        className="px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 w-full"
                        required
                    />
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                        className="px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 w-full"
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 w-full col-span-2"
                        required
                    />
                    <input
                        type="password"
                        name="passwordHash"
                        placeholder="Password"
                        value={formData.passwordHash}
                        onChange={handleChange}
                        className="px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 w-full"
                        required
                    />
                    <input
                        type="password"
                        name="passwordSalt"
                        placeholder="Confirm Password"
                        value={formData.passwordSalt}
                        onChange={handleChange}
                        className="px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 w-full"
                        required
                    />
                    <select
                        name="roleId"
                        value={formData.roleId}
                        onChange={handleChange}
                        className="px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 w-full col-span-2"
                    >
                        <option value={1}>Admin</option>
                        <option value={2}>User</option>
                    </select>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="col-span-2 text-gray-300"
                    />
                </div>

                {formData.profilePicture && (
                    <img
                        src={formData.profilePicture}
                        alt="Profile Preview"
                        className="mx-auto mt-4 w-32 h-32 rounded-full object-cover"
                    />
                )}

                <button
                    type="submit"
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl text-lg font-semibold shadow-md transition transform hover:scale-105 cursor-pointer"
                >
                    ✅ Create Account
                </button>

                <p className="text-center text-gray-400 mt-4">
                    Already have an account?{" "}
                    <button onClick={() => navigate('/formlogin')} className="text-green-400 hover:underline">
                        Log In
                    </button>
                </p>
            </form>
        </div>
    );
};

export default Register;
