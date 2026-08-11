import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldAlert, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import api from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('admin@jalyn.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });

      if (response.data?.token) {
        localStorage.setItem('admin_token', response.data.token);
        localStorage.setItem('admin_user', JSON.stringify(response.data.user));
        onLoginSuccess(response.data.user);
        navigate('/');
      } else {
        setError('Login failed: Invalid server response.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 'Failed to connect to backend server. Make sure server is running on port 5000.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E1119] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-white/10 relative z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-rose-400 text-white font-bold text-xl flex items-center justify-center mx-auto shadow-lg mb-3">
            J
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Sign In</h2>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Access CMS settings, products, and order management
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 font-medium">
            <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jalyn.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
              />
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-[11px] text-gray-500 space-y-1">
            <p className="font-semibold text-gray-700">Default Demo Credentials:</p>
            <p>Email: <span className="font-mono text-brand-600">admin@jalyn.com</span></p>
            <p>Password: <span className="font-mono text-brand-600">admin123</span></p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying JWT...
              </>
            ) : (
              <>
                Sign In to Dashboard <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
