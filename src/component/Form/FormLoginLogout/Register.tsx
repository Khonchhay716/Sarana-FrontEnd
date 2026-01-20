import React, { useState, useEffect } from "react";
import { HookIntergrateAPI } from "../../../CustomHook/HookIntergrateAPI";
import useFetchDataApi from "../../../CustomHook/FetchDataApi";
import alertify from "alertifyjs";
import { useNavigate } from 'react-router-dom';

type Role = {
  id: number;
  name: string;
};

const Register = () => {
  const navigate = useNavigate();
  const { createData } = HookIntergrateAPI();
  const { data } = useFetchDataApi("https://localhost:7095/api/User");

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    passwordHash: "",
    passwordSalt: "",
    roleId: "", // now starts as empty string
    profilePicture: "",
  });

  const [roles, setRoles] = useState<Role[]>([]);
  const subject = 'VERIFY CODE GMAIL';
  const randomCode = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');
  const codemessage = `We've received your request to transfer your account to a new device.
          Your verification code is: ${randomCode}
          Note: This code is valid for 1 minute only.

          [Important Notice]  
          Never share this code with anyone.

          Thank you for being a valued customer at Coffee Bliss.`;


  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch("https://localhost:7095/api/Role");
        const json = await res.json();
        setRoles(json);
      } catch (err) {
        alertify.error("Failed to fetch roles!");
      }
    };

    fetchRoles();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "roleId" ? (value ? Number(value) : "") : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        profilePicture: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.passwordHash.length < 7 || formData.passwordSalt.length < 7) {
      alertify.error("Password and Confirm Password must be at least 8 characters.");
    } else if (formData.passwordHash !== formData.passwordSalt) {
      alertify.error("Password and confirm password do not match.");
    } else if (!formData.roleId) {
      alertify.error("Please select a role.");
    } else {
      if (data.length === 0) {
        createData("https://localhost:7095/api/User", formData, () => {
          // navigate("/");
          setTimeout(() => {
            alertify.success("create successfully ")
          }, 1000)
          try {
            createData('https://localhost:7095/api/Mail/send', {
              To: formData?.email,
              subject,
              body: codemessage,
            }, () => { });

            setTimeout(() => {
              alertify.success('Verification code sent');
            }, 2000);

            setTimeout(() => {
              let email = formData.email
              navigate('/verify-code', { state: { email, randomCode } });
            }, 3000);
          } catch (error) {
            alertify.warning('❌ Failed to send code.');
          }
        });
      } else {
        const exists = data.find((user: { email?: string }) => user.email === formData.email);
        if (exists) {
          alertify.error("Email already exists.");
        } else {
          createData("https://localhost:7095/api/User", formData, () => {
            // navigate("/");
            setTimeout(() => {
              alertify.success("create successfully ")
            }, 1000)

            try {
              createData('https://localhost:7095/api/Mail/send', {
                To: formData?.email,
                subject,
                body: codemessage,
              }, () => { });

              setTimeout(() => {
                alertify.success('Verification code sent');
              }, 2000);

              setTimeout(() => {
                let email = formData.email
                navigate('/verify-code2', { state: { email, randomCode } });
              }, 3000);
            } catch (error) {
              alertify.warning('❌ Failed to send code.');
            }
          });
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-gradient-to-br from-gray-800 to-gray-900 p-10 rounded-3xl shadow-2xl w-full max-w-lg space-y-6"
      >
        <h2 className="text-3xl font-extrabold text-center text-green-400">
          📝 Register Account
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 w-full"
            required
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 w-full"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 w-full col-span-2"
            required
          />
          <input
            type="password"
            name="passwordHash"
            placeholder="Password"
            value={formData.passwordHash}
            onChange={handleChange}
            className="px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 w-full"
            required
          />
          <input
            type="password"
            name="passwordSalt"
            placeholder="Confirm Password"
            value={formData.passwordSalt}
            onChange={handleChange}
            className="px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 w-full"
            required
          />

          <select
            name="roleId"
            value={formData.roleId}
            onChange={handleChange}
            className="px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 w-full col-span-2"
            required
          >
            <option value="">Select Role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="col-span-2 text-gray-300"
          />
        </div>

        {formData.profilePicture && (
          <img
            src={formData.profilePicture}
            alt="Profile Preview"
            className="mx-auto mt-4 w-32 h-32 rounded-full object-cover"
          />
        )}

        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl text-lg font-semibold shadow-md transition transform hover:scale-105 cursor-pointer"
        >
          ✅ Create Account
        </button>

        <p className="text-center text-gray-400 mt-4">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-green-400 hover:underline"
          >
            Log In
          </button>
        </p>
      </form>
    </div>
  );
};

export default Register;
