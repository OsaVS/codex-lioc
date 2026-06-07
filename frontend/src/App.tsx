import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import StationDashboard from './pages/StationDashboard';
import RegionalDashboard from './pages/RegionalDashboard';
import { useAuthStore } from './context/useAuthStore';
import './App.css';

const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole?: string }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRole && user?.role !== allowedRole) return <Navigate to="/unauthorized" replace />;
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Station Manager Dashboard */}
        <Route 
          path="/station-dashboard" 
          element={
            <ProtectedRoute allowedRole="STATION_MANAGER">
              <StationDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Regional Distribution Manager Dashboard */}
        <Route 
          path="/region-dashboard" 
          element={
            <ProtectedRoute allowedRole="REGIONAL_MANAGER">
              <RegionalDashboard />
            </ProtectedRoute>
          } 
        />

        <Route path="/unauthorized" element={<div className="p-8 text-center text-red-600">You are not authorized to view this page.</div>} />

        {/* Default redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
