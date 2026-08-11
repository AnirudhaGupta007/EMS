import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import api from "../api/axios";

export const PrivateRoute = ({ allowedRoles }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data } = await api.get("/checkAuth");
        const role = data.user.role;

        if (!allowedRoles.includes(role)) {
          // redirect to login if role not allowed
          navigate("/");
        }
      } catch {
        navigate("/");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [navigate, allowedRoles]);

  if (loading) return <div>Checking Auth...</div>;

  return <Outlet />;
};
