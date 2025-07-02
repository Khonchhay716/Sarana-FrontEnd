import alertify from 'alertifyjs';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGlobleContextDarklight } from '../../../AllContext/context';

const ForgotPasswordVerifyForm: React.FC = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const email = state?.email || '';
    const codes = state?.randomCode || '';

    const [code, setCode] = useState(Array(6).fill(''));
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showResend, setShowResend] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const inputsRef = useRef<HTMLInputElement[]>([]);
    const { darkLight } = useGlobleContextDarklight(); // ✅ darkLight from context

    useEffect(() => {
        if (timeLeft <= 0) return;
        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft]);

    useEffect(() => {
        if (timeLeft === 0) {
            setShowResend(true);
            setMessage('❌ Code expired. Please send again.');
        }
    }, [timeLeft]);

    const handleChange = (value: string, index: number) => {
        if (!/^[0-9]?$/.test(value)) return;
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        if (value && index < 5) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setShowResend(false);

        const fullCode = code.join('');
        if (fullCode.length !== 6) {
            setMessage('Please enter all 6 digits.');
            setLoading(false);
            return;
        }

        if (timeLeft <= 0) {
            setMessage('❌ Code expired. Please send again.');
            setShowResend(true);
            setLoading(false);
            return;
        }

        setTimeout(() => {
            if (fullCode === codes) {
                setMessage('✅ Code verified!');
                alertify.success('✅ Code verified!');
                setTimeout(() => {
                    navigate('/createpasswordnew', { state: { email } });
                }, 1500);
            } else {
                setMessage('❌ Invalid code.');
                setShowResend(true);
            }
            setLoading(false);
        }, 1000);
    };

    const handleResend = () => {
        navigate('/forgotpassword', { state: { email } });
    };

    const formatTime = (t: number) => {
        const min = Math.floor(t / 60).toString().padStart(2, '0');
        const sec = (t % 60).toString().padStart(2, '0');
        return `${min}:${sec}`;
    };

    return (
        <div className={`min-h-screen flex items-center justify-center ${darkLight ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
            <form
                onSubmit={handleVerify}
                className={`p-10 rounded-3xl shadow-2xl w-full max-w-md space-y-6 text-center
                    ${darkLight
                        ? 'bg-gradient-to-br from-gray-800 to-gray-900'
                        : 'bg-gradient-to-br from-gray-200 to-gray-100 border border-gray-300'}
                `}
            >
                <h2 className={`text-3xl font-extrabold ${darkLight ? 'text-blue-400' : 'text-blue-600'}`}>
                    🔑 Verify Code
                </h2>
                <p className={`text-sm ${darkLight ? 'text-gray-300' : 'text-gray-700'}`}>
                    Enter the code sent to <span className="text-blue-400">{email}</span>
                </p>

                <div className={`text-sm mt-1 ${darkLight ? 'text-yellow-300' : 'text-yellow-600'}`}>
                    ⏳ Code expires in: <span className="font-mono">{formatTime(timeLeft)}</span>
                </div>

                <div className="flex justify-center space-x-2 mt-4">
                    {code.map((digit, i) => (
                        <input
                            key={i}
                            ref={(el) => {
                                if (el) inputsRef.current[i] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(e.target.value, i)}
                            onKeyDown={(e) => handleKeyDown(e, i)}
                            className={`w-12 h-12 text-center text-xl font-semibold rounded focus:outline-none focus:ring-2 focus:ring-blue-500
                                ${darkLight ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-400 text-black'}
                            `}
                        />
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={loading || timeLeft <= 0}
                    className={`w-full py-3 rounded-xl text-lg font-semibold shadow-md transition cursor-pointer 
                        ${timeLeft <= 0 || loading
                            ? 'bg-gray-500 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'}
                    `}
                >
                    {loading ? 'Verifying...' : 'Verify Code'}
                </button>

                {message && (
                    <p className={`text-sm mt-2 ${message.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>
                        {message}
                    </p>
                )}

                {showResend && (
                    <button
                        type="button"
                        onClick={handleResend}
                        className={`mt-2 text-sm ${darkLight ? 'text-blue-300' : 'text-blue-600'} hover:underline`}
                    >
                        🔁 Send Code Again
                    </button>
                )}
            </form>
        </div>
    );
};

export default ForgotPasswordVerifyForm;
