// import { useState, useEffect } from "react";
// import { useGlobleContextDarklight, useSidebar } from "../../AllContext/context.tsx";
// import Header from "../../component/header/Header.tsx";
// import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
// import { FiChevronDown, FiChevronRight } from "react-icons/fi";
// import menuItems from "../../Contants/Menu-Data.tsx";

// const Index = () => {
//   const { darkLight } = useGlobleContextDarklight();
//   const { menuOpen, setMenuOpen, sidebarVisible, setSidebarVisible } = useSidebar();
//   const [active, setActive] = useState<string | null>(null);
//   const [userPermissions, setUserPermissions] = useState<string[]>([]);
//   const navigate = useNavigate();
//   const location = useLocation();

//   const scrollbarStyles = `
//     .sidebar-nav::-webkit-scrollbar { width: 5px; }
//     .sidebar-nav::-webkit-scrollbar-thumb { background-color: transparent; border-radius: 10px; }
//     .sidebar-nav:hover::-webkit-scrollbar-thumb { background-color: ${darkLight ? "#4B5563" : "#CBD5E1"}; }
//     .sidebar-nav::-webkit-scrollbar-thumb:hover { background-color: ${darkLight ? "#6B7280" : "#94A3B8"}; }
//   `;

//   useEffect(() => {
//     const storedData = localStorage.getItem("CurrentUserLibrary");
//     if (!storedData) { navigate("/login"); return; }
//     try {
//       const parsedData = JSON.parse(storedData);
//       setUserPermissions(parsedData.permissions || []);
//     } catch (error) {
//       console.error("Failed to parse CurrentUserLibrary", error);
//     }
//   }, [navigate]);

//   // Close full-screen overlay on route change, keep icon strip
//   useEffect(() => {
//     const activeParent = menuItems.find((item) =>
//       item.children?.some((child) => location.pathname.startsWith(child.path))
//     );
//     setActive(activeParent ? activeParent.label : null);
//     setMenuOpen(false);
//   }, [location.pathname]);

//   const hasPermission = (permKey?: string) => {
//     if (!permKey) return true;
//     return userPermissions.includes(permKey);
//   };

//   const filteredMenu = menuItems.filter((item) => {
//     if (item.children) return item.children.some((child) => hasPermission(child.permission));
//     return hasPermission(item?.permission);
//   });

//   // ── Mobile: narrow icon strip ─────────────────────────────────────────────
//   // ✅ Every icon click opens full-screen overlay regardless of sub-items
//   const renderMobileIconStrip = () => (
//     <nav className="flex-1 overflow-y-auto px-1 space-y-2 sidebar-nav mt-3" style={{ scrollbarWidth: "thin" }}>
//       {filteredMenu.map((item) => {
//         const hasActiveChild = item.children?.some((child) =>
//           location.pathname.startsWith(child.path)
//         );
//         const isCurrentPage = item.path
//           ? location.pathname.startsWith(item.path)
//           : false;

//         return (
//           <div key={item.label}>
//             <div
//               onClick={() => {
//                 setActive(item.children ? item.label : null);
//                 setMenuOpen(true); // ✅ always open full-screen
//               }}
//               className={`flex items-center justify-center p-3 rounded-lg cursor-pointer transition-colors
//                 ${darkLight ? "hover:bg-gray-700" : "hover:bg-blue-100"}
//                 ${hasActiveChild || isCurrentPage
//                   ? (darkLight ? "bg-gray-700 text-blue-300" : "bg-blue-100 text-blue-600")
//                   : ""
//                 }`}
//             >
//               <span className="text-2xl">{item.icon}</span>
//             </div>
//           </div>
//         );
//       })}
//     </nav>
//   );

