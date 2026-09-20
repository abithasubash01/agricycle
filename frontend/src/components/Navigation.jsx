import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogOut, User, ChevronDown, Home, Sprout, ShoppingCart,
  TrendingUp, HelpCircle, Menu, X
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: Home, exact: true },
  { to: '/farmer', label: 'Farmer', icon: Sprout, role: 'farmer' },
  { to: '/buyer', label: 'Buyer', icon: ShoppingCart, role: 'buyer' },
  { to: '/opportunities', label: 'Opportunities', icon: TrendingUp },
  { to: '/how-it-works', label: 'How It Works', icon: HelpCircle },
];

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const isActive = (link) => {
    if (link.exact) return location.pathname === link.to;
    return location.pathname === link.to || location.pathname.startsWith(link.to + '/');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  // Filter nav links based on role
  const visibleLinks = NAV_LINKS.filter(link => {
    if (!link.role) return true;
    return user?.role === link.role;
  });

  return (
    <>
      <nav className="nav-premium sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #2a8a48, #17562c)' }}>
                <Sprout size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold text-charcoal-900"
                style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.02em' }}>
                AGRICYCLE
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {visibleLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`nav-link ${isActive(link) ? 'active' : ''}`}
                  >
                    <Icon size={15} />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all text-sm"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: user.role === 'farmer'
                        ? 'linear-gradient(135deg, #2a8a48, #17562c)'
                        : 'linear-gradient(135deg, #2563eb, #1e40af)' }}>
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="font-semibold text-charcoal-900 text-sm leading-tight">{user.name}</p>
                      <p className="text-xs text-charcoal-400 leading-tight capitalize">{user.role}</p>
                    </div>
                    <ChevronDown size={14} className="text-charcoal-400" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs text-charcoal-400 mb-0.5">Signed in as</p>
                        <p className="text-sm font-semibold text-charcoal-900 truncate">{user.email}</p>
                        <span className={user.role === 'farmer' ? 'badge-farmer' : 'badge-buyer'} style={{ marginTop: '6px' }}>
                          {user.role === 'farmer' ? '🌾 Farmer' : '🏭 Buyer'}
                        </span>
                      </div>
                      <Link
                        to={user.role === 'farmer' ? '/farmer' : '/buyer'}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-charcoal-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User size={15} /> Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login" className="nav-link">Sign In</Link>
                  <Link to="/login"
                    className="btn-primary py-2 px-5 text-sm"
                    style={{ borderRadius: '10px', padding: '8px 20px', fontSize: '0.875rem' }}
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white animate-fade-in">
            <div className="px-4 py-3 space-y-1">
              {visibleLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`nav-link w-full justify-start ${isActive(link) ? 'active' : ''}`}
                  >
                    <Icon size={16} />
                    {link.label}
                  </Link>
                );
              })}
              {!user && (
                <Link to="/login" className="btn-primary w-full mt-2 justify-center"
                  style={{ borderRadius: '10px' }}>
                  Sign In
                </Link>
              )}
              {user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-2"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navigation;
