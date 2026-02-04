import { useEffect, useRef, useState } from "react";
import { useGlobleContextDarklight } from "../../AllContext/context";
import { HookIntergrateAPI } from "../../component/HookintagrateAPI/HookintegarteApi";
import { alertError } from "../../HtmlHelper/Alert";
import XSelectSearch, { SingleValue } from "../../component/XSelectSearch/Xselectsearch";

interface BookFormData {
    id?: number;
    title: string;
    categoryId: number;
    author: string;
    subject: string;
    isbn: string;
    publisher: string;
    edition: string;
    publishedYear: string;
    totalQty: number;
    availableQty: number;
    price: number;
    rackNo: string;
    no: string;
}

interface BookFormProps {
    bookId?: number;
    onClose: () => void;
}

const BookForm = ({ bookId, onClose }: BookFormProps) => {
    const { darkLight } = useGlobleContextDarklight();
    const { createData, updateData, GetDatabyID, loading } = HookIntergrateAPI<BookFormData>();
    const [isAnimating, setIsAnimating] = useState(false);
    const hasInitialized = useRef(false);

    const [formData, setFormData] = useState<BookFormData>({
        title: "",
        categoryId: 0,
        author: "",
        subject: "",
        isbn: "",
        publisher: "",
        edition: "",
        publishedYear: new Date().toISOString(),
        totalQty: 0,
        availableQty: 0,
        price: 0,
        rackNo: "",
        no: "",
    });

    const [selectedCategory, setSelectedCategory] = useState<SingleValue | any>(null);

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;
        setTimeout(() => setIsAnimating(true), 10);
        if (bookId) {
            loadBookData();
        }
    }, [bookId]);

    const loadBookData = async () => {
        if (!bookId) return;
        const data: any = await GetDatabyID("Book", bookId);
        if (data) {
            setFormData({
                id: data.id,
                title: data.title || "",
                categoryId: data.categoryId || 0,
                author: data.author || "",
                subject: data.subject || "",
                isbn: data.isbn || "",
                publisher: data.publisher || "",
                edition: data.edition || "",
                publishedYear: data.publishedYear || new Date().toISOString(),
                totalQty: data.totalQty || 0,
                availableQty: data.availableQty || 0,
                price: data.price || 0,
                rackNo: data.rackNo || "",
                no: data.no || "",
            });

            // Set selected category if exists
            if (data.category) {
                setSelectedCategory({
                    id: data.category.id,
                    name: data.category.name,
                    value: data.category.id,
                });
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "number" ? Number(value) : value,
        }));
    };

    const handleCategoryChange = (value: SingleValue | null) => {
        setSelectedCategory(value);
        setFormData((prev) => ({
            ...prev,
            categoryId: value ? Number(value.id) : 0,
        }));
    };

    // ... rest of the code stays the same
    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            alertError("Title is required!");
            return;
        }
        if (!formData.categoryId || formData.categoryId === 0) {
            alertError("Category is required!");
            return;
        }
        if (!formData.author.trim()) {
            alertError("Author is required!");
            return;
        }
        if (!formData.isbn.trim()) {
            alertError("ISBN is required!");
            return;
        }
        if (!formData.publisher.trim()) {
            alertError("Publisher is required!");
            return;
        }

        if (bookId) {
            await updateData("Book", bookId, formData, () => {
                setTimeout(() => {
                    handleClose();
                }, 500);
            });
        } else {
            await createData("Book", formData, () => {
                setTimeout(() => {
                    handleClose();
                }, 500);
            });
        }
    };

    const inputClass = `w-full px-4 py-2.5 rounded-lg border transition-all duration-200 ${darkLight
        ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:bg-gray-700 focus:border-blue-500"
        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-blue-50/30"
        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`;

    const labelClass = `block mb-1.5 text-sm font-semibold ${darkLight ? "text-gray-200" : "text-gray-700"
        }`;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'
                    }`}
            />

            {/* Modal */}
            <div
                className={`fixed mt-15 inset-0 flex items-center justify-center z-50 p-4 pointer-events-none transition-all duration-300 ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}
            >
                <div
                    className={`rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden pointer-events-auto transform transition-all duration-300 ${darkLight ? "bg-gray-800" : "bg-white"
                        } ${isAnimating ? 'translate-y-0' : 'translate-y-4'}`}
                    style={{ maxHeight: 'calc(100vh - 80px)' }}
                >
                    {/* Header */}
                    <div
                        className={`px-6 py-4 border-b flex-shrink-0 ${darkLight
                            ? "bg-gray-800 border-gray-700"
                            : "bg-white border-gray-200"
                            }`}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h2
                                    className={`text-2xl font-bold ${darkLight ? "text-white" : "text-gray-900"
                                        }`}
                                >
                                    {bookId ? "Edit Book" : "Add New Book"}
                                </h2>
                                <p className={`text-sm mt-1 ${darkLight ? "text-gray-400" : "text-gray-500"}`}>
                                    {bookId ? "Update book information" : "Fill in the details to create a new book"}
                                </p>
                            </div>
                            <button
                                onClick={handleClose}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xl transition-all ${darkLight
                                    ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                        {/* Body - Scrollable */}
                        <div
                            className="overflow-y-auto flex-1 px-6 py-5 custom-scrollbar"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: darkLight ? '#4a5568 transparent' : '#cbd5e0 transparent',
                            }}
                        >
                            <style>{`
                                .custom-scrollbar::-webkit-scrollbar {
                                    width: 6px;
                                }
                                .custom-scrollbar::-webkit-scrollbar-track {
                                    background: transparent;
                                }
                                .custom-scrollbar::-webkit-scrollbar-thumb {
                                    background: transparent;
                                    border-radius: 3px;
                                    transition: background 0.2s;
                                }
                                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                                    background: ${darkLight ? '#4a5568' : '#cbd5e0'};
                                }
                                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                    background: ${darkLight ? '#718096' : '#a0aec0'};
                                }
                            `}</style>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Title */}
                                <div className="">
                                    <label className={labelClass}>
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="Enter book title"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className={labelClass}>
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <XSelectSearch
                                        value={selectedCategory}
                                        onChange={handleCategoryChange}
                                        multiple={false}
                                        placeholder="Select category"
                                        selectOption={{
                                            apiEndpoint: "Category/lookup",
                                            id: "id",
                                            name: "name",
                                            value: "id",
                                            pageSize: 20,
                                            searchParam: "Search",
                                        }}
                                        isSearchable={true}
                                    />
                                </div>

                                {/* Author */}
                                <div>
                                    <label className={labelClass}>
                                        Author <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="author"
                                        value={formData.author}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="Enter author name"
                                    />
                                </div>

                                {/* Subject */}
                                <div>
                                    <label className={labelClass}>Subject</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="Enter subject"
                                    />
                                </div>

                                {/* ISBN */}
                                <div>
                                    <label className={labelClass}>
                                        ISBN <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="isbn"
                                        value={formData.isbn}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="Enter ISBN"
                                    />
                                </div>

                                {/* Publisher */}
                                <div>
                                    <label className={labelClass}>
                                        Publisher <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="publisher"
                                        value={formData.publisher}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="Enter publisher"
                                    />
                                </div>

                                {/* Edition */}
                                <div>
                                    <label className={labelClass}>Edition</label>
                                    <input
                                        type="text"
                                        name="edition"
                                        value={formData.edition}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="Enter edition"
                                    />
                                </div>

                                {/* Published Year */}
                                <div>
                                    <label className={labelClass}>Published Year</label>
                                    <input
                                        type="date"
                                        name="publishedYear"
                                        value={formData.publishedYear.split('T')[0]}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                    />
                                </div>

                                {/* Total Quantity */}
                                <div>
                                    <label className={labelClass}>Total Quantity</label>
                                    <input
                                        type="number"
                                        name="totalQty"
                                        value={formData.totalQty}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="Enter total quantity"
                                        min="0"
                                    />
                                </div>

                                {/* Available Quantity
                                <div>
                                    <label className={labelClass}>Available Quantity</label>
                                    <input
                                        type="number"
                                        name="availableQty"
                                        value={formData.availableQty}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="Enter available quantity"
                                        min="0"
                                    />
                                </div> */}

                                {/* Price */}
                                <div>
                                    <label className={labelClass}>Price</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="Enter price"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                {/* Rack No */}
                                <div>
                                    <label className={labelClass}>Rack No</label>
                                    <input
                                        type="text"
                                        name="rackNo"
                                        value={formData.rackNo}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="Enter rack number"
                                    />
                                </div>

                                {/* No */}
                                <div>
                                    <label className={labelClass}>No</label>
                                    <input
                                        type="text"
                                        name="no"
                                        value={formData.no}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="Enter number"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className={`px-6 py-4 border-t flex-shrink-0 ${darkLight ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
                            }`}>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className={`px-6 py-2.5 rounded-lg font-medium transition-all ${darkLight
                                        ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-8 py-2.5 rounded-lg font-medium transition-all shadow-lg ${loading
                                        ? "bg-blue-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl"
                                        } text-white disabled:opacity-50`}
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Saving...
                                        </span>
                                    ) : (
                                        bookId ? "Update Book" : "Create Book"
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default BookForm;