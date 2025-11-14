import React from "react";
import axios from "axios";
import { API_BASE } from "../config";

export default function useAuth() {
  const [token, setToken] = React.useState(localStorage.getItem("token"));
  const [role, setRole] = React.useState(localStorage.getItem("role") || "team");
  const [loading, setLoading] = React.useState(false);

  const save = (t, r = "team") => {
    localStorage.setItem("token", t);
    localStorage.setItem("role", r);
    setToken(t);
    setRole(r);
  };

  const clear = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("round1_done");
    localStorage.removeItem("round1_qualified");
    localStorage.removeItem("round2_done");
    localStorage.removeItem("round2_qualified");
    setToken(null);
    setRole("team");
  };

  const register = async (form) => {
    try {
      setLoading(true);
      const res = await axios.post(API_BASE + "/api/auth/register", form);
      if (res.data?.token) save(res.data.token, "team");
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await axios.post(API_BASE + "/api/auth/login", {
        email,
        password,
      });
      if (res.data?.token) save(res.data.token, res.data.role || "team");
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  return { token, role, save, clear, loading, register, login };
}