//   // ── Full menu with labels + sub-items ─────────────────────────────────────
//   const renderFullMenu = (activeLabel: string | null, setActiveLabel: (v: string | null) => void) => (
//     <nav className="flex-1 overflow-y-auto px-3 space-y-1 sidebar-nav mt-3" style={{ scrollbarWidth: "thin" }}>
//       {filteredMenu.map((item) => {
//         const visibleChildren = item.children?.filter((child) => hasPermission(child.permission));
//         const isOpen = activeLabel === item.label;
//         const hasActiveChild = item.children?.some((child) =>
//           location.pathname.startsWith(child.path)
//         );

//         return (
//           <div key={item.label}>
//             {item.path ? (
//               <NavLink
//                 to={item.path}
//                 className={({ isActive }) =>
//                   `flex items-center gap-4 px-3 py-3 rounded-lg cursor-pointer transition-colors
//                   ${darkLight ? "hover:bg-gray-700" : "hover:bg-blue-100"}
//                   ${isActive ? (darkLight ? "bg-gray-700 text-blue-300" : "bg-blue-100 text-blue-600") : ""}`
//                 }
//               >
//                 <span className="text-2xl">{item.icon}</span>
//                 <span className="text-base font-medium">{item.label}</span>
//               </NavLink>
//             ) : (
//               <div
//                 onClick={() => setActiveLabel(isOpen ? null : item.label)}
//                 className={`flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer transition-colors
//                   ${darkLight ? "hover:bg-gray-700" : "hover:bg-blue-100"}
//                   ${hasActiveChild ? (darkLight ? "text-blue-300" : "text-blue-600") : ""}`}
//               >
//                 <div className="flex items-center gap-4">
//                   <span className="text-2xl">{item.icon}</span>
//                   <span className="text-base font-medium">{item.label}</span>
//                 </div>
//                 <span className="text-lg">
//                   {isOpen ? <FiChevronDown /> : <FiChevronRight />}
//                 </span>
//               </div>
//             )}

//             {item.children && isOpen && (
//               <div className={`ml-6 mt-1 space-y-1 text-sm ${darkLight ? "text-gray-300" : "text-gray-600"}`}>
//                 {visibleChildren?.map((child) => (
//                   <NavLink
//                     key={child.name}
//                     to={child.path}
//                     className={({ isActive }) =>
//                       `flex items-center gap-3 pl-4 py-2 rounded-md transition-all cursor-pointer
//                       ${darkLight ? "hover:bg-gray-600" : "hover:bg-blue-100"}
//                       ${isActive ? (darkLight ? "bg-gray-700 text-blue-300" : "bg-blue-50 text-blue-600") : ""}`
//                     }
//                   >
//                     <span className="text-lg">{child.icon}</span>
//                     <span>{child.name}</span>
//                   </NavLink>
//                 ))}
//               </div>
//             )}
//           </div>
//         );
//       })}
//     </nav>
//   );

//   // ── Desktop: icon-only strip ──────────────────────────────────────────────
//   const renderDesktopIconOnly = () => (
//     <nav className="flex-1 overflow-y-auto px-2 space-y-2 sidebar-nav mt-3" style={{ scrollbarWidth: "thin" }}>
//       {filteredMenu.map((item) => {
//         const hasActiveChild = item.children?.some((child) =>
//           location.pathname.startsWith(child.path)
//         );
//         return (
//           <div key={item.label}>
//             {item.path ? (
//               <NavLink
//                 to={item.path}
//                 onClick={(e) => { e.preventDefault(); setMenuOpen(true); }}
//                 className={({ isActive }) =>
//                   `flex items-center justify-center px-3 py-3 rounded-lg cursor-pointer transition-colors
//                   ${darkLight ? "hover:bg-gray-700" : "hover:bg-blue-100"}
//                   ${isActive ? (darkLight ? "bg-gray-700 text-blue-300" : "bg-blue-100 text-blue-600") : ""}`
//                 }
//               >
//                 <span className="text-2xl">{item.icon}</span>
//               </NavLink>
//             ) : (
//               <div
//                 onClick={() => { setActive(item.label); setMenuOpen(true); }}
//                 className={`flex items-center justify-center px-3 py-3 rounded-lg cursor-pointer transition-colors
//                   ${darkLight ? "hover:bg-gray-700" : "hover:bg-blue-100"}
//                   ${hasActiveChild ? (darkLight ? "text-blue-300" : "text-blue-600") : ""}`}
//               >
//                 <span className="text-2xl">{item.icon}</span>
//               </div>
//             )}
//           </div>
//         );
//       })}
//     </nav>
//   );

