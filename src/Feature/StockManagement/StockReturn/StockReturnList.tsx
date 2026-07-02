import type { TableColumnsType } from 'antd';
import { MdAssignmentReturn } from 'react-icons/md';
import { useState } from 'react';
import { useGlobleContextDarklight, useRefreshTable } from '../../../AllContext/context';
import XDataTable from '../../../component/XDataTable/XDataTable';
import { AxiosApi } from '../../../component/Axios/Axios';
import StockReturnForm from './StockReturnForm';
import StockReturnDetail from './StockReturnDetail';
import { alertError } from '../../../HtmlHelper/Alert';
import ComponentPermission from '../../../component/ProtextRoute/ComponentPermissions';

interface StockReturnItemInfo {
    id: number;
    productId: number;
    productName: string;
    productCode?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    reason: string;
    note?: string;
    serialNumbers?: string[];
}

interface StockReturnRow {
    id: number;
    returnNo: string;
    supplierId: number;
    supplierName: string;
    note?: string;
    totalAmount: number;
    status: string;
    createdDate: string;
    createdBy: { id: number; name: string } | null;
    items: StockReturnItemInfo[];
}

const STATUS_LABEL: Record<string, { label: string; dark: string; light: string }> = {
    "Completed": { label: "Completed", dark: "bg-emerald-900/40 text-emerald-300", light: "bg-emerald-100 text-emerald-700" },
    "Cancelled": { label: "Cancelled", dark: "bg-red-900/40 text-red-300", light: "bg-red-100 text-red-700" },
};

