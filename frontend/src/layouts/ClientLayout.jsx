import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { LayoutDashboard, Briefcase, ClipboardList, FolderKanban, MessageSquare, UserCircle } from 'lucide-react';

const links = [
    { to: '/client', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/client/services', icon: Briefcase, label: 'Services' },
    { to: '/client/requests', icon: ClipboardList, label: 'My Requests' },
    { to: '/client/projects', icon: FolderKanban, label: 'My Projects' },
    { to: '/client/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/client/profile', icon: UserCircle, label: 'Profile' },
];

const ClientLayout = () => (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
        <Sidebar links={links} />
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-14 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between px-6">
                <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300">Client Portal</h2>
                <ThemeToggle />
            </header>
            <main className="flex-1 overflow-y-auto p-6">
                <Outlet />
            </main>
        </div>
    </div>
);

export default ClientLayout;