//   return (
//     <>
//       <style>{scrollbarStyles}</style>
//       <Header />

//       <div className={`fixed inset-0 top-[65px] ${darkLight ? "bg-gray-900" : "bg-white"}`}>
//         <div className={`flex h-full transition-colors duration-500 ${darkLight ? "bg-gray-900 text-white" : "bg-white text-gray-800"}`}>

//           {/* ══════════════ MOBILE ══════════════ */}

//           {/* Narrow icon strip — header button shows/hides */}
//           {sidebarVisible && (
//             <div className={`md:hidden flex-shrink-0 w-16 h-full flex flex-col z-20 shadow-lg ${darkLight ? "bg-gray-800" : "bg-white"}`}>
//               {renderMobileIconStrip()}
//             </div>
//           )}

//           {/* Full-screen overlay — opens on any icon click */}
//           {menuOpen && (
//             <div className="md:hidden">
//               <div
//                 className="fixed inset-0 top-[65px] bg-black/50 z-30"
//                 onClick={() => setMenuOpen(false)}
//               />
//               <div className={`fixed inset-0 top-[65px] z-40 flex flex-col ${darkLight ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}>
//                 {renderFullMenu(active, setActive)}
//               </div>
//             </div>
//           )}

//           {/* ══════════════ DESKTOP ══════════════ */}

//           <div className={`
//             hidden md:flex flex-col flex-shrink-0
//             transition-all duration-500 ease-in-out
//             ${!sidebarVisible ? "w-0 overflow-hidden opacity-0" : menuOpen ? "w-64 opacity-100" : "w-20 opacity-100"}
//             ${darkLight ? "bg-gray-800" : "bg-white"} shadow-lg h-full
//           `}>
//             {menuOpen ? renderFullMenu(active, setActive) : renderDesktopIconOnly()}
//           </div>

//           {/* MAIN */}
//           <div className="flex-1 overflow-y-auto p-4">
//             <Outlet />
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Index;




import { useState, useEffect } from "react";
import { useGlobleContextDarklight, useSidebar } from "../../AllContext/context.tsx";
import Header from "../../component/header/Header.tsx";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import menuItems from "../../Contants/Menu-Data.tsx";

