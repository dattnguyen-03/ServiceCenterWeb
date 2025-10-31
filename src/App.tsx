import AppFooter from './components/common/Footer';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import RedirectIfLoggedIn from './components/auth/RedirectIfLoggedIn';

// Layouts
import AdminLayout from './components/admin/AdminLayout';
import StaffLayout from './components/staff/StaffLayout';
import TechnicianLayout from './components/technician/TechnicianLayout';
import CustomerPortal from './components/customer/CustomerPortal';

// Pages
import LoginForm from './components/auth/LoginForm';
import RegisterPage from './components/auth/RegisterPage';
import AppointmentBooking from './components/customer/AppointmentBooking';
import ServiceHistory from './components/customer/ServiceHistory';
import PaymentPage from './components/customer/PaymentPage';
import VehicleManagement from './components/customer/VehicleManagement';
import VehicleDetail from './components/customer/VehicleDetail';
import ServicePackages from './components/customer/ServicePackages';
import CustomerDashboard from './components/customer/CustomerDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminProfile from './components/admin/AdminProfile';
import CustomerManagement from './components/admin/CustomerManagement';
import PartsManagement from './components/admin/PartsManagement';
import InventoryManagement from './components/admin/InventoryManagement';
import PartUsageManagement from './components/admin/PartUsageManagement';
import FinancialReports from './components/admin/FinancialReports';
import StaffManagement from './components/admin/StaffManagement';
import AdminServicePackageManagement from './components/admin/ServicePackageManagement';
import StaffDashboard from './components/staff/StaffDashboard';
import StaffServicePackageManagement from './components/staff/ServicePackageManagement';
import StaffProfile from './components/staff/StaffProfile';
import ServiceProgress from './components/staff/ServiceProgress';
import CustomerVehicleManagement from './components/staff/CustomerVehicleManagement';
import Billing from './components/staff/Billing';
import TechnicianDashboard from './components/technician/TechnicianDashboard';
import WorkOrders from './components/technician/WorkOrders';
import HomeRoute from './components/home/HomeRoute';
import AppointmentBookingManagement from './components/customer/AppointmentBookingManagement';
import TechnicianSchedule from './components/technician/Schedule';
import TechnicianPartsView from './components/technician/PartsView';
import ForgotPasswordPage from "./components/auth/ForgotPasswordPage";
import StaffPartsView from './components/staff/PartsView';
import TechnicianProfile from './components/technician/TechnicianProfile';
import AppointmentConfirmation from './components/staff/AppointmentConfirmation';
import ServiceOrderProgress from './components/technician/ServiceOrderProgress';
import AdminAppointmentConfirmation from './components/admin/AdminAppointmentConfirmation';
import ServiceCenterManagement from './components/admin/ServiceCenterManagement';
import StaffServiceCenterManagement from './components/staff/ServiceCenterManagement';
import ServiceOrderManagement from './components/admin/ServiceOrderManagement';
import StaffServiceOrderManagement from './components/staff/ServiceOrderManagement';
import ServiceChecklistManagement from './components/admin/ServiceChecklistManagement';
import TechnicianChecklistView from './components/technician/TechnicianChecklistView';
import PartsUsage from './components/technician/PartsUsage';
import TechnicianPartUsage from './components/technician/TechnicianPartUsage';
import StaffChecklistView from './components/staff/StaffChecklistView';
import PaymentSuccess from './components/common/PaymentSuccess';
import QuoteManagement from './components/admin/QuoteManagement';
import QuoteRequestManagement from './components/admin/QuoteRequestManagement';
import MyQuotes from './components/customer/MyQuotes';
import StaffQuoteManagement from './components/staff/StaffQuoteManagement';
import StaffQuoteRequestManagement from './components/staff/StaffQuoteRequestManagement';

