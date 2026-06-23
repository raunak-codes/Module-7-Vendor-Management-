import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import PurchaseOrders from './pages/purchase-orders/PurchaseOrders';
import PurchaseOrderDetails from './pages/purchase-orders/PurchaseOrderDetails';
import WorkOrders from './pages/work-orders/WorkOrders';
import PaymentHistory from './pages/finance/PaymentHistory';
import InvoiceUpload from './pages/finance/InvoiceUpload';
import VendorProfile from './pages/profile/VendorProfile';
import RatingsReviews from './pages/ratings/RatingsReviews';
import Notifications from './pages/notifications/Notifications';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="purchase-orders" element={<PurchaseOrders />} />
          <Route path="purchase-orders/:id" element={<PurchaseOrderDetails />} />
          <Route path="work-orders" element={<WorkOrders />} />
          <Route path="finance" element={<PaymentHistory />} />
          <Route path="finance/upload" element={<InvoiceUpload />} />
          <Route path="profile" element={<VendorProfile />} />
          <Route path="ratings" element={<RatingsReviews />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
