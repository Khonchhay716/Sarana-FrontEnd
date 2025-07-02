import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HookIntergrateAPI } from '../../../CustomHook/HookIntergrateAPI';
import alertify from 'alertifyjs';
import useFetchDataApi from '../../../CustomHook/FetchDataApi';
const ForgotPasswordRequestForm: React.FC = () => {
    const { state } = useLocation();
    const emails = state.emails;
    const [email, setEmail] = useState('');
    const subject = "Verify code";
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { createData } = HookIntergrateAPI();
    const { data } = useFetchDataApi('https://localhost:7095/api/User');


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        // ✅ Generate new random 6-digit code on each submit
        const randomCode = Math.floor(Math.random() * 1000000)
            .toString()
            .padStart(6, '0'); // ensure it's always 6 digits like "004273"

        if (!email) {
            setMessage('Please enter your email.');
            setLoading(false);
            return;
        }

        if (data) {
            const foundUser = data.find((item: { email: string }) => item.email === email);
            console.log("email user is ", foundUser);
            if (foundUser) {
                if (emails === email) {
                    try {
                        // Simulate API call to send code
                        if (email) {
                            createData("https://localhost:7095/api/Mail/send", { To: email, subject: subject, body: randomCode }, () => { });
                            alertify.success("Has send code ");
                        }
                        setTimeout(() => {
                            setMessage(`✅ Code sent to ${email}`);
                            setLoading(false);
                            navigate('/verify-code', { state: { email, randomCode } }); // pass email to next step
                        }, 1000);
                    } catch (error) {
                        setMessage('❌❌❌ Failed to send reset link.');
                        setLoading(false);
                    }
                } else {
                    setTimeout(() => {
                        setLoading(false);
                    }, 2000);
                    alertify.warning("❌❌❌email is not match to will email that enter in form login ");
                }
            } else {
                setTimeout(() => {
                    setLoading(false);
                }, 2000);
                alertify.warning("❌❌❌email not register yet !!!!!");
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <form
                onSubmit={handleSubmit}
                className="bg-gradient-to-br from-gray-800 to-gray-900 p-10 rounded-3xl shadow-2xl w-full max-w-md space-y-6"
            >
                <h2 className="text-3xl font-extrabold text-center text-blue-400">🔒 Forgot Password</h2>
                <p className="text-center text-sm text-gray-400">Enter your email to get the code</p>

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">Email</label>
                    <input
                        type="email"
                        className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl text-lg font-semibold shadow-md transition cursor-pointer"
                >
                    {loading ? 'Sending...' : 'Send Code'}
                </button>

                {message && (
                    <p className="text-sm text-center mt-2 text-green-400">{message}</p>
                )}
            </form>
        </div>
    );
};

export default ForgotPasswordRequestForm;
