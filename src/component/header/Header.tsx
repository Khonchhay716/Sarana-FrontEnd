

// import { useNavigate } from "react-router-dom";
// import { MdDarkMode, MdLightMode } from "react-icons/md";
// import { FaUserPlus, FaConnectdevelop } from "react-icons/fa";
// import { IoIosLogOut } from "react-icons/io";
// import { FiMenu, FiX } from "react-icons/fi";
// import DropdownManu from "../../CustomHook/DropdownManu";
// import { useGlobleContextDarklight, useSidebar } from "../../AllContext/context";
// import { useEffect, useRef, useState } from "react";
// import { AxiosApi } from "../Axios/Axios";

// interface Role { id: number; name: string; description: string; }
// interface StaffData { id: number; firstName: string; lastName: string; phoneNumber: string; position: string; salary: number; imageProfile: string; }
// interface CustomerData { id: number; firstName: string; lastName: string; phoneNumber: string; totalPoint: number; imageProfile: string; }
// interface UserData { id: number; username: string; email: string; isActive: boolean; type: string; createdDate: string; roles: Role[]; permissions: string[]; staff: StaffData | null; customer: CustomerData | null; }

// const Header = () => {
//   const navigate = useNavigate();
//   const { darkLight, setDarkLight } = useGlobleContextDarklight();
//   const { sidebarVisible, setSidebarVisible } = useSidebar(); // ✅ only this
//   const [dateTime, setDateTime] = useState<string>("");
//   const [user, setUser] = useState<UserData | null>(null);
//   const hasInitialized = useRef(false);

//   useEffect(() => {
//     if (hasInitialized.current) return;
//     hasInitialized.current = true;
//     const stored = localStorage.getItem("CurrentUserLibrary");
//     if (stored) {
//       const parsed = JSON.parse(stored);
//       if (parsed?.userId) getCurrentUser(parsed.userId);
//     }
//   }, []);

//   const getCurrentUser = async (userid: number) => {
//     try {
//       const res = await AxiosApi.get(`Person/${userid}`);
//       setUser(res?.data?.data);
//     } catch (error) {
//       console.error("Error fetching user:", error);
//     }
//   };

//   useEffect(() => {
//     const updateClock = () => {
//       const now = new Date();
//       setDateTime(now.toLocaleString("en-US", {
//         weekday: "short", year: "numeric", month: "short", day: "2-digit",
//         hour: "2-digit", minute: "2-digit", second: "2-digit",
//         hour12: true, timeZone: "Asia/Phnom_Penh",
//       }));
//     };
//     updateClock();
//     const interval = setInterval(updateClock, 1000);
//     return () => clearInterval(interval);
//   }, []);

//   const handleSelect = (value: string) => {
//     if (value === "Log Out") { navigate("/login"); localStorage.removeItem("CurrentUserLibrary"); }
//     else if (value === "My Account") { navigate("/myprofile"); }
//     else if (value === "Reset Password") { navigate("page/reset-password"); }
//   };

//   const getProfileImage = () => {
//     if (!user || user.type === "None") return "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
//     if (user.type === "Staff") return user.staff?.imageProfile || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
//     if (user.type === "Customer") return user.customer?.imageProfile || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
//     return "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
//   };

//   return (
//     <nav className={`navbar px-4 w-full h-[65px] shadow-lg sticky top-0 z-50 flex justify-between items-center border-b-2 transition-all duration-300 ${
//       darkLight
//         ? "bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-purple-700"
//         : "bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-200 border-indigo-300"
//     }`}>
//       <div className="flex items-center gap-3">

//         {/* ✅ Only toggles icon strip show/hide */}
//         <button
//           onClick={() => setSidebarVisible((prev: boolean) => !prev)}
//           className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 shadow-lg flex-shrink-0 ${
//             darkLight ? "bg-slate-800 text-cyan-400 hover:bg-slate-700" : "bg-white/90 hover:bg-white text-indigo-600"
//           }`}
//         >
//           {sidebarVisible ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
//         </button>

