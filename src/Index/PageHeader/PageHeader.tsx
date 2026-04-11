// import { useState, useEffect } from "react";
// import { useGlobleContextDarklight } from "../../AllContext/context.tsx";
// import Header from "../../component/header/Header.tsx"
// import { NavLink, Outlet, useNavigate } from "react-router-dom";
// import { FiChevronDown, FiChevronRight, FiMenu, FiX } from "react-icons/fi";
// import menuItems from "../../Contants/Menu-Data.tsx";

// const Index = () => {
//     const { darkLight } = useGlobleContextDarklight();
//     const [menuOpen, setMenuOpen] = useState(true);
//     const [active, setActive] = useState<string | null>(null);
//     const [userPermissions, setUserPermissions] = useState<string[]>([]);
//     const navigate = useNavigate();
//     const scrollbarStyles = `
//         .sidebar-nav::-webkit-scrollbar {
//             width: 5px;
//         }
//         .sidebar-nav::-webkit-scrollbar-thumb {
//             background-color: transparent;
//             border-radius: 10px;
//         }
//         .sidebar-nav:hover::-webkit-scrollbar-thumb {
//             background-color: ${darkLight ? "#4B5563" : "#CBD5E1"};
//         }
//         .sidebar-nav::-webkit-scrollbar-thumb:hover {
//             background-color: ${darkLight ? "#6B7280" : "#94A3B8"};
//         }
//     `;

//     useEffect(() => {
//         const storedData = localStorage.getItem("CurrentUserLibrary");
//         if(!storedData){
//             navigate("/login");
//         }
//         if (storedData) {
//             try {
//                 const parsedData = JSON.parse(storedData);
//                 setUserPermissions(parsedData.permissions || []);
//             } catch (error) {
//                 console.error("Failed to parse CurrentUserLibrary", error);
//             }
//         }
//     }, [navigate]);

//     const handleToggle = (label: string) => {
//         setActive((prev) => (prev === label ? null : label));
//     };

//     const hasPermission = (permKey?: string) => {
//         if (!permKey) return true;
//         return userPermissions.includes(permKey);
//     };

//     const filteredMenu = menuItems.filter(item => {
//         if (item.children) {
//             const allowedChildren = item.children.filter(child => hasPermission(child.permission));
//             return allowedChildren.length > 0;
//         }
//         return hasPermission(item?.permission);
//     });

//     return (
//         <>
//             {/* បញ្ចូល Scrollbar Style ទៅក្នុង DOM */}
//             <style>{scrollbarStyles}</style>
            
//             <Header />
//             <div className={`fixed ${darkLight ? "bg-gray-900 min-h-screen w-full" : "w-full min-h-screen"}`}>
//                 <div className={`flex h-screen transition-colors duration-500 ${darkLight ? "bg-gray-900 text-white" : "bg-white text-gray-800"}`}>

//                     {/* Sidebar */}
//                     <div className={`transition-all duration-500 ease-in-out ${menuOpen ? "w-64" : "w-20"} ${darkLight ? "bg-gray-800" : "bg-white"} shadow-lg h-full flex flex-col`}>

//                         <div className="flex items-center justify-between px-4 py-4">
//                             <h2 className={`text-xl font-bold whitespace-nowrap transition-all duration-300 ${menuOpen ? "opacity-100" : "opacity-0"}`}>
//                                 {menuOpen && "Library System"}
//                             </h2>
//                             <button
//                                 onClick={() => setMenuOpen(!menuOpen)}
//                                 className={`text-xl rounded p-2 transition-colors ${darkLight ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
//                             >
//                                 {menuOpen ? <FiX /> : <FiMenu />}
//                             </button>
//                         </div>

//                         {/* Navigation ជាមួយនឹង class "sidebar-nav" */}
//                         <nav className="flex-1 overflow-y-auto px-2 space-y-2 mb-25 sidebar-nav" style={{ scrollbarWidth: 'thin' }}>
//                             {filteredMenu.map((item) => {
//                                 const visibleChildren = item.children?.filter(child => hasPermission(child.permission));

