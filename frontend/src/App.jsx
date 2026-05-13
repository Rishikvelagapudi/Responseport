import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminHome from './pages/AdminHome';
import StationHome from './pages/StationHome';

const ProtectedRoute = ({ children, roleRequired }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{display:'flex', justifyContent:'center', marginTop:'50px'}}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  const userRole = user.role?.toLowerCase() || 'station';
  const required = roleRequired?.toLowerCase();
  
  if (required && userRole !== required) {
    if (userRole === 'admin') return <Navigate to="/admin-home" />;
    if (userRole === 'ccrb') return <Navigate to="/station-home" />;
    return <Navigate to="/station-home" />;
  }
  
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/station" element={<ProtectedRoute roleRequired="station"><UserDashboard /></ProtectedRoute>} />
          <Route path="/station-home" element={<ProtectedRoute roleRequired="station"><StationHome /></ProtectedRoute>} />
          <Route path="/ccrb" element={<ProtectedRoute roleRequired="ccrb"><UserDashboard /></ProtectedRoute>} />
          
          <Route path="/admin" element={<ProtectedRoute roleRequired="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin-home" element={<ProtectedRoute roleRequired="admin"><AdminHome /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