const StockReturnList = () => {
    const { darkLight } = useGlobleContextDarklight();
    const { setRefreshTables } = useRefreshTable();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [viewId, setViewId] = useState<number | null>(null);
    const [cancelRecord, setCancelRecord] = useState<StockReturnRow | null>(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isCancelAnimating, setIsCancelAnimating] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const handleOpenCancelModal = (record: StockReturnRow) => {
        setCancelRecord(record);
        setShowCancelModal(true);
        setTimeout(() => setIsCancelAnimating(true), 10);
    };

    const handleCloseCancelModal = () => {
        setIsCancelAnimating(false);
        setTimeout(() => {
            setShowCancelModal(false);
            setCancelRecord(null);
        }, 300);
    };

    const handleCancelConfirm = async () => {
        if (!cancelRecord) return;
        setIsCancelling(true);
        try {
            await AxiosApi.post(`stock/returns/${cancelRecord.id}/cancel`, {
                id: cancelRecord.id,
                cancellationNote: "Cancelled by user"
            });
            handleCloseCancelModal();
            setRefreshTables(new Date());
        } catch (err: any) {
            alertError(err?.response?.data?.message || "Failed to cancel return");
            setIsCancelling(false);
        }
    };

    const columns: TableColumnsType<StockReturnRow> = [
        {
            title: 'Return No',
            key: 'returnNo',
            width: 180,
            render: (_, record) => (
                <span className="text-xs font-mono font-semibold text-blue-400">{record.returnNo}</span>
            ),
        },
        {
            title: 'Supplier',
            key: 'supplierName',
            render: (_, record) => (
                <span className={`text-sm font-medium ${darkLight ? "text-gray-200" : "text-gray-800"}`}>{record.supplierName}</span>
            ),
        },
        {
            title: 'Items',
            key: 'items',
            align: 'center',
            width: 70,
            render: (_, record) => (
                <span className={`text-sm ${darkLight ? "text-gray-400" : "text-gray-600"}`}>{record.items?.length ?? 0}</span>
            ),
        },
        {
            title: 'Total Amount',
            key: 'totalAmount',
            align: 'right',
            width: 130,
            render: (_, record) => (
                <span className={`text-sm font-bold ${darkLight ? "text-gray-200" : "text-gray-800"}`}>
                    $ {record.totalAmount?.toFixed(2) ?? "0.00"}
                </span>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            align: 'center',
            width: 120,
            render: (_, record) => {
                const statusInfo = STATUS_LABEL[record.status];
                return (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusInfo ? statusInfo[darkLight ? "dark" : "light"] : ""}`}>
                        {statusInfo?.label ?? record.status}
                    </span>
                );
            },
        },
        {
            title: 'Date',
            key: 'createdDate',
            width: 160,
            render: (_, record) => (
                <span className={`text-xs ${darkLight ? "text-gray-400" : "text-gray-500"}`}>
                    {record.createdDate ? new Date(record.createdDate).toLocaleString() : "N/A"}
                </span>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            width: 150,
            render: (_, record) => (
                <div className="flex items-center gap-2">
                    <ComponentPermission scopes={["stockreturn:view"]}>
                        <button
                            onClick={() => setViewId(record.id)}
                            className={`text-xs font-semibold cursor-pointer px-3 py-1.5 rounded-lg transition-all ${darkLight ? "bg-blue-900/40 text-blue-300 hover:bg-blue-900/60" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}
                        >
                            View
                        </button>
                    </ComponentPermission>
                    <ComponentPermission scopes={["stockreturn:cancel"]}>
                        {record.status === "Completed" && (
                            <button
                                onClick={() => handleOpenCancelModal(record)}
                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                        )}
                    </ComponentPermission>
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="flex items-center justify-between gap-2 my-2 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                    <MdAssignmentReturn className={`w-7 h-7 sm:w-9 sm:h-9 drop-shadow-lg flex-shrink-0 ${darkLight ? "text-purple-400" : "text-purple-600"}`} />
                    <h3 className={`font-bold text-base sm:text-2xl truncate ${darkLight ? 'text-white' : 'text-gray-900'}`}>STOCK RETURNS</h3>
                </div>
                <ComponentPermission scopes={["stockreturn:create"]}>
                    <button onClick={() => setShowCreateModal(true)} className="bg-purple-500 hover:bg-purple-600 active:scale-95 text-white px-3 sm:px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap">
                        New Return
                    </button>
                </ComponentPermission>
            </div>

            <XDataTable
                TableName='Stock returns list'
                columns={columns}
                apiUrl='stock/returns'
                selection={false}
                hideAction={true}
                searchPlaceholder="Search by return no, supplier..."
            />

            {showCreateModal && <StockReturnForm onClose={() => setShowCreateModal(false)} onSuccess={() => { setShowCreateModal(false); setRefreshTables(new Date()); }} />}
            {viewId !== null && <StockReturnDetail id={viewId} onClose={() => setViewId(null)} />}

            {/* Cancel Return Modal */}
            {showCancelModal && cancelRecord && (
                <>
                    <div
                        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isCancelAnimating ? "opacity-100" : "opacity-0"}`}
                        onClick={handleCloseCancelModal}
                    />
                    <div
                        className={`fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none transition-all duration-300 ${isCancelAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                    >
                        <div
                            className={`rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto transform transition-all duration-300 ${darkLight ? "bg-gray-800" : "bg-white"} ${isCancelAnimating ? 'translate-y-0' : 'translate-y-4'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header icon */}
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
                                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                        />
                                    </svg>
                                </div>

                                <h3 className={`text-xl font-bold mb-2 ${darkLight ? 'text-white' : 'text-gray-900'}`}>
                                    Cancel Stock Return
                                </h3>

                                <p className={`mb-4 text-sm ${darkLight ? 'text-gray-300' : 'text-gray-600'}`}>
                                    This action cannot be undone. Do you want to cancel this return?
                                </p>

                                {/* Info card */}
                                <div className={`rounded-xl p-4 mb-4 text-left ${darkLight ? "bg-gray-700/60" : "bg-gray-50"}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={`text-xs font-medium uppercase tracking-wider ${darkLight ? "text-gray-400" : "text-gray-500"}`}>Return No</span>
                                        <span className="text-xs font-bold font-mono text-blue-500">{cancelRecord.returnNo}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={`text-xs font-medium uppercase tracking-wider ${darkLight ? "text-gray-400" : "text-gray-500"}`}>Supplier</span>
                                        <span className={`text-xs font-semibold ${darkLight ? "text-gray-200" : "text-gray-800"}`}>{cancelRecord.supplierName}</span>
                                    </div>
                                    <div className={`h-px my-2 ${darkLight ? "bg-gray-600" : "bg-gray-200"}`}></div>
                                    <div className="flex justify-between items-center">
                                        <span className={`text-xs font-medium uppercase tracking-wider ${darkLight ? "text-gray-400" : "text-gray-500"}`}>Total Amount</span>
                                        <span className="text-sm font-extrabold text-amber-500">$ {cancelRecord.totalAmount?.toFixed(2) ?? "0.00"}</span>
                                    </div>
                                </div>

                                {/* Warning */}
                                <div className={`flex items-start gap-2 rounded-lg p-3 mb-6 text-left ${darkLight ? "bg-red-900/20 border border-red-800/30" : "bg-red-50 border border-red-100"}`}>
                                    <span className="text-base flex-shrink-0 mt-0.5">⚠️</span>
                                    <p className={`text-xs leading-relaxed ${darkLight ? "text-red-300" : "text-red-600"}`}>
                                        Stock will be reversed and supplier balance will be updated.
                                    </p>
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-center gap-3">
                                    <button
                                        onClick={handleCloseCancelModal}
                                        disabled={isCancelling}
                                        className={`px-6 py-2.5 rounded-lg font-medium transition-all ${darkLight
                                            ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            }`}
                                    >
                                        No, Keep It
                                    </button>
                                    <button
                                        onClick={handleCancelConfirm}
                                        disabled={isCancelling}
                                        className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${isCancelling
                                            ? "bg-red-400 cursor-wait"
                                            : "bg-red-500 hover:bg-red-600"
                                            } text-white`}
                                    >
                                        {isCancelling && (
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                        )}
                                        {isCancelling ? "Cancelling..." : "Yes, Cancel Return"}
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

export default StockReturnList;