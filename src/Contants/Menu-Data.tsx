import {
  FiBarChart2,
  FiShield,
  FiGrid,
  FiPackage,
  FiUser,
  FiSettings,
  FiUserCheck,
} from "react-icons/fi";

import {
  FaExclamationTriangle,
  FaCashRegister,
  FaShoppingCart,
  FaUserTie,
  FaLayerGroup,
  FaUsers,
  FaUserClock,
  FaClipboardList,
} from "react-icons/fa";

import {
  MdOutlineStorefront,
  MdPeopleAlt,
  MdInventory2,
} from "react-icons/md";

import { BiSolidDiscount } from "react-icons/bi";
import { HiUserGroup } from "react-icons/hi";

const menuItems = [
  {
    label: "Dashboard",
    icon: <FiBarChart2 />,
    path: "/dashbord",
    permission: "role:list",
  },
  {
    label: "Sale",
    icon: <FaCashRegister />, // good for sales
    children: [
      {
        name: "Sale Product",
        icon: <FaShoppingCart />, // product selling
        path: "/sale-product",
      },
      {
        name: "Order List",
        icon: <FaClipboardList />, // better than FaListAlt
        path: "/order-list",
      },
    ],
  },
  {
    label: "Leave Request",
    icon: <FaUserClock />, // better meaning (time + user)
    children: [
      {
        name: "My Leave Request",
        icon: <FaUserClock />, // personal leave
        path: "/my-leave-request",
      },
      {
        name: "All Leave Request",
        icon: <FaUsers />, // group of users
        path: "/all-leave-request",
      },
      {
        name: "Leave Type",
        icon: <FaLayerGroup />, // types/categories
        path: "/leave-type",
      },
    ],
  },
  {
    label: "Branch",
    icon: <MdOutlineStorefront />,
    path: "/branch",
  },
  {
    label: "Customer",
    icon: <MdPeopleAlt />,
    path: "/customer",
  },
  {
    label: "Staff",
    icon: <FaUserTie />,
    path: "/staff",
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
    icon: <BiSolidDiscount />,
    path: "/discount",
  },
  {
    label: "Stock",
    icon: <MdInventory2 />,
    path: "/stock",
  },
  {
    label: "User Management",
    icon: <HiUserGroup />,
    children: [
      {
        name: "User",
        path: "/userlist",
        icon: <FiUser />,
      },
      {
        name: "Role",
        path: "/rolelist",
        icon: <FiShield />,
        permission: "role:list",
      },
    ],
  },
  {
    label: "Setting",
    icon: <FiSettings />,
    children: [
      {
        name: "PointSetting",
        path: "/point-setting",
        icon: <FiUserCheck />,
      },
    ]
  }
];

export default menuItems;