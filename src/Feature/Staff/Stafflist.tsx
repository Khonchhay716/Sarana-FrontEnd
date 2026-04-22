// import type { TableColumnsType } from 'antd';
// import XDataTable from '../../component/XDataTable/XDataTable';
// import "../../component/XDataTable/XdataTable.css";
// import { useState } from 'react';
// import { useGlobleContextDarklight, useRefreshTable } from '../../AllContext/context';
// import StaffForm from './StaffForm';
// import { HookIntergrateAPI } from '../../component/HookintagrateAPI/HookintegarteApi';
// import { FaUserCheck, FaUserPlus } from 'react-icons/fa';
// import { HiUserGroup } from 'react-icons/hi';
// import StaffPersonForm from './Staffpersonform';

// interface UserInfo {
//     id: number;
//     username: string;
//     email: string;
//     isActive: boolean;
// }

// interface Staff {
//     id: number;
//     firstName: string;
//     lastName: string;
//     imageProfile: string;
//     phoneNumber: string;
//     position: string;
//     salary: number;
//     status: boolean;
//     isDeleted: boolean;
//     createdDate: string;
//     updatedDate: string | null;
//     createdBy: string | null;
//     user: UserInfo | null;
// }

// type ActiveModal =
//     | { type: "staffForm"; staffId?: number }
//     | { type: "staffPersonForm"; staffId: number; staffName: string; userId?: number }
//     | { type: "deleteConfirm"; staffId: number }
//     | null;

// const StaffList = () => {
//     const { darkLight } = useGlobleContextDarklight();
//     const [activeModal, setActiveModal] = useState<ActiveModal>(null);
//     const [isDeleteAnimating, setIsDeleteAnimating] = useState(false);
//     const { DeleteData } = HookIntergrateAPI();
//     const { setRefreshTables } = useRefreshTable();

//     const dl = darkLight;

//     const openDeleteModal = (staffId: number) => {
//         setActiveModal({ type: "deleteConfirm", staffId });
//         setTimeout(() => setIsDeleteAnimating(true), 10);
//     };

//     const closeModal = () => {
//         if (activeModal?.type === "deleteConfirm") {
//             setIsDeleteAnimating(false);
//             setTimeout(() => setActiveModal(null), 300);
//         } else {
//             setActiveModal(null);
//         }
//     };

//     const handleFormClose = () => {
//         setActiveModal(null);
//     };

//     const handleDeleteConfirm = async () => {
//         if (activeModal?.type !== "deleteConfirm") return;
//         try {
//             await DeleteData("Staff", activeModal.staffId);
//             setIsDeleteAnimating(false);
//             setTimeout(() => { setActiveModal(null); setRefreshTables(new Date()); }, 300);
//         } catch (error) {
//             console.error("Error deleting staff:", error);
//         }
//     };

//     const columns: TableColumnsType<Staff> = [
//         {
//             title: 'Profile',
//             key: 'image',
//             width: 70,
//             align: 'center',
//             render: (_, record) => (
//                 <img
//                     src={record.imageProfile || "https://yokohama-soei-fc.com/wpdata/wp-content/uploads/2022/03/noimage.png"}
//                     alt={record.firstName}
//                     className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
//                 />
//             ),
//         },
//         {
//             title: 'Staff Name',
//             key: 'name',
//             width: 180,
//             render: (_, record) => (
//                 <div>
//                     <p className={`font-semibold text-sm ${dl ? "text-white" : "text-gray-800"}`}>
//                         {record.firstName} {record.lastName}
//                     </p>

//                 </div>
//             ),
//         },
//         {
//             title: 'Position',
//             key: 'position',
//             render: (_, record) => (
//                 <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${dl ? "bg-indigo-900/30 text-indigo-300" : "bg-indigo-100 text-indigo-700"}`}>
//                     {record.position || "—"}
//                 </span>
//             ),
//         },
//         {
//             title: 'Salary',
//             key: 'salary',
//             align: 'right',
//             render: (_, record) => (
//                 <span className={`text-sm font-semibold ${dl ? "text-green-400" : "text-green-700"}`}>
//                     ${(record.salary ?? 0).toLocaleString()}
//                 </span>
//             ),
//         },
//         {
//             title: 'Status',
//             key: 'status',
//             align: 'center',
//             render: (_, record) => (
//                 <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${record.status
//                     ? dl ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-700"
//                     : dl ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-600"
//                     }`}>
//                     {record.status ? "Active" : "Inactive"}
//                 </span>
//             ),
//         },
//         {
//             title: 'User Account',
//             key: 'user',
//             width: 120,
//             render: (_, record) => {
//                 const staffName = `${record.firstName} ${record.lastName}`;
//                 const hasUser = !!record.user;

