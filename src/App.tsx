import Header from "./component/header/Header";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import './App.css';
import { useGlobleContextDarklight } from "./AllContext/context";
import User from "./component/Pages/AllUsers/Users.tsx"
import Admin from "./component/Pages/AllUsers/Admin.tsx"
import { useState, useEffect } from "react";
import DashBord from "./page/DashBord";
import Product from "./component/Pages/Product";
// import Formtest from "./CustomHook/HookForm.tsx";
// import Useform from "./component/Form/HowtouseForm.tsx/UseForm.tsx";
import { useRefreshTable } from "./AllContext/context";
import {
  FiMenu, FiX, FiBarChart2, FiBookOpen, FiClipboard, FiChevronDown, FiChevronUp,
} from "react-icons/fi";
import { FaChalkboardTeacher } from "react-icons/fa";

// import TestImage from "./component/Pages/testImage.tsx"
import Formlogin from './component/Form/FormLoginLogout/Login2.tsx';
import Register from "./component/Form/FormLoginLogout/Register.tsx";
import MyProfile from "./component/Pages/Imformation/MyAccount.tsx";
import TestveriesEmail from "./component/Pages/TestverfiesEmail.tsx"
import Sale from "./component/Pages/Sale.tsx";
// import PosCoffee from "./component/Pages/CoffeeMenu.tsx"
import PosCoffee from "./component/Pages/ProductAll.tsx"
import DashboardCoffee from './component/Pages/DashbordCoffee.tsx';
import HistorySale from './component/Pages/ItemhasSale.tsx';
import Invoice from './component/Pages/Invoice.tsx';
import Report from './component/Pages/Report.tsx';
import InvoiceTest from './component/Pages/Invoicetest.tsx';
import { MdMenuBook } from "react-icons/md";
import AddMenuCoffee from "./component/Pages/AddMenuCoffee.tsx";
import TestLoginToken from './component/Form/FormLoginLogout/Login2.tsx';
// import useFetchDataApi from "./CustomHook/FetchDataApi.tsx";
import TestImage2 from "./component/Pages/TestImage2.tsx";
import Alluser from "./component/Pages/AllUsers/AllUser.tsx";
import SendMail from "./component/Pages/test SendMail/SendMail.tsx";
import ForgotPassword from "./component/Form/FormLoginLogout/ForgotPassword.tsx";
import FormVerifycode from "./component/Form/FormLoginLogout/FormVerifyCode.tsx"
import FormResetPassword from "./component/Form/FormLoginLogout/FormResetPassword.tsx";
import ResetPassword from "./component/Pages/Imformation/ResetPassword.tsx";
import FormForgotpassword from "./component/Pages/Imformation/FormForgotPassword.tsx";
import FormVerifyCode from "./component/Pages/Imformation/FormverifyCode.tsx";
import FormcreatePSnew from "./component/Pages/Imformation/Createpassswordnew.tsx";

const menuItems = [
  { label: "Dashboard", icon: <FiBarChart2 />, path: "/dashbord" },
  {
    label: "Menu", icon: <MdMenuBook />, children: [
      { name: "Menu", path: "/productall" },
      { name: "Add Menu", path: "/addmenucoffee" },
      { name: "Send Mail", path: "/sendmail" },
    ]
  },
  {
    label: "Invoice", icon: <FaChalkboardTeacher />, children: [
      { name: "Invoice", path: "/invoice" },
      { name: "Report", path: "/report" },
      { name: "InvoiceTest", path: "/invoicetest" },
    ]
  },
  {
    label: "Users", icon: <FaChalkboardTeacher />, children: [
      { name: "All User", path: "/alluser" },
      { name: "Admin", path: "/admin" },
      { name: "User", path: "/users" },
    ]
  },
  {
    label: "Products", icon: <FaChalkboardTeacher />, children: [
      { name: "Product", path: "/product" },
      { name: "Product", path: "/product" },
    ]
  },
  {
    label: "Classes", icon: <FiBookOpen />, children: [
      { name: "Log in token ", path: "/testtoken" },
      { name: "Test Image 2", path: "/testimage2" },
    ]
  },
  {
    label: "Reports", icon: <FiClipboard />, children: [
      { name: "History Sale", path: "/historySale" },
    ]
  },
];

