import type { TableColumnsType } from 'antd';
import XDataTable from '../../component/XDataTable/XDataTable';
import "../../component/XDataTable/XdataTable.css";
import { useState, useMemo } from 'react';
import { useGlobleContextDarklight, useRefreshTable } from '../../AllContext/context';
import UserForm from './userForm';
import { HookIntergrateAPI } from '../../component/HookintagrateAPI/HookintegarteApi';
import ComponentPermission from '../../component/ProtextRoute/ComponentPermissions';
import { HiUserGroup } from 'react-icons/hi';
import NoImage from "../../assets/NoProfile.png";

// Interfaces
interface Role { id: number; name: string; description?: string; }
interface StaffInfo { id: number; firstName: string; lastName: string; phoneNumber: string; position: string; salary: number; }
interface CustomerInfo { id: number; firstName: string; lastName: string; phoneNumber: string; totalPoint: number; }

interface User {
    id: number;
    username: string;
    email: string;
    isActive: boolean;
    type: "Staff" | "Customer" | "None";
    createdDate: string;
    roles: Role[];
    staff: StaffInfo | null;
    customer: CustomerInfo | null;
}

const TYPE_STYLE: Record<string, { bg: string; text: string; darkBg: string; darkText: string; emoji: string }> = {
    Staff: { bg: "bg-indigo-100", text: "text-indigo-700", darkBg: "bg-indigo-900/30", darkText: "text-indigo-300", emoji: "🧑‍💼" },
    Customer: { bg: "bg-teal-100", text: "text-teal-700", darkBg: "bg-teal-900/30", darkText: "text-teal-300", emoji: "🙍" },
    None: { bg: "bg-gray-100", text: "text-gray-500", darkBg: "bg-gray-700/40", darkText: "text-gray-400", emoji: "—" },
};

