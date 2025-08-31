import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { EthereumProvider } from "@/contexts/EthereumContext";
import Login from "./components/Login";
import RoleBasedDashboard from "./components/RoleBasedDashboard";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userCredentials, setUserCredentials] = useState<any>(null);

  const handleLogin = (role: string, credentials: any) => {
    setUserCredentials(credentials);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUserCredentials(null);
    setIsAuthenticated(false);
  };

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <EthereumProvider>
          <Routes>
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  <RoleBasedDashboard 
                    userCredentials={userCredentials} 
                    onLogout={handleLogout} 
                  />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                isAuthenticated ? (
                  <RoleBasedDashboard 
                    userCredentials={userCredentials} 
                    onLogout={handleLogout} 
                  />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              } 
            />
            <Route 
              path="*" 
              element={
                isAuthenticated ? (
                  <RoleBasedDashboard 
                    userCredentials={userCredentials} 
                    onLogout={handleLogout} 
                  />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              } 
            />
          </Routes>
        </EthereumProvider>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
