// import { type FC, useEffect, useState } from "react";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import { AxiosApi } from "../../component/Axios/Axios";
// import alertify from "alertifyjs";
// import { alertError } from "../../HtmlHelper/Alert";

// interface Permission {
//   name: string;
//   description: string;
//   isAssigned: boolean;
// }

// interface PermissionGroup {
//   group: string;
//   permissions: Permission[];
// }

// interface RoleData {
//   roleId: number;
//   roleName: string;
//   roleDescription: string;
//   assignedPermissions: string[];
//   allPermissions: PermissionGroup[];
// }

// const Permissions: FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const [roleData, setRoleData] = useState<RoleData | null>(null);
//   const [assignedPermissions, setAssignedPermissions] = useState<string[]>([]);
//   const [submitting, setSubmitting] = useState(false);
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const getPermissions = async () => {
//       try {
//         setLoading(true);
//         const res = await AxiosApi.get<RoleData>(
//           `Roles/${Number(id)}/permissions`
//         );
//         const data = res?.data;

//         if (data) {
//           data.allPermissions.forEach((group) => {
//             group.permissions.forEach((perm) => {
//               perm.isAssigned = data.assignedPermissions.includes(perm.name);
//             });
//           });
//           setRoleData(data);
//           setAssignedPermissions(data.assignedPermissions);
//         }
//       } catch (error) {
//         console.error("Failed to fetch permissions:", error);
//         alertError("Failed to load permissions");
//       } finally {
//         setLoading(false);
//       }
//     };

//     getPermissions();
//   }, [id]);

//   const handleGroupToggle = (groupIndex: number, checked: boolean) => {
//     if (!roleData) return;

//     const updated = { ...roleData };
//     const group = updated.allPermissions[groupIndex];

//     group.permissions = group.permissions.map((perm) => ({
//       ...perm,
//       isAssigned: checked,
//     }));

//     const updatedAssigned = checked
//       ? [
//           ...assignedPermissions,
//           ...group.permissions
//             .map((p) => p.name)
//             .filter((name) => !assignedPermissions.includes(name)),
//         ]
//       : assignedPermissions.filter(
//           (name) => !group.permissions.some((p) => p.name === name)
//         );

//     setRoleData(updated);
//     setAssignedPermissions(updatedAssigned);
//   };

//   const handleToggle = (
//     groupIndex: number,
//     permIndex: number,
//     name: string
//   ) => {
//     if (!roleData) return;
//     const updated = { ...roleData };
//     const permission =
//       updated.allPermissions[groupIndex].permissions[permIndex];
//     permission.isAssigned = !permission.isAssigned;
//     setRoleData(updated);

//     setAssignedPermissions((prev) =>
//       permission.isAssigned ? [...prev, name] : prev.filter((p) => p !== name)
//     );
//   };

//   const handleSave = async () => {
//     try {
//       setSubmitting(true);
//       const payload = { permissions: assignedPermissions };
//       const res: any = await AxiosApi.put(
//         `/Roles/${Number(id)}/permissions`,
//         payload
//       );
//       if (res.data.success) {
//         alertify.success("Successfully updated permissions");
//         navigate("/rolelist");
//       } else {
//         alertify.error(res.data.message || "Update failed");
//       }
//     } catch (error: any) {
//       console.error(error);
//       alertError(error.response?.data?.message || "Error updating permissions");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="w-full">
//       <div className="p-6">
//         {/* Page Header */}
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h4 className="text-2xl font-semibold text-gray-800">Permission</h4>
//             <h6 className="text-sm text-gray-600 mt-1">Manage your permissions</h6>
//           </div>

//           <button
//             onClick={handleSave}
//             disabled={submitting || loading}
//             type="button"
//             className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {submitting ? "Saving..." : "Save Changes"}
//           </button>
//         </div>

//         {/* Content Card */}
//         <div
//           className="bg-white rounded-lg shadow p-4 overflow-y-auto"
//           style={{
//             maxHeight: "calc(100vh - 200px)",
//           }}
//         >
//           {/* Loading State */}
//           {loading && (
//             <div className="flex flex-col items-center justify-center py-20">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
//               <p className="mt-4 text-gray-600">Loading permissions...</p>
//             </div>
//           )}

//           {/* Permission Groups */}
//           {!loading && roleData?.allPermissions.map((group, groupIndex) => (
//             <div
//               key={group.group}
//               className="mb-4 border border-gray-200 rounded-lg p-4 shadow-sm"
//             >
//               {/* Group Header with Checkbox */}
//               <div className="flex items-center mb-4">
//                 <input
//                   type="checkbox"
//                   className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer mr-3"
//                   checked={group.permissions.every((p) => p.isAssigned)}
//                   ref={(el) => {
//                     if (el) {
//                       const someChecked = group.permissions.some(
//                         (p) => p.isAssigned
//                       );
//                       const allChecked = group.permissions.every(
//                         (p) => p.isAssigned
//                       );
//                       el.indeterminate = someChecked && !allChecked;
//                     }
//                   }}
//                   onChange={(e) =>
//                     handleGroupToggle(groupIndex, e.target.checked)
//                   }
//                 />
//                 <h5 className="text-lg font-semibold text-blue-600">
//                   {group.group}
//                 </h5>
//               </div>

//               {/* Permission Items */}
//               <div className="flex flex-wrap gap-2">
//                 {group.permissions.map((perm, permIndex) => (
//                   <label
//                     key={perm.name}
//                     className="flex items-center border border-gray-300 bg-gray-50 p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors min-w-[260px]"
//                   >
//                     <input
//                       type="checkbox"
//                       className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer mr-2"
//                       checked={perm.isAssigned}
//                       onChange={() =>
//                         handleToggle(groupIndex, permIndex, perm.name)
//                       }
//                     />
//                     <span className="text-sm font-medium text-gray-900">
//                       {perm.description || perm.name}
//                     </span>
//                   </label>
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Footer */}
//       <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-white p-4">
//         <p className="text-sm text-gray-600 mb-2 sm:mb-0">
//           2014 - 2025 © DreamsPOS. All Right Reserved
//         </p>
//         <p className="text-sm text-gray-600">
//           Designed &amp; Developed by{" "}
//           <Link to="#" className="text-blue-600 hover:text-blue-700">
//             Dreams
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Permissions;
import { type FC, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AxiosApi } from "../../component/Axios/Axios";
import alertify from "alertifyjs";
import { alertError } from "../../HtmlHelper/Alert";
import { MdAdminPanelSettings } from "react-icons/md";
import { useGlobleContextDarklight } from "../../AllContext/context";

