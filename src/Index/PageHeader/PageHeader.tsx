import { useState } from "react";
import { useGlobleContextDarklight } from "../../AllContext/context.tsx";
import Header from "../../component/header/Header.tsx"
import { NavLink, Outlet } from "react-router-dom";
import { FiChevronDown, FiChevronUp, FiMenu, FiX } from "react-icons/fi";
import menuItems from "../../Contants/Menu-Data.tsx";

const index = () => {

    const { darkLight } = useGlobleContextDarklight();
    const [menuOpen, setMenuOpen] = useState(true);
    const [active, setActive] = useState<string | null>(null);

    const handleToggle = (label: string) => {
        setActive((prev) => (prev === label ? null : label));
    };

    return (
        <>
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
                        <Outlet />
                    </div>
                </div>
            </div>
        </>
    )
}

export default index
