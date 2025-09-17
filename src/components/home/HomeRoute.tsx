import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import HomePage from './HomePage';
import { Navigate } from 'react-router-dom';

const HomeRoute: React.FC = () => {
  const { user } = useAuth();
  
  if (user && user.role === 'customer') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <HomePage />;
};

export default HomeRoute;
