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
import ServiceManagement from './pages/profile/ServiceManagement';
import RateCardManagement from './pages/profile/RateCardManagement';
import RatingsReviews from './pages/ratings/RatingsReviews';
import Notifications from './pages/notifications/Notifications';
import EventAllocations from './pages/events/EventAllocations';
import DocumentVault from './pages/contracts/DocumentVault';

import { useState } from 'react';
import KYCUpload from './pages/auth/KYCUpload';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  const vendorStatus = localStorage.getItem('vendorStatus');
  const [kycSubmitted, setKycSubmitted] = useState(false);

  if (!token) return <Navigate to="/login" replace />;

  if (vendorStatus === 'PENDING') {
    if (kycSubmitted) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc', padding: 20, textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 64, color: '#f59e0b', marginBottom: 20 }}>
            pending_actions
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#1e293b', marginBottom: 10 }}>
            Application Submitted
          </h1>
          <p style={{ color: '#64748b', maxWidth: 400, lineHeight: 1.5 }}>
            Thank you! Your documents have been received. An administrator will review your application shortly.
          </p>
          <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} style={{ marginTop: 30, padding: '10px 20px', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>
            Logout
          </button>
        </div>
      );
    }

    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <KYCUpload onComplete={() => setKycSubmitted(true)} />
      </div>
    );
  }

  if (vendorStatus === 'REJECTED') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc', padding: 20, textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 64, color: '#ef4444', marginBottom: 20 }}>
          block
        </span>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#1e293b', marginBottom: 10 }}>
          Account Rejected
        </h1>
        <p style={{ color: '#64748b', maxWidth: 400, lineHeight: 1.5 }}>
          Unfortunately, your vendor application has been rejected. Please contact support for more information.
        </p>
        <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} style={{ marginTop: 30, padding: '10px 20px', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>
          Back to Login
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes under main layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* Operations */}
          <Route path="purchase-orders" element={<PurchaseOrders />} />
          <Route path="purchase-orders/:id" element={<PurchaseOrderDetails />} />
          <Route path="work-orders" element={<WorkOrders />} />
          <Route path="events" element={<EventAllocations />} />

          {/* Finance */}
          <Route path="finance" element={<PaymentHistory />} />
          <Route path="finance/upload" element={<InvoiceUpload />} />

          {/* Profile */}
          <Route path="profile" element={<VendorProfile />} />
          <Route path="profile/services" element={<ServiceManagement />} />
          <Route path="profile/rate-cards" element={<RateCardManagement />} />

          {/* Feedback */}
          <Route path="ratings" element={<RatingsReviews />} />
          <Route path="contracts" element={<DocumentVault />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
