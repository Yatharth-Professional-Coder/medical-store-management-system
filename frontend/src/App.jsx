import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import PharmacyDashboard from './pages/PharmacyDashboard';
import RegisterPharmacy from './pages/RegisterPharmacy';
import POSPage from './pages/POSPage';
import BillsHistory from './pages/BillsHistory';
import SupplierManagement from './pages/SupplierManagement';
import CustomerLedger from './pages/CustomerLedger';
import SupplierLedger from './pages/SupplierLedger';
import SupplierInvoices from './pages/SupplierInvoices';

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
        <Route path="/customer-ledger" element={<CustomerLedger />} />
        <Route path="/suppliers" element={<SupplierManagement />} />
        <Route path="/supplier-ledger" element={<SupplierLedger />} />
        <Route path="/supplier-invoices" element={<SupplierInvoices />} />
      </Routes>
    </Router>
  );
}

export default App;
