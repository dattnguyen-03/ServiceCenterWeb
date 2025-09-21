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
import MyServices from './components/customer/MyServices';
import AppointmentBooking from './components/customer/AppointmentBooking';
import ServiceHistory from './components/customer/ServiceHistory';
import PaymentPage from './components/customer/PaymentPage';
import ProfileManagement from './components/customer/ProfileManagement';
import VehicleManagement from './components/customer/VehicleManagement';
import CustomerDashboard from './components/customer/CustomerDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import CustomerManagement from './components/admin/CustomerManagement';
import PartsManagement from './components/admin/PartsManagement';
import FinancialReports from './components/admin/FinancialReports';
import StaffManagement from './components/admin/StaffManagement';
import StaffDashboard from './components/staff/StaffDashboard';
import ServiceProgress from './components/staff/ServiceProgress';
import AppointmentManagement from './components/staff/AppointmentManagement';
import ServiceTicket from './components/staff/ServiceTicket';
import CustomerVehicleManagement from './components/staff/CustomerVehicleManagement';
import Billing from './components/staff/Billing';
import TechnicianDashboard from './components/technician/TechnicianDashboard';
import WorkOrders from './components/technician/WorkOrders';
import HomeRoute from './components/home/HomeRoute';
import AppointmentBookingManagement from './components/customer/AppointmentBookingManagement';
import TechnicianSchedule from './components/technician/Schedule';
import PartsUsage from './components/technician/PartsUsage';
import ForgotPasswordPage from "./components/auth/ForgotPasswordPage";

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
        <Route path="my-services" element={<MyServices />} />
        <Route path="booking" element={<AppointmentBooking />} />
        <Route path="history" element={<ServiceHistory />} />
        <Route path="payment" element={<PaymentPage />} />
        <Route path="profile" element={<ProfileManagement />} />
        <Route path="vehicles" element={<VehicleManagement />} />
        <Route path="management-booking" element={<AppointmentBookingManagement />} />
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
        <Route path="customers" element={<CustomerManagement />} />
        <Route path="appointments" element={<AppointmentManagement />} />
        <Route path="service-tickets" element={<ServiceTicket />} />
        <Route path="service-progress" element={<ServiceProgress />} />
        <Route path="parts" element={<PartsManagement />} />
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
        <Route path="customers" element={<CustomerVehicleManagement />} />
        <Route path="appointments" element={<AppointmentManagement />} />
        <Route path="service-tickets" element={<ServiceTicket />} />
        <Route path="progress" element={<ServiceProgress />} />
        <Route path="invoices" element={<Billing />} />
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
        <Route path="schedule" element={<TechnicianSchedule />} />
        <Route path="parts-usage" element={<PartsUsage />} />
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