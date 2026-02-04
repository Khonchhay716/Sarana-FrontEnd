// import { Tag, type TableColumnsType } from 'antd';
// import XDataTable from '../../component/XDataTable/XDataTable';
// import "../../component/XDataTable/XdataTable.css";
// import { BiUser } from 'react-icons/bi';
// import { useState } from 'react';
// import { useGlobleContextDarklight, useRefreshTable } from '../../AllContext/context';
// import { HookIntergrateAPI } from '../../component/HookintagrateAPI/HookintegarteApi';
// import LibraryMemberForm from './LibraryMemberForm';
// import AllRequestMemberForm from './AllRequestMemberForm';

// interface LibraryMember {
//     id: number;
//     personId: number;
//     membershipType: string;
//     email: string;
//     address: string;
//     phoneNumber: string;
// }

// const LibraryMemberListRequest = () => {
//     const { darkLight } = useGlobleContextDarklight();
//     const [showModal, setShowModal] = useState(false);
//     const [selectedMemberId, setSelectedMemberId] = useState<number | undefined>(undefined);
//     const [idDelete, setIdDelete] = useState<number | null>(null);
//     const [showDeleteModal, setShowDeleteModal] = useState(false);
//     const [isDeleteAnimating, setIsDeleteAnimating] = useState(false);
//     const { DeleteData } = HookIntergrateAPI();
//     const { setRefreshTables } = useRefreshTable();

//     const columns: TableColumnsType<LibraryMember> = [
//         {
//             title: 'Person Name',
//             dataIndex: 'personName',
//             key: 'personName',
//             align: 'center',
//         },
//         {
//             title: 'Membership Type',
//             dataIndex: 'membershipType',
//             key: 'membershipType',
//             render: (type) => (
//                 <span
//                     className={`px-3 py-1 rounded-full text-xs font-medium ${type === 1
//                         ? 'bg-purple-100 text-purple-700'
//                         : type === 2
//                             ? 'bg-blue-100 text-blue-700'
//                             : 'bg-gray-100 text-gray-700'
//                         }`}
//                 >
//                     {type == 1 ? "Student" : type == 2 ? "Staff" : " Teacher"}
//                 </span>
//             ),
//         },
//         {
//             title: 'Email',
//             dataIndex: 'email',
//             key: 'email',
//         },
//         {
//             title: 'Address',
//             dataIndex: 'address',
//             key: 'address',
//         },
//         {
//             title: 'Phone Number',
//             dataIndex: 'phoneNumber',
//             key: 'phoneNumber',
//         },
//         {
//             title: 'Status',
//             dataIndex: 'status',
//             key: 'status',
//             render: (status: 0 | 1 | 2 | 3) => {
//                 const statusMap = {
//                     0: { text: 'Pending', color: 'orange' },
//                     1: { text: 'Approve', color: 'green' },
//                     2: { text: 'Reject', color: 'red' },
//                     3: { text: 'Cancel', color: 'gray' },
//                 };

//                 const { text, color } = statusMap[status];
//                 return <Tag color={color}>{text}</Tag>;
//             },
//         },
//         {
//             title: '',
//             key: 'actions',
//             align: 'center',
//             width: 160, // slightly wider for two buttons
//             render: (_, record) => (
//                 <div className="flex gap-2 justify-center">
//                     <button
//                         // onClick={() => handleApprove(record)}
//                         className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-medium transition-colors cursor-pointer"
//                         title="Approve"
//                     >
//                         Approve
//                     </button>
//                     <button
//                         // onClick={() => handleReject(record)}
//                         className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors cursor-pointer"
//                         title="Reject"
//                     >
//                         Reject
//                     </button>
//                 </div>
//             ),
//         },
//         {
//             title: 'Actions',
//             key: 'actions',
//             align: 'center',
//             width: 120,
//             render: (_, record) => (
//                 <div className="flex gap-2 justify-center">
//                     <button
//                         onClick={() => handleEdit(record)}
//                         className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors cursor-pointer"
//                         title="Edit"
//                     >
//                         Edit
//                     </button>
//                     <button
//                         onClick={() => handleOpenDeleteModal(record)}
//                         className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors cursor-pointer"
//                         title="Delete"
//                     >
//                         Delete
//                     </button>
//                 </div>
//             ),
//         }
//     ];

