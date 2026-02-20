import { useEffect, useState } from 'react';
import { getUsers, getProjects, getServiceRequests, getServices } from '../../api/api';
import { Users, FolderKanban, ClipboardList, Briefcase } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="stat-card">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
            <Icon size={20} className="text-white" />
        </div>
        <p className="text-2xl font-bold text-slate-800 dark:text-white">{value ?? '—'}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({});

    useEffect(() => {
        Promise.all([getUsers(), getProjects(), getServiceRequests(), getServices()])
            .then(([u, p, r, s]) => setStats({
                users: u.data.length,
                projects: p.data.length,
                pending: r.data.filter(x => x.status === 'pending').length,
                services: s.data.length,
            })).catch(() => { });
    }, []);

    const cards = [
        { icon: Users, label: 'Total Users', value: stats.users, color: 'bg-indigo-500' },
        { icon: FolderKanban, label: 'Projects', value: stats.projects, color: 'bg-violet-500' },
        { icon: ClipboardList, label: 'Pending Requests', value: stats.pending, color: 'bg-amber-500' },
        { icon: Briefcase, label: 'Services', value: stats.services, color: 'bg-emerald-500' },
    ];

    return (
        <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map(c => <StatCard key={c.label} {...c} />)}
            </div>
        </div>
    );
};

export default AdminDashboard;
