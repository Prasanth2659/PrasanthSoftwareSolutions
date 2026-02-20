import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { LayoutDashboard, FolderKanban, MessageSquare, UserCircle } from 'lucide-react';

const links = [
    { to: '/employee', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/employee/projects', icon: FolderKanban, label: 'My Projects' },
    { to: '/employee/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/employee/profile', icon: UserCircle, label: 'Profile' },
];

const EmployeeLayout = () => (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
        <Sidebar links={links} />
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-14 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between px-6">
                <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300">Employee Portal</h2>
                <ThemeToggle />
            </header>
            <main className="flex-1 overflow-y-auto p-6">
                <Outlet />
            </main>
        </div>
    </div>
);

export default EmployeeLayout;
