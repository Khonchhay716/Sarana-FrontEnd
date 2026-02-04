import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import AsyncSelect from "react-select/async";
import {
    StylesConfig,
    SingleValue as ReactSelectSingleValue,
    MultiValue as ReactSelectMultiValue
} from "react-select";
import { AxiosApi } from "../Axios/Axios";
import {
    useGlobleContextDarklight,
} from "../../AllContext/context";

interface ApiItem {
    [key: string]: any;
}
interface SelectOption {
    id: number | string;
    name: string;
    label: string;
    value: any;
    data: ApiItem | null;
}

interface SelectConfig {
    id?: string;
    name?: string;
    value?: string;
    fetchAll?: boolean;
    pageSize?: number;
    searchParam?: string;
    apiEndpoint: string;
}

interface ApiResponse {
    data?: ApiItem[];
    items?: ApiItem[];
    results?: ApiItem[];
    [key: string]: any;
}

interface SingleValue {
    id: number | string;
    name: string;
    value: any;
    data: ApiItem | null;
}

type MultiValue = SingleValue[];

interface XSelectSearchPropsBase {
    value: SingleValue | MultiValue | number | string | null;
    placeholder?: string;
    disabled?: boolean;
    clearable?: boolean;
    selectOption: SelectConfig;
    isSearchable?: boolean;
    loadingMessage?: string;
    noOptionsMessage?: string;
    isFile?: boolean;
    required?: boolean;
    onCreateNew?: (inputValue: string) => Promise<void> | void;
    bgColor?: string;
}

interface XSelectSearchPropsSingle extends XSelectSearchPropsBase {
    multiple?: false;
    onChange: (value: SingleValue | null) => void;
}

interface XSelectSearchPropsMulti extends XSelectSearchPropsBase {
    multiple: true;
    onChange: (value: MultiValue) => void;
}

type XSelectSearchProps = XSelectSearchPropsSingle | XSelectSearchPropsMulti;


