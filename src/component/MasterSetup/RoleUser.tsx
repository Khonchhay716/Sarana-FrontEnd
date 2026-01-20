import React, { useState } from "react";
import { useGlobleContextDarklight } from "../../AllContext/context";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { HookIntergrateAPI } from "../../CustomHook/HookIntergrateAPI";
import Form2 from "../../CustomHook/Form2";
import useFetchDataApi from "../../CustomHook/FetchDataApi";
import alertify from "alertifyjs";

type SimpleItem = { id: number; name: string; description: string };

const CoffeeMenuTable: React.FC = () => {
  const { createData, updateData, DeleteData, GetDatabyID } = HookIntergrateAPI();
  const { data } = useFetchDataApi("https://localhost:7095/api/Role");
  const { darkLight } = useGlobleContextDarklight();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<SimpleItem | null>(null);
  const [isAdd, setIsAdd] = useState(true);

  const handleView = () => { alertify.warning("Not yet implemented. Please wait!"); };
  const handleEdit = async (id: number) => {
    const productData: any = await GetDatabyID("https://localhost:7095/api/Role", id);
    if (productData) { setEditItem(productData); setShowModal(true); setIsAdd(false); }
  };
  const handleDelete = (id: number) => { DeleteData("https://localhost:7095/api/Role", id); };
  const handleAddItem = (data: any) => {
    if (isAdd) {
      createData("https://localhost:7095/api/Role", data, () => { setShowModal(false); alertify.success("Item added successfully!"); });
    } else {
      updateData("https://localhost:7095/api/Role", data.id, data, () => { setShowModal(false); setEditItem(null); alertify.success("Item updated successfully!"); });
      setIsAdd(true);
    }
  };

  return (
    <>
      <div className={`w-full transition-all duration-300 pb-13 ${darkLight ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Simple Item List</h2>
          <button onClick={() => { setShowModal(true); setIsAdd(true); setEditItem(null); }} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition">+ Add Item</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse shadow-lg rounded-2xl overflow-hidden">
            <thead>
              <tr className={`${darkLight ? "bg-gray-950 text-white" : "bg-amber-100 text-brown-800"}`}>
                <th className="p-3 text-left w-[60px]">ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-center w-[200px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item: SimpleItem, index) => (
                <tr key={item.id} className={`transition ${darkLight ? (index % 2 === 0 ? "bg-gray-800" : "bg-gray-700") : (index % 2 === 0 ? "bg-white" : "bg-amber-50")} hover:${darkLight ? "bg-gray-600" : "bg-amber-100"}`}>
                  <td className={`p-3 text-sm ${darkLight ? "text-gray-300" : "text-gray-500"}`}>{item.id}</td>
                  <td className={`p-3 font-medium ${darkLight ? "text-white" : "text-brown-700"}`}>{item.name}</td>
                  <td className={`p-3 font-medium ${darkLight ? "text-white" : "text-brown-700"}`}>{item.description}</td>
                  <td className="p-3 text-center space-x-2">
                    <button className="text-blue-500 hover:text-blue-700 transition cursor-pointer" title="View" onClick={() => handleView()}><FaEye /></button>
                    <button onClick={() => handleEdit(item.id)} className="text-yellow-500 hover:text-yellow-600 transition cursor-pointer" title="Edit"><FaEdit /></button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 transition cursor-pointer" title="Delete"><FaTrash /></button>
                  </td>
                </tr>
              ))} 
            </tbody>
          </table>
        </div>
      </div>
      {showModal ? <Form2 onClose={() => { setShowModal(false); setIsAdd(true); setEditItem(null); }} onSubmit={handleAddItem} productBack={editItem ?? undefined} dailogSize={'w-[50%]'} Title="Form Role User " formlayout={[{ row: [{ key: "name", label: "Name", type: "text", required: true, col: 6 }, { key: "description", label: "Description", type: "string", col: 6, required: false }] }]} /> : null}
    </>
  );
};

export default CoffeeMenuTable;
