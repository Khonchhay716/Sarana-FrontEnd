import alertify from 'alertifyjs';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
          navigate('/reset-password', { state: { email } });
        }, 2000);
      } else {
        setMessage('❌ Invalid code.');
        setShowResend(true);
      }
      setLoading(false);
    }, 1000);
  };

  const handleResend = () => {
    navigate('/forgot-password', { state: { email } });
  };

  const formatTime = (t: number) => {
    const min = Math.floor(t / 60).toString().padStart(2, '0');
    const sec = (t % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=1920&q=100')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-40 z-0"></div>

      <form
        onSubmit={handleVerify}
        className="relative z-10 bg-black bg-opacity-80 p-10 rounded-3xl shadow-2xl w-full max-w-md space-y-6 text-center text-white"
      >
        <h2 className="text-3xl font-extrabold text-yellow-400">🔑 Verify Code</h2>
        <p className="text-sm text-gray-300">
          Enter the code sent to <span className="text-yellow-200">{email}</span>
        </p>

        <div className="text-sm text-yellow-300 mt-1">
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
              className="w-12 h-12 text-center text-xl font-semibold text-white bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || timeLeft <= 0}
          className={`w-full py-3 rounded-xl text-lg font-semibold shadow-md transition cursor-pointer ${
            timeLeft <= 0
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-yellow-500 hover:bg-yellow-600 text-black'
          }`}
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>

        {message && (
          <p
            className={`text-sm mt-2 ${
              message.startsWith('✅')
                ? 'text-green-400'
                : message.startsWith('📨')
                ? 'text-yellow-400'
                : 'text-red-400'
            }`}
          >
            {message}
          </p>
        )}

        {showResend && (
          <button
            type="button"
            onClick={handleResend}
            className="mt-2 text-sm text-yellow-300 hover:underline"
          >
            🔁 Send Code Again
          </button>
        )}
      </form>
    </div>
  );
};

export default ForgotPasswordVerifyForm;
