import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import PharmacyDashboard from './pages/PharmacyDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/super-admin" element={<SuperAdminDashboard />} />
        <Route path="/pharmacy-admin" element={<PharmacyDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
