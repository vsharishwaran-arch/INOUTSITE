import { useState, type FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export function AdminLogin() {
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-[420px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Brand header */}
        <div className="text-center mb-10">
          <motion.span
            style={{ fontFamily: 'var(--font-display)' }}
            className="text-[2rem] tracking-[0.15em] font-semibold leading-[0.96] select-none text-foreground inline-block"
            initial={{ opacity: 0, filter: 'blur(6px)', letterSpacing: '0.28em' }}
            animate={{ opacity: 1, filter: 'blur(0px)', letterSpacing: '0.15em' }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              className="inline-block"
              animate={{
                textShadow: [
                  '0 0 0 rgba(0,0,0,0)',
                  '0 2px 10px rgba(178,132,44,0.3), 0 0 24px rgba(178,132,44,0.2)',
                  '0 0 0 rgba(0,0,0,0)',
                ],
              }}
              transition={{ duration: 3.4, delay: 0.95, repeat: Infinity, ease: 'easeInOut' }}
            >
              INOUT
            </motion.span>
          </motion.span>
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-medium mt-2">
            Admin Dashboard
          </p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-7">
          <h1 className="text-lg font-semibold tracking-tight mb-1">Welcome back</h1>
          <p className="text-xs text-muted-foreground mb-6">Sign in to manage your store</p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-2.5 rounded-md text-xs mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium tracking-[0.06em] uppercase mb-1.5 text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@inout.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md bg-background focus:outline-none focus:border-foreground transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium tracking-[0.06em] uppercase mb-1.5 text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-md bg-background focus:outline-none focus:border-foreground transition-colors text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-foreground text-background text-[11px] font-semibold tracking-[0.1em] uppercase rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-[9px] tracking-[0.12em] uppercase text-muted-foreground/50 mt-6 font-medium">
          INOUT FASHION © 2026
        </p>
      </motion.div>
    </div>
  );
}
