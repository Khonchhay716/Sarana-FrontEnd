import { useNavigate } from "react-router-dom";
import { MdDarkMode, MdLightMode, MdEmail } from "react-icons/md";
import { TbWorld } from "react-icons/tb";
import { FaUserPlus } from "react-icons/fa";
import { FaShieldHalved, FaCartShopping, FaBell } from "react-icons/fa6";
import { IoIosLogOut } from "react-icons/io";
import DropdownManu from "../../CustomHook/DropdownManu";
import { useGlobleContextDarklight, useRefreshTable } from "../../AllContext/context";
import { useEffect, useState } from "react";
import useFetchDataApi from "../../CustomHook/FetchDataApi";

const Header = () => {
  const navigate = useNavigate();
  const { setRefreshTables } = useRefreshTable();
  const { darkLight, setDarkLight } = useGlobleContextDarklight();

  const [dataUser, setDataUser] = useState<any>();
  const { data } = useFetchDataApi("https://localhost:7095/api/User");

  const [dateTime, setDateTime] = useState<string>("");

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
        timeZone: "Asia/Phnom_Penh", // Cambodia time
      };
      setDateTime(now.toLocaleString("en-US", options));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const email = sessionStorage.getItem("email");
    if (data && email) {
      setDataUser(data.find((item: { email: string }) => item.email === email));
    }
  }, [data]);

  const handleSelect = (value: string) => {
    if (value === "Log Out") {
      const confirm = window.confirm("Are you sure you want to logout?");
      if (confirm) {
        navigate("/login");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("email");
        setRefreshTables(new Date());
      }
    } else if (value === "My Account") {
      navigate("/myprofile");
    } else if (value === "Reset Password") {
      navigate("page/reset-password");
    }
  };

  const dataOrdered = [
    { profile: "https://images.ctfassets.net/h6goo9gw1hh6/...jpg", option: "Mrr Khmer" },
    { profile: "https://images.ctfassets.net/h6goo9gw1hh6/...jpg", option: "Mrr test" },
    { profile: "https://images.ctfassets.net/h6goo9gw1hh6/...jpg", option: "Mrs Test" },
    { profile: "https://images.ctfassets.net/h6goo9gw1hh6/...jpg", option: "Mrr new" },
  ];

  return (
    <nav className={`navbar px-4 w-full h-[60px] shadow-md sticky top-0 z-40 flex justify-between items-center ${darkLight ? "bg-gray-900" : "bg-white"}`}>
      <div className="flex items-center w-[20%]">
        <img
          src="https://marketplace.canva.com/EAGQJOtMpq8/2/0/1600w/canva-brown-modern-circle-coffee-shop-logo-TCp6UxDtpus.jpg"
          className="w-[45px] h-[45px] rounded-full bg-amber-300"
          alt="logo"
        />
        <span className="text-lg font-bold ml-3 hidden md:block" style={darkLight ? { color: "white" } : { color: "black" }}>Coffee</span>
      </div>

      <div className="flex items-center w-[80%] justify-end">
        {/* Time Display */}
        <div className="text-sm font-medium text-gray-700 dark:text-white mx-4 hidden sm:block">
          {dateTime}
        </div>

        {/* Dark/Light Toggle */}
        {!darkLight ? (
          <MdDarkMode onClick={() => setDarkLight(true)} className="w-[40px] h-[40px] p-2 rounded-full cursor-pointer bg-sky-100 hover:bg-sky-200" />
        ) : (
          <MdLightMode onClick={() => setDarkLight(false)} className="w-[40px] h-[40px] bg-sky-100 p-2 rounded-full cursor-pointer hover:bg-sky-200" />
        )}

        {/* Language */}
        <DropdownManu
          label={<TbWorld className="hidden sm:block w-[40px] h-[40px] p-2 bg-sky-100 rounded-full hover:bg-sky-200 ml-3" />}
          options={[
            { profile: "https://upload.wikimedia.org/...Flag_of_Cambodia.svg.png", option: "khmer" },
            { profile: "https://i.ebayimg.com/...jpg", option: "English" }
          ]}
          onSelect={handleSelect}
          shoeProfilr={true}
          iconsHideDropdown={true}
          inputClass="w-[200px] z-[999]"
        />

        {/* Cart */}
        <DropdownManu
          label={<FaCartShopping className="w-[40px] h-[40px] bg-sky-100 p-2 rounded-full cursor-pointer hover:bg-sky-200 ml-3" />}
          options={dataOrdered}
          textHeade="Ordered"
          onSelect={handleSelect}
          iconsHideDropdown={true}
          shoeProfilr={true}
          headerShow={true}
          footerShow={true}
          inputClass="w-[300px] -ml-[100px] z-[999]"
        />

        {/* Email */}
        <DropdownManu
          label={<MdEmail className="hidden md:block w-[40px] h-[40px] rounded-full p-2 bg-sky-100 hover:bg-sky-200 cursor-pointer ml-3" />}
          options={[
            { profile: "https://images.ctfassets.net/...jpg", option: "option1" },
            { profile: "https://images.ctfassets.net/...jpg", option: "option2" }
          ]}
          onSelect={handleSelect}
          shoeProfilr={true}
          iconsHideDropdown={true}
          headerShow={true}
          textHeade="Message(12)"
          footerShow={true}
          textButton="Show all"
          showIconItem={true}
          inputClass="w-[250px] z-[999]"
        />

        {/* Notifications */}
        <DropdownManu
          label={<FaBell className="hidden md:block w-[40px] h-[40px] bg-sky-100 p-2 rounded-full cursor-pointer hover:bg-sky-200 ml-3" />}
          options={[{ profile: "", option: "option1" }, { profile: "", option: "option2" }]}
          onSelect={handleSelect}
          iconsHideDropdown={true}
          shoeProfilr={true}
          inputClass="w-[300px] -ml-[200px] z-[999]"
          footerShow={true}
          headerShow={true}
          textHeade="Notification(112)"
          settingHide={false}
          textButton="SHOW ALL ITEM"
        />

        {/* Profile */}
        <DropdownManu
          label={
            <div className="profile w-[140px] h-[45px] rounded-2xl bg-sky-100 hover:bg-sky-200 ml-7 flex items-center cursor-pointer">
              <img
                src={dataUser?.profilePicture ?? "https://via.placeholder.com/40"}
                className="w-[40px] h-[40px] rounded-full border-2 mr-1.5 border-indigo-500"
                alt=""
              />
              <div>
                <h4 className="text-md -mt-3 font-bold ml-[-10px]">{dataUser?.name ?? "Name"}</h4>
                <p className="-mt-0.5 -ml-1.5 text-[10px]">{dataUser?.email ?? "@Test.com"}</p>
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