//                                 return (
//                                     <div key={item.label}>
//                                         <div
//                                             className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${darkLight ? "hover:bg-gray-700" : "hover:bg-blue-100"}`}
//                                             onClick={() => handleToggle(item.label)}
//                                         >
//                                             <div className="flex items-center gap-4">
//                                                 <span className="text-2xl" onClick={() => setMenuOpen(true)}>
//                                                     {item.icon}
//                                                 </span>
//                                                 {menuOpen && (
//                                                     item.path ? (
//                                                         <NavLink
//                                                             to={item.path}
//                                                             className={({ isActive }) =>
//                                                                 `text-base font-medium py-2 ${isActive ? "text-blue-400" : ""}`
//                                                             }
//                                                         >
//                                                             {item.label}
//                                                         </NavLink>
//                                                     ) : (
//                                                         <span className="text-base font-medium">{item.label}</span>
//                                                     )
//                                                 )}
//                                             </div>
//                                             {item.children && menuOpen && (
//                                                 <span className="text-lg">
//                                                     {active === item.label ? <FiChevronDown /> : <FiChevronRight />}
//                                                 </span>
//                                             )}
//                                         </div>

//                                         {item.children && active === item.label && menuOpen && (
//                                             <div className={`ml-6 mt-1 space-y-1 text-sm ${darkLight ? "text-gray-300" : "text-gray-600"}`}>
//                                                 {visibleChildren?.map((child) => (
//                                                     <NavLink
//                                                         key={child.name}
//                                                         to={child.path}
//                                                         className={({ isActive }) =>
//                                                             `flex items-center gap-3 pl-4 py-2 transition-all cursor-pointer rounded-md ${darkLight ? 'hover:bg-gray-600' : 'hover:bg-blue-100'
//                                                             } ${isActive ? (darkLight ? "text-blue-300 bg-gray-700" : "text-blue-600 bg-blue-50") : ""}`
//                                                         }
//                                                     >
//                                                         <span className="text-lg">{child.icon}</span>
//                                                         <span>{child.name}</span>
//                                                     </NavLink>
//                                                 ))}
//                                             </div>
//                                         )}
//                                     </div>
//                                 );
//                             })}
//                         </nav>
//                     </div>

//                     {/* Main Content */}
//                     <div className="flex-1 overflow-y-auto p-4">
//                         <Outlet />
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default Index;



import { useState, useEffect } from "react";
import { useGlobleContextDarklight } from "../../AllContext/context.tsx";
import Header from "../../component/header/Header.tsx";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FiChevronDown, FiChevronRight, FiMenu, FiX } from "react-icons/fi";
import menuItems from "../../Contants/Menu-Data.tsx";

