import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import CmsPage from './pages/CmsPage';
import ProductsPage from './pages/ProductsPage';
import CategoriesPage from './pages/CategoriesPage';
import NewArrivalsPage from './pages/NewArrivalsPage';
import SalePage from './pages/SalePage';
import OrdersPage from './pages/OrdersPage';
import CouponsPage from './pages/CouponsPage';
import AuthUsersPage from './pages/AuthUsersPage';
import LoginPage from './pages/LoginPage';
import ScannerPage from './pages/ScannerPage';
import BarcodesPage from './pages/BarcodesPage';
import StockHistoryPage from './pages/StockHistoryPage';
import NewsletterPage from './pages/NewsletterPage';
import VendorsPage from './pages/VendorsPage';
import RacksPage from './pages/RacksPage';
import GodownsPage from './pages/GodownsPage';
import PosBillingModal from './components/PosBillingModal';
import { onGlobalPosBilling } from './utils/billingEvents';
import api from './services/api';
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';

function AccessDenied({ requiredRoles = [] }) {
  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
      <div className="bg-white p-8 rounded-2xl border border-red-200 shadow-xl max-w-md w-full text-center space-y-4">
        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Access Restricted</h2>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            You do not have the required permissions to access this section.
          </p>
          {requiredRoles.length > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-semibold border border-red-100">
              Required: {requiredRoles.join(' or ')}
            </div>
          )}
        </div>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function RoleGuard({ user, allowedRoles, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Super Admin has universal access
  if (user.role === 'superadmin' || allowedRoles.includes(user.role)) {
    return children;
  }

  return <AccessDenied requiredRoles={allowedRoles} />;
}

function ProtectedLayout({ user, onLogout }) {
  const [globalPosOpen, setGlobalPosOpen] = useState(false);

  useEffect(() => {
    return onGlobalPosBilling(() => {
      setGlobalPosOpen(true);
    });
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      <Sidebar currentUser={user} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Routes>
          {/* Dashboard — Accessible to all staff/managers/admins */}
          <Route path="/" element={<DashboardPage />} />

          {/* User & Role Management — EXCLUSIVELY SUPER ADMIN */}
          <Route
            path="/auth-users"
            element={
              <RoleGuard user={user} allowedRoles={['superadmin']}>
                <AuthUsersPage />
              </RoleGuard>
            }
          />

          {/* CMS & Marketing Curations — Super Admin & Admin */}
          <Route
            path="/cms"
            element={
              <RoleGuard user={user} allowedRoles={['superadmin', 'admin']}>
                <CmsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/coupons"
            element={
              <RoleGuard user={user} allowedRoles={['superadmin', 'admin']}>
                <CouponsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/newsletter"
            element={
              <RoleGuard user={user} allowedRoles={['superadmin', 'admin']}>
                <NewsletterPage />
              </RoleGuard>
            }
          />
          <Route
            path="/new-arrivals"
            element={
              <RoleGuard user={user} allowedRoles={['superadmin', 'admin']}>
                <NewArrivalsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/sale"
            element={
              <RoleGuard user={user} allowedRoles={['superadmin', 'admin']}>
                <SalePage />
              </RoleGuard>
            }
          />

          {/* Catalog Management — Super Admin, Admin & Store Manager */}
          <Route
            path="/products"
            element={
              <RoleGuard user={user} allowedRoles={['superadmin', 'admin', 'manager']}>
                <ProductsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/categories"
            element={
              <RoleGuard user={user} allowedRoles={['superadmin', 'admin', 'manager']}>
                <CategoriesPage />
              </RoleGuard>
            }
          />
          <Route
            path="/vendors"
            element={
              <RoleGuard user={user} allowedRoles={['superadmin', 'admin', 'manager']}>
                <VendorsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/racks"
            element={
              <RoleGuard user={user} allowedRoles={['superadmin', 'admin', 'manager']}>
                <RacksPage />
              </RoleGuard>
            }
          />
          <Route
            path="/godowns"
            element={
              <RoleGuard user={user} allowedRoles={['superadmin', 'admin', 'manager']}>
                <GodownsPage />
              </RoleGuard>
            }
          />

          {/* POS, Inventory, Scanning & Orders — Staff, Manager, Admin & Super Admin */}
          <Route
            path="/scanner"
            element={
              <RoleGuard user={user} allowedRoles={['superadmin', 'admin', 'manager', 'staff']}>
                <ScannerPage />
              </RoleGuard>
            }
          />
          <Route
            path="/barcodes"
            element={
              <RoleGuard user={user} allowedRoles={['superadmin', 'admin', 'manager', 'staff']}>
                <BarcodesPage />
              </RoleGuard>
            }
          />
          <Route
            path="/stock-history"
            element={
              <RoleGuard user={user} allowedRoles={['superadmin', 'admin', 'manager', 'staff']}>
                <StockHistoryPage />
              </RoleGuard>
            }
          />
          <Route
            path="/orders"
            element={
              <RoleGuard user={user} allowedRoles={['superadmin', 'admin', 'manager', 'staff']}>
                <OrdersPage />
              </RoleGuard>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Global POS Billing Modal */}
      {globalPosOpen && (
        <PosBillingModal
          isOpen={globalPosOpen}
          onClose={() => setGlobalPosOpen(false)}
          onOrderCreated={() => {
            // Refreshes or order events can be handled by listeners
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const token = localStorage.getItem('admin_token');
    const saved = localStorage.getItem('admin_user');
    if (token && saved) {
      try {
        const parsed = JSON.parse(saved);
        // Only allow staff/admin roles
        if (['superadmin', 'admin', 'manager', 'staff'].includes(parsed?.role)) {
          return parsed;
        }
      } catch (e) {}
    }
    return null;
  });

  const [verifyingSession, setVerifyingSession] = useState(true);

  // Validate session on app launch
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setCurrentUser(null);
      setVerifyingSession(false);
      return;
    }

    api
      .get('/auth/me')
      .then((res) => {
        if (res.data?.user && ['superadmin', 'admin', 'manager', 'staff'].includes(res.data.user.role)) {
          setCurrentUser(res.data.user);
          localStorage.setItem('admin_user', JSON.stringify(res.data.user));
        } else {
          handleLogout();
        }
      })
      .catch(() => {
        handleLogout();
      })
      .finally(() => {
        setVerifyingSession(false);
      });

    const handleUnauthorizedEvent = () => {
      handleLogout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorizedEvent);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorizedEvent);
    };
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setCurrentUser(null);
  };

  if (verifyingSession) {
    return (
      <div className="min-h-screen bg-[#1E1119] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-rose-400 text-white font-bold text-xl flex items-center justify-center mx-auto shadow-lg">
            J
          </div>
          <p className="text-xs text-rose-200/60 font-medium flex items-center gap-2 justify-center">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying Security Credentials...
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            currentUser ? (
              <Navigate to="/" replace />
            ) : (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            )
          }
        />
        <Route
          path="/*"
          element={<ProtectedLayout user={currentUser} onLogout={handleLogout} />}
        />
      </Routes>
    </BrowserRouter>
  );
}
