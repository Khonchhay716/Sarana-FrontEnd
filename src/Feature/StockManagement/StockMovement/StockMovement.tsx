import type { TableColumnsType } from 'antd';
import { MdInventory2 } from 'react-icons/md';
import { useState } from 'react';
import { useGlobleContextDarklight } from '../../../AllContext/context';
import ComponentPermission from '../../../component/ProtextRoute/ComponentPermissions';
import XDataTable from '../../../component/XDataTable/XDataTable';
import StockInForm from './Stockinform';
import StockOutForm from './Stockoutform';
import StockMovementDetail from './StockMovementDetail'; // ✅ Import Detail Component
import StockInSummaryButton from './StockInSummaryButton';

interface StockMovementRow {
    id: number;
    productId: number;
    productName: string;
    productSKU?: string;
    imageProduct?: string;
    type: string; // ✅ Updated to string to match backend enum .ToString()
    typeAdjustment?: string; // ✅ Added
    quantity: number;
    quantityBefore: number;
    quantityAfter: number;
    unitPrice: number;
    totalPrice: number;
    supplierId?: number;
    supplierName?: string;
    reference?: string;
    note?: string;
    serialNumbers?: string[];
    createdDate: string;
    createdBy: { id: number; name: string } | null; // ✅ Made nullable
}

// ✅ Added beautiful type badges
const TYPE_LABEL: Record<string, { label: string; icon: string; dark: string; light: string }> = {
    "In": { label: "Stock In", icon: "📥", dark: "bg-emerald-900/40 text-emerald-300", light: "bg-emerald-100 text-emerald-700" },
    "Out": { label: "Stock Out", icon: "📤", dark: "bg-red-900/40 text-red-300", light: "bg-red-100 text-red-700" },
    "Adjustment": { label: "Adjust", icon: "⚙️", dark: "bg-amber-900/40 text-amber-300", light: "bg-amber-100 text-amber-700" },
    "ReturnOut": { label: "Return Out", icon: "🚚", dark: "bg-purple-900/40 text-purple-300", light: "bg-purple-100 text-purple-700" },
    "ReturnIn": { label: "Return In", icon: "🔄", dark: "bg-blue-900/40 text-blue-300", light: "bg-blue-100 text-blue-700" },
};

const StockMovementList = () => {
    const { darkLight } = useGlobleContextDarklight();
    const [showInModal, setShowInModal] = useState(false);
    const [showOutModal, setShowOutModal] = useState(false);
    const [viewId, setViewId] = useState<number | null>(null);

    const handleOpenIn = () => setShowInModal(true);
    const handleOpenOut = () => setShowOutModal(true);
    const handleCloseIn = () => setShowInModal(false);
    const handleCloseOut = () => setShowOutModal(false);

    const columns: TableColumnsType<StockMovementRow> = [
        {
            title: 'Product',
            key: 'productName',
            render: (_, record) => (
                <div className="flex items-center gap-2">
                    {record.imageProduct && (
                        <img src={record.imageProduct} alt={record.productName} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div>
                        <p className={`font-semibold text-sm ${darkLight ? "text-white" : "text-gray-800"}`}>{record.productName}</p>
                        {record.productSKU && <p className={`text-xs font-mono ${darkLight ? "text-gray-400" : "text-gray-500"}`}>{record.productSKU}</p>}
                    </div>
                </div>
            ),
        },
        {
            title: 'Type',
            key: 'type',
            align: 'center',
            width: 130,
            render: (_, record) => {
                const typeInfo = TYPE_LABEL[record.type];
                return (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${typeInfo ? typeInfo[darkLight ? "dark" : "light"] : ""}`}>
                        {typeInfo?.label ?? record.type}
                    </span>
                );
            },
        },
        {
            title: 'Qty',
            key: 'quantity',
            align: 'center',
            width: 70,
            render: (_, record) => (
                <span className={`font-semibold text-sm ${darkLight ? "text-gray-200" : "text-gray-800"}`}>
                    {record.quantity || 0}
                </span>
            ),
        },
        {
            title: 'Total Price',
            key: 'totalPrice',
            align: 'right',
            width: 110,
            render: (_, record) => (
                <span className={`text-sm font-medium ${darkLight ? "text-gray-200" : "text-gray-800"}`}>
                    $ {record.totalPrice?.toFixed(2) ?? "0.00"}
                </span>
            ),
        },
        {
            title: 'Supplier',
            key: 'supplierName',
            ellipsis: true,
            render: (_, record) => (
                <span className={`text-xs ${darkLight ? "text-gray-400" : "text-gray-500"}`}>
                    {record.supplierName || "N/A"}
                </span>
            ),
        },
        {
            title: 'Reference',
            key: 'reference',
            width: 150,
            ellipsis: true,
            render: (_, record) => (
                <span className="text-xs font-mono text-blue-400">{record.reference || "N/A"}</span>
            ),
        },
        {
            title: 'Date',
            key: 'createdDate',
            width: 140,
            render: (_, record) => (
                <span className={`text-xs ${darkLight ? "text-gray-400" : "text-gray-500"}`}>
                    {record.createdDate ? new Date(record.createdDate).toLocaleString() : "N/A"}
                </span>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            width: 90,
            render: (_, record) => (
                <ComponentPermission scopes={["stockmovement:view"]}>
                    <button
                        onClick={() => setViewId(record.id)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${darkLight ? "bg-blue-900/40 text-blue-300 hover:bg-blue-900/60" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}
                    >
                        View
                    </button>
                </ComponentPermission>
            ),
        },
    ];

    return (
        <>
            <div className="flex items-center justify-between gap-2 my-2 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                    <MdInventory2 className={`w-7 h-7 sm:w-9 sm:h-9 drop-shadow-lg flex-shrink-0 ${darkLight ? "text-emerald-400" : "text-emerald-600"}`} />
                    <h3 className={`font-bold text-base sm:text-2xl truncate ${darkLight ? 'text-white' : 'text-gray-900'}`}>
                        STOCK MANAGEMENT
                    </h3>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    <StockInSummaryButton />
                    <ComponentPermission scopes={["stockmovement:create"]}>
                        <button onClick={handleOpenIn} className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white px-3 sm:px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap">
                            ➕ Stock In
                        </button>
                    </ComponentPermission>
                    <ComponentPermission scopes={["stockmovement:create"]}>
                        <button onClick={handleOpenOut} className="bg-red-500 hover:bg-red-600 active:scale-95 text-white px-3 sm:px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap">
                            ➖ Stock Out
                        </button>
                    </ComponentPermission>
                </div>
            </div>

            <XDataTable
                TableName='Stock movement list'
                columns={columns}
                apiUrl='stock/movements'
                selection={false}
                hideAction={true} // Keep true because we added custom Action column
                searchPlaceholder="Search by product, reference..."
            />

            {showInModal && <StockInForm onClose={handleCloseIn} onSuccess={handleCloseIn} />}
            {showOutModal && <StockOutForm onClose={handleCloseOut} onSuccess={handleCloseOut} />}

            {viewId !== null && <StockMovementDetail id={viewId} onClose={() => setViewId(null)} />}
        </>
    );
};

export default StockMovementList;