const Index = () => {
  const { darkLight } = useGlobleContextDarklight();
  const [menuOpen, setMenuOpen] = useState(true);
  const [active, setActive] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const navigate = useNavigate();

  const scrollbarStyles = `
    .sidebar-nav::-webkit-scrollbar {
      width: 5px;
    }
    .sidebar-nav::-webkit-scrollbar-thumb {
      background-color: transparent;
      border-radius: 10px;
    }
    .sidebar-nav:hover::-webkit-scrollbar-thumb {
      background-color: ${darkLight ? "#4B5563" : "#CBD5E1"};
    }
    .sidebar-nav::-webkit-scrollbar-thumb:hover {
      background-color: ${darkLight ? "#6B7280" : "#94A3B8"};
    }
  `;

  useEffect(() => {
    const storedData = localStorage.getItem("CurrentUserLibrary");

    if (!storedData) {
      navigate("/login");
      return;
    }

    try {
      const parsedData = JSON.parse(storedData);
      setUserPermissions(parsedData.permissions || []);
    } catch (error) {
      console.error("Failed to parse CurrentUserLibrary", error);
    }
  }, [navigate]);

  const handleToggle = (label: string) => {
    setActive((prev) => (prev === label ? null : label));
  };

  const hasPermission = (permKey?: string) => {
    if (!permKey) return true;
    return userPermissions.includes(permKey);
  };

  const filteredMenu = menuItems.filter((item) => {
    if (item.children) {
      const allowedChildren = item.children.filter((child) =>
        hasPermission(child.permission)
      );
      return allowedChildren.length > 0;
    }
    return hasPermission(item?.permission);
  });

  return (
    <>
      <style>{scrollbarStyles}</style>

      <Header />

      <div
        className={`fixed ${
          darkLight ? "bg-gray-900 min-h-screen w-full" : "w-full min-h-screen"
        }`}
      >
        <div
          className={`flex h-screen transition-colors duration-500 ${
            darkLight ? "bg-gray-900 text-white" : "bg-white text-gray-800"
          }`}
        >
          {/* ================= SIDEBAR ================= */}
          <div
            className={`transition-all duration-500 ease-in-out ${
              menuOpen ? "w-64" : "w-20"
            } ${darkLight ? "bg-gray-800" : "bg-white"} shadow-lg h-full flex flex-col`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4">
              <h2
                className={`text-xl font-bold whitespace-nowrap transition-all duration-300 ${
                  menuOpen ? "opacity-100" : "opacity-0"
                }`}
              >
                {menuOpen && "Library System"}
              </h2>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`text-xl rounded p-2 ${
                  darkLight ? "hover:bg-gray-700" : "hover:bg-gray-200"
                }`}
              >
                {menuOpen ? <FiX /> : <FiMenu />}
              </button>
            </div>

            {/* ================= MENU ================= */}
            <nav
              className="flex-1 overflow-y-auto px-2 space-y-2 mb-25 sidebar-nav"
              style={{ scrollbarWidth: "thin" }}
            >
              {filteredMenu.map((item) => {
                const visibleChildren = item.children?.filter((child) =>
                  hasPermission(child.permission)
                );

                const isOpen = active === item.label;

                return (
                  <div key={item.label}>
                    {/* ===== ITEM WITH PATH (CLICK FULL ROW) ===== */}
                    {item.path ? (
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer transition-colors
                          ${darkLight ? "hover:bg-gray-700" : "hover:bg-blue-100"}
                          ${
                            isActive
                              ? darkLight
                                ? "bg-gray-700 text-blue-300"
                                : "bg-blue-100 text-blue-600"
                              : ""
                          }`
                        }
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">{item.icon}</span>
                          {menuOpen && (
                            <span className="text-base font-medium">
                              {item.label}
                            </span>
                          )}
                        </div>
                      </NavLink>
                    ) : (
                      /* ===== ITEM WITHOUT PATH (TOGGLE) ===== */
                      <div
                        onClick={() => handleToggle(item.label)}
                        className={`flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer transition-colors
                        ${
                          darkLight
                            ? "hover:bg-gray-700"
                            : "hover:bg-blue-100"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">{item.icon}</span>
                          {menuOpen && (
                            <span className="text-base font-medium">
                              {item.label}
                            </span>
                          )}
                        </div>

                        {item.children && menuOpen && (
                          <span className="text-lg">
                            {isOpen ? (
                              <FiChevronDown />
                            ) : (
                              <FiChevronRight />
                            )}
                          </span>
                        )}
                      </div>
                    )}

                    {/* ===== CHILDREN ===== */}
                    {item.children && isOpen && menuOpen && (
                      <div
                        className={`ml-6 mt-1 space-y-1 text-sm ${
                          darkLight ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {visibleChildren?.map((child) => (
                          <NavLink
                            key={child.name}
                            to={child.path}
                            className={({ isActive }) =>
                              `flex items-center gap-3 pl-4 py-2 rounded-md transition-all cursor-pointer
                              ${
                                darkLight
                                  ? "hover:bg-gray-600"
                                  : "hover:bg-blue-100"
                              }
                              ${
                                isActive
                                  ? darkLight
                                    ? "bg-gray-700 text-blue-300"
                                    : "bg-blue-50 text-blue-600"
                                  : ""
                              }`
                            }
                          >
                            <span className="text-lg">{child.icon}</span>
                            <span>{child.name}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* ================= MAIN ================= */}
          <div className="flex-1 overflow-y-auto p-4">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;