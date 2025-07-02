// components/EmailVerificationForm.tsx
import React, { useState } from 'react';
import axios from 'axios';

const EmailVerificationForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('https://localhost:7213/api/email/send-verification', { email });
      setMessage(`Verification code sent! Check your email. (Code: ${response.data.code})`);
    } catch (error) {
      setMessage('Failed to send verification email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button className='text-red-400 cursor-pointer bg-amber-400' type="submit" disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send Verification Code'}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default EmailVerificationForm;