//                 return (
//                     <div className="flex items-center gap-2">
//                         <button
//                             title={hasUser ? "Edit User Account" : "Add User Account"}
//                             onClick={() => setActiveModal({
//                                 type: "staffPersonForm",
//                                 staffId: record.id,
//                                 staffName,
//                                 userId: record.user?.id,
//                             })}
//                             className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm cursor-pointer`}
//                         >
//                             {hasUser ? (
//                                 <FaUserCheck size={18} className={dl ? "text-green-400" : "text-green-600"} />
//                             ) : (
//                                 <FaUserPlus size={18} className={dl ? "text-gray-400" : "text-gray-500"} />
//                             )}
//                         </button>
//                     </div>
//                 );
//             },
//         },
//         {
//             title: 'Status',
//             key: 'status',
//             align: 'center',
//             render: (_, record) => (
//                 <p className={`text-xs mt-0.5 ${dl ? "text-gray-400" : "text-gray-500"}`}>
//                      {record.phoneNumber || "—"}
//                 </p>
//             ),
//         },
//         {
//             title: 'Created Date',
//             key: 'createdDate',
//             render: (_, record) => (
//                 <span className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}>
//                     {record.createdDate
//                         ? new Date(record.createdDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
//                         : "—"}
//                 </span>
//             ),
//         },
//         {
//             title: 'Actions',
//             key: 'actions',
//             align: 'center',
//             width: 130,
//             render: (_, record) => (
//                 <div className="flex gap-2 justify-center">
//                     <button
//                         onClick={() => setActiveModal({ type: "staffForm", staffId: record.id })}
//                         className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors cursor-pointer"
//                     >
//                         Edit
//                     </button>
//                     <button
//                         onClick={() => openDeleteModal(record.id)}
//                         className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors cursor-pointer"
//                     >
//                         Delete
//                     </button>
//                 </div>
//             ),
//         },
//     ];

//     return (
//         <>
//             {/* Page Header */}
//             <div className='flex justify-between my-2'>
//                 <div className='flex items-center gap-3'>
//                     <HiUserGroup className="w-[50px] h-[40px] drop-shadow-lg animate-bounce" />
//                     <h3 className={`font-bold text-2xl ${dl ? 'text-white' : 'text-gray-900'}`}>STAFF MANAGEMENT</h3>
//                 </div>
//                 <button
//                     onClick={() => setActiveModal({ type: "staffForm" })}
//                     className='bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-md transition-colors'
//                 >
//                     Add Staff
//                 </button>
//             </div>

//             {/* Table */}
//             <XDataTable
//                 TableName='Staff list'
//                 columns={columns}
//                 apiUrl='Staff'
//                 selection={false}
//                 hideAction={true}
//                 searchPlaceholder="Search by name, position..."
//             />

//             {/* Staff Add / Edit Modal */}
//             {activeModal?.type === "staffForm" && (
//                 <StaffForm
//                     staffId={activeModal.staffId}
//                     onClose={handleFormClose}
//                 />
//             )}

//             {/* Staff Person (User) Modal */}
//             {activeModal?.type === "staffPersonForm" && (
//                 <StaffPersonForm
//                     staffId={activeModal.staffId}
//                     staffName={activeModal.staffName}
//                     userId={activeModal.userId}
//                     onClose={handleFormClose}
//                 />
//             )}

//             {/* Delete Confirm Modal */}
//             {activeModal?.type === "deleteConfirm" && (
//                 <>
//                     <div
//                         className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isDeleteAnimating ? "opacity-100" : "opacity-0"}`}
//                         onClick={closeModal}
//                     />
//                     <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none transition-all duration-300 ${isDeleteAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
//                         <div
//                             className={`rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto transform transition-all duration-300 ${dl ? "bg-gray-800" : "bg-white"} ${isDeleteAnimating ? "translate-y-0" : "translate-y-4"}`}
//                             onClick={e => e.stopPropagation()}
//                         >
//                             <div className="p-6 text-center">
//                                 <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
//                                     <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                     </svg>
//                                 </div>
//                                 <h3 className={`text-xl font-bold mb-2 ${dl ? "text-white" : "text-gray-900"}`}>Confirm Deletion</h3>
//                                 <p className={`mb-6 ${dl ? "text-gray-300" : "text-gray-600"}`}>
//                                     This action cannot be undone. Do you want to delete this staff member?
//                                 </p>
//                                 <div className="flex justify-center gap-3">
//                                     <button
//                                         onClick={closeModal}
//                                         className={`px-6 py-2.5 rounded-lg font-medium transition-all ${dl ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
//                                     >
//                                         Cancel
//                                     </button>
//                                     <button
//                                         onClick={handleDeleteConfirm}
//                                         className="px-6 py-2.5 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition-all"
//                                     >
//                                         Yes, Delete
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </>
//             )}
//         </>
//     );
// };

