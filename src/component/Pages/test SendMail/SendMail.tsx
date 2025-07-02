import React, { useState } from 'react';
import { FaRandom } from 'react-icons/fa';

const EmailForm: React.FC = () => {
  const [to, setTo] = useState('');
  const subject = "Verify code";
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // ✅ Generate new random 6-digit code on each submit
    const randomCode = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0'); // ensure it's always 6 digits like "004273"

    try {
      const response = await fetch('https://localhost:7095/api/Mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, subject, body: randomCode }),
      });

      if (response.ok) {
        setMessage(`✅ Email sent successfully! Code: ${randomCode}`);
        setTo('');
      } else {
        setMessage('❌ Failed to send email.');
      }
    } catch (error) {
      console.error('Email error:', error);
      setMessage('⚠️ Error occurred while sending.');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">📧 Send Email</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">To Email</label>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            required
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? 'Sending...' : (
            <>
              <FaRandom className="inline" />
              Send Email
            </>
          )}
        </button>
      </form>
      {message && <p className="text-sm text-center mt-2 text-green-700">{message}</p>}
    </div>
  );
};

export default EmailForm;
