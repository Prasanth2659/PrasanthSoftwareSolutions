import { useEffect, useState } from 'react';
import { getConversations, getThread, sendMessage, getUsers } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';

const MessagesPage = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [thread, setThread] = useState([]);
    const [text, setText] = useState('');

    useEffect(() => {
        Promise.all([getConversations(), getUsers()])
            .then(([c, u]) => { setConversations(c.data); setUsers(u.data); });
    }, []);

    useEffect(() => {
        if (activeId) getThread(activeId).then(r => setThread(r.data));
    }, [activeId]);

    const getName = (id) => users.find(u => u._id === id)?.name || 'Unknown';

    const handleSend = async () => {
        if (!text.trim() || !activeId) return;
        try {
            await sendMessage({ receiverId: activeId, content: text });
            setText('');
            getThread(activeId).then(r => setThread(r.data));
        } catch { toast.error('Send failed'); }
    };

    return (
        <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Messages</h1>
            <div className="flex gap-4 h-[600px]">
                {/* Conversation List */}
                <div className="w-64 card p-2 overflow-y-auto flex-shrink-0">
                    <p className="text-xs text-slate-400 px-2 mb-2 font-medium uppercase tracking-wider">Conversations</p>
                    {conversations.length === 0 && <p className="text-center text-slate-400 text-sm py-6">No conversations</p>}
                    {conversations.map(c => (
                        <button key={c.partnerId} onClick={() => setActiveId(c.partnerId)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-sm mb-1 transition-all ${activeId === c.partnerId ? 'bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-medium' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                            <p className="font-medium">{getName(c.partnerId)}</p>
                            <p className="text-xs text-slate-400 truncate">{c.lastMessage}</p>
                        </button>
                    ))}
                    {/* Direct message to any user */}
                    <div className="mt-2 border-t border-slate-100 dark:border-slate-700 pt-2">
                        <p className="text-xs text-slate-400 px-2 mb-1 font-medium uppercase tracking-wider">New Chat</p>
                        {users.filter(u => u._id !== user?.id).map(u => (
                            <button key={u._id} onClick={() => setActiveId(u._id)}
                                className={`w-full text-left px-3 py-2 rounded-xl text-sm mb-1 transition-all hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400`}>
                                {u.name} <span className="text-xs text-slate-400">({u.role})</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Thread */}
                <div className="flex-1 card flex flex-col p-4">
                    {!activeId ? (
                        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Select a conversation to start messaging</div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                                {thread.length === 0 && <p className="text-center text-slate-400 text-sm py-8">No messages yet. Start the conversation!</p>}
                                {thread.map(msg => (
                                    <div key={msg._id} className={`flex ${msg.sender === user?.id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${msg.sender === user?.id ? 'bg-indigo-500 text-white rounded-br-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-md'}`}>
                                            {msg.content}
                                            <p className="text-xs mt-0.5 opacity-60">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input className="input flex-1" placeholder="Type a message..." value={text} onChange={e => setText(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSend()} />
                                <button onClick={handleSend} className="btn-primary px-4"><Send size={16} /></button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;
