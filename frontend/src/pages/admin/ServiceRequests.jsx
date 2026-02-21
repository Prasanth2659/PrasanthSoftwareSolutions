import { useEffect, useState } from 'react';
import { getServiceRequests, approveRequest, rejectRequest, createProject, getUsers, getServices } from '../../api/api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle } from 'lucide-react';

const statusBadge = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
};

const ServiceRequests = () => {
    const [requests, setRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [services, setServices] = useState([]);

    const load = () => Promise.all([getServiceRequests(), getUsers(), getServices()])
        .then(([r, u, s]) => { setRequests(r.data); setUsers(u.data); setServices(s.data); });
    useEffect(() => { load(); }, []);

    const getName = (id, arr) => arr.find(x => x._id === id)?.name || id;

    const handleApprove = async (req) => {
        try {
            await approveRequest(req._id);
            const serviceModel = services.find(s => s._id === req.service);
            const servicePrice = serviceModel ? serviceModel.price : 0;
            const serviceName = serviceModel ? serviceModel.name : req.service;

            // Auto-create project
            await createProject({
                name: `Project for ${serviceName}`,
                description: `Auto-created from service request.`,
                client: req.client,
                serviceRequest: req._id,
                status: 'not_started',
                totalAmount: servicePrice
            });
            toast.success('Approved & project created!');
            load();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const handleReject = async (id) => {
        try { await rejectRequest(id); toast.success('Rejected'); load(); }
        catch { toast.error('Error'); }
    };

    return (
        <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Service Requests</h1>
            <div className="card overflow-x-auto p-0">
                <table className="w-full text-sm">
                    <thead className="border-b border-slate-100 dark:border-slate-700">
                        <tr className="text-left text-slate-400 dark:text-slate-500">
                            <th className="px-5 py-3 font-medium">Client</th>
                            <th className="px-5 py-3 font-medium">Service</th>
                            <th className="px-5 py-3 font-medium">Message</th>
                            <th className="px-5 py-3 font-medium">Status</th>
                            <th className="px-5 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map(r => (
                            <tr key={r._id} className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/20">
                                <td className="px-5 py-3 font-medium">{getName(r.client, users)}</td>
                                <td className="px-5 py-3">{getName(r.service, services)}</td>
                                <td className="px-5 py-3 text-slate-500 max-w-[200px] truncate">{r.message || '—'}</td>
                                <td className="px-5 py-3"><span className={statusBadge[r.status]}>{r.status}</span></td>
                                <td className="px-5 py-3">
                                    {r.status === 'pending' && (
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleApprove(r)} className="text-green-500 hover:text-green-700 p-1 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all" title="Approve"><CheckCircle size={18} /></button>
                                            <button onClick={() => handleReject(r._id)} className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" title="Reject"><XCircle size={18} /></button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {requests.length === 0 && <p className="p-6 text-center text-slate-400 text-sm">No service requests yet</p>}
            </div>
        </div>
    );
};

export default ServiceRequests;
