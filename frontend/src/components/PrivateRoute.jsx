import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "../api/axiosInstance";

const PrivateRoute = ({ children }) => {
  const [auth, setAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await API.get("/api/auth/profile");
      } catch (err) {
        setAuth(false);
      }
    };
    checkAuth();
  }, []);

  if (!auth) return <Navigate to="/" />;

  return children;
};

export default PrivateRoute;
