// import React, { useState } from 'react';
// import useFetchDataApi from '../../../../CustomHook/FetchDataApi';
// import alertify from "alertifyjs";
// import "alertifyjs/build/css/alertify.min.css";
// import { useNavigate, Link } from 'react-router-dom';
// import { useRefreshTable } from "../../../../AllContext/context";

// const Login = () => {
//   const { data } = useFetchDataApi("https://localhost:7095/api/User");

//   const navigate = useNavigate();
//   const { setRefreshTables } = useRefreshTable();

//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     roleId: 1 // default to Admin
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: name === "roleId" ? Number(value) : value
//     }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.email || !formData.password) {
//       alertify.error("Email and Password are required");
//       return;
//     }

//     if (data && Array.isArray(data)) {
//       const userExists = data.find((item: { email?: string }) => item.email === formData.email);

//       if (userExists) {
//         const isSuccess = data.find(
//           (item: { email: string; passwordHash: string; roleId: number }) =>
//             item.email === formData.email &&
//             item.passwordHash === formData.password &&
//             item.roleId === formData.roleId
//         );

//         if (isSuccess) {
//           alertify.success("Welcome back! 🎉");
//           sessionStorage.setItem("isLogin", "true");
//           sessionStorage.setItem("email", formData.email);
//           sessionStorage.setItem("roleId", formData.roleId.toString());

//           navigate("/dashbord");
//           setRefreshTables(new Date());
//         } else {
//           alertify.error("Wrong password or role doesn't match ❌");
//         }
//       } else {
//         alertify.error("Email not registered 😕");
//       }
//     } else {
//       alertify.error("Cannot connect to user database");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-black text-white">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-gradient-to-br from-gray-800 to-gray-900 p-10 rounded-3xl shadow-2xl w-full max-w-md space-y-6"
//       >
//         <h2 className="text-3xl font-extrabold text-center text-blue-400">🔐 Welcome Back</h2>
//         <p className="text-center text-sm text-gray-400">Please log in to your account</p>

//         <div>
//           <label className="block text-sm font-medium mb-1 text-gray-300">Email</label>
//           <input
//             type="email"
//             name="email"
//             className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//             placeholder="you@example.com"
//             value={formData.email}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-1 text-gray-300">Password</label>
//           <input
//             type="password"
//             name="password"
//             className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//             placeholder="••••••••"
//             value={formData.password}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-1 text-gray-300">Select Role</label>
//           <select
//             name="roleId"
//             value={formData.roleId}
//             onChange={handleChange}
//             className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600"
//           >
//             <option value={1}>Admin</option>
//             <option value={2}>User</option>
//           </select>
//         </div>

//         <button
//           type="submit"
//           className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl text-lg font-semibold shadow-md transition transform hover:scale-105"
//         >
//           💫 Log In
//         </button>

//         <p className="text-sm text-center text-gray-400">
//           Don’t have an account?{" "}
//           <Link to="/register" className="text-blue-400 hover:underline">
//             Create one
//           </Link>
//         </p>
//       </form>
//     </div>
//   );
// };

// export default Login;
