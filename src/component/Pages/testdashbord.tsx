import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
    FiMenu, FiX, FiBarChart2, FiBookOpen, FiClipboard, FiChevronDown, FiChevronUp,
} from "react-icons/fi";
import { FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";
import { useGlobleContextDarklight } from "../../AllContext/context";

const data = [
    { name: "Jan", students: 40 },
    { name: "Feb", students: 30 },
    { name: "Mar", students: 20 },
    { name: "Apr", students: 27 },
    { name: "May", students: 18 },
    { name: "Jun", students: 23 },
];

const menuItems = [
    { label: "Dashboard", icon: <FiBarChart2 /> },
    { label: "Students", icon: <FaUserGraduate />, children: ["Student List", "Add Student"] },
    { label: "Teachers", icon: <FaChalkboardTeacher />, children: ["All Teachers", "Add Teacher"] },
    { label: "Classes", icon: <FiBookOpen />, children: ["Class List", "Create Class"] },
    { label: "Reports", icon: <FiClipboard />, children: ["Attendance Report", "Grade Report"] },
];

export default function Dashboard() {
    const { darkLight } = useGlobleContextDarklight();
    const [menuOpen, setMenuOpen] = useState(true);
    const [active, setActive] = useState<string | null>(null);

    const handleToggle = (label: string) => {
        setActive((prev) => (prev === label ? null : label));
    };

    return (
        <div className={`flex h-screen transition-colors duration-500 ${darkLight ? "bg-gray-900 text-white" : "bg-white text-gray-800"}`}>
            <div className={`transition-all duration-500 ease-in-out ${menuOpen ? "w-64" : "w-20"} ${darkLight ? "bg-gray-800" : "bg-white"} shadow-lg h-full flex flex-col`}>
                <div className="flex items-center justify-between px-4 py-4">
                    <h2 className={`text-xl font-bold whitespace-nowrap transition-all duration-300 ${menuOpen ? "opacity-100" : "opacity-0"}`}>
                        {menuOpen && "School Admin"}
                    </h2>
                    <button onClick={() => setMenuOpen(!menuOpen)} className="text-xl rounded hover:bg-gray-700 p-2">
                        {menuOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>
                <nav className="flex-1 overflow-y-auto px-2 space-y-2">
                    {menuItems.map(({ label, icon, children }) => (
                        <div key={label}>
                            <div
                                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer ${darkLight ? "hover:bg-gray-700" : "hover:bg-blue-100"}`}
                                onClick={() => handleToggle(label)}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-xl">{icon}</span>
                                    {menuOpen && <span className="text-base font-medium">{label}</span>}
                                </div>
                                {children && menuOpen && (
                                    <span className="text-lg">{active === label ? <FiChevronUp /> : <FiChevronDown />}</span>
                                )}
                            </div>
                            {children && active === label && menuOpen && (
                                <div className={`ml-10 mt-1 space-y-1 text-sm ${darkLight ? "text-gray-300" : "text-gray-600"}`}>
                                    {children.map((child) => (
                                        <div
                                            key={child}
                                            className={`hover:underline cursor-pointer pl-1 py-1 transition-all ${darkLight ? "hover:text-blue-300" : "hover:text-blue-600"}`}
                                        >
                                            {child}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </div>

            <div className="flex-1 flex flex-col">
                <div className={`shadow px-4 py-3 flex items-center justify-between ${darkLight ? "bg-gray-800" : "bg-white"}`}>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className={`text-2xl p-2 rounded ${darkLight ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
                    >
                        {menuOpen ? <FiX /> : <FiMenu />}
                    </button>
                    <h1 className="text-2xl font-bold">School Dashboard</h1>
                    <div className="opacity-70">Welcome, Admin</div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className={`rounded-2xl shadow p-4 hover:scale-105 transition-transform cursor-pointer ${darkLight ? "bg-orange-500" : "bg-rose-100"}`}>
                        <h2  className={`text-xl font-semibold mb-2 ${darkLight ? "text-rose-200" : "text-rose-800"}`}>
                            <NavLink to="/users">Total Users</NavLink>
                        </h2>
                        <p className={`text-3xl font-bold ${darkLight ? "text-rose-100" : "text-rose-800"}`}>1,250</p>
                    </div>
                    <div className={`rounded-2xl shadow p-4 hover:scale-105 transition-transform cursor-pointer ${darkLight ? "bg-rose-900" : "bg-rose-100"}`}>
                        <h2 className={`text-xl font-semibold mb-2 ${darkLight ? "text-rose-200" : "text-rose-800"}`}>Total Revenue</h2>
                        <p className={`text-3xl font-bold ${darkLight ? "text-rose-100" : "text-rose-800"}`}>1,250</p>
                    </div>
                    <div className={`rounded-2xl shadow p-4 hover:scale-105 transition-transform cursor-pointer ${darkLight ? "bg-sky-900" : "bg-sky-100"}`}>
                        <h2 className={`text-xl font-semibold mb-2 ${darkLight ? "text-sky-200" : "text-sky-800"}`}>Total Teachers</h2>
                        <p className={`text-3xl font-bold ${darkLight ? "text-sky-100" : "text-sky-800"}`}>78</p>
                    </div>
                    <div className={`rounded-2xl shadow p-4 hover:scale-105 transition-transform cursor-pointer ${darkLight ? "bg-amber-900" : "bg-amber-100"}`}>
                        <h2 className={`text-xl font-semibold mb-2 ${darkLight ? "text-amber-200" : "text-amber-800"}`}>Classes</h2>
                        <p className={`text-3xl font-bold ${darkLight ? "text-amber-100" : "text-amber-800"}`}>32</p>
                    </div>
                    <div className={`rounded-2xl shadow p-4 hover:scale-105 transition-transform cursor-pointer ${darkLight ? "bg-indigo-900" : "bg-indigo-100"}`}>
                        <h2 className={`text-xl font-semibold mb-2 ${darkLight ? "text-indigo-200" : "text-indigo-800"}`}>Reports</h2>
                        <p className={`text-3xl font-bold ${darkLight ? "text-indigo-100" : "text-indigo-800"}`}>15</p>
                    </div>
                    <div className={`rounded-2xl shadow p-6 col-span-1 md:col-span-2 ${darkLight ? "bg-gray-800" : "bg-white"}`}>
                        <h2 className={`text-xl font-semibold mb-4 ${darkLight ? "text-white" : "text-gray-900"}`}>Monthly Enrollment</h2>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke={darkLight ? "#444" : "#ccc"} />
                                <XAxis dataKey="name" stroke={darkLight ? "#ccc" : "#333"} />
                                <YAxis stroke={darkLight ? "#ccc" : "#333"} />
                                <Tooltip contentStyle={{ backgroundColor: darkLight ? "#333" : "#fff", borderColor: darkLight ? "#666" : "#ccc", color: darkLight ? "#fff" : "#000" }} />
                                <Bar dataKey="students" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
