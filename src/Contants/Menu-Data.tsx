import {
  FiBarChart2,
  FiUsers,
  FiShield,
  FiGrid,
  FiPackage,
  FiTag,
  FiLayers
} from "react-icons/fi";

import {
  FaWarehouse,
  FaExclamationTriangle
} from "react-icons/fa";

const menuItems = [
  {
    label: "Dashboard",
    icon: <FiBarChart2 />,
    path: "/dashbord",
    permission: "role:list"
  },
  {
    label: "Sale Product",
    icon: <FaWarehouse />,
    path: "/sale-product",
  },
  {
    label: "Branch",
    icon: <FaWarehouse />,
    path: "/branch",
  },
  {
    label: "Category",
    icon: <FiGrid />, 
    path: "/category",
  },
  {
    label: "Product",
    icon: <FiPackage />,
    path: "/product",
  },
  {
    label: "Low Stock",
    icon: <FaExclamationTriangle />,
    path: "/lowstock",
  },
  {
    label: "Discount",
    icon: <FiTag />,
    path: "/discount",
  },
  {
    label: "Stock",
    icon: <FiLayers />,
    path: "/stock",
  },
  {
    label: "User Management",
    icon: <FiUsers />,
    children: [
      {
        name: "User",
        path: "/userlist",
        icon: <FiUsers />,
      },
      {
        name: "Role",
        path: "/rolelist",
        icon: <FiShield />,
        permission: "role:list"
      },
    ]
  },
];

export default menuItems;