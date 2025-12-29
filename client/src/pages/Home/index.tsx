import { Navigate } from "react-router-dom";

export const Home = () => {
  // Redirect to the main Dashboard
  return <Navigate to="/dashboard" replace />;
};
