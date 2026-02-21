import DashboardLayout from '../components/DashboardLayout';
import { LayoutDashboard, FolderKanban, MessageSquare, UserCircle } from 'lucide-react';

const links = [
    { to: '/employee', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/employee/projects', icon: FolderKanban, label: 'My Projects' },
    { to: '/employee/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/employee/profile', icon: UserCircle, label: 'Profile' },
];

const EmployeeLayout = () => {
    return <DashboardLayout links={links} title="Employee Portal" />;
};

export default EmployeeLayout;