const UserList = () => {
    const { darkLight } = useGlobleContextDarklight();
    const [showModal, setShowModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined);
    const [idDelete, setIdDelete] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleteAnimating, setIsDeleteAnimating] = useState(false);
    const { DeleteData } = HookIntergrateAPI();
    const { setRefreshTables } = useRefreshTable();

    // 1. Filter States
    const [filterStatus, setFilterStatus] = useState<string>(""); 
    const [filterType, setFilterType] = useState<string>("");     

    const dl = darkLight;

    // 2. Memoize extraParams to pass to XDataTable
    const extraParams = useMemo(() => {
        const params: Record<string, string> = {};
        if (filterStatus !== "") params.isActive = filterStatus;
        if (filterType !== "") params.type = filterType;
        return params;
    }, [filterStatus, filterType]);

    const columns: TableColumnsType<User> = [
        {
            title: 'Profile',
            key: 'image',
            width: 64,
            align: 'center',
            render: (_, record) => {
                const imgSrc = record.staff ? (record.staff as any).imageProfile || NoImage : record.customer ? (record.customer as any).imageProfile || NoImage : NoImage;
                return <img src={imgSrc} className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 mx-auto" onError={(e) => { (e.target as HTMLImageElement).src = NoImage; }} />;
            },
        },
        { title: 'Username', key: 'username', width: 150, render: (_, record) => <p className={`font-semibold text-sm ${dl ? "text-white" : "text-gray-800"}`}>{record.username}</p> },
        { title: 'Email', key: 'email', width: 180, render: (_, record) => <p className={`text-sm ${dl ? "text-gray-400" : "text-gray-600"}`}>{record.email}</p> },
        {
            title: 'Type',
            key: 'type',
            width: 110,
            align: 'center',
            render: (_, record) => {
                const t = TYPE_STYLE[record.type] ?? TYPE_STYLE.None;
                return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${dl ? `${t.darkBg} ${t.darkText}` : `${t.bg} ${t.text}`}`}><span>{t.emoji}</span>{record.type}</span>;
            },
        },
        {
            title: 'Full Name',
            key: 'fullname',
            render: (_, record) => {
                const name = record.staff ? `${record.staff.firstName} ${record.staff.lastName}` : record.customer ? `${record.customer.firstName} ${record.customer.lastName}` : "—";
                return <p className={`text-sm font-medium ${dl ? "text-gray-100" : "text-gray-800"}`}>{name}</p>;
            },
        },
        {
            title: 'Status',
            key: 'status',
            align: 'center',
            width: 90,
            render: (_, record) => (
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${record.isActive ? (dl ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-700") : (dl ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-600")}`}>
                    {record.isActive ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            width: 130,
            render: (_, record) => (
                <div className="flex gap-2 justify-center">
                    <ComponentPermission scopes={["user:update"]}>
                        <button onClick={() => handleEdit(record)} className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs cursor-pointer">Edit</button>
                    </ComponentPermission>
                    <ComponentPermission scopes={["user:delete"]}>
                        <button onClick={() => handleOpenDeleteModal(record)} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs cursor-pointer">Delete</button>
                    </ComponentPermission>
                </div>
            ),
        },
    ];

    const handleAddUser = () => { setSelectedUserId(undefined); setShowModal(true); };
    const handleEdit = (record: User) => { setSelectedUserId(record.id); setShowModal(true); };
    const handleCloseModal = () => { setShowModal(false); setSelectedUserId(undefined); };

    const handleOpenDeleteModal = (record: User) => {
        setIdDelete(record.id);
        setShowDeleteModal(true);
        setTimeout(() => setIsDeleteAnimating(true), 10);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteAnimating(false);
        setTimeout(() => { setShowDeleteModal(false); setIdDelete(null); }, 300);
    };

    const handleDeleteConfirm = async () => {
        if (idDelete !== null) {
            await DeleteData("Person", idDelete);
            handleCloseDeleteModal();
            setRefreshTables(new Date());
        }
    };

    return (
        <>
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center my-4 gap-4'>
                <div className='flex items-center gap-3'>
                    <HiUserGroup className={`w-[40px] h-[40px] ${dl ? 'text-sky-400' : 'text-sky-600'}`} />
                    <h3 className={`font-bold text-2xl ${dl ? 'text-white' : 'text-gray-900'}`}>USER MANAGEMENT</h3>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Filter Dropdowns */}
                    <select 
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className={`px-3 py-2 rounded-md border text-sm outline-none transition-all cursor-pointer ${dl ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-700"}`}
                    >
                        <option value="">All Types</option>
                        <option value="Staff">Staff</option>
                        <option value="Customer">Customer</option>
                    </select>

                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className={`px-5 py-2 rounded-md border text-sm outline-none transition-all cursor-pointer ${dl ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-700"}`}
                    >
                        <option value="">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>

                    <ComponentPermission scopes={["user:create"]}>
                        <button onClick={handleAddUser} className='bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-md shadow-md transition-all active:scale-95'>
                            + Add User
                        </button>
                    </ComponentPermission>
                </div>
            </div>

            <XDataTable
                TableName='User list'
                columns={columns}
                apiUrl='Person'
                extraParams={extraParams} // 3. Passing the filter params here
                selection={false}
                hideAction={true}
                searchPlaceholder="Search by username, email..."
            />

            {showModal && <UserForm userId={selectedUserId} onClose={handleCloseModal} />}

            {/* Delete Modal Section */}
            {showDeleteModal && (
                <>
                    <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isDeleteAnimating ? "opacity-100" : "opacity-0"}`} onClick={handleCloseDeleteModal} />
                    <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-300 ${isDeleteAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                        <div className={`rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto ${dl ? "bg-gray-800" : "bg-white"}`} onClick={e => e.stopPropagation()}>
                            <div className="p-6 text-center">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                                    <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </div>
                                <h3 className={`text-xl font-bold mb-2 ${dl ? "text-white" : "text-gray-900"}`}>Confirm Deletion</h3>
                                <p className={`mb-6 ${dl ? "text-gray-300" : "text-gray-600"}`}>This action cannot be undone. Do you want to delete this user?</p>
                                <div className="flex justify-center gap-3">
                                    <button onClick={handleCloseDeleteModal} className={`px-6 py-2.5 rounded-lg font-medium ${dl ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-700"}`}>Cancel</button>
                                    <button onClick={handleDeleteConfirm} className="px-6 py-2.5 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600">Yes, Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default UserList;