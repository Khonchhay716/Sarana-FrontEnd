import { NavLink } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useGlobleContextDarklight } from '../AllContext/context';
import useFetchDataApi from '../CustomHook/FetchDataApi';
import { GiCoffeeCup } from "react-icons/gi";

const DashBord = () => {
    const { darkLight } = useGlobleContextDarklight();
    const { data } = useFetchDataApi("https://localhost:7095/api/Orders");
    const { data: totalMenu } = useFetchDataApi("https://localhost:7095/api/CoffeeMenu");

    const RoleId = sessionStorage.getItem("roleId");
    // if (data) {
    //     const total = data.reduce((sum: number, item: { totalAmount: number }) => {
    //         return sum + item.totalAmount;
    //     }, 0);
    // }

    const datas = [
        { name: "Jan", cups: 4000 },
        { name: "Feb", cups: 3000 },
        { name: "Mar", cups: 5000 },
        { name: "Apr", cups: 4427 },
        { name: "May", cups: 9118 },
        { name: "Jun", cups: 3323 },
    ];

    // --- Reusable UI Component: MetricCard ---
    interface MetricCardProps {
        title: string;
        value: string | number;
        inputclass?: string | number | null;
        description?: string;
    }


    const MetricCard: React.FC<MetricCardProps> = ({ title, value, inputclass, description }) => {
        const { darkLight } = useGlobleContextDarklight(); // Use darkLight context here

        return (
            <div className={`p-6 rounded-lg shadow-md flex-1 text-center ${inputclass}
          ${darkLight ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                <h3 className={`text-lg font-semibold mb-2 ${darkLight ? 'text-gray-200' : 'text-gray-700'}`}>{title}</h3>
                <p className="text-4xl font-bold text-indigo-600 mb-2">{value}</p>
                {description && <p className={`text-sm ${darkLight ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>}
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col">
            <div className={`shadow px-4 py-3 flex items-center justify-between ${darkLight ? "bg-gray-800" : "bg-white"}`}>
                <div className='flex'>
                    <img className='w-[40px] h-[40px] object-cover rounded-full mr-2' src="https://marketplace.canva.com/EAGQJOtMpq8/2/0/1600w/canva-brown-modern-circle-coffee-shop-logo-TCp6UxDtpus.jpg" alt="" />
                    <h1 className="text-2xl font-bold mt-1">Coffee Shop </h1>
                </div>
                <div className="opacity-70">Welcome, Admin</div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <NavLink to="#">
                    <div className={`rounded-lg shadow p-4 hover:scale-105 transition-transform cursor-auto h-[150px] ${darkLight ? "bg-gray-800 hover:bg-gray-700" : " bg-gray-800 hover:bg-gray-700"}`}>
                        <h2 className={`text-xl font-semibold mb-2 ${darkLight ? "text-rose-200" : "text-rose-800"}`}>Total Revenue</h2>
                        <p className={`text-2xl font-bold text-indigo-600 `}>
                            $ {data.reduce((sum: number, item: { totalAmount: number }) => { return sum + item.totalAmount; }, 0)} / {data.reduce((sum: number, item: { totalAmount: number }) => { return sum + item.totalAmount * 4000; }, 0)} <span className='text-lg'>រៀល</span></p>
                        <p className={`${darkLight ? 'text-gray-400' : 'text-gray-500'}`}>Overall sales generated</p>
                    </div>
                </NavLink>
                <NavLink to="/productall">
                    <div className={`rounded-2xl shadow p-4 hover:scale-105 transition-transform cursor-pointer h-[150px] ${darkLight ? "bg-green-700 hover:bg-green-800" : "bg-sky-500 hover:bg-sky-600"}`}>
                        <h2 className={`text-xl font-semibold mb-2 text-center ${darkLight ? "text-rose-200" : "text-rose-800"}`}>Order Coffee</h2>
                        <div className='flex justify-center items-center text-6xl'><GiCoffeeCup /></div>
                    </div>
                   
                </NavLink>
                {RoleId == "1" ?  
                <NavLink to="/admin">
                    <div className={`rounded-2xl shadow p-4 hover:scale-105 transition-transform cursor-pointer h-[150px] ${darkLight ? "bg-rose-900" : "bg-rose-100"}`}>
                        <h2 className={`text-xl font-semibold mb-2 ${darkLight ? "text-rose-200" : "text-rose-800"}`}>Total User</h2>
                        <p className={`text-3xl font-bold ${darkLight ? "text-rose-100" : "text-rose-800"}`}>1,250</p>
                    </div>
                </NavLink>
                : ""}
                <NavLink to="/addmenucoffee">
                    <MetricCard
                        inputclass={"hover:bg-gray-700 cursor-pointer"}
                        title="Add Menu"
                        value={totalMenu.length}
                        description="Number of transactions"
                    />
                </NavLink>
                <NavLink to="/historySale">
                    <MetricCard
                        inputclass={"hover:bg-gray-700"}
                        title="Total Orders"
                        value={data.length}
                        description="Number of transactions"
                    />
                </NavLink>
                {/* <NavLink to="/historySale">
                    <MetricCard
                        inputclass={"hover:bg-gray-700"}
                        title="Total Report"
                        value={data.length}
                        description="Number of transactions"
                    />
                </NavLink> */}
                <div className={`rounded-2xl shadow p-6 col-span-1 md:col-span-2 ${darkLight ? "bg-gray-800" : "bg-white"}`}>
                    <h2 className={`text-xl font-semibold mb-4 ${darkLight ? "text-white" : "text-gray-900"}`}>Monthly Enrollment</h2>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={datas}>
                            <CartesianGrid strokeDasharray="3 3" stroke={darkLight ? "#444" : "#ccc"} />
                            <XAxis dataKey="name" stroke={darkLight ? "#ccc" : "#333"} />
                            <YAxis stroke={darkLight ? "#ccc" : "#333"} />
                            <Tooltip contentStyle={{ backgroundColor: darkLight ? "#333" : "#fff", borderColor: darkLight ? "#666" : "#ccc", color: darkLight ? "#fff" : "#000" }} />
                            <Bar dataKey="cups" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>F
        </div>
    )
}

export default DashBord