const App = () => {
  // const { data: testapi } = useFetchDataApi("https://localhost:7095/api/Health");
  const { refreshTables } = useRefreshTable();
  const { darkLight } = useGlobleContextDarklight();

  const [menuOpen, setMenuOpen] = useState(true);
  const [active, setActive] = useState<string | null>(null);

  const handleToggle = (label: string) => {
    setActive((prev) => (prev === label ? null : label));
  };
  // const { data } = useFetchDataApi('https://localhost:7095/api/Auth/login');
  // console.log("token from API : ", data);

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(sessionStorage.getItem("token"));
  }, [refreshTables]);


  return (
    <BrowserRouter>
      {!token ?
        <Routes>
          <Route path="/*" element={<Formlogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-code" element={<FormVerifycode />} />
          <Route path="/reset-password" element={<FormResetPassword />} />
          <Route path="/register" element={<Register />} />
        </Routes>
        : <>
          <Header />
          <div className={` bg-red-500 fixed ${darkLight ? "bg-gray-900 min-h-screen w-full" : "w-full min-h-screen "}`}>
            <div className={`flex h-screen transition-colors duration-500 ${darkLight ? "bg-gray-900 text-white" : "bg-white text-gray-800"}`}>
              <div className={`transition-all duration-500 ease-in-out ${menuOpen ? "w-64" : "w-20"} ${darkLight ? "bg-gray-800" : "bg-white"} shadow-lg h-full flex flex-col`}>
                <div className="flex items-center justify-between px-4 py-4">
                  <h2 className={`text-xl font-bold whitespace-nowrap transition-all duration-300 ${menuOpen ? "opacity-100" : "opacity-0"}`}>
                    {menuOpen && "Coffee Admin"}
                  </h2>
                  <button onClick={() => setMenuOpen(!menuOpen)} className="text-xl rounded hover:bg-gray-700 p-2">
                    {menuOpen ? <FiX /> : <FiMenu />}
                  </button>
                </div>
                <nav className="flex-1 overflow-y-auto px-2 space-y-2">
                  {menuItems.map(({ label, icon, path, children }) => (
                    <div key={label}>
                      <div
                        className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer ${darkLight ? "hover:bg-gray-700" : "hover:bg-blue-100"}`}
                        onClick={() => handleToggle(label)}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-2xl" onClick={() => setMenuOpen(true)}>{icon}</span>
                          {menuOpen && (
                            path ? (
                              <NavLink to={path} className={({ isActive }) => `text-base font-medium pr-25 py-2 ${isActive ? "text-blue-400 " : ""}`}>{label}</NavLink>
                            ) : (
                              <span className="text-base font-medium">{label}</span>
                            )
                          )}
                        </div>
                        {children && menuOpen && (
                          <span className="text-lg">{active === label ? <FiChevronUp /> : <FiChevronDown />}</span>
                        )}
                      </div>
                      {children && active === label && menuOpen && (
                        <div className={`ml-10 mt-1 space-y-1 text-sm ${darkLight ? "text-gray-300" : "text-gray-600"}`}>
                          {children.map((child) => (
                            <NavLink
                              key={child.name}
                              to={child.path}
                              className={({ isActive }) =>
                                `block pl-1 py-2 transition-all cursor-pointer hover:bg-gray-600 rounded-md ${isActive
                                  ? darkLight
                                    ? "text-blue-300"
                                    : "text-blue-600"
                                  : ""}`
                              }
                            >
                              {child.name}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <Routes>
                  <Route path="/dashbord" element={<DashBord />} />
                  <Route path="/users" element={<User />} />
                  <Route path="/alluser" element={<Alluser />} />
                  <Route path="/product" element={<Product />} />
                  {/* <Route path="/students" element={<Formtest />} /> */}
                  <Route path="/myprofile" element={<MyProfile />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/sale" element={<Sale />} />
                  <Route path="/testveryemail" element={<TestveriesEmail />} />
                  <Route path="/invoice" element={<Invoice />} />
                  <Route path="/report" element={<Report />} />
                  <Route path="/productall" element={<PosCoffee />} />
                  <Route path="/dashbordcoffee" element={<DashboardCoffee />} />
                  <Route path="/historySale" element={<HistorySale />} />
                  <Route path="/invoicetest" element={<InvoiceTest />} />
                  <Route path="/addmenucoffee" element={<AddMenuCoffee />} />

                  {/* test all component  */}
                  <Route path="/testtoken" element={<TestLoginToken />} />
                  <Route path="/testimage2" element={<TestImage2 />} />
                  <Route path="/sendmail" element={<SendMail />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/forgotpassword" element={<FormForgotpassword />} />
                  <Route path="/formverifycode" element={<FormVerifyCode />} />
                  <Route path="/createpasswordnew" element={<FormcreatePSnew />} />

                </Routes>
              </div>
            </div>
          </div>
        </>}
    </BrowserRouter>
  );
};

export default App;
