import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import alertify from 'alertifyjs';
import { useRefreshTable } from '../../../AllContext/context';
import 'alertifyjs/build/css/alertify.min.css';
import useFetchDataApi from '../../../CustomHook/FetchDataApi';

type Role = {
  id: number;
  name: string;
};

const Login = () => {
  const navigate = useNavigate();
  // const { setRefreshTables } = useRefreshTable();
  // const { data: testapi } = useFetchDataApi('https://localhost:7095/api/Health');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    roleId: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    roleId: '',
  });

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [invalidLogin, setInvalidLogin] = useState(false);

  // useEffect(() => {
  //   const fetchRoles = async () => {
  //     try {
  //       const res = await fetch('https://localhost:7095/api/Role');
  //       const json = await res.json();
  //       setRoles(json);
  //     } catch (error) {
  //       console.error("Error fetching roles:", error);
  //       alertify.error("Failed to load roles.");
  //     }
  //   };

  //   fetchRoles();
  // }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'roleId' ? (value ? Number(value) : '') : value,
    }));

    // Remove error when user starts typing or selecting
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setLoading(true);
    // setInvalidLogin(false);

    // let validationErrors = {
    //   email: '',
    //   password: '',
    //   roleId: '',
    // };

    // if (!formData.email) validationErrors.email = 'Email is required';
    // if (!formData.password) validationErrors.password = 'Password is required';
    // if (!formData.roleId) validationErrors.roleId = 'Please select a role';

    // const hasErrors = Object.values(validationErrors).some((msg) => msg !== '');

    // if (hasErrors) {
    //   setErrors(validationErrors);
    //   alertify.error('Please fix the form errors');
    //   setLoading(false);
    //   return;
    // }

    // setErrors({ email: '', password: '', roleId: '' });

    // if (!testapi || testapi.length === 0) {
    //   alertify.error('Connect to Backend failed! Try again later.');
    //   setLoading(false);
    //   return;
    // }

    // try {
      // const res = await fetch('https://localhost:7095/api/Auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });

      // const data = await res.json();

      // if (!res.ok) {
      //   alertify.error(data.message || 'Login failed');
      //   setInvalidLogin(data.message === '🔒 Wrong password.');
      //   setLoading(false);
      //   return;
      // }

      // sessionStorage.setItem('token', data.token);
      // sessionStorage.setItem('email', formData.email);
      // sessionStorage.setItem('roleId', formData.roleId.toString());

      // alertify.success('🎉 Login success!');

      // setTimeout(() => {
      //   sessionStorage.clear();
      //   alertify.warning('⏰ Session expired. Please log in again.');
      //   navigate('/login');
      // }, 7 * 24 * 60 * 60 * 1000);

      navigate('/dashbord');
      // setRefreshTables(new Date());
    // } catch (error) {
    //   console.error('Login error:', error);
    //   alertify.error('Something went wrong!');
    // }

    // setLoading(false);
  };

  const handleForgotPasswordClick = () => {
    navigate('/forgot-password', { state: { emails: formData.email } });
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1920&q=80')",
      }}
    >
      <div className="absolute inset-0 bg-black opacity-60 z-0"></div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-gray-900 bg-opacity-80 p-10 rounded-3xl shadow-2xl w-full max-w-md space-y-6 text-white"
      >
        <h2 className="text-3xl font-extrabold text-center text-yellow-400">☕ Welcome Back</h2>
        <p className="text-center text-sm text-gray-300">Please log in to your account</p>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">Email</label>
          <input
            type="email"
            name="email"
            className={`w-full px-4 py-3 rounded-xl bg-gray-700 border ${
              errors.email ? 'border-red-500' : 'border-gray-600'
            } focus:outline-none focus:ring-2 focus:ring-yellow-500 transition`}
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">Password</label>
          <input
            type="password"
            name="password"
            className={`w-full px-4 py-3 rounded-xl bg-gray-700 border ${
              errors.password ? 'border-red-500' : 'border-gray-600'
            } focus:outline-none focus:ring-2 focus:ring-yellow-500 transition`}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
        </div>

        {/* Role Select */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-200">Select Role</label>
          <select
            name="roleId"
            value={formData.roleId}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl bg-gray-700 border ${
              errors.roleId ? 'border-red-500' : 'border-gray-600'
            } text-white`}
          >
            <option value="">Select Role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          {errors.roleId && <p className="text-red-400 text-sm mt-1">{errors.roleId}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-3 rounded-xl text-lg font-semibold shadow-md transition transform hover:scale-105 cursor-pointer"
        >
          {loading ? 'Logging in...' : '💫 Log In'}
        </button>

        {/* Forgot Password */}
        {invalidLogin && (
          <p
            onClick={handleForgotPasswordClick}
            className="text-sm text-center text-red-300 cursor-pointer hover:underline select-none"
            title="Click to reset password"
          >
            Forgot password?
          </p>
        )}

        {/* Register Link */}
        <p className="text-sm text-center text-gray-300 mt-2">
          Don’t have an account?{' '}
          <Link to="/register" className="text-yellow-300 hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
