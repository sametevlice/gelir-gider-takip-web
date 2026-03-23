import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/TransactionsPage';

function App() {
  // Basit bir auth kontrolü (localStorage'da token varsa giriş yapmış sayılır)
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  // Korumalı route bileşeni
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<TransactionsPage />} />
      </Route>

      {/* 404 vs için */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
