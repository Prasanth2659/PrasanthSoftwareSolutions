import { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { logout } from '../api/api';
import Sidebar from './Sidebar';
import ThemeToggle from './ThemeToggle';
import { UserCircle, LogOut, ChevronDown, Bell, X, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardLayout = ({ links, title }) => {
    const { user, logoutUser } = useAuth();
    const { notifications, deleteNotification, markAllRead } = useSocket();
    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const dropdownRef = useRef(null);
    const notifRef = useRef(null);

    const handleLogout = async () => {
        try { await logout(); } catch { }
        logoutUser();
        toast.success('Logged out');
        navigate('/login');
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false);
            if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex bg-slate-50 dark:bg-slate-900 h-screen overflow-hidden">
            {/* Sidebar */}
            <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'} flex-shrink-0`}>
                <Sidebar links={links} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 flex-shrink-0 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between px-6 z-10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />

                        {/* Notifications Dropdown */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
                            >
                                <Bell size={20} />
                                {notifications.length > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1 ring-2 ring-white dark:ring-slate-800 animate-pulse">
                                        {notifications.length}
                                    </span>
                                )}
                            </button>

                            {isNotifOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden z-50 flex flex-col max-h-[400px]">
                                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/80">
                                        <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Notifications</h3>
                                        <button onClick={markAllRead} className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1">
                                            <CheckCheck size={14} /> Mark all read
                                        </button>
                                    </div>
                                    <div className="overflow-y-auto flex-1 p-2 space-y-1">
                                        {notifications.length === 0 ? (
                                            <p className="text-center text-sm text-slate-400 py-6">No new notifications</p>
                                        ) : (
                                            notifications.map((notif, i) => (
                                                <div key={i} className="flex items-start gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg group transition-colors">
                                                    <div
                                                        className="flex-1 cursor-pointer"
                                                        onClick={() => {
                                                            setIsNotifOpen(false);
                                                            navigate(`/${user?.role}/messages`, { state: { activeId: notif.senderId } });
                                                        }}
                                                    >
                                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{notif.message}</p>
                                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                                                        className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-semibold">
                                    {user?.name?.[0]?.toUpperCase() || <UserCircle size={20} />}
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-tight">{user?.name}</p>
                                    <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                                </div>
                                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-1 z-50">
                                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 sm:hidden">
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{user?.name}</p>
                                        <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                                    </div>
                                    <button
                                        onClick={() => { setIsDropdownOpen(false); navigate(`/${user?.role}/profile`); }}
                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 transition-colors"
                                    >
                                        <UserCircle size={16} />
                                        Profile Settings
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content (Scrollable) */}
                <main className="flex-1 overflow-y-auto p-6 relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
