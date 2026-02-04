import { useNavigate } from "react-router-dom";
import { MdDarkMode, MdLightMode, MdEmail } from "react-icons/md";
import { TbWorld } from "react-icons/tb";
import { FaUserPlus, FaBook } from "react-icons/fa";
import { FaShieldHalved, FaBell } from "react-icons/fa6";
import { IoIosLogOut } from "react-icons/io";
import { BiBookReader } from "react-icons/bi";
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
      const res = await AxiosApi.get(`Users/${userid}`);
      const userData = res?.data?.data;
      setUser(userData);
      // setFormData({
      //   username: userData.username,
      //   email: userData.email,
      //   firstName: userData.firstName,
      //   lastName: userData.lastName,
      //   phoneNumber: userData.phoneNumber,
      //   imageProfile: userData.imageProfile,
      //   roleIds: userData.roles?.map((r: any) => r.id) || [],
      //   isActive: userData.isActive ?? true
      // });
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
      <div className="flex items-center w-[20%]">
        <div className="relative">
          <BiBookReader className="w-[50px] h-[50px] text-white drop-shadow-lg animate-bounce" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        </div>
        <div className="ml-3 hidden md:block">
          <span className="text-xl font-bold text-white drop-shadow-md">LIBRARY</span>
          <p className="text-xs text-blue-200 -mt-1">Management System</p>
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

        {/* Borrowed Books */}
        <DropdownManu
          label={
            <div className="relative">
              <FaBook className="w-[42px] h-[42px] bg-white/90 hover:bg-white p-2 rounded-xl cursor-pointer hover:scale-110 transition-all text-green-600 shadow-lg" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {borrowedBooks.length}
              </span>
            </div>
          }
          options={borrowedBooks}
          textHeade="Borrowed Books"
          onSelect={handleSelect}
          iconsHideDropdown={true}
          shoeProfilr={true}
          headerShow={true}
          footerShow={true}
          inputClass="w-[300px] -ml-[100px] z-[999]"
        />

        {/* Email */}
        <DropdownManu
          label={
            <div className="relative">
              <MdEmail className="hidden md:block w-[42px] h-[42px] rounded-xl p-2 bg-white/90 hover:bg-white hover:scale-110 transition-all cursor-pointer text-blue-600 shadow-lg" />
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                5
              </span>
            </div>
          }
          options={[
            { profile: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100", option: "New book arrival" },
            { profile: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", option: "Return reminder" }
          ]}
          onSelect={handleSelect}
          shoeProfilr={true}
          iconsHideDropdown={true}
          headerShow={true}
          textHeade="Messages (5)"
          footerShow={true}
          textButton="Show all"
          showIconItem={true}
          inputClass="w-[280px] z-[999]"
        />

        {/* Notifications */}
        <DropdownManu
          label={
            <div className="relative">
              <FaBell className="hidden md:block w-[42px] h-[42px] bg-white/90 hover:bg-white p-2 rounded-xl cursor-pointer hover:scale-110 transition-all text-purple-600 shadow-lg" />
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
                12
              </span>
            </div>
          }
          options={[
            { profile: "", option: "Book due tomorrow" },
            { profile: "", option: "New reservation available" }
          ]}
          onSelect={handleSelect}
          iconsHideDropdown={true}
          shoeProfilr={true}
          inputClass="w-[300px] -ml-[200px] z-[999]"
          footerShow={true}
          headerShow={true}
          textHeade="Notifications (12)"
          settingHide={false}
          textButton="SHOW ALL"
        />

        {/* Profile */}
        <DropdownManu
          label={
            <div className="profile w-[145px] h-[48px] rounded-xl bg-white/90 hover:bg-white backdrop-blur-sm ml-3 flex items-center cursor-pointer hover:scale-105 transition-all shadow-lg border-2 border-white/50">
              <img
                src={user?.imageProfile != "" ? user?.imageProfile :  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"}
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
            // { iconsItem: <FaShieldHalved />, option: "Reset Password" },
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