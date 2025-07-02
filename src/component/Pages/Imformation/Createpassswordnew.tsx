import alertify from 'alertifyjs';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useFetchDataApi from '../../../CustomHook/FetchDataApi';
import { HookIntergrateAPI } from '../../../CustomHook/HookIntergrateAPI';
import { useGlobleContextDarklight } from '../../../AllContext/context';

interface LocationState {
  email?: string;
}

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

const ResetPasswordForm: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const email = (state as LocationState)?.email;
  const [user, setUser] = useState<UserProfile | null>(null);
  const { darkLight } = useGlobleContextDarklight();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { updateData } = HookIntergrateAPI();
  const { data } = useFetchDataApi('https://localhost:7095/api/User');

  useEffect(() => {
    if (data && email) {
      const foundUser = data.find((item: UserProfile) => item.email === email);
      setUser(foundUser || null);
    }
  }, [data, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!password || !confirmPassword) {
      setMessage('❌ Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('❌ Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setMessage('❌ Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    if (user) {
      const updatedUser = {
        ...user,
        passwordHash: password,
        passwordSalt: confirmPassword,
      };

      updateData('https://localhost:7095/api/User', user.id, updatedUser, () => {
        alertify.success('✅ Password reset successfully!');
        setTimeout(() => {
          setLoading(false);
          setMessage('✅ Password reset successful! Redirecting to login...');
        }, 1000);
      });
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkLight ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <form
        onSubmit={handleSubmit}
        className={`p-10 rounded-3xl shadow-2xl w-full max-w-md space-y-6 text-center 
          ${darkLight
            ? 'bg-gradient-to-br from-gray-800 to-gray-900'
            : 'bg-gradient-to-br from-gray-200 to-gray-100 border border-gray-300'}
        `}
      >
        <h2 className={`text-3xl font-extrabold ${darkLight ? 'text-blue-400' : 'text-blue-600'}`}>🔒 Reset Password</h2>
        <p className={`text-sm ${darkLight ? 'text-gray-300' : 'text-gray-700'}`}>
          Reset password for <span className="text-blue-400">{email}</span>
        </p>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 
            ${darkLight ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}
          `}
          required
          minLength={8}
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
          minLength={8}
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl text-lg font-semibold shadow-md transition cursor-pointer 
            ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}
          `}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>

        {message && (
          <p className={`text-sm mt-2 ${message.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default ResetPasswordForm;
