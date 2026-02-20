import { useEffect, useState } from 'react';
import { getServiceRequests } from '../../api/api';

const statusBadge = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected' };

const MyRequests = () => {
    const [requests, setRequests] = useState([]);
    useEffect(() => { getServiceRequests().then(r => setRequests(r.data)); }, []);

    return (
        <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white mb-6">My Service Requests</h1>
            <div className="card overflow-x-auto p-0">
                <table className="w-full text-sm">
                    <thead className="border-b border-slate-100 dark:border-slate-700">
                        <tr className="text-left text-slate-400 dark:text-slate-500">
                            <th className="px-5 py-3 font-medium">Service ID</th>
                            <th className="px-5 py-3 font-medium">Message</th>
                            <th className="px-5 py-3 font-medium">Status</th>
                            <th className="px-5 py-3 font-medium">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map(r => (
                            <tr key={r._id} className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/20">
                                <td className="px-5 py-3 font-mono text-xs text-slate-400">{r.service?.slice(-8) || r.service}</td>
                                <td className="px-5 py-3 text-slate-500 max-w-[200px] truncate">{r.message || '—'}</td>
                                <td className="px-5 py-3"><span className={statusBadge[r.status]}>{r.status}</span></td>
                                <td className="px-5 py-3 text-slate-400 text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {requests.length === 0 && <p className="p-6 text-center text-slate-400 text-sm">No requests yet</p>}
            </div>
        </div>
    );
};

export default MyRequests;
