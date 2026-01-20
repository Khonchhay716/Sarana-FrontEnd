import { Route, Routes } from "react-router-dom";
import PageHeader from "../PageHeader/PageHeader.tsx";
import AuthFeature from "../PageHeader/AuthFeature.tsx";
import { path, publicRoutes } from "./Path.tsx";

const Routers = () => {
    return (
        <Routes>
            <Route element={<AuthFeature/>}>
                {publicRoutes.map((route, idx) => (
                    <Route path={route.path} element={route.element} key={idx} />
                ))}
            </Route>

            <Route element={<PageHeader />}>
                {path.map((route, idx) => (
                    <Route path={route.path} element={route.element} key={idx} />
                ))}
            </Route>
        </Routes>
    );
};

export default Routers;
