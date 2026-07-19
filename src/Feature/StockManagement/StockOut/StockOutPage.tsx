import { FaBarcode } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useGlobleContextDarklight } from "../../../AllContext/context";
import StockOutPanel from "./StockOutPanel";

const StockOutPage = () => {
    const { darkLight } = useGlobleContextDarklight();
    const dl = darkLight;
    const navigate = useNavigate();

    return (
        <>
            <div className="flex items-center gap-2 my-2 flex-wrap">
                <FaBarcode className={`w-7 h-7 sm:w-8 sm:h-8 drop-shadow-lg flex-shrink-0 ${dl ? "text-red-400" : "text-red-600"}`} />
                <h3 className={`font-bold text-base sm:text-2xl truncate ${dl ? "text-white" : "text-gray-900"}`}>STOCK OUT</h3>
            </div>

            <div className={`rounded-2xl border p-4 sm:p-6 max-w-lg ${dl ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                {/* ✅ NEW: once there's nothing left to hand out, go straight back to the Sale page */}
                <StockOutPanel onDone={() => navigate("/sale-product")} />
            </div>
        </>
    );
};

export default StockOutPage;
