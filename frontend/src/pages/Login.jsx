import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Zap, Crown, User, Mail, Lock, EyeOff, Eye } from 'lucide-react';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeRole, setActiveRole] = useState(null); // 'admin' or 'member'

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleRoleClick = (role) => {
    setActiveRole(role);
    if (role === 'admin') {
      setEmail('admin@test.com');
      setPassword('Admin@123456');
    } else {
      setEmail('member@test.com');
      setPassword('Member@123456');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Success redirects automatically via state changes in useAuth
      toast.success('Welcome back!');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#080b1a] overflow-hidden flex items-center justify-center p-4 z-0">
      {/* Background Elements */}
      {/* 1. Large purple planet circle */}
      <div 
        className="absolute rounded-full opacity-90 z-0"
        style={{
          width: '280px', height: '280px',
          background: 'radial-gradient(circle, #4c1d95, #2e1065)',
          bottom: '-80px', left: '-80px',
          boxShadow: '0 0 80px rgba(139,92,246,0.4)'
        }}
      />
      
      {/* 2. Small purple planet */}
      <div 
        className="absolute rounded-full opacity-80 z-0"
        style={{
          width: '80px', height: '80px',
          background: 'radial-gradient(circle, #6d28d9, #4c1d95)',
          top: '15%', right: '8%'
        }}
      />

      {/* 3. Curved arc lines */}
      <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <circle cx="15%" cy="85%" r="350" stroke="rgba(139,92,246,0.12)" strokeWidth="1" fill="none"/>
        <circle cx="85%" cy="20%" r="200" stroke="rgba(99,102,241,0.1)" strokeWidth="1" fill="none"/>
        <ellipse cx="50%" cy="50%" rx="500" ry="300" stroke="rgba(139,92,246,0.08)" strokeWidth="1" fill="none"/>
      </svg>

      {/* 4. Small floating dots/stars scattered */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute w-1 h-1 bg-white rounded-full opacity-50 top-[20%] left-[20%]" />
        <div className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-70 top-[10%] left-[60%]" />
        <div className="absolute w-1 h-1 bg-white rounded-full opacity-30 top-[40%] left-[80%]" />
        <div className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-60 top-[70%] left-[10%]" />
        <div className="absolute w-1 h-1 bg-white rounded-full opacity-40 top-[85%] left-[50%]" />
        <div className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-30 top-[30%] left-[90%]" />
        <div className="absolute w-1 h-1 bg-white rounded-full opacity-50 top-[60%] left-[75%]" />
        <div className="absolute w-1 h-1 bg-white rounded-full opacity-40 top-[80%] left-[85%]" />
        <div className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-50 top-[15%] left-[30%]" />
        <div className="absolute w-1 h-1 bg-white rounded-full opacity-60 top-[50%] left-[5%]" />
      </div>

      {/* 5. Right side blue-purple glow */}
      <div 
        className="absolute rounded-full blur-[80px] z-0 pointer-events-none"
        style={{
          right: '-100px', top: '20%',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.25), transparent)'
        }}
      />

      {/* Glass Card */}
      <div 
        className="relative z-10 mx-auto"
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
          padding: '40px 36px',
          width: '400px',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
      >
        {/* App Icon */}
        <div 
          className="mx-auto mb-3 flex items-center justify-center text-white"
          style={{
            width: '52px', height: '52px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            borderRadius: '14px',
            boxShadow: '0 8px 20px rgba(99,102,241,0.5)'
          }}
        >
          <Zap size={24} className="text-white fill-white" />
        </div>

        {/* App Name */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-[1px]">
            <span className="font-bold text-2xl text-white">Team</span>
            <span className="font-bold text-2xl text-[#8b5cf6]">Flow</span>
          </div>
          <p className="text-slate-400 text-xs tracking-wide mt-1">Plan. Track. Achieve. Together.</p>
        </div>

        {/* Heading */}
        <div className="mt-5 text-center">
          <h2 className="text-white font-bold text-xl">Welcome Back</h2>
          <p className="text-slate-400 text-sm mt-1">Sign in to continue to your account</p>
        </div>

        {/* Role Toggle */}
        <div 
          className="mt-5 flex gap-1"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '4px'
          }}
        >
          <button
            type="button"
            onClick={() => handleRoleClick('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition-all duration-200 ${
              activeRole === 'admin' 
                ? 'font-semibold text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
            style={activeRole === 'admin' ? {
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
              boxShadow: '0 4px 12px rgba(99,102,241,0.4)'
            } : { background: 'transparent' }}
          >
            <Crown size={16} className={activeRole === 'admin' ? 'text-amber-300' : 'text-slate-400'} /> Admin
          </button>
          
          <button
            type="button"
            onClick={() => handleRoleClick('member')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition-all duration-200 ${
              activeRole === 'member' 
                ? 'font-semibold text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
            style={activeRole === 'member' ? {
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
              boxShadow: '0 4px 12px rgba(99,102,241,0.4)'
            } : { background: 'transparent' }}
          >
            <User size={16} /> Member
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="space-y-4">
            {/* Email Field */}
            <div className="relative group focus-within:border-indigo-500/60 transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '10px 14px 10px 42px'
              }}
            >
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Mail className="w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              </div>
              <label htmlFor="email" className="block text-slate-500 text-xs mb-0.5">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-white text-sm outline-none placeholder:text-slate-600"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password Field */}
            <div className="relative group focus-within:border-indigo-500/60 transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '10px 14px 10px 42px'
              }}
            >
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Lock className="w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              </div>
              <label htmlFor="password" className="block text-slate-500 text-xs mb-0.5">Password</label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-white text-sm outline-none placeholder:text-slate-600 pr-8"
                placeholder="••••••••"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Row */}
          <div className="mt-3 flex justify-between items-center">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="remember" 
                className="rounded border-slate-600 bg-slate-800 w-3.5 h-3.5 cursor-pointer"
                style={{ accentColor: '#6366f1' }}
              />
              <label htmlFor="remember" className="text-slate-400 text-sm ml-2 cursor-pointer select-none">Remember me</label>
            </div>
            <a href="#" className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors cursor-pointer">Forgot password?</a>
          </div>

          {error && <div className="mt-4 text-red-400 text-sm text-center">{error}</div>}

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-3.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-95 hover:-translate-y-[1px] active:scale-[0.99] transition-all duration-200 disabled:opacity-70 disabled:hover:translate-y-0 disabled:active:scale-100"
            style={{
              background: 'linear-gradient(to right, #8b5cf6, #6366f1, #3b82f6)',
              boxShadow: '0 8px 25px rgba(99,102,241,0.45)'
            }}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>Sign In <span>→</span></>
            )}
          </button>

          {/* OR Divider */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-slate-500 text-xs font-medium uppercase">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Bottom Link */}
          <div className="mt-3 text-center">
            <span className="text-slate-400 text-sm">Don&apos;t have an account? </span>
            <Link to="/register" className="text-indigo-400 font-medium text-sm hover:text-indigo-300 underline underline-offset-2 decoration-transparent hover:decoration-indigo-300 transition-all">
              Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
