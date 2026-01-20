import { NavLink } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useGlobleContextDarklight } from '../AllContext/context';
import useFetchDataApi from '../CustomHook/FetchDataApi';
import { GiCoffeeCup } from "react-icons/gi";

const DashBord = () => {
    const { darkLight } = useGlobleContextDarklight();
    const { data } = useFetchDataApi("https://localhost:7095/api/Orders");
    const { data: totalMenu } = useFetchDataApi("https://localhost:7095/api/CoffeeMenu");
    const { data: totaluser } = useFetchDataApi("https://localhost:7095/api/User");
    const { data: totalProduct } = useFetchDataApi("https://localhost:7095/api/Product");

    const datas = [
        { name: "Jan", cups: 4000 },
        { name: "Feb", cups: 3000 },
        { name: "Mar", cups: 5000 },
        { name: "Apr", cups: 4427 },
        { name: "May", cups: 9118 },
        { name: "Jun", cups: 3323 },
        { name: "jul", cups: 3323 },
        { name: "Agu", cups: 0 },
        { name: "Sep", cups: 0 },
        { name: "Oct", cups: 0 },
        { name: "Nov", cups: 0 },
        { name: "Des", cups: 0 },
    ];

    interface MetricCardProps {
        title: string;
        value: string | number;
        inputclass?: string | number | null;
        description?: string;
        sign?: string;
        sign2?: string;
        value2?: string | number;
        inputchile?: string;
    }

    const MetricCard: React.FC<MetricCardProps> = ({ title, value, inputclass, description, sign, value2, sign2, inputchile }) => {
        const { darkLight } = useGlobleContextDarklight();
        return (
            <div className={`p-6 rounded-xl shadow-lg flex-1 text-center transition-transform hover:scale-[1.03] ${inputclass} ${darkLight ? 'bg-[#111827] text-white' : 'bg-white text-gray-900'}`}>
                <h3 className={`text-lg font-medium mb-2 ${darkLight ? 'text-indigo-300' : 'text-indigo-700'}`}>{title}</h3>
                <p className={`text-4xl font-extrabold text-yellow-400 mb-1 ${inputchile}`}>{value}{sign}</p>
                <p className={`text-4xl font-extrabold text-yellow-400 mb-1 ${inputchile}`}>{value2}{sign2}</p>
                {description && <p className={`text-sm ${darkLight ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>}
            </div>
        );
    };

    // const MoneyUSA = data.reduce((sum: number, item: { totalAmount: number }) => sum + item.totalAmount, 0)
    // const MonneyReal = data.reduce((sum: number, item: { totalAmount: number }) => sum + item.totalAmount, 0)

    return (
        <div className="flex-1 flex flex-col">
            <div className={`shadow px-4 py-3 flex items-center justify-between${darkLight ? "bg-gray-900" : "bg-white"}`}>
                <div className='flex'>
                    <img className='w-[40px] h-[40px] object-cover rounded-full mr-2' src="https://marketplace.canva.com/EAGQJOtMpq8/2/0/1600w/canva-brown-modern-circle-coffee-shop-logo-TCp6UxDtpus.jpg" alt="" />
                    <h1 className="text-2xl font-bold mt-1">Coffee Shop</h1>
                </div>
                <div className="text-sm text-gray-400">Welcome, Admin</div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
                <NavLink to="#">
                    <div className={`rounded-xl shadow-lg p-4 hover:scale-105 transition-transform cursor-auto h-[150px] ${darkLight ? "bg-[#1f2937] hover:bg-[#374151]" : "bg-white hover:bg-gray-100"}`}>
                        <h2 className={`text-xl font-semibold mb-2 ${darkLight ? "text-pink-300" : "text-pink-600"}`}>Total Revenue</h2>
                        <p className="text-2xl font-bold text-green-400">
                            $ {data.reduce((sum: number, item: { totalAmount: number }) => sum + item.totalAmount, 0)} / {data.reduce((sum: number, item: { totalAmount: number }) => sum + item.totalAmount * 4000, 0)} <span className='text-lg'>រៀល</span>
                        </p>
                        <p className={`${darkLight ? "text-gray-400" : "text-gray-500"}`}>Overall sales generated</p>
                    </div>
                </NavLink>
                <NavLink to="/pos">
                    <div className={`rounded-xl shadow-lg p-4 hover:scale-105 transition-transform cursor-pointer h-[150px] ${darkLight ? "hover:bg-gray-700 bg-gray-800" : "bg-emerald-200 hover:bg-emerald-300"}`}>
                        <h2 className={`text-xl font-semibold mb-2 text-center ${darkLight ? "text-white" : "text-emerald-900"}`}>Order Coffee</h2>
                        <div className='flex justify-center items-center text-6xl text-orange-400'><GiCoffeeCup /></div>
                    </div>
                </NavLink>

                <NavLink to="/users">
                    <MetricCard inputclass="hover:bg-gray-700 bg-gray-800 cursor-pointer" title="TOTAL USERS" value={totaluser.length} description="Number of users" />
                </NavLink>

                <NavLink to="/addmenucoffee">
                    <MetricCard inputclass="hover:bg-gray-700 bg-gray-800 cursor-pointer" title="MENU PRODUCT ALL" value={totalMenu.length} description="Total Menu Items" />
                </NavLink>

                <NavLink to="/product">
                    <MetricCard inputclass="hover:bg-gray-700 bg-gray-800 cursor-pointer" title="PRODUCT IN STOCK" value={totalProduct.length} description="Available Products" />
                </NavLink>

                <NavLink to="/historySale">
                    <MetricCard inputclass="hover:bg-gray-700 bg-gray-800 cursor-pointer" title="TOTAL REPORT" value={data.length} description="Total Transactions" />
                </NavLink>
            </div>
            <div className={`rounded-xl shadow-lg p-6 col-span-1 md:col-span-2 transition-all pb-20 ${darkLight ? "bg-[#0f172a]" : "bg-white"}`}>
                <h2 className={`text-xl font-semibold mb-4 ${darkLight ? "text-white" : "text-gray-900"}`}>Monthly Enrollment</h2>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={datas}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkLight ? "#2d3748" : "#e5e7eb"} />
                        <XAxis dataKey="name" stroke={darkLight ? "#cbd5e1" : "#1f2937"} />
                        <YAxis stroke={darkLight ? "#cbd5e1" : "#1f2937"} />
                        <Tooltip contentStyle={{ backgroundColor: darkLight ? "#1e293b" : "#fff", borderColor: darkLight ? "#475569" : "#e5e7eb", color: darkLight ? "#f8fafc" : "#111827" }} />
                        <Bar dataKey="cups" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DashBord;

