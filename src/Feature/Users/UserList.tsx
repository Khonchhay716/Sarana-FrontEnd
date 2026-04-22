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
    Staff:    { bg: "bg-indigo-100", text: "text-indigo-700", darkBg: "bg-indigo-900/30", darkText: "text-indigo-300", emoji: "🧑‍💼" },
    Customer: { bg: "bg-teal-100",   text: "text-teal-700",   darkBg: "bg-teal-900/30",   darkText: "text-teal-300",   emoji: "🙍" },
    None:     { bg: "bg-gray-100",   text: "text-gray-500",   darkBg: "bg-gray-700/40",   darkText: "text-gray-400",   emoji: "—" },
};

const UserList = () => {
    const { darkLight } = useGlobleContextDarklight();
    const dl = darkLight;
    const { setRefreshTables } = useRefreshTable();
    const { DeleteData } = HookIntergrateAPI();

    // ===== Modal State =====
    const [showModal, setShowModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined);

    // ===== Delete State =====
    const [idDelete, setIdDelete] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleteAnimating, setIsDeleteAnimating] = useState(false);

    // ===== Filter State =====
    const [filterStatus, setFilterStatus] = useState<string>("");
    const [filterType, setFilterType] = useState<string>("");
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filterAnimating, setFilterAnimating] = useState(false);
    const [openTypeDropdown, setOpenTypeDropdown] = useState(false);
    const [openStatusDropdown, setOpenStatusDropdown] = useState(false);

    const extraParams = useMemo(() => {
        const params: Record<string, string> = {};
        if (filterStatus !== "") params.isActive = filterStatus;
        if (filterType !== "") params.type = filterType;
        return params;
    }, [filterStatus, filterType]);

    // ===== Filter Handlers =====
    const handleOpenFilter = () => {
        setShowFilterModal(true);
        setTimeout(() => setFilterAnimating(true), 10);
    };
    const handleCloseFilter = () => {
        setFilterAnimating(false);
        setOpenTypeDropdown(false);
        setOpenStatusDropdown(false);
        setTimeout(() => setShowFilterModal(false), 300);
    };

    // ===== User Handlers =====
    const handleAddUser = () => { setSelectedUserId(undefined); setShowModal(true); };
    const handleEdit = (record: User) => { setSelectedUserId(record.id); setShowModal(true); };
    const handleCloseModal = () => { setShowModal(false); setSelectedUserId(undefined); };

    // ===== Delete Handlers =====
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

    const columns: TableColumnsType<User> = [
        {
            title: 'Profile',
            key: 'image',
            width: 64,
            align: 'center',
            render: (_, record) => {
                const imgSrc = record.staff
                    ? (record.staff as any).imageProfile || NoImage
                    : record.customer
                        ? (record.customer as any).imageProfile || NoImage
                        : NoImage;
                return (
                    <img src={imgSrc}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 mx-auto"
                        onError={(e) => { (e.target as HTMLImageElement).src = NoImage; }} />
                );
            },
        },
        {
            title: 'Username', key: 'username', width: 150,
            render: (_, record) => (
                <p className={`font-semibold text-sm ${dl ? "text-white" : "text-gray-800"}`}>{record.username}</p>
            ),
        },
        {
            title: 'Email', key: 'email', width: 180,
            render: (_, record) => (
                <p className={`text-sm ${dl ? "text-gray-400" : "text-gray-600"}`}>{record.email}</p>
            ),
        },
        {
            title: 'Type', key: 'type', width: 110, align: 'center',
            render: (_, record) => {
                const t = TYPE_STYLE[record.type] ?? TYPE_STYLE.None;
                return (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
                        ${dl ? `${t.darkBg} ${t.darkText}` : `${t.bg} ${t.text}`}`}>
                        <span>{t.emoji}</span>{record.type}
                    </span>
                );
            },
        },
        {
            title: 'Full Name', key: 'fullname',
            render: (_, record) => {
                const name = record.staff
                    ? `${record.staff.firstName} ${record.staff.lastName}`
                    : record.customer
                        ? `${record.customer.firstName} ${record.customer.lastName}`
                        : "—";
                return <p className={`text-sm font-medium ${dl ? "text-gray-100" : "text-gray-800"}`}>{name}</p>;
            },
        },
        {
            title: 'Status', key: 'status', align: 'center', width: 90,
            render: (_, record) => (
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                    ${record.isActive
                        ? dl ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-700"
                        : dl ? "bg-red-900/30 text-red-400"   : "bg-red-100 text-red-600"}`}>
                    {record.isActive ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            title: 'Actions', key: 'actions', align: 'center', width: 130,
            render: (_, record) => (
                <div className="flex gap-2 justify-center">
                    <ComponentPermission scopes={["user:update"]}>
                        <button onClick={() => handleEdit(record)}
                            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs cursor-pointer transition-colors">
                            Edit
                        </button>
                    </ComponentPermission>
                    <ComponentPermission scopes={["user:delete"]}>
                        <button onClick={() => handleOpenDeleteModal(record)}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs cursor-pointer transition-colors">
                            Delete
                        </button>
                    </ComponentPermission>
                </div>
            ),
        },
    ];

    return (
        <>
            {/* ===== HEADER ===== */}
            <div className="flex items-center justify-between gap-2 my-2">
                <div className="flex items-center gap-2 min-w-0">
                    <HiUserGroup className={`w-7 h-7 sm:w-9 sm:h-9 drop-shadow-lg animate-bounce flex-shrink-0
                        ${dl ? "text-purple-400" : "text-purple-600"}`} />
                    <h3 className={`font-bold text-base sm:text-2xl truncate ${dl ? 'text-white' : 'text-gray-900'}`}>
                        USER MANAGEMENT
                    </h3>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Filter Button */}
                    <button onClick={handleOpenFilter}
                        className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all
                            ${(filterType || filterStatus)
                                ? dl ? "bg-purple-900/40 border-purple-500 text-purple-300" : "bg-purple-50 border-purple-400 text-purple-700"
                                : dl ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600" : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                            }`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                        </svg>
                        <span className="hidden sm:inline">Filter</span>
                        {(filterType || filterStatus) && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-white" />
                        )}
                    </button>

                    <ComponentPermission scopes={["user:create"]}>
                        <button onClick={handleAddUser}
                            className="bg-sky-500 hover:bg-sky-600 active:scale-95 text-white px-3 sm:px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap">
                            + Add User
                        </button>
                    </ComponentPermission>
                </div>
            </div>

            {/* ===== TABLE ===== */}
            <XDataTable
                TableName='User list'
                columns={columns}
                apiUrl='Person'
                extraParams={extraParams}
                selection={false}
                hideAction={true}
                searchPlaceholder="Search by username, email..."
            />

            {showModal && <UserForm userId={selectedUserId} onClose={handleCloseModal} />}

            {/* ===== FILTER MODAL ===== */}
            {showFilterModal && (
                <>
                    <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300
                        ${filterAnimating ? "opacity-100" : "opacity-0"}`}
                        onClick={handleCloseFilter} />
                    <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none transition-all duration-300
                        ${filterAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                        <div className={`rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto transform transition-all duration-300
                            ${dl ? "bg-gray-800" : "bg-white"} ${filterAnimating ? "translate-y-0" : "translate-y-4"}`}
                            onClick={e => e.stopPropagation()}>

                            {/* Header */}
                            <div className={`px-6 py-4 border-b flex items-center justify-between ${dl ? "border-gray-700" : "border-gray-200"}`}>
                                <div className="flex items-center gap-2">
                                    <svg className={`w-5 h-5 ${dl ? "text-purple-400" : "text-purple-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                                    </svg>
                                    <h3 className={`text-lg font-bold ${dl ? "text-white" : "text-gray-900"}`}>Filter Users</h3>
                                </div>
                                <button onClick={handleCloseFilter}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xl transition-colors
                                        ${dl ? "text-gray-400 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-100"}`}>×</button>
                            </div>

                            {/* Body */}
                            <div className="px-6 py-5 space-y-5">

                                {/* User Type Custom Dropdown */}
                                <div>
                                    <label className={`block text-sm font-semibold mb-1.5 ${dl ? "text-gray-200" : "text-gray-700"}`}>
                                        User Type
                                    </label>
                                    <div className="relative">
                                        <button type="button"
                                            onClick={() => { setOpenTypeDropdown(prev => !prev); setOpenStatusDropdown(false); }}
                                            className={`w-full px-4 py-2.5 rounded-lg border text-sm text-left flex items-center justify-between transition-all
                                                ${dl ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"}`}>
                                            <span>{filterType === "" ? "All Types" : filterType}</span>
                                            <svg className={`w-4 h-4 transition-transform duration-200 ${openTypeDropdown ? "rotate-180" : ""}`}
                                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        {openTypeDropdown && (
                                            <div className={`absolute top-full left-0 right-0 mt-1 rounded-lg border shadow-lg z-10 overflow-hidden
                                                ${dl ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"}`}>
                                                {[
                                                    { val: "", label: "All Types" },
                                                    { val: "Staff", label: "Staff" },
                                                    { val: "Customer", label: "Customer" },
                                                ].map(opt => (
                                                    <button key={opt.val} type="button"
                                                        onClick={() => { setFilterType(opt.val); setOpenTypeDropdown(false); }}
                                                        className={`w-full px-4 py-2.5 text-sm text-left transition-colors
                                                            ${filterType === opt.val
                                                                ? dl ? "bg-purple-900/40 text-purple-300" : "bg-purple-50 text-purple-700"
                                                                : dl ? "text-gray-200 hover:bg-gray-600" : "text-gray-700 hover:bg-gray-50"
                                                            }`}>
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Status Custom Dropdown */}
                                <div>
                                    <label className={`block text-sm font-semibold mb-1.5 ${dl ? "text-gray-200" : "text-gray-700"}`}>
                                        Status
                                    </label>
                                    <div className="relative">
                                        <button type="button"
                                            onClick={() => { setOpenStatusDropdown(prev => !prev); setOpenTypeDropdown(false); }}
                                            className={`w-full px-4 py-2.5 rounded-lg border text-sm text-left flex items-center justify-between transition-all
                                                ${dl ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"}`}>
                                            <span>
                                                {filterStatus === "" ? "All Status" : filterStatus === "true" ? "Active" : "Inactive"}
                                            </span>
                                            <svg className={`w-4 h-4 transition-transform duration-200 ${openStatusDropdown ? "rotate-180" : ""}`}
                                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        {openStatusDropdown && (
                                            <div className={`absolute top-full left-0 right-0 mt-1 rounded-lg border shadow-lg z-10 overflow-hidden
                                                ${dl ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"}`}>
                                                {[
                                                    { val: "", label: "All Status" },
                                                    { val: "true", label: "Active" },
                                                    { val: "false", label: "Inactive" },
                                                ].map(opt => (
                                                    <button key={opt.val} type="button"
                                                        onClick={() => { setFilterStatus(opt.val); setOpenStatusDropdown(false); }}
                                                        className={`w-full px-4 py-2.5 text-sm text-left transition-colors
                                                            ${filterStatus === opt.val
                                                                ? opt.val === "true"
                                                                    ? "bg-green-50 text-green-700"
                                                                    : opt.val === "false"
                                                                        ? "bg-red-50 text-red-600"
                                                                        : dl ? "bg-purple-900/40 text-purple-300" : "bg-purple-50 text-purple-700"
                                                                : dl ? "text-gray-200 hover:bg-gray-600" : "text-gray-700 hover:bg-gray-50"
                                                            }`}>
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className={`px-6 py-4 border-t flex justify-between gap-3 ${dl ? "border-gray-700" : "border-gray-200"}`}>
                                <button onClick={() => { setFilterType(""); setFilterStatus(""); setOpenTypeDropdown(false); setOpenStatusDropdown(false); }}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                                        ${dl ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                                    Reset
                                </button>
                                <button onClick={handleCloseFilter}
                                    className="px-6 py-2 rounded-lg text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white transition-all active:scale-95">
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ===== DELETE MODAL ===== */}
            {showDeleteModal && (
                <>
                    <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300
                        ${isDeleteAnimating ? "opacity-100" : "opacity-0"}`}
                        onClick={handleCloseDeleteModal} />
                    <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none transition-all duration-300
                        ${isDeleteAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                        <div className={`rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto transform transition-all duration-300
                            ${dl ? "bg-gray-800" : "bg-white"} ${isDeleteAnimating ? "translate-y-0" : "translate-y-4"}`}
                            onClick={e => e.stopPropagation()}>
                            <div className="p-6 text-center">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                                    <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                                <h3 className={`text-xl font-bold mb-2 ${dl ? "text-white" : "text-gray-900"}`}>Confirm Deletion</h3>
                                <p className={`mb-6 ${dl ? "text-gray-300" : "text-gray-600"}`}>
                                    This action cannot be undone. Do you want to delete this user?
                                </p>
                                <div className="flex justify-center gap-3">
                                    <button onClick={handleCloseDeleteModal}
                                        className={`px-6 py-2.5 rounded-lg font-medium transition-all
                                            ${dl ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
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

export default UserList;