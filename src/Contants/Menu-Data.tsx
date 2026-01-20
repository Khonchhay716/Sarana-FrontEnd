import { FiBarChart2, FiBookOpen, FiClipboard,} from "react-icons/fi";
import { FaChalkboardTeacher } from "react-icons/fa";
import { MdMenuBook } from "react-icons/md";

const menuItems = [
  { label: "Dashboard", icon: <FiBarChart2 />, path: "/dashbord" },
  {
    label: "Menu", icon: <MdMenuBook />, children: [
      { name: "Menu", path: "/pos" },
      { name: "Add Menu", path: "/addmenucoffee" },
    //   { name: "Send Mail", path: "/sendmail" },
    ]
  },
//   {
//     label: "Invoice", icon: <FaChalkboardTeacher />, children: [
//       { name: "Invoice", path: "/invoice" },
//       { name: "Report", path: "/report" },
//       { name: "InvoiceTest", path: "/invoicetest" },
//     ]
//   },
  {
    label: "Users", icon: <FaChalkboardTeacher />, children: [
      { name: "User", path: "/users" },
    ]
  },
  {
    label: "Products", icon: <FaChalkboardTeacher />, children: [
      { name: "Product", path: "/product" },
    ]
  },
  {
    label: "Master Setup", icon: <FiBookOpen />, children: [
      { name: "Role  ", path: "/role" },
      { name: "Type of product ", path: "/typeproduct" },
    ]
  },
  {
    label: "Reports", icon: <FiClipboard />, children: [
      { name: "History Sale", path: "/historySale" },
    ]
  },
];
export default menuItems;