// export default StaffList;


import type { TableColumnsType } from 'antd';
import XDataTable from '../../component/XDataTable/XDataTable';
import "../../component/XDataTable/XdataTable.css";
import { useState } from 'react';
import { useGlobleContextDarklight, useRefreshTable } from '../../AllContext/context';
import StaffForm from './StaffForm';
import { HookIntergrateAPI } from '../../component/HookintagrateAPI/HookintegarteApi';
import { FaUserCheck, FaUserPlus } from 'react-icons/fa';
import { HiUserGroup } from 'react-icons/hi';
import { MdTableRows, MdAccountTree } from 'react-icons/md';
import StaffPersonForm from './Staffpersonform';
import StaffTree from './StaffTree';

interface UserInfo {
    id: number;
    username: string;
    email: string;
    isActive: boolean;
}

interface SupervisorInfo {
    id: number;
    fullName: string;
    position: string;
    imageProfile: string;
}

interface Staff {
    id: number;
    firstName: string;
    lastName: string;
    imageProfile: string;
    phoneNumber: string;
    position: string;
    salary: number;
    status: boolean;
    isDeleted: boolean;
    createdDate: string;
    updatedDate: string | null;
    createdBy: string | null;
    supervisorId: number | null;
    supervisor: SupervisorInfo | null;
    user: UserInfo | null;
}

type ActiveTab = "list" | "tree";

type ActiveModal =
    | { type: "staffForm"; staffId?: number }
    | { type: "staffPersonForm"; staffId: number; staffName: string; userId?: number }
    | { type: "deleteConfirm"; staffId: number }
    | null;

