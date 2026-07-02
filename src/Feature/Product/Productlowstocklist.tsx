import type { TableColumnsType } from 'antd';
import XDataTable from '../../component/XDataTable/XDataTable';
import "../../component/XDataTable/XdataTable.css";
import { BiError } from 'react-icons/bi';
import { useGlobleContextDarklight } from '../../AllContext/context';

interface Product {
    id: number;
    code: string;
    name: string;
    description: string;
    imageUrl: string;
    productType: string;
    unit: string;
    costPrice: number;
    salePrice: number;
    lowStockThreshold: number;
    stockQuantity: number;
    isDeleted: boolean;
    createdDate: string;
    updatedDate: string;
    createdBy: string;
    categoryId: number | null;
    categoryName: string;
}

const ProductLowStockList = () => {
    const { darkLight } = useGlobleContextDarklight();

    const columns: TableColumnsType<Product> = [
        {
            title: 'Image',
            key: 'image',
            width: 70,
            align: 'center',
            render: (_, record) => (
                <img
                    src={record.imageUrl || "https://yokohama-soei-fc.com/wpdata/wp-content/uploads/2022/03/noimage.png"}
                    alt={record.name}
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://yokohama-soei-fc.com/wpdata/wp-content/uploads/2022/03/noimage.png"; }}
                    className="w-10 h-10 rounded-lg object-cover mx-auto ring-2 ring-gray-100 dark:ring-gray-700"
                />
            ),
        },
        {
            title: 'Product Name',
            key: 'name',
            render: (_, record) => (
                <div>
                    <p className={`font-semibold text-sm ${darkLight ? "text-white" : "text-gray-800"}`}>{record.name}</p>
                    <span className={`font-mono text-xs px-2 py-0.5 rounded mt-0.5 inline-block ${darkLight ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-500"}`}>
                        {record.code || "—"}
                    </span>
                </div>
            ),
        },
        {
            title: 'Category',
            key: 'categoryName',
            render: (_, record) => (
                record.categoryName
                    ? <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${darkLight ? "bg-indigo-900/30 text-indigo-300" : "bg-indigo-50 text-indigo-600"}`}>{record.categoryName}</span>
                    : <span className={`text-xs ${darkLight ? "text-gray-500" : "text-gray-400"}`}>Uncategorized</span>
            ),
        },
        {
            title: 'Type',
            key: 'productType',
            align: 'center',
            render: (_, record) => (
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${record.productType === "Serialized"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"}`}>
                    {record.productType}
                </span>
            ),
        },
        {
            title: 'Sale Price',
            key: 'salePrice',
            align: 'right',
            render: (_, record) => (
                <p className={`font-semibold text-sm ${darkLight ? "text-green-400" : "text-green-600"}`}>
                    ${record.salePrice.toFixed(2)}
                </p>
            ),
        },
        {
            title: 'Stock / Threshold',
            key: 'stockQuantity',
            align: 'center',
            render: (_, record) => {
                const stock = record.stockQuantity ?? 0;
                const colorClass = stock === 0
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700";
                return (
                    <div className="flex items-center justify-center gap-1.5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${colorClass}`}>{stock}</span>
                        <span className={`text-xs ${darkLight ? "text-gray-500" : "text-gray-400"}`}>/ {record.lowStockThreshold}</span>
                    </div>
                );
            },
        },
    ];

    return (
        <>
            <div className="flex items-center gap-2 my-2 min-w-0">
                <BiError className="w-7 h-7 sm:w-9 sm:h-9 text-red-500 drop-shadow-lg animate-bounce flex-shrink-0" />
                <div className="min-w-0">
                    <h3 className={`font-bold text-base sm:text-2xl truncate ${darkLight ? 'text-white' : 'text-gray-900'}`}>
                        LOW STOCK ALERT
                    </h3>
                    <p className={`text-xs truncate ${darkLight ? "text-gray-400" : "text-gray-500"}`}>
                        Products that have reached or fallen below minimum stock threshold
                    </p>
                </div>
            </div>

            <XDataTable
                TableName='Low stock products'
                columns={columns}
                apiUrl='Products/low-stock'
                selection={false}
                hideAction={true}
                searchPlaceholder="Search by name, code..."
            />
        </>
    );
};

export default ProductLowStockList;