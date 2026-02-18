import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { medicineSuggestions } from '../data/medicineSuggestions';

const PharmacyDashboard = () => {
    const [medicines, setMedicines] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [formData, setFormData] = useState({
        name: '', batchNumber: '', expiryDate: '', mrp: '', supplierPrice: '', quantity: '', supplier: '', minStockLevel: '', invoiceNumber: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [editId, setEditId] = useState(null);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [bulkSupplier, setBulkSupplier] = useState('');
    const [bulkInvoiceNumber, setBulkInvoiceNumber] = useState('');
    const [bulkData, setBulkData] = useState([{ name: '', batchNumber: '', expiryDate: '', mrp: '', supplierPrice: '', quantity: '', minStockLevel: '' }]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || (userInfo.role !== 'PharmacyAdmin' && userInfo.role !== 'PharmacyStaff')) {
            navigate('/');
        } else {
            fetchMedicines();
            fetchSuppliers();
        }
    }, [navigate]);

    const fetchMedicines = async () => {
        try {
            const { data } = await api.get('/medicines');
            setMedicines(data);
        } catch (error) { console.error(error); }
    };

    const fetchSuppliers = async () => {
        try {
            const { data } = await api.get('/suppliers');
            setSuppliers(data);
        } catch (error) { console.error('Error fetching suppliers'); }
    };

    const fetchSuggestions = (query) => {
        if (!query || query.length < 2) { setSuggestions([]); return; }
        const filtered = medicineSuggestions.filter(m => m.toLowerCase().includes(query.toLowerCase()));
        setSuggestions(filtered.slice(0, 10));
    };

    const handleChange = (e) => {
        const value = e.target.name === 'name' ? e.target.value.toUpperCase() : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
        if (e.target.name === 'name') fetchSuggestions(value);
    };

    const getDaysToExpiry = (expiryDate) => {
        const today = new Date();
        const exp = new Date(expiryDate);
        return Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/medicines/${editId}`, formData);
                alert('Medicine Updated');
                setEditId(null);
            } else {
                await api.post('/medicines', formData);
                alert('Medicine Added');
            }
            fetchMedicines();
            setFormData({ name: '', batchNumber: '', expiryDate: '', mrp: '', supplierPrice: '', quantity: '', supplier: '', minStockLevel: '', invoiceNumber: '' });
        } catch (error) { alert(error.response?.data?.message || 'Error saving medicine'); }
    };

    const handleEdit = (medicine) => {
        setEditId(medicine._id);
        setFormData({
            ...medicine,
            expiryDate: new Date(medicine.expiryDate).toISOString().split('T')[0],
            supplier: medicine.supplier || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this medicine?')) {
            try { await api.delete(`/medicines/${id}`); fetchMedicines(); }
            catch (error) { alert('Error deleting medicine'); }
        }
    };

    const handleReturn = async (medicine) => {
        const quantityToReturn = prompt(`Enter quantity to return for ${medicine.name} (Available: ${medicine.quantity}):`, medicine.quantity);
        if (!quantityToReturn) return;
        const qty = parseInt(quantityToReturn);
        if (isNaN(qty) || qty <= 0 || qty > medicine.quantity) { alert('Invalid quantity'); return; }
        try {
            await api.post('/returns', { medicineId: medicine._id, quantity: qty, reason: 'Expired/Damaged' });
            alert('Medicine returned successfully');
            fetchMedicines();
        } catch (error) { alert(error.response?.data?.message || 'Error returning medicine'); }
    };

    const handleBulkDataChange = (index, e) => {
        const newData = [...bulkData];
        newData[index][e.target.name] = e.target.name === 'name' ? e.target.value.toUpperCase() : e.target.value;
        setBulkData(newData);
    };

    const handleAddBulkRow = () => {
        setBulkData([...bulkData, { name: '', batchNumber: '', expiryDate: '', mrp: '', supplierPrice: '', quantity: '', minStockLevel: '' }]);
    };

    const handleRemoveBulkRow = (index) => {
        if (bulkData.length > 1) {
            setBulkData(bulkData.filter((_, i) => i !== index));
        }
    };

    const handleBulkSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!bulkSupplier || !bulkInvoiceNumber) {
                alert('Please select supplier and enter invoice number');
                return;
            }
            const payload = bulkData.map(item => ({
                ...item,
                supplier: bulkSupplier,
                invoiceNumber: bulkInvoiceNumber
            }));
            await api.post('/medicines/bulk', { medicines: payload });
            alert('Bulk Medicines Added Successfully');
            setIsBulkMode(false);
            setBulkData([{ name: '', batchNumber: '', expiryDate: '', mrp: '', supplierPrice: '', quantity: '', minStockLevel: '' }]);
            setBulkSupplier('');
            setBulkInvoiceNumber('');
            fetchMedicines();
        } catch (error) {
            alert(error.response?.data?.message || 'Error uploading bulk medicines');
        }
    };

    const handleLogout = () => { localStorage.removeItem('userInfo'); navigate('/'); };

    const filteredMedicines = medicines.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const expiringSoonCount = medicines.filter(m => getDaysToExpiry(m.expiryDate) <= 60).length;

    const navItems = [
        { name: 'Inventory', path: '/pharmacy-admin', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        { name: 'POS/Billing', path: '/pos', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
        { name: 'Sales History', path: '/sales-history', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
        { name: 'Suppliers', path: '/suppliers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        { name: 'Invoices', path: '/supplier-invoices', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
        { name: 'Ledger (Udhaar)', path: '/customer-ledger', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    ];

    return (
        <div className="min-h-screen bg-[#f1f5f9] flex overflow-hidden font-sans">
            {/* Sidebar (Desktop) */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full flex flex-col p-6">
                    <div className="flex items-center gap-3 mb-10 px-2">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="text-xl font-black">M</span>
                        </div>
                        <h2 className="text-xl font-black tracking-tight uppercase">Madaan Medicos</h2>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all group ${location.pathname === item.path ? 'bg-blue-600 shadow-lg shadow-blue-600/20' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
                            >
                                <svg className={`w-5 h-5 transition-colors ${location.pathname === item.path ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                                </svg>
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    <button onClick={handleLogout} className="mt-auto flex items-center gap-4 px-4 py-4 rounded-2xl font-bold text-red-400 hover:bg-red-400/10 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-screen overflow-y-auto slim-scrollbar relative">
                {/* Topbar (Mobile) */}
                <div className="lg:hidden bg-white px-4 py-4 flex items-center justify-between border-b sticky top-0 z-40 bg-white/80 backdrop-blur-md">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-slate-100 rounded-xl">
                        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                    </button>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">INVENTORY</h2>
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-xs">AD</div>
                </div>

                <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
                    {/* Welcome Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 animate-slide-up">
                        <div>
                            <p className="text-sm font-black text-blue-600 uppercase tracking-widest mb-1">Stock Control</p>
                            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Medicine Inventory</h1>
                        </div>
                        {expiringSoonCount > 0 && (
                            <div className="bg-red-50 border border-red-100 px-6 py-3 rounded-2xl flex items-center gap-3 animate-pulse shadow-sm">
                                <div className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center text-sm">⚠️</div>
                                <div>
                                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest leading-none">Alert</p>
                                    <p className="text-sm font-bold text-red-800">{expiringSoonCount} Expiring Soon</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                        {/* Form Card */}
                        <div className={`${isBulkMode ? 'xl:col-span-12' : 'xl:col-span-4'} bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 relative overflow-hidden animate-slide-up delay-100 transition-all duration-500`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                            <div className="flex justify-between items-center mb-8 relative z-10">
                                <h3 className="text-xl font-black text-slate-900">{isBulkMode ? 'Bulk Invoice Upload' : editId ? 'Edit Entry' : 'Manual Entry'}</h3>
                                <button
                                    type="button"
                                    onClick={() => setIsBulkMode(!isBulkMode)}
                                    className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${isBulkMode ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                >
                                    {isBulkMode ? 'Switch to Single' : 'Switch to Bulk'}
                                </button>
                            </div>

                            {!isBulkMode ? (
                                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">General Detail</label>
                                        <input
                                            name="name"
                                            placeholder="MEDICINE NAME"
                                            value={formData.name}
                                            onChange={handleChange}
                                            list="medicine-suggestions"
                                            className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none uppercase"
                                            required
                                        />
                                        <datalist id="medicine-suggestions">
                                            {suggestions.map((name, index) => <option key={index} value={name} />)}
                                        </datalist>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Batch #</label>
                                            <input name="batchNumber" placeholder="B-2024" value={formData.batchNumber} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none uppercase" required />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Quantity</label>
                                            <input name="quantity" type="number" placeholder="0" value={formData.quantity} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" required />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Sale (MRP)</label>
                                            <input name="mrp" type="number" placeholder="₹ 0.00" value={formData.mrp} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-emerald-500/10 text-emerald-600 transition-all outline-none" required />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Cost (Supplier)</label>
                                            <input name="supplierPrice" type="number" placeholder="₹ 0.00" value={formData.supplierPrice} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 text-blue-600 transition-all outline-none" required />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Supplier Source</label>
                                            <select
                                                name="supplier"
                                                value={formData.supplier}
                                                onChange={handleChange}
                                                className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none"
                                            >
                                                <option value="">Choose Supplier</option>
                                                {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Min. Stock Level</label>
                                            <input name="minStockLevel" type="number" placeholder="10" value={formData.minStockLevel} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Expiration Date</label>
                                        <input name="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-red-500/10 transition-all outline-none" required />
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button type="submit" className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95 ${editId ? 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700' : 'bg-slate-900 text-white shadow-slate-200 hover:bg-black'}`}>
                                            {editId ? 'Update Stock' : 'Add to Stock'}
                                        </button>
                                        {editId && (
                                            <button type="button" onClick={() => setEditId(null)} className="px-6 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase hover:bg-slate-200 transition-all lg:whitespace-nowrap">
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleBulkSubmit} className="space-y-8 relative z-10">
                                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Consignment Supplier</label>
                                            <select
                                                value={bulkSupplier}
                                                onChange={(e) => setBulkSupplier(e.target.value)}
                                                className="w-full p-4 bg-white border-none rounded-2xl font-bold shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none"
                                                required
                                            >
                                                <option value="">Select Primary Source</option>
                                                {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Master Invoice #</label>
                                            <input
                                                placeholder="INV-2024-XXX"
                                                value={bulkInvoiceNumber}
                                                onChange={(e) => setBulkInvoiceNumber(e.target.value)}
                                                className="w-full p-4 bg-white border-none rounded-2xl font-bold shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all outline-none uppercase"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto -mx-6 px-6">
                                        <table className="w-full text-left min-w-[1200px]">
                                            <thead>
                                                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                                    <th className="pb-4 pl-4 min-w-[200px]">Medicine Information</th>
                                                    <th className="pb-4 min-w-[140px]">Batch Index</th>
                                                    <th className="pb-4 min-w-[140px]">Expiry</th>
                                                    <th className="pb-4 min-w-[100px]">Qty</th>
                                                    <th className="pb-4 min-w-[100px]">MRP</th>
                                                    <th className="pb-4 min-w-[100px]">Cost</th>
                                                    <th className="pb-4 min-w-[100px]">Min. Stock</th>
                                                    <th className="pb-4 w-10">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="space-y-4">
                                                {bulkData.map((row, index) => (
                                                    <tr key={index} className="group hover:bg-slate-50 transition-colors">
                                                        <td className="py-3 pr-2">
                                                            <input name="name" placeholder="PRODUCT NAME" value={row.name} onChange={(e) => handleBulkDataChange(index, e)} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-xs shadow-inner focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none uppercase" required />
                                                        </td>
                                                        <td className="py-3 pr-2">
                                                            <input name="batchNumber" placeholder="BATCH #" value={row.batchNumber} onChange={(e) => handleBulkDataChange(index, e)} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-xs shadow-inner focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none uppercase" required />
                                                        </td>
                                                        <td className="py-3 pr-2">
                                                            <input name="expiryDate" type="date" value={row.expiryDate} onChange={(e) => handleBulkDataChange(index, e)} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-xs shadow-inner focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none" required />
                                                        </td>
                                                        <td className="py-3 pr-2">
                                                            <input name="quantity" type="number" placeholder="QTY" value={row.quantity} onChange={(e) => handleBulkDataChange(index, e)} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-xs shadow-inner focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none" required />
                                                        </td>
                                                        <td className="py-3 pr-2">
                                                            <input name="mrp" type="number" placeholder="MRP" value={row.mrp} onChange={(e) => handleBulkDataChange(index, e)} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-xs shadow-inner focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none text-emerald-600" required />
                                                        </td>
                                                        <td className="py-3 pr-2">
                                                            <input name="supplierPrice" type="number" placeholder="COST" value={row.supplierPrice} onChange={(e) => handleBulkDataChange(index, e)} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-xs shadow-inner focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none text-blue-600" required />
                                                        </td>
                                                        <td className="py-3 pr-2">
                                                            <input name="minStockLevel" type="number" placeholder="MIN" value={row.minStockLevel} onChange={(e) => handleBulkDataChange(index, e)} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-xs shadow-inner focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none" />
                                                        </td>
                                                        <td className="py-3 text-center">
                                                            <button type="button" onClick={() => handleRemoveBulkRow(index)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-4 border-t border-slate-50">
                                        <button type="button" onClick={handleAddBulkRow} className="group flex items-center gap-3 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition-all">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                                            </div>
                                            Add Another Row
                                        </button>

                                        <div className="flex gap-4 w-full sm:w-auto">
                                            <button
                                                type="submit"
                                                className="flex-1 sm:flex-none px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95"
                                            >
                                                Commit Consignment
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>

                        {!isBulkMode && (
                            /* List Area */
                            <div className="xl:col-span-8 space-y-6 animate-slide-up delay-200">
                                <div className="bg-white p-4 sm:p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                                    <div className="relative flex-1 w-full">
                                        <input
                                            type="text"
                                            placeholder="Quick search stocks..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full p-4 pl-12 bg-slate-50 border-none rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                        />
                                        <svg className="w-5 h-5 absolute left-4 top-4.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <div className="px-5 py-3.5 bg-blue-50 rounded-2xl text-blue-600 font-black text-[10px] uppercase tracking-widest border border-blue-100 lg:whitespace-nowrap">
                                            Total: {filteredMedicines.length} Items
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {filteredMedicines.length === 0 ? (
                                        <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                                            <p className="text-slate-400 font-bold italic">No inventory matches your search.</p>
                                        </div>
                                    ) : (
                                        filteredMedicines.map((item) => {
                                            const daysToExpiry = getDaysToExpiry(item.expiryDate);
                                            const isCritical = daysToExpiry <= 15;
                                            const isWarning = daysToExpiry <= 60 && daysToExpiry > 15;

                                            return (
                                                <div key={item._id} className="bg-white p-5 sm:p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition-all border border-slate-100 group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 overflow-hidden relative">
                                                    {isCritical && <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>}
                                                    {isWarning && <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-400"></div>}

                                                    <div className="flex items-center gap-5 w-full sm:w-auto">
                                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 transition-colors ${isCritical ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                                                            {item.name.charAt(0)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase truncate">{item.name}</h4>
                                                            <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                                <span>Batch: {item.batchNumber}</span>
                                                                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                                                <span className={isCritical ? 'text-red-500' : isWarning ? 'text-orange-500' : ''}>
                                                                    Exp: {new Date(item.expiryDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-12 w-full sm:w-auto border-t sm:border-0 pt-4 sm:pt-0">
                                                        <div className="text-center sm:text-right">
                                                            <p className="text-[10px] uppercase font-black text-slate-300 tracking-[0.2em] mb-1">IN STOCK</p>
                                                            <p className={`text-2xl font-black ${item.quantity <= (item.minStockLevel || 10) ? 'text-red-500' : 'text-slate-900'}`}>
                                                                {item.quantity}
                                                            </p>
                                                        </div>
                                                        <div className="text-center sm:text-right">
                                                            <p className="text-[10px] uppercase font-black text-slate-300 tracking-[0.2em] mb-1">UNIT MRP</p>
                                                            <p className="text-2xl font-black text-emerald-600">₹{item.mrp}</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleEdit(item)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm">
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                            </button>
                                                            <button onClick={() => handleReturn(item)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all shadow-sm">
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15l-4 4m0 0l-4-4m4 4V9"></path></svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                .slim-scrollbar::-webkit-scrollbar { width: 6px; }
                .slim-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .slim-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default PharmacyDashboard;
