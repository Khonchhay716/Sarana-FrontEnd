import type { TableColumnsType } from 'antd';
import XDataTable from '../../component/XDataTable/XDataTable';
import "../../component/XDataTable/XdataTable.css";
import { MdOutlineAssignmentTurnedIn } from 'react-icons/md';
import { useState } from 'react';
import { useGlobleContextDarklight, useRefreshTable } from '../../AllContext/context';
import { alertError } from '../../HtmlHelper/Alert';
import { AxiosApi } from '../../component/Axios/Axios';

interface LeaveRequest {
    id: number;
    staffId: number;
    staffName: string;
    staffImage: string;
    leaveTypeId: number;
    leaveTypeName: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
    status: string;
    approverId: number | null;
    approverName: string | null;
    approvedDate: string | null;
    approvalNote: string | null;
    createdDate: string;
}

const LeaveRequestAll = () => {
    const { darkLight } = useGlobleContextDarklight();
    const dl = darkLight;
    const { setRefreshTables } = useRefreshTable();

    // ===== View State =====
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewAnimating, setViewAnimating] = useState(false);
    const [viewRecord, setViewRecord] = useState<LeaveRequest | null>(null);

    // ===== Approve State =====
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [approveAnimating, setApproveAnimating] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
    const [approveNote, setApproveNote] = useState('');

    // ===== Reject State =====
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectAnimating, setRejectAnimating] = useState(false);
    const [rejectNote, setRejectNote] = useState('');

    const [loadingAction, setLoadingAction] = useState(false);

    const inputClass = `w-full px-4 py-2.5 rounded-lg border resize-none focus:outline-none focus:ring-2 ${dl
        ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"}`;
    const labelClass = `block mb-1.5 text-sm font-semibold ${dl ? "text-gray-200" : "text-gray-700"}`;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-700';
            case 'Approved': return 'bg-green-100 text-green-700';
            case 'Rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const columns: TableColumnsType<LeaveRequest> = [
        {
            title: 'Staff',
            key: 'staff',
            width: 200,
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <img
                        src={record.staffImage || "https://yokohama-soei-fc.com/wpdata/wp-content/uploads/2022/03/noimage.png"}
                        alt={record.staffName}
                        className="w-9 h-9 rounded-full object-cover border"
                    />
                    <span className={`font-semibold text-sm ${dl ? "text-white" : "text-gray-800"}`}>
                        {record.staffName}
                    </span>
                </div>
            ),
        },
        {
            title: 'Leave Type',
            key: 'leaveType',
            render: (_, record) => (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                    {record.leaveTypeName}
                </span>
            ),
        },
        {
            title: 'Start Date',
            key: 'startDate',
            render: (_, record) => (
                <span className={`text-sm ${dl ? "text-gray-300" : "text-gray-600"}`}>
                    {new Date(record.startDate).toLocaleDateString()}
                </span>
            ),
        },
        {
            title: 'End Date',
            key: 'endDate',
            render: (_, record) => (
                <span className={`text-sm ${dl ? "text-gray-300" : "text-gray-600"}`}>
                    {new Date(record.endDate).toLocaleDateString()}
                </span>
            ),
        },
        {
            title: 'Days',
            key: 'totalDays',
            align: 'center',
            render: (_, record) => (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${dl ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-700"}`}>
                    {record.totalDays}{record.totalDays > 1 ? "days" : "day"}
                </span>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            align: 'center',
            render: (_, record) => (
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(record.status)}`}>
                    {record.status}
                </span>
            ),
        },
        {
            title: 'Approval Note',
            key: 'approvalNote',
            width: '150px',
            render: (_, record) => (
                <span
                    className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}
                    style={{
                        display: 'inline-block',
                        maxWidth: '150px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {record.approvalNote || 'N/A'}
                </span>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            render: (_, record) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleOpenView(record)}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${dl
                            ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>
                        View
                    </button>
                    {record.status === 'Pending' && (
                        <>
                            <button
                                onClick={() => handleOpenApprove(record)}
                                className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-medium transition-colors cursor-pointer">
                                Approve
                            </button>
                            <button
                                onClick={() => handleOpenReject(record)}
                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors cursor-pointer">
                                Reject
                            </button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    // ===== View handlers =====
    const handleOpenView = (record: LeaveRequest) => {
        setViewRecord(record);
        setShowViewModal(true);
        setTimeout(() => setViewAnimating(true), 10);
    };

    const handleCloseView = () => {
        setViewAnimating(false);
        setTimeout(() => { setShowViewModal(false); setViewRecord(null); }, 300);
    };

    // ===== Approve handlers =====
    const handleOpenApprove = (record: LeaveRequest) => {
        setSelectedRequest(record);
        setApproveNote('');
        setShowApproveModal(true);
        setTimeout(() => setApproveAnimating(true), 10);
    };

    const handleCloseApprove = () => {
        setApproveAnimating(false);
        setTimeout(() => { setShowApproveModal(false); setSelectedRequest(null); }, 300);
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;
        try {
            setLoadingAction(true);
            await AxiosApi.put(`LeaveRequest/${selectedRequest.id}/approve`, { approvalNote: approveNote || null });
            handleCloseApprove();
            setRefreshTables(new Date());
        } catch (error: any) {
            alertError(error?.response?.data?.message || "Failed to approve request.");
        } finally {
            setLoadingAction(false);
        }
    };

    // ===== Reject handlers =====
    const handleOpenReject = (record: LeaveRequest) => {
        setSelectedRequest(record);
        setRejectNote('');
        setShowRejectModal(true);
        setTimeout(() => setRejectAnimating(true), 10);
    };

    const handleCloseReject = () => {
        setRejectAnimating(false);
        setTimeout(() => { setShowRejectModal(false); setSelectedRequest(null); }, 300);
    };

    const handleReject = async () => {
        if (!selectedRequest) return;
        if (!rejectNote.trim()) { alertError("Rejection reason is required."); return; }
        try {
            setLoadingAction(true);
            await AxiosApi.put(`LeaveRequest/${selectedRequest.id}/reject`, { approvalNote: rejectNote });
            handleCloseReject();
            setRefreshTables(new Date());
        } catch (error: any) {
            alertError(error?.response?.data?.message || "Failed to reject request.");
        } finally {
            setLoadingAction(false);
        }
    };

    return (
        <>
            {/* Header */}
            <div className="flex items-center gap-2 my-2 min-w-0">
                <MdOutlineAssignmentTurnedIn className={`w-7 h-7 sm:w-9 sm:h-9 drop-shadow-lg animate-bounce flex-shrink-0
        ${dl ? "text-purple-400" : "text-purple-600"}`} />
                <h3 className={`font-bold text-base sm:text-2xl truncate ${dl ? 'text-white' : 'text-gray-900'}`}>
                    LEAVE APPROVAL
                </h3>
            </div>

            {/* Table */}
            <XDataTable
                TableName='Leave Requests'
                columns={columns}
                apiUrl='LeaveRequest'
                selection={false}
                hideAction={true}
                searchPlaceholder="Search..."
            />

            {/* ===== VIEW DETAIL MODAL (Read-Only Form Style) ===== */}
            {showViewModal && viewRecord && (
                <>
                    <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${viewAnimating ? "opacity-100" : "opacity-0"}`}
                        onClick={handleCloseView} />
                    <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 mt-15 pointer-events-none transition-all duration-300 ${viewAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                        <div className={`rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden pointer-events-auto transform transition-all duration-300
                ${dl ? "bg-gray-800" : "bg-white"} ${viewAnimating ? "translate-y-0" : "translate-y-4"}`}
                            style={{ maxHeight: "calc(100vh - 80px)" }}>

                            {/* Header */}
                            <div className={`px-6 py-2 border-b flex-shrink-0 ${dl ? "border-gray-700" : "border-gray-200"}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className={`text-xl font-bold ${dl ? "text-white" : "text-gray-900"}`}>Leave Request Details</h2>
                                        <p className={`text-sm mt-0.5 ${dl ? "text-gray-400" : "text-gray-500"}`}>Reference ID: #{viewRecord.id}</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(viewRecord.status)}`}>
                                        {viewRecord.status}
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-y-auto flex-1 px-6 py-5">
                                <div className="grid grid-cols-1 gap-5">

                                    {/* Staff Info Card (Specific to HR/Manager View) */}
                                    <div className={`flex items-center gap-4 p-4 rounded-xl border shadow-sm ${dl ? "border-gray-700 bg-gray-700/40" : "border-gray-200 bg-gray-50"}`}>
                                        <img
                                            src={viewRecord.staffImage || "https://yokohama-soei-fc.com/wpdata/wp-content/uploads/2022/03/noimage.png"}
                                            alt={viewRecord.staffName}
                                            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                                        />
                                        <div>
                                            <p className={`text-xs uppercase tracking-wider font-semibold mb-0.5 ${dl ? "text-blue-400" : "text-blue-600"}`}>Requested By</p>
                                            <h3 className={`text-lg font-bold ${dl ? "text-white" : "text-gray-900"}`}>
                                                {viewRecord.staffName}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Leave Type (Read Only) */}
                                    <div>
                                        <label className={labelClass}>Leave Type</label>
                                        <div className={`${inputClass} opacity-70 bg-gray-100/50 flex items-center`}>
                                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                                {viewRecord.leaveTypeName}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Dates (Read Only) */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Start Date</label>
                                            <input type="text" readOnly value={new Date(viewRecord.startDate).toLocaleDateString()} className={`${inputClass} opacity-70 cursor-default`} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>End Date</label>
                                            <input type="text" readOnly value={new Date(viewRecord.endDate).toLocaleDateString()} className={`${inputClass} opacity-70 cursor-default`} />
                                        </div>
                                    </div>

                                    {/* Total Days Summary Card */}
                                    <div className={`rounded-xl p-4 text-sm ${dl ? "bg-gray-700" : "bg-blue-50"}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span>📅</span>
                                                <span className={`font-semibold ${dl ? "text-blue-300" : "text-blue-700"}`}>Total Days Requested:</span>
                                            </div>
                                            <span className={`text-lg font-bold ${dl ? "text-green-400" : "text-green-600"}`}>
                                                {viewRecord.totalDays} {viewRecord.totalDays > 1 ? "days" : "day"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Reason (Read Only) */}
                                    <div>
                                        <label className={labelClass}>Reason provided by staff</label>
                                        <div className={`${inputClass} opacity-70 min-h-[80px] whitespace-pre-wrap py-3`}>
                                            {viewRecord.reason}
                                        </div>
                                    </div>

                                    {/* Approval Info Section (Only shows if it has been acted upon) */}
                                    {viewRecord.status !== 'Pending' && (
                                        <div className={`rounded-xl p-4 border ${viewRecord.status === 'Rejected'
                                            ? dl ? "bg-red-900/10 border-red-800" : "bg-red-50 border-red-200"
                                            : dl ? "bg-green-900/10 border-green-800" : "bg-green-50 border-green-200"
                                            }`}>
                                            <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${viewRecord.status === 'Rejected' ? "text-red-500" : "text-green-600"}`}>
                                                Approval Information
                                            </h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs">
                                                    <span className={dl ? "text-gray-400" : "text-gray-500"}>Processed By:</span>
                                                    <span className={`font-semibold ${dl ? "text-gray-200" : "text-gray-700"}`}>{viewRecord.approverName || "System"}</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className={dl ? "text-gray-400" : "text-gray-500"}>Date:</span>
                                                    <span className={`font-semibold ${dl ? "text-gray-200" : "text-gray-700"}`}>
                                                        {viewRecord.approvedDate ? new Date(viewRecord.approvedDate).toLocaleDateString() : "N/A"}
                                                    </span>
                                                </div>
                                                <div className="pt-2 mt-2 border-t border-black/5">
                                                    <p className={`text-sm italic ${dl ? "text-gray-300" : "text-gray-600"}`}>
                                                        <strong>Note : </strong> {viewRecord.approvalNote || "no note provided"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer with Action Buttons */}
                            <div className={`px-6 py-2 border-t flex-shrink-0 ${dl ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
                                <div className="flex justify-end gap-3">
                                    {/* Quick Actions for Managers - Only show if Pending */}
                                    {viewRecord.status === 'Pending' && (
                                        <>
                                            <button onClick={() => { handleCloseView(); setTimeout(() => handleOpenReject(viewRecord), 300); }}
                                                className="px-6 py-2.5 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white transition-all shadow-md">
                                                Reject
                                            </button>
                                            <button onClick={() => { handleCloseView(); setTimeout(() => handleOpenApprove(viewRecord), 300); }}
                                                className="px-6 py-2.5 rounded-lg font-medium bg-green-500 hover:bg-green-600 text-white transition-all shadow-md">
                                                Approve
                                            </button>
                                        </>
                                    )}
                                    <button onClick={handleCloseView}
                                        className={`px-6 py-2.5 rounded-lg font-medium transition-all ${dl ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ===== APPROVE MODAL ===== */}
            {showApproveModal && selectedRequest && (
                <>
                    <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300
                        ${approveAnimating ? "opacity-100" : "opacity-0"}`}
                        onClick={handleCloseApprove} />
                    <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none transition-all duration-300
                        ${approveAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                        <div className={`rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto transform transition-all duration-300
                            ${dl ? "bg-gray-800" : "bg-white"} ${approveAnimating ? "translate-y-0" : "translate-y-4"}`}
                            onClick={e => e.stopPropagation()}>
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className={`text-lg font-bold ${dl ? "text-white" : "text-gray-900"}`}>Approve Leave Request</h3>
                                        <p className={`text-sm ${dl ? "text-gray-400" : "text-gray-500"}`}>{selectedRequest.staffName}</p>
                                    </div>
                                </div>

                                <div className={`rounded-xl p-4 mb-4 ${dl ? "bg-gray-700" : "bg-gray-50"}`}>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}>Leave Type</p>
                                            <p className={`font-semibold ${dl ? "text-white" : "text-gray-800"}`}>{selectedRequest.leaveTypeName}</p>
                                        </div>
                                        <div>
                                            <p className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}>Total Days</p>
                                            <p className={`font-semibold ${dl ? "text-white" : "text-gray-800"}`}>{selectedRequest.totalDays} days</p>
                                        </div>
                                        <div>
                                            <p className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}>Start Date</p>
                                            <p className={`font-semibold ${dl ? "text-white" : "text-gray-800"}`}>{new Date(selectedRequest.startDate).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}>End Date</p>
                                            <p className={`font-semibold ${dl ? "text-white" : "text-gray-800"}`}>{new Date(selectedRequest.endDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <p className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}>Reason</p>
                                        <p className={`text-sm ${dl ? "text-gray-300" : "text-gray-700"}`}>{selectedRequest.reason}</p>
                                    </div>
                                </div>

                                <div className="mb-5">
                                    <label className={`block text-sm font-semibold mb-1.5 ${dl ? "text-gray-200" : "text-gray-700"}`}>
                                        Note <span className={`text-xs font-normal ${dl ? "text-gray-500" : "text-gray-400"}`}>(optional)</span>
                                    </label>
                                    <textarea value={approveNote} onChange={e => setApproveNote(e.target.value)}
                                        rows={3} placeholder="Add approval note..."
                                        className={`${inputClass} focus:ring-green-500/20`} />
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <button onClick={handleCloseApprove}
                                        className={`px-5 py-2.5 rounded-lg font-medium ${dl ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                                        Cancel
                                    </button>
                                    <button onClick={handleApprove} disabled={loadingAction}
                                        className="px-5 py-2.5 rounded-lg font-medium bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 flex items-center gap-2">
                                        {loadingAction && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
                                        Approve
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ===== REJECT MODAL ===== */}
            {showRejectModal && selectedRequest && (
                <>
                    <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300
                        ${rejectAnimating ? "opacity-100" : "opacity-0"}`}
                        onClick={handleCloseReject} />
                    <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none transition-all duration-300
                        ${rejectAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                        <div className={`rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto transform transition-all duration-300
                            ${dl ? "bg-gray-800" : "bg-white"} ${rejectAnimating ? "translate-y-0" : "translate-y-4"}`}
                            onClick={e => e.stopPropagation()}>
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className={`text-lg font-bold ${dl ? "text-white" : "text-gray-900"}`}>Reject Leave Request</h3>
                                        <p className={`text-sm ${dl ? "text-gray-400" : "text-gray-500"}`}>{selectedRequest.staffName}</p>
                                    </div>
                                </div>

                                <div className={`rounded-xl p-4 mb-4 ${dl ? "bg-gray-700" : "bg-gray-50"}`}>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}>Leave Type</p>
                                            <p className={`font-semibold ${dl ? "text-white" : "text-gray-800"}`}>{selectedRequest.leaveTypeName}</p>
                                        </div>
                                        <div>
                                            <p className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}>Total Days</p>
                                            <p className={`font-semibold ${dl ? "text-white" : "text-gray-800"}`}>{selectedRequest.totalDays} days</p>
                                        </div>
                                        <div>
                                            <p className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}>Start Date</p>
                                            <p className={`font-semibold ${dl ? "text-white" : "text-gray-800"}`}>{new Date(selectedRequest.startDate).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}>End Date</p>
                                            <p className={`font-semibold ${dl ? "text-white" : "text-gray-800"}`}>{new Date(selectedRequest.endDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <p className={`text-xs ${dl ? "text-gray-400" : "text-gray-500"}`}>Reason</p>
                                        <p className={`text-sm ${dl ? "text-gray-300" : "text-gray-700"}`}>{selectedRequest.reason}</p>
                                    </div>
                                </div>

                                <div className="mb-5">
                                    <label className={`block text-sm font-semibold mb-1.5 ${dl ? "text-gray-200" : "text-gray-700"}`}>
                                        Rejection Reason <span className="text-red-500">*</span>
                                    </label>
                                    <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)}
                                        rows={3} placeholder="Enter rejection reason..."
                                        className={`${inputClass} focus:ring-red-500/20`} />
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <button onClick={handleCloseReject}
                                        className={`px-5 py-2.5 rounded-lg font-medium ${dl ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                                        Cancel
                                    </button>
                                    <button onClick={handleReject} disabled={loadingAction}
                                        className="px-5 py-2.5 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 flex items-center gap-2">
                                        {loadingAction && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
                                        Reject
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

export default LeaveRequestAll;