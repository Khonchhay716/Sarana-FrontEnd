
import DashBord from "../../page DashBoard/DashBord.tsx";
import ForgotPassword from "../../component/Form/FormLoginLogout/ForgotPassword.tsx";
import FormVerifycode from "../../component/Form/FormLoginLogout/FormVerifyCode.tsx";
import FormVerifycode2 from "../../component/Form/FormLoginLogout/FormverifyCode2.tsx";
import FormResetPassword from "../../component/Form/FormLoginLogout/FormResetPassword.tsx";
import Formlogin from '../../component/Form/FormLoginLogout/Login2.tsx';
import Register from "../../component/Form/FormLoginLogout/Register.tsx";
import PageNotFound from "../../page DashBoard/PagenotFound.tsx";

import { Route } from "react-router-dom";
import { all_routes } from "./AllRouter.tsx";
import UserList from "../../Feature/Users/UserList.tsx";
import RoleList from "../../Feature/Role/Rolelist.tsx";
import Permissions from "../../Feature/Role/Rolepermission.tsx";
import ProtextRoute from "../../component/ProtextRoute/AuthPermissionScope.tsx";
import Profile from "../../Feature/Profile.tsx/Profile.tsx";
import ProductList from "../../Feature/Product/ProductList.tsx";
import StockList from "../../Feature/Stock/StockList.tsx";
import BranchList from "../../Feature/Branch/Branchlist.tsx";
import CategoryList from "../../Feature/Category/Categorylist.tsx";
import DiscountList from "../../Feature/Discount/Discountlist.tsx";
import ProductLowStockList from "../../Feature/Product/Productlowstocklist.tsx";
import PosShop from "../../Feature/POS-Sale/Pos-Sale.tsx";
import OrderList from "../../Feature/OrderList/OrderList.tsx";
import CustomerList from "../../Feature/Customer/Customerlist.tsx";
import StaffList from "../../Feature/Staff/Stafflist.tsx";
import LeaveRequestAll from "../../Feature/LeaveRequest/LeaveRequestAll.tsx";
import MyLeaveRequest from "../../Feature/LeaveRequest/MyLeaveRequest.tsx";
import LeaveTypeList from "../../Feature/LeaveType/LeaveTypeList.tsx";
import PointSetupPage from "../../Feature/PointSetup/PointSetupPage.tsx";

const routes = all_routes;
export const publicRoutes = [
    // {
    //     path: "/",
    //     element: <Formlogin />,
    //     route: Route,
    // },
    {
        path: routes.formLogin,
        element: <Formlogin />,
        route: Route,
    },
    {
        path: routes.register,
        element: <Register />,
        route: Route,
    },
    {
        path: routes.forgotPaswword,
        element: <ForgotPassword />,
        route: Route,
    },
    {
        path: routes.formVerifyCode,
        element: <FormVerifycode />,
        route: Route,
    },
    {
        path: routes.formVerifyCode2,
        element: <FormVerifycode2 />,
        route: Route,
    },
    {
        path: routes.formResetPassword,
        element: <FormResetPassword />,
        route: Route,
    },
    {
        path: routes.formResetPassword,
        element: <FormResetPassword />,
        route: Route,
    }, {
        path: routes.pageNotFound,
        element: <PageNotFound />,
        route: Route,
    },

]
export const path = [
    {
        path: "/",
        element: <DashBord />,
        route: Route,
    },
    {
        path: routes.dashbord,
        element: <DashBord />,
        route: Route,
    },
    {
        path: routes.SaleProduct,
        element: (
            // <ProtextRoute scopes={["user:list"]}>
            <PosShop />
            // </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.OrderList,
        element: (
            // <ProtextRoute scopes={["user:list"]}>
            <OrderList />
            // </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.Customer,
        element: (
            // <ProtextRoute scopes={["user:list"]}>
            <CustomerList />
            // </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.AllLeaveRequest,
        element: (
            // <ProtextRoute scopes={["user:list"]}>
            <LeaveRequestAll />
            // </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.MyLeaveRequest,
        element: (
            // <ProtextRoute scopes={["user:list"]}>
            <MyLeaveRequest />
            // </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.LeaveType,
        element: (
            // <ProtextRoute scopes={["user:list"]}>
            <LeaveTypeList />
            // </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.Staff,
        element: (
            // <ProtextRoute scopes={["user:list"]}>
            <StaffList />
            // </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.Product,
        element: (
            // <ProtextRoute scopes={["user:list"]}>
            <ProductList />
            // </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.Stock,
        element: (
            // <ProtextRoute scopes={["user:list"]}>
            <StockList />
            // </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.Branch,
        element: (
            // <ProtextRoute scopes={["user:list"]}>
            <BranchList />
            // </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.Category,
        element: (
            // <ProtextRoute scopes={["user:list"]}>
            <CategoryList />
            // </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.Discount,
        element: (
            // <ProtextRoute scopes={["user:list"]}>
            <DiscountList />
            // </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.LowStock,
        element: (
            // <ProtextRoute scopes={["user:list"]}>
            <ProductLowStockList />
            // </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.PointSetting,
        element: (
            // <ProtextRoute scopes={["user:list"]}>
            <PointSetupPage />
            // </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.UserList,
        element: (
            <ProtextRoute scopes={["user:list"]}>
                <UserList />
            </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.RoleList,
        element: (
            <ProtextRoute scopes={["role:list"]}>
                <RoleList />
            </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.permission,
        element: (
            <ProtextRoute scopes={["permission:read"]}>
                <Permissions />
            </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.Profile,
        element: (
            <Profile />
        ),
        route: Route,
    },
];