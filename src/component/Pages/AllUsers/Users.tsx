import { useState, useEffect } from "react";
import useFetchDataApi from "../../../CustomHook/FetchDataApi";
import { FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import { useGlobleContextDarklight } from "../../../AllContext/context";
import { HookIntergrateAPI } from "../../../CustomHook/HookIntergrateAPI";
import Form from "../../../CustomHook/Form2";
import alertify from "alertifyjs";

type Product = {
    id?: number;
    name?: string;
    username?: string;
    email?: string;
    ProfilePicture?: string;
};


export default function Admin() {
    const { darkLight } = useGlobleContextDarklight();
    const [showModal, setShowModal] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [isCreate, setIsCreate] = useState(true);
    const [datas, setDatas] = useState<any[]>([]);
    const { isError, isLoading, data } = useFetchDataApi("https://localhost:7095/api/User");
    const { createData, DeleteData, GetDatabyID, updateData } = HookIntergrateAPI();
    const [isChange, setIsChange] = useState(false);
    const email = sessionStorage.getItem("email");


    useEffect(() => {
        if (data) {
            const filtered = data.filter((item: { roleId: number }) => item.roleId === 2);
            setDatas(filtered);
        }
    }, [data]);

    // console.log(data);
    if (isLoading) return <div className={darkLight ? "text-white" : "text-gray-800"}>Loading...</div>;
    if (isError) return <div className={darkLight ? "text-white" : "text-gray-800"}>Error fetching data</div>;

    //// intergrate API 
    const HandleCreateAndUpdateData = (data: any) => {
        console.log(data);
        // data.roleId = data.roleId.id;
        if (isCreate) {  /// create data in api 
            createData("https://localhost:7095/api/User", data, () => {
                setShowModal(false);
                alertify.success("Create user successfully ✅✅");
            });
        } else {  //Update data in API
            updateData("https://localhost:7095/api/User", data.id, data, () => {
                if (isChange) {
                    sessionStorage.setItem('email', data.email);
                    sessionStorage.setItem('roleId', data.roleId);
                }
                alertify.success("Update users successfully ✅✅");
                setShowModal(false);
                setEditProduct(null);
            })
            setIsCreate(true);
        }
    }

    ///delete data 
    const DeleteProduct = async (id: number) => {
        DeleteData('https://localhost:7095/api/User', id);
    };

    /// Update product
    const UpdateProduct = async (id: number) => {
        // setShowModal(true);
        const productData: any = await GetDatabyID('https://localhost:7095/api/User', id);
        if (productData) {
            if (productData.email === email) {
                setIsChange(true);
            }
            // productData.roleId = productData.role;
            setEditProduct(productData);
            setShowModal(true);
            setIsCreate(false);
        }
    }

    // get all data 
    // const getallData = async() => {
    //   const datanew: any = await GetDataAll('https://localhost:7276/api/Product');
    //   console.log("new data");
    //   console.log(datanew);
    // }
    // getallData();


    return (
        <>
            <div className={`p-4 ${darkLight ? "bg-gray-900 text-white" : "bg-white text-gray-800"} w-[100%]`}>
                <div className="h-[40px] flex justify-between mb-3">
                    <p className="text-2xl font-bold">User List</p>
                    <button className={`h-[50px] px-7 ${darkLight ? "bg-blue-600 hover:bg-blue-700" : "bg-sky-500 hover:bg-amber-400"} cursor-pointer text-xl font-bold rounded-2xl text-white`}
                        onClick={() => { setShowModal(true); setEditProduct(null) }}>
                        +Add Product
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <div className="min-w-full inline-block align-middle">
                        <div className={`overflow-hidden rounded-2xl shadow-md ${darkLight ? "shadow-gray-800" : ""}`}>
                            <table className={`min-w-full divide-y ${darkLight ? "divide-gray-700" : "divide-gray-200"}`}>
                                <thead className={darkLight ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700"}>
                                    <tr>
                                        <th className="px-6 py-3 text-left">ID</th>
                                        <th className="px-6 py-3 text-left">Profile</th>
                                        <th className="px-6 py-3 text-left">Name</th>
                                        <th className="px-6 py-3 text-left">Username</th>
                                        <th className="px-6 py-3 text-left">email ($)</th>
                                        <th className="px-6 py-3 text-left">RoldId</th>
                                        <th className="px-6 py-3 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${darkLight ? "divide-gray-700 text-gray-300" : "divide-gray-200 text-gray-800"}`}>
                                    {datas?.map((product: { id: number; name: string; username?: string | null; email: string; profilePicture: string; roleId: number }) => (
                                        <tr key={product.id} className={darkLight ? "hover:bg-gray-800 transition" : "hover:bg-gray-50 transition"}>
                                            <td className="px-6 py-4 whitespace-nowrap">{product.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <img
                                                    src={product.profilePicture || "https://cdn-icons-png.flaticon.com/512/10337/10337609.png"}
                                                    // src="http://localhost:5173/8de79733-0e40-4d3b-8e6f-1df5d200c171"
                                                    alt="Profile"
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium">{product.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{product.username}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{product.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{product.roleId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <button className={`p-2 rounded transition cursor-pointer ${darkLight ? "text-blue-400 hover:text-blue-300 hover:bg-blue-900" : "text-blue-600 hover:text-blue-800 hover:bg-blue-100"}`} onClick={() => UpdateProduct(product.id)} title="Edit"><FiEdit size={20} /></button>
                                                    <button className={`p-2 rounded transition cursor-pointer ${darkLight ? "text-red-400 hover:text-red-300 hover:bg-red-900" : "text-red-600 hover:text-red-800 hover:bg-red-100"}`} onClick={() => DeleteProduct(product.id)} title="Delete"><FiTrash2 size={18} /></button>
                                                    <button className={`p-2 rounded transition cursor-pointer ${darkLight ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"}`} onClick={() => console.log("View", product.id)} title="View"><FiEye size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {data?.length === 0 && (
                                <div className={`text-center py-4 ${darkLight ? "text-gray-400" : "text-gray-500"}`}>No products found.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showModal ? <Form
                onClose={() => { setShowModal(false) }}
                onSubmit={HandleCreateAndUpdateData}
                productBack={editProduct ?? undefined} // 👈 This passes data to the form
                formlayout={
                    [
                        {
                            row: [
                                { key: "name", label: "Name", type: "text", required: true, col: 4 },
                                { key: "username", label: "Username", type: "text", col: 4, required: true },
                                { key: "email", label: "email", type: "email", col: 4, required: true },
                            ]
                        },
                        {
                            row: [
                                { key: "passwordHash", label: "Password", type: "password", col: 6 },
                                { key: "passwordSalt", label: "Password", type: "password", col: 6 },
                            ]
                        },
                        { key: "profilePicture", label: "Image", type: "file", accept: "image/*", col: 12 },
                        // {
                        //   key: "profilePicture",
                        //   label: "Profile Image",
                        //   type: "file",
                        //   // required: true,
                        //   placeholder: "Upload your profile picture",
                        //   accept: "image/*",
                        //   col: 12,
                        // },


                        // {
                        //   key: "roleId", label: "Role", type: "select",
                        //   options: [
                        //     { label: "Admin", value: { id: 1, name: "Admin" } },
                        //     { label: "User", value: { id: 2, name: "User" } },
                        //     { label: "Teacher", value: { id: 3, name: "Teacher"} },
                        //     { label: "Parent", value: { id: 4, name: "parent" } },
                        //     { label: "Student", value: { id: 5, name: "Student" } }
                        //   ],
                        //   placeholder: "select"
                        // },
                        {
                            key: "roleId",
                            label: "Select Role",
                            type: "select",
                            optionAPI: "https://localhost:7095/api/Role", // URL to fetch options from
                            required: true,
                            placeholder: "Select",
                            col: 6,
                        },
                    ]
                }
            />
                : ""}
        </>
    );
}
