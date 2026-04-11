import type { TableColumnsType } from 'antd';
import XDataTable from '../../component/XDataTable/XDataTable';
import "../../component/XDataTable/XdataTable.css";
import { BiPackage } from 'react-icons/bi';
import { useState } from 'react';
import { useGlobleContextDarklight, useRefreshTable } from '../../AllContext/context';
import ProductForm from './ProductForm';
import { HookIntergrateAPI } from '../../component/HookintagrateAPI/HookintegarteApi';
import ComponentPermission from '../../component/ProtextRoute/ComponentPermissions';

interface Category { id: number; name: string; }

interface Product {
    id: number;
    name: string;
    description: string;
    sku: string;
    barcode: string;
    price: number;
    costPrice: number;
    taxRate: Number;
    stock: number;
    imageProduct: string;
    categoryId: number;
    category: Category;
    isSerialNumber: boolean;
    isDeleted: boolean;
    createdDate: string;
    updatedDate: string;
    createdBy: string;
}

const ProductList = () => {
    const { darkLight } = useGlobleContextDarklight();
    const [showModal, setShowModal] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<number | undefined>(undefined);
    const [idDelete, setIdDelete] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleteAnimating, setIsDeleteAnimating] = useState(false);
    const { DeleteData } = HookIntergrateAPI();
    const { setRefreshTables } = useRefreshTable();

    const columns: TableColumnsType<Product> = [
        {
            title: 'Image',
            key: 'image',
            width: 70,
            align: 'center',
            render: (_, record) => (
                <img src={record.imageProduct || "https://yokohama-soei-fc.com/wpdata/wp-content/uploads/2022/03/noimage.png"}
                    alt={record.name} className="w-10 h-10 rounded-lg object-cover" />
            ),
        },
        {
            title: 'Product Name',
            key: 'name',
            width: 200,
            render: (_, record) => (
                <div>
                    <p className={`font-semibold text-sm ${darkLight ? "text-white" : "text-gray-800"}`}>{record.name}</p>
                    {record.description && <p className={`text-xs mt-0.5 truncate max-w-[180px] ${darkLight ? "text-gray-400" : "text-gray-500"}`}>{record.description}</p>}
                </div>
            ),
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            render: (sku: string) => (
                <span className={`font-mono text-xs px-2 py-1 rounded ${darkLight ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}>{sku || "—"}</span>
            ),
        },
        {
            title: 'Barcode',
            dataIndex: 'barcode',
            key: 'barcode',
            render: (barcode: string) => (
                <span className={`text-xs ${darkLight ? "text-gray-400" : "text-gray-500"}`}>{barcode || "—"}</span>
            ),
        },
        {
            title: 'Category',
            key: 'category',
            render: (_, record) => (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                    {record.category?.name || "—"}
                </span>
            ),
        },
        {
            title: 'Type',
            key: 'isSerialNumber',
            align: 'center',
            render: (_, record) => (
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${record.isSerialNumber
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                    }`}>
                    {record.isSerialNumber ? "Serialized" : " Non-Serialized"}
                </span>
            ),
        },
        {
            title: 'Sale Price',
            key: 'price',
            render: (_, record) => (
                <p className={`font-semibold text-sm ${darkLight ? "text-green-400" : "text-green-600"}`}>
                    ${record.price.toFixed(2)}
                </p>
            ),
        },
        {
            title: 'Cost Price',
            key: 'costPrice',
            render: (_, record) => (
                <p className={`text-sm ${darkLight ? "text-gray-300" : "text-gray-600"}`}>
                    ${(record.costPrice ?? 0).toFixed(2)}
                </p>
            ),
        },
        {
            title: 'Tax Rate',
            key: 'taxRate',
            render: (_, record) => (
                <p className={`text-sm ${darkLight ? "text-gray-300" : "text-gray-600"}`}>
                    {(Number(record.taxRate) ?? 0).toFixed(2)}%
                </p>
            ),
        },
        {
            title: 'Stock',
            key: 'stock',
            align: 'center',
            render: (_, record) => {
                const stock = record.stock ?? 0;
                const colorClass = stock === 0
                    ? "bg-red-100 text-red-700"
                    : stock <= 5
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700";
                return <span className={`px-3 py-1 rounded-full text-xs font-bold ${colorClass}`}>{stock}</span>;
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            width: 130,
            render: (_, record) => (
                <div className="flex gap-2 justify-center">
                    <ComponentPermission scopes={["product:update"]}>
                        <button onClick={() => handleEdit(record)}
                            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors cursor-pointer">
                            Edit
                        </button>
                    </ComponentPermission>
                    <ComponentPermission scopes={["product:delete"]}>
                        <button onClick={() => handleOpenDeleteModal(record)}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors cursor-pointer">
                            Delete
                        </button>
                    </ComponentPermission>
                </div>
            ),
        },
    ];

    const handleAddProduct = () => { setSelectedProductId(undefined); setShowModal(true); };
    const handleEdit = (record: Product) => { setSelectedProductId(record.id); setShowModal(true); };
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedProductId(undefined);
    };

    const handleOpenDeleteModal = (record: Product) => {
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
                await DeleteData("Product", idDelete);
                handleCloseDeleteModal();
                setRefreshTables(new Date());
            } catch (error) {
                console.error("Error deleting product:", error);
            }
        }
    };

    return (
        <>
            <div className='flex justify-between my-2'>
                <div className='flex items-center gap-3'>
                    <BiPackage className="w-[50px] h-[40px] drop-shadow-lg animate-bounce" />
                    <h3 className={`font-bold text-2xl ${darkLight ? 'text-white' : 'text-gray-900'}`}>PRODUCT MANAGEMENT</h3>
                </div>
                <ComponentPermission scopes={["product:create"]}>
                    <button onClick={handleAddProduct}
                        className='bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-md transition-colors'>
                        Add Product
                    </button>
                </ComponentPermission>
            </div>

            <XDataTable
                TableName='Product list'
                columns={columns}
                apiUrl='Product'
                selection={false}
                hideAction={true}
                searchPlaceholder="Search by name, SKU, barcode..."
            />

            {showModal && <ProductForm productId={selectedProductId} onClose={handleCloseModal} />}

            {/* Delete Modal */}
            {showDeleteModal && (
                <>
                    <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isDeleteAnimating ? "opacity-100" : "opacity-0"}`}
                        onClick={handleCloseDeleteModal} />
                    <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none transition-all duration-300 ${isDeleteAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                        <div className={`rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto transform transition-all duration-300 ${darkLight ? "bg-gray-800" : "bg-white"} ${isDeleteAnimating ? "translate-y-0" : "translate-y-4"}`}
                            onClick={e => e.stopPropagation()}>
                            <div className="p-6 text-center">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                                    <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                                <h3 className={`text-xl font-bold mb-2 ${darkLight ? "text-white" : "text-gray-900"}`}>Confirm Deletion</h3>
                                <p className={`mb-6 ${darkLight ? "text-gray-300" : "text-gray-600"}`}>This action cannot be undone. Do you want to delete this product?</p>
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

export default ProductList;