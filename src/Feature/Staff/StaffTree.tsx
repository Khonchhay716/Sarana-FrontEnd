import { useEffect, useState } from "react";
import { AxiosApi } from "../../component/Axios/Axios";
import { useGlobleContextDarklight, useRefreshTable } from "../../AllContext/context";
import { FaUser, FaEdit, FaTrash, FaSearchMinus, FaSearchPlus, FaExpand } from "react-icons/fa";
import { HiUserGroup } from "react-icons/hi";

interface LinkedUserInfo {
    id: number;
    username: string;
    email: string;
    isActive: boolean;
}

interface StaffTreeNode {
    id: number;
    fullName: string;
    position: string;
    imageProfile: string;
    status: boolean;
    supervisorId: number | null;
    user: LinkedUserInfo | null;
    subordinates: StaffTreeNode[];
}

interface OrgNodeProps {
    node: StaffTreeNode;
    darkLight: boolean;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
}

const OrgNode = ({ node, darkLight, onEdit, onDelete }: OrgNodeProps) => {
    const [expanded, setExpanded] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    const dl = darkLight;
    const hasChildren = node.subordinates.length > 0;

    const nodeColors = [
        { bg: "bg-indigo-500", light: "bg-indigo-50", border: "border-indigo-400", text: "text-indigo-600" },
        { bg: "bg-teal-500", light: "bg-teal-50", border: "border-teal-400", text: "text-teal-600" },
        { bg: "bg-purple-500", light: "bg-purple-50", border: "border-purple-400", text: "text-purple-600" },
        { bg: "bg-orange-500", light: "bg-orange-50", border: "border-orange-400", text: "text-orange-600" },
        { bg: "bg-blue-500", light: "bg-blue-50", border: "border-blue-400", text: "text-blue-600" },
        { bg: "bg-green-500", light: "bg-green-50", border: "border-green-400", text: "text-green-600" },
    ];

    const color = nodeColors[node.id % nodeColors.length];

    return (
        <div className="flex flex-col items-center">
            <div className={`relative rounded-2xl shadow-lg border-2 ${color.border} w-[130px] transition-all hover:shadow-xl hover:-translate-y-0.5 ${dl ? "bg-gray-800" : "bg-white"}`}>

                <div className="absolute top-2 right-2 z-10">
                    <button type="button"
                        onClick={() => setShowMenu(v => !v)}
                        onBlur={() => setTimeout(() => setShowMenu(false), 150)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${dl ? "text-gray-400 hover:bg-gray-700" : "text-gray-400 hover:bg-gray-100"}`}>
                        ⋮
                    </button>
                    {showMenu && (
                        <div className={`absolute right-0 top-7 w-28 rounded-xl shadow-xl border z-50 overflow-hidden ${dl ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                            <button type="button"
                                onClick={() => { onEdit(node.id); setShowMenu(false); }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-all ${dl ? "text-gray-200 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-50"}`}>
                                <FaEdit className="text-blue-500 w-3 h-3" /> Edit
                            </button>
                            <button type="button"
                                onClick={() => { onDelete(node.id); setShowMenu(false); }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-all ${dl ? "text-gray-200 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-50"}`}>
                                <FaTrash className="text-red-500 w-3 h-3" /> Delete
                            </button>
                        </div>
                    )}
                </div>

                <div className={`flex flex-col items-center pt-2 pb-1 px-3 ${dl ? "" : color.light} rounded-t-2xl`}>
                    <div className={`w-10 h-10 rounded-full border-4 border-white shadow-md overflow-hidden flex items-center justify-center ${color.bg}`}>
                        {node.imageProfile ? (
                            <img src={node.imageProfile} alt={node.fullName} className="w-full h-full object-cover" />
                        ) : (
                            <FaUser className="w-5 h-5 text-white" />
                        )}
                    </div>
                    <div className={`w-3 h-3 rounded-full border-2 border-white -mt-1.5 ml-8 ${node.status ? "bg-green-400" : "bg-red-400"}`} />
                </div>

                <div className="px-3 pb-3 text-center">
                    <p className={`font-bold text-xs leading-tight mt-1 ${dl ? "text-white" : "text-gray-900"}`}>
                        {node.fullName}
                    </p>
                    <p className={`text-[10px] mt-0.5 ${dl ? "text-gray-400" : "text-gray-500"}`}>
                        {node.position || "—"}
                    </p>
                    {node.user && (
                        <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded-full mt-1 font-medium ${dl ? "bg-indigo-900/40 text-indigo-300" : `${color.light} ${color.text}`}`}>
                            @{node.user.username}
                        </span>
                    )}
                    <div className={`mt-2 text-[9px] px-2 py-0.5 rounded-full font-semibold inline-block ${node.status
                        ? dl ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-700"
                        : dl ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-600"
                        }`}>
                        {node.status ? "Active" : "Inactive"}
                    </div>
                </div>

                {hasChildren && (
                    <button type="button"
                        onClick={() => setExpanded(v => !v)}
                        className={`absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full border-2 shadow flex items-center justify-center text-xs font-bold z-10 transition-all hover:scale-110 ${color.bg} text-white border-white`}>
                        {expanded ? "−" : "+"}
                    </button>
                )}
            </div>

            {hasChildren && expanded && (
                <div className="flex flex-col items-center">
                    <div className={`w-0.5 h-2 ${dl ? "bg-gray-500" : "bg-gray-300"}`} />
                    <div className="relative flex items-start gap-4">
                        {node.subordinates.length > 1 && (
                            <div
                                className={`absolute top-0 h-0.5 ${dl ? "bg-gray-500" : "bg-gray-300"}`}
                                style={{
                                    left: `calc(50% / ${node.subordinates.length})`,
                                    right: `calc(50% / ${node.subordinates.length})`,
                                }}
                            />
                        )}
                        {node.subordinates.map(child => (
                            <div key={child.id} className="flex flex-col items-center">
                                <div className={`w-0.5 h-8 ${dl ? "bg-gray-500" : "bg-gray-300"}`} />
                                <OrgNode
                                    node={child}
                                    darkLight={darkLight}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

interface StaffTreeProps {
    onEdit: (staffId: number) => void;
    onDelete: (staffId: number) => void;
}

const StaffTree = ({ onEdit, onDelete }: StaffTreeProps) => {
    const { darkLight } = useGlobleContextDarklight();
    const [treeData, setTreeData] = useState<StaffTreeNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [scale, setScale] = useState(1);
    const dl = darkLight;
    const { refreshTables } = useRefreshTable();

    useEffect(() => {
        fetchTree();
    }, [refreshTables]);

    const fetchTree = async () => {
        try {
            setLoading(true);
            const res = await AxiosApi.get("Staff/tree");
            setTreeData(res?.data?.data || []);
        } catch (error) {
            console.error("Error fetching staff tree:", error);
        } finally {
            setLoading(false);
        }
    };

    const zoomIn = () => setScale(v => Math.min(2, parseFloat((v + 0.1).toFixed(1))));
    const zoomOut = () => setScale(v => Math.max(0.3, parseFloat((v - 0.1).toFixed(1))));
    const reset = () => setScale(1);

    const countAll = (nodes: StaffTreeNode[]): number =>
        nodes.reduce((acc, n) => acc + 1 + countAll(n.subordinates), 0);

    return (
        <div
            className={`rounded-2xl mb-15 ${dl ? "bg-gray-800" : "bg-white"}`}
            style={{ boxShadow: "0 0 5px 1px rgba(0,0,0,0.3)", minHeight: "75vh", position: "relative" }}
        >
            {/* Zoom controls */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${dl ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
                    {Math.round(scale * 100)}%
                </span>
                <button type="button" onClick={zoomIn} title="Zoom In"
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow hover:scale-105 ${dl ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"}`}>
                    <FaSearchPlus className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={zoomOut} title="Zoom Out"
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow hover:scale-105 ${dl ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"}`}>
                    <FaSearchMinus className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={reset} title="Reset View"
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow hover:scale-105 ${dl ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"}`}>
                    <FaExpand className="w-3.5 h-3.5" />
                </button>
                <span className={`text-[10px] ${dl ? "text-gray-500" : "text-gray-400"}`}>
                    {countAll(treeData)} staff
                </span>
            </div>

            {/* ✅ Scroll container — auto = scroll only when needed */}
            <div style={{ overflow: "auto", minHeight: "75vh", width: "100%" }}>
                {loading ? (
                    <div className="flex items-center justify-center" style={{ minHeight: "75vh" }}>
                        <svg className="animate-spin h-8 w-8 text-indigo-500" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    </div>
                ) : treeData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3" style={{ minHeight: "75vh" }}>
                        <HiUserGroup className={`w-12 h-12 ${dl ? "text-gray-600" : "text-gray-300"}`} />
                        <p className={`font-medium ${dl ? "text-gray-400" : "text-gray-500"}`}>
                            No staff members yet.
                        </p>
                    </div>
                ) : (
                    <div style={{ padding: "10px 0px", boxSizing: "border-box" }}>
                        <div
                            style={{
                                zoom: scale,
                                userSelect: "none",
                                margin: "0 auto",
                                width: "fit-content",
                            }}
                        >
                            <div style={{ display: "flex", gap: "32px" }}>
                                {treeData.map(root => (
                                    <OrgNode
                                        key={root.id}
                                        node={root}
                                        darkLight={dl}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Hint */}
            <div className={`absolute bottom-3 left-3 text-[10px] ${dl ? "text-gray-600" : "text-gray-400"}`}>
                🖱 Scroll to navigate
            </div>
        </div>
    );
};

export default StaffTree;