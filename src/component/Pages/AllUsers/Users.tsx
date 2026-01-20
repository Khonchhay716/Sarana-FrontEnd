import { useState, useEffect } from "react";
import useFetchDataApi from "../../../CustomHook/FetchDataApi";
import { FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import { useGlobleContextDarklight } from "../../../AllContext/context";
import { HookIntergrateAPI } from "../../../CustomHook/HookIntergrateAPI";
import Form from "../../../CustomHook/HookForms";
import alertify from "alertifyjs";
import { useRefreshTable } from "../../../AllContext/context";

type Product = {
  id: number;
  name: string;
  username: string;
  email: string;
  profilePicture: string;
  roleId: number;
  role?: {
    id: number;
    name: string;
  };
};

type UserProfile = Product & {
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
  updatedAt: string;
};

export default function Admin() {
  const [typeId, setTypeId] = useState<number>(0);
  const { darkLight } = useGlobleContextDarklight();
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isCreate, setIsCreate] = useState(true);
  const [datas, setDatas] = useState<Product[]>([]);
  const { isError, isLoading, data } = useFetchDataApi(`https://localhost:7095/api/User?roleId=${typeId}`);
  const { createData, DeleteData, GetDatabyID, updateData } = HookIntergrateAPI();
  const [isChange, setIsChange] = useState(false);
  const email = sessionStorage.getItem("email");
  const [roleUser, setRoleUser] = useState<string>();
  const [ImformationUser, setImformationUser] = useState<UserProfile | null>(null);
  const [createUser, setCreateUser] = useState(true);
  const { setRefreshTables } = useRefreshTable();
  const { data: typeRole } = useFetchDataApi('https://localhost:7095/api/Role');

  useEffect(() => {
    if (data && email) {
      const foundUser = data.find((item: UserProfile) => item.email === email);
      setImformationUser(foundUser || null);
    }
  }, [data, email]);

  useEffect(() => {
    const roleid = sessionStorage.getItem("roleId");
    if (roleid) {
      const fetchData = async () => {
        const productData: any = await GetDatabyID("https://localhost:7095/api/Role", Number(roleid));
        setRoleUser(productData.name);
      };
      fetchData();
    }
  }, []);

  useEffect(() => {
    if (data) setDatas(data);
  }, [data]);

  if (isLoading) return <div className={darkLight ? "text-white" : "text-gray-800"}>Loading...</div>;
  if (isError) return <div className={darkLight ? "text-white" : "text-gray-800"}>Error fetching data</div>;

  const HandleCreateAndUpdateData = (data: any) => {
    if (isCreate) {
      createData("https://localhost:7095/api/User", data, () => {
        setShowModal(false);
        setCreateUser(true);
        alertify.success("Create user successfully ✅✅");
      });
    } else {
      updateData("https://localhost:7095/api/User", data.id, data, () => {
        if (isChange) {
          sessionStorage.setItem("email", data.email);
          sessionStorage.setItem("roleId", data.roleId);
        }
        alertify.success("Update users successfully ✅✅");
        setShowModal(false);
        setEditProduct(null);
      });
      setIsCreate(true);
    }
  };

  const DeleteProduct = async (id: number) => {
    if (ImformationUser?.id === id) {
      alertify.warning("This is your own data. You cannot delete your own data!");
      return;
    }
    DeleteData("https://localhost:7095/api/User", id);
  };

  const UpdateProduct = async (id: number) => {
    const productData: any = await GetDatabyID("https://localhost:7095/api/User", id);
    if (productData) {
      if (productData.email === email) {
        setIsChange(true);
      }
      setEditProduct(productData);
      setShowModal(true);
      setIsCreate(false);
    }
  };

  return (
    <>
      <div className={`p-4 mb-15 ${darkLight ? "bg-gray-900 text-white" : "bg-white text-gray-800"} w-[100%]`}>
        <div className="h-[40px] flex justify-between mb-3">
          <p className="text-2xl font-bold">User List</p>
          <div>
            <select
              className={`border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-amber-500
                            ${darkLight ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}
                            `}
              onChange={(e) => {
                const value = e.target.value;
                setTypeId(value ? Number(value) : 0);
                setRefreshTables(new Date());
              }}
            >
              <option value="">All Types</option>
              {typeRole.map((type: { id: number; name: string }) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            <button className={`h-[50px] px-7 ${darkLight ? "bg-blue-600 hover:bg-blue-700" : "bg-sky-500 hover:bg-amber-400"} cursor-pointer text-xl font-bold rounded-2xl text-white`}
              onClick={() => { setShowModal(true); setEditProduct(null) }}>
              +Add Product
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-full inline-block align-middle">
            <div className={`overflow-hidden rounded-2xl shadow-md ${darkLight ? "shadow-gray-800" : ""}`}>
              <table className={`min-w-full divide-y ${darkLight ? "divide-gray-700" : "divide-gray-200"}`}>
                <thead className={darkLight ? "bg-gray-950 text-gray-300" : "bg-gray-100 text-gray-700"}>
                  <tr>
                    <th className="px-6 py-3 text-left">ID</th>
                    <th className="px-6 py-3 text-left">Profile</th>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Username</th>
                    <th className="px-6 py-3 text-left">Email</th>
                    {/* <th className="px-6 py-3 text-left">Role Id</th> */}
                    <th className="px-6 py-3 text-left">Role Name</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkLight ? "divide-gray-700 text-gray-300" : "divide-gray-200 text-gray-800"}`}>
                  {datas.map((product, index) => (
                    <tr
                      key={product.id}
                      className={`transition ${darkLight ? (index % 2 === 0 ? "bg-gray-800" : "bg-gray-700") : (index % 2 === 0 ? "bg-white" : "bg-amber-50")} hover:${darkLight ? "bg-gray-600" : "bg-amber-100"}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">{product.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={product.profilePicture || "https://cdn-icons-png.flaticon.com/512/10337/10337609.png"}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {product.name} {ImformationUser?.id === product.id && <span className="text-pink-400">(You)</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{product.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{product.email}</td>
                      {/* <td className="px-6 py-4 whitespace-nowrap">{product.roleId}</td> */}
                      <td className="px-6 py-4 whitespace-nowrap">{product.role?.name ?? "Unknown"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            disabled={roleUser !== "Admin"}
                            className={`p-2 rounded ${roleUser !== "Admin" ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${darkLight ? "text-blue-400 hover:text-blue-300 hover:bg-blue-900" : "text-blue-600 hover:text-blue-800 hover:bg-blue-100"}`}
                            onClick={() => UpdateProduct(product.id)}
                          >
                            <FiEdit size={20} />
                          </button>
                          <button
                            disabled={roleUser !== "Admin"}
                            className={`p-2 rounded ${roleUser !== "Admin" ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${darkLight ? "text-red-400 hover:text-red-300 hover:bg-red-900" : "text-red-600 hover:text-red-800 hover:bg-red-100"}`}
                            onClick={() => DeleteProduct(product.id)}
                          >
                            <FiTrash2 size={18} />
                          </button>
                          <button
                            disabled={roleUser !== "Admin"}
                            className={`p-2 rounded ${roleUser !== "Admin" ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${darkLight ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"}`}
                            onClick={() => console.log("View", product.id)}
                          >
                            <FiEye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {datas.length === 0 && (
                <div className={`text-center py-4 ${darkLight ? "text-gray-400" : "text-gray-500"}`}>
                  No products found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <Form
          onClose={() => {
            setShowModal(false);
            setCreateUser(true);
          }}
          onSubmit={HandleCreateAndUpdateData}
          productBack={editProduct ?? undefined}
          formlayout={[
            {
              row: [
                { key: "name", label: "Name", type: "text", required: true, col: 4 },
                { key: "username", label: "Username", type: "text", required: true, col: 4 },
                { key: "email", label: "Email", type: "email", required: true, col: 4 },
              ],
            },
            {
              row: [
                { key: "passwordHash", label: "Password", type: "password", col: 6, hidden: createUser },
                { key: "passwordSalt", label: "Salt", type: "password", col: 6, hidden: createUser },
              ],
            },
            { key: "profilePicture", label: "Image", type: "file", accept: "image/*", col: 12 },
            { key: "roleId", label: "Select Role", type: "select", optionAPI: "https://localhost:7095/api/Role", required: true, placeholder: "Select", col: 6 },
          ]}
        />
      )}
    </>
  );
}
