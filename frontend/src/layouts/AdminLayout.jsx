import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import {
    LayoutDashboard, Users, Building, Briefcase,
    ClipboardList, FolderKanban, MessageSquare, UserCircle
} from 'lucide-react';

const links = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/companies', icon: Building, label: 'Companies' },
    { to: '/admin/services', icon: Briefcase, label: 'Services' },
    { to: '/admin/requests', icon: ClipboardList, label: 'Service Requests' },
    { to: '/admin/projects', icon: FolderKanban, label: 'Projects' },
    { to: '/admin/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/admin/profile', icon: UserCircle, label: 'Profile' },
];

const AdminLayout = () => (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
        <Sidebar links={links} />
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-14 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between px-6">
                <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300">Admin Portal</h2>
                <ThemeToggle />
            </header>
            <main className="flex-1 overflow-y-auto p-6">
                <Outlet />
            </main>
        </div>
    </div>
);

export default AdminLayout;
