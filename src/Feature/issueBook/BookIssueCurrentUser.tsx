import type { TableColumnsType } from 'antd';
import { message } from 'antd';
import { useState, useCallback } from 'react';
import {
    BiBookReader,
    BiRefresh,
    BiArrowBack,
    BiShow,
    BiX,
    BiCalendar,
    BiUser,
    BiBook,
    BiNote
} from 'react-icons/bi';

import XDataTable from '../../component/XDataTable/XDataTable';
import { HookIntergrateAPI } from '../../component/HookintagrateAPI/HookintegarteApi';
import { useGlobleContextDarklight, useRefreshTable } from '../../AllContext/context';

import "../../component/XDataTable/XdataTable.css";
import BookIssueFormCurrentUser from './BookissueFormCurrentUser';
import ComponentPermission from '../../component/ProtextRoute/ComponentPermissions';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

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

type ModalType = 'create' | 'view' | 'return' | 'renew' | 'delete' | null;

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface DetailRowProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ icon, label, value }) => (
    <div className="flex flex-col">
        <span className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-1">
            {icon} {label}
        </span>
        <span className="text-sm font-medium">{value || 'N/A'}</span>
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
            className={`fixed inset-0 z-[${zIndex}] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm`}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-md rounded-xl shadow-2xl overflow-hidden ${darkLight ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                    }`}
            >
                {children}
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const BookIssueList: React.FC = () => {
    const { darkLight } = useGlobleContextDarklight();
    const { createData, DeleteData } = HookIntergrateAPI();
    const { setRefreshTables } = useRefreshTable();

    // ========================================================================
    // STATE MANAGEMENT
    // ========================================================================

    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [activeRecord, setActiveRecord] = useState<BookIssue | null>(null);
    const [newDueDate, setNewDueDate] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    // ========================================================================
    // MODAL HANDLERS
    // ========================================================================

    const openModal = useCallback((type: ModalType, record?: BookIssue) => {
        setActiveModal(type);
        setActiveRecord(record || null);
        setNewDueDate('');
    }, []);

    const closeModal = useCallback(() => {
        setActiveModal(null);
        setActiveRecord(null);
        setNewDueDate('');
    }, []);

    // ========================================================================
    // ACTION HANDLERS
    // ========================================================================

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

        // Validate that new due date is in the future
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
            }
            );

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

    // ========================================================================
    // UTILITY FUNCTIONS
    // ========================================================================

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

    // ========================================================================
    // TABLE CONFIGURATION
    // ========================================================================

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
                    Issued:
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-600',
                    Renewed:
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                    Returned:
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                };

                return (
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle[status] ?? 'bg-gray-100 text-gray-700'
                            }`}
                    >
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
                <div className="flex gap-2 justify-end items-center">
                    {!record.returnDate && (
                        <>
                            <button
                                onClick={() => openModal('return', record)}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[11px] flex items-center gap-1 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                                title="Return Book"
                            >
                                <BiArrowBack /> Return
                            </button>
                            <button
                                onClick={() => openModal('renew', record)}
                                className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded text-[11px] flex items-center gap-1 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                                title="Renew Book"
                            >
                                <BiRefresh /> Renew
                            </button>
                        </>
                    )}

                        <button
                            onClick={() => openModal('view', record)}
                            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-[11px] flex items-center gap-1 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                            title="View Details"
                        >
                            <BiShow /> View
                        </button>
                    {/* <button
                        onClick={() => openModal('delete', record)}
                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-[11px] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                        title="Delete Record"
                    >
                        Delete
                    </button> */}
                </div>
            ),
        }
    ];

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <div className="p-4 min-h-screen">
            {/* Header Section */}
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
                <div className='flex items-center gap-3'>
                    <BiBookReader size={32} className="text-sky-500" />
                    <h3 className={`font-bold text-2xl ${darkLight ? 'text-white' : 'text-gray-800'
                        }`}>
                        BOOK ISSUE MANAGEMENT
                    </h3>
                </div>
                <button
                    onClick={() => openModal('create')}
                    className='bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2'
                >
                    <BiBook size={18} />
                    Issue Book
                </button>
            </div>

            {/* Data Table */}
            <XDataTable
                TableName='Book Issue List'
                columns={columns}
                apiUrl='BookIssue/my-book-issues'
                hideAction={true}
            />

            {/* ================================================================ */}
            {/* MODALS */}
            {/* ================================================================ */}

            {/* CREATE MODAL */}
            {activeModal === 'create' && (
                <BookIssueFormCurrentUser onClose={closeModal} />
            )}

            {/* VIEW DETAILS MODAL */}
            {activeModal === 'view' && activeRecord && (
                <ModalWrapper
                    isOpen={true}
                    onClose={closeModal}
                    darkLight={darkLight}
                    zIndex={100}
                >
                    <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <BiShow className="text-blue-500" size={22} />
                            Book Issue Details
                        </h2>
                        <button
                            onClick={closeModal}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <BiX size={24} />
                        </button>
                    </div>

                    <div className="p-6 space-y-5">
                        <DetailRow
                            icon={<BiBook className="text-sky-500" />}
                            label="Book Title"
                            value={activeRecord.bookTitle}
                        />
                        <DetailRow
                            icon={<BiUser className="text-emerald-500" />}
                            label="Author"
                            value={activeRecord.bookAuthor}
                        />
                        <DetailRow
                            icon={<BiUser className="text-purple-500" />}
                            label="Member Name"
                            value={activeRecord.memberName}
                        />
                        <DetailRow
                            icon={<BiUser className="text-indigo-500" />}
                            label="Membership No"
                            value={activeRecord.membershipNo}
                        />

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <DetailRow
                                icon={<BiCalendar className="text-blue-500" />}
                                label="Issue Date"
                                value={formatDate(activeRecord.issueDate)}
                            />
                            <DetailRow
                                icon={<BiCalendar className="text-orange-500" />}
                                label="Due Date"
                                value={formatDate(activeRecord.dueDate)}
                            />
                        </div>

                        {activeRecord.returnDate && (
                            <DetailRow
                                icon={<BiCalendar className="text-green-500" />}
                                label="Return Date"
                                value={formatDate(activeRecord.returnDate)}
                            />
                        )}

                        <div className={`mt-4 p-4 rounded-lg ${darkLight ? 'bg-gray-700/50' : 'bg-gray-50'
                            }`}>
                            <p className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1 mb-2">
                                <BiNote /> Status
                            </p>
                            <p className="text-sm mb-2">
                                <span className="font-semibold">Status:</span> {activeRecord.status || "N/A"}
                            </p>
                        </div>
                    </div>

                    <div className={`p-4 flex justify-end border-t ${darkLight ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
                        }`}>
                        <button
                            onClick={closeModal}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                        >
                            Close
                        </button>
                    </div>
                </ModalWrapper>
            )}

            {/* RETURN CONFIRMATION MODAL */}
            {activeModal === 'return' && activeRecord && (
                <ModalWrapper
                    isOpen={true}
                    onClose={closeModal}
                    darkLight={darkLight}
                    zIndex={110}
                >
                    <div className="p-6">
                        <div className="text-center mb-6">
                            <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                                <BiArrowBack className="text-emerald-600 dark:text-emerald-400" size={32} />
                            </div>
                            <h4 className="font-bold text-xl mb-2">Confirm Book Return</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Are you sure you want to mark this book as returned?
                            </p>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={closeModal}
                                className="px-5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReturnBook}
                                className="px-5 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="animate-spin">⏳</span>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <BiArrowBack />
                                        Confirm Return
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </ModalWrapper>
            )}

            {/* RENEW MODAL */}
            {activeModal === 'renew' && activeRecord && (
                <ModalWrapper
                    isOpen={true}
                    onClose={closeModal}
                    darkLight={darkLight}
                    zIndex={110}
                >
                    <div className="p-6">
                        <div className="text-center mb-6">
                            <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
                                <BiRefresh className="text-orange-600 dark:text-orange-400" size={32} />
                            </div>
                            <h4 className="font-bold text-xl mb-2">Renew Book Issue</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Select a new due date for this book
                            </p>
                        </div>

                        <div className={`p-4 rounded-lg mb-4 ${darkLight ? 'bg-gray-700/50' : 'bg-gray-50'
                            }`}>
                            <p className="text-sm font-semibold mb-1">
                                {activeRecord.bookTitle}
                            </p>
                            <p className="text-xs text-gray-500">
                                Current Due Date: {formatDate(activeRecord.dueDate)}
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">
                                New Due Date
                            </label>
                            <input
                                type="date"
                                min={getMinDate()}
                                className={`w-full p-3 border rounded-lg transition-colors ${darkLight
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                onChange={(e) => setNewDueDate(e.target.value)}
                                value={newDueDate}
                            />
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={closeModal}
                                className="px-5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRenewBook}
                                className="px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                disabled={loading || !newDueDate}
                            >
                                {loading ? (
                                    <>
                                        <span className="animate-spin">⏳</span>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <BiRefresh />
                                        Confirm Renewal
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </ModalWrapper>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {activeModal === 'delete' && activeRecord && (
                <ModalWrapper
                    isOpen={true}
                    onClose={closeModal}
                    darkLight={darkLight}
                    zIndex={110}
                >
                    <div className="p-6">
                        <div className="text-center mb-6">
                            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                                <BiX className="text-red-600 dark:text-red-400" size={40} />
                            </div>
                            <h4 className="font-bold text-xl mb-2 text-red-600 dark:text-red-400">
                                Delete Record
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                This action cannot be undone. Are you sure?
                            </p>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={closeModal}
                                className="px-5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteRecord}
                                className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="animate-spin">⏳</span>
                                        Deleting...
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