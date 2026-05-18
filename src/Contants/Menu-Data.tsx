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
    // No permission guard — everyone who is logged in can see the dashboard
  },
  {
    label: "Sale",
    icon: <FaCashRegister />,
    children: [
      {
        name: "Sale Product",
        icon: <FaShoppingCart />,
        path: "/sale-product",
        permission: "order:create",
      },
      {
        name: "Order List",
        icon: <FaClipboardList />,
        path: "/order-list",
        permission: "order:read",
      },
    ],
  },
  {
    label: "Leave",
    icon: <FaUserClock />,
    children: [
      {
        name: "My Leave Request",
        icon: <FaUserClock />,
        path: "/my-leave-request",
        permission: "leave_request:read_my",
      },
      {
        name: "All Leave Request",
        icon: <FaUsers />,
        path: "/all-leave-request",
        permission: "leave_request:read_all",
      },
      {
        name: "Leave Type",
        icon: <FaLayerGroup />,
        path: "/leave-type",
        permission: "leave_type:read",
      },
    ],
  },
  {
    label: "Branch",
    icon: <MdOutlineStorefront />,
    path: "/branch",
    permission: "branch:read",
  },
  {
    label: "Customer",
    icon: <MdPeopleAlt />,
    path: "/customer",
    permission: "customer:read",
  },
  {
    label: "Staff",
    icon: <FaUserTie />,
    path: "/staff",
    permission: "staff:read",
  },
  {
    label: "Category",
    icon: <FiGrid />,
    path: "/category",
    permission: "category:read",
  },
  {
    label: "Product",
    icon: <FiPackage />,
    path: "/product",
    permission: "product:read",
  },
  {
    label: "Low Stock",
    icon: <FaExclamationTriangle />,
    path: "/lowstock",
    permission: "product:read",
  },
  {
    label: "Discount",
    icon: <BiSolidDiscount />,
    path: "/discount",
    permission: "discount:read",
  },
  {
    label: "Stock",
    icon: <MdInventory2 />,
    path: "/stock",
    permission: "manage_stock:all",
  },
  {
    label: "User Management",
    icon: <HiUserGroup />,
    children: [
      {
        name: "User",
        path: "/userlist",
        icon: <FiUser />,
        permission: "user:list",
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
        permission: "point_setting:view",
      },
    ],
  },
];

export default menuItems;