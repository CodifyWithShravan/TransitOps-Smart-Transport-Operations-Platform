import React from 'react';
<<<<<<< HEAD
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';


=======
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
>>>>>>> ea3d91768b966d94bfb3d61b5a12154a65f8c890
import Dashboard from './pages/Dashboard';
import VehicleRegistry from './pages/VehicleRegistry';
import Drivers from './pages/Drivers';
import TripDispatcher from './pages/TripDispatcher';
import Maintenance from './pages/Maintenance';
<<<<<<< HEAD
import AuthPage from './pages/AuthPage'; 
import SettingsPage from './pages/SettingsPage';
=======
import FuelExpenses from './pages/FuelExpenses';
import AuthPage from './AuthPage';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('transitops_token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
>>>>>>> ea3d91768b966d94bfb3d61b5a12154a65f8c890

function App() {
  return (
    <BrowserRouter>
      <Routes>
<<<<<<< HEAD
    
        <Route path="/login" element={<AuthPage />} />


        <Route path="/" element={<Dashboard />} />
        <Route path="/fleet" element={<VehicleRegistry />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/trips" element={<TripDispatcher />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/settings" element={<SettingsPage />} />

=======
        <Route path="/login" element={<AuthPage />} />
        
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/fleet" element={<ProtectedRoute><VehicleRegistry /></ProtectedRoute>} />
        <Route path="/drivers" element={<ProtectedRoute><Drivers /></ProtectedRoute>} />
        <Route path="/trips" element={<ProtectedRoute><TripDispatcher /></ProtectedRoute>} />
        <Route path="/maintenance" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
        <Route path="/fuel" element={<ProtectedRoute><FuelExpenses /></ProtectedRoute>} />
>>>>>>> ea3d91768b966d94bfb3d61b5a12154a65f8c890
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;