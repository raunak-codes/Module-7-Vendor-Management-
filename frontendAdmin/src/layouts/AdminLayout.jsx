import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Outlet } from 'react-router-dom';
import './AdminLayout.css';

export default function AdminLayout({
  children,
  searchPlaceholder = 'Search vendors, orders, or invoices...',
  showSearch = true,
  avatarInitials = 'AU',
}) {
  return (
    <div className="admin-layout">
      <Sidebar variant="admin" />
      <div className="admin-layout__main">
        <Navbar
          searchPlaceholder={searchPlaceholder}
          showSearch={showSearch}
          avatarInitials={avatarInitials}
          notificationsPath="/admin/notifications"
        />
        <div className="admin-layout__content">
          {children ?? <Outlet />}
        </div>
      </div>
    </div>
  );
}
