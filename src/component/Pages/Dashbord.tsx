import { useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { FiMenu, FiX } from "react-icons/fi";
import { useGlobleContextDarklight } from "../../AllContext/context";

const data = [
    { name: "Jan", students: 40 },
    { name: "Feb", students: 30 },
    { name: "Mar", students: 20 },
    { name: "Apr", students: 27 },
    { name: "May", students: 18 },
    { name: "Jun", students: 23 },
];

export default function Dashboard() {
    const { darkLight } = useGlobleContextDarklight();
    const [menuOpen, setMenuOpen] = useState(true);
    const isDark = darkLight;

    return (
        <div className={`flex h-screen transition-colors duration-500 w-[100%] ${isDark ? "bg-gray-900 text-white" : "bg-white text-gray-800"}`}>
            {/* Sidebar */}
            <div className={`transition-all duration-[500ms] ease-in-out overflow-hidden
        ${menuOpen ? "w-64 opacity-100" : "w-0 opacity-0"}
        ${isDark ? "bg-gray-800" : "bg-white"} shadow-lg`}>
                <div className="h-full p-4">
                    <h2 className="text-xl font-bold mb-6">Menu</h2>
                    <ul className="space-y-3">
                        <li className="hover:text-blue-500 cursor-pointer">Dashboard</li>
                        <li className="hover:text-blue-500 cursor-pointer">Students</li>
                        <li className="hover:text-blue-500 cursor-pointer">Teachers</li>
                        <li className="hover:text-blue-500 cursor-pointer">Classes</li>
                        <li className="hover:text-blue-500 cursor-pointer">Reports</li>
                    </ul>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className={`shadow px-4 py-3 flex items-center justify-between ${isDark ? "bg-gray-800" : "bg-white"}`}>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="text-2xl p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                        {menuOpen ? <FiX /> : <FiMenu />}
                    </button>
                    <h1 className="text-2xl font-bold">School Dashboard</h1>
                    <div className="opacity-70">Welcome, Admin</div>
                </div>

                {/* Cards and Chart */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Total Students Card */}
                    <div className="bg-rose-100 dark:bg-rose-900 rounded-2xl shadow p-4 transform transition duration-300 hover:scale-105 hover:bg-rose-200 dark:hover:bg-rose-800 cursor-pointer">
                        <h2 className="text-xl font-semibold text-rose-800 dark:text-rose-200 mb-2"></h2>
                        <p className="text-3xl font-bold text-rose-800 dark:text-rose-100">1,250</p>
                    </div>

                    {/* Total Teachers Card */}
                    <div className="bg-sky-100 dark:bg-sky-900 rounded-2xl shadow p-4 transform transition duration-300 hover:scale-105 hover:bg-sky-200 dark:hover:bg-sky-800 cursor-pointer">
                        <h2 className="text-xl font-semibold text-sky-800 dark:text-sky-200 mb-2">Total Teachers</h2>
                        <p className="text-3xl font-bold text-sky-800 dark:text-sky-100">78</p>
                    </div>

                    {/* Classes Card */}
                    <div className="bg-amber-100 dark:bg-amber-900 rounded-2xl shadow p-4 transform transition duration-300 hover:scale-105 hover:bg-amber-200 dark:hover:bg-amber-800 cursor-pointer">
                        <h2 className="text-xl font-semibold text-amber-800 dark:text-amber-200 mb-2">Classes</h2>
                        <p className="text-3xl font-bold text-amber-800 dark:text-amber-100">32</p>
                    </div>
                    {/* Classes Card */}
                    <div className="bg-amber-100 dark:bg-amber-900 rounded-2xl shadow p-4 transform transition duration-300 hover:scale-105 hover:bg-amber-200 dark:hover:bg-red-800 cursor-pointer">
                        <h2 className="text-xl font-semibold text-amber-800 dark:text-orange-400 mb-2">Report</h2>
                        <p className="text-3xl font-bold text-amber-800 dark:text-amber-100">32</p>
                    </div>

                    {/* Monthly Chart */}
                    <div className={`rounded-2xl shadow p-6 col-span-1 md:col-span-2 ${isDark ? "bg-gray-800" : "bg-white"}`}>
                        <h2 className="text-xl font-semibold mb-4">Monthly Enrollment</h2>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#444" : "#ccc"} />
                                <XAxis dataKey="name" stroke={isDark ? "#ccc" : "#333"} />
                                <YAxis stroke={isDark ? "#ccc" : "#333"} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? "#333" : "#fff",
                                        borderColor: isDark ? "#666" : "#ccc",
                                        color: isDark ? "#fff" : "#000",
                                    }}
                                />
                                <Bar dataKey="students" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
