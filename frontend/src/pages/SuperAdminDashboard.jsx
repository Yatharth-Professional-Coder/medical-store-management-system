import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const SuperAdminDashboard = () => {
    const [pharmacies, setPharmacies] = useState([]);
    const [formData, setFormData] = useState({
        adminName: '', adminEmail: '', adminPassword: '', pharmacyName: '', address: '', licenseNumber: '', contactNumber: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || userInfo.role !== 'SuperAdmin') {
            navigate('/');
        } else {
            fetchPharmacies();
        }
    }, [navigate]);

    const fetchPharmacies = async () => {
        try {
            const { data } = await api.get('/pharmacies');
            setPharmacies(data);
        } catch (error) { console.error(error); }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/pharmacies', { ...formData, status: 'Approved' });
            fetchPharmacies();
            setFormData({ adminName: '', adminEmail: '', adminPassword: '', pharmacyName: '', address: '', licenseNumber: '', contactNumber: '' });
            alert('New Pharmacy Identity Provisioned');
        } catch (error) { alert(error.response?.data?.message || 'Error creating pharmacy'); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Permanent Action: Decommission this pharmacy unit?')) {
            try { await api.delete(`/pharmacies/${id}`); fetchPharmacies(); }
            catch (error) { alert('Decommission failed'); }
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.put(`/pharmacies/${id}/status`, { status });
            fetchPharmacies();
            alert(`Subject Profile: ${status}`);
        } catch (error) { alert('Status synchronization failed'); }
    };

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/');
    };

    const pendingPharmacies = pharmacies.filter(p => p.status === 'Pending');
    const approvedPharmacies = pharmacies.filter(p => p.status === 'Approved');

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans pb-12">
            {/* Nav Header */}
            <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black shadow-lg shadow-slate-200">
                        S
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Root Terminal</h1>
                        <p className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-widest hidden sm:block">Super-Admin Authorization Mode</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="bg-white text-slate-900 border border-slate-200 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                    Terminate Session
                </button>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Network Capacity</p>
                        <p className="text-4xl font-black text-slate-900 tracking-tighter">{pharmacies.length}</p>
                        <p className="text-[9px] font-bold text-slate-300 uppercase mt-2">Total Managed Units</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center">
                        <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-1">Awaiting Intel</p>
                        <p className="text-4xl font-black text-yellow-600 tracking-tighter">{pendingPharmacies.length}</p>
                        <p className="text-[9px] font-bold text-slate-300 uppercase mt-2">Approval Queue</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center">
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Active Clusters</p>
                        <p className="text-4xl font-black text-emerald-600 tracking-tighter">{approvedPharmacies.length}</p>
                        <p className="text-[9px] font-bold text-slate-300 uppercase mt-2">Fully Operational</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    {/* Control Form */}
                    <div className="xl:col-span-4 bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 animate-slide-up relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-100 italic">
                                +
                            </div>
                            Provision New Unit
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-black text-slate-400 ml-1">Pharmacy Name</label>
                                    <input name="pharmacyName" placeholder="STORE NAME" value={formData.pharmacyName} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none uppercase" required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-black text-slate-400 ml-1">Physical Address</label>
                                    <input name="address" placeholder="FULL LOCATION" value={formData.address} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-black text-slate-400 ml-1">License</label>
                                        <input name="licenseNumber" placeholder="DL INDEX" value={formData.licenseNumber} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none uppercase" required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-black text-slate-400 ml-1">Contact</label>
                                        <input name="contactNumber" placeholder="+91 XXX" value={formData.contactNumber} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" required />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-slate-50">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">Authority Credentials</p>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-black text-slate-400 ml-1">Admin Persona</label>
                                    <input name="adminName" placeholder="FULL NAME" value={formData.adminName} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-black text-slate-400 ml-1">Master Email</label>
                                    <input name="adminEmail" placeholder="EMAIL@DOMAIN" type="email" value={formData.adminEmail} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-black text-slate-400 ml-1">Secret Key</label>
                                    <input name="adminPassword" placeholder="PASSWORD" type="password" value={formData.adminPassword} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" required />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-100 hover:bg-black transition-all active:scale-[0.98] mt-4">
                                {loading ? 'Authorizing...' : 'Finalize Provisioning'}
                            </button>
                        </form>
                    </div>

                    {/* Pending & Active Lists */}
                    <div className="xl:col-span-8 space-y-8 animate-slide-up delay-100">
                        {/* Queue */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-yellow-600 uppercase tracking-[0.3em] flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                                Inbound Request Queue
                            </h3>

                            {pendingPharmacies.length === 0 ? (
                                <div className="bg-white p-12 rounded-[2.5rem] border-2 border-dashed border-slate-100 text-center">
                                    <p className="text-slate-300 font-black uppercase text-xs tracking-widest italic">All Units Synchronized</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {pendingPharmacies.map((pharmacy) => (
                                        <div key={pharmacy._id} className="bg-white p-6 rounded-[2rem] border-2 border-yellow-100 shadow-xl shadow-yellow-50/50 flex flex-col justify-between">
                                            <div className="mb-6">
                                                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{pharmacy.name}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">License: {pharmacy.licenseNumber}</p>
                                                <div className="mt-4 flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-400">
                                                        {pharmacy.owner?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <p className="text-xs font-black text-slate-600 uppercase tracking-tighter">REQ: {pharmacy.owner?.name || 'Unknown'}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 pt-4 border-t border-slate-50">
                                                <button onClick={() => handleStatusUpdate(pharmacy._id, 'Approved')} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 italic">Authorize</button>
                                                <button onClick={() => handleStatusUpdate(pharmacy._id, 'Rejected')} className="bg-white text-red-500 border border-red-500/20 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all">Deny</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Network Map */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] px-2">Operational Network Map</h3>
                            {approvedPharmacies.length === 0 ? (
                                <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center opacity-40 italic font-black text-xs uppercase tracking-widest">
                                    Zero Active Nodes
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {approvedPharmacies.map((pharmacy) => (
                                        <div key={pharmacy._id} className="group bg-white p-6 rounded-[2rem] border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="w-12 h-12 bg-slate-50 text-slate-200 rounded-2xl flex items-center justify-center font-black text-2xl group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner">
                                                    {pharmacy.name.charAt(0)}
                                                </div>
                                                <button onClick={() => handleDelete(pharmacy._id)} className="p-2 text-slate-100 hover:text-red-500 transition-colors">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{pharmacy.name}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{pharmacy.contactNumber || 'N/A'}</p>
                                                <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                                                    <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">Active Cluster</span>
                                                    <span className="text-[9px] font-bold text-slate-300 uppercase italic">Key: {pharmacy.licenseNumber}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SuperAdminDashboard;
