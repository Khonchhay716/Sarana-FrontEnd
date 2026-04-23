// import type { TableColumnsType } from 'antd';
// import XDataTable from '../../component/XDataTable/XDataTable';
// import "../../component/XDataTable/XdataTable.css";
// import { BiGitBranch } from 'react-icons/bi';
// import { useState } from 'react';
// import { useGlobleContextDarklight, useRefreshTable } from '../../AllContext/context';
// import { HookIntergrateAPI } from '../../component/HookintagrateAPI/HookintegarteApi';
// // import ComponentPermission from '../../component/ProtextRoute/ComponentPermissions';
// import BranchForm from './Branchform';

// interface Branch {
//     id: number;
//     branchName: string;
//     logo: string;
//     status: string;
//     description: string;
//     isDeleted: boolean;
//     createdDate: string;
//     updatedDate: string;
//     createdBy: string;
// }

// const BranchList = () => {
//     const { darkLight } = useGlobleContextDarklight();
//     const [showModal, setShowModal] = useState(false);
//     const [selectedBranchId, setSelectedBranchId] = useState<number | undefined>(undefined);
//     const [idDelete, setIdDelete] = useState<number | null>(null);
//     const [showDeleteModal, setShowDeleteModal] = useState(false);
//     const [isDeleteAnimating, setIsDeleteAnimating] = useState(false);
//     const { DeleteData } = HookIntergrateAPI();
//     const { setRefreshTables } = useRefreshTable();

//     const columns: TableColumnsType<Branch> = [
//         {
//             title: 'Logo',
//             key: 'Logo',
//             width: 70,
//             align: 'center',
//             render: (_, record) => (
//                 record.logo
//                     ? <img src={record.logo} alt={""}
//                         onError={(e) => { (e.target as HTMLImageElement).src = "https://yokohama-soei-fc.com/wpdata/wp-content/uploads/2022/03/noimage.png"; }}
//                         className="w-10 h-10 rounded-lg object-cover mx-auto" />
//                     : <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto text-lg font-bold
//                         ${darkLight ? "bg-gray-700 text-gray-400" : "bg-purple-100 text-purple-500"}`}>
//                         {record.branchName?.charAt(0).toUpperCase()}
//                     </div>
//             ),
//         },
//         {
//             title: 'Branch Name',
//             key: 'branchName',
//             render: (_, record) => (
//                 <div>
//                     <p className={`font-semibold text-sm ${darkLight ? "text-white" : "text-gray-800"}`}>{record.branchName}</p>
//                 </div>
//             ),
//         },
//         {
//             title: 'Status',
//             key: 'status',
//             align: 'center',
//             render: (_, record) => (
//                 <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${record.status === "Active"
//                     ? "bg-green-100 text-green-700"
//                     : "bg-red-100 text-red-600"
//                     }`}>
//                     <span className={`w-1.5 h-1.5 rounded-full ${record.status === "Active" ? "bg-green-500" : "bg-red-500"}`} />
//                     {record.status}
//                 </span>
//             ),
//         },
//         {
//             title: 'Description',
//             key: 'description',
//             render: (_, record) => (
//                 <div>
//                     <p className={` mt-0.5 truncate max-w-[220px] ${darkLight ? "text-gray-400" : "text-gray-500"}`}>
//                         {record.description}
//                     </p>
//                 </div>
//             ),
//         },
//         {
//             title: 'Actions',
//             key: 'actions',
//             align: 'center',
//             width: 130,
//             render: (_, record) => (
//                 <div className="flex gap-2 justify-center">
//                     {/* <ComponentPermission scopes={["branch:update"]}> */}
//                     <button onClick={() => handleEdit(record)}
//                         className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors cursor-pointer">
//                         Edit
//                     </button>
//                     {/* </ComponentPermission> */}
//                     {/* <ComponentPermission scopes={["branch:delete"]}> */}
//                     <button onClick={() => handleOpenDeleteModal(record)}
//                         className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors cursor-pointer">
//                         Delete
//                     </button>
//                     {/* </ComponentPermission> */}
//                 </div>
//             ),
//         },
//     ];

//     const handleAddBranch = () => { setSelectedBranchId(undefined); setShowModal(true); };
//     const handleEdit = (record: Branch) => { setSelectedBranchId(record.id); setShowModal(true); };
//     const handleCloseModal = () => { setShowModal(false); setSelectedBranchId(undefined); };

//     const handleOpenDeleteModal = (record: Branch) => {
//         setIdDelete(record.id);
//         setShowDeleteModal(true);
//         setTimeout(() => setIsDeleteAnimating(true), 10);
//     };
//     const handleCloseDeleteModal = () => {
//         setIsDeleteAnimating(false);
//         setTimeout(() => { setShowDeleteModal(false); setIdDelete(null); }, 300);
//     };
//     const handleDeleteConfirm = async () => {
//         if (idDelete !== null) {
//             try {
//                 await DeleteData("Branch", idDelete);
//                 handleCloseDeleteModal();
//                 setRefreshTables(new Date());
//             } catch (error) {
//                 console.error("Error deleting branch:", error);
//             }
//         }
//     };

