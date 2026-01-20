import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HookIntergrateAPI } from '../../../CustomHook/HookIntergrateAPI';
import alertify from 'alertifyjs';
import useFetchDataApi from '../../../CustomHook/FetchDataApi';

const ForgotPasswordRequestForm: React.FC = () => {
  const { state } = useLocation();
  const emails = state.emails;
  const [email, setEmail] = useState('');
  const subject = 'VERIFY CODE GMAIL';
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { createData } = HookIntergrateAPI();
  const { data } = useFetchDataApi('https://localhost:7095/api/User');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const randomCode = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');

    const codemessage = `We've received your request to transfer your account to a new device.

Your verification code is: ${randomCode}
Note: This code is valid for 1 minute only.

[Important Notice]  
Never share this code with anyone.

Thank you for being a valued customer at Coffee Bliss.`;

    if (!email) {
      setMessage('Please enter your email.');
      setLoading(false);
      return;
    }

    if (data) {
      const foundUser = data.find((item: { email: string }) => item.email === email);

      if (foundUser) {
        if (emails === email) {
          try {
            createData('https://localhost:7095/api/Mail/send', {
              To: email,
              subject,
              body: codemessage,
            }, () => { });

            alertify.success('Verification code sent');

            setTimeout(() => {
              setMessage(`✅ Code sent to ${email}`);
              setLoading(false);
              navigate('/verify-code', { state: { email, randomCode } });
            }, 1000);
          } catch (error) {
            setMessage('❌ Failed to send code.');
            setLoading(false);
          }
        } else {
          setLoading(false);
          alertify.warning('❌ Email does not match login email.');
        }
      } else {
        setLoading(false);
        alertify.warning('❌ Email not registered.');
      }
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=1920&q=100')",
      }}
    >
      {/* lighter overlay for better visibility */}
      <div className="absolute inset-0 bg-black opacity-30 z-0"></div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-black bg-opacity-80 p-10 rounded-3xl shadow-2xl w-full max-w-md space-y-6 text-white"
      >
        <h2 className="text-3xl font-extrabold text-center text-yellow-400">🔒 Forgot Password</h2>
        <p className="text-center text-sm text-gray-300">Enter your email to get the code</p>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">Email</label>
          <input
            type="email"
            className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
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
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-3 rounded-xl text-lg font-semibold shadow-md transition cursor-pointer"
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
