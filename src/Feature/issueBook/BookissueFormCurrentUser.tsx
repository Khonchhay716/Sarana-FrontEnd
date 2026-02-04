import { useEffect, useRef, useState } from "react";
import { useGlobleContextDarklight } from "../../AllContext/context";
import { HookIntergrateAPI } from "../../component/HookintagrateAPI/HookintegarteApi";
import { alertError } from "../../HtmlHelper/Alert";
import XSelectSearch, { SingleValue } from "../../component/XSelectSearch/Xselectsearch";
import { AxiosApi } from "../../component/Axios/Axios";

interface BookIssueFormData {
    id?: number;
    bookId: number;
    libraryMemberId: number;
    dueDays: number;
    notes: string;
}

interface BookIssueFormProps {
    bookIssueId?: number;
    onClose: () => void;
}

const BookIssueFormCurrentUser = ({ bookIssueId, onClose }: BookIssueFormProps) => {
    const { darkLight } = useGlobleContextDarklight();
    const { createData, updateData, GetDatabyID, loading } = HookIntergrateAPI<BookIssueFormData>();
    const [isAnimating, setIsAnimating] = useState(false);
    const hasInitialized = useRef(false);
    const calledOnce = useRef(false);

    // Get current user's library member
    const GetCurrentLibraryMember = async () => {
        try {
            const res: any = await AxiosApi.get("LibraryMember/CureentUser");
            console.log("res ", res);
            if (res?.data?.data) {

                setSelectedMember({
                    id: res?.data?.data[0]?.id,
                    name: res?.data?.data[0]?.personName || res?.data?.data[0]?.email,
                    value: res?.data?.data[0]?.id,
                });
                setFormData((prev) => ({
                    ...prev,
                    libraryMemberId: Number(res?.data?.data[0]?.id),
                }));
            }
        } catch (error) {
            console.error("Error fetching current library member:", error);
            alertError("Failed to load your library member information!");
        }
    };

    useEffect(() => {
        if (!calledOnce.current) {
            GetCurrentLibraryMember();
            calledOnce.current = true;
        }
    }, []);

    const [formData, setFormData] = useState<BookIssueFormData>({
        bookId: 0,
        libraryMemberId: 0,
        dueDays: 0,
        notes: "",
    });

    const [selectedBook, setSelectedBook] = useState<SingleValue | any>(null);
    const [selectedMember, setSelectedMember] = useState<SingleValue | any>(null);

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;
        setTimeout(() => setIsAnimating(true), 10);
        if (bookIssueId) {
            loadBookIssueData();
        }
    }, [bookIssueId]);

    const loadBookIssueData = async () => {
        if (!bookIssueId) return;
        const data: any = await GetDatabyID("BookIssue", bookIssueId);
        if (data) {
            setFormData({
                id: data.id,
                bookId: data.bookId || 0,
                libraryMemberId: data.libraryMemberId || 0,
                dueDays: data.dueDays || 0,
                notes: data.notes || "",
            });

            // Set selected book if exists
            if (data.book) {
                setSelectedBook({
                    id: data.book.id,
                    name: data.book.title,
                    value: data.book.id,
                });
            }

            // Set selected member if exists
            if (data.libraryMember) {
                setSelectedMember({
                    id: data.libraryMember.id,
                    name: data.libraryMember.personName || data.libraryMember.email,
                    value: data.libraryMember.id,
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

    const handleBookChange = (value: SingleValue | null) => {
        setSelectedBook(value);
        setFormData((prev) => ({
            ...prev,
            bookId: value ? Number(value.id) : 0,
        }));
    };

    const handleMemberChange = (value: SingleValue | null) => {
        setSelectedMember(value);
        setFormData((prev) => ({
            ...prev,
            libraryMemberId: value ? Number(value.id) : 0,
        }));
    };

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.bookId || formData.bookId === 0) {
            alertError("Book is required!");
            return;
        }
        if (!formData.libraryMemberId || formData.libraryMemberId === 0) {
            alertError("Library Member is required!");
            return;
        }
        if (!formData.dueDays || formData.dueDays <= 0) {
            alertError("Due Days must be greater than 0!");
            return;
        }

        if (bookIssueId) {
            await updateData("BookIssue", bookIssueId, formData, () => {
                setTimeout(() => {
                    handleClose();
                }, 500);
            });
        } else {
            await createData("BookIssue", formData, () => {
                setTimeout(() => {
                    handleClose();
                }, 500);
            });
        }
    };

    const inputClass = `w-full px-4 py-2.5 rounded-lg border transition-all duration-200 ${
        darkLight
            ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:bg-gray-700 focus:border-blue-500"
            : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-blue-50/30"
    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`;

    const labelClass = `block mb-1.5 text-sm font-semibold ${
        darkLight ? "text-gray-200" : "text-gray-700"
    }`;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
                    isAnimating ? 'opacity-100' : 'opacity-0'
                }`}
            />

            {/* Modal */}
            <div
                className={`fixed mt-15 inset-0 flex items-center justify-center z-50 p-4 pointer-events-none transition-all duration-300 ${
                    isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
            >
                <div
                    className={`rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden pointer-events-auto transform transition-all duration-300 ${
                        darkLight ? "bg-gray-800" : "bg-white"
                    } ${isAnimating ? 'translate-y-0' : 'translate-y-4'}`}
                    style={{ maxHeight: 'calc(100vh - 80px)' }}
                >
                    {/* Header */}
                    <div
                        className={`px-6 py-4 border-b flex-shrink-0 ${
                            darkLight
                                ? "bg-gray-800 border-gray-700"
                                : "bg-white border-gray-200"
                        }`}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h2
                                    className={`text-2xl font-bold ${
                                        darkLight ? "text-white" : "text-gray-900"
                                    }`}
                                >
                                    {bookIssueId ? "Edit Book Issue" : "Issue New Book"}
                                </h2>
                                <p className={`text-sm mt-1 ${darkLight ? "text-gray-400" : "text-gray-500"}`}>
                                    {bookIssueId ? "Update book issue information" : "Fill in the details to issue a book"}
                                </p>
                            </div>
                            <button
                                onClick={handleClose}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xl transition-all ${
                                    darkLight
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
                            <div className="grid grid-cols-1 gap-5">
                                {/* Library Member - Auto-filled and Disabled */}
                                <div>
                                    <label className={labelClass}>
                                        Library Member <span className="text-red-500">*</span>
                                    </label>
                                    <XSelectSearch
                                        value={selectedMember}
                                        onChange={handleMemberChange}
                                        multiple={false}
                                        disabled
                                        placeholder="Select library member"
                                        selectOption={{
                                            apiEndpoint: "LibraryMember/lookup?Status=1",
                                            id: "id",
                                            name: "personName",
                                            value: "id",
                                            pageSize: 20,
                                            searchParam: "Search",
                                        }}
                                        isSearchable={true}
                                    />
                                </div>

                                {/* Book */}
                                <div>
                                    <label className={labelClass}>
                                        Book <span className="text-red-500">*</span>
                                    </label>
                                    <XSelectSearch
                                        value={selectedBook}
                                        onChange={handleBookChange}
                                        multiple={false}
                                        placeholder="Select book"
                                        selectOption={{
                                            apiEndpoint: "/Book",
                                            id: "id",
                                            name: "title",
                                            value: "id",
                                            pageSize: 20,
                                            searchParam: "Search",
                                        }}
                                        isSearchable={true}
                                    />
                                </div>

                                {/* Due Days */}
                                <div>
                                    <label className={labelClass}>
                                        Due Days <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="dueDays"
                                        value={formData.dueDays}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="Enter number of days"
                                        min="1"
                                    />
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className={labelClass}>Notes</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="Enter any notes"
                                        rows={4}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className={`px-6 py-4 border-t flex-shrink-0 ${
                            darkLight ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
                        }`}>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                                        darkLight
                                            ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-8 py-2.5 rounded-lg font-medium transition-all shadow-lg ${
                                        loading
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
                                        bookIssueId ? "Update Issue" : "Issue Book"
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

export default BookIssueFormCurrentUser;