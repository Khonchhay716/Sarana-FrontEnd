import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import alertify from 'alertifyjs';
import 'alertifyjs/build/css/alertify.min.css';
import axios from 'axios';
import { message } from 'antd';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const VerifyCode: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || '';

  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(new Array(6).fill(null));

  // Redirect if no email provided
  useEffect(() => {
    if (!emailFromState) {
      message.warning('Please enter your email first');
      navigate('/forgot-password');
    }
  }, [emailFromState, navigate]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^[0-9]$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Only process if it's 6 digits
    if (/^[0-9]{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const verificationCode = code.join('');

    if (verificationCode.length !== 6) {
      message.error('Please enter the complete 6-digit code');
      return;
    }

    setIsSubmitting(true);

    try {
      const res: any = await axios.post(`${BASE_URL}Mail/verify-code`, {
        email: emailFromState,
        code: verificationCode,
      });

      if (res?.status) {
        message.success('Code verified successfully!');
        alertify.success('Verification successful! Redirecting to reset password...');
        
        // Navigate to reset password page
        setTimeout(() => {
          navigate('/form-resetpassword', { 
            state: { 
              email: emailFromState,
              verificationCode: verificationCode 
            } 
          });
        }, 1500);
      }
    } catch (error: any) {
      console.error('Verify code error:', error);

      const errorMessage = error?.response?.data?.message || 'Invalid verification code. Please try again.';
      console.log('Verify code error:', errorMessage);

      alertify.error(errorMessage);
      message.error(errorMessage);
      
      // Clear the code on error
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);

    try {
      const res: any = await axios.post(`${BASE_URL}Mail/resend-verification`, {
        email: emailFromState,
      });

      if (res?.status) {
        message.success('Verification code resent successfully!');
        // alertify.success('Please check your email for the new code');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      console.error('Resend code error:', error);

      const errorMessage = error?.response?.data?.error || 'Failed to resend code. Please try again.';
      // alertify.error(errorMessage);
      message.error(errorMessage);
    } finally {
      setTimeout(() => {
        setIsResending(false);
      }, 1000);
    }
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Enter Verification Code</h2>
          <p className="text-gray-600 text-sm mt-1">
            We sent a code to <span className="font-semibold">{emailFromState}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Code Input */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2 text-center">
              Enter 6-Digit Code
            </label>
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isSubmitting}
                  className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs text-blue-700">
                  Check your email inbox and spam folder for the 6-digit verification code.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || code.join('').length !== 6}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-md transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </button>

          {/* Resend Code */}
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-2">Didn't receive the code?</p>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending}
              className="text-xs text-blue-600 hover:text-blue-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? 'Resending...' : 'Resend Code'}
            </button>
          </div>

          {/* Back to Forgot Password
          <div className="text-center">
            <Link to="/forgot-password" className="text-xs text-gray-600 hover:text-gray-500 font-medium flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Use different email
            </Link>
          </div> */}
        </form>

        {/* Help Section */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            Remember your password?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;