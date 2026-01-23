import React, { useState, useEffect, createContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import "@/App.css";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

// Pages
import LandingPage from "@/pages/LandingPage";
import BrickChat from "@/pages/BrickChat";
import ResourceMap from "@/pages/ResourceMap";
import Vault from "@/pages/Vault";
import LegalAid from "@/pages/LegalAid";
import Workbook from "@/pages/Workbook";
import Dossier from "@/pages/Dossier";
import CaseworkerDashboard from "@/pages/CaseworkerDashboard";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
export const AuthContext = createContext();

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios
        .get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setToken(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);
    toast.success("Welcome to BRICK!");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    toast.info("Logged out successfully");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen oz-gradient">
        <div className="text-white text-2xl font-bold">Loading BRICK...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route
              path="/"
              element={
                !token ? <LandingPage /> : <Navigate to="/brick" replace />
              }
            />
            <Route
              path="/brick"
              element={
                token ? <BrickChat /> : <Navigate to="/" replace />
              }
            />
            <Route
              path="/resources"
              element={
                token ? <ResourceMap /> : <Navigate to="/" replace />
              }
            />
            <Route
              path="/vault"
              element={
                token ? <Vault /> : <Navigate to="/" replace />
              }
            />
            <Route
              path="/legal"
              element={
                token ? <LegalAid /> : <Navigate to="/" replace />
              }
            />
            <Route
              path="/workbook"
              element={
                token ? <Workbook /> : <Navigate to="/" replace />
              }
            />
            <Route
              path="/dossier"
              element={
                token ? <Dossier /> : <Navigate to="/" replace />
              }
            />
            <Route
              path="/caseworker"
              element={
                token && user?.role === "caseworker" ? (
                  <CaseworkerDashboard />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
          </Routes>
          <Toaster position="top-center" richColors />
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
