import { FiBarChart2, FiUsers, FiShield } from "react-icons/fi";
import { FaChalkboardTeacher, FaUser, FaBook } from "react-icons/fa";
import { MdApproval, MdCardMembership, MdCategory, MdRememberMe } from "react-icons/md";
import { FaCodePullRequest } from "react-icons/fa6";
import { CiLogout } from "react-icons/ci";

const menuItems = [
  {
    label: "Dashboard",
    icon: <FiBarChart2 />,
    path: "/dashbord",
  },
  {
    label: "Category",
    icon: <MdCategory />,
    path: "/category",
    permission: "category:list"
  },
  {
    label: "Book",
    icon: <FaBook />,
    path: "/book",
    permission: "book:list"
  },
  {
    label: "BookIssue All",
    icon: <CiLogout />,
    path: "/issuebook",
    permission: "bookissue:list"
  },
  {
    label: "My Book Issue",
    icon: <CiLogout />,
    path: "/myissuebook",
    permission: "bookissue:currentuser"
  },
  {
    label: "Member",
    icon: <MdCardMembership />,
    children: [
      {
        name: "All Request Member",
        path: "/requestmember",
        icon: <FaCodePullRequest />,
        permission: "librarymember:requestall"
      },
      {
        name: "My Request Member",
        path: "/approvemember",
        icon: <MdApproval />,
        permission: "librarymember:request"
      },
      {
        name: "LibraryMember",
        path: "/librarymember",
        icon: <MdRememberMe />,
        permission: "librarymember:list"
      },
    ]
  },
  {
    label: "User Management",
    icon: <FaChalkboardTeacher />,
    children: [
      {
        name: "User",
        path: "/userlist",
        icon: <FiUsers />,
        permission: "user:list"
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