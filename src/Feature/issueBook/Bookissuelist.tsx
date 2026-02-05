// import type { TableColumnsType } from 'antd';
// import { message } from 'antd';
// import { useState, useCallback } from 'react';
// import {
//     BiBookReader,
//     BiRefresh,
//     BiArrowBack,
//     BiShow,
//     BiX,
//     BiCalendar,
//     BiUser,
//     BiBook,
//     BiNote
// } from 'react-icons/bi';

// import XDataTable from '../../component/XDataTable/XDataTable';
// import BookIssueForm from './Bookissueform';
// import { HookIntergrateAPI } from '../../component/HookintagrateAPI/HookintegarteApi';
// import { useGlobleContextDarklight, useRefreshTable } from '../../AllContext/context';

// import "../../component/XDataTable/XdataTable.css";

// // ============================================================================
// // TYPE DEFINITIONS
// // ============================================================================

// interface BookIssue {
//     id: number;
//     bookId: number;
//     bookTitle: string;
//     bookAuthor: string;
//     libraryMemberId: number;
//     memberName: string;
//     membershipNo: string;
//     issueDate: string;
//     dueDate: string;
//     returnDate: string | null;
//     status: string;
//     daysOverdue: number;
//     notes: string;
// }

// type ModalType = 'create' | 'view' | 'return' | 'renew' | 'delete' | null;

// // ============================================================================
// // HELPER COMPONENTS
// // ============================================================================

// interface DetailRowProps {
//     icon: React.ReactNode;
//     label: string;
//     value: string;
// }

// const DetailRow: React.FC<DetailRowProps> = ({ icon, label, value }) => (
//     <div className="flex flex-col">
//         <span className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-1">
//             {icon} {label}
//         </span>
//         <span className="text-sm font-medium">{value || 'N/A'}</span>
//     </div>
// );

// interface ModalWrapperProps {
//     isOpen: boolean;
//     onClose: () => void;
//     darkLight: boolean;
//     children: React.ReactNode;
//     zIndex?: number;
// }

// const ModalWrapper: React.FC<ModalWrapperProps> = ({
//     isOpen,
//     onClose,
//     darkLight,
//     children,
//     zIndex = 100
// }) => {
//     if (!isOpen) return null;

//     return (
//         <div
//             className={`fixed inset-0 z-[${zIndex}] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm`}
//             onClick={onClose}
//         >
//             <div
//                 onClick={(e) => e.stopPropagation()}
//                 className={`w-full max-w-md rounded-xl shadow-2xl overflow-hidden ${darkLight ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
//                     }`}
//             >
//                 {children}
//             </div>
//         </div>
//     );
// };

// // ============================================================================
// // MAIN COMPONENT
// // ============================================================================

// const BookIssueList: React.FC = () => {
//     const { darkLight } = useGlobleContextDarklight();
//     const { createData, DeleteData } = HookIntergrateAPI();
//     const { setRefreshTables } = useRefreshTable();

//     // ========================================================================
//     // STATE MANAGEMENT
//     // ========================================================================

//     const [activeModal, setActiveModal] = useState<ModalType>(null);
//     const [activeRecord, setActiveRecord] = useState<BookIssue | null>(null);
//     const [newDueDate, setNewDueDate] = useState<string>('');
//     const [loading, setLoading] = useState<boolean>(false);

//     // ========================================================================
//     // MODAL HANDLERS
//     // ========================================================================

//     const openModal = useCallback((type: ModalType, record?: BookIssue) => {
//         if (type == "return" && record?.dueDate) {
//             const today = new Date();
//             const dueDate = new Date(record?.dueDate);
//             // const dueDate = new Date("2026-02-01");
//             console.log("due date is ", dueDate);
//             if (today > dueDate) {
//                 const diffTime = today.getTime() - dueDate.getTime();
//                 const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//                 console.log("Overdue days:", diffDays);

//                 const fine = diffDays * 2;
//                 console.log("Fine $:", fine);
//             } else {
//                 console.log("Book is not overdue");
//             }
//         }
//         setActiveModal(type);
//         setActiveRecord(record || null);
//         setNewDueDate('');
//     }, []);

