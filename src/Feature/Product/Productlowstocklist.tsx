import type { TableColumnsType } from 'antd';
import XDataTable from '../../component/XDataTable/XDataTable';
import "../../component/XDataTable/XdataTable.css";
import { BiError } from 'react-icons/bi';
import { useGlobleContextDarklight } from '../../AllContext/context';

interface Category { id: number; name: string; }
interface Branch   { id: number; name: string; }

interface Product {
    id: number;
    name: string;
    sku: string;
    imageProduct: string;
    price: number;
    stock: number;
    minStock: number;
    isSerialNumber: boolean;
    categoryId: number;
    category: Category;
    branchId: number;
    branch: Branch;
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
                    src={record.imageProduct || "https://yokohama-soei-fc.com/wpdata/wp-content/uploads/2022/03/noimage.png"}
                    alt={record.name}
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://yokohama-soei-fc.com/wpdata/wp-content/uploads/2022/03/noimage.png"; }}
                    className="w-10 h-10 rounded-lg object-cover mx-auto"
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
                        {record.sku || "—"}
                    </span>
                </div>
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
            title: 'Branch',
            key: 'branch',
            render: (_, record) => (
                record.branch
                    ? <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">{record.branch.name}</span>
                    : <span className={`text-xs ${darkLight ? "text-gray-500" : "text-gray-400"}`}>—</span>
            ),
        },
        {
            title: 'Type',
            key: 'type',
            align: 'center',
            render: (_, record) => (
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${record.isSerialNumber
                    ? "bg-blue-100 text-blue-700"
                    : "bg-purple-100 text-purple-700"}`}>
                    {record.isSerialNumber ? "Serialized" : "Non-Serialized"}
                </span>
            ),
        },
        {
            title: 'Price',
            key: 'price',
            align: 'right',
            render: (_, record) => (
                <p className={`font-semibold text-sm ${darkLight ? "text-green-400" : "text-green-600"}`}>
                    ${record.price.toFixed(2)}
                </p>
            ),
        },
        {
            title: 'Stock',
            key: 'stock',
            align: 'center',
            render: (_, record) => (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                    {record.stock}
                </span>
            ),
        },
        {
            title: 'Min Stock',
            key: 'minStock',
            align: 'center',
            render: (_, record) => (
                <span className={`text-xs font-medium ${darkLight ? "text-gray-400" : "text-gray-500"}`}>
                    {record.minStock}
                </span>
            ),
        },
        {
            title: 'Shortage',
            key: 'shortage',
            align: 'center',
            render: (_, record) => {
                const shortage = record.minStock - record.stock;
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-100 text-orange-700">
                        ↓ {shortage}
                    </span>
                );
            },
        },
    ];

    return (
        <>
            <div className='flex justify-between my-2'>
                <div className='flex items-center gap-3'>
                    <BiError className="w-[50px] h-[40px] text-red-500 drop-shadow-lg animate-bounce" />
                    <div>
                        <h3 className={`font-bold text-2xl ${darkLight ? 'text-white' : 'text-gray-900'}`}>
                            LOW STOCK ALERT
                        </h3>
                        <p className={`text-xs ${darkLight ? "text-gray-400" : "text-gray-500"}`}>
                            Products that have reached or fallen below minimum stock threshold
                        </p>
                    </div>
                </div>
            </div>

            <XDataTable
                TableName='Low stock products'
                columns={columns}
                apiUrl='Product'
                extraParams={{ lowStockOnly: "true" }}
                selection={false}
                hideAction={true}
                searchPlaceholder="Search by name, SKU..."
            />
        </>
    );
};

export default ProductLowStockList;