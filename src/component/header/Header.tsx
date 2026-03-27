import { useNavigate } from "react-router-dom";
import { MdDarkMode, MdLightMode, MdEmail } from "react-icons/md";
import { TbWorld } from "react-icons/tb";
import { FaUserPlus, FaBook, FaConnectdevelop } from "react-icons/fa";
import { FaShieldHalved, FaBell } from "react-icons/fa6";
import { IoIosLogOut } from "react-icons/io";
import DropdownManu from "../../CustomHook/DropdownManu";
import { useGlobleContextDarklight } from "../../AllContext/context";
import { useEffect, useState } from "react";
import { AxiosApi } from "../Axios/Axios";
interface UserData {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  imageProfile: string;
}

const Header = () => {
  const navigate = useNavigate();
  const { darkLight, setDarkLight } = useGlobleContextDarklight();
  const [dataUser] = useState<any>();
  const [dateTime, setDateTime] = useState<string>("");
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("CurrentUserLibrary");
    if (stored) {
      const parsed = JSON.parse(stored);
      getCurrentUser(parsed?.userId);
    }
  }, []);

  const getCurrentUser = async (userid: number) => {
    try {
      const res = await AxiosApi.get(`Person/${userid}`);
      const userData = res?.data?.data;
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "Asia/Phnom_Penh",
      };
      setDateTime(now.toLocaleString("en-US", options));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSelect = (value: string) => {
    if (value === "Log Out") {
      navigate("/login");
      localStorage.removeItem("CurrentUserLibrary");
    } else if (value === "My Account") {
      navigate("/myprofile");
    } else if (value === "Reset Password") {
      navigate("page/reset-password");
    }
  };

  const borrowedBooks = [
    { profile: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100", option: "The Great Gatsby" },
    { profile: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=100", option: "1984" },
    { profile: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=100", option: "To Kill a Mockingbird" },
  ];

  return (
    <nav className={`navbar px-4 w-full h-[65px] shadow-lg sticky top-0 z-40 flex justify-between items-center border-b-2 transition-all duration-300 ${darkLight
      ? "bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-purple-700"
      : "bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-200 border-indigo-300"
      }`}>
      <div className="flex items-center w-[30%] cursor-pointer" onClick={() => navigate("/")}>
        <div className="relative group">
          {/* Main Security Camera Icon */}
          <div className={`p-2 rounded-lg transition-all duration-300 ${darkLight ? "bg-slate-800 text-cyan-400" : "bg-blue-600 text-white"
            }`}>
            <FaConnectdevelop className="w-[35px] h-[35px] drop-shadow-lg group-hover:scale-110 transition-transform" />
          </div>

          {/* Status Indicator (Pulse) */}
          <div className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
          </div>
        </div>

        <div className="ml-3 hidden md:block">
          <div className="flex items-center gap-2">
            {/* "SOKHA" or "SK" Branding */}
            <span className={`text-2xl font-black tracking-wider drop-shadow-sm ${darkLight ? "text-white" : "text-blue-900"
              }`}>
              SOKHA <span className="text-yellow-500">SK</span>
            </span>
          </div>
          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] -mt-1 ${darkLight ? "text-cyan-300" : "text-blue-600"
            }`}>
            Security & Tech Solutions
          </p>
        </div>
      </div>

      <div className="flex items-center w-[80%] justify-end gap-2">
        {/* Time Display */}
        <div className="text-sm font-semibold text-white bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hidden sm:block border border-white/30">
          {dateTime}
        </div>

        {/* Dark/Light Toggle */}
        {!darkLight ? (
          <MdDarkMode
            onClick={() => setDarkLight(true)}
            className="w-[42px] h-[42px] p-2 rounded-xl cursor-pointer bg-white/90 hover:bg-white text-indigo-600 hover:scale-110 transition-all shadow-lg"
          />
        ) : (
          <MdLightMode
            onClick={() => setDarkLight(false)}
            className="w-[42px] h-[42px] p-2 rounded-xl cursor-pointer bg-white/90 hover:bg-white text-yellow-500 hover:scale-110 transition-all shadow-lg"
          />
        )}

        {/* Language */}
        <DropdownManu
          label={<TbWorld className="hidden sm:block w-[42px] h-[42px] p-2 bg-white/90 hover:bg-white rounded-xl hover:scale-110 transition-all text-indigo-600 shadow-lg" />}
          options={[
            { profile: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Flag_of_Cambodia.svg/320px-Flag_of_Cambodia.svg.png", option: "khmer" },
            { profile: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/320px-Flag_of_the_United_States.svg.png", option: "English" }
          ]}
          onSelect={handleSelect}
          shoeProfilr={true}
          iconsHideDropdown={true}
          inputClass="w-[200px] z-[999]"
        />

        <DropdownManu
          label={
            <div className="profile w-[145px] h-[48px] rounded-xl bg-white/90 hover:bg-white backdrop-blur-sm ml-3 flex items-center cursor-pointer hover:scale-105 transition-all shadow-lg border-2 border-white/50">
              <img
                src={user?.imageProfile != "" ? user?.imageProfile : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                className="w-[42px] h-[42px] rounded-lg border-2 mr-2 border-indigo-500 object-cover"
                alt=""
              />
              <div className="flex-1 overflow-hidden">
                <h4 className="text-sm font-bold text-gray-800 truncate">{user?.username ?? "username"}</h4>
                <p className="text-[10px] text-gray-600 truncate">{user?.email ?? "admin@lib.com"}</p>
              </div>
            </div>
          }
          options={[
            { iconsItem: <FaUserPlus />, option: "My Account" },
            { iconsItem: <FaShieldHalved />, option: "Reset Password" },
            { iconsItem: <IoIosLogOut className="text-red-500" />, option: "Log Out" }
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