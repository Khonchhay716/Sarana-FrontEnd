import type { TableColumnsType } from 'antd';
import XDataTable from '../../component/XDataTable/XDataTable';
import "../../component/XDataTable/XdataTable.css";
import { BiSolidDiscount } from 'react-icons/bi';
import { useState } from 'react';
import { useGlobleContextDarklight, useRefreshTable } from '../../AllContext/context';
import { HookIntergrateAPI } from '../../component/HookintagrateAPI/HookintegarteApi';
// import ComponentPermission from '../../component/ProtextRoute/ComponentPermissions';
import DiscountForm from './Discountform';

interface DiscountProductItem {
    productDiscountId: number;
    productId: number;
    productName: string;
    productSKU: string;
    imageProduct: string;
    price: number;
}

interface Discount {
    id: number;
    name: string;
    description: string;
    type: string;  
    value: number;
    minOrderAmount: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    isGlobal: boolean;
    products: DiscountProductItem[];
    createdDate: string;
}

const DiscountList = () => {
    const { darkLight } = useGlobleContextDarklight();
    const [showModal, setShowModal] = useState(false);
    const [selectedDiscountId, setSelectedDiscountId] = useState<number | undefined>(undefined);
    const [idDelete, setIdDelete] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleteAnimating, setIsDeleteAnimating] = useState(false);
    const { DeleteData } = HookIntergrateAPI();
    const { setRefreshTables } = useRefreshTable();

    const columns: TableColumnsType<Discount> = [
        {
            title: 'Name',
            key: 'name',
            render: (_, record) => (
                <div>
                    <p className={`font-semibold text-sm ${darkLight ? "text-white" : "text-gray-800"}`}>{record.name}</p>
                </div>
            ),
        },
        {
            title: 'Type',
            key: 'type',
            align: 'center',
            render: (_, record) => (
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${record.type === "Percentage"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"}`}>
                    {record.type === "Percentage" ? "%" : "$"} {record.type === "Percentage" ? "Percentage" : "Fixed"}
                </span>
            ),
        },
        {
            title: 'Value',
            key: 'value',
            align: 'center',
            render: (_, record) => (
                <p className={`font-bold text-sm ${darkLight ? "text-yellow-300" : "text-yellow-600"}`}>
                    {record.type === "Percentage"
                        ? `${record.value}%`
                        : `$${record.value.toFixed(2)}`}
                </p>
            ),
        },
        {
            title: 'Min Order',
            key: 'minOrderAmount',
            align: 'center',
            render: (_, record) => (
                <span className={`text-xs ${darkLight ? "text-gray-400" : "text-gray-500"}`}>
                    {record.minOrderAmount > 0 ? `$${record.minOrderAmount.toFixed(2)}` : "—"}
                </span>
            ),
        },
        {
            title: 'Start Date',
            key: 'period',
            render: (_, record) => (
                <div className={`text-xs ${darkLight ? "text-gray-400" : "text-gray-500"}`}>
                    {record.startDate
                        ? <p>From: {new Date(record.startDate).toLocaleDateString()}</p>
                        : <p className="text-gray-400">No start</p>}
                </div>
            ),
        },
        {
            title: 'EndDate',
            key: 'period',
            render: (_, record) => (
                <div className={`text-xs ${darkLight ? "text-gray-400" : "text-gray-500"}`}>
                    {record.endDate
                        ? <p>To: {new Date(record.endDate).toLocaleDateString()}</p>
                        : <p className="text-gray-400">No end</p>}
                </div>
            ),
        },
        {
            title: 'Status',
            key: 'isActive',
            align: 'center',
            render: (_, record) => (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${record.isActive ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-500"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${record.isActive ? "bg-teal-500" : "bg-gray-400"}`} />
                    {record.isActive ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            width: 130,
            render: (_, record) => (
                <div className="flex gap-2 justify-center">
                    {/* <ComponentPermission scopes={["discount:update"]}> */}
                    <button onClick={() => handleEdit(record)}
                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors cursor-pointer">
                        Edit
                    </button>
                    {/* </ComponentPermission> */}
                    {/* <ComponentPermission scopes={["discount:delete"]}> */}
                    <button onClick={() => handleOpenDeleteModal(record)}
                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors cursor-pointer">
                        Delete
                    </button>
                    {/* </ComponentPermission> */}
                </div>
            ),
        },
    ];

    const handleAddDiscount = () => { setSelectedDiscountId(undefined); setShowModal(true); };
    const handleEdit = (record: Discount) => { setSelectedDiscountId(record.id); setShowModal(true); };
    const handleCloseModal = () => { setShowModal(false); setSelectedDiscountId(undefined); };

    const handleOpenDeleteModal = (record: Discount) => {
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
            try {
                await DeleteData("Discount", idDelete);
                handleCloseDeleteModal();
                setRefreshTables(new Date());
            } catch (error) {
                console.error("Error deleting discount:", error);
            }
        }
    };

    return (
        <>
            <div className='flex justify-between my-2'>
                <div className='flex items-center gap-3'>
                    <BiSolidDiscount className="w-[50px] h-[40px] drop-shadow-lg animate-bounce" />
                    <h3 className={`font-bold text-2xl ${darkLight ? 'text-white' : 'text-gray-900'}`}>DISCOUNT MANAGEMENT</h3>
                </div>
                {/* <ComponentPermission scopes={["discount:create"]}> */}
                <button onClick={handleAddDiscount}
                    className='bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-md transition-colors'>
                    Add Discount
                </button>
                {/* </ComponentPermission> */}
            </div>

            <XDataTable
                TableName='Discount list'
                columns={columns}
                apiUrl='Discount'
                selection={false}
                hideAction={true}
                searchPlaceholder="Search by name, description..."
            />

            {showModal && <DiscountForm discountId={selectedDiscountId} onClose={handleCloseModal} />}

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
                                    This action cannot be undone. Do you want to delete this discount?
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

export default DiscountList;