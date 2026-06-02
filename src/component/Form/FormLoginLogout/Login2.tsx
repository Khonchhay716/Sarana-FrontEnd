// import React, { useState, useEffect } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import alertify from 'alertifyjs';
// import 'alertifyjs/build/css/alertify.min.css';
// import axios from 'axios';
// const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// type LoginFormData = {
//   email: string;
//   password: string;
// };

// type FormErrors = {
//   email?: string;
//   password?: string;
// };

// const Login: React.FC = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState<LoginFormData>({
//     email: "superadmin@system.com",
//     password: 'Password123!',
//   });

//   const [errors, setErrors] = useState<FormErrors>({});
//   const [, setLoading] = useState(false);
//   const [, setInvalidLogin] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Check for remembered credentials on component mount
//   useEffect(() => {
//     const rememberedEmail = localStorage.getItem('rememberedEmail');
//     if (rememberedEmail) {
//       setFormData(prev => ({ ...prev, email: rememberedEmail }));
//       setRememberMe(true);
//     }
//   }, []);

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const { name, value, type } = e.target;

//     if (type === 'checkbox') {
//       const target = e.target as HTMLInputElement;
//       if (name === 'rememberMe') {
//         setRememberMe(target.checked);
//       }
//     } else {
//       setFormData((prev) => ({
//         ...prev,
//         [name]: value,
//       }));

//       // Clear error when user starts typing
//       if (errors[name as keyof FormErrors]) {
//         setErrors((prev) => ({
//           ...prev,
//           [name]: '',
//         }));
//       }
//     }
//   };

//   const validateForm = (): boolean => {
//     const newErrors: FormErrors = {};

//     if (!formData.email) {
//       newErrors.email = 'Email is required';
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = 'Email is invalid';
//     }

//     if (!formData.password) {
//       newErrors.password = 'Password is required';
//     } else if (formData.password.length < 6) {
//       newErrors.password = 'Password must be at least 6 characters';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!validateForm()) {
//       alertify.error('Please fix the form errors');
//       return;
//     }

//     setIsSubmitting(true);
//     setLoading(true);
//     setInvalidLogin(false);

//     try {
//       const res: any = await axios.post(`${BASE_URL}Auth/login`, {
//         usernameOrEmail: formData?.email,
//         password: formData?.password,
//       });

//       if (res?.data?.success) {
//         localStorage.setItem('CurrentUserLibrary', JSON.stringify(res?.data?.data));
//         alertify.success('Login successful!');
//         setTimeout(() => {
//           navigate('/dashbord');
//         }, 1000);
//       }
//     } catch (error: any) {
//       console.error('Login error:', error);

//       // Extract and display error message to user
//       const errorMessage = error?.response?.data?.message || 'Login failed. Please try again.';
//       console.log('Login error:', errorMessage);

//       // Show error to user
//       alertify.error(errorMessage);
//       setInvalidLogin(true);
//     } finally {
//       setLoading(false);
//       setTimeout(() => {
//         setIsSubmitting(false);
//       }, 1000);

//     }
//   };

//   const handleForgotPasswordClick = () => {
//     navigate('/forgot-password', { state: { email: formData.email } });
//   };

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };

//   return (
//     <div
//       className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
//       style={{
//         backgroundImage:
//           "url('https://t4.ftcdn.net/jpg/14/95/48/49/360_F_1495484999_QMEAoIWLdpFnSeK9dDQv7FOBR080IY63.jpg')",
//       }}
//     >
//       <div className="absolute inset-0 z-0"></div>
//       <div className="relative z-10 opacity-85 bg-white bg-opacity-95 p-6 rounded-xl shadow-xl w-full max-w-sm space-y-3">
//         <div className="text-center">
//           <div className="flex justify-center mb-2">
//             <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
//               </svg>
//             </div>
//           </div>
//           <h2 className="text-2xl font-bold text-gray-800">Library Login</h2>
//           <p className="text-gray-600 text-sm mt-1">Sign in to access the library system</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-3">
//           {/* Email */}
//           <div>
//             <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
//               Email Address
//             </label>
//             <div className="relative">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
//                   <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
//                   <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
//                 </svg>
//               </div>
//               <input
//                 type="email"
//                 id="email"
//                 name="email"
//                 className={`w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm ${errors.email ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                 placeholder="you@example.com"
//                 value={formData.email}
//                 onChange={handleChange}
//                 disabled={isSubmitting}
//                 autoComplete="email"
//               />
//             </div>
//             {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
//           </div>

//           {/* Password */}
//           <div>
//             <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
//               Password
//             </label>
//             <div className="relative">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <input
//                 type={showPassword ? "text" : "password"}
//                 id="password"
//                 name="password"
//                 className={`w-full pl-9 pr-9 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm ${errors.password ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                 placeholder="Enter your password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 disabled={isSubmitting}
//                 autoComplete="current-password"
//               />
//               <button
//                 type="button"
//                 className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                 onClick={togglePasswordVisibility}
//                 tabIndex={-1}
//               >
//                 {showPassword ? (
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
//                     <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
//                     <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
//                   </svg>
//                 ) : (
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
//                     <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
//                   </svg>
//                 )}
//               </button>
//             </div>
//             {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
//           </div>

