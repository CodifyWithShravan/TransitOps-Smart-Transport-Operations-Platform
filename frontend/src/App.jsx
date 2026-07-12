import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import VehicleRegistry from './pages/VehicleRegistry';
import Drivers from './pages/Drivers';
import TripDispatcher from './pages/TripDispatcher';
import Maintenance from './pages/Maintenance';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/fleet" element={<VehicleRegistry />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/trips" element={<TripDispatcher />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;