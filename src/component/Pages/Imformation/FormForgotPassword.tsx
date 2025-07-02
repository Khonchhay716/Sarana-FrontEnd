import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HookIntergrateAPI } from '../../../CustomHook/HookIntergrateAPI';
import alertify from 'alertifyjs';
import useFetchDataApi from '../../../CustomHook/FetchDataApi';
import { useGlobleContextDarklight } from '../../../AllContext/context';

const ForgotPasswordRequestForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const subject = "Verify code";
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { createData } = HookIntergrateAPI();
    const { darkLight } = useGlobleContextDarklight();
    const { data } = useFetchDataApi('https://localhost:7095/api/User');
    const emails = sessionStorage.getItem("email");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const randomCode = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

        if (!email) {
            setMessage('❌ Please enter your email.');
            setLoading(false);
            return;
        }

        const foundUser = data.find((item: { email: string }) => item.email === email);

        if (foundUser) {
            if (emails === email) {
                try {
                    createData("https://localhost:7095/api/Mail/send", {
                        To: email,
                        subject: subject,
                        body: randomCode
                    }, () => { });

                    alertify.success("✅ Code sent to email.");
                    setTimeout(() => {
                        setMessage(`✅ Code sent to ${email}`);
                        setLoading(false);
                        navigate('/formverifycode', { state: { email, randomCode } });
                    }, 1000);
                } catch (error) {
                    setMessage('❌ Failed to send reset code.');
                    setLoading(false);
                }
            } else {
                setLoading(false);
                alertify.warning("❌ Email doesn't match the login email.");
            }
        } else {
            setLoading(false);
            alertify.warning("❌ Email not registered.");
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center ${darkLight ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
            <form
                onSubmit={handleSubmit}
                className={`p-10 rounded-3xl shadow-2xl w-full max-w-md space-y-6
                    ${darkLight
                        ? 'bg-gradient-to-br from-gray-800 to-gray-900'
                        : 'bg-gradient-to-br from-gray-200 to-gray-100 border border-gray-300'}
                `}
            >
                <h2 className={`text-3xl font-extrabold text-center ${darkLight ? 'text-blue-400' : 'text-blue-600'}`}>
                    🔒 Forgot Password
                </h2>
                <p className={`text-center text-sm ${darkLight ? 'text-gray-300' : 'text-gray-600'}`}>
                    Enter your email to receive a verification code
                </p>

                <div>
                    <label className={`block text-sm font-medium mb-1 ${darkLight ? 'text-gray-300' : 'text-gray-800'}`}>
                        Email
                    </label>
                    <input
                        type="email"
                        className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500
                            ${darkLight ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}
                        `}
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-xl text-lg font-semibold shadow-md transition
                        ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}
                    `}
                >
                    {loading ? 'Sending...' : 'Send Code'}
                </button>

                {message && (
                    <p className={`text-sm mt-2 text-center ${message.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>
                        {message}
                    </p>
                )}
            </form>
        </div>
    );
};

export default ForgotPasswordRequestForm;
