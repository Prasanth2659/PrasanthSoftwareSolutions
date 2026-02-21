import { useEffect, useState } from 'react';
import { getUsers, createUser, deleteUser, getCompanies, updateUser } from '../../api/api';
import toast from 'react-hot-toast';
import { UserPlus, Trash2, X, Edit2, AlertTriangle } from 'lucide-react';

const ROLES = ['employee', 'client'];

const Users = () => {
    const [users, setUsers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee', company: '' });
    const [loading, setLoading] = useState(false);

    const load = () => Promise.all([getUsers(), getCompanies()])
        .then(([u, c]) => { setUsers(u.data); setCompanies(c.data); });

    useEffect(() => { load(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dataToSubmit = { ...form };
            // If editing and password is empty, don't send it to preserve existing password
            if (editingId && !dataToSubmit.password) {
                delete dataToSubmit.password;
            }

            if (editingId) {
                await updateUser(editingId, dataToSubmit);
                toast.success('User updated');
            } else {
                await createUser(dataToSubmit);
                toast.success('User created');
            }
            closeModal();
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error occurred');
        } finally { setLoading(false); }
    };

    const openEditModal = (user) => {
        setEditingId(user._id);
        setForm({
            name: user.name,
            email: user.email,
            password: '', // Leave blank unless they want to change it
            role: user.role,
            company: user.company || ''
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setForm({ name: '', email: '', password: '', role: 'employee', company: '' });
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        try {
            await deleteUser(userToDelete);
            toast.success('User deleted successfully');
            load();
        }
        catch { toast.error('Delete failed'); }
        finally { setUserToDelete(null); }
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
                                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => openEditModal(u)} className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
                                                <Edit2 size={15} />
                                            </button>
                                            <button onClick={() => setUserToDelete(u._id)} className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && <p className="p-6 text-center text-slate-400 text-sm">No users yet</p>}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="card w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-slate-800 dark:text-white">{editingId ? 'Edit User' : 'Add User'}</h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div><label className="label">Name</label><input className="input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                            <div><label className="label">Email</label><input type="email" className="input" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                            <div>
                                <label className="label">Password <span className="text-xs text-slate-400 font-normal">{editingId && '(Leave blank to keep unchanged)'}</span></label>
                                <input type="password" className="input" required={!editingId} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                            </div>
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
                                <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Saving...' : (editingId ? 'Save Changes' : 'Create')}</button>
                                <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {userToDelete && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="card w-full max-w-sm shadow-2xl p-6">
                        <div className="flex items-center gap-3 mb-4 text-rose-500">
                            <AlertTriangle size={24} />
                            <h2 className="font-bold text-lg text-slate-800 dark:text-white">Delete User?</h2>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                            Are you sure you want to delete this user? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setUserToDelete(null)} className="btn-secondary flex-1">Cancel</button>
                            <button onClick={handleDelete} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-colors flex-1 shadow-sm">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
