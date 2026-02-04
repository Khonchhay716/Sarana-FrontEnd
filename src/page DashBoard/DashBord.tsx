// import { NavLink } from 'react-router-dom';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
// import { useGlobleContextDarklight } from '../AllContext/context';
// import useFetchDataApi from '../CustomHook/FetchDataApi';
// import { BiBookReader, BiBook } from "react-icons/bi";
// import { FaUsers, FaBookOpen, FaChartLine } from "react-icons/fa";
// import { MdLibraryBooks, MdPendingActions } from "react-icons/md";
// import { GiReturnArrow } from "react-icons/gi";

// const Dashboard = () => {
//     const { darkLight } = useGlobleContextDarklight();
//     const { data: borrowData } = useFetchDataApi("https://localhost:7095/api/Borrows");
//     const { data: totalBooks } = useFetchDataApi("https://localhost:7095/api/Books");
//     const { data: totalMembers } = useFetchDataApi("https://localhost:7095/api/Members");
//     const { data: categories } = useFetchDataApi("https://localhost:7095/api/Categories");

//     // Monthly book borrowing statistics
//     const monthlyData = [
//         { name: "Jan", borrowed: 245, returned: 230 },
//         { name: "Feb", borrowed: 198, returned: 185 },
//         { name: "Mar", borrowed: 312, returned: 295 },
//         { name: "Apr", borrowed: 278, returned: 260 },
//         { name: "May", borrowed: 401, returned: 388 },
//         { name: "Jun", borrowed: 356, returned: 340 },
//         { name: "Jul", borrowed: 289, returned: 275 },
//         { name: "Aug", borrowed: 0, returned: 0 },
//         { name: "Sep", borrowed: 0, returned: 0 },
//         { name: "Oct", borrowed: 0, returned: 0 },
//         { name: "Nov", borrowed: 0, returned: 0 },
//         { name: "Dec", borrowed: 0, returned: 0 },
//     ];

//     interface MetricCardProps {
//         title: string;
//         value: string | number;
//         icon: React.ReactNode;
//         color: string;
//         bgColor: string;
//         description?: string;
//         trend?: string;
//         link?: string;
//     }

//     const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color, bgColor, description, trend, link }) => {
//         const { darkLight } = useGlobleContextDarklight();

//         const CardContent = (
//             <div className={`p-6 rounded-2xl shadow-xl flex-1 transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 ${darkLight
//                     ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-purple-500'
//                     : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-indigo-400'
//                 }`}>
//                 <div className="flex items-start justify-between mb-4">
//                     <div className="flex-1">
//                         <p className={`text-sm font-semibold uppercase tracking-wide mb-2 ${darkLight ? 'text-gray-400' : 'text-gray-600'
//                             }`}>
//                             {title}
//                         </p>
//                         <h3 className={`text-4xl font-extrabold ${color}`}>{value}</h3>
//                         {trend && (
//                             <p className="text-sm text-green-500 font-medium mt-1 flex items-center gap-1">
//                                 <FaChartLine /> {trend}
//                             </p>
//                         )}
//                     </div>
//                     <div className={`${bgColor} p-4 rounded-xl shadow-lg`}>
//                         <div className="text-3xl text-white">{icon}</div>
//                     </div>
//                 </div>
//                 {description && (
//                     <p className={`text-sm ${darkLight ? 'text-gray-400' : 'text-gray-600'}`}>
//                         {description}
//                     </p>
//                 )}
//             </div>
//         );

//         return link ? <NavLink to={link}>{CardContent}</NavLink> : CardContent;
//     };

//     return (
//         <div className="flex-1 flex flex-col px-4">
//             {/* Header Banner */}
//             <div className={`shadow-lg px-6 rounded-xl py-5 flex items-center justify-between border-b-2 ${darkLight
//                     ? "bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 border-purple-700"
//                     : "bg-purple-600"
//                 }`}>
//                 <div className='flex items-center'>
//                     <BiBookReader className='w-[50px] h-[50px] text-white drop-shadow-lg mr-3' />
//                     <div>
//                         <h1 className="text-3xl font-extrabold text-white drop-shadow-md">Library Dashboard</h1>
//                         <p className="text-sm text-blue-100 mt-1">Manage your library efficiently</p>
//                     </div>
//                 </div>
//                 <div className="text-sm text-white bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30">
//                     Welcome, <span className="font-bold">Librarian</span>
//                 </div>
//             </div>

