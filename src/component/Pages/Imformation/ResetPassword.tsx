import React, { useEffect, useState } from 'react';
import useFetchDataApi from '../../../CustomHook/FetchDataApi';
import alertify from 'alertifyjs';
import { useGlobleContextDarklight } from '../../../AllContext/context';
import { HookIntergrateAPI } from '../../../CustomHook/HookIntergrateAPI';
import { useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';

type UserProfile = {
    id: number;
    name: string;
    username: string;
    email: string;
    passwordHash: string;
    passwordSalt: string;
    profilePicture: string;
    createdAt: string;
    updatedAt: string;
    roleId: number;
};

const ChangePasswordForm: React.FC = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<UserProfile | null>(null);

    const { updateData } = HookIntergrateAPI();
    const { data } = useFetchDataApi('https://localhost:7095/api/User');
    const email = sessionStorage.getItem('email');
    const { darkLight } = useGlobleContextDarklight();
    const navigate = useNavigate();

    useEffect(() => {
        const userInformation = data.find((item: UserProfile) => item.email === email);
        setUser(userInformation || null);
    }, [data, email]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        if (!oldPassword || !newPassword || !confirmPassword) {
            setMessage('❌ Please fill in all fields.');
            return;
        }

        if (!user) {
            setMessage('❌ User not found.');
            return;
        }

        // Compare old password with stored hash
        const isOldPasswordCorrect = bcrypt.compareSync(oldPassword, user.passwordHash); // for compare pasword 
        if (!isOldPasswordCorrect) {
            setMessage('❌⚠️ Old password is incorrect!');
            alertify.warning('❌⚠️ Old password is incorrect!');
            return;
        }

        if (oldPassword === newPassword) {
            setMessage('⚠️ New password cannot be the same as old password.');
            alertify.warning('⚠️ New password cannot be the same as old password.');
            return;
        }

        if (newPassword.length < 8) {
            setMessage('❌ Password must be at least 8 characters.');
            alertify.warning('❌ Password must be at least 8 characters.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage('❌ New password and confirm password do not match.');
            alertify.warning('❌ New password and confirm password do not match.');
            return;
        }

        setLoading(true);

        // // Hash new password
        // const salt = bcrypt.genSaltSync(10);
        // const hashedPassword = bcrypt.hashSync(newPassword, salt);

        // Prepare update
        const updatePayload = {
            ...user,
            passwordHash: newPassword,
            passwordSalt: confirmPassword,
        };

        updateData('https://localhost:7095/api/User', user.id, updatePayload, () => {
            alertify.success('✅✅ Changed password successfully!');
            setLoading(false);
            setMessage('✅✅ Password changed successfully!');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        });
    };

    return (
        <div className={`min-h-screen flex items-center justify-center ${darkLight ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
            <form
                onSubmit={handleSubmit}
                className={`p-10 rounded-3xl shadow-2xl w-full max-w-md space-y-6 
                    ${darkLight ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-200 to-gray-100 border border-gray-300'}
                `}
            >
                <h2 className={`text-3xl font-extrabold text-center ${darkLight ? 'text-blue-400' : 'text-blue-600'}`}>
                    🔒 Change Password
                </h2>

                <input
                    type="password"
                    placeholder="Old Password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 
                        ${darkLight ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}
                    `}
                    required
                />

                <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 
                        ${darkLight ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}
                    `}
                    required
                />

                <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 
                        ${darkLight ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}
                    `}
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-xl text-lg font-semibold shadow-md transition 
                        ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}
                    `}
                >
                    {loading ? 'Saving...' : 'Change Password'}
                </button>

                {message && (
                    <>
                        <p className={`text-sm mt-2 text-center ${message.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>
                            {message}
                        </p>

                        {message === '❌⚠️ Old password is incorrect!' && (
                            <div className="text-center mt-2">
                                <button
                                    type="button"
                                    onClick={() => navigate('/forgotpassword')}
                                    className="text-red-400 hover:underline text-sm cursor-pointer"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        )}
                    </>
                )}
            </form>
        </div>
    );
};

export default ChangePasswordForm;