const StaffList = () => {
    const { darkLight } = useGlobleContextDarklight();
    const [activeTab, setActiveTab] = useState<ActiveTab>("list");
    const [activeModal, setActiveModal] = useState<ActiveModal>(null);
    const [isDeleteAnimating, setIsDeleteAnimating] = useState(false);
    const { DeleteData } = HookIntergrateAPI();
    const { setRefreshTables } = useRefreshTable();
    const dl = darkLight;

    const openDeleteModal = (staffId: number) => {
        setActiveModal({ type: "deleteConfirm", staffId });
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

    const handleFormClose = () => setActiveModal(null);

    const handleDeleteConfirm = async () => {
        if (activeModal?.type !== "deleteConfirm") return;
        try {
            await DeleteData("Staff", activeModal.staffId);
            setIsDeleteAnimating(false);
            setTimeout(() => { setActiveModal(null); setRefreshTables(new Date()); }, 300);
        } catch (error) {
            console.error("Error deleting staff:", error);
        }
    };

    const columns: TableColumnsType<Staff> = [
        {
            title: 'Profile',
            key: 'image',
            width: 60,
            align: 'center',
            render: (_, record) => (
                <img
                    src={record.imageProfile || "https://yokohama-soei-fc.com/wpdata/wp-content/uploads/2022/03/noimage.png"}
                    alt={record.firstName}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                />
            ),
        },
        {
            title: 'Staff Name',
            key: 'name',
            width: 150,
            render: (_, record) => (
                <p className={`font-semibold text-xs ${dl ? "text-white" : "text-gray-800"}`}>
                    {record.firstName} {record.lastName}
                </p>
            ),
        },
        {
            title: 'Position',
            key: 'position',
            render: (_, record) => (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${dl ? "bg-indigo-900/30 text-indigo-300" : "bg-indigo-100 text-indigo-700"}`}>
                    {record.position || "—"}
                </span>
            ),
        },
        {
            title: 'Supervisor',
            key: 'supervisor',
            render: (_, record) => (
                record.supervisor ? (
                    <div className="flex items-center gap-1.5">
                        <img
                            src={record.supervisor.imageProfile || "https://yokohama-soei-fc.com/wpdata/wp-content/uploads/2022/03/noimage.png"}
                            alt={record.supervisor.fullName}
                            className="w-6 h-6 rounded-full object-cover border border-gray-200"
                        />
                        <p className={`text-xs font-medium ${dl ? "text-white" : "text-gray-800"}`}>
                            {record.supervisor.fullName}
                        </p>
                    </div>
                ) : (
                    <span className={`text-xs ${dl ? "text-gray-500" : "text-gray-400"}`}>—</span>
                )
            ),
        },
        {
            title: 'Salary',
            key: 'salary',
            align: 'right',
            render: (_, record) => (
                <span className={`text-xs font-semibold ${dl ? "text-green-400" : "text-green-700"}`}>
                    ${(record.salary ?? 0).toLocaleString()}
                </span>
            ),
        },
        {
            title: 'Phone',
            key: 'phone',
            render: (_, record) => (
                <p className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}>
                    {record.phoneNumber || "—"}
                </p>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            align: 'center',
            render: (_, record) => (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${record.status
                        ? dl ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-700"
                        : dl ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-600"
                    }`}>
                    {record.status ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            title: 'User',
            key: 'user',
            width: 60,
            align: 'center',
            render: (_, record) => {
                const hasUser = !!record.user;
                return (
                    <button
                        title={hasUser ? "Edit User Account" : "Add User Account"}
                        onClick={() => setActiveModal({
                            type: "staffPersonForm",
                            staffId: record.id,
                            staffName: `${record.firstName} ${record.lastName}`,
                            userId: record.user?.id,
                        })}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer mx-auto"
                    >
                        {hasUser
                            ? <FaUserCheck size={14} className={dl ? "text-green-400" : "text-green-600"} />
                            : <FaUserPlus size={14} className={dl ? "text-gray-400" : "text-gray-500"} />
                        }
                    </button>
                );
            },
        },
        {
            title: 'Created',
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
            width: 110,
            render: (_, record) => (
                <div className="flex gap-1.5 justify-center">
                    <button
                        onClick={() => setActiveModal({ type: "staffForm", staffId: record.id })}
                        className="px-2.5 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors cursor-pointer">
                        Edit
                    </button>
                    <button
                        onClick={() => openDeleteModal(record.id)}
                        className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors cursor-pointer">
                        Delete
                    </button>
                </div>
            ),
        },
    ];

    return (
        <>
            {/* Page Header */}
            <div className="flex items-center justify-between gap-2 my-2 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                    <HiUserGroup className={`w-7 h-7 sm:w-9 sm:h-9 drop-shadow-lg flex-shrink-0 ${dl ? "text-indigo-400" : "text-indigo-600"}`} />
                    <h3 className={`font-bold text-sm sm:text-xl whitespace-nowrap ${dl ? "text-white" : "text-gray-900"}`}>
                        STAFF MANAGEMENT
                    </h3>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* List / Tree toggle */}
                    <div className={`flex gap-1 p-1 rounded-xl ${dl ? "bg-gray-700" : "bg-gray-100"}`}>
                        <button
                            onClick={() => setActiveTab("list")}
                            className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "list"
                                    ? "bg-indigo-500 text-white shadow"
                                    : dl ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
                                }`}>
                            <MdTableRows className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">List View</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("tree")}
                            className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "tree"
                                    ? "bg-indigo-500 text-white shadow"
                                    : dl ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
                                }`}>
                            <MdAccountTree className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Tree View</span>
                        </button>
                    </div>

                    {/* Add Staff */}
                    <button
                        onClick={() => setActiveModal({ type: "staffForm" })}
                        className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow whitespace-nowrap">
                        + <span className="hidden sm:inline">Add</span> Staff
                    </button>
                </div>
            </div>

            {/* List View */}
            {activeTab === "list" && (
                <XDataTable
                    TableName="Staff list"
                    columns={columns}
                    apiUrl="Staff"
                    selection={false}
                    hideAction={true}
                    searchPlaceholder="Search by name, position..."
                />
            )}

            {/* Tree View */}
            {activeTab === "tree" && (
                <StaffTree
                    onEdit={(staffId) => setActiveModal({ type: "staffForm", staffId })}
                    onDelete={(staffId) => openDeleteModal(staffId)}
                />
            )}

            {/* Staff Add / Edit Modal */}
            {activeModal?.type === "staffForm" && (
                <StaffForm staffId={activeModal.staffId} onClose={handleFormClose} />
            )}

            {/* Staff Person Modal */}
            {activeModal?.type === "staffPersonForm" && (
                <StaffPersonForm
                    staffId={activeModal.staffId}
                    staffName={activeModal.staffName}
                    userId={activeModal.userId}
                    onClose={handleFormClose}
                />
            )}

            {/* Delete Confirm Modal */}
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
                                <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-4">
                                    <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                                <h3 className={`text-lg font-bold mb-2 ${dl ? "text-white" : "text-gray-900"}`}>
                                    Confirm Deletion
                                </h3>
                                <p className={`mb-6 text-sm ${dl ? "text-gray-300" : "text-gray-600"}`}>
                                    This action cannot be undone. Do you want to delete this staff member?
                                </p>
                                <div className="flex justify-center gap-3">
                                    <button onClick={closeModal}
                                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${dl ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                                        Cancel
                                    </button>
                                    <button onClick={handleDeleteConfirm}
                                        className="px-5 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-all">
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

export default StaffList;