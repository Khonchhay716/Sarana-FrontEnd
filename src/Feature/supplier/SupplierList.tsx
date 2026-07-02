import type { TableColumnsType } from 'antd';
import XDataTable from '../../component/XDataTable/XDataTable';
import "../../component/XDataTable/XdataTable.css";
import { TbTruckDelivery } from 'react-icons/tb';
import { useState } from 'react';
import { useGlobleContextDarklight, useRefreshTable } from '../../AllContext/context';
import { HookIntergrateAPI } from '../../component/HookintagrateAPI/HookintegarteApi';
import ComponentPermission from '../../component/ProtextRoute/ComponentPermissions';
import SupplierForm from './SupplierForm';

interface Supplier {
    id: number;
    name: string;
    phone: string;
    email: string;
    address: string;
    createdDate: string;
    updatedDate: string;
    createdBy: string;
}

const SupplierList = () => {
    const { darkLight } = useGlobleContextDarklight();
    const [showModal, setShowModal] = useState(false);
    const [selectedSupplierId, setSelectedSupplierId] = useState<number | undefined>(undefined);
    const [recordToDelete, setRecordToDelete] = useState<Supplier | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleteAnimating, setIsDeleteAnimating] = useState(false);
    const { DeleteData } = HookIntergrateAPI();
    const { setRefreshTables } = useRefreshTable();

    const columns: TableColumnsType<Supplier> = [
        {
            title: 'Supplier Name',
            key: 'name',
            render: (_, record) => (
                <div>
                    <p className={`font-semibold text-sm ${darkLight ? "text-white" : "text-gray-800"}`}>{record.name}</p>
                </div>
            ),
        },
        {
            title: 'Phone',
            key: 'phone',
            render: (_, record) => (
                <p className={`text-xs ${darkLight ? "text-gray-300" : "text-gray-600"}`}>{record.phone || "-"}</p>
            ),
        },
        {
            title: 'Email',
            key: 'email',
            render: (_, record) => (
                <p className={`text-xs ${darkLight ? "text-gray-300" : "text-gray-600"}`}>{record.email || "-"}</p>
            ),
        },
        {
            title: 'Address',
            key: 'address',
            render: (_, record) => (
                <p className={`text-xs mt-0.5 truncate max-w-[220px] ${darkLight ? "text-gray-400" : "text-gray-500"}`}>
                    {record.address || "-"}
                </p>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            width: 130,
            render: (_, record) => (
                <div className="flex gap-2 justify-center">
                    <ComponentPermission scopes={["supplier:update"]}>
                        <button onClick={() => handleEdit(record)}
                            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors cursor-pointer">
                            Edit
                        </button>
                    </ComponentPermission>
                    <ComponentPermission scopes={["supplier:delete"]}>
                        <button onClick={() => handleOpenDeleteModal(record)}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors cursor-pointer">
                            Delete
                        </button>
                    </ComponentPermission>
                </div>
            ),
        },
    ];

    const handleAddSupplier = () => { setSelectedSupplierId(undefined); setShowModal(true); };
    const handleEdit = (record: Supplier) => { setSelectedSupplierId(record.id); setShowModal(true); };
    const handleCloseModal = () => { setShowModal(false); setSelectedSupplierId(undefined); };

    const handleOpenDeleteModal = (record: Supplier) => {
        setRecordToDelete(record);
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
            await DeleteData("Suppliers", recordToDelete.id);
            handleCloseDeleteModal();
            setRefreshTables(new Date());
        } catch (error) {
            console.error("Error deleting supplier:", error);
        }
    };

    return (
        <>
            <div className="flex items-center justify-between gap-2 my-2">
                <div className="flex items-center gap-1 min-w-0">
                    <TbTruckDelivery className={`w-7 h-7 sm:w-9 sm:h-9 drop-shadow-lg animate-bounce flex-shrink-0 ${darkLight ? "text-purple-400" : "text-purple-600"}`} />
                    <h3 className={`font-bold text-sm sm:text-2xl whitespace-nowrap ${darkLight ? 'text-white' : 'text-gray-900'}`}>
                        SUPPLIER MANAGEMENT
                    </h3>
                </div>
                <ComponentPermission scopes={["supplier:create"]}>
                    <button onClick={handleAddSupplier}
                        className="bg-sky-500 hover:bg-sky-600 active:scale-95 text-white px-3 sm:px-5 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 whitespace-nowrap">
                        Add Supplier
                    </button>
                </ComponentPermission>
            </div>

            <XDataTable
                TableName='Supplier list'
                columns={columns}
                apiUrl='Suppliers'
                selection={true}
                hideAction={true}
                searchPlaceholder="Search by name, phone, email..."
            />

            {showModal && <SupplierForm supplierId={selectedSupplierId} onClose={handleCloseModal} />}

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
                                    This action cannot be undone. Do you want to delete this supplier?
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

export default SupplierList;