import { useEffect, useState } from 'react';
import { getProjects } from '../../api/api';
import { FolderKanban, CheckCircle, Clock, Pause } from 'lucide-react';

const statusBadge = {
    not_started: 'badge-pending',
    in_progress: 'badge-active',
    completed: 'badge-completed',
    on_hold: 'badge-on_hold',
};

const EmployeeDashboard = () => {
    const [projects, setProjects] = useState([]);
    useEffect(() => { getProjects().then(r => setProjects(r.data)); }, []);

    const counts = {
        total: projects.length,
        inProgress: projects.filter(p => p.status === 'in_progress').length,
        completed: projects.filter(p => p.status === 'completed').length,
        onHold: projects.filter(p => p.status === 'on_hold').length,
    };

    return (
        <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white mb-6">My Dashboard</h1>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { icon: FolderKanban, label: 'Total Projects', value: counts.total, color: 'bg-indigo-500' },
                    { icon: Clock, label: 'In Progress', value: counts.inProgress, color: 'bg-amber-500' },
                    { icon: CheckCircle, label: 'Completed', value: counts.completed, color: 'bg-emerald-500' },
                    { icon: Pause, label: 'On Hold', value: counts.onHold, color: 'bg-slate-400' },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                            <s.icon size={20} className="text-white" />
                        </div>
                        <p className="text-2xl font-bold text-slate-800 dark:text-white">{s.value}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
                    </div>
                ))}
            </div>
            <div className="card">
                <h2 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Assigned Projects</h2>
                {projects.length === 0 && <p className="text-slate-400 text-sm text-center py-6">No projects assigned yet</p>}
                <div className="space-y-2">
                    {projects.map(p => (
                        <div key={p._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700">
                            <span className="font-medium text-sm text-slate-800 dark:text-white">{p.name}</span>
                            <span className={statusBadge[p.status]}>{p.status.replace('_', ' ')}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
