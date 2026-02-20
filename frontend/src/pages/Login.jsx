import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../api/api';
import ThemeToggle from '../components/ThemeToggle';
import { Building2, LogIn } from 'lucide-react';

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await login(form);
            loginUser(res.data);
            toast.success(`Welcome back, ${res.data.user.name}!`);
            const role = res.data.user.role;
            navigate(role === 'admin' ? '/admin' : role === 'employee' ? '/employee' : '/client');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex flex-col">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500 mb-4 shadow-lg shadow-indigo-200 dark:shadow-indigo-900">
                            <Building2 size={32} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Prasanth Software Solutions</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Company Management Portal</p>
                    </div>

                    {/* Card */}
                    <div className="card shadow-xl shadow-slate-100 dark:shadow-slate-900">
                        <h2 className="text-lg font-semibold mb-5 text-slate-800 dark:text-slate-100">Sign In</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">Email Address</label>
                                <input
                                    type="email"
                                    className="input"
                                    placeholder="you@prasanth.dev"
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    required
                                />
                            </div>
                            <div>
                                <label className="label">Password</label>
                                <input
                                    type="password"
                                    className="input"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    required
                                />
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                                <LogIn size={16} />
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>

                        {/* Demo credentials */}
                        <div className="mt-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-700 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                            <p className="font-semibold text-slate-600 dark:text-slate-300 mb-1">Test Credentials:</p>
                            <p>🔴 Admin: admin@prasanth.dev / Admin@123</p>
                            <p>🟡 Employee: employee@prasanth.dev / Emp@123</p>
                            <p>🟢 Client: client@prasanth.dev / Client@123</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
