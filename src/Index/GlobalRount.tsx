import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: Props) => {
  const token = sessionStorage.getItem("token");

  if (token) {
    return <Navigate to="/app/dashbord" replace />;
  }

  return children;
};

export default PublicRoute;