//         {/* Logo */}
//         <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
//           <div className="relative group">
//             <div className={`p-2 rounded-lg transition-all duration-300 ${darkLight ? "bg-slate-800 text-cyan-400" : "bg-blue-600 text-white"}`}>
//               <FaConnectdevelop className="w-[35px] h-[35px] drop-shadow-lg group-hover:scale-110 transition-transform" />
//             </div>
//             <div className="absolute -top-1 -right-1 flex h-4 w-4">
//               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
//               <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
//             </div>
//           </div>
//           <div className="ml-3 hidden md:block">
//             <div className="flex items-center gap-2">
//               <span className={`text-2xl font-black tracking-wider drop-shadow-sm ${darkLight ? "text-white" : "text-blue-900"}`}>
//                 SOKHA <span className="text-yellow-500">SK</span>
//               </span>
//             </div>
//             <p className={`text-[10px] font-bold uppercase tracking-[0.2em] -mt-1 ${darkLight ? "text-cyan-300" : "text-blue-600"}`}>
//               Security & Tech Solutions
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="flex items-center justify-end gap-2">
//         <div className="text-sm font-semibold text-white bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hidden sm:block border border-white/30">
//           {dateTime}
//         </div>
//         {!darkLight ? (
//           <MdDarkMode onClick={() => setDarkLight(true)} className="w-[42px] h-[42px] p-2 rounded-xl cursor-pointer bg-white/90 hover:bg-white text-indigo-600 hover:scale-110 transition-all shadow-lg ml-1" />
//         ) : (
//           <MdLightMode onClick={() => setDarkLight(false)} className="w-[42px] h-[42px] p-2 rounded-xl cursor-pointer bg-white/90 hover:bg-white text-yellow-500 hover:scale-110 transition-all shadow-lg ml-1" />
//         )}
//         <DropdownManu
//           label={
//             <div className="profile w-[145px] h-[48px] rounded-xl bg-white/90 hover:bg-white backdrop-blur-sm ml-1 flex items-center cursor-pointer hover:scale-105 transition-all shadow-lg border-2 border-white/50">
//               <img src={getProfileImage()} className="w-[42px] h-[42px] rounded-lg border-2 mr-2 border-indigo-500 object-cover" alt="" />
//               <div className="flex-1 overflow-hidden">
//                 <h4 className="text-sm font-bold text-gray-800 truncate">{user?.username ?? "username"}</h4>
//                 <p className="text-[10px] text-gray-600 truncate">{user?.email ?? "admin@lib.com"}</p>
//               </div>
//             </div>
//           }
//           options={[
//             { iconsItem: <FaUserPlus />, option: "My Account" },
//             { iconsItem: <IoIosLogOut className="text-red-500" />, option: "Log Out" },
//           ]}
//           onSelect={handleSelect}
//           showIconItem={true}
//           iconsHideDropdown={true}
//           inputClass="-ml-[40px] z-[999]"
//         />
//       </div>
//     </nav>
//   );
// };

// export default Header;



import { useNavigate } from "react-router-dom";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { FaUserPlus, FaConnectdevelop } from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";
import { FiMenu, FiX } from "react-icons/fi";
import DropdownManu from "../../CustomHook/DropdownManu";
import { useGlobleContextDarklight, useSidebar } from "../../AllContext/context";
import { useEffect, useRef, useState } from "react";
import { AxiosApi } from "../Axios/Axios";

interface Role { id: number; name: string; description: string; }
interface StaffData { id: number; firstName: string; lastName: string; phoneNumber: string; position: string; salary: number; imageProfile: string; }
interface CustomerData { id: number; firstName: string; lastName: string; phoneNumber: string; totalPoint: number; imageProfile: string; }
interface UserData { id: number; username: string; email: string; isActive: boolean; type: string; createdDate: string; roles: Role[]; permissions: string[]; staff: StaffData | null; customer: CustomerData | null; }

