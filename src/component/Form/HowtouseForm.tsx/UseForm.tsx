import { useState } from "react";
import useFetchDataApi from "../../../CustomHook/FetchDataApi";
import { FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import { useGlobleContextDarklight } from "../../../AllContext/context";
// import FormProduct from "../Form/FormProduct";
import { HookIntergrateAPI } from "../../../CustomHook/HookIntergrateAPI";
import FormProduct from '../../../CustomHook/HookForm';

type Product = {  // type for push data back to form 
    id?: number;
    name?: string;
    description?: string;
    price?: number;
    isInStore?: boolean;
};


export default function ProductTable() {
    const { darkLight } = useGlobleContextDarklight();
    const [showModal, setShowModal] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [isCreate, setIsCreate] = useState(true);

    const { isError, isLoading, data } = useFetchDataApi("https://localhost:7213/api/Product"); // get data
    const { createData, DeleteData, GetDatabyID, updateData, GetDataAll } = HookIntergrateAPI(); /// intergrate api


    if (isLoading) return <div className={darkLight ? "text-white" : "text-gray-800"}>Loading...</div>;
    if (isError) return <div className={darkLight ? "text-white" : "text-gray-800"}>Error fetching data</div>;

    //// intergrate API 
    const HandleCreateAndUpdateData = (data: any) => {
        console.log(data.category);
        if (isCreate) {  /// create data in api 
            createData("https://localhost:7213/api/Product", data, () => {
                setShowModal(false);
            });
        } else {  //Update data in API
            updateData("https://localhost:7213/api/Product", data.id, data, () => {
                setShowModal(false);
                setEditProduct(null);
            })
            setIsCreate(true);
        }
    }

    ///delete data 
    const DeleteProduct = async (id: number) => {
        DeleteData('https://localhost:7213/api/Product', id);
    };

    /// Update product
    const UpdateProduct = async (id: number) => {
        const productData: any = await GetDatabyID('https://localhost:7213/api/Product', id);
        if (productData) {
            setEditProduct(productData);
            setShowModal(true);
            setIsCreate(false);
        }
    }

    // get all data 
    // const getallData = async() => {
    //   const datanew: any = await GetDataAll('https://localhost:7213/api/Product');
    //   console.log("new data");
    //   console.log(datanew);
    // }
    // getallData();



    return (
        <>
            <div className={`p-4 ${darkLight ? "bg-gray-900 text-white" : "bg-white text-gray-800"}`}>
                <div className="h-[40px] flex justify-between mb-3">
                    <p className="text-2xl font-bold">Product List</p>
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
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${darkLight ? "divide-gray-700 text-gray-300" : "divide-gray-200 text-gray-800"}`}>
                                    {data?.map((product: { id: number; name: string; description?: string | null; price: number; isInStore: boolean; }) => (
                                        <tr key={product.id} className={darkLight ? "hover:bg-gray-800 transition" : "hover:bg-gray-50 transition"}>
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

            {/* {showModal ? <FormProduct
        onClose={() => { setShowModal(false) }}
        onSubmit={HandleCreateAndUpdateData}
        ProductBack={editProduct ?? undefined} // 👈 This passes data to the form
      />
        : ""} */}
            {showModal ? <FormProduct
                onClose={() => { setShowModal(false) }}
                onSubmit={HandleCreateAndUpdateData}
                productBack={editProduct ?? undefined}
                formlayout={
                    [
                        // { key: "color", label: "Color", type: "radio", options: ["Red", "Green", "Blue"] },
                        {
                            row: [
                                { key: "firstName", label: "First Name", type: "text", col: 3, required: true },
                                { key: "lastName", label: "Last Name", type: "text", col: 9 },
                            ],
                        },
                        {
                            key: "category",
                            label: "Product Category",
                            type: "select",
                            options: ["Electronics", "Clothing", "Food", "Home Goods"],
                            placeholder: "Select a category",
                        },
                        {
                            row: [
                                {
                                    key: "mainCategory",  // Changed from "category"
                                    label: "Main Category",
                                    type: "select",
                                    options: ["Electronics", "Clothing", "Food", "Home Goods"],
                                    placeholder: "Select",
                                    col: 4
                                },
                                {
                                    key: "subCategory",  // Changed from "category"
                                    label: "Sub Category",
                                    type: "select",
                                    options: ["Electronics", "Clothing", "Food", "Home Goods"],
                                    placeholder: "Select",
                                    col: 4
                                },
                                {
                                    key: "subCategory",  // Changed from "category"
                                    label: "Sub Category",
                                    type: "select",
                                    options: ["Electronics", "Clothing", "Food", "Home Goods"],
                                    placeholder: "Select",
                                    col: 4
                                },
                            ]
                        },
                        { key: "name", label: "Name", type: "text", required: true },
                        { key: "description", label: "Discription", type: "text" },
                        { key: "price", label: "Price", type: "number" },
                        {
                            row: [
                                { key: "price", label: "Price", type: "number", col: 6 },
                                { key: "price", label: "Price", type: "number", col: 6 },
                            ]
                        },
                        { key: "isInStore", label: "isInStore", type: "checkbox" },
                    ]
                }
            />
                : ""}
        </>
    );
}
