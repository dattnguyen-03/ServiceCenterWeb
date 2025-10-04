import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface RedirectIfLoggedInProps {
  children: JSX.Element;
}

const RedirectIfLoggedIn: React.FC<RedirectIfLoggedInProps> = ({ children }) => {
  const { user } = useAuth();

  if (user) {
    console.log('RedirectIfLoggedIn: User role is', user.role);
    switch (user.role) {
        case 'admin':
          return <Navigate to="/admin/dashboard" replace />;
      case 'staff':
        return <Navigate to="/staff/dashboard" replace />;
      case 'technician':
        return <Navigate to="/technician" replace />;
      case 'customer':
        return <Navigate to="/customer/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default RedirectIfLoggedIn;
