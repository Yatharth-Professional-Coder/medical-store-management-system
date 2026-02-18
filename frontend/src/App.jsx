import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import PharmacyDashboard from './pages/PharmacyDashboard';
import RegisterPharmacy from './pages/RegisterPharmacy';
import POSPage from './pages/POSPage';
import BillsHistory from './pages/BillsHistory';
import SupplierManagement from './pages/SupplierManagement';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<RegisterPharmacy />} />
        <Route path="/super-admin" element={<SuperAdminDashboard />} />
        <Route path="/pharmacy-admin" element={<PharmacyDashboard />} />
        <Route path="/pos" element={<POSPage />} />
        <Route path="/sales-history" element={<BillsHistory />} />
        <Route path="/suppliers" element={<SupplierManagement />} />
      </Routes>
    </Router>
  );
}

export default App;