const AppContent: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RedirectIfLoggedIn>
            <LoginForm />
          </RedirectIfLoggedIn>
        }
      />
      <Route
        path="/register"
        element={
          <RedirectIfLoggedIn>
            <RegisterPage />
          </RedirectIfLoggedIn>
        }
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />

      <Route path="/" element={<HomeRoute />} />

      <Route
        path="/customer/*"
        element={
          <RequireAuth role="customer">
            <CustomerPortal />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="booking" element={<AppointmentBooking />} />
        <Route path="history" element={<ServiceHistory />} />
        <Route path="payment" element={<PaymentPage />} />
        <Route path="profile" element={<div>Profile</div>} />
        <Route path="vehicles" element={<VehicleManagement />} />
        <Route path="vehicles/:vehicleId" element={<VehicleDetail />} />
        <Route path="service-packages" element={<ServicePackages />} />
        <Route path="management-booking" element={<AppointmentBookingManagement />} />
        <Route path="quotes" element={<MyQuotes />} />
        <Route path="parts" element={<StaffPartsView />} />
      </Route>

      <Route
        path="/admin/*"
        element={
          <RequireAuth role="admin">
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="customers" element={<CustomerManagement />} />
        <Route path="appointments" element={<AdminAppointmentConfirmation />} />
        <Route path="parts" element={<PartsManagement />} />
        <Route path="inventory" element={<InventoryManagement />} />
        <Route path="part-usage" element={<PartUsageManagement />} />
        <Route path="service-packages" element={<AdminServicePackageManagement />} />
        <Route path="service-centers" element={<ServiceCenterManagement />} />
        <Route path="service-orders" element={<ServiceOrderManagement />} />
        <Route path="service-checklists" element={<ServiceChecklistManagement />} />
            <Route path="quotes" element={<QuoteManagement />} />
            <Route path="quote-requests" element={<QuoteRequestManagement />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="finance" element={<FinancialReports />} />
      </Route>

      <Route
        path="/staff/*"
        element={
          <RequireAuth role="staff">
            <StaffLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="profile" element={<StaffProfile />} />
        <Route path="customers" element={<CustomerVehicleManagement />} />
        <Route path="service-centers" element={<StaffServiceCenterManagement />} />
        <Route path="service-orders" element={<StaffServiceOrderManagement />} />
        <Route path="appointment-confirmation" element={<AppointmentConfirmation />} />
        <Route path="service-checklists" element={<StaffChecklistView />} />
        <Route path="service-packages" element={<StaffServicePackageManagement />} />
        <Route path="parts" element={<StaffPartsView />} />
        <Route path="progress" element={<ServiceProgress />} />
        <Route path="invoices" element={<Billing />} />
        <Route path="quotes" element={<StaffQuoteManagement />} />
        <Route path="quote-requests" element={<StaffQuoteRequestManagement />} />
      </Route>

      <Route
        path="/technician/*"
        element={
          <RequireAuth role="technician">
            <TechnicianLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<TechnicianDashboard />} />
        <Route path="work-orders" element={<WorkOrders />} />
        <Route path="service-order-progress" element={<ServiceOrderProgress />} />
        <Route path="checklists" element={<TechnicianChecklistView />} />
        <Route path="parts" element={<TechnicianPartsView />} />
        <Route path="schedule" element={<TechnicianSchedule />} />
        <Route path="parts-usage" element={<PartsUsage />} />
        <Route path="part-usage" element={<TechnicianPartUsage />} />
        <Route path="profile" element={<TechnicianProfile />} />
      </Route>

      <Route path="*" element={<AuthRedirect />} />
    </Routes>
  );
};

const AuthRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'staff':
      return <Navigate to="/staff" replace />;
    case 'technician':
      return <Navigate to="/technician" replace />;
    case 'customer':
      return <Navigate to="/customer" replace />;
    default:
      return <Navigate to="/" replace />;
  }
}

interface RequireAuthProps {
  children: JSX.Element;
  role: 'admin' | 'staff' | 'technician' | 'customer';
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children, role }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return <AuthRedirect />;
  }

  return children;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LoadingProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <AppContent />
              <AppFooter />
            </div>
          </Router>
        </LoadingProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;