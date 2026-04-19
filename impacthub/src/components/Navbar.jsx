import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-brand-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-green flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M12 2L4 7v10l8 5 8-5V7L12 2z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M12 7l4 2.5v5L12 17l-4-2.5v-5L12 7z" fill="white"/>
            </svg>
          </div>
          <span className="font-display font-bold text-lg text-white">
            Impact<span className="text-brand-green">Hub</span>
          </span>
        </Link>

        {/* Nav Links */}
        {user && (
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive("/")
                  ? "bg-brand-green/20 text-brand-green"
                  : "text-brand-muted hover:text-brand-light hover:bg-brand-card"
              }`}
            >
              Events
            </Link>
            <Link
              to="/create"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive("/create")
                  ? "bg-brand-green/20 text-brand-green"
                  : "text-brand-muted hover:text-brand-light hover:bg-brand-card"
              }`}
            >
              + Create
            </Link>
            <Link
              to="/my-events"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive("/my-events")
                  ? "bg-brand-green/20 text-brand-green"
                  : "text-brand-muted hover:text-brand-light hover:bg-brand-card"
              }`}
            >
              My Events
            </Link>
          </div>
        )}

        {/* User Area */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="text-sm text-brand-muted hidden sm:block">
                {user.email?.split("@")[0]}
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg text-sm font-medium text-brand-muted border border-brand-border hover:border-red-500/50 hover:text-red-400 transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-brand-muted hover:text-brand-light transition-all"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-green text-brand-dark hover:bg-brand-green/90 transition-all font-semibold"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
