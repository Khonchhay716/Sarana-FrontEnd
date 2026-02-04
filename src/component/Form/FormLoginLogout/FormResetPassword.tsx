import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import alertify from 'alertifyjs';
import 'alertifyjs/build/css/alertify.min.css';
import axios from 'axios';
import { message } from 'antd';
import { AxiosApi } from '../../Axios/Axios';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

type ResetPasswordFormData = {
  newPassword: string;
  confirmPassword: string;
};

type FormErrors = {
  newPassword?: string;
  confirmPassword?: string;
};

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || '';
  const verificationCode = location.state?.verificationCode || '';

  const [formData, setFormData] = useState<ResetPasswordFormData>({
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasNumber: false,
    hasSpecialChar: false,
    hasUpperCase: false,
    hasLowerCase: false,
  });

  // Redirect if no email or verification code
  useEffect(() => {
    if (!emailFromState || !verificationCode) {
      message.warning('Please complete the verification process first');
      navigate('/forgot-password');
    }
  }, [emailFromState, verificationCode, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Track password strength
    if (name === 'newPassword') {
      setPasswordStrength({
        hasMinLength: value.length >= 8,
        hasNumber: /(?=.*[0-9])/.test(value),
        hasSpecialChar: /(?=.*[!@#$%^&*])/.test(value),
        hasUpperCase: /(?=.*[A-Z])/.test(value),
        hasLowerCase: /(?=.*[a-z])/.test(value),
      });
    }

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // New password validation
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*[0-9])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one number';
    } else if (!/(?=.*[!@#$%^&*])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one special character (!@#$%^&*)';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      message.error('Please fix the form errors');
      return;
    }

    setIsSubmitting(true);

    try {
      // Note: Update this endpoint based on your actual API
      const res: any = await AxiosApi.put('Users/update-password-by-email', {
        email: emailFromState,
        // verificationCode: verificationCode,
        newPassword: formData.newPassword,
      });

      if (res?.data?.success) {
        message.success('Password reset successfully!');
        // alertify.success('Your password has been changed. Please login with your new password.');
        
        // Navigate to login page
        setTimeout(() => {
          navigate('/login', { state: { email: emailFromState } });
        }, 2000);
      }
    } catch (error: any) {
      console.error('Reset password error:', error);

      const errorMessage = error?.response?.data?.error || 'Failed to reset password. Please try again.';
      console.log('Reset password error:', errorMessage);
      message.error(errorMessage);
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://t4.ftcdn.net/jpg/14/95/48/49/360_F_1495484999_QMEAoIWLdpFnSeK9dDQv7FOBR080IY63.jpg')",
      }}
    >
      <div className="absolute inset-0 z-0"></div>
      <div className="relative z-10 opacity-85 bg-white bg-opacity-95 p-6 rounded-xl shadow-xl w-full max-w-sm space-y-3">
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
          <p className="text-gray-600 text-sm mt-1">Create a new secure password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-xs font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                className={`w-full pl-9 pr-9 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm ${
                  errors.newPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
                disabled={isSubmitting}
                autoComplete="new-password"
                autoFocus
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={togglePasswordVisibility}
                tabIndex={-1}
              >
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
            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
            {!errors.newPassword && formData.newPassword && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <div className={`h-1 w-1 rounded-full ${passwordStrength.hasMinLength ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <p className={`text-xs ${passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
                    At least 8 characters
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-1 w-1 rounded-full ${passwordStrength.hasLowerCase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <p className={`text-xs ${passwordStrength.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                    Contains a lowercase letter (a-z)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-1 w-1 rounded-full ${passwordStrength.hasUpperCase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <p className={`text-xs ${passwordStrength.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                    Contains an uppercase letter (A-Z)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-1 w-1 rounded-full ${passwordStrength.hasNumber ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <p className={`text-xs ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                    Contains a number (0-9)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-1 w-1 rounded-full ${passwordStrength.hasSpecialChar ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <p className={`text-xs ${passwordStrength.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                    Contains special character (!@#$%^&*)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                className={`w-full pl-9 pr-9 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirm your new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isSubmitting}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={toggleConfirmPasswordVisibility}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
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
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-md transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting Password...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Reset Password
              </>
            )}
          </button>

          {/* Back to Login */}
          <div className="text-center">
            <Link to="/login" className="text-xs text-gray-600 hover:text-gray-500 font-medium flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Login
            </Link>
          </div>
        </form>

        {/* Security Info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs text-green-700">
                  Your password is encrypted and stored securely. Make sure to remember your new password.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;