//             {/* Main Stats Grid */}
//             <div className="py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 <MetricCard
//                     title="Total Books"
//                     value={totalBooks?.length || 12547}
//                     icon={<MdLibraryBooks />}
//                     color="text-blue-500"
//                     bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
//                     description="Books in collection"
//                     trend="+12% this month"
//                     link="/books"
//                 />

//                 <MetricCard
//                     title="Active Members"
//                     value={totalMembers?.length || 1834}
//                     icon={<FaUsers />}
//                     color="text-green-500"
//                     bgColor="bg-gradient-to-br from-green-500 to-emerald-600"
//                     description="Registered members"
//                     trend="+8% this month"
//                     link="/members"
//                 />

//                 <MetricCard
//                     title="Books Borrowed"
//                     value={borrowData?.length || 456}
//                     icon={<FaBookOpen />}
//                     color="text-purple-500"
//                     bgColor="bg-gradient-to-br from-purple-500 to-purple-600"
//                     description="Currently borrowed"
//                     trend="+15% this week"
//                     link="/borrows"
//                 />

//                 <MetricCard
//                     title="Categories"
//                     value={categories?.length || 42}
//                     icon={<BiBook />}
//                     color="text-orange-500"
//                     bgColor="bg-gradient-to-br from-orange-500 to-orange-600"
//                     description="Book categories"
//                     link="/categories"
//                 />

//                 <MetricCard
//                     title="Pending Returns"
//                     value={78}
//                     icon={<MdPendingActions />}
//                     color="text-red-500"
//                     bgColor="bg-gradient-to-br from-red-500 to-red-600"
//                     description="Overdue books"
//                     trend="12 due today"
//                     link="/returns"
//                 />

//                 <NavLink to="/borrow">
//                     <div className={`rounded-2xl shadow-xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-center border-2 ${darkLight
//                             ? "bg-gradient-to-br from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 border-purple-500"
//                             : "bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 border-indigo-400"
//                         }`}>
//                         <GiReturnArrow className="text-7xl text-white mb-3 animate-bounce" />
//                         <h2 className="text-2xl font-bold text-white text-center">Borrow / Return Book</h2>
//                         <p className="text-white/80 text-sm mt-2">Quick action</p>
//                     </div>
//                 </NavLink>
//             </div>

//             {/* Charts Section */}
//             <div className=" pb-6 grid grid-cols-1 lg:grid-cols-2 gap-6 " style={{marginBottom:'35px'}}>
//                 {/* Bar Chart */}
//                 <div className={`rounded-2xl shadow-xl p-6 transition-all border-2 ${darkLight
//                         ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
//                         : "bg-white border-gray-200"
//                     }`}>
//                     <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkLight ? "text-white" : "text-gray-900"
//                         }`}>
//                         <FaChartLine className="text-blue-500" />
//                         Monthly Borrowing Statistics
//                     </h2>
//                     <ResponsiveContainer width="100%" height={250}>
//                         <BarChart data={monthlyData}>
//                             <CartesianGrid strokeDasharray="3 3" stroke={darkLight ? "#374151" : "#e5e7eb"} />
//                             <XAxis dataKey="name" stroke={darkLight ? "#9ca3af" : "#374151"} />
//                             <YAxis stroke={darkLight ? "#9ca3af" : "#374151"} />
//                             <Tooltip
//                                 contentStyle={{
//                                     backgroundColor: darkLight ? "#1f2937" : "#fff",
//                                     borderColor: darkLight ? "#4b5563" : "#e5e7eb",
//                                     borderRadius: "10px"
//                                 }}
//                             />
//                             <Bar dataKey="borrowed" fill="#3B82F6" radius={[8, 8, 0, 0]} />
//                         </BarChart>
//                     </ResponsiveContainer>
//                 </div>

//                 {/* Line Chart */}
//                 <div className={`rounded-2xl shadow-xl p-6 transition-all border-2 ${darkLight
//                         ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
//                         : "bg-white border-gray-200"
//                     }`}>
//                     <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkLight ? "text-white" : "text-gray-900"
//                         }`}>
//                         <FaChartLine className="text-green-500" />
//                         Return Trends
//                     </h2>
//                     <ResponsiveContainer width="100%" height={250}>
//                         <LineChart data={monthlyData}>
//                             <CartesianGrid strokeDasharray="3 3" stroke={darkLight ? "#374151" : "#e5e7eb"} />
//                             <XAxis dataKey="name" stroke={darkLight ? "#9ca3af" : "#374151"} />
//                             <YAxis stroke={darkLight ? "#9ca3af" : "#374151"} />
//                             <Tooltip
//                                 contentStyle={{
//                                     backgroundColor: darkLight ? "#1f2937" : "#fff",
//                                     borderColor: darkLight ? "#4b5563" : "#e5e7eb",
//                                     borderRadius: "10px"
//                                 }}
//                             />
//                             <Line type="monotone" dataKey="returned" stroke="#10B981" strokeWidth={3} dot={{ r: 5 }} />
//                         </LineChart>
//                     </ResponsiveContainer>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Dashboard;




