import type { TableColumnsType } from 'antd';
import XDataTable from '../../component/XDataTable/XDataTable';
import { MdOutlineEventNote } from 'react-icons/md';
import { useState } from 'react';
import { useGlobleContextDarklight, useRefreshTable } from '../../AllContext/context';
import LeaveTypeForm from './LeaveTypeForm';
import { HookIntergrateAPI } from '../../component/HookintagrateAPI/HookintegarteApi';
import ComponentPermission from '../../component/ProtextRoute/ComponentPermissions';

interface LeaveType {
    id: number;
    name: string;
    maxDaysPerYear: number;
    description: string;
    isActive: boolean;
}

const LeaveTypeList = () => {
    const { darkLight } = useGlobleContextDarklight();
    const [showModal, setShowModal] = useState(false);
    const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
    const { DeleteData } = HookIntergrateAPI();
    const { setRefreshTables } = useRefreshTable();

    const columns: TableColumnsType<LeaveType> = [
        {
            title: 'Leave Name',
            dataIndex: 'name',
            key: 'name',
            render: (name: string) => <span className="font-bold">{name}</span>,
        },
        {
            title: 'Max Days / Year',
            dataIndex: 'maxDaysPerYear',
            key: 'maxDaysPerYear',
            align: 'center',
            render: (days: number) => <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold">{days} Days</span>,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            width: '350px',
            render: (name: string) => (
                <span
                    className="font-bold"
                    style={{
                        display: 'inline-block',
                        maxWidth: '350px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {name}
                </span>
            ),
        },
        {
            title: 'Status',
            key: 'isActive',
            align: 'center',
            render: (_, record) => (
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${record.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {record.isActive ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            width: 150,
            render: (_, record) => (
                <div className="flex gap-2 justify-center">
                    <button onClick={() => { setSelectedId(record.id); setShowModal(true); }}
                        className="px-3 py-1.5 bg-blue-500 text-white rounded text-xs">Edit</button>
                    <button onClick={() => handleDelete(record.id)}
                        className="px-3 py-1.5 bg-red-500 text-white rounded text-xs">Delete</button>
                </div>
            ),
        },
    ];

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this leave type?")) {
            await DeleteData("LeaveType", id);
            setRefreshTables(new Date());
        }
    };

    return (
        <>
            <div className='flex justify-between my-4 items-center'>
                <div className='flex items-center gap-3'>
                    <MdOutlineEventNote className="w-[40px] h-[40px] text-blue-500" />
                    <h3 className={`font-bold text-2xl ${darkLight ? 'text-white' : 'text-gray-900'}`}>LEAVE TYPE MANAGEMENT</h3>
                </div>
                <button onClick={() => { setSelectedId(undefined); setShowModal(true); }}
                    className='bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md transition-all'>
                    + Add Leave Type
                </button>
            </div>

            <XDataTable
                TableName='Leave Type list'
                columns={columns}
                apiUrl='LeaveType'
                selection={false}
                hideAction={true}
                searchPlaceholder="Search leave types..."
            />

            {showModal && <LeaveTypeForm leaveTypeId={selectedId} onClose={() => setShowModal(false)} />}
        </>
    );
};

export default LeaveTypeList;