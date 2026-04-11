import type { TableColumnsType } from 'antd';
import XDataTable from '../../component/XDataTable/XDataTable';
import "../../component/XDataTable/XdataTable.css";
import { BiGroup } from 'react-icons/bi';
import { useState } from 'react';
import { useGlobleContextDarklight, useRefreshTable } from '../../AllContext/context';
import CustomerForm from './CustomerForm';
import PersonForm from './PersonForm';
import { HookIntergrateAPI } from '../../component/HookintagrateAPI/HookintegarteApi';
import { FaUserCheck, FaUserPlus } from 'react-icons/fa';

interface UserInfo {
    id: number;
    username: string;
    email: string;
    isActive: boolean;
}

interface Customer {
    id: number;
    firstName: string;
    lastName: string;
    imageProfile: string;
    phoneNumber: string;
    totalPoint: number;
    status: boolean;
    isDeleted: boolean;
    createdDate: string;
    updatedDate: string | null;
    createdBy: string | null;
    user: UserInfo | null;
}

type ActiveModal =
    | { type: "customerForm"; customerId?: number }
    | { type: "personForm"; customerId: number; customerName: string; userId?: number }
    | { type: "deleteConfirm"; customerId: number }
    | null;

const CustomerList = () => {
    const { darkLight } = useGlobleContextDarklight();
    const [activeModal, setActiveModal] = useState<ActiveModal>(null);
    const [isDeleteAnimating, setIsDeleteAnimating] = useState(false);
    const { DeleteData } = HookIntergrateAPI();
    const { setRefreshTables } = useRefreshTable();

    const dl = darkLight;

    const openDeleteModal = (customerId: number) => {
        setActiveModal({ type: "deleteConfirm", customerId });
        setTimeout(() => setIsDeleteAnimating(true), 10);
    };

    const closeModal = () => {
        if (activeModal?.type === "deleteConfirm") {
            setIsDeleteAnimating(false);
            setTimeout(() => setActiveModal(null), 300);
        } else {
            setActiveModal(null);
        }
    };

    const handleFormClose = () => {
        setActiveModal(null);
    };

    const handleDeleteConfirm = async () => {
        if (activeModal?.type !== "deleteConfirm") return;
        try {
            await DeleteData("Customer", activeModal.customerId);
            setIsDeleteAnimating(false);
            setTimeout(() => { setActiveModal(null); setRefreshTables(new Date()); }, 300);
        } catch (error) {
            console.error("Error deleting customer:", error);
        }
    };

    const columns: TableColumnsType<Customer> = [
        {
            title: 'Profile',
            key: 'image',
            width: 70,
            align: 'center',
            render: (_, record) => (
                <img
                    src={record.imageProfile || "https://yokohama-soei-fc.com/wpdata/wp-content/uploads/2022/03/noimage.png"}
                    alt={record.firstName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                />
            ),
        },
        {
            title: 'Customer Name',
            key: 'name',
            width: 180,
            render: (_, record) => (
                <div>
                    <p className={`font-semibold text-sm ${dl ? "text-white" : "text-gray-800"}`}>
                        {record.firstName} {record.lastName}
                    </p>
                </div>
            ),
        },
        {
            title: 'Points',
            key: 'totalPoint',
            align: 'center',
            render: (_, record) => (
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${dl ? "bg-yellow-900/30 text-yellow-400" : "bg-yellow-100 text-yellow-700"}`}>
                    ⭐ {record.totalPoint ?? 0}
                </span>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            align: 'center',
            render: (_, record) => (
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${record.status
                    ? dl ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-700"
                    : dl ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-600"
                    }`}>
                    {record.status ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            title: 'User Account',
            key: 'user',
            width: 120,
            render: (_, record) => {
                const customerName = `${record.firstName} ${record.lastName}`;
                const hasUser = !!record.user;

                return (
                    <div className="flex items-center gap-2">

                        {/* Single icon button — create if no user, edit if user exists */}
                        <button
                            title={hasUser ? "Edit User Account" : "Add User Account"}
                            onClick={() => setActiveModal({
                                type: "personForm",
                                customerId: record.id,
                                customerName,
                                userId: record.user?.id,
                            })}
                            className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm cursor-pointer`}
                        >
                            {hasUser ? (
                                <FaUserCheck size={18} className={dl ? "text-green-400" : "text-green-600"} />
                            ) : (
                                <FaUserPlus size={18} className={dl ? "text-gray-400" : "text-gray-500"} />
                            )}
                        </button>
                    </div>
                );
            },
        },
        {
            title: 'Phone Number',
            key: 'phoneNumber',
            render: (_, record) => (
                <p className={` mt-0.5 ${dl ? "text-gray-400" : "text-gray-500"}`}>
                    {record.phoneNumber || "—"}
                </p>
            ),
        },
        {
            title: 'Created Date',
            key: 'createdDate',
            render: (_, record) => (
                <span className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}>
                    {record.createdDate
                        ? new Date(record.createdDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                        : "—"}
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
                    {/* <ComponentPermission scopes={["customer:update"]}> */}
                    <button
                        onClick={() => setActiveModal({ type: "customerForm", customerId: record.id })}
                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors cursor-pointer"
                    >
                        Edit
                    </button>
                    {/* </ComponentPermission> */}
                    {/* <ComponentPermission scopes={["customer:delete"]}> */}
                    <button
                        onClick={() => openDeleteModal(record.id)}
                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors cursor-pointer"
                    >
                        Delete
                    </button>
                    {/* </ComponentPermission> */}
                </div>
            ),
        },
    ];

    return (
        <>
            {/* Page Header */}
            <div className='flex justify-between my-2'>
                <div className='flex items-center gap-3'>
                    <BiGroup className="w-[50px] h-[40px] drop-shadow-lg animate-bounce" />
                    <h3 className={`font-bold text-2xl ${dl ? 'text-white' : 'text-gray-900'}`}>CUSTOMER MANAGEMENT</h3>
                </div>
                {/* <ComponentPermission scopes={["customer:create"]}> */}
                <button
                    onClick={() => setActiveModal({ type: "customerForm" })}
                    className='bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-md transition-colors'
                >
                    Add Customer
                </button>
                {/* </ComponentPermission> */}
            </div>

            {/* Table */}
            <XDataTable
                TableName='Customer list'
                columns={columns}
                apiUrl='Customer'
                selection={false}
                hideAction={true}
                searchPlaceholder="Search by name, phone..."
            />

            {activeModal?.type === "customerForm" && (
                <CustomerForm
                    customerId={activeModal.customerId}
                    onClose={handleFormClose}
                />
            )}

            {activeModal?.type === "personForm" && (
                <PersonForm
                    customerId={activeModal.customerId}
                    customerName={activeModal.customerName}
                    userId={activeModal.userId}
                    onClose={handleFormClose}
                />
            )}

            {activeModal?.type === "deleteConfirm" && (
                <>
                    <div
                        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isDeleteAnimating ? "opacity-100" : "opacity-0"}`}
                        onClick={closeModal}
                    />
                    <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none transition-all duration-300 ${isDeleteAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                        <div
                            className={`rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto transform transition-all duration-300 ${dl ? "bg-gray-800" : "bg-white"} ${isDeleteAnimating ? "translate-y-0" : "translate-y-4"}`}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 text-center">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                                    <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                                <h3 className={`text-xl font-bold mb-2 ${dl ? "text-white" : "text-gray-900"}`}>Confirm Deletion</h3>
                                <p className={`mb-6 ${dl ? "text-gray-300" : "text-gray-600"}`}>
                                    This action cannot be undone. Do you want to delete this customer?
                                </p>
                                <div className="flex justify-center gap-3">
                                    <button
                                        onClick={closeModal}
                                        className={`px-6 py-2.5 rounded-lg font-medium transition-all ${dl ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteConfirm}
                                        className="px-6 py-2.5 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition-all"
                                    >
                                        Yes, Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default CustomerList;