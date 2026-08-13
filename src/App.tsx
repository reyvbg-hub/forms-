/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Builder from './pages/Builder';
import FormViewer from './pages/FormViewer';
import Analytics from './pages/Analytics';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/builder/:id" 
            element={
              <PrivateRoute>
                <Builder />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/analytics/:id" 
            element={
              <PrivateRoute>
                <Analytics />
              </PrivateRoute>
            } 
          />
          <Route path="/f/:id" element={<FormViewer />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

