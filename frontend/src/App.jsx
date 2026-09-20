import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider, useAuth } from './context/AuthContext';
import Navigation from './components/Navigation';
import HomePage from './components/pages/HomePage';
import FarmerDashboard from './components/pages/FarmerDashboard';
import BuyerDashboard from './components/pages/BuyerDashboard';
import AuthPage from './components/pages/AuthPage';
import HowItWorks from './components/pages/HowItWorks';
import OpportunitiesPage from './components/pages/OpportunitiesPage';

const queryClient = new QueryClient();

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          border: '3px solid #d5eddb', borderTopColor: '#2a8a48',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'farmer' ? '/farmer' : '/buyer'} replace />;
  }
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: '#f5f8f6', display: 'flex', flexDirection: 'column' }}>
      <Navigation />
      <main style={{ flex: 1, width: '100%' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={user ? <Navigate to={user.role === 'farmer' ? '/farmer' : '/buyer'} /> : <AuthPage />}
          />
          <Route
            path="/farmer/*"
            element={
              <ProtectedRoute requiredRole="farmer">
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/*"
            element={
              <ProtectedRoute requiredRole="buyer">
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/opportunities"
            element={<OpportunitiesPage />}
          />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer style={{ background: 'white', borderTop: '1px solid rgba(45,138,72,0.1)', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '28px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #2a8a48, #17562c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: 'white', fontSize: '14px' }}>🌱</span>
              </div>
              <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: '#14181f', letterSpacing: '-0.01em' }}>
                AGRICYCLE
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#838b96', textAlign: 'center' }}>
              Connecting farmers with industries for a cleaner, circular economy.
            </p>
          </div>
        </div>
      </footer>

      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
        style={{ fontSize: '14px' }}
      />
    </div>
  );
}

// Add spin keyframe via style tag
const spinStyle = document.createElement('style');
spinStyle.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(spinStyle);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
