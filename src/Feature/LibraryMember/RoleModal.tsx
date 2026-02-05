import { useEffect, useState } from "react";
import { useGlobleContextDarklight } from "../../AllContext/context";

interface LibraryRulesModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const LibraryRulesModal = ({ isOpen, onConfirm, onCancel }: LibraryRulesModalProps) => {
    const { darkLight } = useGlobleContextDarklight();
    const [countdown, setCountdown] = useState(20); // 20 seconds countdown
    const [isAnimating, setIsAnimating] = useState(false);
    const [hasRead, setHasRead] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            setCountdown(20);
            setHasRead(false);
        } else {
            setIsAnimating(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setHasRead(true);
        }
    }, [countdown, isOpen]);

    const handleConfirm = () => {
        if (hasRead) {
            setIsAnimating(false);
            setTimeout(() => {
                onConfirm();
            }, 300);
        }
    };

    const handleCancel = () => {
        setIsAnimating(false);
        setTimeout(() => {
            onCancel();
        }, 300);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] transition-opacity mt-15 duration-300 ${
                    isAnimating ? "opacity-100" : "opacity-0"
                }`}
                onClick={handleCancel}
            />

            {/* Modal */}
            <div
                className={`fixed inset-0 flex items-center mt-15 justify-center z-[61] p-4 pointer-events-none transition-all duration-300 ${
                    isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
            >
                <div
                    className={`rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden pointer-events-auto transform transition-all duration-300 ${
                        darkLight ? "bg-gray-800" : "bg-white"
                    } ${isAnimating ? "translate-y-0" : "translate-y-4"}`}
                    style={{ maxHeight: "calc(100vh - 100px)" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div
                        className={`px-6 py-5 border-b flex-shrink-0 ${
                            darkLight
                                ? "bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-gray-700"
                                : "bg-gradient-to-r from-blue-50 to-purple-50 border-gray-200"
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl ${
                                    darkLight ? "bg-blue-600" : "bg-blue-500"
                                }`}
                            >
                                📋
                            </div>
                            <div className="flex-1">
                                <h2
                                    className={`text-2xl font-bold ${
                                        darkLight ? "text-white" : "text-gray-900"
                                    }`}
                                >
                                    Library Rules & Policies
                                </h2>
                                <p className={`text-sm mt-1 ${darkLight ? "text-gray-300" : "text-gray-600"}`}>
                                    Please read carefully before proceeding
                                </p>
                            </div>
                            {/* Countdown Timer */}
                            <div
                                className={`flex flex-col items-center justify-center w-20 h-20 rounded-full border-4 ${
                                    countdown > 0
                                        ? darkLight
                                            ? "border-orange-500 bg-orange-900/30"
                                            : "border-orange-400 bg-orange-50"
                                        : darkLight
                                        ? "border-green-500 bg-green-900/30"
                                        : "border-green-400 bg-green-50"
                                }`}
                            >
                                {countdown > 0 ? (
                                    <>
                                        <span
                                            className={`text-2xl font-bold ${
                                                darkLight ? "text-orange-400" : "text-orange-600"
                                            }`}
                                        >
                                            {countdown}
                                        </span>
                                        <span
                                            className={`text-xs ${
                                                darkLight ? "text-orange-300" : "text-orange-500"
                                            }`}
                                        >
                                            seconds
                                        </span>
                                    </>
                                ) : (
                                    <span className={`text-3xl ${darkLight ? "text-green-400" : "text-green-600"}`}>
                                        ✓
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Body - Scrollable Content */}
                    <div
                        className={`overflow-y-auto flex-1 px-6 py-6 custom-scrollbar ${
                            darkLight ? "bg-gray-800" : "bg-white"
                        }`}
                        style={{
                            scrollbarWidth: "thin",
                            scrollbarColor: darkLight ? "#4a5568 transparent" : "#cbd5e0 transparent",
                        }}
                    >
                        <style>{`
                            .custom-scrollbar::-webkit-scrollbar {
                                width: 8px;
                            }
                            .custom-scrollbar::-webkit-scrollbar-track {
                                background: transparent;
                            }
                            .custom-scrollbar::-webkit-scrollbar-thumb {
                                background: ${darkLight ? "#4a5568" : "#cbd5e0"};
                                border-radius: 4px;
                            }
                            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                background: ${darkLight ? "#718096" : "#a0aec0"};
                            }
                        `}</style>

                        {/* Important Notice */}
                        <div
                            className={`mb-6 p-4 rounded-xl border-l-4 ${
                                darkLight
                                    ? "bg-yellow-900/20 border-yellow-500"
                                    : "bg-yellow-50 border-yellow-400"
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">⚠️</span>
                                <div>
                                    <h3
                                        className={`font-bold text-lg mb-1 ${
                                            darkLight ? "text-yellow-300" : "text-yellow-800"
                                        }`}
                                    >
                                        Important Notice
                                    </h3>
                                    <p className={`text-sm ${darkLight ? "text-yellow-200" : "text-yellow-700"}`}>
                                        By becoming a library member, you agree to follow all library rules and
                                        policies. Violations may result in membership suspension or termination.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Rules Section 1: Borrowing Rules */}
                        <div className="mb-6">
                            <h3
                                className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                                    darkLight ? "text-blue-400" : "text-blue-600"
                                }`}
                            >
                                <span>📚</span> Borrowing Rules
                            </h3>
                            <div className="space-y-3">
                                {/* <RuleItem
                                    icon="📅"
                                    title="Loan Period"
                                    description="Standard borrowing period is 14 days from the issue date."
                                    darkLight={darkLight}
                                /> */}
                                <RuleItem
                                    icon="📖"
                                    title="Maximum Books"
                                    description="You can borrow up to 5 books at the same time."
                                    darkLight={darkLight}
                                />
                                <RuleItem
                                    icon="🔄"
                                    title="Renewals"
                                    description="You can renew a book 1 time for a maximum of 3 additional days before the due date."
                                    darkLight={darkLight}
                                />
                                <RuleItem
                                    icon="❌"
                                    title="No Renewals After Due Date"
                                    description="Books cannot be renewed after the due date has passed."
                                    darkLight={darkLight}
                                />
                            </div>
                        </div>

                        {/* Rules Section 2: Late Fees */}
                        <div className="mb-6">
                            <h3
                                className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                                    darkLight ? "text-red-400" : "text-red-600"
                                }`}
                            >
                                <span>💰</span> Late Fees & Penalties
                            </h3>
                            <div
                                className={`p-5 rounded-xl border-2 ${
                                    darkLight
                                        ? "bg-red-900/20 border-red-700"
                                        : "bg-red-50 border-red-300"
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`text-4xl font-bold ${
                                            darkLight ? "text-red-400" : "text-red-600"
                                        }`}
                                    >
                                        $2
                                    </div>
                                    <div className="flex-1">
                                        <h4
                                            className={`font-bold text-lg mb-2 ${
                                                darkLight ? "text-red-300" : "text-red-700"
                                            }`}
                                        >
                                            Per Day Late Fee
                                        </h4>
                                        <p className={`text-sm mb-3 ${darkLight ? "text-red-200" : "text-red-600"}`}>
                                            Late fees are charged automatically at <strong>$2 per day</strong> for
                                            overdue books.
                                        </p>
                                        <div
                                            className={`text-sm space-y-1 ${
                                                darkLight ? "text-red-200" : "text-red-700"
                                            }`}
                                        >
                                            <p>
                                                <strong>Examples:</strong>
                                            </p>
                                            <p>• 1 day late = $2</p>
                                            <p>• 3 days late = $6</p>
                                            <p>• 7 days late = $14</p>
                                            <p>• 14 days late = $28</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rules Section 3: Member Responsibilities */}
                        <div className="mb-6">
                            <h3
                                className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                                    darkLight ? "text-purple-400" : "text-purple-600"
                                }`}
                            >
                                <span>✅</span> Member Responsibilities
                            </h3>
                            <div className="space-y-3">
                                <RuleItem
                                    icon="🔒"
                                    title="Book Care"
                                    description="You are responsible for keeping borrowed books in good condition. Lost or damaged books must be paid for."
                                    darkLight={darkLight}
                                />
                                <RuleItem
                                    icon="⏰"
                                    title="Return on Time"
                                    description="Books must be returned on or before the due date to avoid late fees."
                                    darkLight={darkLight}
                                />
                                <RuleItem
                                    icon="📧"
                                    title="Contact Information"
                                    description="Keep your contact information up to date. You will receive notifications via email/SMS."
                                    darkLight={darkLight}
                                />
                                <RuleItem
                                    icon="🚫"
                                    title="No Sharing"
                                    description="Library membership is personal and non-transferable. Do not lend your borrowed books to others."
                                    darkLight={darkLight}
                                />
                            </div>
                        </div>

                        {/* Rules Section 4: Consequences */}
                        <div className="mb-6">
                            <h3
                                className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                                    darkLight ? "text-orange-400" : "text-orange-600"
                                }`}
                            >
                                <span>⚖️</span> Consequences of Violations
                            </h3>
                            <div
                                className={`p-4 rounded-xl ${
                                    darkLight ? "bg-orange-900/20" : "bg-orange-50"
                                }`}
                            >
                                <ul
                                    className={`space-y-2 text-sm ${
                                        darkLight ? "text-orange-200" : "text-orange-800"
                                    }`}
                                >
                                    <li className="flex items-start gap-2">
                                        <span>•</span>
                                        <span>
                                            <strong>Overdue Books:</strong> Borrowing privileges suspended until fees
                                            are paid and books are returned.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span>•</span>
                                        <span>
                                            <strong>Lost or Damaged Books:</strong> Replacement cost must be paid before
                                            borrowing again.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span>•</span>
                                        <span>
                                            <strong>Repeated Violations:</strong> Membership may be suspended or
                                            terminated permanently.
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Final Agreement */}
                        <div
                            className={`p-5 rounded-xl border-2 ${
                                darkLight
                                    ? "bg-blue-900/20 border-blue-700"
                                    : "bg-blue-50 border-blue-300"
                            }`}
                        >
                            <h3
                                className={`font-bold text-lg mb-2 flex items-center gap-2 ${
                                    darkLight ? "text-blue-300" : "text-blue-700"
                                }`}
                            >
                                <span>📝</span> By Clicking "I Agree", You Confirm That:
                            </h3>
                            <ul
                                className={`space-y-2 text-sm ${
                                    darkLight ? "text-blue-200" : "text-blue-700"
                                }`}
                            >
                                <li className="flex items-start gap-2">
                                    <span>✓</span>
                                    <span>You have read and understood all library rules and policies</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span>✓</span>
                                    <span>You agree to follow all borrowing rules and return books on time</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span>✓</span>
                                    <span>
                                        You accept that late fees ($2/day) will be charged for overdue books
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span>✓</span>
                                    <span>You will take care of borrowed books and pay for lost or damaged items</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span>✓</span>
                                    <span>
                                        You understand that violations may result in suspension or termination of
                                        membership
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Footer */}
                    <div
                        className={`px-6 py-5 border-t flex-shrink-0 ${
                            darkLight
                                ? "border-gray-700 bg-gray-800"
                                : "border-gray-200 bg-gray-50"
                        }`}
                    >
                        {countdown > 0 && (
                            <div
                                className={`mb-4 p-3 rounded-lg text-center ${
                                    darkLight ? "bg-orange-900/30 text-orange-300" : "bg-orange-100 text-orange-700"
                                }`}
                            >
                                <p className="text-sm font-medium">
                                    ⏳ Please read the rules carefully. You can proceed in{" "}
                                    <strong>{countdown} seconds</strong>.
                                </p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                                    darkLight
                                        ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={!hasRead}
                                className={`px-8 py-3 rounded-lg font-medium transition-all shadow-lg flex items-center gap-2 ${
                                    hasRead
                                        ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-xl text-white cursor-pointer"
                                        : "bg-gray-400 text-gray-200 cursor-not-allowed"
                                }`}
                            >
                                {hasRead ? (
                                    <>
                                        <span>✓</span>
                                        <span>I Agree & Continue</span>
                                    </>
                                ) : (
                                    <>
                                        <span>🔒</span>
                                        <span>Wait {countdown}s</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// Helper Component for Rule Items
interface RuleItemProps {
    icon: string;
    title: string;
    description: string;
    darkLight: boolean;
}

const RuleItem = ({ icon, title, description, darkLight }: RuleItemProps) => {
    return (
        <div
            className={`p-4 rounded-lg ${
                darkLight ? "bg-gray-700/50" : "bg-gray-50"
            } hover:shadow-md transition-all`}
        >
            <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{icon}</span>
                <div>
                    <h4 className={`font-bold mb-1 ${darkLight ? "text-gray-100" : "text-gray-900"}`}>
                        {title}
                    </h4>
                    <p className={`text-sm ${darkLight ? "text-gray-300" : "text-gray-600"}`}>
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LibraryRulesModal;