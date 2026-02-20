import { useEffect, useState } from 'react';
import { getProjects } from '../../api/api';

const statusBadge = { not_started: 'badge-pending', in_progress: 'badge-active', completed: 'badge-completed', on_hold: 'badge-on_hold' };

const ClientProjects = () => {
    const [projects, setProjects] = useState([]);
    useEffect(() => { getProjects().then(r => setProjects(r.data)); }, []);

    return (
        <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white mb-6">My Projects</h1>
            <div className="card overflow-x-auto p-0">
                <table className="w-full text-sm">
                    <thead className="border-b border-slate-100 dark:border-slate-700">
                        <tr className="text-left text-slate-400 dark:text-slate-500">
                            <th className="px-5 py-3 font-medium">Name</th>
                            <th className="px-5 py-3 font-medium">Description</th>
                            <th className="px-5 py-3 font-medium">Status</th>
                            <th className="px-5 py-3 font-medium">Employees</th>
                            <th className="px-5 py-3 font-medium">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map(p => (
                            <tr key={p._id} className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/20">
                                <td className="px-5 py-3 font-medium text-slate-800 dark:text-white">{p.name}</td>
                                <td className="px-5 py-3 text-slate-500 max-w-[180px] truncate">{p.description || '—'}</td>
                                <td className="px-5 py-3"><span className={statusBadge[p.status]}>{p.status.replace('_', ' ')}</span></td>
                                <td className="px-5 py-3 text-slate-500">{p.assignedEmployees?.length || 0}</td>
                                <td className="px-5 py-3 text-slate-400 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {projects.length === 0 && <p className="p-6 text-center text-slate-400 text-sm">No projects yet</p>}
            </div>
        </div>
    );
};

export default ClientProjects;
