import type { TableColumnsType } from 'antd';
import XDataTable from '../../component/XDataTable/XDataTable';
import "../../component/XDataTable/XdataTable.css";
import { MdOutlineEventNote } from 'react-icons/md';
import { useEffect, useRef, useState } from 'react';
import { useGlobleContextDarklight, useRefreshTable } from '../../AllContext/context';
import XSelectSearch, { SingleValue } from '../../component/XSelectSearch/Xselectsearch';
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

interface WorkingDayResult {
    totalCalendarDays: number;
    totalWorkingDays: number;
    totalSundays: number;
    session: string;
}

const SESSION_OPTIONS = [
    { value: 'FullDay', label: 'Full Day', description: 'Take the entire day off' },
    { value: 'Morning', label: 'Morning', description: 'First half of the day (first day = 0.5)' },
    { value: 'Afternoon', label: 'Afternoon', description: 'Second half of the day (first day = 0.5)' },
];

const MyLeaveRequest = () => {
    const { darkLight } = useGlobleContextDarklight();
    const dl = darkLight;
    const { setRefreshTables } = useRefreshTable();

    // ===== Form State =====
    const [showForm, setShowForm] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const hasInitialized = useRef(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedLeaveType, setSelectedLeaveType] = useState<SingleValue | null>(null);
    const [formData, setFormData] = useState({
        leaveTypeId: null as number | null,
        startDate: '',
        endDate: '',
        reason: '',
        session: 'FullDay',
    });

    // ===== Working Day API State =====
    const [workingDayResult, setWorkingDayResult] = useState<WorkingDayResult | null>(null);
    const [calculatingDays, setCalculatingDays] = useState(false);

    // ===== View State =====
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewAnimating, setViewAnimating] = useState(false);
    const [viewRecord, setViewRecord] = useState<LeaveRequest | null>(null);

    // ===== Cancel State =====
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelId, setCancelId] = useState<number | null>(null);
    const [cancelAnimating, setCancelAnimating] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const inputClass = `w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${dl
        ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:bg-gray-700 focus:border-blue-500"
        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-blue-50/30"}`;
    const labelClass = `block mb-1.5 text-sm font-semibold ${dl ? "text-gray-200" : "text-gray-700"}`;

    // ✅ Call calculate API when startDate + endDate + session all filled
    useEffect(() => {
        if (!formData.startDate || !formData.endDate || !formData.session) {
            setWorkingDayResult(null);
            return;
        }
        if (new Date(formData.endDate) < new Date(formData.startDate)) {
            setWorkingDayResult(null);
            return;
        }
        callCalculateApi();
    }, [formData.startDate, formData.endDate, formData.session]);

    const callCalculateApi = async () => {
        try {
            setCalculatingDays(true);
            const res = await AxiosApi.post("LeaveRequest/calculate", {
                startDate: formData.startDate,
                endDate: formData.endDate,
                session: formData.session,
            });
            setWorkingDayResult(res?.data?.data ?? null);
        } catch {
            setWorkingDayResult(null);
        } finally {
            setCalculatingDays(false);
        }
    };

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
            title: 'Reason',
            key: 'reason',
            width: '120px',
            render: (_, record) => (
                <span
                    className={`text-sm ${dl ? "text-gray-400" : "text-gray-500"}`}
                    style={{
                        display: 'inline-block',
                        maxWidth: '120px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {record.reason || 'N/A'}
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
            title: 'Approver',
            key: 'approver',
            render: (_, record) => (
                <span className={`text-sm ${dl ? "text-gray-300" : "text-gray-600"}`}>
                    {record.approverName || 'N/A'}
                </span>
            ),
        },
        {
            title: 'Note',
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
                    <button onClick={() => handleOpenView(record)}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${dl
                            ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>
                        View
                    </button>
                    {record.status === 'Pending' && (
                        <button onClick={() => handleOpenCancel(record.id)}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors cursor-pointer">
                            Cancel
                        </button>
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

    // ===== Form handlers =====
    const handleOpenForm = () => {
        setShowForm(true);
        setIsAnimating(false);
        hasInitialized.current = false;
        setFormData({ leaveTypeId: null, startDate: '', endDate: '', reason: '', session: 'FullDay' });
        setSelectedLeaveType(null);
        setWorkingDayResult(null);
        setTimeout(() => setIsAnimating(true), 10);
    };
    const handleCloseForm = () => {
        setIsAnimating(false);
        setTimeout(() => setShowForm(false), 300);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.leaveTypeId) { alertError("Please select a leave type."); return; }
        if (!formData.startDate) { alertError("Start date is required."); return; }
        if (!formData.endDate) { alertError("End date is required."); return; }
        if (!formData.session) { alertError("Please select a session."); return; }
        if (new Date(formData.endDate) < new Date(formData.startDate)) {
            alertError("End date must be after or equal to start date."); return;
        }
        if (!formData.reason.trim()) { alertError("Reason is required."); return; }
        if (!workingDayResult || workingDayResult.totalWorkingDays <= 0) {
            alertError("No working days in selected range."); return;
        }
        try {
            setSubmitting(true);
            await AxiosApi.post("LeaveRequest", {
                leaveTypeId: formData.leaveTypeId,
                startDate: formData.startDate,
                endDate: formData.endDate,
                reason: formData.reason.trim(),
                session: formData.session,
            });
            handleCloseForm();
            setRefreshTables(new Date());
        } catch (error: any) {
            alertError(error?.response?.data?.message || "Failed to submit leave request.");
        } finally {
            setSubmitting(false);
        }
    };

    // ===== Cancel handlers =====
    const handleOpenCancel = (id: number) => {
        setCancelId(id);
        setShowCancelModal(true);
        setTimeout(() => setCancelAnimating(true), 10);
    };
    const handleCloseCancel = () => {
        setCancelAnimating(false);
        setTimeout(() => { setShowCancelModal(false); setCancelId(null); }, 300);
    };
    const handleConfirmCancel = async () => {
        if (!cancelId) return;
        try {
            setCancelling(true);
            await AxiosApi.delete(`LeaveRequest/${cancelId}`);
            handleCloseCancel();
            setRefreshTables(new Date());
        } catch (error: any) {
            alertError(error?.response?.data?.message || "Failed to cancel request.");
        } finally {
            setCancelling(false);
        }
    };

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between gap-2 my-2">
                <div className="flex items-center gap-2 min-w-0">
                    <MdOutlineEventNote className={`w-7 h-7 sm:w-9 sm:h-9 drop-shadow-lg animate-bounce flex-shrink-0
            ${dl ? "text-purple-400" : "text-purple-600"}`} />
                    <h3 className={`font-bold text-base sm:text-2xl truncate ${dl ? 'text-white' : 'text-gray-900'}`}>
                        MY LEAVE REQUESTS
                    </h3>
                </div>
                <button onClick={handleOpenForm}
                    className="bg-sky-500 hover:bg-sky-600 active:scale-95 text-white px-3 sm:px-5 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 whitespace-nowrap">
                    + Request Leave
                </button>
            </div>

            <XDataTable
                TableName='My Leave Requests'
                columns={columns}
                apiUrl='LeaveRequest/my'
                selection={false}
                hideAction={true}
                searchPlaceholder="Search..."
            />

            {/* ===== VIEW MODAL ===== */}
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

                                    {/* Working Days Summary Card */}
                                    <div className={`rounded-xl p-4 text-sm ${dl ? "bg-gray-700" : "bg-blue-50"}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span>📅</span>
                                                <span className={`font-semibold ${dl ? "text-blue-300" : "text-blue-700"}`}>Total Working Days:</span>
                                            </div>
                                            <span className={`text-lg font-bold ${dl ? "text-green-400" : "text-green-600"}`}>
                                                {viewRecord.totalDays} days
                                            </span>
                                        </div>
                                    </div>

                                    {/* Reason (Read Only) */}
                                    <div>
                                        <label className={labelClass}>Reason</label>
                                        <div className={`${inputClass} opacity-70 min-h-[80px] whitespace-pre-wrap py-3`}>
                                            {viewRecord.reason}
                                        </div>
                                    </div>

                                    {/* Approval Info Section (Only shows if not Pending) */}
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
                                                        <strong>Note : </strong>  {viewRecord.approvalNote || "No note provided."}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className={`px-6 py-2 border-t flex-shrink-0 ${dl ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
                                <div className="flex justify-end">
                                    <button onClick={handleCloseView}
                                        className={`px-8 py-2.5 rounded-lg font-medium transition-all ${dl ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ===== SUBMIT FORM MODAL ===== */}
            {showForm && (
                <>
                    <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"}`} />
                    <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 mt-15 pointer-events-none transition-all duration-300 ${isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                        <div className={`rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden pointer-events-auto transform transition-all duration-300
                            ${dl ? "bg-gray-800" : "bg-white"} ${isAnimating ? "translate-y-0" : "translate-y-4"}`}
                            style={{ maxHeight: "calc(100vh - 80px)" }}>

                            {/* Header */}
                            <div className={`px-6 py-4 border-b flex-shrink-0 ${dl ? "border-gray-700" : "border-gray-200"}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className={`text-xl font-bold ${dl ? "text-white" : "text-gray-900"}`}>Submit Leave Request</h2>
                                        <p className={`text-sm mt-0.5 ${dl ? "text-gray-400" : "text-gray-500"}`}>Fill in the details to request leave</p>
                                    </div>
                                    <button onClick={handleCloseForm} className={`w-8 h-8 rounded-full flex items-center justify-center text-xl ${dl ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"}`}>×</button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                                <div className="overflow-y-auto flex-1 px-6 py-5">
                                    <div className="grid grid-cols-1 gap-5">

                                        {/* Leave Type */}
                                        <div>
                                            <label className={labelClass}>Leave Type <span className="text-red-500">*</span></label>
                                            <XSelectSearch
                                                value={selectedLeaveType}
                                                onChange={(v) => {
                                                    setSelectedLeaveType(v);
                                                    setFormData(prev => ({ ...prev, leaveTypeId: v ? Number(v.id) : null }));
                                                }}
                                                multiple={false}
                                                placeholder="Select leave type"
                                                selectOption={{
                                                    apiEndpoint: "LeaveType/lookup",
                                                    id: "id", name: "name", value: "id",
                                                    pageSize: 20, searchParam: "Search"
                                                }}
                                                isSearchable={true}
                                            />
                                            {selectedLeaveType && (
                                                <p className={`text-xs mt-1 ${dl ? "text-blue-400" : "text-blue-600"}`}>
                                                    Max: {(selectedLeaveType.data as any)?.maxDaysPerYear ?? "—"} days/year
                                                </p>
                                            )}
                                        </div>

                                        {/* Dates */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelClass}>Start Date <span className="text-red-500">*</span></label>
                                                <input type="date" value={formData.startDate}
                                                    onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                                    className={inputClass} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>End Date <span className="text-red-500">*</span></label>
                                                <input type="date" value={formData.endDate}
                                                    min={formData.startDate}
                                                    onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                                    className={inputClass} />
                                            </div>
                                        </div>

                                        {/* ✅ Session — horizontal row (1 line) */}
                                        <div className="w-full">
                                            <label className={labelClass}>Session <span className="text-red-500">*</span></label>

                                            {/* Changed to flex-row to keep everything on 1 line */}
                                            <div className="flex flex-row gap-2 w-full mt-1">
                                                {SESSION_OPTIONS.map(opt => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, session: opt.value }))}
                                                        /* Added flex-1 so they have equal widths, adjusted padding to fit horizontal layout */
                                                        className={`flex flex-1 items-center gap-1 px-1.5 py-2.5 rounded-xl border-2 transition-all cursor-pointer text-left ${formData.session === opt.value
                                                            ? dl
                                                                ? "border-blue-500 bg-blue-900/20"
                                                                : "border-blue-500 bg-blue-50"
                                                            : dl
                                                                ? "border-gray-600 bg-gray-700/30 hover:border-gray-500"
                                                                : "border-gray-200 bg-white hover:border-gray-300"
                                                            }`}
                                                    >
                                                        {/* Checkbox circle (slightly smaller to save horizontal space) */}
                                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${formData.session === opt.value
                                                            ? "border-blue-500 bg-blue-500"
                                                            : dl ? "border-gray-500" : "border-gray-300"
                                                            }`}>
                                                            {formData.session === opt.value && (
                                                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>

                                                        {/* Label + description */}
                                                        <div className="flex flex-col">
                                                            <p className={`text-sm font-semibold whitespace-nowrap ${formData.session === opt.value
                                                                ? "text-blue-600"
                                                                : dl ? "text-gray-200" : "text-gray-800"
                                                                }`}>
                                                                {opt.label}
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* ✅ Working Days Preview from API */}
                                        {(formData.startDate && formData.endDate && formData.session) && (
                                            <div className={`rounded-xl p-4 text-sm ${dl ? "bg-gray-700" : "bg-blue-50"}`}>
                                                {calculatingDays ? (
                                                    <div className="flex items-center gap-2">
                                                        <svg className="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                        </svg>
                                                        <span className={dl ? "text-gray-400" : "text-gray-500"}>Calculating working days...</span>
                                                    </div>
                                                ) : workingDayResult ? (
                                                    <div className="space-y-2">
                                                        {/* Main result */}
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span>📅</span>
                                                                <span className={`font-semibold ${dl ? "text-blue-300" : "text-blue-700"}`}>
                                                                    Working Days:
                                                                </span>
                                                            </div>
                                                            <span className={`text-lg font-bold ${workingDayResult.totalWorkingDays > 0
                                                                ? dl ? "text-green-400" : "text-green-600"
                                                                : dl ? "text-red-400" : "text-red-600"
                                                                }`}>
                                                                {workingDayResult.totalWorkingDays} days
                                                            </span>
                                                        </div>

                                                        {/* Breakdown */}
                                                        <div className={`flex gap-4 text-xs pt-2 border-t ${dl ? "border-gray-600 text-gray-400" : "border-blue-200 text-gray-500"}`}>
                                                            <span>📆 Calendar: <strong>{workingDayResult.totalCalendarDays}</strong></span>
                                                            <span>🚫 Sundays: <strong>{workingDayResult.totalSundays}</strong></span>
                                                            <span>✨ Session: <strong>{workingDayResult.session}</strong></span>
                                                        </div>

                                                        {/* Warning if 0 days */}
                                                        {workingDayResult.totalWorkingDays <= 0 && (
                                                            <div className={`flex items-center gap-2 text-xs mt-1 ${dl ? "text-red-400" : "text-red-600"}`}>
                                                                <span>⚠️</span>
                                                                <span>No working days in selected range. Please choose different dates.</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : null}
                                            </div>
                                        )}

                                        {/* Reason */}
                                        <div>
                                            <label className={labelClass}>Reason <span className="text-red-500">*</span></label>
                                            <textarea
                                                value={formData.reason}
                                                onChange={e => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                                                rows={4}
                                                placeholder="Enter reason for leave..."
                                                className={`${inputClass} resize-none`}
                                                maxLength={500}
                                            />
                                            <p className={`text-xs mt-1 text-right ${dl ? "text-gray-500" : "text-gray-400"}`}>
                                                {formData.reason.length}/500
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className={`px-6 py-3 border-t flex-shrink-0 ${dl ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
                                    <div className="flex justify-end gap-3">
                                        <button type="button" onClick={handleCloseForm}
                                            className={`px-6 py-2.5 rounded-lg font-medium ${dl ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                                            Cancel
                                        </button>
                                        <button type="submit"
                                            disabled={submitting || calculatingDays || !workingDayResult || workingDayResult.totalWorkingDays <= 0}
                                            className={`px-8 py-2.5 rounded-lg font-medium shadow-lg text-white disabled:opacity-50
                                                ${submitting || calculatingDays || !workingDayResult || workingDayResult.totalWorkingDays <= 0
                                                    ? "bg-blue-400 cursor-not-allowed"
                                                    : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"}`}>
                                            {submitting ? (
                                                <span className="flex items-center gap-2">
                                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Submitting...
                                                </span>
                                            ) : "Submit Request"}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {/* ===== CANCEL CONFIRM MODAL ===== */}
            {showCancelModal && (
                <>
                    <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${cancelAnimating ? "opacity-100" : "opacity-0"}`}
                        onClick={handleCloseCancel} />
                    <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none transition-all duration-300 ${cancelAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                        <div className={`rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto transform transition-all duration-300 ${dl ? "bg-gray-800" : "bg-white"} ${cancelAnimating ? "translate-y-0" : "translate-y-4"}`}
                            onClick={e => e.stopPropagation()}>
                            <div className="p-6 text-center">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                                    <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <h3 className={`text-xl font-bold mb-2 ${dl ? "text-white" : "text-gray-900"}`}>Cancel Leave Request</h3>
                                <p className={`mb-6 ${dl ? "text-gray-300" : "text-gray-600"}`}>Are you sure you want to cancel this leave request?</p>
                                <div className="flex justify-center gap-3">
                                    <button onClick={handleCloseCancel}
                                        className={`px-6 py-2.5 rounded-lg font-medium ${dl ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                                        No, Keep it
                                    </button>
                                    <button onClick={handleConfirmCancel} disabled={cancelling}
                                        className="px-6 py-2.5 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 flex items-center gap-2">
                                        {cancelling && (
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                        )}
                                        Yes, Cancel It
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

export default MyLeaveRequest;