//     const handleAddMember = () => {
//         setSelectedMemberId(undefined);
//         setShowModal(true);
//     };

//     const handleEdit = (record: LibraryMember) => {
//         setSelectedMemberId(record.id);
//         setShowModal(true);
//     };

//     const handleCloseModal = () => {
//         setShowModal(false);
//         setSelectedMemberId(undefined);
//     };

//     const handleOpenDeleteModal = (record: LibraryMember) => {
//         setIdDelete(record.id);
//         setShowDeleteModal(true);
//         setTimeout(() => setIsDeleteAnimating(true), 10);
//     };

//     const handleCloseDeleteModal = () => {
//         setIsDeleteAnimating(false);
//         setTimeout(() => {
//             setShowDeleteModal(false);
//             setIdDelete(null);
//         }, 300);
//     };

//     const handleDeleteConfirm = async () => {
//         if (idDelete !== null) {
//             try {
//                 await DeleteData("LibraryMember", idDelete);
//                 handleCloseDeleteModal();
//                 setRefreshTables(new Date());
//             } catch (error) {
//                 console.error("Error deleting library member:", error);
//             }
//         }
//     };

//     return (
//         <>
//             <div className='flex justify-between my-2'>
//                 <div className='flex items-center gap-3'>
//                     <div className="relative">
//                         <BiUser className="w-[50px] h-[40px] drop-shadow-lg animate-bounce" />
//                     </div>
//                     <h3 className={`font-bold text-2xl ${darkLight ? 'text-white' : 'text-gray-900'}`}>
//                         LIBRARY MEMBER MANAGEMENT
//                     </h3>
//                 </div>
//                 <button
//                     onClick={handleAddMember}
//                     className='bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-md transition-colors'
//                 >
//                     Add Member Request
//                 </button>
//             </div>

//             <XDataTable
//                 TableName='Library Member list'
//                 columns={columns}
//                 apiUrl='LibraryMember'
//                 selection={true}
//                 hideAction={true}
//                 searchPlaceholder="Search members..."
//             />

//             {showModal && (
//                 <AllRequestMemberForm
//                     memberId={selectedMemberId}
//                     onClose={handleCloseModal}
//                 />
//             )}

//             {/* Delete Modal */}
//             {showDeleteModal && (
//                 <>
//                     <div
//                         className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isDeleteAnimating ? "opacity-100" : "opacity-0"
//                             }`}
//                         onClick={handleCloseDeleteModal}
//                     />
//                     <div
//                         className={`fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none transition-all duration-300 ${isDeleteAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
//                             }`}
//                     >
//                         <div
//                             className={`rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto transform transition-all duration-300 ${darkLight ? "bg-gray-800" : "bg-white"
//                                 } ${isDeleteAnimating ? 'translate-y-0' : 'translate-y-4'}`}
//                             onClick={(e) => e.stopPropagation()}
//                         >
//                             <div className="p-6 text-center">
//                                 <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
//                                     <svg
//                                         className="h-8 w-8 text-red-600"
//                                         fill="none"
//                                         viewBox="0 0 24 24"
//                                         stroke="currentColor"
//                                     >
//                                         <path
//                                             strokeLinecap="round"
//                                             strokeLinejoin="round"
//                                             strokeWidth={2}
//                                             d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//                                         />
//                                     </svg>
//                                 </div>
//                                 <h3 className={`text-xl font-bold mb-2 ${darkLight ? 'text-white' : 'text-gray-900'}`}>
//                                     Confirm Deletion
//                                 </h3>
//                                 <p className={`mb-6 ${darkLight ? 'text-gray-300' : 'text-gray-600'}`}>
//                                     This action cannot be undone. Do you want to delete this member?
//                                 </p>
//                                 <div className="flex justify-center gap-3">
//                                     <button
//                                         onClick={handleCloseDeleteModal}
//                                         className={`px-6 py-2.5 rounded-lg font-medium transition-all ${darkLight
//                                             ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
//                                             : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                                             }`}
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

