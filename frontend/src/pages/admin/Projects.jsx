import { useEffect, useState } from 'react';
import { getProjects, createProject, deleteProject, assignProject, getUsers } from '../../api/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, UserCheck } from 'lucide-react';

const STATUSES = ['not_started', 'in_progress', 'completed', 'on_hold'];

const statusBadge = {
    not_started: 'badge-pending',
    in_progress: 'badge-active',
    completed: 'badge-completed',
    on_hold: 'badge-on_hold',
};

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [showAssign, setShowAssign] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', client: '', status: 'not_started' });
    const [assignIds, setAssignIds] = useState([]);
    const [loading, setLoading] = useState(false);

    const load = () => Promise.all([getProjects(), getUsers()])
        .then(([p, u]) => { setProjects(p.data); setUsers(u.data); });
    useEffect(() => { load(); }, []);

    const clients = users.filter(u => u.role === 'client');
    const employees = users.filter(u => u.role === 'employee');
    const getName = (id) => users.find(u => u._id === id)?.name || id;

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createProject(form);
            toast.success('Project created');
            setShowCreate(false);
            setForm({ name: '', description: '', client: '', status: 'not_started' });
            load();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
        finally { setLoading(false); }
    };

    const handleAssign = async () => {
        try {
            await assignProject(showAssign._id, { employeeIds: assignIds });
            toast.success('Employees assigned');
            setShowAssign(null);
            load();
        } catch { toast.error('Error'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete project?')) return;
        try { await deleteProject(id); toast.success('Deleted'); load(); }
        catch { toast.error('Error'); }
    };

    const toggleAssignId = (id) => setAssignIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">Projects</h1>
                <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> New Project</button>
            </div>

            <div className="card overflow-x-auto p-0">
                <table className="w-full text-sm">
                    <thead className="border-b border-slate-100 dark:border-slate-700">
                        <tr className="text-left text-slate-400 dark:text-slate-500">
                            <th className="px-5 py-3 font-medium">Name</th>
                            <th className="px-5 py-3 font-medium">Client</th>
                            <th className="px-5 py-3 font-medium">Status</th>
                            <th className="px-5 py-3 font-medium">Employees</th>
                            <th className="px-5 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map(p => (
                            <tr key={p._id} className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/20">
                                <td className="px-5 py-3 font-medium">{p.name}</td>
                                <td className="px-5 py-3 text-slate-500">{getName(p.client)}</td>
                                <td className="px-5 py-3"><span className={statusBadge[p.status]}>{p.status.replace('_', ' ')}</span></td>
                                <td className="px-5 py-3 text-slate-500 text-xs">{p.assignedEmployees?.length || 0} assigned</td>
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => { setShowAssign(p); setAssignIds(p.assignedEmployees || []); }} className="text-indigo-500 hover:text-indigo-700 p-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all" title="Assign employees"><UserCheck size={16} /></button>
                                        <button onClick={() => handleDelete(p._id)} className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><Trash2 size={15} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {projects.length === 0 && <p className="p-6 text-center text-slate-400 text-sm">No projects yet</p>}
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="card w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-slate-800 dark:text-white">New Project</h2>
                            <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-3">
                            <div><label className="label">Project Name</label><input className="input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                            <div><label className="label">Description</label><textarea className="input resize-none" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
                            <div>
                                <label className="label">Client</label>
                                <select className="input" required value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))}>
                                    <option value="">— Select client —</option>
                                    {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label">Status</label>
                                <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                                    {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Creating...' : 'Create'}</button>
                                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Modal */}
            {showAssign && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="card w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-slate-800 dark:text-white">Assign Employees — {showAssign.name}</h2>
                            <button onClick={() => setShowAssign(null)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                            {employees.map(e => (
                                <label key={e._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                                    <input type="checkbox" checked={assignIds.includes(e._id)} onChange={() => toggleAssignId(e._id)} className="rounded" />
                                    <span className="text-sm text-slate-700 dark:text-slate-200">{e.name}</span>
                                    <span className="text-xs text-slate-400">{e.email}</span>
                                </label>
                            ))}
                            {employees.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No employees available</p>}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleAssign} className="btn-primary flex-1">Save Assignment</button>
                            <button onClick={() => setShowAssign(null)} className="btn-secondary flex-1">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
