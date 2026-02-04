import { type FC, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AxiosApi } from "../../component/Axios/Axios";
import alertify from "alertifyjs";
import { alertError } from "../../HtmlHelper/Alert";

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
  const [roleData, setRoleData] = useState<RoleData | null>(null);
  const [assignedPermissions, setAssignedPermissions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getPermissions = async () => {
      try {
        setLoading(true);
        const res = await AxiosApi.get<RoleData>(
          `Roles/${Number(id)}/permissions`
        );
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

    group.permissions = group.permissions.map((perm) => ({
      ...perm,
      isAssigned: checked,
    }));

    const updatedAssigned = checked
      ? [
          ...assignedPermissions,
          ...group.permissions
            .map((p) => p.name)
            .filter((name) => !assignedPermissions.includes(name)),
        ]
      : assignedPermissions.filter(
          (name) => !group.permissions.some((p) => p.name === name)
        );

    setRoleData(updated);
    setAssignedPermissions(updatedAssigned);
  };

  const handleToggle = (
    groupIndex: number,
    permIndex: number,
    name: string
  ) => {
    if (!roleData) return;
    const updated = { ...roleData };
    const permission =
      updated.allPermissions[groupIndex].permissions[permIndex];
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
      const res: any = await AxiosApi.put(
        `/Roles/${Number(id)}/permissions`,
        payload
      );
      if (res.data.success) {
        alertify.success("Successfully updated permissions");
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

  return (
    <div className="w-full">
      <div className="p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-2xl font-semibold text-gray-800">Permission</h4>
            <h6 className="text-sm text-gray-600 mt-1">Manage your permissions</h6>
          </div>

          <button
            onClick={handleSave}
            disabled={submitting || loading}
            type="button"
            className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Content Card */}
        <div
          className="bg-white rounded-lg shadow p-4 overflow-y-auto"
          style={{
            maxHeight: "calc(100vh - 200px)",
          }}
        >
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
              <p className="mt-4 text-gray-600">Loading permissions...</p>
            </div>
          )}

          {/* Permission Groups */}
          {!loading && roleData?.allPermissions.map((group, groupIndex) => (
            <div
              key={group.group}
              className="mb-4 border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              {/* Group Header with Checkbox */}
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer mr-3"
                  checked={group.permissions.every((p) => p.isAssigned)}
                  ref={(el) => {
                    if (el) {
                      const someChecked = group.permissions.some(
                        (p) => p.isAssigned
                      );
                      const allChecked = group.permissions.every(
                        (p) => p.isAssigned
                      );
                      el.indeterminate = someChecked && !allChecked;
                    }
                  }}
                  onChange={(e) =>
                    handleGroupToggle(groupIndex, e.target.checked)
                  }
                />
                <h5 className="text-lg font-semibold text-blue-600">
                  {group.group}
                </h5>
              </div>

              {/* Permission Items */}
              <div className="flex flex-wrap gap-2">
                {group.permissions.map((perm, permIndex) => (
                  <label
                    key={perm.name}
                    className="flex items-center border border-gray-300 bg-gray-50 p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors min-w-[260px]"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer mr-2"
                      checked={perm.isAssigned}
                      onChange={() =>
                        handleToggle(groupIndex, permIndex, perm.name)
                      }
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {perm.description || perm.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-600 mb-2 sm:mb-0">
          2014 - 2025 © DreamsPOS. All Right Reserved
        </p>
        <p className="text-sm text-gray-600">
          Designed &amp; Developed by{" "}
          <Link to="#" className="text-blue-600 hover:text-blue-700">
            Dreams
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Permissions;