//     return (
//         <>
//             {/* Header */}
//             <div className="flex items-center justify-between gap-2 my-2">
//                 <div className="flex items-center gap-2 min-w-0">
//                     <BiGitBranch className={`w-7 h-7 sm:w-9 sm:h-9 drop-shadow-lg animate-bounce flex-shrink-0
//             ${darkLight ? "text-purple-400" : "text-purple-600"}`} />
//                     <h3 className={`font-bold text-base sm:text-2xl whitespace-nowrap ${darkLight ? 'text-white' : 'text-gray-900'}`}>
//                         BRANCH MANAGEMENT
//                     </h3>
//                 </div>
//                 <button
//                     onClick={handleAddBranch}
//                     className="bg-sky-500 hover:bg-sky-600 active:scale-95 text-white px-3 sm:px-5 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 whitespace-nowrap"
//                 >
//                     Add Branch
//                 </button>
//             </div>
//             <XDataTable
//                 TableName='Branch list'
//                 columns={columns}
//                 apiUrl='Branch'
//                 selection={true}
//                 hideAction={true}
//                 searchPlaceholder="Search..."
//             />

//             {showModal && <BranchForm branchId={selectedBranchId} onClose={handleCloseModal} />}

//             {/* Delete Modal */}
//             {showDeleteModal && (
//                 <>
//                     <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isDeleteAnimating ? "opacity-100" : "opacity-0"}`}
//                         onClick={handleCloseDeleteModal} />
//                     <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none transition-all duration-300 ${isDeleteAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
//                         <div className={`rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto transform transition-all duration-300
//                             ${darkLight ? "bg-gray-800" : "bg-white"} ${isDeleteAnimating ? "translate-y-0" : "translate-y-4"}`}
//                             onClick={e => e.stopPropagation()}>
//                             <div className="p-6 text-center">
//                                 <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
//                                     <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                     </svg>
//                                 </div>
//                                 <h3 className={`text-xl font-bold mb-2 ${darkLight ? "text-white" : "text-gray-900"}`}>Confirm Deletion</h3>
//                                 <p className={`mb-6 ${darkLight ? "text-gray-300" : "text-gray-600"}`}>
//                                     This action cannot be undone. Products assigned to this branch will not be deleted.
//                                 </p>
//                                 <div className="flex justify-center gap-3">
//                                     <button onClick={handleCloseDeleteModal}
//                                         className={`px-6 py-2.5 rounded-lg font-medium transition-all ${darkLight ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
//                                         Cancel
//                                     </button>
//                                     <button onClick={handleDeleteConfirm}
//                                         className="px-6 py-2.5 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition-all">
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

// export default BranchList;




import type { TableColumnsType } from 'antd';
import XDataTable from '../../component/XDataTable/XDataTable';
import "../../component/XDataTable/XdataTable.css";
import { BiGitBranch } from 'react-icons/bi';
import { useState } from 'react';
import { useGlobleContextDarklight, useRefreshTable } from '../../AllContext/context';
import { HookIntergrateAPI } from '../../component/HookintagrateAPI/HookintegarteApi';
import { AxiosApi } from '../../component/Axios/Axios';
// import ComponentPermission from '../../component/ProtextRoute/ComponentPermissions';
import BranchForm from './Branchform';

interface Branch {
    id: number;
    branchName: string;
    logo: string;
    status: string;
    description: string;
    isDeleted: boolean;
    createdDate: string;
    updatedDate: string;
    createdBy: string;
}

