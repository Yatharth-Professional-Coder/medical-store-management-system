import { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/users/login', { email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            if (data.role === 'SuperAdmin') {
                navigate('/super-admin');
            } else {
                navigate('/pharmacy-admin');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[100px] animate-pulse delay-700"></div>

            <div className="w-full max-w-[480px] z-10">
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 p-8 sm:p-12 border border-slate-100 flex flex-col relative overflow-hidden animate-slide-up">
                    {/* Top Accent */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

                    <div className="mb-10 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-900 text-white rounded-[1.5rem] mb-6 shadow-xl shadow-slate-200 animate-bounce-slow">
                            <span className="text-3xl font-black">M</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Welcome Back</h1>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Authorized Access Only</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Master Identity (Email)</label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-5 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                    required
                                />
                                <div className="absolute right-5 top-5 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Secret Key (Password)</label>
                            </div>
                            <div className="relative group">
                                <input
                                    type="password"
                                    placeholder="********"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-5 bg-slate-50 border-none rounded-2xl font-bold shadow-inner focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                    required
                                />
                                <div className="absolute right-5 top-5 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                            ) : (
                                <>
                                    Confirm Secure Login
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">New Pharmacy Store?</p>
                        <Link to="/register" className="inline-flex items-center gap-2 text-blue-600 font-black text-sm uppercase tracking-widest hover:text-blue-700 transition-colors group">
                            Create Master Account
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="mt-8 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
                    Powered by Madaan Medicos OS v2.0
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-slow { animation: bounce-slow 4s infinite ease-in-out; }
            `}} />
        </div>
    );
};

export default Login;
