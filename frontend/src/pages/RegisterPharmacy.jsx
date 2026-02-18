import { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPharmacy = () => {
    const [formData, setFormData] = useState({
        adminName: '', adminEmail: '', adminPassword: '', pharmacyName: '', address: '', licenseNumber: '', contactNumber: '', gstNumber: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/pharmacies/register', formData);
            alert('Registration request submitted! Please wait for system approval.');
            navigate('/');
        } catch (error) {
            alert(error.response?.data?.message || 'Error registering pharmacy');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 sm:p-8 font-sans relative overflow-x-hidden">
            {/* Ambient Background Elements */}
            <div className="fixed top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-2xl z-10 animate-slide-up">
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-14 relative overflow-hidden">
                    {/* Header Accent */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                        <div>
                            <Link to="/" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-blue-600 transition-colors mb-4 group">
                                <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
                                Back to Control
                            </Link>
                            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Onboard Store</h2>
                        </div>
                        <div className="hidden sm:flex flex-col items-end opacity-40">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Madaan Medicos</span>
                            <span className="text-[9px] font-bold text-slate-400">Merchant Gateway v2.1</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Section 1: Pharmacy Info */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-blue-200">01</span>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Business Identity</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Pharmacy Official Name</label>
                                    <input name="pharmacyName" placeholder="Madaan Medicos Store #1" value={formData.pharmacyName} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" required />
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Global Operation Address</label>
                                    <input name="address" placeholder="123, Medical Square, Capital City" value={formData.address} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" required />
                                </div>
                                <div className="space-y-1.5 ">
                                    <label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Retail License Key</label>
                                    <input name="licenseNumber" placeholder="DL-12345/ABC" value={formData.licenseNumber} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none uppercase" required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Contact Identity</label>
                                    <input name="contactNumber" placeholder="+91 XXXX XXXX" value={formData.contactNumber} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" required />
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Secondary (GST) Token <span className="text-slate-300 font-bold">(Optional)</span></label>
                                    <input name="gstNumber" placeholder="07XXXXX0000X1ZX" value={formData.gstNumber} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none uppercase" />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Admin Info */}
                        <div className="space-y-6 pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-indigo-200">02</span>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Master Admin Setup</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Full Admin Persona Name</label>
                                    <input name="adminName" placeholder="Admin Full Name" value={formData.adminName} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Principal Master Email</label>
                                    <input name="adminEmail" placeholder="admin@domain.com" type="email" value={formData.adminEmail} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Secret Master Key (Password)</label>
                                    <input name="adminPassword" placeholder="8+ Strong Characters" type="password" value={formData.adminPassword} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" required />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] shadow-[0_20px_40px_-15px_rgba(15,23,42,0.3)] hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-4 relative overflow-hidden"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/20 border-t-white"></div>
                                ) : (
                                    <>
                                        Submit Registration
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                    </>
                                )}
                            </button>
                            <p className="text-center text-slate-400 font-bold text-[9px] uppercase tracking-widest mt-6">All registrations require offline verification by network admin</p>
                        </div>
                    </form>
                </div>

                <div className="mt-12 text-center">
                    <Link to="/" className="inline-flex items-center gap-3 text-slate-500 font-black text-xs uppercase tracking-widest hover:text-blue-600 transition-colors group">
                        Return to Access Terminal
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPharmacy;