const BranchList = () => {
    const { darkLight } = useGlobleContextDarklight();
    const [showModal, setShowModal] = useState(false);
    const [selectedBranchId, setSelectedBranchId] = useState<number | undefined>(undefined);
    const [recordToDelete, setRecordToDelete] = useState<Branch | null>(null); // ✅ Store ទាំង Record (មាន logo)
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleteAnimating, setIsDeleteAnimating] = useState(false);
    const { DeleteData } = HookIntergrateAPI();
    const { setRefreshTables } = useRefreshTable();

    const columns: TableColumnsType<Branch> = [
        {
            title: 'Logo',
            key: 'Logo',
            width: 70,
            align: 'center',
            render: (_, record) => (
                record.logo
                    ? <img src={record.logo} alt={""}
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://yokohama-soei-fc.com/wpdata/wp-content/uploads/2022/03/noimage.png"; }}
                        className="w-10 h-10 rounded-lg object-cover mx-auto" />
                    : <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto text-lg font-bold
                        ${darkLight ? "bg-gray-700 text-gray-400" : "bg-purple-100 text-purple-500"}`}>
                        {record.branchName?.charAt(0).toUpperCase()}
                    </div>
            ),
        },
        {
            title: 'Branch Name',
            key: 'branchName',
            render: (_, record) => (
                <div>
                    <p className={`font-semibold text-sm ${darkLight ? "text-white" : "text-gray-800"}`}>{record.branchName}</p>
                </div>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            align: 'center',
            render: (_, record) => (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${record.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${record.status === "Active" ? "bg-green-500" : "bg-red-500"}`} />
                    {record.status}
                </span>
            ),
        },
        {
            title: 'Description',
            key: 'description',
            render: (_, record) => (
                <div>
                    <p className={`mt-0.5 truncate max-w-[220px] ${darkLight ? "text-gray-400" : "text-gray-500"}`}>
                        {record.description}
                    </p>
                </div>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            width: 130,
            render: (_, record) => (
                <div className="flex gap-2 justify-center">
                    {/* <ComponentPermission scopes={["branch:update"]}> */}
                    <button onClick={() => handleEdit(record)}
                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors cursor-pointer">
                        Edit
                    </button>
                    {/* </ComponentPermission> */}
                    {/* <ComponentPermission scopes={["branch:delete"]}> */}
                    <button onClick={() => handleOpenDeleteModal(record)}
                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors cursor-pointer">
                        Delete
                    </button>
                    {/* </ComponentPermission> */}
                </div>
            ),
        },
    ];

    const handleAddBranch = () => { setSelectedBranchId(undefined); setShowModal(true); };
    const handleEdit = (record: Branch) => { setSelectedBranchId(record.id); setShowModal(true); };
    const handleCloseModal = () => { setShowModal(false); setSelectedBranchId(undefined); };

    const handleOpenDeleteModal = (record: Branch) => {
        setRecordToDelete(record); // ✅ Store ទាំង Record (ដើម្បីយក logo)
        setShowDeleteModal(true);
        setTimeout(() => setIsDeleteAnimating(true), 10);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteAnimating(false);
        setTimeout(() => { setShowDeleteModal(false); setRecordToDelete(null); }, 300);
    };

    const handleDeleteConfirm = async () => {
        if (!recordToDelete) return;
        try {
            // 1️⃣ Delete រូបភាព ដំបូង (បើ Branch មានរូបភាព)
            if (recordToDelete.logo) {
                try {
                    await AxiosApi.delete(`FileStorage/delete?fileUrl=${encodeURIComponent(recordToDelete.logo)}`);
                } catch (error) {
                    console.error("Image delete failed (non-blocking):", error);
                    // ✅ មិន Stop ទេ — Delete Record ដដែល
                }
            }

            // 2️⃣ Delete Record
            await DeleteData("Branch", recordToDelete.id);
            handleCloseDeleteModal();
            setRefreshTables(new Date());
        } catch (error) {
            console.error("Error deleting branch:", error);
        }
    };

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between gap-2 my-2">
                <div className="flex items-center gap-2 min-w-0">
                    <BiGitBranch className={`w-7 h-7 sm:w-9 sm:h-9 drop-shadow-lg animate-bounce flex-shrink-0
                        ${darkLight ? "text-purple-400" : "text-purple-600"}`} />
                    <h3 className={`font-bold text-base sm:text-2xl whitespace-nowrap ${darkLight ? 'text-white' : 'text-gray-900'}`}>
                        BRANCH MANAGEMENT
                    </h3>
                </div>
                <button onClick={handleAddBranch}
                    className="bg-sky-500 hover:bg-sky-600 active:scale-95 text-white px-3 sm:px-5 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 whitespace-nowrap">
                    Add Branch
                </button>
            </div>

            <XDataTable
                TableName='Branch list'
                columns={columns}
                apiUrl='Branch'
                selection={true}
                hideAction={true}
                searchPlaceholder="Search..."
            />

            {showModal && <BranchForm branchId={selectedBranchId} onClose={handleCloseModal} />}

            {/* Delete Modal */}
            {showDeleteModal && (
                <>
                    <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isDeleteAnimating ? "opacity-100" : "opacity-0"}`}
                        onClick={handleCloseDeleteModal} />
                    <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none transition-all duration-300 ${isDeleteAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                        <div className={`rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto transform transition-all duration-300
                            ${darkLight ? "bg-gray-800" : "bg-white"} ${isDeleteAnimating ? "translate-y-0" : "translate-y-4"}`}
                            onClick={e => e.stopPropagation()}>
                            <div className="p-6 text-center">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                                    <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                                <h3 className={`text-xl font-bold mb-2 ${darkLight ? "text-white" : "text-gray-900"}`}>Confirm Deletion</h3>
                                <p className={`mb-6 ${darkLight ? "text-gray-300" : "text-gray-600"}`}>
                                    This action cannot be undone. Products assigned to this branch will not be deleted.
                                </p>
                                <div className="flex justify-center gap-3">
                                    <button onClick={handleCloseDeleteModal}
                                        className={`px-6 py-2.5 rounded-lg font-medium transition-all ${darkLight ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                                        Cancel
                                    </button>
                                    <button onClick={handleDeleteConfirm}
                                        className="px-6 py-2.5 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition-all">
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

export default BranchList;