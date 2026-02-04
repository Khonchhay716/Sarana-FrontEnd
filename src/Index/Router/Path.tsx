
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
import CategoryList from "../../Feature/Category/CategoryList.tsx";
import BookList from "../../Feature/Book/BookList.tsx";
import LibraryMemberList from "../../Feature/LibraryMember/Librarymemberlist.tsx";
import RoleList from "../../Feature/Role/Rolelist.tsx";
import Permissions from "../../Feature/Role/Rolepermission.tsx";
import BookIssueList from "../../Feature/issueBook/Bookissuelist.tsx";
import BookIssueListCurrent from "../../Feature/issueBook/BookIssueCurrentUser.tsx";
import LibraryMemberListApprove from "../../Feature/LibraryMember/LibraryMemberCurrent.tsx";
import LibraryMemberListRequest from "../../Feature/LibraryMember/LibrarymemberRequest.tsx";
import ProtextRoute from "../../component/ProtextRoute/AuthPermissionScope.tsx";
import Profile from "../../Feature/Profile.tsx/Profile.tsx";

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
        path: routes.Book,
        element: (
            <ProtextRoute scopes={["book:list"]}>
                <BookList />
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
        path: routes.Category,
        element: (
            <ProtextRoute scopes={["category:list"]}>
                <CategoryList />
            </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.LibraryMember,
        element: (
            <ProtextRoute scopes={["librarymember:list"]}>
                <LibraryMemberList />
            </ProtextRoute>),
        route: Route,
    },
    {
        path: routes.ListRequestMember,
        element: (
            <ProtextRoute scopes={["librarymember:list"]}>
                <LibraryMemberListRequest />
            </ProtextRoute>),
        route: Route,
    },
    {
        path: routes.ListLibraryMemberApprove,
        element: (
            <ProtextRoute scopes={["librarymember:request"]}>
                <LibraryMemberListApprove />
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
        path: routes.issuebook,
        element: (
            <ProtextRoute scopes={["bookissue:list"]}>
                <BookIssueList />
            </ProtextRoute>
        ),
        route: Route,
    },
    {
        path: routes.myissuebook,
        element: (
            <ProtextRoute scopes={["bookissue:currentuser"]}>
                <BookIssueListCurrent />
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