import React, { useCallback, useEffect, useRef, useState } from "react";
import { Table, Dropdown, MenuProps } from "antd";
import type { TableColumnsType, TablePaginationConfig } from "antd";
import "./XdataTable.css";
import {
    useGlobleContextDarklight,
    useRefreshTable,
} from "../../AllContext/context";
import { AxiosApi } from "../Axios/Axios";

interface XDataTableProps<T> {
    columns: TableColumnsType<T>;
    dataSource?: T[];
    apiUrl?: string;
    selection?: boolean;
    startAtLastPage?: boolean;
    hideAction?: boolean;
    TableName?: string;
    onEdit?: (record: T) => void;
    onDelete?: (record: T) => void;
    refreshTrigger?: number;
    minHeight?: string;
    searchPlaceholder?: string;
    extraParams?: Record<string, string>;
}


const XDataTable = <T extends Record<string, any>>({
    columns = [],
    dataSource: localData,
    apiUrl,
    selection = true,
    startAtLastPage = false,
    hideAction = false,
    TableName,
    onEdit,
    onDelete,
    refreshTrigger = 0,
    searchPlaceholder = "Search users...",
    extraParams,
}: XDataTableProps<T>) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [searchText, setSearchText] = useState("");
    const [filteredDataSource, setFilteredDataSource] = useState<T[]>(
        localData || []
    );
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // ✅ FIX 1: Use refs instead of state for initialLoad to avoid stale closure in useCallback
    const initialLoadRef = useRef(true);
    const ranRef = useRef(false);
    const searchTimeout = useRef<number | null>(null);

    // ✅ FIX 2: Keep latest extraParams in a ref so fetchData always reads fresh value
    const extraParamsRef = useRef(extraParams);
    useEffect(() => {
        extraParamsRef.current = extraParams;
    }, [extraParams]);

    const { darkLight } = useGlobleContextDarklight();
    const { refreshTables } = useRefreshTable();

    const getNestedValue = (obj: any, path: string | string[]): any => {
        if (!path) return undefined;
        const keys = Array.isArray(path) ? path : path.split(".");
        return keys.reduce((acc, key) => acc?.[key], obj);
    };

    const ActionMenu = ({ record }: { record: T }) => {
        const menuItems: MenuProps["items"] = [
            {
                key: "edit",
                label: (
                    <div
                        onClick={(e) => {
                            e.preventDefault();
                            onEdit?.(record);
                        }}
                        style={{ padding: "5px 12px" }}
                    >
                        Edit
                    </div>
                ),
            },
            {
                key: "delete",
                label: (
                    <div
                        onClick={(e) => {
                            e.preventDefault();
                            onDelete?.(record);
                        }}
                        style={{ padding: "5px 12px", color: "#ff4d4f" }}
                    >
                        Delete
                    </div>
                ),
            },
        ];

        return (
            <Dropdown
                menu={{ items: menuItems }}
                trigger={["click"]}
                placement="bottomRight"
            >
                <div
                    onClick={(e) => e.preventDefault()}
                    style={{ cursor: "pointer", userSelect: "none" }}
                >
                    •••
                </div>
            </Dropdown>
        );
    };

    const finalColumns = hideAction
        ? columns
        : [
            ...columns,
            {
                title: "Action",
                key: "action",
                width: 80,
                align: "center" as const,
                render: (_: any, record: T) => <ActionMenu record={record} />,
            },
        ];

    // ✅ FIX 3: Removed `initialLoad` from useCallback deps — use ref instead
    // ✅ FIX 4: Use `??` (nullish coalescing) instead of `||` so totalItems: 0 doesn't fall back to list.length
    // ✅ FIX 5: Support multiple common API response shapes for totalItems
    const fetchData = useCallback(
        async (page = 1, size = 10, search = "") => {
            setLoading(true);
            try {
                if (apiUrl) {
                    const res = await AxiosApi.get(apiUrl, {
                        params: {
                            page,
                            pageSize: size,
                            search,
                            ...extraParamsRef.current,
                        },
                    });

                    const list = res.data.data ?? [];

                    // ✅ API returns pagination at root level: totalCount, page, pageSize, totalPages
                    const total =
                        res.data.totalCount ??
                        res.data.totalItems ??
                        res.data.total ??
                        res.data.count ??
                        list.length;

                    const resPage = res.data.page ?? page;
                    const resPageSize = res.data.pageSize ?? size;

                    setFilteredDataSource(list);
                    setCurrentPage(resPage);
                    setPageSize(resPageSize);
                    setTotalItems(total);

                } else if (localData) {
                    let list = localData;

                    if (search) {
                        list = localData.filter((record) =>
                            columns.some((col: any) => {
                                const val = getNestedValue(record, col.dataIndex);
                                return val
                                    ? String(val)
                                        .toLowerCase()
                                        .includes(search.toLowerCase())
                                    : false;
                            })
                        );
                    }

                    const startIndex = (page - 1) * size;
                    const endIndex = startIndex + size;
                    const paginatedList = list.slice(startIndex, endIndex);
                    const computedTotal = list.length;

                    setFilteredDataSource(paginatedList);
                    setTotalItems(computedTotal);

                    // ✅ FIX 6: startAtLastPage only applied on first load, not every fetch
                    if (startAtLastPage && initialLoadRef.current) {
                        setCurrentPage(Math.ceil(computedTotal / size) || 1);
                    } else {
                        setCurrentPage(page);
                    }
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
                // ✅ FIX 7: Mark initial load done via ref — no re-render, no stale closure
                initialLoadRef.current = false;
            }
        },
        // ✅ FIX 8: extraParams removed from deps (read via ref), initialLoad removed
        [apiUrl, localData, columns, startAtLastPage]
    );

    // Initial data fetch — runs once
    useEffect(() => {
        if (ranRef.current) return;
        ranRef.current = true;
        fetchData(1, pageSize, searchText);
    }, []);

    // ✅ FIX 9: Re-fetch when extraParams changes — safely without stale closure
    const prevExtraParamsRef = useRef<string>("");
    useEffect(() => {
        const serialized = JSON.stringify(extraParams);
        if (prevExtraParamsRef.current === "" ) {
            prevExtraParamsRef.current = serialized;
            return;
        }
        if (prevExtraParamsRef.current !== serialized) {
            prevExtraParamsRef.current = serialized;
            if (!initialLoadRef.current) {
                fetchData(1, pageSize, searchText);
            }
        }
    }, [extraParams]);

    // Refresh when refreshTrigger prop changes
    useEffect(() => {
        if (!initialLoadRef.current && refreshTrigger > 0) {
            fetchData(currentPage, pageSize, searchText);
        }
    }, [refreshTrigger]);

    // Refresh when global refreshTables context changes
    useEffect(() => {
        if (!initialLoadRef.current && refreshTables > 0) {
            fetchData(currentPage, pageSize, searchText);
        }
    }, [refreshTables]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchText(value);

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        searchTimeout.current = window.setTimeout(() => {
            fetchData(1, pageSize, value);
        }, 500);
    };

    const handleTableChange = (pagination: TablePaginationConfig) => {
        const { current = 1, pageSize: newPageSize = 10 } = pagination;

        if (newPageSize !== pageSize) {
            setPageSize(newPageSize);
            fetchData(1, newPageSize, searchText);
        } else {
            setCurrentPage(current);
            fetchData(current, pageSize, searchText);
        }
    };

    const rowSelection = selection
        ? {
            selectedRowKeys,
            onChange: (newSelectedRowKeys: React.Key[]) => {
                setSelectedRowKeys(newSelectedRowKeys);
            },
        }
        : undefined;

    return (
        <div
            className={`w-full mb-15 rounded-lg shadow-sm ${
                darkLight
                    ? "bg-gray-900 border border-gray-800"
                    : "bg-white border border-gray-200"
            }`}
        >
            <div
                className={`px-2 py-1 border-b ${
                    darkLight ? "border-gray-800" : "border-gray-200"
                }`}
            >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3
                        className={`font-bold text-2xl ${
                            darkLight ? "text-gray-100" : "text-gray-900"
                        }`}
                    >
                        {TableName ?? "Data List"}
                    </h3>
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchText}
                        onChange={handleSearch}
                        className={`
                            w-full sm:w-64 px-4 py-2 rounded-lg border transition-all duration-200
                            ${
                                darkLight
                                    ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            }
                            focus:outline-none
                        `}
                    />
                </div>
            </div>
            <div className="overflow-hidden">
                <Table<T>
                    className={`xdata-table ${
                        darkLight ? "xdata-table-dark" : "xdata-table-light"
                    }`}
                    rowClassName={() => "xdata-table-row"}
                    rowKey={(record, index) => {
                        if (record.id) return `row-${record.id}`;
                        if (record.key) return `row-${record.key}`;
                        return `row-${index ?? 0}`;
                    }}
                    columns={finalColumns}
                    dataSource={filteredDataSource}
                    loading={{
                        spinning: loading,
                        tip: "Loading...",
                    }}
                    rowSelection={rowSelection}
                    scroll={{ x: "max-content" }}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: totalItems,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "20", "30", "50"],
                        showTotal: (total) => `Total ${total} records`,
                        locale: { items_per_page: "" },
                        onChange: (page, size) => {
                            handleTableChange({ current: page, pageSize: size });
                        },
                        responsive: true,
                        position: ["bottomLeft"],
                    }}
                />
            </div>
        </div>
    );
};

export default XDataTable;