import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAnalyticsDashboard from "./pages/admin/AdminAnalyticsDashboard";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminInvoiceManagement from "./pages/admin/AdminInvoiceManagement";
import AdminKYCVerificationCenter from "./pages/admin/AdminKYCVerificationCenter";
import AdminLogout from "./pages/admin/AdminLogout";
import AdminNotificationCenter from "./pages/admin/AdminNotificationCenter";
import AdminPaymentManagement from "./pages/admin/AdminPaymentManagement";
import AdminPurchaseOrderDetails from "./pages/admin/AdminPurchaseOrderDetails";
import AdminPurchaseOrderManagement from "./pages/admin/AdminPurchaseOrderManagement";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminVendorAllocation from "./pages/admin/AdminVendorAllocation";
import AdminVendorDirectory from "./pages/admin/AdminVendorDirectory";
import AdminVendorProfile from "./pages/admin/AdminVendorProfile";
import AdminWorkOrderDetails from "./pages/admin/AdminWorkOrderDetails";
import AdminWorkOrderKanban from "./pages/admin/AdminWorkOrderKanban";
import AdminCreatePurchaseOrder from "./pages/admin/AdminCreatePurchaseOrder";

function ProtectedRoute() {
  const token = localStorage.getItem("adminToken");
  return token ? <Outlet /> : <Navigate to="/admin/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsDashboard />} />
          <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
          <Route path="/admin/invoices" element={<AdminInvoiceManagement />} />
          <Route path="/admin/kyc" element={<AdminKYCVerificationCenter />} />
          <Route path="/admin/logout" element={<AdminLogout />} />
          <Route path="/admin/notifications" element={<AdminNotificationCenter />} />
          <Route path="/admin/payments" element={<AdminPaymentManagement />} />
          <Route path="/admin/purchase-orders" element={<AdminPurchaseOrderManagement />} />
          <Route path="/admin/purchase-orders/new" element={<AdminCreatePurchaseOrder />} />
          <Route path="/admin/purchase-orders/:poId" element={<AdminPurchaseOrderDetails />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/vendor-allocation" element={<AdminVendorAllocation />} />
          <Route path="/admin/vendors" element={<AdminVendorDirectory />} />
          <Route path="/admin/vendors/:vendorId" element={<AdminVendorProfile />} />
          <Route path="/admin/work-orders" element={<AdminWorkOrderKanban />} />
          <Route path="/admin/work-orders/:workOrderId" element={<AdminWorkOrderDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