export default function XSelectSearch({
    value,
    onChange,
    multiple = false,
    placeholder = "Select...",
    disabled = false,
    clearable = true,
    selectOption,
    isSearchable = true,
    loadingMessage = "Loading...",
    noOptionsMessage = "No options found",
    required = false,
    onCreateNew,
    bgColor,
}: XSelectSearchProps) {
    const { darkLight } = useGlobleContextDarklight();
    const [defaultOptions, setDefaultOptions] = useState<SelectOption[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const hasLoadedRef = useRef<boolean>(false);
    const hiddenInputRef = useRef<HTMLInputElement>(null);
    const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);
    const [internalRefreshKey, setInternalRefreshKey] = useState<number>(0);

    const idKey = selectOption?.id || "id";
    const nameKey = selectOption?.name || "name";
    const valueKey = selectOption?.value || "value";
    const fetchAll = selectOption?.fetchAll === true;
    const pageSize = fetchAll ? null : selectOption?.pageSize || 10;
    const searchParam = selectOption?.searchParam || "Search";
    const apiEndpoint = selectOption?.apiEndpoint;

    const mapItem = useCallback((item: ApiItem): SelectOption | null => {
        const itemId = item?.[idKey];
        if (itemId === 0 || itemId === null || itemId === undefined) {
            return null;
        }

        let labelValue = item?.[nameKey] ?? item?.[idKey]?.toString() ?? "";

        if (nameKey.includes("+")) {
            const keys = nameKey.split("+").map((k) => k.trim());
            labelValue = keys
                .map((k) => item?.[k])
                .filter(Boolean)
                .join(" - ");
        }

        return {
            id: itemId,
            name: labelValue,
            label: labelValue,
            value: item?.[valueKey] ?? null,
            data: item,
        };
    }, [idKey, nameKey, valueKey]);

    const reloadDefaultOptions = useCallback(async (): Promise<void> => {
        if (!apiEndpoint) return;

        try {
            setIsLoading(true);

            const res = await AxiosApi.get<ApiResponse>(apiEndpoint, {
                params: {
                    page: 1,
                    pageSize,
                    [searchParam]: "",
                },
            });

            const responseData = res.data;
            const items =
                responseData?.data ||
                responseData?.items ||
                responseData?.results ||
                res.data;

            if (Array.isArray(items)) {
                setDefaultOptions(items.map(mapItem).filter(Boolean) as SelectOption[]);
            } else {
                console.warn("Unexpected API response:", items);
                setDefaultOptions([]);
            }
        } catch (err) {
            console.error("Error loading options:", err);
            setDefaultOptions([]);
        } finally {
            setIsLoading(false);
        }
    }, [apiEndpoint, pageSize, searchParam, mapItem]);

    useEffect(() => {
        if (hasLoadedRef.current || !apiEndpoint) return;
        hasLoadedRef.current = true;
        reloadDefaultOptions();
    }, [apiEndpoint, reloadDefaultOptions]);

    const loadOptions = useCallback(async (inputValue: string): Promise<SelectOption[]> => {
        if (!apiEndpoint) return [];

        try {
            const res = await AxiosApi.get<ApiResponse>(apiEndpoint, {
                params: {
                    [searchParam]: inputValue,
                    page: 1,
                    pageSize,
                },
            });

            const responseData = res.data;
            const items =
                responseData?.data ||
                responseData?.items ||
                responseData?.results ||
                res.data;

            if (Array.isArray(items)) {
                return items.map(mapItem).filter(Boolean) as SelectOption[];
            }
            return [];
        } catch (err) {
            console.error("Search error:", err);
            return [];
        }
    }, [apiEndpoint, searchParam, pageSize, mapItem]);

    const currentValue = useMemo<SelectOption | SelectOption[] | null>(() => {
        if (value === null || value === undefined || value === "") {
            return multiple ? [] : null;
        }

        if (multiple && Array.isArray(value)) {
            return value
                .map((val: any) => {
                    const idToFind = typeof val === 'object' && val !== null ? val.id : val;
                    const canonicalOption = defaultOptions.find(
                        (opt) => opt.id === idToFind || opt.value === idToFind
                    );

                    if (canonicalOption) {
                        return canonicalOption;
                    }

                    if (
                        typeof val === "object" &&
                        val !== null &&
                        'id' in val &&
                        val.id !== 0 &&
                        val.id !== null &&
                        val.id !== undefined
                    ) {
                        return {
                            id: val.id,
                            name: val.name || String(val.id),
                            label: val.name || String(val.id),
                            value: val.value ?? null,
                            data: val.data ?? null,
                        } as SelectOption;
                    }

                    return null;
                })
                .filter((item): item is SelectOption => item !== null);
        }

        // Single select logic
        if (typeof value === "object" && value !== null && 'id' in value) {
            const canonicalOption = defaultOptions.find(
                (opt) => opt.id === (value as SingleValue).id || opt.value === (value as SingleValue).id
            );
            if (canonicalOption) return canonicalOption;

            const singleVal = value as SingleValue;
            if (singleVal.id === 0 || singleVal.id === null || singleVal.id === undefined) {
                return null;
            }

            // Fallback for single select
            return {
                id: singleVal.id,
                name: singleVal.name || String(singleVal.id),
                label: singleVal.name || String(singleVal.id),
                value: singleVal.value ?? null,
                data: singleVal.data ?? null,
            } as SelectOption;
        }

        // Handle primitive values (number | string)
        return (
            defaultOptions.find((opt) => opt.id === value || opt.value === value) ||
            null
        );
    }, [value, defaultOptions, multiple]);

    useEffect(() => {
        if (hiddenInputRef.current && required) {
            const isValid = multiple
                ? Array.isArray(currentValue) && currentValue.length > 0
                : !!currentValue;
            hiddenInputRef.current.value = isValid ? "valid" : "";
        }
    }, [currentValue, required, multiple]);

    const handleChange = (
        newValue: ReactSelectMultiValue<SelectOption> | ReactSelectSingleValue<SelectOption>
    ): void => {
        if (multiple) {
            const selected = Array.from(newValue as readonly SelectOption[] || []);
            const mappedValues: MultiValue = selected.map((opt) => ({
                id: opt.id,
                name: opt.name,
                value: opt.value,
                data: opt.data,
            }));
            (onChange as (value: MultiValue) => void)(mappedValues);

            setDefaultOptions((prev) => {
                const existingIds = new Set(prev.map((p) => p.id));
                const newOnes = selected.filter((v) => !existingIds.has(v.id));
                return [...prev, ...newOnes];
            });
        } else {
            const val = newValue as SelectOption | null;
            const singleValue: SingleValue | null = val
                ? {
                    id: val.id,
                    name: val.name,
                    value: val.value,
                    data: val.data,
                }
                : null;
            // Type assertion needed because of discriminated union
            (onChange as (value: SingleValue | null) => void)(singleValue);

            if (val) {
                setDefaultOptions((prev) => {
                    if (prev.some((p) => p.id === val.id)) return prev;
                    return [...prev, val];
                });
            }
        }
    };

    const handleCreateClick = async (inputValue: string): Promise<void> => {
        if (onCreateNew) {
            await onCreateNew(inputValue);
            await reloadDefaultOptions();
            setInternalRefreshKey((prev) => prev + 1);
        }
        setMenuIsOpen(false);
    };

    const customStyles: StylesConfig<SelectOption, boolean> = {
        control: (base) => ({
            ...base,
            backgroundColor: disabled
                ? (darkLight ? "#2d3748" : "#edf2f7")
                : (bgColor || (darkLight ? "#1a202c" : "#ffffff")),
            borderColor: darkLight ? "#4a5568" : "#e2e8f0",
            color: darkLight ? "#e2e8f0" : "#2d3748",
            "&:hover": {
                borderColor: darkLight ? "#718096" : "#cbd5e0"
            },
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: darkLight ? "#2d3748" : "#ffffff",
            border: `1px solid ${darkLight ? "#4a5568" : "#e2e8f0"}`,
        }),
        menuList: (base) => ({
            ...base,
            backgroundColor: darkLight ? "#2d3748" : "#ffffff",
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
                ? (darkLight ? "#3182ce" : "#3182ce")
                : (darkLight ? "#2d3748" : "#ffffff"),
            color: state.isSelected
                ? "#ffffff"
                : (darkLight ? "#e2e8f0" : "#2d3748"),
            "&:active": {
                backgroundColor: state.isSelected
                    ? (darkLight ? "#3182ce" : "#3182ce")
                    : (darkLight ? "#2d3748" : "#ffffff"),
            },
        }),
        singleValue: (base) => ({
            ...base,
            color: darkLight ? "#e2e8f0" : "#2d3748",
        }),
        multiValue: (base) => ({
            ...base,
            backgroundColor: darkLight ? "#4a5568" : "#edf2f7",
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: darkLight ? "#e2e8f0" : "#2d3748",
        }),
        multiValueRemove: (base) => ({
            ...base,
            color: darkLight ? "#e2e8f0" : "#2d3748",
            "&:hover": {
                backgroundColor: darkLight ? "#718096" : "#cbd5e0",
                color: darkLight ? "#ffffff" : "#2d3748",
            },
        }),
        input: (base) => ({
            ...base,
            color: darkLight ? "#e2e8f0" : "#2d3748",
        }),
        placeholder: (base) => ({
            ...base,
            color: darkLight ? "#a0aec0" : "#a0aec0",
        }),
        indicatorSeparator: (base) => ({
            ...base,
            backgroundColor: darkLight ? "#4a5568" : "#e2e8f0",
        }),
        dropdownIndicator: (base) => ({
            ...base,
            color: darkLight ? "#a0aec0" : "#a0aec0",
            "&:hover": {
                color: darkLight ? "#e2e8f0" : "#2d3748",
            },
        }),
        clearIndicator: (base) => ({
            ...base,
            color: darkLight ? "#a0aec0" : "#a0aec0",
            "&:hover": {
                color: darkLight ? "#e2e8f0" : "#2d3748",
            },
        }),
        loadingIndicator: (base) => ({
            ...base,
            color: darkLight ? "#a0aec0" : "#a0aec0",
        }),
        noOptionsMessage: (base) => ({
            ...base,
            color: darkLight ? "#e2e8f0" : "#2d3748",
        }),
        loadingMessage: (base) => ({
            ...base,
            color: darkLight ? "#e2e8f0" : "#2d3748",
        }),
        menuPortal: (base) => ({
            ...base,
            zIndex: 9999
        }),
    };

    return (
        <div>
            <AsyncSelect<SelectOption, boolean>
                key={internalRefreshKey}
                cacheOptions={false}
                value={currentValue}
                onChange={handleChange}
                loadOptions={loadOptions}
                defaultOptions={defaultOptions}
                isMulti={multiple}
                isClearable={clearable}
                isDisabled={disabled}
                isSearchable={isSearchable}
                placeholder={placeholder}
                loadingMessage={() => loadingMessage}
                noOptionsMessage={({ inputValue }) => {
                    if (inputValue && onCreateNew) {
                        return (
                            <div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCreateClick(inputValue);
                                    }}
                                    style={{
                                        width: "100%",
                                        padding: "8px 12px",
                                        cursor: "pointer",
                                        border: `1px solid ${darkLight ? "#4a5568" : "#cbd5e0"}`,
                                        borderRadius: "4px",
                                        background: darkLight ? "#4a5568" : "#f7fafc",
                                        color: darkLight ? "#e2e8f0" : "#2d3748",
                                        fontSize: "14px",
                                        fontWeight: "500",
                                    }}
                                >
                                    + Create "{inputValue}"
                                </button>
                            </div>
                        );
                    }
                    return noOptionsMessage;
                }}
                getOptionLabel={(opt) => opt.name}
                getOptionValue={(opt) => String(opt.value !== null ? opt.value : opt.id)}
                isLoading={isLoading}
                menuPortalTarget={document.body}
                menuIsOpen={menuIsOpen}
                onMenuOpen={() => setMenuIsOpen(true)}
                onMenuClose={() => setMenuIsOpen(false)}
                styles={customStyles}
            />

            {required && (
                <input
                    ref={hiddenInputRef}
                    type="text"
                    name={selectOption?.id || "xselect-required"}
                    required
                    aria-hidden="true"
                    tabIndex={-1}
                    style={{
                        position: "absolute",
                        opacity: 0,
                        height: 0,
                        width: 0,
                        pointerEvents: "none",
                    }}
                    value=""
                    onChange={() => { }}
                />
            )}

        </div>
    );
}

export type {
    SingleValue,
    MultiValue,
    SelectOption,
    SelectConfig,
    ApiItem,
    ApiResponse
};