//           {/* Remember Me & Forgot Password */}
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <input
//                 id="rememberMe"
//                 name="rememberMe"
//                 type="checkbox"
//                 className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                 checked={rememberMe}
//                 onChange={handleChange}
//                 disabled={isSubmitting}
//               />
//               <label htmlFor="rememberMe" className="ml-1 block text-xs text-gray-700">
//                 Remember me
//               </label>
//             </div>
//             <div className="text-xs">
//               <button
//                 type="button"
//                 onClick={handleForgotPasswordClick}
//                 className="font-medium text-blue-600 hover:text-blue-500"
//               >
//                 Forgot password?
//               </button>
//             </div>
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-md transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm"
//           >
//             {isSubmitting ? (
//               <>
//                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//                 Signing in...
//               </>
//             ) : (
//               'Sign In'
//             )}
//           </button>
//         </form>

//         {/* Register Link */}
//         <div className="text-center mt-2 mb-5">
//           <p className="text-xs text-gray-600">
//             Don't have an account?{' '}
//             <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
//               Register here
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import alertify from 'alertifyjs';
import 'alertifyjs/build/css/alertify.min.css';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

type LoginFormData = {
  email: string;
  password: string;
};

type FormErrors = {
  email?: string;
  password?: string;
};

const REMEMBER_ME_KEY = 'rememberMe_SokhaSK';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [, setLoading] = useState(false);
  const [, setInvalidLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Load remembered credentials on mount ──────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_ME_KEY);
    if (saved) {
      const { email, password, expiry } = JSON.parse(saved);
      if (Date.now() < expiry) {
        // ✅ Not expired → restore email + password
        setFormData({ email, password });
        setRememberMe(true);
      } else {
        // ❌ Expired (7 days passed) → clear
        localStorage.removeItem(REMEMBER_ME_KEY);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      if (name === 'rememberMe') {
        setRememberMe(target.checked);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name as keyof FormErrors]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      alertify.error('Please fix the form errors');
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    setInvalidLogin(false);

    try {
      const res: any = await axios.post(`${BASE_URL}Auth/login`, {
        usernameOrEmail: formData.email,
        password: formData.password,
      });

      if (res?.data?.success) {
        // ── Remember Me: save email + password + expiry ────────────
        if (rememberMe) {
          localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify({
            email: formData.email,
            password: formData.password, // ← save password
            expiry: Date.now() + SEVEN_DAYS_MS,
          }));
        } else {
          localStorage.removeItem(REMEMBER_ME_KEY);
        }
        localStorage.setItem('EmailCurrentAccount', formData.email);

        localStorage.setItem('CurrentUserLibrary', JSON.stringify(res?.data?.data));
        alertify.success('Login successful!');
        setTimeout(() => {
          navigate('/dashbord');
        }, 1000);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error?.response?.data?.message || 'Login failed. Please try again.';
      alertify.error(errorMessage);
      setInvalidLogin(true);
    } finally {
      setLoading(false);
      setTimeout(() => setIsSubmitting(false), 1000);
    }
  };

  const handleForgotPasswordClick = () => {
    navigate('/forgot-password', { state: { email: formData.email } });
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center px-2"
      style={{
        backgroundImage:
          "url('https://images.openai.com/static-rsc-4/i0LLhdUpEi3RMQw-nCiYvpaVVBAP2mY2zDl1iSabMTcYVqZzRNr3TNELC2qcMZkWyrXu0COn9aJu3G8XxuN9n7RvWaSNUDfdidB8iUuLQQlYpxjGN3hTEBZIk_9JRgjMQPXzSsZRrh0klaQiTtnE1h8TTm6oiTP3A4XB1UEaoJO4iGGLG5N9_yNBf0k6xRKK?purpose=fullsize')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 z-0" />

      <div className="relative z-10 opacity-90 bg-white bg-opacity-95 p-8 rounded-2xl shadow-2xl w-full max-w-sm space-y-5">

        {/* ── Logo & Brand ───────────────────────────────────────── */}
        <div className="text-center space-y-1">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-wide" style={{ color: '#1e3a5f' }}>
            SOKHA <span style={{ color: '#2563eb' }}>SK</span>
          </h1>
          <p className="text-xs font-medium tracking-widest uppercase text-gray-400">
            Security & Tech Solutions
          </p>
          <div className="pt-1">
            <p className="text-sm text-gray-500">Sign in to your account</p>
          </div>
        </div>

        {/* ── Form ───────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-gray-600 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input
                type="email"
                id="email"
                name="email"
                className={`w-full pl-9 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-gray-600 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className={`w-full pl-9 pr-9 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                autoComplete="current-password"
              />
              <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={togglePasswordVisibility} tabIndex={-1}>
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                checked={rememberMe}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <label htmlFor="rememberMe" className="text-xs text-gray-600 cursor-pointer">
                Remember me <span className="text-gray-400"></span>
              </label>
            </div>
            <button
              type="button"
              onClick={handleForgotPasswordClick}
              className="text-xs font-medium text-blue-600 hover:text-blue-500"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-white font-semibold py-2.5 px-3 rounded-lg transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md"
            style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' }}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Register Link */}
        {/* <div className="text-center">
          <p className="text-xs text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500">
              Register here
            </Link>
          </p>
        </div> */}

        {/* Footer */}
        <p className="text-center text-xs text-gray-300">
          © {new Date().getFullYear()} Sokha SK. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;