interface Permission {
  name: string;
  description: string;
  isAssigned: boolean;
}

interface PermissionGroup {
  group: string;
  permissions: Permission[];
}

interface RoleData {
  roleId: number;
  roleName: string;
  roleDescription: string;
  assignedPermissions: string[];
  allPermissions: PermissionGroup[];
}

const Permissions: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { darkLight } = useGlobleContextDarklight();
  const dl = darkLight;
  const [roleData, setRoleData] = useState<RoleData | null>(null);
  const [assignedPermissions, setAssignedPermissions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getPermissions = async () => {
      try {
        setLoading(true);
        const res = await AxiosApi.get<RoleData>(`Roles/${Number(id)}/permissions`);
        const data = res?.data;
        if (data) {
          data.allPermissions.forEach((group) => {
            group.permissions.forEach((perm) => {
              perm.isAssigned = data.assignedPermissions.includes(perm.name);
            });
          });
          setRoleData(data);
          setAssignedPermissions(data.assignedPermissions);
        }
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
        alertError("Failed to load permissions");
      } finally {
        setLoading(false);
      }
    };
    getPermissions();
  }, [id]);

  const handleGroupToggle = (groupIndex: number, checked: boolean) => {
    if (!roleData) return;
    const updated = { ...roleData };
    const group = updated.allPermissions[groupIndex];
    group.permissions = group.permissions.map((perm) => ({ ...perm, isAssigned: checked }));
    const updatedAssigned = checked
      ? [...assignedPermissions, ...group.permissions.map((p) => p.name).filter((name) => !assignedPermissions.includes(name))]
      : assignedPermissions.filter((name) => !group.permissions.some((p) => p.name === name));
    setRoleData(updated);
    setAssignedPermissions(updatedAssigned);
  };

  const handleToggle = (groupIndex: number, permIndex: number, name: string) => {
    if (!roleData) return;
    const updated = { ...roleData };
    const permission = updated.allPermissions[groupIndex].permissions[permIndex];
    permission.isAssigned = !permission.isAssigned;
    setRoleData(updated);
    setAssignedPermissions((prev) =>
      permission.isAssigned ? [...prev, name] : prev.filter((p) => p !== name)
    );
  };

  const handleSave = async () => {
    try {
      setSubmitting(true);
      const payload = { permissions: assignedPermissions };
      const res: any = await AxiosApi.put(`/Roles/${Number(id)}/permissions`, payload);
      if (res.data.success) {
        alertify.success("Successfully updated");
        navigate("/rolelist");
      } else {
        alertify.error(res.data.message || "Update failed");
      }
    } catch (error: any) {
      console.error(error);
      alertError(error.response?.data?.message || "Error updating permissions");
    } finally {
      setSubmitting(false);
    }
  };

  const totalPermissions = roleData?.allPermissions.reduce((acc, g) => acc + g.permissions.length, 0) ?? 0;
  const assignedCount = assignedPermissions.length;

  return (
    <div className={`w-full min-h-screen ${dl ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="p-3 sm:p-6">

        {/* ===== PAGE HEADER ===== */}
        <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 min-w-0">
            <MdAdminPanelSettings className={`w-7 h-7 sm:w-9 sm:h-9 drop-shadow-lg animate-bounce flex-shrink-0
              ${dl ? "text-purple-400" : "text-purple-600"}`} />
            <div className="min-w-0">
              <h4 className={`font-bold text-base sm:text-2xl truncate ${dl ? "text-white" : "text-gray-900"}`}>
                PERMISSION MANAGEMENT
              </h4>
              {roleData && (
                <p className={`text-xs sm:text-sm truncate ${dl ? "text-gray-400" : "text-gray-500"}`}>
                  Role:{" "}
                  <span className={`font-semibold ${dl ? "text-purple-400" : "text-purple-600"}`}>
                    {roleData.roleName}
                  </span>
                  <span className={`ml-2 ${dl ? "text-gray-500" : "text-gray-400"}`}>
                    ({assignedCount}/{totalPermissions} assigned)
                  </span>
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={submitting || loading}
            type="button"
            className="bg-sky-500 hover:bg-sky-600 active:scale-95 text-white px-3 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100">
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="hidden sm:inline">Saving...</span>
              </span>
            ) : (
              <>
                <span className="hidden sm:inline">Save Changes</span>
                <span className="sm:hidden">Save</span>
              </>
            )}
          </button>
        </div>

        {/* ===== CONTENT CARD ===== */}
        <div className={`rounded-xl shadow overflow-y-auto ${dl ? "bg-gray-800" : "bg-white"}`}
          style={{ maxHeight: "calc(100vh - 200px)" }}>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${dl ? "border-purple-400" : "border-purple-500"}`} />
              <p className={`mt-4 text-sm ${dl ? "text-gray-400" : "text-gray-500"}`}>
                Loading permissions...
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && roleData?.allPermissions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <MdAdminPanelSettings className={`w-16 h-16 mb-3 ${dl ? "text-gray-600" : "text-gray-300"}`} />
              <p className={`text-sm ${dl ? "text-gray-500" : "text-gray-400"}`}>
                No permissions available
              </p>
            </div>
          )}

          {/* Permission Groups */}
          {!loading && roleData?.allPermissions.map((group, groupIndex) => (
            <div key={group.group}
              className={`border-b last:border-b-0 p-3 sm:p-5 ${dl ? "border-gray-700" : "border-gray-100"}`}>

              {/* Group Header */}
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 cursor-pointer flex-shrink-0"
                  checked={group.permissions.every((p) => p.isAssigned)}
                  ref={(el) => {
                    if (el) {
                      const someChecked = group.permissions.some((p) => p.isAssigned);
                      const allChecked = group.permissions.every((p) => p.isAssigned);
                      el.indeterminate = someChecked && !allChecked;
                    }
                  }}
                  onChange={(e) => handleGroupToggle(groupIndex, e.target.checked)}
                />
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <h5 className={`text-sm sm:text-base font-bold truncate ${dl ? "text-purple-400" : "text-purple-600"}`}>
                    {group.group}
                  </h5>
                  <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium
                    ${dl ? "bg-purple-900/40 text-purple-300" : "bg-purple-100 text-purple-600"}`}>
                    {group.permissions.filter(p => p.isAssigned).length}/{group.permissions.length}
                  </span>
                </div>
              </div>

              {/* Permission Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {group.permissions.map((perm, permIndex) => (
                  <label
                    key={perm.name}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all
                      ${perm.isAssigned
                        ? dl
                          ? "border-purple-500 bg-purple-900/20"
                          : "border-purple-300 bg-purple-50"
                        : dl
                          ? "border-gray-600 bg-gray-700/40 hover:bg-gray-700"
                          : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                      }`}
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 cursor-pointer flex-shrink-0"
                      checked={perm.isAssigned}
                      onChange={() => handleToggle(groupIndex, permIndex, perm.name)}
                    />
                    <span className={`text-xs sm:text-sm font-medium truncate
                      ${perm.isAssigned
                        ? dl ? "text-purple-300" : "text-purple-700"
                        : dl ? "text-gray-300" : "text-gray-700"
                      }`}>
                      {perm.description || perm.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <div className={`flex flex-col sm:flex-row items-center justify-between border-t px-4 py-3 gap-1
        ${dl ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
        <p className={`text-xs ${dl ? "text-gray-500" : "text-gray-400"}`}>
          2014 - 2025 © DreamsPOS. All Right Reserved
        </p>
        <p className={`text-xs ${dl ? "text-gray-500" : "text-gray-400"}`}>
          Designed &amp; Developed by{" "}
          <Link to="#" className={`font-medium ${dl ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-700"}`}>
            Dreams
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Permissions;