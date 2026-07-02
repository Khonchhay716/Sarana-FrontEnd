import type { TableColumnsType } from 'antd';
import { TbAdjustments } from 'react-icons/tb';
import { useState } from 'react';
import { useGlobleContextDarklight } from '../../../AllContext/context';
import XDataTable from '../../../component/XDataTable/XDataTable';
import StockAdjustmentForm from './StockAdjustmentForm';
import StockAdjustmentDetail from './AdjustmentViewDetail';
import ComponentPermission from '../../../component/ProtextRoute/ComponentPermissions';

interface StockAdjustmentRow {
    id: number;
    productId: number;
    productName: string;
    productSKU?: string;
    imageProduct?: string;
    typeAdjustment: string;
    qualityAdjustment: number;
    quantityBefore?: number;
    quantityAfter?: number;
    costPrice?: number;
    reason: string;
    note?: string;
    serialNumbers?: string[];
    createdDate: string;
    createdBy: { id: number; name: string } | null;
}

const TYPE_LABEL: Record<string, { label: string; icon: string; dark: string; light: string }> = {
    "Over": { label: "Over", icon: "📈", dark: "bg-emerald-900/40 text-emerald-300", light: "bg-emerald-100 text-emerald-700" },
    "Lost": { label: "Lost", icon: "📉", dark: "bg-red-900/40 text-red-300", light: "bg-red-100 text-red-700" },
};


const StockAdjustmentList = () => {
    const { darkLight } = useGlobleContextDarklight();
    const [showAdjustModal, setShowAdjustModal] = useState(false);

    const [viewId, setViewId] = useState<number | null>(null);

    const handleOpen = () => setShowAdjustModal(true);
    const handleClose = () => setShowAdjustModal(false);

    const columns: TableColumnsType<StockAdjustmentRow> = [
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
            key: 'typeAdjustment',
            align: 'center',
            width: 120,
            render: (_, record) => {
                const typeInfo = TYPE_LABEL[record.typeAdjustment];
                return (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${typeInfo ? typeInfo[darkLight ? "dark" : "light"] : ""}`}>
                        {typeInfo?.icon} {typeInfo?.label ?? "N/A"}
                    </span>
                );
            },
        },
        {
            title: 'Qty',
            key: 'qualityAdjustment',
            align: 'center',
            width: 80,
            render: (_, record) => (
                <span className={`font-semibold text-sm ${darkLight ? "text-gray-200" : "text-gray-800"}`}>
                    {record.qualityAdjustment ?? 0}
                </span>
            ),
        },
        {
            title: 'Reason',
            key: 'reason',
            width: 120,
            render: (_, record) => (
                <span className={`text-xs ${darkLight ? "text-gray-400" : "text-gray-500"}`}>
                    {record.reason ?? "N/A"}
                </span>
            ),
        },
        {
            title: 'Note',
            key: 'note',
            ellipsis: true,
            render: (_, record) => (
                <span className={`text-xs ${darkLight ? "text-gray-400" : "text-gray-500"}`}>
                    {record.note || "—"}
                </span>
            ),
        },
        {
            title: 'Date',
            key: 'createdDate',
            width: 160,
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
            width: 100,
            render: (_, record) => (
                <ComponentPermission scopes={["adjustment:view"]}>
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
                    <TbAdjustments className={`w-7 h-7 sm:w-9 sm:h-9 drop-shadow-lg flex-shrink-0 ${darkLight ? "text-amber-400" : "text-amber-600"}`} />
                    <h3 className={`font-bold text-base sm:text-2xl truncate ${darkLight ? 'text-white' : 'text-gray-900'}`}>
                        STOCK ADJUSTMENT
                    </h3>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    <ComponentPermission scopes={["adjustment:create"]}>
                        <button
                            onClick={handleOpen}
                            className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white px-3 sm:px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                        >
                            ⚖️ New Adjustment
                        </button>
                    </ComponentPermission>
                </div>
            </div>

            <XDataTable
                TableName='Stock adjustment list'
                columns={columns}
                apiUrl='stock/adjustments'
                selection={false}
                hideAction={true}
                searchPlaceholder="Search by product..."
            />

            {showAdjustModal && (
                <StockAdjustmentForm
                    onClose={handleClose}
                    onSuccess={handleClose}
                />
            )}
            {viewId !== null && (
                <StockAdjustmentDetail
                    id={viewId}
                    onClose={() => setViewId(null)}
                />
            )}
        </>
    );
};


export default StockAdjustmentList;