// QUICK START - Copy this entire file to replace your Dashboard.tsx
// This is the simplest version - everything in one file!

import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useGlobleContextDarklight } from '../AllContext/context';
import { BiBookReader, BiBook } from "react-icons/bi";
import { FaUsers, FaBookOpen, FaChartLine } from "react-icons/fa";
import { MdLibraryBooks, MdPendingActions } from "react-icons/md";
import { GiReturnArrow } from "react-icons/gi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { AxiosApi } from '../component/Axios/Axios';

const Dashboard = () => {
    const { darkLight } = useGlobleContextDarklight();
    const [dashboard, setDashboard] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch dashboard data on mount
    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(true);
                const response = await AxiosApi.get('/Dashboard');
                setDashboard(response.data.data || response.data);
            } catch (err: any) {
                setError(err?.message || "Failed to load dashboard");
                console.error("Dashboard error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    // Metric Card Component
    const MetricCard = ({ title, value, icon, color, bgColor, description, trend, link, isLoading }: any) => {
        const formatTrend = (t: any) => {
            if (!t) return null;
            if (typeof t === 'number') return `${t >= 0 ? '+' : ''}${t.toFixed(1)}%`;
            return t;
        };

        const CardContent = (
            <div className={`p-6 rounded-2xl shadow-xl flex-1 transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 ${darkLight
                    ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-purple-500'
                    : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-indigo-400'
                }`}>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <p className={`text-sm font-semibold uppercase tracking-wide mb-2 ${darkLight ? 'text-gray-400' : 'text-gray-600'
                            }`}>{title}</p>

                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <AiOutlineLoading3Quarters className="animate-spin text-2xl text-gray-400" />
                            </div>
                        ) : (
                            <>
                                <h3 className={`text-4xl font-extrabold ${color}`}>
                                    {typeof value === 'number' ? value.toLocaleString() : value}
                                </h3>
                                {trend && (
                                    <p className={`text-sm font-medium mt-1 flex items-center gap-1 ${typeof trend === 'number' ? (trend >= 0 ? 'text-green-500' : 'text-red-500') : 'text-green-500'
                                        }`}>
                                        <FaChartLine /> {formatTrend(trend)}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                    <div className={`${bgColor} p-4 rounded-xl shadow-lg`}>
                        <div className="text-3xl text-white">{icon}</div>
                    </div>
                </div>
                {description && (
                    <p className={`text-sm ${darkLight ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
                )}
            </div>
        );

        return link ? <NavLink to={link}>{CardContent}</NavLink> : CardContent;
    };

    // Transform data for charts
    const monthlyData = dashboard?.monthlyBorrowingStatistics?.map((s: any) => ({
        name: s.monthName,
        borrowed: s.count
    })) || [];

    const returnData = dashboard?.returnTrends?.map((t: any) => ({
        name: t.dayLabel,
        returned: t.count
    })) || [];

    // Error state
    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <h2 className={`text-2xl font-bold mb-4 ${darkLight ? 'text-white' : 'text-gray-900'}`}>
                        Error Loading Dashboard
                    </h2>
                    <p className={`mb-4 ${darkLight ? 'text-gray-400' : 'text-gray-600'}`}>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col px-4">
            {/* Header */}
            <div className={`shadow-lg px-6 rounded-xl py-5 flex items-center justify-between border-b-2 ${darkLight
                    ? "bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 border-purple-700"
                    : "bg-purple-600"
                }`}>
                <div className='flex items-center'>
                    <BiBookReader className='w-[50px] h-[50px] text-white drop-shadow-lg mr-3' />
                    <div>
                        <h1 className="text-3xl font-extrabold text-white drop-shadow-md">Library Dashboard</h1>
                        <p className="text-sm text-blue-100 mt-1">Manage your library efficiently</p>
                    </div>
                </div>
                <div className="text-sm text-white bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30">
                    Welcome, <span className="font-bold">Librarian</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetricCard
                    title="Total Books"
                    value={dashboard?.totalBooks || 0}
                    icon={<MdLibraryBooks />}
                    color="text-blue-500"
                    bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
                    description="Books in collection"
                    trend={dashboard?.totalBooksPercentageChange}
                    link="/book"
                    isLoading={loading}
                />

                <MetricCard
                    title="Active Members"
                    value={dashboard?.activeMembers || 0}
                    icon={<FaUsers />}
                    color="text-green-500"
                    bgColor="bg-gradient-to-br from-green-500 to-emerald-600"
                    description="Registered members"
                    trend={dashboard?.activeMembersPercentageChange}
                    link="/librarymember"
                    isLoading={loading}
                />

                <MetricCard
                    title="Books Borrowed"
                    value={dashboard?.booksBorrowed || 0}
                    icon={<FaBookOpen />}
                    color="text-purple-500"
                    bgColor="bg-gradient-to-br from-purple-500 to-purple-600"
                    description="Currently borrowed"
                    trend={dashboard?.booksBorrowedPercentageChange}
                    link="/myissuebook"
                    isLoading={loading}
                />

                <MetricCard
                    title="Categories"
                    value={dashboard?.totalCategories || 0}
                    icon={<BiBook />}
                    color="text-orange-500"
                    bgColor="bg-gradient-to-br from-orange-500 to-orange-600"
                    description="Book categories"
                    link="/category"
                    isLoading={loading}
                />

                <MetricCard
                    title="Pending Returns"
                    value={dashboard?.pendingReturns || 0}
                    icon={<MdPendingActions />}
                    color="text-red-500"
                    bgColor="bg-gradient-to-br from-red-500 to-red-600"
                    description="Overdue books"
                    trend={dashboard?.dueToday > 0 ? `${dashboard.dueToday} due today` : undefined}
                    // link="/returns"
                    isLoading={loading}
                />

                {/* <NavLink to="/borrow">
                    <div className={`rounded-2xl shadow-xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-center border-2 ${darkLight
                            ? "bg-gradient-to-br from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 border-purple-500"
                            : "bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 border-indigo-400"
                        }`}>
                        <GiReturnArrow className="text-7xl text-white mb-3 animate-bounce" />
                        <h2 className="text-2xl font-bold text-white text-center">Borrow / Return Book</h2>
                        <p className="text-white/80 text-sm mt-2">Quick action</p>
                    </div>
                </NavLink> */}
            </div>

            {/* Charts */}
            <div className="pb-6 grid grid-cols-1 lg:grid-cols-1 gap-6" style={{ marginBottom: '35px' }}>
                {/* Bar Chart */}
                <div className={`rounded-2xl shadow-xl p-6 transition-all border-2 ${darkLight ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700" : "bg-white border-gray-200"
                    }`}>
                    <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkLight ? "text-white" : "text-gray-900"}`}>
                        <FaChartLine className="text-blue-500" />
                        Monthly Borrowing Statistics
                    </h2>
                    {loading ? (
                        <div className="h-[250px] flex items-center justify-center">
                            <AiOutlineLoading3Quarters className="animate-spin text-4xl text-gray-400" />
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={darkLight ? "#374151" : "#e5e7eb"} />
                                <XAxis dataKey="name" stroke={darkLight ? "#9ca3af" : "#374151"} />
                                <YAxis stroke={darkLight ? "#9ca3af" : "#374151"} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: darkLight ? "#1f2937" : "#fff",
                                        borderColor: darkLight ? "#4b5563" : "#e5e7eb",
                                        borderRadius: "10px"
                                    }}
                                />
                                <Bar dataKey="borrowed" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Line Chart */}
                {/* <div className={`rounded-2xl shadow-xl p-6 transition-all border-2 ${darkLight ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700" : "bg-white border-gray-200"
                    }`}>
                    <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkLight ? "text-white" : "text-gray-900"}`}>
                        <FaChartLine className="text-green-500" />
                        Return Trends (Last 30 Days)
                    </h2>
                    {loading ? (
                        <div className="h-[250px] flex items-center justify-center">
                            <AiOutlineLoading3Quarters className="animate-spin text-4xl text-gray-400" />
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={returnData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={darkLight ? "#374151" : "#e5e7eb"} />
                                <XAxis dataKey="name" stroke={darkLight ? "#9ca3af" : "#374151"} tick={{ fontSize: 10 }} />
                                <YAxis stroke={darkLight ? "#9ca3af" : "#374151"} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: darkLight ? "#1f2937" : "#fff",
                                        borderColor: darkLight ? "#4b5563" : "#e5e7eb",
                                        borderRadius: "10px"
                                    }}
                                />
                                <Line type="monotone" dataKey="returned" stroke="#10B981" strokeWidth={3} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div> */}
            </div>
        </div>
    );
};

export default Dashboard;