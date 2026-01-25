import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import "@/App.css";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

import LandingPage from "@/pages/LandingPage";
import BrickChat from "@/pages/BrickChat";
import ResourceMap from "@/pages/ResourceMap";
import Vault from "@/pages/Vault";
import LegalAid from "@/pages/LegalAid";
import Workbook from "@/pages/Workbook";
import Dossier from "@/pages/Dossier";
import CaseworkerDashboard from "@/pages/CaseworkerDashboard";
import AgencyDashboard from "@/pages/AgencyDashboard";
import CleanupDashboard from "@/pages/CleanupDashboard";
import LegalAidPortal from "@/pages/LegalAidPortal";
import Directory from "@/pages/Directory";
import HUDIntake from "@/pages/HUDIntake";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AuthContext = React.createContext();

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

  const getRoleHomePage = () => {
    if (!user) return "/brick";
    
    switch(user.role) {
      case "agency_staff":
        return "/agency";
      case "cleanup_crew":
        return "/cleanup";
      case "legal_aid":
        return "/legal-portal";
      case "caseworker":
        return "/caseworker";
      default:
        return "/brick";
    }
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
                !token ? <LandingPage /> : <Navigate to={getRoleHomePage()} replace />
              }
            />
            <Route
              path="/brick"
              element={
                token ? <BrickChat /> : <Navigate to="/" replace />
              }
            />
            <Route
              path="/agency"
              element={
                token && user?.role === "agency_staff" ? (
                  <AgencyDashboard />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/cleanup"
              element={
                token && user?.role === "cleanup_crew" ? (
                  <CleanupDashboard />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/legal-portal"
              element={
                token && user?.role === "legal_aid" ? (
                  <LegalAidPortal />
                ) : (
                  <Navigate to="/" replace />
                )
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
                token && user?.role === "user" ? <Vault /> : <Navigate to="/" replace />
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
                token && user?.role === "user" ? <Workbook /> : <Navigate to="/" replace />
              }
            />
            <Route
              path="/dossier"
              element={
                token && user?.role === "user" ? <Dossier /> : <Navigate to="/" replace />
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
            <Route
              path="/directory"
              element={
                token ? <Directory /> : <Navigate to="/" replace />
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
