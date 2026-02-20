import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout } from '../api/api';
import ThemeToggle from './ThemeToggle';
import { Building2, LogOut, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Sidebar = ({ links }) => {
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try { await logout(); } catch { }
        logoutUser();
        toast.success('Logged out');
        navigate('/login');
    };

    return (
        <aside className="w-64 min-h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col shadow-sm">
            {/* Brand */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-indigo-900">
                        <Building2 size={18} className="text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">Prasanth</p>
                        <p className="text-xs text-slate-400">Software Solutions</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-1">
                {links.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to.split('/').length <= 2}
                        className={({ isActive }) =>
                            `sidebar-link${isActive ? ' active' : ''}`
                        }
                    >
                        <Icon size={18} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* User + Logout */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700">
                    <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
                        {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600">
                    <LogOut size={16} />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
