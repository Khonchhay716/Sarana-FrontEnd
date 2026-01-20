
import DashBord from "../../page DashBoard/DashBord.tsx";
import ForgotPassword from "../../component/Form/FormLoginLogout/ForgotPassword.tsx";
import FormVerifycode from "../../component/Form/FormLoginLogout/FormVerifyCode.tsx";
import FormVerifycode2 from "../../component/Form/FormLoginLogout/FormverifyCode2.tsx";
import FormResetPassword from "../../component/Form/FormLoginLogout/FormResetPassword.tsx";
import Formlogin from '../../component/Form/FormLoginLogout/Login2.tsx';
import Register from "../../component/Form/FormLoginLogout/Register.tsx";
import PageNotFound from "../../page DashBoard/PagenotFound.tsx";


import Alluser from "../../component/Pages/AllUsers/AllUser.tsx";
// import Users from "../../component/Pages/AllUsers/Users.tsx";
import ProductTable from "../../component/Pages/Product.tsx";
import MyProfile from "../../component/Pages/Imformation/MyAccount.tsx";
import Admin from "../../component/Pages/AllUsers/Users.tsx";
import Sale from "../../component/Pages/Sale.tsx";
import DashboardCoffee from '../../component/Pages/DashbordCoffee.tsx';
import HistorySale from '../../component/Pages/ItemhasSale.tsx';
import Report from '../../component/Pages/Report.tsx';
import InvoiceTest from '../../component/Pages/Invoicetest.tsx';
import AddMenuCoffee from "../../component/Pages/AddMenuCoffee.tsx";
import TestLoginToken from '../../component/Form/FormLoginLogout/Login2.tsx';
import TestImage2 from "../../component/Pages/TestImage2.tsx";
import SendMail from "../../component/Pages/test SendMail/SendMail.tsx";
import ResetPassword from "../../component/Pages/Imformation/ResetPassword.tsx";
import FormForgotpassword from "../../component/Pages/Imformation/FormForgotPassword.tsx";
import FormVerifyCode from "../../component/Pages/Imformation/FormverifyCode.tsx";
import FormcreatePSnew from "../../component/Pages/Imformation/Createpassswordnew.tsx";
import PosCoffee from "../../component/Pages/Pos.tsx";
import TypeProduct from "../../component/MasterSetup/TypeProduct.tsx";
import Role from "../../component/MasterSetup/RoleUser.tsx";
import { Route } from "react-router-dom";
import { all_routes } from "./AllRouter.tsx";

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
        path: routes.forgotpassword,
        element: <FormForgotpassword />,
        route: Route,
    },
    {
        path: routes.resetPassword,
        element: <ResetPassword />,
        route: Route,
    },
    {
        path: routes.formverifycode,
        element: <FormVerifyCode />,
        route: Route,
    },
    {
        path: routes.typeproduct,
        element: <TypeProduct />,
        route: Route,
    },
    {
        path: routes.role,
        element: <Role />,
        route: Route,
    },
    {
        path: routes.users,
        element: <Alluser />,
        rount: Route,
    },
    {
        path: routes.product,
        element: <ProductTable />,
        rount: Route,
    },
    {
        path: routes.productall,
        element: <PosCoffee />,
        rount: Route,
    },
    {
        path: routes.admin,
        element: <Admin />,
        rount: Route,
    },
    {
        path: routes.sale,
        element: <Sale />,
        rount: Route,
    },
    {
        path: routes.report,
        element: <Report />,
        rount: Route,
    },
    {
        path: routes.dashbordcoffee,
        element: <DashboardCoffee />,
        rount: Route,
    },
    {
        path: routes.historySale,
        element: <HistorySale />,
        rount: Route,
    },
    {
        path: routes.invoicetest,
        element: <InvoiceTest />,
        rount: Route,
    },
    {
        path: routes.addmenucoffee,
        element: <AddMenuCoffee />,
        rount: Route,
    },
    {
        path: routes.testtoken,
        element: <TestLoginToken />,
        rount: Route,
    },
    {
        path: routes.testimage2,
        element: <TestImage2 />,
        rount: Route,
    },
    {
        path: routes.sendmail,
        element: <SendMail />,
        rount: Route,
    },
    {
        path: routes.createpasswordnew,
        element: < FormcreatePSnew />,
        rount: Route,
    },
    {
        path: routes.myProfile,
        element: <MyProfile />,
        rount: Route,
    },
]