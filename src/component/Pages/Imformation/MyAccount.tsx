import { useState, useEffect } from 'react';
import useFetchDataApi from '../../../CustomHook/FetchDataApi';
import Form2 from '../../../CustomHook/Form2';
import { HookIntergrateAPI } from '../../../CustomHook/HookIntergrateAPI';
import alertify from 'alertifyjs';
type UserProfile = {
  id: number;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  profilePicture: string;
  createdAt: string;
  updatedAt: string;
  roleId: number;
};

type Product = {
  id?: number;
  name?: string;
  username?: string;
  email?: string;
  ProfilePicture?: string;
};

const MyProfile = () => {
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const { data } = useFetchDataApi("https://localhost:7095/api/User");
  console.log("data ==>>",data);
  const { updateData } = HookIntergrateAPI();
  const [isChange, setIsChange] = useState(false);

  const email = sessionStorage.getItem("email");
  useEffect(() => {
    if (data && email) {
      const foundUser = data.find((item: UserProfile) => item.email === email);
      setUser(foundUser || null);
    }
  }, [data]);

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-white p-6">
        <div className="text-gray-600 text-lg">Loading profile...</div>
      </div>
    );
  }

  const HandleCreateAndUpdateData = (data: any) => {
    if (isChange) {
      sessionStorage.setItem("email", data.email);
      sessionStorage.setItem("roleId", data.roleId);
    }
    updateData("https://localhost:7095/api/User", user.id, data, () => {
      setShowModal(false);
      setEditProduct(null);
      alertify.success("Update successfully !!");
    })
  }

  const EditProfile = () => {
    console.log(email);
    console.log(user.email);
    if (email === user.email) {
      setIsChange(true);
    }
    setShowModal(true);
    setEditProduct(user);
  }



  return (
    <>
      <div className="flex justify-center items-center min-h-scree ">
        <div className="bg-red-50 rounded-3xl shadow-xl max-w-md  p-8 transition-all duration-300 hover:shadow-2xl w-full">
          <div className="flex flex-col items-center text-center">
            <img
              className="w-28 h-28 rounded-full shadow-lg border-4 border-white object-cover transition-transform duration-300 hover:scale-105"
              src={user.profilePicture || "data:image/png;base64,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"}
              alt="Profile"
            />
            <h2 className="text-2xl font-extrabold mt-4 text-gray-800">{user?.name}</h2>
            <p className="text-blue-500 font-medium">{user?.username}</p>
            <p className="text-gray-600 mt-1">{user?.email}</p>
            <span className="mt-2 inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-semibold">
              Role ID: {user?.roleId}
            </span>
          </div>

          <div className="mt-6 border-t pt-4 text-sm text-gray-700 space-y-2">
            <div>
              <span className="font-semibold">Account Created:</span><br />
              {new Date(user?.createdAt).toLocaleString()}
            </div>
            <div>
              <span className="font-semibold">Last Updated:</span><br />
              {new Date(user?.updatedAt).toLocaleString()}
            </div>
          </div>

          <div className="mt-6 text-center">
            <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-full font-semibold transition cursor-pointer"
              onClick={EditProfile}
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {showModal ? <Form2
        onClose={() => { setShowModal(false) }}
        onSubmit={HandleCreateAndUpdateData}
        productBack={editProduct ?? undefined} // 👈 This passes data to the form
        Title={'UPDATE INFORMATION USERS'}
        dailogSize={''}
        formlayout={
          [
            {
              row: [
                { key: "name", label: "Name", type: "text", required: true, col: 4 },
                { key: "username", label: "Username", type: "text", col: 4, required: true },
                { key: "email", label: "email", type: "email", col: 4, required: true },
              ]
            },
            // {
            //   row: [
            //     { key: "passwordHash", label: "Password", type: "password", col: 6 },
            //     { key: "passwordSalt", label: "Password", type: "password", col: 6 },
            //   ]
            // },
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
};

export default MyProfile;
