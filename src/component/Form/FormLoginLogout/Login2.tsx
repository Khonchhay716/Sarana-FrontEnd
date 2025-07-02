import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import alertify from 'alertifyjs';
import { useRefreshTable } from '../../../AllContext/context';
import 'alertifyjs/build/css/alertify.min.css';
import useFetchDataApi from '../../../CustomHook/FetchDataApi';

const Login = () => {
  const navigate = useNavigate();
  const { setRefreshTables } = useRefreshTable();
  const { data: testapi } = useFetchDataApi('https://localhost:7095/api/Health');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    roleId: 1,
  });

  const [loading, setLoading] = useState(false);
  const [invalidLogin, setInvalidLogin] = useState(false); // Track login failure

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'roleId' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setInvalidLogin(false);

    // Check backend status
    if (!testapi || testapi.length === 0) {
      alertify.error('Connect to Backend failed! Try again later.');
      setLoading(false);
      return;
    }

    if (!formData.email || !formData.password) {
      alertify.error('Email and password are required.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('https://localhost:7095/api/Auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        alertify.error(data.message || 'Login failed');
        if (data.message == "🔒 Wrong password.") {
          setInvalidLogin(true); // Show "Forgot password?"
        } else {
          setInvalidLogin(false); // hide "Forgot password?"
        }
        setLoading(false);
        return;
      }

      // Login success
      setInvalidLogin(false);

      const token = data.token;
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('email', formData.email);
      sessionStorage.setItem('roleId', formData.roleId.toString());

      alertify.success('🎉 Login success!');

      // Auto logout after 7 days
      setTimeout(() => {
        sessionStorage.clear();
        alertify.warning('⏰ Session expired. Please log in again.');
        navigate('/login');
      }, 7 * 24 * 60 * 60 * 1000);

      navigate('/dashbord');
      setRefreshTables(new Date());
    } catch (error) {
      console.error('Login error:', error);
      alertify.error('Something went wrong!');
    }

    setLoading(false);
  };

  const handleForgotPasswordClick = () => {
    navigate('/forgot-password', { state: { emails: formData.email } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-gradient-to-br from-gray-800 to-gray-900 p-10 rounded-3xl shadow-2xl w-full max-w-md space-y-6"
      >
        <h2 className="text-3xl font-extrabold text-center text-blue-400">🔐 Welcome Back</h2>
        <p className="text-center text-sm text-gray-400">Please log in to your account</p>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Email</label>
          <input
            type="email"
            name="email"
            className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Password</label>
          <input
            type="password"
            name="password"
            className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Select Role</label>
          <select
            name="roleId"
            value={formData.roleId}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600"
          >
            <option value={1}>Admin</option>
            <option value={2}>User</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl text-lg font-semibold shadow-md transition transform hover:scale-105 cursor-pointer"
        >
          {loading ? 'Logging in...' : '💫 Log In'}
        </button>

        {/* Show clickable "Forgot password?" only on failed login */}
        {invalidLogin && (
          <p
            onClick={handleForgotPasswordClick}
            className="text-sm text-center text-red-400 cursor-pointer hover:underline select-none"
            title="Click to reset password"
          >
            Forgot password?
          </p>
        )}

        <p className="text-sm text-center text-gray-400 mt-2">
          Don’t have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
