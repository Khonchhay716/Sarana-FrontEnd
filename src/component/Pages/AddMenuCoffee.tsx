import React, { useState } from 'react';
import image from '../../assets/image.png';
import { useGlobleContextDarklight } from '../../AllContext/context';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { HookIntergrateAPI } from '../../CustomHook/HookIntergrateAPI';
import Form2 from '../../CustomHook/Form2';
import useFetchDataApi from '../../CustomHook/FetchDataApi';
type MenuItem = {
  id: string;
  name: string;
  price: number;
  image: string;
};

export const coffeeMenu: MenuItem[] = [
  { id: '101', name: 'Espresso', price: 2.5, image },
  { id: '102', name: 'Cappuccino', price: 3.0, image },
  { id: '103', name: 'Latte', price: 3.5, image },
  { id: '104', name: 'Mocha', price: 4.0, image },
  { id: '105', name: 'Americano', price: 2.75, image },
  { id: '106', name: 'Macchiato', price: 3.25, image },
  { id: '107', name: 'Cold Brew', price: 4.5, image },
  { id: '108', name: 'Iced Latte', price: 4.0, image },
  { id: '109', name: 'Flat White', price: 3.75, image },
  { id: '110', name: 'Turkish Coffee', price: 3.0, image },
  { id: '201', name: 'Croissant', price: 2.5, image },
  { id: '202', name: 'Blueberry Muffin', price: 3.0, image },
];

type menucoffee = {
  id?: number;
  title?: string;
  price?: number;
  image?: string;
};

const CoffeeMenuTable: React.FC = () => {
  const { createData, updateData, DeleteData, GetDatabyID } = HookIntergrateAPI();
  const { data } = useFetchDataApi('https://localhost:7095/api/CoffeeMenu');
  const { darkLight } = useGlobleContextDarklight();
  const [showModal, setShowModal] = useState(false);
  const [editmenu, setEditmenu] = useState<menucoffee | null>(null);
  const [Isadd, setIsadd] = useState(true);

  const handleView = (item: MenuItem) => {
    alert(`Viewing: ${item.name}`);
  };

  const handleEdit = async(id: number) => {
    const productData: any = await GetDatabyID('https://localhost:7095/api/CoffeeMenu', id);
    if (productData) {
      console.log(productData);
      // productData.roleId = productData.role;
      setEditmenu(productData);
      setShowModal(true);
      setIsadd(false);
    }

  };

  const handleDelete = (id: number) => {
    DeleteData('https://localhost:7095/api/CoffeeMenu', id);
  };

  const handleAddMenu = (data: any) => {
    // data.roleId = data.roleId.id;
    if (Isadd) {  /// create data in api 
      createData("https://localhost:7095/api/CoffeeMenu", data, () => {
        setShowModal(false);
      });
    } else {  //Update data in API
      updateData("https://localhost:7095/api/CoffeeMenu", data.id, data, () => {
        setShowModal(false);
        setEditmenu(null);
      })
      setIsadd(true);
    }
  };

  return (
    <>
      <div
        className={`w-full transition-all duration-300 pb-13 ${darkLight ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
          }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">☕ Coffee & Pastry Menu</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            + Add Menu
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse shadow-lg rounded-2xl overflow-hidden">
            <thead>
              <tr className={`${darkLight ? 'bg-gray-800 text-white' : 'bg-amber-100 text-brown-800'}`}>
                <th className="p-3 text-left w-[60px]">ID</th>
                <th className="p-3 text-left w-[70px]">Image</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-right w-[100px]">Price ($)</th>
                <th className="p-3 text-center w-[200px]">Actions</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item: { id: number, title: string, price: number, image: string }, index) => (
                <tr
                  key={item.id}
                  className={`transition ${darkLight
                    ? `${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'} hover:bg-gray-600`
                    : `${index % 2 === 0 ? 'bg-white' : 'bg-amber-50'} hover:bg-amber-100`
                    }`}
                >
                  <td className={`p-3 text-sm ${darkLight ? 'text-gray-300' : 'text-gray-500'}`}>{item.id}</td>
                  <td className="p-3">
                    <img
                      src={item.image ?? ""}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover border border-amber-300"
                    />
                  </td>
                  <td className={`p-3 font-medium ${darkLight ? 'text-white' : 'text-brown-700'}`}>{item.title}</td>
                  <td className={`p-3 text-right ${darkLight ? 'text-amber-200' : 'text-brown-600'}`}>
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="p-3 text-center space-x-2">
                    <button
                      className="text-blue-500 hover:text-blue-700 transition"
                      title="View"
                    >
                      <FaEye />
                    </button>
                    <button
                      // onClick={() => handleEdit()}
                      onClick={() => handleEdit(item.id)}
                      className="text-yellow-500 hover:text-yellow-600 transition"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:text-red-700 transition"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {
        showModal ? <Form2
          onClose={() => { setShowModal(false) }}
          onSubmit={handleAddMenu}
          productBack={editmenu ?? undefined} // 👈 This passes data to the form
          formlayout={
            [
              {
                row: [
                  { key: "title", label: "Title", type: "text", required: true, col: 6 },
                  { key: "price", label: "Price", type: "number", col: 6, required: true },
                ]
              },
              { key: "image", label: "Image", type: "file", accept: "image/*", required: true, col: 12 },
            ]
          }
        />
          : ""
      }
    </>


  );
};

export default CoffeeMenuTable;