// export default LibraryMemberListRequest;



import { Tag, type TableColumnsType } from 'antd';
import XDataTable from '../../component/XDataTable/XDataTable';
import "../../component/XDataTable/XdataTable.css";
import { BiUser } from 'react-icons/bi';
import { useState } from 'react';
import { useGlobleContextDarklight, useRefreshTable } from '../../AllContext/context';
import { HookIntergrateAPI } from '../../component/HookintagrateAPI/HookintegarteApi';
import LibraryMemberForm from './LibraryMemberForm';
import AllRequestMemberForm from './AllRequestMemberForm';

interface LibraryMember {
    id: number;
    personId: number;
    membershipType: string;
    email: string;
    address: string;
    phoneNumber: string;
}

const LibraryMemberListRequest = () => {
    const { darkLight } = useGlobleContextDarklight();
    const [showModal, setShowModal] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState<number | undefined>(undefined);
    const [idDelete, setIdDelete] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleteAnimating, setIsDeleteAnimating] = useState(false);

    // Approve Modal States
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [isApproveAnimating, setIsApproveAnimating] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<LibraryMember | null>(null);

    // Reject Modal States
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [isRejectAnimating, setIsRejectAnimating] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const { DeleteData, createData } = HookIntergrateAPI();
    const { setRefreshTables } = useRefreshTable();

    const columns: TableColumnsType<LibraryMember> = [
        {
            title: 'Person Name',
            dataIndex: 'personName',
            key: 'personName',
            align: 'center',
        },
        {
            title: 'Membership Type',
            dataIndex: 'membershipType',
            key: 'membershipType',
            render: (type) => (
                <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${type === 1
                        ? 'bg-purple-100 text-purple-700'
                        : type === 2
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                >
                    {type == 1 ? "Student" : type == 2 ? "Staff" : " Teacher"}
                </span>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: 'Phone Number',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: 0 | 1 | 2 | 3) => {
                const statusMap = {
                    0: { text: 'Pending', color: 'orange' },
                    1: { text: 'Approve', color: 'green' },
                    2: { text: 'Reject', color: 'red' },
                    3: { text: 'Cancel', color: 'gray' },
                };

                const { text, color } = statusMap[status];
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: '',
            key: 'actions',
            align: 'center',
            width: 120,
            render: (_, record : any) => {
                // Only show approve/reject buttons when status is 0 (Pending)
                if (record.status !== 0) {
                    return null;
                }

                return (
                    <div className="flex gap-2 justify-center">
                        <button
                            onClick={() => handleOpenApproveModal(record)}
                            className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-medium transition-colors cursor-pointer"
                            title="Approve"
                        >
                            Approve
                        </button>
                        <button
                            onClick={() => handleOpenRejectModal(record)}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors cursor-pointer"
                            title="Reject"
                        >
                            Reject
                        </button>
                    </div>
                );
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            width: 120,
            render: (_, record) => (
                <div className="flex gap-2 justify-center">
                    <button
                        onClick={() => handleEdit(record)}
                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors cursor-pointer"
                        title="Edit"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => handleOpenDeleteModal(record)}
                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors cursor-pointer"
                        title="Delete"
                    >
                        Delete
                    </button>
                </div>
            ),
        }
    ];

    const handleAddMember = () => {
        setSelectedMemberId(undefined);
        setShowModal(true);
    };

    const handleEdit = (record: LibraryMember) => {
        setSelectedMemberId(record.id);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedMemberId(undefined);
    };

    // Approve Modal Handlers
    const handleOpenApproveModal = (record: LibraryMember) => {
        setSelectedRecord(record);
        setShowApproveModal(true);
        setTimeout(() => setIsApproveAnimating(true), 10);
    };

    const handleCloseApproveModal = () => {
        setIsApproveAnimating(false);
        setTimeout(() => {
            setShowApproveModal(false);
            setSelectedRecord(null);
        }, 300);
    };

    const handleApproveConfirm = async () => {
        if (selectedRecord) {
            try {
                await createData(`LibraryMember/${selectedRecord.id}/approve`, {});
                handleCloseApproveModal();
                setRefreshTables(new Date());
            } catch (error) {
                console.error("Error approving library member:", error);
            }
        }
    };

    // Reject Modal Handlers
    const handleOpenRejectModal = (record: LibraryMember) => {
        setSelectedRecord(record);
        setRejectReason('');
        setShowRejectModal(true);
        setTimeout(() => setIsRejectAnimating(true), 10);
    };

    const handleCloseRejectModal = () => {
        setIsRejectAnimating(false);
        setTimeout(() => {
            setShowRejectModal(false);
            setSelectedRecord(null);
            setRejectReason('');
        }, 300);
    };

    const handleRejectConfirm = async () => {
        if (selectedRecord && rejectReason.trim()) {
            try {
                await createData(`LibraryMember/${selectedRecord.id}/reject`, {
                    ...selectedRecord,
                    status: 2,
                    rejectReason: rejectReason
                });
                handleCloseRejectModal();
                setRefreshTables(new Date());
            } catch (error) {
                console.error("Error rejecting library member:", error);
            }
        }
    };

    // Delete Modal Handlers
    const handleOpenDeleteModal = (record: LibraryMember) => {
        setIdDelete(record.id);
        setShowDeleteModal(true);
        setTimeout(() => setIsDeleteAnimating(true), 10);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteAnimating(false);
        setTimeout(() => {
            setShowDeleteModal(false);
            setIdDelete(null);
        }, 300);
    };

    const handleDeleteConfirm = async () => {
        if (idDelete !== null) {
            try {
                await DeleteData("LibraryMember", idDelete);
                handleCloseDeleteModal();
                setRefreshTables(new Date());
            } catch (error) {
                console.error("Error deleting library member:", error);
            }
        }
    };

    return (
        <>
            <div className='flex justify-between my-2'>
                <div className='flex items-center gap-3'>
                    <div className="relative">
                        <BiUser className="w-[50px] h-[40px] drop-shadow-lg animate-bounce" />
                    </div>
                    <h3 className={`font-bold text-2xl ${darkLight ? 'text-white' : 'text-gray-900'}`}>
                        LIBRARY MEMBER MANAGEMENT
                    </h3>
                </div>
                <button
                    onClick={handleAddMember}
                    className='bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-md transition-colors'
                >
                    Add Member Request
                </button>
            </div>

            <XDataTable
                TableName='Library Member list'
                columns={columns}
                apiUrl='LibraryMember'
                selection={true}
                hideAction={true}
                searchPlaceholder="Search members..."
            />

            {showModal && (
                <AllRequestMemberForm
                    memberId={selectedMemberId}
                    onClose={handleCloseModal}
                />
            )}

            {/* Approve Modal */}
            {showApproveModal && (
                <>
                    <div
                        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isApproveAnimating ? "opacity-100" : "opacity-0"
                            }`}
                        onClick={handleCloseApproveModal}
                    />
                    <div
                        className={`fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none transition-all duration-300 ${isApproveAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                            }`}
                    >
                        <div
                            className={`rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto transform transition-all duration-300 ${darkLight ? "bg-gray-800" : "bg-white"
                                } ${isApproveAnimating ? 'translate-y-0' : 'translate-y-4'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 text-center">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                                    <svg
                                        className="h-8 w-8 text-green-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <h3 className={`text-xl font-bold mb-2 ${darkLight ? 'text-white' : 'text-gray-900'}`}>
                                    Confirm Approval
                                </h3>
                                <p className={`mb-6 ${darkLight ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Are you sure you want to approve this member request?
                                </p>
                                <div className="flex justify-center gap-3">
                                    <button
                                        onClick={handleCloseApproveModal}
                                        className={`px-6 py-2.5 rounded-lg font-medium transition-all ${darkLight
                                            ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            }`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleApproveConfirm}
                                        className="px-6 py-2.5 rounded-lg font-medium bg-green-500 text-white hover:bg-green-600 transition-all"
                                    >
                                        Yes, Approve
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Reject Modal with Reason */}
            {showRejectModal && (
                <>
                    <div
                        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isRejectAnimating ? "opacity-100" : "opacity-0"
                            }`}
                        onClick={handleCloseRejectModal}
                    />
                    <div
                        className={`fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none transition-all duration-300 ${isRejectAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                            }`}
                    >
                        <div
                            className={`rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto transform transition-all duration-300 ${darkLight ? "bg-gray-800" : "bg-white"
                                } ${isRejectAnimating ? 'translate-y-0' : 'translate-y-4'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="text-center mb-4">
                                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                                        <svg
                                            className="h-8 w-8 text-red-600"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className={`text-xl font-bold mb-2 ${darkLight ? 'text-white' : 'text-gray-900'}`}>
                                        Reject Member Request
                                    </h3>
                                    <p className={`mb-4 ${darkLight ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Please provide a reason for rejection
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <label
                                        htmlFor="rejectReason"
                                        className={`block text-sm font-medium mb-2 ${darkLight ? 'text-gray-200' : 'text-gray-700'}`}
                                    >
                                        Reason for Rejection <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="rejectReason"
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        rows={4}
                                        className={`w-full px-4 py-2 rounded-lg border transition-colors resize-none ${darkLight
                                            ? 'bg-gray-700 border-gray-600 text-white focus:border-red-500'
                                            : 'bg-white border-gray-300 text-gray-900 focus:border-red-500'
                                            } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
                                        placeholder="Enter the reason for rejecting this request..."
                                    />
                                    {rejectReason.trim() === '' && (
                                        <p className="mt-1 text-xs text-red-500">
                                            Reason is required
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-center gap-3">
                                    <button
                                        onClick={handleCloseRejectModal}
                                        className={`px-6 py-2.5 rounded-lg font-medium transition-all ${darkLight
                                            ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            }`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleRejectConfirm}
                                        disabled={!rejectReason.trim()}
                                        className={`px-6 py-2.5 rounded-lg font-medium transition-all ${!rejectReason.trim()
                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                            : 'bg-red-500 text-white hover:bg-red-600'
                                            }`}
                                    >
                                        Confirm Rejection
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <>
                    <div
                        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isDeleteAnimating ? "opacity-100" : "opacity-0"
                            }`}
                        onClick={handleCloseDeleteModal}
                    />
                    <div
                        className={`fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none transition-all duration-300 ${isDeleteAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                            }`}
                    >
                        <div
                            className={`rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto transform transition-all duration-300 ${darkLight ? "bg-gray-800" : "bg-white"
                                } ${isDeleteAnimating ? 'translate-y-0' : 'translate-y-4'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 text-center">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                                    <svg
                                        className="h-8 w-8 text-red-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                    </svg>
                                </div>
                                <h3 className={`text-xl font-bold mb-2 ${darkLight ? 'text-white' : 'text-gray-900'}`}>
                                    Confirm Deletion
                                </h3>
                                <p className={`mb-6 ${darkLight ? 'text-gray-300' : 'text-gray-600'}`}>
                                    This action cannot be undone. Do you want to delete this member?
                                </p>
                                <div className="flex justify-center gap-3">
                                    <button
                                        onClick={handleCloseDeleteModal}
                                        className={`px-6 py-2.5 rounded-lg font-medium transition-all ${darkLight
                                            ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            }`}
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

export default LibraryMemberListRequest;