const Index = () => {
  const { darkLight } = useGlobleContextDarklight();
  const { sidebarVisible, setSidebarVisible } = useSidebar();
  const [active, setActive] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollbarStyles = `
    .sidebar-nav::-webkit-scrollbar { width: 5px; }
    .sidebar-nav::-webkit-scrollbar-thumb { background-color: transparent; border-radius: 10px; }
    .sidebar-nav:hover::-webkit-scrollbar-thumb { background-color: ${darkLight ? "#4B5563" : "#CBD5E1"}; }
    .sidebar-nav::-webkit-scrollbar-thumb:hover { background-color: ${darkLight ? "#6B7280" : "#94A3B8"}; }
  `;

  useEffect(() => {
    const storedData = localStorage.getItem("CurrentUserLibrary");
    if (!storedData) { navigate("/login"); return; }
    try {
      const parsedData = JSON.parse(storedData);
      setUserPermissions(parsedData.permissions || []);
    } catch (error) { console.error("Failed to parse CurrentUserLibrary", error); }
  }, [navigate]);

  // On route change: track active parent, close sidebar on mobile
  useEffect(() => {
    const activeParent = menuItems.find((item) =>
      item.children?.some((child) => location.pathname.startsWith(child.path))
    );
    setActive(activeParent ? activeParent.label : null);
    // ✅ Mobile: auto-close after navigation
    if (window.innerWidth < 768) setSidebarVisible(false);
  }, [location.pathname]);

  const hasPermission = (permKey?: string) => {
    if (!permKey) return true;
    return userPermissions.includes(permKey);
  };

  const filteredMenu = menuItems.filter((item) => {
    if (item.children) return item.children.some((child) => hasPermission(child.permission));
    return hasPermission(item?.permission);
  });

  // ── Full menu — used everywhere (mobile overlay + desktop sidebar) ─────────
  const renderMenu = () => (
    <nav className="flex-1 overflow-y-auto px-3 space-y-1 sidebar-nav mt-3" style={{ scrollbarWidth: "thin" }}>
      {filteredMenu.map((item) => {
        const visibleChildren = item.children?.filter((child) => hasPermission(child.permission));
        const isOpen = active === item.label;
        const hasActiveChild = item.children?.some((child) =>
          location.pathname.startsWith(child.path)
        );

        return (
          <div key={item.label}>
            {item.path ? (
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-3 py-3 rounded-lg cursor-pointer transition-colors
                  ${darkLight ? "hover:bg-gray-700" : "hover:bg-blue-100"}
                  ${isActive ? (darkLight ? "bg-gray-700 text-blue-300" : "bg-blue-100 text-blue-600") : ""}`
                }
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-base font-medium">{item.label}</span>
              </NavLink>
            ) : (
              <div
                onClick={() => setActive(isOpen ? null : item.label)}
                className={`flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer transition-colors
                  ${darkLight ? "hover:bg-gray-700" : "hover:bg-blue-100"}
                  ${hasActiveChild ? (darkLight ? "text-blue-300" : "text-blue-600") : ""}`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-base font-medium">{item.label}</span>
                </div>
                <span className="text-lg">
                  {isOpen ? <FiChevronDown /> : <FiChevronRight />}
                </span>
              </div>
            )}

            {item.children && isOpen && (
              <div className={`ml-6 mt-1 space-y-1 text-sm ${darkLight ? "text-gray-300" : "text-gray-600"}`}>
                {visibleChildren?.map((child) => (
                  <NavLink
                    key={child.name}
                    to={child.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 pl-4 py-2 rounded-md transition-all cursor-pointer
                      ${darkLight ? "hover:bg-gray-600" : "hover:bg-blue-100"}
                      ${isActive ? (darkLight ? "bg-gray-700 text-blue-300" : "bg-blue-50 text-blue-600") : ""}`
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
  );

  return (
    <>
      <style>{scrollbarStyles}</style>
      <Header />

      <div className={`fixed inset-0 top-[65px] ${darkLight ? "bg-gray-900" : "bg-white"}`}>
        <div className={`flex h-full transition-colors duration-500 ${darkLight ? "bg-gray-900 text-white" : "bg-white text-gray-800"}`}>

          {/* ══════════════ MOBILE — full-screen overlay ══════════════ */}
          {sidebarVisible && (
            <div className="md:hidden">
              {/* Backdrop */}
              <div
                className="fixed inset-0 top-[65px] bg-black/50 z-30"
                onClick={() => setSidebarVisible(false)}
              />
              {/* Full-screen menu */}
              <div className={`fixed inset-0 top-[65px] z-40 flex flex-col ${darkLight ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}>
                {renderMenu()}
              </div>
            </div>
          )}

          {/* ══════════════ DESKTOP — sidebar alongside content ══════════════ */}
          <div className={`
            hidden md:flex flex-col flex-shrink-0
            transition-all duration-500 ease-in-out
            ${sidebarVisible ? "w-64 opacity-100" : "w-0 overflow-hidden opacity-0"}
            ${darkLight ? "bg-gray-800" : "bg-white"} shadow-lg h-full
          `}>
            {renderMenu()}
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1 overflow-y-auto p-4">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;