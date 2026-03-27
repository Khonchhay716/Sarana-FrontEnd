import type { TableColumnsType } from 'antd';
import XDataTable from '../../component/XDataTable/XDataTable';
import "../../component/XDataTable/XdataTable.css";
import { MdAdminPanelSettings } from 'react-icons/md';
import { useState } from 'react';
import { useGlobleContextDarklight, useRefreshTable } from '../../AllContext/context';
import { HookIntergrateAPI } from '../../component/HookintagrateAPI/HookintegarteApi';
import RoleForm from './Roleform';
import { Link } from 'react-router-dom';
import ComponentPermission from '../../component/ProtextRoute/ComponentPermissions';

interface Role {
    id: number;
    name: string;
    description: string;
}

const RoleList = () => {
    const { darkLight } = useGlobleContextDarklight();
    const [showModal, setShowModal] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState<number | undefined>(undefined);
    const [idDelete, setIdDelete] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleteAnimating, setIsDeleteAnimating] = useState(false);
    const { DeleteData } = HookIntergrateAPI();
    const { setRefreshTables } = useRefreshTable();

    const columns: TableColumnsType<Role> = [
        {
            title: 'Role Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            width: 120,
            render: (_, record) => (
                <div className="flex gap-2 justify-center">
                    <ComponentPermission scopes={["role:assign-permissions"]}>
                        <Link
                            to={`/permissions/${record?.id}`}
                            className="me-2 d-flex align-items-center p-2 border rounded"
                        >
                            <MdAdminPanelSettings style={{ fontSize: '20px' }} />
                        </Link>
                    </ComponentPermission>
                    <ComponentPermission scopes={["role:update"]}>
                        <button
                            onClick={() => handleEdit(record)}
                            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors cursor-pointer"
                            title="Edit"
                        >
                            Edit
                        </button>
                    </ComponentPermission>
                    <ComponentPermission scopes={["role:delete"]}>
                        <button
                            onClick={() => handleOpenDeleteModal(record)}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors cursor-pointer"
                            title="Delete"
                        >
                            Delete
                        </button>
                    </ComponentPermission>
                </div>
            ),
        }
    ];

    const handleAddRole = () => {
        setSelectedRoleId(undefined);
        setShowModal(true);
    };

    const handleEdit = (record: Role) => {
        setSelectedRoleId(record.id);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedRoleId(undefined);
    };

    const handleOpenDeleteModal = (record: Role) => {
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
                await DeleteData("Roles", idDelete);
                handleCloseDeleteModal();
                setRefreshTables(new Date());
            } catch (error) {
                console.error("Error deleting role:", error);
            }
        }
    };

    return (
        <>
            <div className='flex justify-between my-2'>
                <div className='flex items-center gap-3'>
                    <div className="relative">
                        <MdAdminPanelSettings className="w-[50px] h-[40px] drop-shadow-lg animate-bounce" />
                    </div>
                    <h3 className={`font-bold text-2xl ${darkLight ? 'text-white' : 'text-gray-900'}`}>
                        ROLE MANAGEMENT
                    </h3>
                </div>
                <ComponentPermission scopes={["role:create"]}>
                    <button
                        onClick={handleAddRole}
                        className='bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-md transition-colors'
                    >
                        Add Role
                    </button>
                </ComponentPermission>
            </div>

            <XDataTable
                TableName='Role list'
                columns={columns}
                apiUrl='Roles'
                selection={false}
                hideAction={true}
                searchPlaceholder="Search roles..."
            />

            {showModal && (
                <RoleForm
                    roleId={selectedRoleId}
                    onClose={handleCloseModal}
                />
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
                                    This action cannot be undone. Do you want to delete this role?
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

export default RoleList;