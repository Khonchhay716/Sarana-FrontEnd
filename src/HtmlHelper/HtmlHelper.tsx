// import React, { useState } from 'react';
// import alertify from 'alertifyjs';
// import apix from './Apix'; // Your custom API wrapper

// const CreateItem: React.FC = () => {
//   const [name, setName] = useState('');

//   const handleCreate = async () => {
//     if (!name.trim()) {
//       alertify.warning('Please enter a valid name');
//       return;
//     }

//     const response = await apix.post('/api/items', { name });

//     if (response.ok) {
//       alertify.success(`"${name}" has been created successfully.`);
//       setName('');
//     } else {
//       let errorMessage = 'Failed to create item';
//       try {
//         const json = JSON.parse(response.data);
//         if (json?.message) errorMessage = json.message;
//       } catch {}
//       alertify.error(errorMessage);
//     }
//   };

//   return (
//     <div className="p-4 max-w-md mx-auto bg-white shadow rounded">
//       <h2 className="text-xl font-semibold mb-2">Create New Item</h2>
//       <input
//         type="text"
//         className="border p-2 w-full rounded mb-3"
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//         placeholder="Enter item name"
//       />
//       <button
//         onClick={handleCreate}
//         className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//       >
//         Create
//       </button>
//     </div>
//   );
// };

// export default CreateItem;
