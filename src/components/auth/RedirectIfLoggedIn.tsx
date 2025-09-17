import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface RedirectIfLoggedInProps {
  children: JSX.Element;
}

const RedirectIfLoggedIn: React.FC<RedirectIfLoggedInProps> = ({ children }) => {
  const { user } = useAuth();

  if (user) {
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'staff':
        return <Navigate to="/staff" replace />;
      case 'technician':
        return <Navigate to="/technician" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default RedirectIfLoggedIn;
