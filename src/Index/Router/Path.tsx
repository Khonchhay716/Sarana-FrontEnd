import DashBord from "../../page DashBoard/DashBord.tsx";
import ForgotPassword from "../../component/Form/FormLoginLogout/ForgotPassword.tsx";
import FormVerifycode from "../../component/Form/FormLoginLogout/FormVerifyCode.tsx";
import FormVerifycode2 from "../../component/Form/FormLoginLogout/FormverifyCode2.tsx";
import FormResetPassword from "../../component/Form/FormLoginLogout/FormResetPassword.tsx";
import Formlogin from '../../component/Form/FormLoginLogout/Login2.tsx';
// import { GhostOverlay } from '../../component/Form/FormLoginLogout/Login.tsx';
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
import BranchList from "../../Feature/Branch/Branchlist.tsx";
import DiscountList from "../../Feature/Discount/Discountlist.tsx";
import ProductLowStockList from "../../Feature/Product/Productlowstocklist.tsx";
import PosShop from "../../Feature/POS-Sale/Pos-Sale.tsx";
import StockOutPage from "../../Feature/StockManagement/StockOut/StockOutPage.tsx";
import OrderList from "../../Feature/OrderList/OrderList.tsx";
import CustomerList from "../../Feature/Customer/Customerlist.tsx";
import StaffList from "../../Feature/Staff/Stafflist.tsx";
import LeaveRequestAll from "../../Feature/LeaveRequest/LeaveRequestAll.tsx";
import MyLeaveRequest from "../../Feature/LeaveRequest/MyLeaveRequest.tsx";
import LeaveTypeList from "../../Feature/LeaveType/LeaveTypeList.tsx";
import PointSetupPage from "../../Feature/PointSetup/PointSetupPage.tsx";
import CategoryList from "../../Feature/Category/CategoryList1.tsx";
import AutoClaimCamera from "../../component/Form/FormLoginLogout/Login.tsx";
import StockMovementList from "../../Feature/StockManagement/StockMovement/StockMovement.tsx";
import StockAdjustmentList from "../../Feature/StockManagement/StockAdjustment/StockAdjustmentList.tsx";
import StockReturnList from "../../Feature/StockManagement/StockReturn/StockReturnList.tsx";
import SupplierList from "../../Feature/supplier/SupplierList.tsx";

const routes = all_routes;
export const publicRoutes = [
    {
        path: routes.formLogin,
        element: <Formlogin />,
        route: Route,
    },
    // {
    //     path: "/test-ghost", // ✅ បន្ថែមត្រង់នេះ
    //     element: (
    //         <div style={{ width: "100vw", height: "100vh", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
    //             <div style={{ width: 400, height: 280 }}>
    //                 <GhostOverlay view="front" aligned={false} />
    //             </div>
    //         </div>
    //     ),
    //     route: Route,
    // },
    {
        path: "/test-ghost",
        element: <AutoClaimCamera />,
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
        path: routes.pageNotFound,
        element: <PageNotFound />,
        route: Route,
    },
];

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
        path: routes.Profile,
        element: <Profile />,
        route: Route,
    },
    {
        path: routes.SaleProduct,
        element: (
            <ProtextRoute scopes={["order:create"]}>
                <PosShop />
            </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.StockOut,
        element: (
            <ProtextRoute scopes={["stockmovement:create"]}>
                <StockOutPage />
            </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.OrderList,
        element: (
            <ProtextRoute scopes={["order:read"]}>
                <OrderList />
            </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.MyLeaveRequest,
        element: (
            <ProtextRoute scopes={["leave_request:read_my"]}>
                <MyLeaveRequest />
            </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.AllLeaveRequest,
        element: (
            <ProtextRoute scopes={["leave_request:read_all"]}>
                <LeaveRequestAll />
            </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.LeaveType,
        element: (
            <ProtextRoute scopes={["leave_type:read"]}>
                <LeaveTypeList />
            </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.Branch,
        element: (
            <ProtextRoute scopes={["branch:read"]}>
                <BranchList />
            </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.Member,
        element: (
            <ProtextRoute scopes={["customer:read"]}>
                <CustomerList />
            </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.Staff,
        element: (
            <ProtextRoute scopes={["staff:read"]}>
                <StaffList />
            </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.Supplier,
        element: (
            <ProtextRoute scopes={["supplier:read"]}>
                <SupplierList />
            </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.Category,
        element: (
            <ProtextRoute scopes={["category:read"]}>
                <CategoryList />
            </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.Product,
        element: (
            <ProtextRoute scopes={["product:read"]}>
                <ProductList />
            </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.LowStock,
        element: (
            <ProtextRoute scopes={["product:read"]}>
                <ProductLowStockList />
            </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.Discount,
        element: (
            <ProtextRoute scopes={["discount:read"]}>
                <DiscountList />
            </ProtextRoute>
        ),
        route: Route,
    },
    // {
    //     path: routes.Stock,
    //     element: (
    //         <ProtextRoute scopes={["manage_stock:all"]}>
    //             <StockList />
    //         </ProtextRoute>
    //     ),
    //     route: Route,
    // },
    {
        path: routes.StockMovement,
        element: (
            <ProtextRoute scopes={["stockmovement:read"]}>
            <StockMovementList />
            </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.StockAdjustment,
        element: (
            <ProtextRoute scopes={["adjustment:read"]}>
            <StockAdjustmentList />
            </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.StockReturn,
        element: (
            <ProtextRoute scopes={["stockreturn:read"]}>
            <StockReturnList />
            </ProtextRoute>
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
            // <ProtextRoute scopes={["permission:read"]}>
            <Permissions />
            // </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.PointSetting,
        element: (
            <ProtextRoute scopes={["point_setting:view"]}>
                <PointSetupPage />
            </ProtextRoute>
        ),
        route: Route,
    },
];