import { useEffect, useRef, useState } from "react";
import { useGlobleContextDarklight } from "../../../AllContext/context";
import StockOutPanel from "./StockOutPanel";

interface StockOutModalProps {
    // When known (e.g. opened from an Order List row) the order is pre-filled and
    // auto-looked-up. When omitted (e.g. opened from a generic "Stock Out" button),
    // the form starts blank and staff enters the Order No themselves.
    orderNo?: string;
    onClose: () => void;
}

const StockOutModal = ({ orderNo, onClose }: StockOutModalProps) => {
    const { darkLight } = useGlobleContextDarklight();
    const dl = darkLight;

    const [isAnimating, setIsAnimating] = useState(false);
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;
        setTimeout(() => setIsAnimating(true), 10);
    }, []);

    const handleClose = () => { setIsAnimating(false); setTimeout(() => onClose(), 300); };

    return (
        <>
            <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"}`} onClick={handleClose} />
            <div className={`fixed inset-0 z-40 flex items-center justify-center p-4 pointer-events-none transition-all duration-300 mt-15 ${isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                <div className={`rounded-2xl shadow-2xl w-full max-w-lg max-h-full flex flex-col overflow-hidden pointer-events-auto transform transition-all duration-300 ${dl ? "bg-gray-800" : "bg-white"} ${isAnimating ? "translate-y-0" : "translate-y-4"}`}
                    onClick={e => e.stopPropagation()}>

                    <div className={`px-4 sm:px-6 py-3 border-b flex-shrink-0 flex justify-between items-center gap-3 ${dl ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                        <div>
                            <h2 className={`text-xl font-bold truncate ${dl ? "text-white" : "text-gray-900"}`}>➖ Stock Out</h2>
                            <p className={`text-xs sm:text-sm mt-0.5 ${dl ? "text-gray-400" : "text-gray-500"}`}>
                                {orderNo ? (<>Order <span className="font-mono">{orderNo}</span></>) : "Find an order, then scan serials to hand out"}
                            </p>
                        </div>
                        <button onClick={handleClose} className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xl transition-all ${dl ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}>×</button>
                    </div>

                    <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-5">
                        {/* ✅ CHANGED: once there's nothing left to hand out, close the popup —
                            the Sale/Order List page underneath is already right there. */}
                        <StockOutPanel initialOrderNo={orderNo} onDone={handleClose} />
                    </div>

                    <div className={`px-4 sm:px-6 py-3 border-t flex-shrink-0 flex justify-end ${dl ? "bg-gray-800/80 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                        <button type="button" onClick={handleClose}
                            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${dl ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"}`}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StockOutModal;
