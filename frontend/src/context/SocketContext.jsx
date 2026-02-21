import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

// Use the current host but route port 5006 for the messaging service socket server
const SOCKET_URL = `http://${window.location.hostname}:5006`;

export const SocketProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Only connect if the user is logged in
        if (!user || !token) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        const userId = user._id || user.id || user.data?._id || user.data?.id;

        const newSocket = io(SOCKET_URL, {
            query: { userId },
            auth: { token }
        });

        newSocket.on('connect', () => {
            console.log('[Socket] Connected to Messaging Real-Time Engine:', newSocket.id);
        });

        newSocket.on('notification', (notif) => {
            console.log('[Socket] Notification received:', notif);
            setNotifications(prev => [notif, ...prev]);
            toast.success(notif.message, { icon: '🔔' });
        });

        setSocket(newSocket);

        // Cleanup on unmount or user logout
        return () => {
            newSocket.disconnect();
        };
    }, [user, token]);

    const markAllRead = () => setNotifications([]);
    const deleteNotification = (id) => setNotifications(prev => prev.filter(n => n.id !== id));
    const clearSenderNotifications = (senderId) => setNotifications(prev => prev.filter(n => n.senderId !== senderId));

    return (
        <SocketContext.Provider value={{ socket, notifications, markAllRead, deleteNotification, clearSenderNotifications }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
