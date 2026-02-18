import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';

const SupplierManagement = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [formData, setFormData] = useState({ name: '', contactNumber: '', companiesSupplied: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const { data } = await api.get('/suppliers');
            setSuppliers(data);
        } catch (error) { console.error('Error fetching suppliers'); }
    };

    const handleChange = (e) => {
        const value = e.target.name === 'name' ? e.target.value.toUpperCase() : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const companies = formData.companiesSupplied.split(',').map(c => c.trim()).filter(c => c);
            await api.post('/suppliers', { ...formData, companiesSupplied: companies });
            alert('Supplier Profile Created');
            setFormData({ name: '', contactNumber: '', companiesSupplied: '' });
            fetchSuppliers();
        } catch (error) { alert(error.response?.data?.message || 'Error adding supplier'); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Permanent Action: Remove this supplier profile?')) {
            try { await api.delete(`/suppliers/${id}`); fetchSuppliers(); }
            catch (error) { alert('Deletion failed'); }
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans pb-12">
            {/* Nav Header */}
            <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/pharmacy-admin')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Suppliers</h1>
                        <p className="text-[10px] sm:text-xs font-bold text-blue-600 uppercase tracking-widest hidden sm:block">Vendor Management Console</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link to="/supplier-ledger" className="hidden sm:flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-200">
                        Vendor Ledger
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Form Card */}
                    <div className="lg:col-span-4 bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 animate-slide-up relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                        <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                            </div>
                            New Vendor
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Business Name</label>
                                <input name="name" value={formData.name} onChange={handleChange} placeholder="MADAAN DISTRIBUTORS" className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none uppercase" required />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Contact Identity</label>
                                <input name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="+91 XXXXX XXXXX" className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" required />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Principals Represented</label>
                                <textarea name="companiesSupplied" value={formData.companiesSupplied} onChange={handleChange} placeholder="Cipla, Sun Pharma, Abbott..." className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 h-32 transition-all outline-none resize-none" />
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1 italic">* Use commas to separate company names</p>
                            </div>

                            <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-100 hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-4">
                                {loading ? 'Processing...' : 'Onboard Profile'}
                            </button>
                        </form>
                    </div>

                    {/* List Area */}
                    <div className="lg:col-span-8 animate-slide-up delay-100 space-y-4">
                        <div className="flex items-center justify-between mb-2 px-2">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Master Vendor Index</h3>
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{suppliers.length} Total</span>
                        </div>

                        {suppliers.length === 0 ? (
                            <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-sm">
                                <p className="text-slate-300 font-black uppercase text-xs tracking-widest">No Vendors Enrolled</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                {suppliers.map(supplier => (
                                    <div key={supplier._id} className="group bg-white rounded-[2rem] border border-slate-100 p-6 hover:shadow-2xl hover:shadow-slate-200/50 transition-all transform hover:-translate-y-1 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -mr-10 -mt-10 blur-xl"></div>

                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-12 h-12 bg-slate-50 text-slate-200 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all font-black text-2xl shadow-inner shadow-slate-100 group-hover:shadow-blue-200">
                                                {supplier.name.charAt(0)}
                                            </div>
                                            <button onClick={() => handleDelete(supplier._id)} className="p-2 text-slate-200 hover:text-red-500 transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>

                                        <div className="mb-6">
                                            <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight mb-1">{supplier.name}</h4>
                                            <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                {supplier.contactNumber}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {supplier.companiesSupplied.length > 0 ? (
                                                supplier.companiesSupplied.map((company, index) => (
                                                    <span key={index} className="bg-slate-50 text-slate-500 text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border border-slate-100 group-hover:border-blue-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                        {company}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">No Brands Listed</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SupplierManagement;
