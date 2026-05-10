import { useState } from 'react';
import { useSynapseStore } from '../../store/useSynapseStore';
import { supabase } from '../../lib/supabase';
import { X, Loader2, Mail, Lock, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export const AuthModal = () => {
  const { isAuthModalOpen, setAuthModalOpen, authModalView, setUser } = useSynapseStore();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<{ field: string; message: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError({ field: 'auth', message: error.message });
      setLoading(false);
      return;
    }

    if (data.user && !data.session) {
      setError({ field: 'auth', message: 'Verification pending. Please check your email.' });
      setLoading(false);
      return;
    }

    setUser(data.user);
    toast.success('Successfully signed in!');
    setAuthModalOpen(false);
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setError({ field: 'confirmPassword', message: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (signUpError) {
      setError({ field: 'auth', message: signUpError.message });
      setLoading(false);
      return;
    }

    // Success - Show green message and auto-redirect
    setSuccessMessage('🎉 Account created! Welcome to Synapse.');
    setUser(data.user);
    setLoading(false);

    setTimeout(() => {
      setAuthModalOpen(false);
      window.location.href = '/work/?welcome=true';
    }, 2000);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError({ field: 'email', message: 'Please enter your email first' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setError({ field: 'auth', message: error.message });
    } else {
      toast.success('Check your email for the reset link');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[420px] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-900"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-900"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-900"></div>
            </div>
            <h2 className="font-bold text-lg text-gray-900">Synapse Cloud</h2>
          </div>
          <button onClick={() => setAuthModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-gray-100">
          <button 
            onClick={() => setAuthModalOpen(true, 'signin')}
            className={`flex-1 py-4 text-sm font-semibold transition-all relative ${authModalView === 'signin' ? 'text-[var(--accent)]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Sign In
            {authModalView === 'signin' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]" />}
          </button>
          <button 
            onClick={() => setAuthModalOpen(true, 'signup')}
            className={`flex-1 py-4 text-sm font-semibold transition-all relative ${authModalView === 'signup' ? 'text-[var(--accent)]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Sign Up
            {authModalView === 'signup' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]" />}
          </button>
        </div>

        <div className="p-8">
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <Mail className="text-green-500 shrink-0 mt-0.5" size={18} />
              <p className="text-xs font-bold text-green-700 leading-relaxed">
                {successMessage}
              </p>
            </div>
          )}
          <form onSubmit={authModalView === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
            {authModalView === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Abhay Shyam"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none transition-all text-sm"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none transition-all text-sm"
                />
              </div>
              {error?.field === 'email' && <p className="text-red-500 text-[12px]">{error.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none transition-all text-sm"
                />
              </div>
            </div>

            {authModalView === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none transition-all text-sm"
                  />
                </div>
                {error?.field === 'confirmPassword' && <p className="text-red-500 text-[12px]">{error.message}</p>}
              </div>
            )}

            {error?.field === 'auth' && <p className="text-red-500 text-[12px] text-center">{error.message}</p>}

            <button
              disabled={loading}
              type="submit"
              className="w-full py-3 bg-[var(--accent)] text-white rounded-lg font-bold text-sm hover:brightness-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent)]/20"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : (authModalView === 'signin' ? 'Sign In' : 'Create Account')}
            </button>

            {authModalView === 'signin' && (
              <button 
                type="button"
                onClick={handleForgotPassword}
                className="w-full text-center text-xs text-gray-400 hover:text-[var(--accent)] transition-colors font-medium"
              >
                Forgot password?
              </button>
            )}
          </form>

          <p className="mt-8 text-center text-xs text-gray-400">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};