//     const closeModal = useCallback(() => {
//         setActiveModal(null);
//         setActiveRecord(null);
//         setNewDueDate('');
//     }, []);

//     // ========================================================================
//     // ACTION HANDLERS
//     // ========================================================================

//     const handleReturnBook = async () => {
//         if (!activeRecord) {
//             message.error('No record selected');
//             return;
//         }

//         setLoading(true);
//         try {
//             await createData(`BookIssue/${activeRecord.id}/return`, {
//                 id: activeRecord.id,
//                 notes: "Returned"
//             }, () => {
//                 message.success("Book returned successfully");
//                 closeModal();
//             });
//         } catch (error) {
//             console.error('Error returning book:', error);
//             message.error("Failed to return book. Please try again.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleRenewBook = async () => {
//         if (!activeRecord) {
//             message.error('No record selected');
//             return;
//         }

//         if (!newDueDate) {
//             message.warning('Please select a new due date');
//             return;
//         }

//         // Validate that new due date is in the future
//         const selectedDate = new Date(newDueDate);
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         if (selectedDate <= today) {
//             message.warning('New due date must be in the future');
//             return;
//         }

//         setLoading(true);
//         try {
//             await createData(`BookIssue/${activeRecord.id}/renew`, {
//                 id: activeRecord.id,
//                 newDueDate: selectedDate.toISOString(),
//                 notes: "Renewed"
//             }, () => {
//                 message.success("Book renewed successfully");
//                 closeModal();
//             }
//             );

//         } catch (error) {
//             console.error('Error renewing book:', error);
//             message.error("Failed to renew book. Please try again.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleDeleteRecord = async () => {
//         if (!activeRecord) {
//             message.error('No record selected');
//             return;
//         }

//         setLoading(true);
//         try {
//             await DeleteData(`BookIssue`, activeRecord.id);
//             message.success("Record deleted successfully");
//             closeModal();
//         } catch (error) {
//             console.error('Error deleting record:', error);
//             message.error("Failed to delete record. Please try again.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     // ========================================================================
//     // UTILITY FUNCTIONS
//     // ========================================================================

//     const formatDate = (dateString: string | null): string => {
//         if (!dateString) return 'N/A';
//         try {
//             return new Date(dateString).toLocaleDateString();
//         } catch {
//             return 'Invalid Date';
//         }
//     };

//     const getMinDate = (): string => {
//         const tomorrow = new Date();
//         tomorrow.setDate(tomorrow.getDate() + 1);
//         return tomorrow.toISOString().split('T')[0];
//     };

//     // ========================================================================
//     // TABLE CONFIGURATION
//     // ========================================================================

//     const columns: TableColumnsType<BookIssue> = [
//         {
//             title: 'Book Title',
//             key: 'bookTitle',
//             render: (_, record) => record.bookTitle || 'N/A',
//             width: '25%'
//         },
//         {
//             title: 'Member Name',
//             key: 'memberName',
//             render: (_, record) => record.memberName || 'N/A',
//             width: '20%'
//         },
//         {
//             title: 'Issue Date',
//             key: 'issueDate',
//             render: (_, record) => formatDate(record.issueDate),
//             width: '15%'
//         },
//         {
//             title: 'Due Date',
//             key: 'dueDate',
//             render: (_, record) => formatDate(record.dueDate),
//             width: '15%'
//         },
//         {
//             title: 'Status',
//             key: 'status',
//             align: 'center' as const,
//             width: '10%',
//             render: (_, record) => {
//                 const status = record.status;

//                 const statusStyle: Record<string, string> = {
//                     Issued:
//                         'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-600',
//                     Renewed:
//                         'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
//                     Returned:
//                         'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
//                 };

//                 return (
//                     <span
//                         className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle[status] ?? 'bg-gray-100 text-gray-700'
//                             }`}
//                     >
//                         {status}
//                     </span>
//                 );
//             },
//         },
//         {
//             title: 'Actions',
//             key: 'actions',
//             align: 'right' as const,
//             render: (_, record) => (
//                 <div className="flex gap-2 justify-end items-center">
//                     {!record.returnDate && (
//                         <>
//                             <button
//                                 onClick={() => openModal('return', record)}
//                                 className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[11px] flex items-center gap-1 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
//                                 disabled={loading}
//                                 title="Return Book"
//                             >
//                                 <BiArrowBack /> Return
//                             </button>
//                             <button
//                                 onClick={() => openModal('renew', record)}
//                                 className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded text-[11px] flex items-center gap-1 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
//                                 disabled={loading}
//                                 title="Renew Book"
//                             >
//                                 <BiRefresh /> Renew
//                             </button>
//                         </>
//                     )}
//                     <button
//                         onClick={() => openModal('view', record)}
//                         className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-[11px] flex items-center gap-1 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
//                         disabled={loading}
//                         title="View Details"
//                     >
//                         <BiShow /> View
//                     </button>
//                     {/* <button
//                         onClick={() => openModal('delete', record)}
//                         className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-[11px] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
//                         disabled={loading}
//                         title="Delete Record"
//                     >
//                         Delete
//                     </button> */}
//                 </div>
//             ),
//         }
//     ];

//     // ========================================================================
//     // RENDER
//     // ========================================================================

//     return (
//         <div className="p-4 min-h-screen">
//             {/* Header Section */}
//             <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
//                 <div className='flex items-center gap-3'>
//                     <BiBookReader size={32} className="text-sky-500" />
//                     <h3 className={`font-bold text-2xl ${darkLight ? 'text-white' : 'text-gray-800'
//                         }`}>
//                         BOOK ISSUE MANAGEMENT
//                     </h3>
//                 </div>
//                 <button
//                     onClick={() => openModal('create')}
//                     className='bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2'
//                 >
//                     <BiBook size={18} />
//                     Issue Book
//                 </button>
//             </div>

//             {/* Data Table */}
//             <XDataTable
//                 TableName='Book Issue List'
//                 columns={columns}
//                 apiUrl='BookIssue'
//                 hideAction={true}
//             />

//             {/* ================================================================ */}
//             {/* MODALS */}
//             {/* ================================================================ */}

//             {/* CREATE MODAL */}
//             {activeModal === 'create' && (
//                 <BookIssueForm onClose={closeModal} />
//             )}

// {/* VIEW DETAILS MODAL */}
// {activeModal === 'view' && activeRecord && (
//     <ModalWrapper
//         isOpen={true}
//         onClose={closeModal}
//         darkLight={darkLight}
//         zIndex={100}
//     >
//         <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
//             <h2 className="text-lg font-bold flex items-center gap-2">
//                 <BiShow className="text-blue-500" size={22} />
//                 Book Issue Details
//             </h2>
//             <button
//                 onClick={closeModal}
//                 className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
//             >
//                 <BiX size={24} />
//             </button>
//         </div>

//         <div className="p-6 space-y-5">
//             <DetailRow
//                 icon={<BiBook className="text-sky-500" />}
//                 label="Book Title"
//                 value={activeRecord.bookTitle}
//             />
//             <DetailRow
//                 icon={<BiUser className="text-emerald-500" />}
//                 label="Author"
//                 value={activeRecord.bookAuthor}
//             />
//             <DetailRow
//                 icon={<BiUser className="text-purple-500" />}
//                 label="Member Name"
//                 value={activeRecord.memberName}
//             />
//             <DetailRow
//                 icon={<BiUser className="text-indigo-500" />}
//                 label="Membership No"
//                 value={activeRecord.membershipNo}
//             />

//             <div className="grid grid-cols-2 gap-4 pt-2">
//                 <DetailRow
//                     icon={<BiCalendar className="text-blue-500" />}
//                     label="Issue Date"
//                     value={formatDate(activeRecord.issueDate)}
//                 />
//                 <DetailRow
//                     icon={<BiCalendar className="text-orange-500" />}
//                     label="Due Date"
//                     value={formatDate(activeRecord.dueDate)}
//                 />
//             </div>

//             {activeRecord.returnDate && (
//                 <DetailRow
//                     icon={<BiCalendar className="text-green-500" />}
//                     label="Return Date"
//                     value={formatDate(activeRecord.returnDate)}
//                 />
//             )}

//             <div className={`mt-4 p-4 rounded-lg ${darkLight ? 'bg-gray-700/50' : 'bg-gray-50'
//                 }`}>
//                 <p className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1 mb-2">
//                     <BiNote /> Status
//                 </p>
//                 <p className="text-sm mb-2">
//                     <span className="font-semibold">Status:</span> {activeRecord.status || "N/A"}
//                 </p>
//             </div>
//         </div>

//         <div className={`p-4 flex justify-end border-t ${darkLight ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
//             }`}>
//             <button
//                 onClick={closeModal}
//                 className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
//             >
//                 Close
//             </button>
//         </div>
//     </ModalWrapper>
// )}

//             {/* RETURN CONFIRMATION MODAL */}
//             {activeModal === 'return' && activeRecord && (
//                 <ModalWrapper
//                     isOpen={true}
//                     onClose={closeModal}
//                     darkLight={darkLight}
//                     zIndex={110}
//                 >
//                     <div className="p-6">
//                         <div className="text-center mb-6">
//                             <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
//                                 <BiArrowBack className="text-emerald-600 dark:text-emerald-400" size={32} />
//                             </div>
//                             <h4 className="font-bold text-xl mb-2">Confirm Book Return</h4>
//                             <p className="text-sm text-gray-500 dark:text-gray-400">
//                                 Are you sure you want to mark this book as returned?
//                             </p>
//                         </div>

//                         <div className="flex gap-3 justify-end">
//                             <button
//                                 onClick={closeModal}
//                                 className="px-5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
//                                 disabled={loading}
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={handleReturnBook}
//                                 className="px-5 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//                                 disabled={loading}
//                             >
//                                 {loading ? (
//                                     <>
//                                         <span className="animate-spin">⏳</span>
//                                         Processing...
//                                     </>
//                                 ) : (
//                                     <>
//                                         <BiArrowBack />
//                                         Confirm Return
//                                     </>
//                                 )}
//                             </button>
//                         </div>
//                     </div>
//                 </ModalWrapper>
//             )}

//             {/* RENEW MODAL */}
//             {activeModal === 'renew' && activeRecord && (
//                 <ModalWrapper
//                     isOpen={true}
//                     onClose={closeModal}
//                     darkLight={darkLight}
//                     zIndex={110}
//                 >
//                     <div className="p-6">
//                         <div className="text-center mb-6">
//                             <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
//                                 <BiRefresh className="text-orange-600 dark:text-orange-400" size={32} />
//                             </div>
//                             <h4 className="font-bold text-xl mb-2">Renew Book Issue</h4>
//                             <p className="text-sm text-gray-500 dark:text-gray-400">
//                                 Select a new due date for this book
//                             </p>
//                         </div>

//                         <div className={`p-4 rounded-lg mb-4 ${darkLight ? 'bg-gray-700/50' : 'bg-gray-50'
//                             }`}>
//                             <p className="text-sm font-semibold mb-1">
//                                 {activeRecord.bookTitle}
//                             </p>
//                             <p className="text-xs text-gray-500">
//                                 Current Due Date: {formatDate(activeRecord.dueDate)}
//                             </p>
//                         </div>

//                         <div className="mb-6">
//                             <label className="block text-sm font-medium mb-2">
//                                 New Due Date
//                             </label>
//                             <input
//                                 type="date"
//                                 min={getMinDate()}
//                                 className={`w-full p-3 border rounded-lg transition-colors ${darkLight
//                                     ? 'bg-gray-700 border-gray-600 text-white'
//                                     : 'bg-white border-gray-300 text-gray-900'
//                                     }`}
//                                 onChange={(e) => setNewDueDate(e.target.value)}
//                                 value={newDueDate}
//                             />
//                         </div>

//                         <div className="flex gap-3 justify-end">
//                             <button
//                                 onClick={closeModal}
//                                 className="px-5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
//                                 disabled={loading}
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={handleRenewBook}
//                                 className="px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//                                 disabled={loading || !newDueDate}
//                             >
//                                 {loading ? (
//                                     <>
//                                         <span className="animate-spin">⏳</span>
//                                         Processing...
//                                     </>
//                                 ) : (
//                                     <>
//                                         <BiRefresh />
//                                         Confirm Renewal
//                                     </>
//                                 )}
//                             </button>
//                         </div>
//                     </div>
//                 </ModalWrapper>
//             )}

//             {/* DELETE CONFIRMATION MODAL */}
//             {activeModal === 'delete' && activeRecord && (
//                 <ModalWrapper
//                     isOpen={true}
//                     onClose={closeModal}
//                     darkLight={darkLight}
//                     zIndex={110}
//                 >
//                     <div className="p-6">
//                         <div className="text-center mb-6">
//                             <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
//                                 <BiX className="text-red-600 dark:text-red-400" size={40} />
//                             </div>
//                             <h4 className="font-bold text-xl mb-2 text-red-600 dark:text-red-400">
//                                 Delete Record
//                             </h4>
//                             <p className="text-sm text-gray-500 dark:text-gray-400">
//                                 This action cannot be undone. Are you sure?
//                             </p>
//                         </div>

//                         <div className="flex gap-3 justify-end">
//                             <button
//                                 onClick={closeModal}
//                                 className="px-5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
//                                 disabled={loading}
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={handleDeleteRecord}
//                                 className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//                                 disabled={loading}
//                             >
//                                 {loading ? (
//                                     <>
//                                         <span className="animate-spin">⏳</span>
//                                         Deleting...
//                                     </>
//                                 ) : (
//                                     'Delete Record'
//                                 )}
//                             </button>
//                         </div>
//                     </div>
//                 </ModalWrapper>
//             )}
//         </div>
//     );
// };

// export default BookIssueList;



import type { TableColumnsType } from 'antd';
import { message } from 'antd';
import { useState, useCallback } from 'react';
import { BiBookReader, BiRefresh, BiShow, BiX, BiCalendar, BiUser, BiBook, BiNote, BiDollar } from 'react-icons/bi';
import XDataTable from '../../component/XDataTable/XDataTable';
import BookIssueForm from './Bookissueform';
import { HookIntergrateAPI } from '../../component/HookintagrateAPI/HookintegarteApi';
import { useGlobleContextDarklight, useRefreshTable } from '../../AllContext/context';
import "../../component/XDataTable/XdataTable.css";

interface BookIssue {
    id: number;
    bookId: number;
    bookTitle: string;
    bookAuthor: string;
    libraryMemberId: number;
    memberName: string;
    membershipNo: string;
    issueDate: string;
    dueDate: string;
    returnDate: string | null;
    status: string;
    daysOverdue: number;
    notes: string;
}

type ModalType = 'create' | 'view' | 'return' | 'renew' | 'delete' | 'penalty' | null;

interface PenaltyInfo {
    overdueDays: number;
    penaltyPerDay: number;
    totalPenalty: number;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface DetailRowProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 py-2">
        <div className="text-blue-500 mt-0.5">{icon}</div>
        <div className="flex-1">
            <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
            <div className="font-medium">{value || 'N/A'}</div>
        </div>
    </div>
);

interface ModalWrapperProps {
    isOpen: boolean;
    onClose: () => void;
    darkLight: boolean;
    children: React.ReactNode;
    zIndex?: number;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({
    isOpen,
    onClose,
    darkLight,
    children,
    zIndex = 100
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed mt-15 inset-0 flex items-center justify-center p-4"
            style={{ zIndex }}
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/60" />
            <div
                onClick={(e) => e.stopPropagation()}
                className={`relative w-full max-w-md rounded-xl shadow-2xl overflow-hidden ${darkLight ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                    }`}
            >
                {children}
            </div>
        </div>
    );
};

const BookIssueList: React.FC = () => {
    const { darkLight } = useGlobleContextDarklight();
    const { createData, DeleteData } = HookIntergrateAPI();
    const { setRefreshTables } = useRefreshTable();

    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [activeRecord, setActiveRecord] = useState<BookIssue | null>(null);
    const [newDueDate, setNewDueDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [penaltyInfo, setPenaltyInfo] = useState<PenaltyInfo | null>(null);

    const calculatePenalty = (dueDate: string): PenaltyInfo | null => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);

        if (today <= due) {
            return null; // Not overdue
        }

        const diffTime = today.getTime() - due.getTime();
        const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const penaltyPerDay = 2; // $2 per day
        const totalPenalty = overdueDays * penaltyPerDay;

        return {
            overdueDays,
            penaltyPerDay,
            totalPenalty
        };
    };
    const openModal = useCallback((type: ModalType, record?: BookIssue) => {
        if (type === "return" && record?.dueDate) {
            const penalty = calculatePenalty(record.dueDate);
            //   const penalty = calculatePenalty("2026-02-01");

            if (penalty) {
                setPenaltyInfo(penalty);
                setActiveModal('penalty');
                setActiveRecord(record);
                return;
            }
        }

        setActiveModal(type);
        setActiveRecord(record || null);
        setNewDueDate('');
        setPenaltyInfo(null);
    }, []);

    const closeModal = useCallback(() => {
        setActiveModal(null);
        setActiveRecord(null);
        setNewDueDate('');
        setPenaltyInfo(null);
    }, []);

    const proceedToReturn = useCallback(() => {
        setActiveModal('return');
    }, []);

    const handleReturnBook = async () => {
        if (!activeRecord) {
            message.error('No record selected');
            return;
        }

        setLoading(true);
        try {
            await createData(`BookIssue/${activeRecord.id}/return`, {
                id: activeRecord.id,
                notes: "Returned"
            }, () => {
                message.success("Book returned successfully");
                closeModal();
            });
        } catch (error) {
            console.error('Error returning book:', error);
            message.error("Failed to return book. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleRenewBook = async () => {
        if (!activeRecord) {
            message.error('No record selected');
            return;
        }

        if (!newDueDate) {
            message.warning('Please select a new due date');
            return;
        }

        const selectedDate = new Date(newDueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate <= today) {
            message.warning('New due date must be in the future');
            return;
        }

        setLoading(true);
        try {
            await createData(`BookIssue/${activeRecord.id}/renew`, {
                id: activeRecord.id,
                newDueDate: selectedDate.toISOString(),
                notes: "Renewed"
            }, () => {
                message.success("Book renewed successfully");
                closeModal();
            });
        } catch (error) {
            console.error('Error renewing book:', error);
            message.error("Failed to renew book. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRecord = async () => {
        if (!activeRecord) {
            message.error('No record selected');
            return;
        }

        setLoading(true);
        try {
            await DeleteData(`BookIssue`, activeRecord.id);
            message.success("Record deleted successfully");
            closeModal();
        } catch (error) {
            console.error('Error deleting record:', error);
            message.error("Failed to delete record. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string | null): string => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return 'Invalid Date';
        }
    };

    const getMinDate = (): string => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const columns: TableColumnsType<BookIssue> = [
        {
            title: 'Book Title',
            key: 'bookTitle',
            render: (_, record) => record.bookTitle || 'N/A',
            width: '25%'
        },
        {
            title: 'Member Name',
            key: 'memberName',
            render: (_, record) => record.memberName || 'N/A',
            width: '20%'
        },
        {
            title: 'Issue Date',
            key: 'issueDate',
            render: (_, record) => formatDate(record.issueDate),
            width: '15%'
        },
        {
            title: 'Due Date',
            key: 'dueDate',
            render: (_, record) => formatDate(record.dueDate),
            width: '15%'
        },
        {
            title: 'Status',
            key: 'status',
            align: 'center' as const,
            width: '10%',
            render: (_, record) => {
                const status = record.status;
                const statusStyle: Record<string, string> = {
                    Issued: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-600',
                    Renewed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                    Returned: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                };

                return (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusStyle[status] || 'bg-gray-100 text-gray-700'}`}>
                        {status}
                    </span>
                );
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'right' as const,
            render: (_, record) => (
                <div className="flex gap-2 justify-end">
                    {!record.returnDate && (
                        <>
                            <button
                                onClick={() => openModal('return', record)}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[11px] flex items-center gap-1 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                                title="Return Book"
                            >
                                <BiRefresh />
                                Return
                            </button>
                            <button
                                onClick={() => openModal('renew', record)}
                                className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded text-[11px] flex items-center gap-1 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                                title="Renew Book"
                            >
                                <BiCalendar />
                                Renew
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => openModal('view', record)}
                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-[11px] flex items-center gap-1 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                        title="View Details"
                    >
                        <BiShow />
                        View
                    </button>
                </div>
            ),
        }
    ];

    return (
        <div className={`p-6 ${darkLight ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
            {/* Header Section */}
            <div className='flex items-center justify-between mb-6'>
                <div className='flex items-center gap-3'>
                    <BiBookReader className='text-4xl text-sky-500' />
                    <h1 className='text-2xl font-bold'>BOOK ISSUE MANAGEMENT</h1>
                </div>
                <button
                    onClick={() => openModal('create')}
                    className='bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2'
                >
                    <BiBookReader />
                    Issue Book
                </button>
            </div>

            {/* Data Table */}
            <XDataTable
                apiUrl='BookIssue'
                columns={columns}
                hideAction={true}
            />

            {/* CREATE MODAL */}
            {activeModal === 'create' && (
                <BookIssueForm
                    onClose={closeModal}
                />
            )}

            {/* PENALTY MODAL */}
            {activeModal === 'penalty' && activeRecord && penaltyInfo && (
                <ModalWrapper isOpen={true} onClose={closeModal} darkLight={darkLight} zIndex={110}>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                                <BiDollar className="text-2xl" />
                                Overdue Penalty
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                <BiX className="text-2xl" />
                            </button>
                        </div>

                        <div className={`p-4 rounded-lg mb-4 ${darkLight ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
                            }`}>
                            <p className="text-sm mb-3">
                                <strong>Book:</strong> {activeRecord.bookTitle}
                            </p>
                            <p className="text-sm mb-3">
                                <strong>Due Date:</strong> {formatDate(activeRecord.dueDate)}
                            </p>
                            <div className="space-y-2 mt-4">
                                <div className="flex justify-between items-center py-2 border-b border-red-200 dark:border-red-800">
                                    <span className="text-sm font-medium">Overdue Days:</span>
                                    <span className="text-lg font-bold text-red-600 dark:text-red-400">
                                        {penaltyInfo.overdueDays} {penaltyInfo.overdueDays === 1 ? 'day' : 'days'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-red-200 dark:border-red-800">
                                    <span className="text-sm font-medium">Penalty per day:</span>
                                    <span className="text-lg font-bold">${penaltyInfo.penaltyPerDay}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 mt-2">
                                    <span className="text-base font-bold">Total Penalty:</span>
                                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                                        ${penaltyInfo.totalPenalty}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className={`p-3 rounded-lg mb-4 text-sm ${darkLight ? 'bg-yellow-900/20 text-yellow-300' : 'bg-yellow-50 text-yellow-800'
                            }`}>
                            ⚠️ This penalty must be paid before returning the book.
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={closeModal}
                                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${darkLight
                                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                    }`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={proceedToReturn}
                                className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                Proceed to Return
                            </button>
                        </div>
                    </div>
                </ModalWrapper>
            )}

            {/* VIEW DETAILS MODAL */}
            {activeModal === 'view' && activeRecord && (
                <ModalWrapper isOpen={true} onClose={closeModal} darkLight={darkLight}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4">📚 Book Issue Details</h2>

                        <div className="grid grid-cols-2 gap-2 mt-3">
                            <DetailRow icon={<BiBook />} label="Book Title" value={activeRecord.bookTitle} />
                            <DetailRow icon={<BiUser />} label="Author" value={activeRecord.bookAuthor} />
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3">
                            <DetailRow icon={<BiUser />} label="Member Name" value={activeRecord.memberName} />
                            <DetailRow icon={<BiNote />} label="Membership No" value={activeRecord.membershipNo} />
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3">
                            <DetailRow icon={<BiCalendar />} label="Issue Date" value={formatDate(activeRecord.issueDate)} />
                            <DetailRow icon={<BiCalendar />} label="Due Date" value={formatDate(activeRecord.dueDate)} />
                        </div>

                        {activeRecord.returnDate && (
                            <div className="mt-2">
                                <DetailRow icon={<BiCalendar />} label="Return Date" value={formatDate(activeRecord.returnDate)} />
                            </div>
                        )}

                        <div className="mt-4 p-3 bg-gray-100 dark:bg-blue-500 rounded-lg">
                            <div className="font-medium">Status: {activeRecord.status || "N/A"}</div>
                        </div>

                        <button
                            onClick={closeModal}
                            className="w-full mt-6 px-4 py-2.5 bg-red-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </ModalWrapper>
            )}

            {/* RETURN CONFIRMATION MODAL */}
            {activeModal === 'return' && activeRecord && (
                <ModalWrapper isOpen={true} onClose={closeModal} darkLight={darkLight}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4">Confirm Book Return</h2>

                        <p className="mb-4">Are you sure you want to mark this book as returned?</p>

                        {penaltyInfo && (
                            <div className={`p-4 rounded-lg mb-4 ${darkLight ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
                                }`}>
                                <p className="text-sm font-bold text-red-600 dark:text-red-400 mb-2">
                                    Outstanding Penalty: ${penaltyInfo.totalPenalty}
                                </p>
                                <p className="text-xs">
                                    ({penaltyInfo.overdueDays} {penaltyInfo.overdueDays === 1 ? 'day' : 'days'} overdue × ${penaltyInfo.penaltyPerDay}/day)
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={closeModal}
                                disabled={loading}
                                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${darkLight
                                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                    }`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReturnBook}
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <span>⏳</span> Processing...
                                    </>
                                ) : (
                                    <>
                                        <BiRefresh className="inline mr-1" /> Confirm Return
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </ModalWrapper>
            )}

            {/* RENEW MODAL */}
            {activeModal === 'renew' && activeRecord && (
                <ModalWrapper isOpen={true} onClose={closeModal} darkLight={darkLight}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4">Renew Book Issue</h2>

                        <p className="mb-4 text-sm">Select a new due date for this book</p>

                        <div className={`p-3 rounded-lg mb-4 ${darkLight ? 'bg-gray-700' : 'bg-gray-100'
                            }`}>
                            <p className="font-medium">{activeRecord.bookTitle}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Current Due Date: {formatDate(activeRecord.dueDate)}
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                📅 New Due Date
                            </label>
                            <input
                                type="date"
                                min={getMinDate()}
                                className={`w-full px-3 py-2 border rounded-lg ${darkLight
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300'
                                    }`}
                                onChange={(e) => setNewDueDate(e.target.value)}
                                value={newDueDate}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={closeModal}
                                disabled={loading}
                                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${darkLight
                                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                    }`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRenewBook}
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <span>⏳</span> Processing...
                                    </>
                                ) : (
                                    <>
                                        <BiCalendar className="inline mr-1" /> Confirm Renewal
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </ModalWrapper>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {activeModal === 'delete' && activeRecord && (
                <ModalWrapper isOpen={true} onClose={closeModal} darkLight={darkLight}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">
                            ⚠️ Delete Record
                        </h2>

                        <p className="mb-6">This action cannot be undone. Are you sure?</p>

                        <div className="flex gap-3">
                            <button
                                onClick={closeModal}
                                disabled={loading}
                                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${darkLight
                                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                    }`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteRecord}
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <span>⏳</span> Deleting...
                                    </>
                                ) : (
                                    'Delete Record'
                                )}
                            </button>
                        </div>
                    </div>
                </ModalWrapper>
            )}
        </div>
    );
};

export default BookIssueList;