const Header = () => {
  const navigate = useNavigate();
  const { darkLight, setDarkLight } = useGlobleContextDarklight();
  const { sidebarVisible, setSidebarVisible } = useSidebar();
  const [dateTime, setDateTime] = useState<string>("");
  const [user, setUser] = useState<UserData | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    const stored = localStorage.getItem("CurrentUserLibrary");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.userId) getCurrentUser(parsed.userId);
    }
  }, []);

  const getCurrentUser = async (userid: number) => {
    try {
      const res = await AxiosApi.get(`Person/${userid}`);
      setUser(res?.data?.data);
    } catch (error) { console.error("Error fetching user:", error); }
  };

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setDateTime(now.toLocaleString("en-US", {
        weekday: "short", year: "numeric", month: "short", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: true, timeZone: "Asia/Phnom_Penh",
      }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSelect = (value: string) => {
    if (value === "Log Out") { navigate("/login"); localStorage.removeItem("CurrentUserLibrary"); }
    else if (value === "My Account") { navigate("/myprofile"); }
    else if (value === "Reset Password") { navigate("page/reset-password"); }
  };

  const getProfileImage = () => {
    if (!user || user.type === "None") return "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
    if (user.type === "Staff") return user.staff?.imageProfile || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
    if (user.type === "Customer") return user.customer?.imageProfile || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
    return "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
  };

  return (
    <nav className={`navbar px-4 w-full h-[65px] shadow-lg sticky top-0 z-50 flex justify-between items-center border-b-2 transition-all duration-300 ${
      darkLight
        ? "bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-purple-700"
        : "bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-200 border-indigo-300"
    }`}>
      <div className="flex items-center gap-3">

        {/* ✅ Same button, all screens — open/close sidebar */}
        <button
          onClick={() => setSidebarVisible((prev: boolean) => !prev)}
          className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 shadow-lg flex-shrink-0 ${
            darkLight ? "bg-slate-800 text-cyan-400 hover:bg-slate-700" : "bg-white/90 hover:bg-white text-indigo-600"
          }`}
        >
          {sidebarVisible ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
        </button>

        <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
          <div className="relative group">
            <div className={`p-2 rounded-lg transition-all duration-300 ${darkLight ? "bg-slate-800 text-cyan-400" : "bg-blue-600 text-white"}`}>
              <FaConnectdevelop className="w-[35px] h-[35px] drop-shadow-lg group-hover:scale-110 transition-transform" />
            </div>
            <div className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
            </div>
          </div>
          <div className="ml-3 hidden md:block">
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-black tracking-wider drop-shadow-sm ${darkLight ? "text-white" : "text-blue-900"}`}>
                SOKHA <span className="text-yellow-500">SK</span>
              </span>
            </div>
            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] -mt-1 ${darkLight ? "text-cyan-300" : "text-blue-600"}`}>
              Security & Tech Solutions
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <div className="text-sm font-semibold text-white bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hidden sm:block border border-white/30">
          {dateTime}
        </div>
        {!darkLight ? (
          <MdDarkMode onClick={() => setDarkLight(true)} className="w-[42px] h-[42px] p-2 rounded-xl cursor-pointer bg-white/90 hover:bg-white text-indigo-600 hover:scale-110 transition-all shadow-lg ml-1" />
        ) : (
          <MdLightMode onClick={() => setDarkLight(false)} className="w-[42px] h-[42px] p-2 rounded-xl cursor-pointer bg-white/90 hover:bg-white text-yellow-500 hover:scale-110 transition-all shadow-lg ml-1" />
        )}
        <DropdownManu
          label={
            <div className="profile w-[145px] h-[48px] rounded-xl bg-white/90 hover:bg-white backdrop-blur-sm ml-1 flex items-center cursor-pointer hover:scale-105 transition-all shadow-lg border-2 border-white/50">
              <img src={getProfileImage()} className="w-[42px] h-[42px] rounded-lg border-2 mr-2 border-indigo-500 object-cover" alt="" />
              <div className="flex-1 overflow-hidden">
                <h4 className="text-sm font-bold text-gray-800 truncate">{user?.username ?? "username"}</h4>
                <p className="text-[10px] text-gray-600 truncate">{user?.email ?? "admin@lib.com"}</p>
              </div>
            </div>
          }
          options={[
            { iconsItem: <FaUserPlus />, option: "My Account" },
            { iconsItem: <IoIosLogOut className="text-red-500" />, option: "Log Out" },
          ]}
          onSelect={handleSelect}
          showIconItem={true}
          iconsHideDropdown={true}
          inputClass="-ml-[40px] z-[999]"
        />
      </div>
    </nav>
  );
};

export default Header;