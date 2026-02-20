import { useEffect, useState } from 'react';
import { getUsers, createUser, deleteUser, getCompanies } from '../../api/api';
import toast from 'react-hot-toast';
import { UserPlus, Trash2, X } from 'lucide-react';

const ROLES = ['employee', 'client'];

const Users = () => {
    const [users, setUsers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee', company: '' });
    const [loading, setLoading] = useState(false);

    const load = () => Promise.all([getUsers(), getCompanies()])
        .then(([u, c]) => { setUsers(u.data); setCompanies(c.data); });

    useEffect(() => { load(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createUser(form);
            toast.success('User created');
            setShowModal(false);
            setForm({ name: '', email: '', password: '', role: 'employee', company: '' });
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error creating user');
        } finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this user?')) return;
        try { await deleteUser(id); toast.success('Deleted'); load(); }
        catch { toast.error('Delete failed'); }
    };

    const roleColor = { admin: 'badge-active', employee: 'badge-approved', client: 'badge-pending' };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">Users</h1>
                <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                    <UserPlus size={16} /> Add User
                </button>
            </div>

            <div className="card overflow-x-auto p-0">
                <table className="w-full text-sm">
                    <thead className="border-b border-slate-100 dark:border-slate-700">
                        <tr className="text-left text-slate-400 dark:text-slate-500">
                            <th className="px-5 py-3 font-medium">Name</th>
                            <th className="px-5 py-3 font-medium">Email</th>
                            <th className="px-5 py-3 font-medium">Role</th>
                            <th className="px-5 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u._id} className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                <td className="px-5 py-3 font-medium">{u.name}</td>
                                <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{u.email}</td>
                                <td className="px-5 py-3"><span className={roleColor[u.role]}>{u.role}</span></td>
                                <td className="px-5 py-3">
                                    {u.role !== 'admin' && (
                                        <button onClick={() => handleDelete(u._id)} className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                                            <Trash2 size={15} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && <p className="p-6 text-center text-slate-400 text-sm">No users yet</p>}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="card w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-slate-800 dark:text-white">Add User</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-3">
                            <div><label className="label">Name</label><input className="input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                            <div><label className="label">Email</label><input type="email" className="input" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                            <div><label className="label">Password</label><input type="password" className="input" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
                            <div>
                                <label className="label">Role</label>
                                <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            {form.role === 'client' && (
                                <div>
                                    <label className="label">Company</label>
                                    <select className="input" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}>
                                        <option value="">— None —</option>
                                        {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                            )}
                            <div className="flex gap-2 pt-2">
                                <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Creating...' : 'Create'}</button>
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
